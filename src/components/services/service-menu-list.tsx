import type { PublicServiceMenuItem } from "@/lib/public/service-menu.shared";
import { ServiceMenuLedger } from "./service-menu-ledger";

export function ServiceMenuList({ services }: { services: PublicServiceMenuItem[] }) {
  if (!services.length) return <p className="rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-panel)]/70 px-6 py-8 text-sm text-[var(--text-muted)]">No hay servicios disponibles en esta sede.</p>;
  const groups = new Map<string, { id: string; name: string; items: PublicServiceMenuItem[] }>();
  for (const service of services) {
    const id = service.category?.slug ?? "servicios";
    if (!groups.has(id)) groups.set(id, { id, name: service.category?.name ?? "Servicios", items: [] });
    groups.get(id)?.items.push(service);
  }
  return <ServiceMenuLedger groups={[...groups.values()]} />;
}
