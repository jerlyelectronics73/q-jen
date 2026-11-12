"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import type { Product } from "@/types/database";
import { POWER_RATING_CHIPS } from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import ProductCard from "./ProductCard";

export default function PowerFilterCatalog({
  products,
  whatsappNumber,
  initialKw,
  showAllLink = false,
}: {
  products: Product[];
  whatsappNumber: string;
  initialKw?: number | null;
  showAllLink?: boolean;
}) {
  const [selectedKw, setSelectedKw] = useState<number | null>(
    initialKw ?? null
  );

  const selectedChip = useMemo(
    () =>
      selectedKw === null
        ? null
        : POWER_RATING_CHIPS.find((c) => Number(c.kw) === Number(selectedKw)) ||
          null,
    [selectedKw]
  );

  const filtered = useMemo(() => {
    if (selectedKw === null) return products;
    return products.filter((p) => Number(p.power_kw) === Number(selectedKw));
  }, [products, selectedKw]);

  const emptyWaHref = buildGeneralEnquiryWhatsAppUrl({
    topic: selectedChip
      ? `${selectedChip.label} VFD availability & pricing`
      : selectedKw
        ? `${selectedKw}kW VFD availability & pricing`
        : undefined,
    whatsappNumber,
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Power Rating Filter Chips (15kW to 220kW) */}
      <div className="space-y-2">
        <div className="flex sm:hidden items-center justify-between text-[11px] font-medium text-slate-500">
          <span>Filter by kW rating</span>
          <span>Swipe →</span>
        </div>
        <div
          role="tablist"
          aria-label="Filter VFD products by kW power rating"
          className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedKw === null}
            onClick={() => setSelectedKw(null)}
            className={`shrink-0 min-h-[40px] sm:min-h-0 inline-flex items-center rounded-full px-4 sm:px-3.5 py-2 sm:py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              selectedKw === null
                ? "bg-[#1C66EB] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-700 hover:border-[#1C66EB] hover:text-[#1C66EB]"
            }`}
          >
            All Ratings ({products.length})
          </button>

          {POWER_RATING_CHIPS.map((chip) => {
            const active = selectedKw === chip.kw;
            const matchCount = products.filter(
              (p) => Number(p.power_kw) === Number(chip.kw)
            ).length;
            const exists = matchCount > 0;
            return (
              <button
                key={chip.kw}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedKw(active ? null : chip.kw)}
                className={`shrink-0 min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5 rounded-full px-4 sm:px-3.5 py-2 sm:py-1.5 font-mono text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#0A0F4E] text-[#FACC15] shadow-sm ring-2 ring-[#1C66EB]/30"
                    : exists
                      ? "bg-white border border-slate-300 text-slate-800 hover:border-[#1C66EB] hover:text-[#1C66EB]"
                      : "bg-slate-100 border border-dashed border-slate-200 text-slate-500 hover:text-slate-700"
                }`}
              >
                {exists && !active && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{chip.kw}kW</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filter summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          Showing <strong className="text-[#0A0F4E]">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "model" : "models"}
          {selectedChip
            ? ` for ${selectedChip.label}`
            : selectedKw !== null
              ? ` for ${selectedKw}kW`
              : ""}
        </span>
        {selectedKw !== null && (
          <button
            type="button"
            onClick={() => setSelectedKw(null)}
            className="font-semibold text-[#1C66EB] hover:underline cursor-pointer"
          >
            Clear filter (show all {products.length})
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-10 text-center space-y-4">
          <div>
            <p className="text-sm sm:text-base font-semibold text-slate-800">
              No active VFD models published for{" "}
              {selectedChip
                ? selectedChip.label
                : selectedKw
                  ? `${selectedKw}kW`
                  : "this filter"}{" "}
              yet.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Contact Q-JEN on WhatsApp for immediate availability and pricing,
              or view our currently published ratings.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3">
            <a
              href={emptyWaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Enquire {selectedKw ? `${selectedKw}kW` : "Rating"} on WhatsApp
            </a>
            {selectedKw !== null && (
              <button
                type="button"
                onClick={() => setSelectedKw(null)}
                className="min-h-[42px] inline-flex items-center justify-center rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
              >
                Show All Ratings ({products.length})
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} whatsappNumber={whatsappNumber} />
            </div>
          ))}
        </div>
      )}

      {showAllLink && (
        <div className="flex justify-center pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1C66EB]/30 bg-white px-5 py-2.5 text-sm font-semibold text-[#1C66EB] hover:bg-blue-50 transition-colors"
          >
            Open Full Catalog Page
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

