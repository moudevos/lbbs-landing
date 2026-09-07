"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CalendarDays, Car, Clock3, MapPin, MessageCircle, Navigation, ShieldCheck, Store } from "lucide-react";

import { LandingSectionTitle } from "./landing-section-title";
import { useLandingLanguage } from "./landing-language-provider";

type FixedBranch = {
  id: string;
  name: string;
  address: string;
  city: string;
  mapsUrl: string;
  whatsappMessage: string;
  hours: { label: string; value: string }[];
  imageUrl: string;
  imageAlt: string;
};

const fixedBranches: FixedBranch[] = [
  {
    id: "san-juan",
    name: "La Bajadita San Juan",
    address: "San Juan Bautista, Iquitos, Loreto",
    city: "San Juan Bautista · Loreto · Perú",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=La%20Bajadita%20San%20Juan%2C%20San%20Juan%20Bautista%2C%20Iquitos%2C%20Loreto",
    whatsappMessage: "Hola, deseo consultar o reservar una cita en la sede La Bajadita San Juan.",
    hours: [{ label: "Lunes a sábado", value: "9:30 AM - 9:30 PM" }, { label: "Domingos", value: "10:00 AM - 6:00 PM" }],
    imageUrl: "/landing/sedes/sede-sanjuan.jpg",
    imageAlt: "Sede San Juan de La Bajadita Barber Studio"
  },
  {
    id: "ricardo-palma",
    name: "La Bajadita Ricardo Palma",
    address: "Ricardo Palma, Iquitos, Loreto",
    city: "Iquitos · Loreto · Perú",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=La%20Bajadita%20Ricardo%20Palma%2C%20Iquitos%2C%20Loreto",
    whatsappMessage: "Hola, deseo consultar o reservar una cita en la sede La Bajadita Ricardo Palma.",
    hours: [{ label: "Lunes a sábado", value: "9:30 AM - 9:30 PM" }, { label: "Domingos", value: "10:00 AM - 6:00 PM" }],
    imageUrl: "/landing/sedes/sede-iquitos.png",
    imageAlt: "Sede Ricardo Palma de La Bajadita Barber Studio"
  }
];

function whatsapp(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("51") ? digits : `51${digits}`}?text=${encodeURIComponent(message)}`;
}

export function LocationHours({ mainPhone }: { mainPhone: string | null }) {
  const { t } = useLandingLanguage();
  const benefits = [
    { icon: Navigation, title: t("Fácil acceso", "Easy access"), text: t("Ubicaciones céntricas y de fácil llegada.", "Central locations that are easy to reach.") },
    { icon: Car, title: t("Estacionamiento", "Parking"), text: t("Opciones cercanas para tu vehículo.", "Nearby options for your vehicle.") },
    { icon: MessageCircle, title: t("¿Dudas?", "Questions?"), text: t("Escríbenos por WhatsApp y te ayudamos.", "Message us on WhatsApp and we will help.") },
    { icon: ShieldCheck, title: t("Experiencia premium", "Premium experience"), text: t("Ambientes diseñados para tu comodidad y estilo.", "Spaces designed for your comfort and style.") }
  ];

  return <section id="ubicacion" className="scroll-mt-24 bg-[#050a0d] py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-6">
      <LandingSectionTitle eyebrow={t("Ubicación y horarios", "Locations and hours")} title={t("Te esperamos en nuestras sedes", "We look forward to seeing you")} description={t("Visítanos en Iquitos y disfruta una experiencia de barbería pensada para tu comodidad.", "Visit us in Iquitos and enjoy a barbering experience designed for your comfort.")} />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {fixedBranches.map((branch, index) => <article key={branch.id} className="group overflow-hidden rounded-3xl border border-[rgba(244,171,73,.24)] bg-[#0c1418] transition duration-300 hover:-translate-y-1 hover:border-[rgba(244,171,73,.6)]">
          <div className="relative h-64 overflow-hidden bg-[#111] sm:h-72">
            <img src={branch.imageUrl} alt={branch.imageAlt} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1418] via-black/15 to-black/20" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute bottom-5 left-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(244,171,73,.35)] bg-black/45 text-[var(--landing-gold-soft)] backdrop-blur"><Store size={20} strokeWidth={1.3} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-white">La Bajadita</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-[var(--landing-gold-soft)]">Barber Studio</p></div></div>
          </div>
          <div className="p-6 md:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="w-fit rounded-full border border-[rgba(244,171,73,.3)] bg-[rgba(244,171,73,.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--landing-gold-soft)]">{index === 0 ? t("Sede principal", "Main location") : t("Sede", "Location")}</span>
              <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[rgba(244,171,73,.3)] bg-[rgba(244,171,73,.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--landing-gold-soft)] transition hover:bg-[rgba(244,171,73,.16)]"><Navigation size={12} /> {t("Cómo llegar", "Directions")}</a>
            </div>
            <div className="mt-5 grid gap-7 border-t border-white/10 pt-6 md:grid-cols-2 md:gap-0">
              <div className="md:border-r md:border-white/10 md:pr-7">
                <h3 className="text-2xl font-semibold text-white">{branch.name}</h3>
                <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex gap-3 text-sm leading-6 text-[var(--text-muted)] transition hover:text-white"><MapPin className="mt-0.5 shrink-0 text-[var(--landing-gold-soft)]" size={18} /><span><span className="block underline decoration-white/20 underline-offset-4">{branch.address}</span><span>{branch.city}</span></span></a>
              </div>
              <div className="border-t border-white/10 pt-6 md:border-t-0 md:pl-7 md:pt-0"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75"><Clock3 size={16} className="text-[var(--landing-gold-soft)]" /> {t("Horarios", "Hours")}</p><div className="mt-4 grid gap-3 text-sm">{branch.hours.map((schedule) => <ScheduleRow key={schedule.label} label={t(schedule.label, schedule.label === "Domingos" ? "Sundays" : "Monday to Saturday")} value={schedule.value} />)}</div></div>
            </div>
            {mainPhone ? <div className="pt-7"><a href={whatsapp(mainPhone, branch.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-[var(--text-muted)] transition hover:bg-white/5 hover:text-white"><MessageCircle size={15} /> {t("Contactar por WhatsApp", "Contact by WhatsApp")}</a></div> : null}
          </div>
        </article>)}
      </div>
      <div className="mt-8 grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] sm:grid-cols-2 lg:grid-cols-4">{benefits.map(({ icon: Icon, title, text }) => <div key={title} className="border-b border-white/10 p-5 last:border-b-0 sm:border-r sm:[&:nth-child(2)]:border-r-0 lg:border-b-0 lg:[&:nth-child(2)]:border-r lg:last:border-r-0"><Icon size={21} className="text-[var(--landing-gold-soft)]" /><h4 className="mt-3 text-sm font-semibold text-white">{title}</h4><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{text}</p></div>)}</div>
      <div className="mt-10 text-center"><p className="text-sm text-[var(--text-muted)]">{t("¿Prefieres reservar tu cita?", "Would you rather book your appointment?")}</p><Link href="/reservar" className="landing-primary-button mt-4 inline-flex w-full items-center justify-center gap-2 px-6 py-3 text-sm sm:w-auto"><CalendarDays size={17} /> {t("Reservar ahora", "Book now")}</Link></div>
    </div>
  </section>;
}

function ScheduleRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[var(--text-muted)]">{label}</span><span className="whitespace-nowrap font-medium text-white/85">{value}</span></div>;
}
