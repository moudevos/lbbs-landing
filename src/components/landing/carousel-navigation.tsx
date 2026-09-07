"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

export function CarouselNavigation({ carouselRef, label }: { carouselRef: RefObject<HTMLDivElement | null>; label: string }) {
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    function update() {
      if (!carousel) return;
      setCanGoBack(carousel.scrollLeft > 4);
      setCanGoForward(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 4);
    }

    update();
    carousel.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(carousel);
    return () => {
      carousel.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [carouselRef]);

  function move(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const cards = Array.from(carousel.querySelectorAll<HTMLElement>("[data-carousel-card]"));
    if (!cards.length) return;

    const currentIndex = cards.reduce((closestIndex, card, index) => (
      Math.abs(card.offsetLeft - carousel.scrollLeft) < Math.abs(cards[closestIndex].offsetLeft - carousel.scrollLeft)
        ? index
        : closestIndex
    ), 0);
    const targetIndex = Math.min(cards.length - 1, Math.max(0, currentIndex + direction));
    carousel.scrollTo({ left: cards[targetIndex].offsetLeft, behavior: "smooth" });
  }

  return (
    <div className="flex items-center justify-end gap-2" aria-label={`Navegación de ${label}`}>
      <button type="button" onClick={() => move(-1)} disabled={!canGoBack} aria-label={`Anterior en ${label}`} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--landing-border)] text-[var(--landing-gold-soft)] transition hover:border-[var(--landing-gold)] hover:bg-[rgba(234,157,77,0.1)] disabled:cursor-not-allowed disabled:opacity-30">
        <ChevronLeft size={21} />
      </button>
      <button type="button" onClick={() => move(1)} disabled={!canGoForward} aria-label={`Siguiente en ${label}`} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--landing-border)] text-[var(--landing-gold-soft)] transition hover:border-[var(--landing-gold)] hover:bg-[rgba(234,157,77,0.1)] disabled:cursor-not-allowed disabled:opacity-30">
        <ChevronRight size={21} />
      </button>
    </div>
  );
}
