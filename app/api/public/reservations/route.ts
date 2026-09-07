import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidPeruMobilePhone } from "@/lib/customers/phone";
import { findOrCreateCustomerByPhone } from "@/lib/reservations/server";
import { validateOperationalSchedule } from "@/lib/reservations/availability";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { addMinutes, overlaps, toLocalDateTime } from "@/lib/reservations/time";
import { toPeruDate } from "@/lib/datetime/peru-time";

type ReservationPayload = { branchId: string; serviceId: string; employeeId?: string | null; customerName: string; customerPhone: string; date: string; time: string; observations?: string | null };

export async function POST(request: NextRequest) {
  const retryAfter = await enforceRateLimit(request, "public-reservation", 8, 15 * 60 * 1000);
  if (retryAfter) return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente en unos minutos." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  const body = await request.json().catch(() => null) as Partial<ReservationPayload> | null;
  if (!body?.branchId || !body.serviceId || !body.customerName?.trim() || !body.customerPhone || !body.date || !body.time) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  if (!isValidPeruMobilePhone(body.customerPhone)) return NextResponse.json({ error: "Ingresa un celular peruano válido de 9 dígitos" }, { status: 400 });
  if (body.date < toPeruDate()) return NextResponse.json({ error: "No puedes reservar una fecha pasada" }, { status: 400 });

  const admin = createAdminClient();
  const [{ data: branch, error: branchError }, { data: service, error: serviceError }] = await Promise.all([
    admin.from("branches").select("id").eq("id", body.branchId).eq("is_active", true).maybeSingle(),
    admin.from("services").select("id,duration_minutes,is_active,allow_custom_price").eq("id", body.serviceId).maybeSingle()
  ]);
  if (branchError || !branch) return NextResponse.json({ error: branchError?.message ?? "Sede no disponible" }, { status: 404 });
  if (serviceError || !service || !service.is_active) return NextResponse.json({ error: serviceError?.message ?? "Servicio no disponible" }, { status: 404 });
  const durationMinutes = service.duration_minutes || 60;
  const scheduleError = await validateOperationalSchedule({ admin, branchId: body.branchId, employeeId: body.employeeId, date: body.date, time: body.time, durationMinutes });
  if (scheduleError) return NextResponse.json({ error: scheduleError }, { status: 409 });

  let overlapWarning = false;
  if (body.employeeId) {
    const { data: employee, error: employeeError } = await admin.from("employees").select("id,branch_id,role,status").eq("id", body.employeeId).maybeSingle();
    if (employeeError || !employee || employee.role !== "barber" || employee.status !== "active" || employee.branch_id !== body.branchId) return NextResponse.json({ error: "Selecciona un barbero activo de la sede elegida" }, { status: 400 });
    const { data: existing, error: existingError } = await admin.from("reservations").select("scheduled_time,service_interest_id,status").eq("preferred_barber_id", body.employeeId).eq("scheduled_date", body.date).in("status", ["pending", "confirmed", "checked_in"]);
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    const ids = [...new Set((existing ?? []).map((row) => row.service_interest_id).filter(Boolean))] as string[];
    const { data: existingServices, error: existingServicesError } = ids.length ? await admin.from("services").select("id,duration_minutes").in("id", ids) : { data: [], error: null };
    if (existingServicesError) return NextResponse.json({ error: existingServicesError.message }, { status: 500 });
    const durations = new Map((existingServices ?? []).map((item) => [item.id, item.duration_minutes || 60]));
    const start = toLocalDateTime(body.date, body.time);
    const end = addMinutes(start, durationMinutes);
    const overlapsExisting = (existing ?? []).filter((row) => {
      if (!row.scheduled_time) return false;
      const existingStart = toLocalDateTime(body.date!, row.scheduled_time.slice(0, 5));
      return overlaps(start, end, existingStart, addMinutes(existingStart, row.service_interest_id ? durations.get(row.service_interest_id) ?? 60 : 60));
    });
    if (overlapsExisting.some((row) => row.status === "confirmed" || row.status === "checked_in")) return NextResponse.json({ error: "El barbero ya tiene una reserva confirmada en ese horario" }, { status: 409 });
    overlapWarning = overlapsExisting.some((row) => row.status === "pending");
  }

  const customerResult = await findOrCreateCustomerByPhone({ admin, phone: body.customerPhone, fullName: body.customerName.trim(), branchId: body.branchId });
  if (customerResult.error || !customerResult.customer) return NextResponse.json({ error: customerResult.error ?? "No se pudo resolver el cliente" }, { status: 500 });
  const { data: reservation, error: reservationError } = await admin.from("reservations").insert({
    customer_id: customerResult.customer.id,
    branch_id: body.branchId,
    preferred_barber_id: body.employeeId || null,
    service_interest_id: body.serviceId,
    scheduled_date: body.date,
    scheduled_time: body.time,
    status: "pending",
    source: "public_form",
    channel: "website",
    customer_message: body.observations?.trim() || null
  }).select("id").single();
  if (reservationError) return NextResponse.json({ error: reservationError.message }, { status: 500 });
  return NextResponse.json({ reservationId: reservation.id, overlapWarning, customerCreated: customerResult.created });
}
