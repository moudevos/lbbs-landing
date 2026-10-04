import type { SupabaseClient } from "@supabase/supabase-js";
import { peruDayOfWeek, peruNowMinutes, toPeruDate } from "@/lib/datetime/peru-time";

const DEFAULT_OPEN = "09:30";
const DEFAULT_CLOSE = "21:30";

type AdminClient = SupabaseClient<any, "public", any>;

function missingScheduleRelation(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || /could not find the table/i.test(error?.message ?? "");
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

export async function validateOperationalSchedule({
  admin,
  branchId,
  date,
  time,
  durationMinutes
}: {
  admin: AdminClient;
  branchId: string;
  date: string;
  time: string;
  durationMinutes: number;
}) {
  const dayOfWeek = peruDayOfWeek(date);
  const { data: branchSchedule, error } = await admin
    .from("branch_schedules")
    .select("opens_at,closes_at,is_active")
    .eq("branch_id", branchId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();
  if (error && !missingScheduleRelation(error)) return error.message;
  if (branchSchedule && !branchSchedule.is_active) return "La sede no atiende en la fecha seleccionada";

  const open = branchSchedule?.opens_at?.slice(0, 5) ?? DEFAULT_OPEN;
  const close = branchSchedule?.closes_at?.slice(0, 5) ?? DEFAULT_CLOSE;

  const start = timeToMinutes(time);
  if (date === toPeruDate() && start <= peruNowMinutes()) return "Selecciona una hora posterior a la actual";
  const closeMinutes = timeToMinutes(close);
  const openMinutes = timeToMinutes(open);
  if (start < openMinutes) return `El horario inicia a las ${open}`;
  if ((start - openMinutes) % 30 !== 0) return "Selecciona uno de los horarios disponibles cada 30 minutos";
  if (start > closeMinutes - 30) return `La ultima reserva debe iniciar como maximo 30 minutos antes del cierre (${close})`;
  if (start + durationMinutes > closeMinutes) return "La duracion del servicio supera el horario operativo";
  return null;
}
