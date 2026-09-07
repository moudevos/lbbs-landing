"use client";

import { useId, useState } from "react";
import { formatPublicPen, type PublicServiceMenuItem } from "@/lib/public/service-menu.shared";

type ServiceGroup = { id: string; name: string; items: PublicServiceMenuItem[] };

export function ServiceMenuLedger({ groups }: { groups: ServiceGroup[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const ids = useId();
  const activeGroup = groups[activeIndex] ?? groups[0];
  if (!activeGroup) return null;
  return (
    <section className="grid min-w-0 overflow-hidden rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-panel)]/80 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] lg:grid-cols-[210px_minmax(0,1fr)]">
      <div role="tablist" aria-label="Categorías de servicios" aria-orientation="vertical" className="flex overflow-x-auto border-b border-[var(--landing-border)] bg-black/15 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r">
        {groups.map((group, index) => {
          const selected = index === activeIndex;
          return <button key={group.id} id={`${ids}-tab-${index}`} type="button" role="tab" aria-selected={selected} aria-controls={`${ids}-panel-${index}`} tabIndex={selected ? 0 : -1} onClick={() => setActiveIndex(index)} onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) return;
            event.preventDefault();
            const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
            setActiveIndex((current) => (current + step + groups.length) % groups.length);
          }} className="shrink-0 border-b-[3px] border-transparent px-4 py-3 text-left text-sm font-medium text-[var(--text-faint)] transition hover:text-white aria-selected:border-[var(--landing-gold)] aria-selected:bg-[rgba(244,171,73,0.08)] aria-selected:text-[var(--landing-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--landing-gold)] lg:border-b-0 lg:border-l-[3px] lg:px-5 lg:py-4">
            {group.name}
          </button>;
        })}
      </div>
      <div id={`${ids}-panel-${activeIndex}`} role="tabpanel" aria-labelledby={`${ids}-tab-${activeIndex}`} className="min-w-0">
        <div className="border-b border-[var(--landing-border)] px-5 pb-4 pt-5 sm:px-7"><h2 className="text-xl font-bold tracking-wide text-white">{activeGroup.name}</h2><p className="mt-1 text-xs text-[var(--text-faint)]">{activeGroup.items.length} {activeGroup.items.length === 1 ? "servicio disponible" : "servicios disponibles"}</p></div>
        <ul>{activeGroup.items.map((service, index) => <li key={`${service.name}-${index}`} className="grid grid-cols-[12px_minmax(0,1fr)_auto] items-start gap-3 border-b border-white/10 px-5 py-3.5 last:border-b-0 sm:gap-4 sm:px-7 sm:py-4">
          <span aria-hidden="true" className="mt-2 h-0.5 w-3 -rotate-[18deg] bg-[var(--landing-gold-soft)]/70" /><span className="min-w-0 break-words pt-0.5 text-sm font-semibold text-white sm:text-[15px]">{service.name}</span>
          {service.isVariablePrice || service.price === null ? null : <span className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-full border border-[var(--landing-gold-soft)]/65 bg-black/15 px-1 text-[11px] font-bold tabular-nums text-[var(--landing-gold-soft)] sm:h-14 sm:min-w-14 sm:text-xs">{formatPublicPen(service.price)}</span>}
        </li>)}</ul>
      </div>
    </section>
  );
}
