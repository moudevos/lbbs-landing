"use client";

import { useEffect } from "react";

const revealSelector = ".landing-public > section:not(#inicio), .landing-public > footer";

export function LandingScrollReveal() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(revealSelector));
    if (!sections.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("landing-reveal", "landing-reveal-visible"));
      return;
    }

    sections.forEach((section) => section.classList.add("landing-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("landing-reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
