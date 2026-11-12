import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, MessageCircle, Cpu, ArrowRight } from "lucide-react";
import { getSiteSettings, searchActiveProducts } from "@/lib/data";
import { SITE_URL, formatPowerRating } from "@/lib/constants";
import {
  buildGeneralEnquiryWhatsAppUrl,
  buildProductWhatsAppUrl,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const trimmed = (q || "").trim();
  return {
    title: trimmed ? `Search: ${trimmed} | Q-JEN VFDs` : "Search Q-JEN VFDs",
    description:
      "Search Q-JEN Made in India Variable Frequency Drives by kW rating, HP rating, or model code.",
    alternates: {
      canonical: `${SITE_URL}/search`,
    },
    robots: trimmed
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const [results, settings] = await Promise.all([
    searchActiveProducts(query, 30),
    getSiteSettings(),
  ]);

  const emptyWaUrl = buildGeneralEnquiryWhatsAppUrl({
    topic: query ? `Looking for VFD matching "${query}"` : undefined,
    whatsappNumber: settings.whatsapp_number,
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#0A0F4E]">
          Search Q-JEN VFD Catalog
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Search by kW, HP, model code, or keyword (supports formats like{" "}
          <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded">
            15kw
          </code>
          ,{" "}
          <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded">
            20 HP
          </code>
          ,{" "}
          <code className="font-mono text-xs bg-slate-200/70 px-1.5 py-0.5 rounded">
            18.5kw 25hp
          </code>
          , or typos).
        </p>

        <form action="/search" method="GET" className="mt-6 flex gap-2 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Try 15kw, 20hp, 110kw..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 sm:pr-4 py-3 text-base sm:text-sm text-slate-900 focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white font-semibold px-4 sm:px-6 py-3 text-sm cursor-pointer transition-colors"
          >
            Search
          </button>
        </form>

        <div className="mt-8">
          {query && (
            <p className="text-sm text-slate-600 mb-4">
              Showing <strong>{results.length}</strong> result(s) for{" "}
              <span className="font-semibold text-[#0A0F4E]">
                &ldquo;{query}&rdquo;
              </span>
            </p>
          )}

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-4">
              <p className="font-display text-lg font-bold text-[#0A0F4E]">
                No VFD model matched &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Our engineering team can help you select the right Q-JEN drive
                from 15kW / 20HP to 220kW / 300HP directly on WhatsApp.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={emptyWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enquire on WhatsApp
                </a>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Browse All Ratings
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => {
                const rating = formatPowerRating(item.power_kw, item.power_hp);
                const waUrl = buildProductWhatsAppUrl({
                  name: item.name,
                  powerKw: item.power_kw,
                  powerHp: item.power_hp,
                  slug: item.slug,
                  whatsappNumber: settings.whatsapp_number,
                });

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <Link
                        href={`/products/${item.slug}`}
                        className="relative h-16 w-16 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center"
                      >
                        {item.cover_image_url ? (
                          <Image
                            src={item.cover_image_url}
                            alt={item.cover_image_alt || item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <Cpu className="w-7 h-7 text-[#1C66EB]" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold bg-[#0A0F4E] text-[#FACC15] px-2 py-0.5 rounded-full">
                            {rating}
                          </span>
                          {query && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                              {item.match_type} match
                            </span>
                          )}
                        </div>
                        <Link href={`/products/${item.slug}`}>
                          <h2 className="font-display text-base font-bold text-[#0A0F4E] hover:text-[#1C66EB] mt-1">
                            {item.name}
                          </h2>
                        </Link>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 flex-1">
                      {item.short_description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <Link
                        href={`/products/${item.slug}`}
                        className="inline-flex items-center gap-1 py-1.5 text-xs font-semibold text-[#1C66EB] hover:underline"
                      >
                        View Specs
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Buy on WhatsApp
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

