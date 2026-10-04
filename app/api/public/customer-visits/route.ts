import { NextResponse, type NextRequest } from "next/server";
import { normalizePhone } from "@/lib/customers/phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/security/rate-limit";

type VisitReservationRow = {
  id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: string;
  service_interest?: { name: string | null } | { name: string | null }[] | null;
  branch?: { name: string | null } | { name: string | null }[] | null;
};

export async function GET(request: NextRequest) {
  const retryAfter = await enforceRateLimit(request, "customer-visits", 3, 15 * 60 * 1000);
  if (retryAfter) {
    return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente mas tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } });
  }
  const phone = request.nextUrl.searchParams.get("phone") ?? "";
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return NextResponse.json({ error: "Celular requerido" }, { status: 400 });
  }

  const admin = createAdminClient();
  let customerResult = await admin
    .from("customers")
    .select("id,full_name")
    .eq("phone_normalized", normalizedPhone)
    .maybeSingle();

  if (customerResult.error) {
    customerResult = await admin
      .from("customers")
      .select("id,full_name")
      .eq("phone", phone)
      .maybeSingle();
  }

  const { data: customer, error } = customerResult;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!customer) return NextResponse.json({ found: false });

  const statsResult = await admin
    .from("customer_visit_stats")
    .select("total_visits,last_visit_at,total_attended_reservations")
    .eq("customer_id", customer.id)
    .maybeSingle();

  const rewardResult = await admin
    .from("customer_reward_accounts")
    .select("available_rewards,earned_rewards,redeemed_rewards,eligible_visit_count")
    .eq("customer_id", customer.id)
    .maybeSingle();

  const { data: reservations, error: reservationsError } = await admin
    .from("reservations")
    .select("id,scheduled_date,scheduled_time,status,service_interest:services(name),branch:branches(name)")
    .eq("customer_id", customer.id)
    .eq("status", "completed")
    .order("scheduled_date", { ascending: false })
    .order("scheduled_time", { ascending: false })
    .limit(10);

  if (reservationsError) return NextResponse.json({ error: reservationsError.message }, { status: 500 });

  const stats = statsResult.error ? null : statsResult.data;
  const rewards = rewardResult.error ? null : rewardResult.data;
  const totalVisits = Number(stats?.total_visits ?? rewards?.eligible_visit_count ?? 0);

  return NextResponse.json({
    found: true,
    customer: {
      name: customer.full_name,
      totalVisits,
      totalAttendedReservations: stats?.total_attended_reservations ?? 0,
      lastVisitAt: stats?.last_visit_at ?? null,
      progressToNextReward: totalVisits % 6,
      availableRewards: rewards?.available_rewards ?? 0,
      earnedRewards: rewards?.earned_rewards ?? Math.floor(totalVisits / 6),
      redeemedRewards: rewards?.redeemed_rewards ?? 0
    },
    history: ((reservations ?? []) as VisitReservationRow[]).map((reservation) => ({
      id: reservation.id,
      date: reservation.scheduled_date && reservation.scheduled_time
        ? `${reservation.scheduled_date}T${reservation.scheduled_time}`
        : reservation.scheduled_date ?? "",
      status: reservation.status,
      service: Array.isArray(reservation.service_interest) ? reservation.service_interest[0]?.name : reservation.service_interest?.name,
      branch: Array.isArray(reservation.branch) ? reservation.branch[0]?.name : reservation.branch?.name
    }))
  });
}
