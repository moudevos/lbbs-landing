import { ServicesPageLayout } from "@/components/services/services-page-layout";

export default function ServicesLoading() {
  return (
    <ServicesPageLayout>
      <section className="mx-auto w-full max-w-3xl animate-pulse px-5 py-14 sm:py-20">
        <div className="h-3 w-36 rounded bg-white/10" />
        <div className="mt-4 h-11 w-72 max-w-full rounded bg-white/10" />
        <div className="mt-10 h-12 max-w-md rounded-xl bg-white/10" />
      </section>
    </ServicesPageLayout>
  );
}
