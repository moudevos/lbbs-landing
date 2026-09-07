import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMainContact } from "@/lib/public-contact/get-main-contact";

export async function GET() {
  const admin = createAdminClient();
  const [branches, services, branchPrices, barbers, mainContact] = await Promise.all([
    admin.from("branches").select("id,code,name,phone").eq("is_active", true).order("name"),
    admin.from("services").select("id,slug,name,description,duration_minutes,base_price,allow_custom_price").eq("is_active", true).order("name"),
    admin.from("service_branch_prices").select("service_id,branch_id,price").eq("is_active", true),
    admin.from("employees")
      .select("id,full_name,branch_id,role,status")
      .eq("status", "active")
      .not("branch_id", "is", null)
      .eq("role", "barber")
      .order("full_name"),
    getMainContact(admin)
  ]);

  if (branches.error) return NextResponse.json({ error: branches.error.message }, { status: 500 });
  if (services.error) return NextResponse.json({ error: services.error.message }, { status: 500 });
  if (branchPrices.error) return NextResponse.json({ error: branchPrices.error.message }, { status: 500 });
  if (barbers.error) return NextResponse.json({ error: barbers.error.message }, { status: 500 });

  const pricesByService = new Map<string, Record<string, number>>();
  for (const price of branchPrices.data ?? []) {
    const prices = pricesByService.get(price.service_id) ?? {};
    prices[price.branch_id] = Number(price.price);
    pricesByService.set(price.service_id, prices);
  }

  return NextResponse.json({
    branches: (branches.data ?? []).map((branch) => ({ id: branch.id, code: branch.code, name: branch.name, phone: branch.phone })),
    mainContact,
    services: (services.data ?? []).map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      durationMinutes: service.duration_minutes,
      basePrice: Number(service.base_price),
      allowCustomPrice: service.allow_custom_price === true,
      pricesByBranch: pricesByService.get(service.id) ?? {},
      description: service.description,
    })),
    barbers: (barbers.data ?? []).map((barber) => ({
      id: barber.id,
      name: barber.full_name || "Barbero",
      branchId: barber.branch_id
    }))
  });
}
