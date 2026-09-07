"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CalendarCheck, Scissors } from "lucide-react";

import { LandingSectionTitle } from "./landing-section-title";
import { useLandingLanguage } from "./landing-language-provider";
import { trackEvent } from "@/lib/analytics/track-event";

const fixedBarbers = [
  { name: "Gerson Yahuarcani", initials: "GY", image: "/landing/team/team-gy.webp" },
  { name: "Heber Cueva", initials: "HC", image: "/landing/team/team-hc.webp" },
  { name: "Luis Perez", initials: "LP", image: "/landing/team/team-lp.webp" },
  { name: "Wagner Inuma", initials: "WI", image: "/landing/team/team-wi.webp" },
  { name: "Nick Nicolini", initials: "NI", image: "/landing/team/team-nn.webp" },
] as const;

export function TeamSection() {
  const { t } = useLandingLanguage();

  return (
    <section id="equipo" className="relative scroll-mt-24 bg-[#071013] py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <LandingSectionTitle eyebrow={t("Nuestro equipo", "Our team")} title={t("Barberos de La Bajadita", "La Bajadita barbers")} description={t("Parte de nuestro Staff, preparado para cuidar cada detalle de tu corte.", "Our permanent team, ready to care for every detail of your haircut.")} />
        </div>
        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 sm:grid-cols-2 lg:grid-cols-5">
          {fixedBarbers.map((barber) => (
            <article key={barber.name} className="group w-[min(78vw,18rem)] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-[var(--landing-border)] bg-[var(--landing-panel)]/80 text-center transition hover:-translate-y-1 hover:border-[var(--border-strong)] sm:w-auto">
              <div className="relative h-44 overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(212,175,55,0.38),transparent_65%),#090c0e]">
                <img src={barber.image} alt={`Foto de ${barber.name}`} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--landing-panel)] via-transparent to-black/20" />
                <span className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-full border border-[var(--landing-gold-soft)] bg-black/45 text-base font-semibold text-[var(--landing-gold-soft)] backdrop-blur-sm">{barber.initials}</span>
              </div>
              <div className="p-4 pt-2">
                <Scissors aria-hidden size={14} className="mx-auto text-[var(--landing-gold-soft)]" />
                <h3 className="mt-2 text-lg font-semibold text-white">{barber.name}</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{t("Barbero de La Bajadita", "La Bajadita barber")}</p>
                <Link href="/reservar" onClick={() => trackEvent("fixed_barber_reserve_click", { barber_name: barber.name })} className="landing-secondary-button mt-4 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium"><CalendarCheck size={14} /> {t("Reservar", "Book")}</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
