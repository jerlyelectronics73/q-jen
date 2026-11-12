import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Award,
  Cpu,
  Wrench,
  CheckCircle2,
  Factory,
  Droplets,
  Fan,
  ArrowLeftRight,
  Gauge,
  Layers,
  PackageCheck,
  Search,
  Send,
} from "lucide-react";
import {
  getActiveProducts,
  getBestSellerProducts,
  getSiteSettings,
} from "@/lib/data";
import {
  BRAND,
  FAQ_ITEMS,
  INDUSTRIAL_APPLICATIONS,
  SITE_URL,
} from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import {
  AnimatedCounter,
  MagneticButton,
  RevealSection,
  SineWaveVisualizer,
  StaggerGrid,
  StaggerItem,
} from "@/components/motion/MotionPrimitives";
import ProductCard from "@/components/public/ProductCard";
import PowerFilterCatalog from "@/components/public/PowerFilterCatalog";
import FaqAccordion from "@/components/public/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Q-JEN | Made in India Variable Frequency Drives (15kW – 220kW)",
    description:
      "Shop Q-JEN Variable Frequency Drives (15kW / 20HP to 220kW / 300HP) designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services. QCI Verified Manufacturer & GeM OEM Seller.",
    alternates: {
      canonical: SITE_URL,
    },
  };
}

const APP_ICONS = {
  Droplets,
  Fan,
  ArrowLeftRight,
  Gauge,
  Layers,
  PackageCheck,
};

export default async function HomePage() {
  const [settings, products, bestSellers] = await Promise.all([
    getSiteSettings(),
    getActiveProducts(),
    getBestSellerProducts(),
  ]);

  const waUrl = buildGeneralEnquiryWhatsAppUrl({
    whatsappNumber: settings.whatsapp_number,
  });

  const trustBadges = [
    settings.trust_badge_1,
    settings.trust_badge_2,
    settings.trust_badge_3,
    settings.trust_badge_4,
    settings.trust_badge_5,
  ].filter(Boolean);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />

      {/* 1. HERO SECTION (Dark Midnight Navy + Animated Sine-Wave VFD Monitor) */}
      <section className="relative overflow-hidden bg-[#060A30] text-white">
        <div className="absolute inset-0 bg-hero-grid opacity-55" aria-hidden="true" />
        <div
          className="absolute -top-36 -right-24 h-96 w-96 rounded-full bg-[#1C66EB]/25 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-36 -left-24 h-80 w-80 rounded-full bg-[#FACC15]/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 sm:gap-2.5 rounded-full border border-white/15 bg-white/10 backdrop-blur px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF9933] ring-2 ring-white/40 shrink-0" />
                <span>100% Made in India 🇮🇳</span>
                <span className="text-blue-200/80 hidden sm:inline">
                  • Engineered in Madurai
                </span>
              </div>

              <h1 className="font-display text-[1.9rem] sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.12] sm:leading-[1.08] text-white">
                {settings.hero_headline}
              </h1>

              <p className="text-sm sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
                {settings.hero_subtext}
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5 pt-1 sm:pt-2">
                <MagneticButton className="w-full sm:w-auto">
                  <Link
                    href="#browse-ratings"
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#336DFD] text-white font-semibold px-6 py-3.5 text-sm shadow-lg shadow-blue-950/50 transition-colors"
                  >
                    Browse Products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>

                <MagneticButton className="w-full sm:w-auto">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3.5 text-sm shadow-lg shadow-emerald-950/40 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>
                </MagneticButton>
              </div>

              {/* Animated Verified Metrics */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 border-t border-white/10 max-w-xl">
                <div className="rounded-xl bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 p-2.5 sm:p-0">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-[#FACC15]">
                    <AnimatedCounter value={15} />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-snug text-blue-200/80 mt-0.5">
                    Ratings (15–220 kW)
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 p-2.5 sm:p-0">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-white">
                    <AnimatedCounter value={30} suffix="+" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-snug text-blue-200/80 mt-0.5">
                    Yrs Engineer Experience
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 p-2.5 sm:p-0">
                  <div className="font-mono text-xl sm:text-3xl font-bold text-emerald-400">
                    <AnimatedCounter value={1} suffix=" Yr" />
                  </div>
                  <div className="text-[11px] sm:text-xs leading-snug text-blue-200/80 mt-0.5">
                    Flexible Warranty
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <SineWaveVisualizer />
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP (Subtle Saffron-White-Green Accent, Texts from site_settings) */}
      <section
        aria-label="Trust and Made in India highlights"
        className="border-y border-slate-200 bg-white relative overflow-hidden"
      >
        <div
          className="h-1 w-full bg-linear-to-r from-[#FF9933]/80 via-slate-200 to-[#138808]/80"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {trustBadges.map((badge, idx) => {
              const isOddLast =
                trustBadges.length % 2 === 1 && idx === trustBadges.length - 1;
              return (
                <div
                  key={`${badge}-${idx}`}
                  className={`flex items-center gap-2 sm:gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 sm:px-3.5 py-2.5 ${
                    isOddLast ? "col-span-2 sm:col-span-1" : ""
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      idx % 3 === 0
                        ? "bg-[#FF9933]"
                        : idx % 3 === 1
                          ? "bg-[#1C66EB]"
                          : "bg-[#138808]"
                    }`}
                  />
                  <span className="text-xs sm:text-sm font-semibold text-[#0A0F4E] leading-snug">
                    {badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. BEST SELLING PRODUCTS */}
      <section className="py-12 sm:py-16 bg-[#F8FAFC] bg-industrial-grid">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
                Featured Industrial Drives
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
                Best Selling Q-JEN VFDs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Field-tested Variable Frequency Drives ready for direct enquiry via WhatsApp.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C66EB] hover:underline shrink-0"
            >
              View all models
              <ArrowRight className="w-4 h-4" />
            </Link>
          </RevealSection>

          {bestSellers.length > 0 ? (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.slice(0, 4).map((product) => (
                <StaggerItem key={product.id}>
                  <ProductCard
                    product={product}
                    whatsappNumber={settings.whatsapp_number}
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
              Best-selling drives will appear here as soon as models are marked Active in the Admin Console.
            </div>
          )}
        </div>
      </section>

      {/* 4. BROWSE BY POWER RATING (15kW to 220kW Chips + Full Product Grid) */}
      <section
        id="browse-ratings"
        className="scroll-mt-20 py-12 sm:py-16 bg-white border-y border-slate-200"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-8">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
              15kW / 20HP to 220kW / 300HP
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
              Browse Q-JEN VFDs by Power Rating
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Select a motor kW rating below to filter our Indian-made AC drives, or tap Buy to enquire directly on WhatsApp.
            </p>
          </RevealSection>

          <PowerFilterCatalog
            products={products}
            whatsappNumber={settings.whatsapp_number}
            showAllLink
          />
        </div>
      </section>

      {/* 5. WHY CHOOSE Q-JEN (Strictly grounded in verified manufacturer credentials) */}
      <section className="py-12 sm:py-16 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
              {BRAND.legalOwner}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
              Why Choose Q-JEN Variable Frequency Drives
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Built in Madurai, Tamil Nadu by engineers with three decades of hands-on industrial electronics service experience.
            </p>
          </RevealSection>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: "In-House Schematics, PCB & Software",
                desc: "Every Q-JEN VFD schematic, PCB layout, and control software is designed within our own premises in Madurai by senior electronic and software engineers.",
              },
              {
                icon: ShieldCheck,
                title: "QCI Verified Manufacturer",
                desc: `Jerly Electronics and Cooling Services is a Quality Council of India Verified Manufacturer (Vendor Assessment Report No. ${BRAND.qciReportNumber}).`,
              },
              {
                icon: Award,
                title: "GeM OEM & Registered Trademark",
                desc: `OEM registered VFD seller on the GeM Portal and trademark owner of Q-JEN and its logo (Trade Mark No. ${BRAND.trademarkNumber}).`,
              },
              {
                icon: Wrench,
                title: "30+ Years Field Service Heritage",
                desc: "Over a decade-old company founded by engineers with three decades of industrial electronic service experience, designing sustainability into every drive.",
              },
              {
                icon: Factory,
                title: "Trial-Run Tested at Customer Sites",
                desc: "Final units undergo real-world trial running environments across our service-field customer sites to verify performance before supply.",
              },
              {
                icon: CheckCircle2,
                title: "1-Year Flexible Warranty & Value",
                desc: "Offered with a one year flexible warranty at an economical cost designed to outperform comparable imported alternatives.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#1C66EB]/40 transition-colors">
                    <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#1C66EB] flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0A0F4E]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-2">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* 6. INDUSTRIAL APPLICATIONS */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-10">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
              Industrial Sectors
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
              Applications Across Indian Industry
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Engineered for continuous motor speed control across demanding manufacturing and utility loads.
            </p>
          </RevealSection>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIAL_APPLICATIONS.map((app) => {
              const Icon =
                APP_ICONS[app.icon as keyof typeof APP_ICONS] || Cpu;
              return (
                <StaggerItem key={app.title}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-6 hover:bg-white hover:shadow-md transition-all">
                    <div className="inline-flex h-10 w-10 rounded-xl bg-[#0A0F4E] text-[#FACC15] items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-base font-bold text-[#0A0F4E]">
                      {app.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {app.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* 7. HOW TO ORDER IN 3 STEPS */}
      <section className="py-12 sm:py-16 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
              No Carts. No Logins.
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
              Order Direct in 3 Simple Steps
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: Search,
                title: "Choose Your VFD Rating",
                desc: "Browse by kW/HP rating (15kW to 220kW) or use instant search to find the exact drive for your motor.",
              },
              {
                step: "02",
                icon: MessageCircle,
                title: "Tap Buy on WhatsApp",
                desc: "Every product page opens WhatsApp directly with your chosen Q-JEN model and link pre-filled.",
              },
              {
                step: "03",
                icon: Send,
                title: "Confirm Directly with Q-JEN",
                desc: "Get verified pricing, delivery lead time, and technical guidance directly from our Madurai engineering team.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <RevealSection key={item.step}>
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
                    <div className="font-mono text-4xl font-bold text-blue-100 absolute top-4 right-5 select-none">
                      {item.step}
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0A0F4E]">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </RevealSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-10">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0A0F4E]">
              About Q-JEN VFDs & Direct Ordering
            </h2>
          </RevealSection>

          <FaqAccordion />
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-12 sm:py-16 bg-linear-to-r from-[#060A30] via-[#0A0F4E] to-[#1C66EB] text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-4xl font-bold">
            Need Help Selecting the Right kW / HP Drive?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Talk directly with our Madurai engineering & sales desk on WhatsApp for pricing, availability, and motor-drive matching.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#060A30] font-bold px-7 py-3.5 text-sm shadow-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp Now
            </a>
            <Link
              href="/products"
              className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3.5 text-sm transition-colors"
            >
              Explore All 15 Ratings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

