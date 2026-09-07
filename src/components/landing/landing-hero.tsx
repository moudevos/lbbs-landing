"use client";

import Link from "next/link";
import { Crimson_Pro } from "next/font/google";
import { ArrowRight, CalendarCheck, Facebook, Gift, Instagram, MapPin, Music2, Scissors } from "lucide-react";
import { HeroBackgroundCarousel } from "./hero-background-carousel";
import { trackEvent } from "@/lib/analytics/track-event";
import { useLandingLanguage } from "./landing-language-provider";
import { landingSocialLinks, socialHref } from "@/lib/landing/social-links";

const crimsonPro = Crimson_Pro({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export function LandingHero() {
  const { t } = useLandingLanguage();
  const customerAppUrl = (process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || "https://clientes.labajaditabarberstudio.com").replace(/\/$/, "");
  const highlights = [
    { icon: MapPin, label: "Iquitos, Loreto" },
    { icon: Gift, label: t("Programa Rewards", "Rewards program") },
    { icon: Scissors, label: t("Cortes con identidad", "Signature haircuts") }
  ];
  const socialLinks = [
    { label: "Facebook", shortLabel: "FB", href: socialHref(landingSocialLinks.facebook), icon: Facebook },
    { label: "Instagram", shortLabel: "IG", href: socialHref(landingSocialLinks.instagram), icon: Instagram },
    { label: "TikTok", shortLabel: "TK", href: socialHref(landingSocialLinks.tiktok), icon: Music2 }
  ];

  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden bg-[var(--landing-bg)]">
      <HeroBackgroundCarousel />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-24">
        <div className="max-w-3xl">
          <h1 className={`${crimsonPro.className} text-5xl font-bold leading-[0.98] text-white drop-shadow-2xl sm:text-6xl md:text-7xl lg:text-8xl`}>{t("El estilo se trabaja. La presencia se nota.", "Style is crafted. Presence is noticed.")}</h1>
          <p className={`${crimsonPro.className} mt-6 max-w-2xl text-xl leading-relaxed text-white/82 md:text-2xl`}>{t("Vive una experiencia auténtica de barbería premium en Iquitos, con cortes precisos, trato cercano y estilo propio.", "Enjoy an authentic premium barbershop experience in Iquitos, with precise cuts, personal service and a style of your own.")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/reservar" onClick={() => trackEvent("reserve_click", { location: "hero" })} className="landing-primary-button inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"><CalendarCheck size={16} /> {t("Reservar cita", "Book appointment")}</Link>
            <a href="#servicios" className="landing-secondary-button inline-flex items-center justify-center gap-2 bg-black/20 px-6 py-3 text-sm backdrop-blur">{t("Ver servicios", "View services")} <ArrowRight size={16} /></a>
            <a href={`${customerAppUrl}/login`} onClick={() => trackEvent("rewards_login_click", { location: "hero" })} className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(244,171,73,0.4)] bg-[rgba(244,171,73,0.1)] px-6 py-3 text-sm font-semibold text-[var(--landing-gold-soft)] transition hover:bg-[rgba(244,171,73,0.2)]"><Gift size={16} /> {t("Únete a Rewards", "Join Rewards")}</a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/72">
            {highlights.map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--landing-border)] bg-black/25 text-[var(--landing-gold-soft)] backdrop-blur"><Icon size={15} /></span>{label}</li>)}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{t("Síguenos", "Follow us")}</span>
            {socialLinks.map(({ label, shortLabel, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-[rgba(244,171,73,0.28)] bg-black/25 px-3 text-xs font-semibold text-white/80 backdrop-blur transition hover:border-[rgba(244,171,73,0.7)] hover:bg-[rgba(244,171,73,0.12)] hover:text-[var(--landing-gold-soft)]">
                <Icon size={14} /><span className="sm:hidden">{shortLabel}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
