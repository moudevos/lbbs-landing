import { NextResponse, type NextRequest } from "next/server";

import { toPeruDate } from "@/lib/datetime/peru-time";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const branchId = searchParams.get("branchId");
  const serviceId = searchParams.get("serviceId");
  const employeeId = searchParams.get("employeeId");
  const date = searchParams.get("date");
  if (!branchId || !serviceId || !date) {
    return NextResponse.json({ error: "branchId, serviceId y date son requeridos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const [{ data: branch, error: branchError }, { data: service, error: serviceError }] = await Promise.all([
    admin.from("branches").select("id").eq("id", branchId).eq("is_active", true).maybeSingle(),
    admin.from("services").select("id,duration_minutes,is_active").eq("id", serviceId).maybeSingle(),
  ]);
  if (branchError || !branch) {
    return NextResponse.json({ error: branchError?.message ?? "Sede no disponible" }, { status: 404 });
  }
  if (serviceError || !service || !service.is_active) {
    return NextResponse.json({ error: serviceError?.message ?? "Servicio no disponible" }, { status: 404 });
  }

  const durationMinutes = service.duration_minutes || 60;
  if (date < toPeruDate()) {
    return NextResponse.json({ slots: [], open: null, close: null, durationMinutes });
  }

  const { data, error } = await admin.rpc("get_reservation_available_slots", {
    p_branch_id: branchId,
    p_service_id: serviceId,
    p_preferred_barber_id: employeeId || null,
    p_scheduled_date: date,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: error.message.includes("barbero") ? 400 : 500 });
  }

  return NextResponse.json({
    slots: (data ?? []).map((row: { slot_time: string }) => row.slot_time.slice(0, 5)),
    open: null,
    close: null,
    durationMinutes,
  });
}
