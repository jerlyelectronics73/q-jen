"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ZoomIn, X, Cpu } from "lucide-react";
import type { ProductImage } from "@/types/database";
import { formatPowerRating } from "@/lib/constants";

export default function ProductGallery({
  images,
  productName,
  powerKw,
  powerHp,
}: {
  images: ProductImage[];
  productName: string;
  powerKw: number;
  powerHp: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!zoomOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomOpen]);

  const activeImage = images[selectedIndex] || null;
  const rating = formatPowerRating(powerKw, powerHp);

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-[#060A30] via-[#0A0F4E] to-[#1C66EB] p-8 sm:p-10 aspect-square sm:aspect-4/3 flex flex-col justify-between text-white shadow-lg">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-blue-100">
            <Cpu className="w-4 h-4 text-[#FACC15]" />
            Q-JEN INDIA
          </span>
          <span className="rounded-full bg-[#FACC15] px-3 py-1 text-xs font-bold text-[#060A30]">
            100% Made in India
          </span>
        </div>

        <div className="my-auto py-8 text-center">
          <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight">
            {rating}
          </div>
          <div className="mt-2 font-display text-lg text-blue-100">
            {productName}
          </div>
          <p className="mt-3 text-xs text-blue-200/80 max-w-xs mx-auto">
            Product photos can be uploaded from the Admin Console. Tap Buy on
            WhatsApp for real unit photos & enclosure dimensions.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-blue-100/80 border-t border-white/15 pt-4">
          <span>Madurai, Tamil Nadu</span>
          <span>1-Year Flexible Warranty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-4/3 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm group">
        <Image
          src={activeImage!.image_url}
          alt={activeImage!.alt_text || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          aria-label="Zoom product image"
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white px-3 py-1.5 text-xs font-medium backdrop-blur cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
          Zoom
        </button>
      </div>

      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-20 w-20 rounded-xl border-2 overflow-hidden bg-white shrink-0 transition-all cursor-pointer ${
                idx === selectedIndex
                  ? "border-[#1C66EB] ring-2 ring-[#1C66EB]/25"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom view"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 rounded-full bg-white/15 hover:bg-white/25 text-white p-3 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl h-[70vh] sm:h-[80vh] rounded-2xl bg-white overflow-hidden"
          >
            <Image
              src={activeImage.image_url}
              alt={activeImage.alt_text || productName}
              fill
              sizes="(max-width: 640px) 95vw, 90vw"
              className="object-contain p-3 sm:p-4"
            />
          </div>
        </div>
      )}
    </div>
  );
}

