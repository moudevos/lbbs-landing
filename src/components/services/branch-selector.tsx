"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicServiceBranch } from "@/lib/public/service-menu.shared";

export function BranchSelector({ branches, selectedSlug }: { branches: PublicServiceBranch[]; selectedSlug?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    branches.forEach((branch) => {
      if (branch.slug !== selectedSlug) router.prefetch("/servicios/" + encodeURIComponent(branch.slug));
    });
  }, [branches, router, selectedSlug]);

  return (
    <div className="mb-6 w-full max-w-[400px]" aria-busy={isPending}>
      <label htmlFor="service-branch" className="mb-2 block text-xs font-medium text-[var(--text-muted)]">Selecciona tu sede</label>
      <select id="service-branch" value={selectedSlug ?? ""} onChange={(event) => {
        if (!event.target.value || event.target.value === selectedSlug) return;
        startTransition(() => router.push("/servicios/" + encodeURIComponent(event.target.value)));
      }} disabled={isPending} className="w-full rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-panel)] px-4 py-3 text-sm text-white transition-opacity duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-gold)] disabled:cursor-wait disabled:opacity-65">
        <option value="" disabled>Selecciona una sede</option>
        {branches.map((branch) => <option key={branch.slug} value={branch.slug}>{branch.name}</option>)}
      </select>
      <p className={`mt-2 flex items-center gap-2 text-xs text-[var(--landing-gold-soft)] transition-all duration-300 ${isPending ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--landing-gold-soft)]" />Actualizando carta de la sede…</p>
    </div>
  );
}
