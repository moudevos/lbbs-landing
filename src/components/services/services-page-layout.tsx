import Link from "next/link";
import type { ReactNode } from "react";
import { Big_Shoulders, Inter } from "next/font/google";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingLanguageProvider } from "@/components/landing/landing-language-provider";
import { getLandingData } from "@/lib/public/landing-data";

const display = Big_Shoulders({ subsets: ["latin"], weight: "800", display: "swap" });
const body = Inter({ subsets: ["latin"], display: "swap" });

export async function ServicesPageLayout({ children }: { children: ReactNode }) {
  const landingData = await getLandingData();
  const customerAppUrl = (process.env.NEXT_PUBLIC_CUSTOMER_APP_URL || "https://clientes.labajaditabarberstudio.com").replace(/\/$/, "");

  return (
    <LandingLanguageProvider>
      <div className={body.className + " landing-public min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]"}>
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-[var(--landing-border)] px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--landing-gold)]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--landing-gold)]" />La Bajadita
          </Link>
          <nav aria-label="Navegación de servicios" className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] sm:gap-4">
            <Link href="/" className="rounded-full px-3 py-2 text-white/75 transition hover:bg-white/5 hover:text-[var(--landing-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--landing-gold)]">Landing</Link>
            <a href={`${customerAppUrl}/login`} className="rounded-full border border-[var(--landing-border)] bg-[rgba(244,171,73,0.08)] px-3 py-2 text-[var(--landing-gold-soft)] transition hover:bg-[rgba(244,171,73,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--landing-gold)]">Zona cliente</a>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 py-6 sm:py-8">
            <div>
              <h1 className={display.className + " text-5xl uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"}>Carta de<br /><span className="text-[var(--landing-gold-soft)]">servicios</span></h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--text-muted)]">Cortes, barba y servicios disponibles en cada sede.</p>
            </div>
            <svg aria-hidden="true" viewBox="0 0 280 150" className="mr-12 hidden w-64 shrink-0 -rotate-12 text-[var(--landing-gold-soft)] md:block" fill="none">
              <path d="M34 104 211 35l20 10-4 22L61 127Z" fill="#162020" stroke="currentColor" strokeWidth="2" />
              <path d="m57 111 153-60-3 12-139 55Z" fill="currentColor" opacity=".35" />
              <path d="M57 114 234 100q28-2 19-19l-8-10-193 32Z" fill="#162020" stroke="currentColor" strokeWidth="2" />
              <circle cx="59" cy="110" r="5" fill="currentColor" /><path d="m91 108 130-12" stroke="currentColor" opacity=".5" />
            </svg>
          </div>
          {children}
        </main>
        <LandingFooter branches={landingData.branches} settings={landingData.settings} mainPhone={landingData.mainContact.phone} />
      </div>
    </LandingLanguageProvider>
  );
}
