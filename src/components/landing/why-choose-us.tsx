"use client";

import { Armchair, Clock, Scissors, Sparkles } from "lucide-react";
import { LandingSectionTitle } from "./landing-section-title";
import { useLandingLanguage } from "./landing-language-provider";

export function WhyChooseUs() {
  const { t } = useLandingLanguage();
  const reasons = [
    { title: t("Barberos con detalle", "Detail-focused barbers"), text: t("Profesionales enfocados en precisión, acabado y trato cercano.", "Professionals focused on precision, finish and personal service."), icon: Scissors },
    { title: t("Productos premium", "Premium products"), text: t("Usamos productos seleccionados para cuidar tu cabello y barba.", "We use selected products to care for your hair and beard."), icon: Sparkles },
    { title: t("Ambiente relajado", "Relaxed atmosphere"), text: t("Un espacio cómodo, moderno y pensado para disfrutar tu atención.", "A comfortable, modern space designed for you to enjoy your visit."), icon: Armchair },
    { title: t("Puntualidad", "Punctuality"), text: t("Reservas organizadas para respetar tu tiempo.", "Organized appointments that respect your time."), icon: Clock }
  ];
  return (
    <section id="por-que-nosotros" className="scroll-mt-20 bg-[var(--landing-bg)] py-12 md:flex md:min-h-[calc(100svh-5px)] md:items-center md:py-10">
      <div className="mx-auto max-w-7xl px-6">
        <LandingSectionTitle eyebrow={t("Por qué nosotros", "Why us")} title={t("¿Por qué elegirnos?", "Why choose us?")} description={t("Cuidamos tu imagen con técnica, puntualidad y una experiencia pensada para que vuelvas.", "We care for your image with technique, punctuality and an experience designed to bring you back.")} />
        <div className="mt-8 grid overflow-hidden rounded-3xl border border-[var(--landing-border)] bg-[var(--landing-panel)]/70 shadow-[0_24px_60px_-44px_rgba(0,0,0,0.9)] md:grid-cols-4">
          {reasons.map(({ title, text, icon: Icon }, index) => <article key={title} className={`flex min-h-48 flex-col items-center justify-center px-6 py-7 text-center ${index > 0 ? "border-t border-[var(--landing-border)] md:border-l md:border-t-0" : ""}`}><span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(244,171,73,0.2)] bg-[rgba(244,171,73,0.08)] text-[var(--landing-gold-soft)]"><Icon size={24} /></span><h3 className="mt-4 text-lg font-semibold text-white">{title}</h3><p className="mt-2 max-w-56 text-sm leading-relaxed text-[var(--text-muted)]">{text}</p></article>)}
        </div>
      </div>
    </section>
  );
}
