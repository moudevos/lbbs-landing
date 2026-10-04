import { NextResponse, type NextRequest } from "next/server";

import { peruDayOfWeek, toPeruDate } from "@/lib/datetime/peru-time";
import { addMinutes, overlaps, toLocalDateTime } from "@/lib/reservations/time";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_OPEN = "09:30";
const DEFAULT_CLOSE = "21:30";
const ACTIVE_RESERVATION_STATUSES = ["pending", "contacted", "confirmed", "rescheduled", "checked_in"];

type AgendaReservation = {
  scheduled_time: string | null;
  service_interest?: { duration_minutes: number | null } | { duration_minutes: number | null }[] | null;
};

function timeToMinutes(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function missingScheduleRelation(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || /could not find the table/i.test(error?.message ?? "");
}

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branch_id");
  const date = request.nextUrl.searchParams.get("date") ?? toPeruDate();
  if (!branchId) return NextResponse.json({ error: "branch_id requerido" }, { status: 400 });

  const admin = createAdminClient();
  const { data: branch, error: branchError } = await admin
    .from("branches")
    .select("id,name")
    .eq("id", branchId)
    .eq("is_active", true)
    .maybeSingle();
  if (branchError || !branch) {
    return NextResponse.json({ error: branchError?.message ?? "Sede no encontrada" }, { status: 404 });
  }

  let open = DEFAULT_OPEN;
  let close = DEFAULT_CLOSE;
  const { data: schedule, error: scheduleError } = await admin
    .from("branch_schedules")
    .select("opens_at,closes_at,is_active")
    .eq("branch_id", branchId)
    .eq("day_of_week", peruDayOfWeek(date))
    .maybeSingle();
  if (scheduleError && !missingScheduleRelation(scheduleError)) {
    return NextResponse.json({ error: scheduleError.message }, { status: 500 });
  }
  if (schedule && !schedule.is_active) {
    return NextResponse.json({ branch, date, open: null, close: null, blocks: [] });
  }
  if (schedule) {
    open = schedule.opens_at.slice(0, 5);
    close = schedule.closes_at.slice(0, 5);
  }

  const [barbersResult, reservationsResult] = await Promise.all([
    admin.from("employees").select("id", { count: "exact", head: true }).eq("branch_id", branchId).eq("role", "barber").eq("status", "active"),
    admin.from("reservations")
      .select("scheduled_time,service_interest:services(duration_minutes)")
      .eq("branch_id", branchId)
      .eq("scheduled_date", date)
      .in("status", ACTIVE_RESERVATION_STATUSES),
  ]);
  if (barbersResult.error || reservationsResult.error) {
    return NextResponse.json({ error: barbersResult.error?.message ?? reservationsResult.error?.message }, { status: 500 });
  }

  const capacity = barbersResult.count ?? 0;
  const reservations = (reservationsResult.data ?? []) as AgendaReservation[];
  const blocks = [];
  for (let cursor = timeToMinutes(open); cursor <= timeToMinutes(close) - 30; cursor += 30) {
    const time = minutesToTime(cursor);
    const blockStart = toLocalDateTime(date, time);
    const blockEnd = addMinutes(blockStart, 30);
    const active = reservations.filter((reservation) => {
      if (!reservation.scheduled_time) return false;
      const service = Array.isArray(reservation.service_interest)
        ? reservation.service_interest[0]
        : reservation.service_interest;
      const reservationStart = toLocalDateTime(date, reservation.scheduled_time.slice(0, 5));
      return overlaps(blockStart, blockEnd, reservationStart, addMinutes(reservationStart, service?.duration_minutes || 60));
    }).length;
    blocks.push({ time, status: capacity > active ? "disponible" : "ocupado" });
  }

  return NextResponse.json({ branch, date, open, close, blocks });
}
