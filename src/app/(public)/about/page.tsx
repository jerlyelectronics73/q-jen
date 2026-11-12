import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Cpu,
  Factory,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import {
  BRAND,
  SITE_URL,
  VERIFIED_PRODUCT_DESCRIPTION,
} from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Q-JEN & Jerly Electronics | Madurai VFD Manufacturer",
  description:
    "Learn about Jerly Electronics and Cooling Services in Madurai, Tamil Nadu — QCI Verified Manufacturer, GeM OEM VFD Seller, and trademark owner of Q-JEN (No. 5495858).",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const waUrl = buildGeneralEnquiryWhatsAppUrl({
    whatsappNumber: settings.whatsapp_number,
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="bg-[#060A30] text-white py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          <Image
            src="/logo.png"
            alt="Q-JEN Registered Trademark Logo"
            width={128}
            height={128}
            className="h-24 w-24 sm:h-32 sm:w-32 object-contain shrink-0"
          />
          <div>
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-[#FACC15] mb-3">
              Trade Mark No. {BRAND.trademarkNumber} • Made in Madurai, India
            </span>
            <h1 className="font-display text-2xl sm:text-4xl font-bold">
              About {BRAND.name} & {BRAND.legalOwner}
            </h1>
            <p className="text-sm sm:text-base text-blue-100 mt-3 leading-relaxed">
              Over a decade-old industrial engineering enterprise built by
              engineers with three decades of hands-on electronic service
              experience.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0A0F4E]">
              Our Story & Manufacturing Heritage
            </h2>
            {VERIFIED_PRODUCT_DESCRIPTION.split("\n\n").map((para, i) => (
              <p
                key={i}
                className="text-sm sm:text-base text-slate-700 leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Quality Council of India Verified Manufacturer",
                detail: `Vendor Assessment Report No. ${BRAND.qciReportNumber}`,
              },
              {
                icon: Award,
                title: "GeM Portal OEM Registered Seller",
                detail:
                  "Registered Original Equipment Manufacturer (OEM) VFD seller on the Government e-Marketplace (GeM) Portal.",
              },
              {
                icon: Cpu,
                title: "In-House Design & Engineering",
                detail:
                  "Schematics, PCBs, and embedded control software designed within our Madurai premises by senior electronic and software engineers.",
              },
              {
                icon: Factory,
                title: "Service-Field Trial Validation",
                detail:
                  "Every product series is subjected to real trial running environments across customer service-field sites prior to release, backed by a one year flexible warranty.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
                >
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1C66EB] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0A0F4E]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {card.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl bg-[#0A0F4E] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-xl font-bold">
                Speak Directly with Our Engineering Team
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                {settings.address}
              </p>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#060A30] font-bold px-5 py-2.5 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
              <Link
                href="/products"
                className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/25 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                View VFD Range
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

