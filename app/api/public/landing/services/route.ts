import { NextResponse } from "next/server";
import { getLandingServices } from "@/lib/public/landing-data";

const cacheHeaders = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" };

export async function GET() {
  const services = await getLandingServices();
  return NextResponse.json({ services }, { headers: cacheHeaders });
}
