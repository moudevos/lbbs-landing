/*  */"use client";

import { useEffect, useRef, useState } from "react";
import { Rye } from "next/font/google";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { LanguageSelector, useLandingLanguage } from "./landing-language-provider";

const rye = Rye({ subsets: ["latin"], weight: ["400"] });
const navSectionHrefs = ["#inicio", "#por-que-nosotros", "#trabajo", "#equipo", "#ubicacion"];

export function LandingNavbar() {
  const { t } = useLandingLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("#inicio");
  const navTimelineRef = useRef<HTMLDivElement>(null);
  const timelineIndicatorRef = useRef<HTMLSpanElement>(null);
  const navLinks = [
    { label: t("Inicio", "Home"), href: "#inicio" },
    { label: t("Por qué nosotros", "Why us"), href: "#por-que-nosotros" },
    { label: t("Servicios", "Services"), href: "/servicios", isRoute: true },
    { label: t("Galería", "Gallery"), href: "#trabajo" },
    { label: t("Equipo", "Team"), href: "#equipo" },
    { label: t("Ubicación", "Location"), href: "#ubicacion" }
  ];

  useEffect(() => {
    let frame = 0;

    const updateTimeline = () => {
      const container = navTimelineRef.current;
      const indicator = timelineIndicatorRef.current;
      if (!container || !indicator) return;

      const marker = window.scrollY + window.innerHeight * 0.34;
      const sections = navSectionHrefs
        .map((href) => {
          const section = document.querySelector<HTMLElement>(href);
          const link = container.querySelector<HTMLAnchorElement>(`[data-nav-href="${href}"]`);
          if (!section || !link) return null;
          return { href, top: section.getBoundingClientRect().top + window.scrollY, link };
        })
        .filter((item): item is { href: string; top: number; link: HTMLAnchorElement } => Boolean(item));
      if (!sections.length) return;

      let currentIndex = 0;
      sections.forEach((section, index) => {
        if (section.top <= marker) currentIndex = index;
      });
      const current = sections[currentIndex];
      const next = sections[currentIndex + 1];
      const progress = next ? Math.min(1, Math.max(0, (marker - current.top) / (next.top - current.top))) : 0;
      const currentLeft = current.link.offsetLeft + current.link.offsetWidth * 0.16;
      const currentWidth = current.link.offsetWidth * 0.68;
      const nextLeft = next ? next.link.offsetLeft + next.link.offsetWidth * 0.16 : currentLeft;
      const nextWidth = next ? next.link.offsetWidth * 0.68 : currentWidth;

      indicator.style.transform = `translateX(${currentLeft + (nextLeft - currentLeft) * progress}px)`;
      indicator.style.width = `${currentWidth + (nextWidth - currentWidth) * progress}px`;
      setActiveHash((value) => value === current.href ? value : current.href);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 40);
        updateTimeline();
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const observer = new ResizeObserver(onScroll);
    if (navTimelineRef.current) observer.observe(navTimelineRef.current);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className={"fixed left-0 top-0 z-50 w-full px-5 transition-all duration-300 " + (scrolled ? "border-b border-[var(--landing-border)] bg-[var(--landing-bg)]/82 py-3 shadow-lg shadow-black/40 backdrop-blur-xl" : "bg-transparent py-5")}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <a href="#inicio" className={`${rye.className} inline-flex rounded-xl px-2 py-1 text-lg tracking-wide text-white transition hover:bg-white/5 hover:text-[var(--landing-gold-soft)]`}>La Bajadita</a>
        <div className="hidden items-center gap-2 lg:flex">
          <div ref={navTimelineRef} className="landing-nav-timeline relative flex items-center gap-2 pb-3">
            {navLinks.map((link) => link.isRoute ? <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/75 transition hover:bg-white/5 hover:text-[var(--landing-gold-soft)]">{link.label}</Link> : <a key={link.href} href={link.href} data-nav-href={link.href} onClick={() => setActiveHash(link.href)} aria-current={activeHash === link.href ? "page" : undefined} className={"rounded-full px-3 py-2 text-xs uppercase tracking-[0.18em] transition " + (activeHash === link.href ? "text-[var(--landing-gold-soft)]" : "text-white/75 hover:bg-white/5 hover:text-[var(--landing-gold-soft)]")}>{link.label}</a>)}
            <span ref={timelineIndicatorRef} aria-hidden className="landing-nav-timeline-indicator" />
          </div>
          <LanguageSelector />
          <Link href="/reservar" className="ml-1 rounded-full bg-[var(--landing-gold)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-[var(--landing-gold-soft)]">{t("Reservar ya", "Book now")}</Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector />
          <button type="button" onClick={() => setOpen((value) => !value)} className="text-white transition hover:text-[var(--landing-gold-soft)]" aria-label={open ? t("Cerrar menú", "Close menu") : t("Abrir menú", "Open menu")}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open ? <div className="mt-4 rounded-2xl border border-[var(--landing-border)] bg-[var(--landing-bg)]/92 p-4 backdrop-blur-xl lg:hidden"><ul>{navLinks.map((link) => <li key={link.href}>{link.isRoute ? <Link href={link.href} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/5">{link.label}</Link> : <a href={link.href} onClick={() => { setActiveHash(link.href); setOpen(false); }} aria-current={activeHash === link.href ? "page" : undefined} className={"block rounded-xl px-4 py-3 text-sm uppercase tracking-[0.18em] transition " + (activeHash === link.href ? "bg-[rgba(244,171,73,0.12)] text-[var(--landing-gold-soft)]" : "text-white/80 hover:bg-white/5")}>{link.label}</a>}</li>)}</ul><Link href="/reservar" onClick={() => setOpen(false)} className="mt-3 flex w-full items-center justify-center rounded-full bg-[var(--landing-gold)] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-black">{t("Reservar ya", "Book now")}</Link></div> : null}
    </nav>
  );
}
