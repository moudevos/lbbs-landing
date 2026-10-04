import { NextResponse, type NextRequest } from "next/server";

import { isValidPeruMobilePhone } from "@/lib/customers/phone";
import { toPeruDate } from "@/lib/datetime/peru-time";
import { findOrCreateCustomerByPhone } from "@/lib/reservations/server";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

type ReservationPayload = {
  branchId: string;
  serviceId: string;
  employeeId?: string | null;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  observations?: string | null;
};

function rpcErrorResponse(message: string) {
  if (
    message === "El barbero seleccionado ya tiene una reserva en ese horario."
    || message === "Ya no hay disponibilidad para ese horario. Selecciona otra hora."
    || message.includes("fecha")
    || message.includes("horario")
  ) {
    return NextResponse.json({ error: message }, { status: 409 });
  }

  if (
    message === "Selecciona un barbero activo de la sede elegida."
    || message === "La reserva requiere sede, servicio, fecha y hora."
  ) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (message === "No hay barberos activos disponibles en esta sede.") {
    return NextResponse.json({ error: message }, { status: 409 });
  }

  if (message === "La sede seleccionada no está disponible." || message === "El servicio seleccionado no está disponible.") {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  return NextResponse.json({ error: "No se pudo validar la disponibilidad de la reserva." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const retryAfter = await enforceRateLimit(request, "public-reservation", 8, 15 * 60 * 1000);
  if (retryAfter) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body = await request.json().catch(() => null) as Partial<ReservationPayload> | null;
  if (!body?.branchId || !body.serviceId || !body.customerName?.trim() || !body.customerPhone || !body.date || !body.time) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (!isValidPeruMobilePhone(body.customerPhone)) {
    return NextResponse.json({ error: "Ingresa un celular peruano válido de 9 dígitos" }, { status: 400 });
  }
  if (body.date < toPeruDate()) {
    return NextResponse.json({ error: "No puedes reservar una fecha pasada" }, { status: 400 });
  }

  const admin = createAdminClient();
  const customerResult = await findOrCreateCustomerByPhone({
    admin,
    phone: body.customerPhone,
    fullName: body.customerName.trim(),
    branchId: body.branchId,
  });
  if (customerResult.error || !customerResult.customer) {
    return NextResponse.json({ error: customerResult.error ?? "No se pudo resolver el cliente" }, { status: 500 });
  }

  const { data: reservationId, error } = await admin.rpc(
    "create_or_update_reservation_with_capacity",
    {
      p_customer_id: customerResult.customer.id,
      p_branch_id: body.branchId,
      p_preferred_barber_id: body.employeeId || null,
      p_service_interest_id: body.serviceId,
      p_scheduled_date: body.date,
      p_scheduled_time: body.time,
      p_status: "scheduled",
      p_source: "public_form",
      p_channel: "website",
      p_customer_message: body.observations?.trim() || null,
      p_internal_notes: null,
      p_confirmed_at: null,
      p_cancelled_at: null,
      p_completed_at: null,
      p_reservation_id: null,
    },
  );

  if (error) {
    return rpcErrorResponse(error.message);
  }

  return NextResponse.json({ reservationId, overlapWarning: false, customerCreated: customerResult.created });
}
