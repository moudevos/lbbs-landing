import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { addMinutes, overlaps, toLocalDateTime } from "@/lib/reservations/time";
import { peruDayOfWeek, peruNowMinutes, toPeruDate } from "@/lib/datetime/peru-time";

const DEFAULT_OPEN = "09:30";
const DEFAULT_CLOSE = "21:30";

function minutes(time: string) { const [hours, mins] = time.slice(0, 5).split(":").map(Number); return hours * 60 + mins; }
function time(minutesValue: number) { return `${String(Math.floor(minutesValue / 60)).padStart(2, "0")}:${String(minutesValue % 60).padStart(2, "0")}`; }
function missingScheduleRelation(error: { code?: string; message?: string } | null) { return error?.code === "PGRST205" || /could not find the table/i.test(error?.message ?? ""); }

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const branchId = searchParams.get("branchId");
  const serviceId = searchParams.get("serviceId");
  const employeeId = searchParams.get("employeeId");
  const date = searchParams.get("date");
  if (!branchId || !serviceId || !date) return NextResponse.json({ error: "branchId, serviceId y date son requeridos" }, { status: 400 });

  const admin = createAdminClient();
  const [{ data: branch, error: branchError }, { data: service, error: serviceError }] = await Promise.all([
    admin.from("branches").select("id").eq("id", branchId).eq("is_active", true).maybeSingle(),
    admin.from("services").select("id,duration_minutes,is_active").eq("id", serviceId).maybeSingle()
  ]);
  if (branchError || !branch) return NextResponse.json({ error: branchError?.message ?? "Sede no disponible" }, { status: 404 });
  if (serviceError || !service || !service.is_active) return NextResponse.json({ error: serviceError?.message ?? "Servicio no disponible" }, { status: 404 });

  const durationMinutes = service.duration_minutes || 60;
  if (date < toPeruDate()) return NextResponse.json({ slots: [], open: null, close: null, durationMinutes });
  const dayOfWeek = peruDayOfWeek(date);
  let open = DEFAULT_OPEN;
  let close = DEFAULT_CLOSE;

  const { data: branchSchedule, error: scheduleError } = await admin.from("branch_schedules").select("opens_at,closes_at,is_active").eq("branch_id", branchId).eq("day_of_week", dayOfWeek).maybeSingle();
  if (scheduleError && !missingScheduleRelation(scheduleError)) return NextResponse.json({ error: scheduleError.message }, { status: 500 });
  if (branchSchedule && !branchSchedule.is_active) return NextResponse.json({ slots: [], open: null, close: null, durationMinutes, closed: true });
  if (branchSchedule) { open = branchSchedule.opens_at.slice(0, 5); close = branchSchedule.closes_at.slice(0, 5); }

  if (employeeId) {
    const { data: employee, error: employeeError } = await admin.from("employees").select("id,branch_id,role,status").eq("id", employeeId).maybeSingle();
    if (employeeError || !employee || employee.role !== "barber" || employee.status !== "active" || employee.branch_id !== branchId) return NextResponse.json({ error: "El barbero no está disponible en esta sede" }, { status: 400 });
    const { data: employeeSchedule, error: employeeScheduleError } = await admin.from("employee_schedules").select("starts_at,ends_at,is_active").eq("employee_id", employeeId).eq("day_of_week", dayOfWeek).maybeSingle();
    if (employeeScheduleError && !missingScheduleRelation(employeeScheduleError)) return NextResponse.json({ error: employeeScheduleError.message }, { status: 500 });
    if (employeeSchedule && !employeeSchedule.is_active) return NextResponse.json({ slots: [], open: null, close: null, durationMinutes, closed: true });
    if (employeeSchedule) { open = employeeSchedule.starts_at.slice(0, 5); close = employeeSchedule.ends_at.slice(0, 5); }
  }

  const reservations = employeeId
    ? await admin.from("reservations").select("scheduled_time,service_interest_id").eq("preferred_barber_id", employeeId).eq("scheduled_date", date).in("status", ["confirmed", "checked_in"])
    : { data: [], error: null };
  if (reservations.error) return NextResponse.json({ error: reservations.error.message }, { status: 500 });
  const existingServiceIds = [...new Set((reservations.data ?? []).map((row) => row.service_interest_id).filter(Boolean))] as string[];
  const { data: existingServices, error: existingServicesError } = existingServiceIds.length ? await admin.from("services").select("id,duration_minutes").in("id", existingServiceIds) : { data: [], error: null };
  if (existingServicesError) return NextResponse.json({ error: existingServicesError.message }, { status: 500 });
  const durations = new Map((existingServices ?? []).map((item) => [item.id, item.duration_minutes || 60]));
  const busy = (reservations.data ?? []).filter((row) => row.scheduled_time).map((row) => {
    const start = toLocalDateTime(date, row.scheduled_time.slice(0, 5));
    return { start, end: addMinutes(start, durations.get(row.service_interest_id) ?? 60) };
  });

  const lastStart = Math.min(minutes(close) - 30, minutes(close) - durationMinutes);
  const earliestStart = date === toPeruDate() ? peruNowMinutes() : -1;
  const slots: string[] = [];
  for (let cursor = minutes(open); cursor <= lastStart; cursor += 30) {
    if (cursor <= earliestStart) continue;
    const start = toLocalDateTime(date, time(cursor));
    const end = addMinutes(start, durationMinutes);
    if (!busy.some((entry) => overlaps(start, end, entry.start, entry.end))) slots.push(time(cursor));
  }
  return NextResponse.json({ slots, open, close, durationMinutes });
}
