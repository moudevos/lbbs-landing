import type { Metadata } from "next";
import { BranchSelector } from "@/components/services/branch-selector";
import { ServicesPageLayout } from "@/components/services/services-page-layout";
import { getPublicServiceBranches } from "@/lib/public/service-menu";

export const metadata: Metadata = { title: "Servicios", description: "Consulta nuestra carta de servicios y precios por sede." };
export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const result = await getPublicServiceBranches();
  return <ServicesPageLayout>
    {result.status === "available" && result.branches.length > 0
      ? <BranchSelector branches={result.branches} />
      : <p className="py-6 text-sm text-[#B5A895]">{result.status === "error" ? "No pudimos cargar las sedes. Inténtalo nuevamente en unos minutos." : "No hay sedes disponibles actualmente."}</p>}
  </ServicesPageLayout>;
}
