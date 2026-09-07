"use client";

import Image from "next/image";
import { useState } from "react";
import { Instagram } from "lucide-react";

import { LandingSectionTitle } from "./landing-section-title";
import { WorkDetailModal } from "./work-detail-modal";
import type { LandingGalleryItem } from "@/lib/public/landing-data";
import { trackEvent } from "@/lib/analytics/track-event";
import { useLandingLanguage } from "./landing-language-provider";
import { landingSocialLinks } from "@/lib/landing/social-links";
import { resolvePublicSocialLinks } from "@/lib/public/social-links";

const VISIBLE_COUNT = 5;

// Galería editorial local: reemplaza estos cinco archivos cada dos semanas.
// El collage siempre usa exactamente estas cinco piezas, sin depender del panel.
const fixedGalleryItems: LandingGalleryItem[] = [
  { id: "work-1", title: "Estilo destacado", description: "Una selección reciente de nuestro trabajo.", serviceName: "La Bajadita", barberName: "Barber Studio", imageUrl: "/landing/work/work-1.jpg", altText: "Corte destacado de La Bajadita Barber Studio" },
  { id: "work-2", title: "Detalle y precisión", description: "Una selección reciente de nuestro trabajo.", serviceName: "La Bajadita", barberName: "Barber Studio", imageUrl: "/landing/work/work-2.jpg", altText: "Detalle de corte realizado en La Bajadita Barber Studio" },
  { id: "work-3", title: "Corte con identidad", description: "Una selección reciente de nuestro trabajo.", serviceName: "La Bajadita", barberName: "Barber Studio", imageUrl: "/landing/work/work-3.jpg", altText: "Corte con identidad de La Bajadita Barber Studio" },
  { id: "work-4", title: "Acabado premium", description: "Una selección reciente de nuestro trabajo.", serviceName: "La Bajadita", barberName: "Barber Studio", imageUrl: "/landing/work/work-4.jpg", altText: "Acabado premium en La Bajadita Barber Studio" },
  { id: "work-5", title: "Nuestro trabajo", description: "Una selección reciente de nuestro trabajo.", serviceName: "La Bajadita", barberName: "Barber Studio", imageUrl: "/landing/work/work-5.jpg", altText: "Trabajo reciente de La Bajadita Barber Studio" }
];

const collageLayout = [
  "col-start-1 col-span-8 row-start-1 row-span-3",
  "col-start-9 col-span-4 row-start-1 row-span-2",
  "col-start-9 col-span-4 row-start-3 row-span-3",
  "col-start-1 col-span-4 row-start-4 row-span-2",
  "col-start-5 col-span-4 row-start-4 row-span-2"
];

const mobileHeights = ["h-[72vw]", "h-[62vw]", "h-[68vw]", "h-[76vw]", "h-[64vw]"];

export function WorkCollage({ socialLinks }: { socialLinks: string[] }) {
  const { t } = useLandingLanguage();
  const instagramUrl = resolvePublicSocialLinks(socialLinks).instagram || landingSocialLinks.instagram;
  const [selected, setSelected] = useState<LandingGalleryItem | null>(null);

  function open(item: LandingGalleryItem) {
    setSelected(item);
    trackEvent("gallery_image_open", { item_id: item.id, title: item.title, service_name: item.serviceName });
  }

  return (
    <section id="trabajo" className="relative scroll-mt-24 overflow-hidden bg-[#050505] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-5 max-w-3xl">
          <LandingSectionTitle align="left" eyebrow={t("Nuestro trabajo", "Our work")} title={t("Cortes que hablan por ti", "Haircuts that speak for you")} description={t("Cada acabado refleja precisión, estilo y la experiencia de una barbería premium en Iquitos.", "Every finish reflects precision, style and the experience of a premium barbershop in Iquitos.")} />
        </div>

        <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3 md:hidden">
          {fixedGalleryItems.map((item, index) => <GalleryCard key={item.id} item={item} onOpen={() => open(item)} className={`min-w-[82vw] snap-start ${mobileHeights[index]}`} />)}
        </div>
        <div className="relative hidden aspect-[6/5] w-full overflow-hidden rounded-[1.8rem] md:block">
          <div className="absolute inset-x-0 top-0 grid aspect-square w-full grid-cols-12 grid-rows-6 gap-4">
            {Array.from({ length: VISIBLE_COUNT }, (_, index) => <GalleryCard key={fixedGalleryItems[index].id} item={fixedGalleryItems[index]} onOpen={() => open(fixedGalleryItems[index])} className={collageLayout[index]} />)}
          </div>
          {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("social_click", { network: "Instagram", location: "work_collage_center" })} className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[rgba(244,171,73,0.8)] bg-black/80 text-center text-xs font-semibold text-[var(--landing-gold-soft)] shadow-2xl backdrop-blur-sm transition hover:scale-105 hover:bg-[var(--landing-gold)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--landing-gold)]"><Instagram size={23} /><span className="mt-2">Instagram</span></a> : null}
        </div>
      </div>
      <WorkDetailModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function GalleryCard({ item, onOpen, className = "" }: { item: LandingGalleryItem; onOpen: () => void; className?: string }) {
  const { t } = useLandingLanguage();
  const [imageError, setImageError] = useState(false);

  return <button type="button" onClick={onOpen} className={`group relative overflow-hidden rounded-[1.4rem] bg-[#111] text-left transition duration-500 ${className}`} aria-label={`${t("Ver", "View")} ${item.title}`}>
    <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(234,157,77,0.22),transparent_60%),linear-gradient(160deg,#162020,#050A0D)]" />
    {!imageError ? <Image src={item.imageUrl} alt={item.altText || `${item.title} en La Bajadita Barber Studio`} fill loading="lazy" quality={72} sizes="(max-width: 768px) 82vw, 40vw" className="object-cover transition duration-700 group-hover:scale-105" onError={() => setImageError(true)} /> : null}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
    <div className="absolute inset-x-4 bottom-4"><p className="font-semibold text-white">{item.title}</p><p className="text-xs text-[var(--landing-gold-soft)]">{item.serviceName} · {item.barberName}</p></div>
  </button>;
}
