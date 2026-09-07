import type { Metadata } from "next";
import Link from "next/link";
import { BranchSelector } from "@/components/services/branch-selector";
import { ServiceMenuList } from "@/components/services/service-menu-list";
import { ServicesPageLayout } from "@/components/services/services-page-layout";
import { getPublicServiceBranches, getPublicServiceMenuBySlug } from "@/lib/public/service-menu";

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicServiceMenuBySlug(slug);
  return result.status === "available"
    ? { title: "Servicios " + result.branch.name, description: "Consulta los servicios y precios vigentes de " + result.branch.name + "." }
    : { title: "Sede no disponible" };
}

export default async function ServicesByBranchPage({ params }: Props) {
  const { slug } = await params;
  const [result, branchesResult] = await Promise.all([getPublicServiceMenuBySlug(slug), getPublicServiceBranches()]);
  if (result.status !== "available") return <ServicesPageLayout>
    <p role="status" className="py-6 text-sm text-[#B5A895]">{result.status === "error" ? "No pudimos cargar la carta. Inténtalo nuevamente en unos minutos." : "La sede solicitada no existe o no está disponible actualmente."}</p>
    <Link href="/servicios" className="text-sm text-[#B98D4B] underline underline-offset-4">Ver sedes disponibles</Link>
  </ServicesPageLayout>;
  const branches = branchesResult.status === "available" ? branchesResult.branches : [result.branch];
  return <ServicesPageLayout>
    <BranchSelector branches={branches} selectedSlug={result.branch.slug} />
    <ServiceMenuList services={result.services} />
  </ServicesPageLayout>;
}
