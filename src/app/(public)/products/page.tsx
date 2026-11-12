import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getActiveProducts, getSiteSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import PowerFilterCatalog from "@/components/public/PowerFilterCatalog";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "All Q-JEN VFD Models (15kW to 220kW) | Made in India AC Drives",
  description:
    "Explore the complete Q-JEN Variable Frequency Drive catalog from 15kW / 20HP to 220kW / 300HP. Designed and manufactured in Madurai, Tamil Nadu, India.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kw?: string }>;
}) {
  const sp = await searchParams;
  const kwParam = sp.kw ? Number(sp.kw) : null;
  const initialKw = kwParam && Number.isFinite(kwParam) ? kwParam : null;

  const [products, settings] = await Promise.all([
    getActiveProducts(),
    getSiteSettings(),
  ]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
    ],
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 sm:py-14">
      <JsonLd data={breadcrumbJsonLd} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-4">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-[#1C66EB]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-slate-800">All VFD Products</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#0A0F4E]">
              Q-JEN Variable Frequency Drives
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Complete Indian-made AC drive range from 15kW / 20HP to 220kW / 300HP. Filter by kW rating or tap Buy on WhatsApp for pricing.
            </p>
          </div>
          <a
            href={buildGeneralEnquiryWhatsAppUrl({
              whatsappNumber: settings.whatsapp_number,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-sm font-semibold shrink-0 self-start md:self-auto"
          >
            <MessageCircle className="w-4 h-4" />
            Enquire on WhatsApp
          </a>
        </div>

        <PowerFilterCatalog
          products={products}
          whatsappNumber={settings.whatsapp_number}
          initialKw={initialKw}
        />
      </div>
    </div>
  );
}

