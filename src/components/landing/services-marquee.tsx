"use client";

import { useRef } from "react";
import Link from "next/link";
import { Clock3, Palette, Scissors, Smile, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { LandingSectionTitle } from "./landing-section-title";
import type { LandingService } from "@/lib/public/landing-data";
import { useLandingLanguage } from "./landing-language-provider";
import { CarouselNavigation } from "./carousel-navigation";

const serviceIcons = {
  beard: UserRound,
  care: Sparkles,
  color: Palette,
  style: WandSparkles,
  kids: Smile,
  default: Scissors
};

function ServiceCard({ service }: { service: LandingService }) {
  const { t } = useLandingLanguage();
  const Icon = serviceIcons[service.icon];
  const duration = service.durationMinutes
    ? `${service.durationMinutes} ${t("minutos", "minutes")}`
    : t("Duración variable", "Variable duration");

  return (
    <article className="group flex h-[286px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-panel)]/80 px-9 py-8 text-center shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)]" aria-label={service.name}>
        <span className="flex h-12 w-12 items-center justify-center border border-[rgba(244,171,73,0.42)] text-[var(--landing-gold-soft)] transition duration-300 group-hover:bg-[rgba(244,171,73,0.13)]">
          <Icon size={25} strokeWidth={1.5} />
        </span>
        <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-white">{service.name}</h3>
        <p className="mt-3 line-clamp-3 max-w-64 text-sm leading-6 text-[var(--text-muted)]">
          {service.description || t("Servicio profesional con acabado premium.", "Professional service with a premium finish.")}
        </p>
        <div className="mt-auto inline-flex items-center justify-center gap-2 pt-5 text-xs font-semibold text-[var(--landing-gold-soft)]">
          <Clock3 size={15} /> {duration}
        </div>
    </article>
  );
}

export function ServicesMarquee({ services }: { services: LandingService[] }) {
  const { t } = useLandingLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);

  return (
    <section id="servicios" className="relative scroll-mt-24 bg-[var(--landing-bg)] py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-8 max-w-4xl">
          <LandingSectionTitle
            eyebrow={t("Nuestros servicios", "Our services")}
            title={t("Cortes y barbería premium en Iquitos", "Premium haircuts and barbering in Iquitos")}
            description={t(
              "Corte clásico, fade, barba, perfilado y servicios personalizados con barberos profesionales en Iquitos.",
              "Classic cuts, fades, beard grooming, shaping and personalized services by professional barbers in Iquitos."
            )}
          />
        </div>

        {services.length === 0 ? <Placeholder /> : (
          <>
            <div className="mb-2 hidden justify-end md:flex">
              <CarouselNavigation carouselRef={carouselRef} label={t("servicios", "services")} />
            </div>
            <div ref={carouselRef} className="service-cards-track no-scrollbar -mx-6 flex snap-x snap-proximity gap-5 overflow-x-auto px-6 pb-4 pt-5 md:mx-0 md:px-0">
              {services.slice(0, 3).map((service) => (
                <div data-carousel-card key={service.id} className="min-w-[84vw] max-w-[84vw] snap-start sm:min-w-[300px] sm:max-w-[300px] md:min-w-[280px] md:max-w-[280px]">
                  <ServiceCard service={service} />
                </div>
              ))}
              <div data-carousel-card className="min-w-[84vw] max-w-[84vw] snap-start sm:min-w-[300px] sm:max-w-[300px] md:min-w-[280px] md:max-w-[280px]">
                <Link href="/servicios" className="group flex h-[286px] flex-col items-center justify-center rounded-3xl border border-dashed border-[rgba(244,171,73,0.5)] bg-[var(--landing-panel)]/55 px-9 py-8 text-center transition hover:-translate-y-1 hover:border-[var(--border-strong)] hover:bg-[rgba(244,171,73,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-gold)]">
                  <Scissors size={28} className="text-[var(--landing-gold-soft)]" />
                  <h3 className="mt-5 text-xl font-semibold text-white">{t("Ver carta completa", "See full menu")}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{t("Consulta todos los servicios y precios por sede.", "Browse all services and branch prices.")}</p>
                  <span className="mt-6 text-sm font-semibold text-[var(--landing-gold-soft)]">{t("Ir a servicios", "View services")} →</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Placeholder() {
  const { t } = useLandingLanguage();
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-panel)]/55 p-8 text-center">
      <Scissors className="mx-auto text-[var(--landing-gold-soft)]" size={30} />
      <p className="mt-4 font-semibold text-white">{t("No hay servicios disponibles por ahora.", "No services are currently available.")}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{t("Puede escribirnos por WhatsApp para coordinar su atención.", "You can contact us on WhatsApp to arrange your visit.")}</p>
    </div>
  );
}
