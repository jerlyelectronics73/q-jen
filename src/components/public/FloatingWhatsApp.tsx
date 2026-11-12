"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";

export default function FloatingWhatsApp({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const pathname = usePathname();
  const href = buildGeneralEnquiryWhatsAppUrl({ whatsappNumber });
  const isProductDetail =
    pathname.startsWith("/products/") && pathname !== "/products";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Q-JEN on WhatsApp"
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:right-5 z-40 group items-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 shadow-xl shadow-emerald-950/25 ring-4 ring-white/80 transition-all hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1C66EB] ${
        isProductDetail ? "hidden sm:inline-flex" : "inline-flex"
      }`}
    >
      <MessageCircle className="w-5 h-5 fill-white/15" />
      <span className="hidden sm:inline text-sm font-semibold pr-1">
        WhatsApp Us
      </span>
    </a>
  );
}

