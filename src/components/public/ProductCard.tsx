import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowUpRight, Star, Cpu } from "lucide-react";
import type { Product } from "@/types/database";
import { formatPowerRating } from "@/lib/constants";
import { getCoverImage } from "@/lib/search";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";

export default function ProductCard({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber: string;
}) {
  const cover = getCoverImage(product);
  const rating = formatPowerRating(product.power_kw, product.power_hp);
  const waHref = buildProductWhatsAppUrl({
    name: product.name,
    powerKw: product.power_kw,
    powerHp: product.power_hp,
    slug: product.slug,
    whatsappNumber,
  });

  return (
    <article className="group h-full flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:border-[#1C66EB]/40 transition-all duration-300 overflow-hidden">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-4/3 bg-slate-100 overflow-hidden block"
      >
        {cover.url ? (
          <Image
            src={cover.url}
            alt={cover.alt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-[#060A30] via-[#0A0F4E] to-[#1C66EB]/85 p-5 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-blue-100">
                <Cpu className="w-3 h-3 text-[#FACC15]" />
                Q-JEN VFD
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FACC15]">
                Made in India
              </span>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold tracking-tight">
                {rating}
              </div>
              <div className="text-[11px] text-blue-100/80 mt-1">
                Industrial Variable Frequency Drive
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#060A30]/90 backdrop-blur px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-xs">
            {rating}
          </span>
          {product.is_best_seller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FACC15] px-2.5 py-1 text-[11px] font-bold text-[#060A30] shadow-xs">
              <Star className="w-3 h-3 fill-[#060A30]" />
              Best Seller
            </span>
          )}
        </div>
      </Link>

      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${product.slug}`} className="group/title">
            <h3 className="font-display text-base font-bold text-[#0A0F4E] group-hover/title:text-[#1C66EB] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {product.model_code && (
          <div className="mt-1 font-mono text-xs text-slate-500">
            Model: {product.model_code}
          </div>
        )}

        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 flex-1">
          {product.short_description ||
            `Designed & manufactured in Madurai, Tamil Nadu, India.`}
        </p>

        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs font-semibold text-slate-800">
            {product.price !== null ? (
              <span className="text-sm font-bold text-[#0A0F4E]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            ) : (
              <span className="text-slate-500">Quote on WhatsApp</span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-1.5">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1C66EB] hover:text-[#1C66EB] transition-colors"
            >
              Details
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 sm:px-3 sm:py-1.5 text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Buy
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

