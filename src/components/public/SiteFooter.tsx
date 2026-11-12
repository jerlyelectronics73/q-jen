import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/types/database";
import { BRAND } from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const waUrl = buildGeneralEnquiryWhatsAppUrl({
    whatsappNumber: settings.whatsapp_number,
  });

  return (
    <footer className="bg-[#060A30] text-slate-300 border-t border-blue-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Q-JEN Logo"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div>
                <div className="font-display text-xl font-bold text-white">
                  Q-JEN
                </div>
                <div className="text-xs font-medium text-[#FACC15]">
                  100% Made in India VFDs
                </div>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-300/90">
              Designed and manufactured in Madurai, Tamil Nadu by{" "}
              <strong className="text-white">{BRAND.legalOwner}</strong>. Trade
              Mark No. {BRAND.trademarkNumber}.
            </p>
            <div className="inline-flex flex-wrap items-center gap-2 max-w-full rounded-lg border border-blue-700/60 bg-blue-950/60 px-3 py-1.5 text-[11px] font-medium text-blue-100">
              <ShieldCheck className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span className="break-words">
                QCI Verified (VA-066652125097175) • GeM OEM
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  All VFD Drives (15kW – 220kW)
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Search by Rating / Model
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  About Jerly Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-block py-0.5 hover:text-white transition-colors"
                >
                  Contact & Direct Enquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Ratings */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Popular Ratings
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Q-JEN 15kW / 20HP VFD", slug: "q-jen-15kw-20hp-vfd" },
                { label: "Q-JEN 22kW / 30HP VFD", slug: "q-jen-22kw-30hp-vfd" },
                { label: "Q-JEN 37kW / 50HP VFD", slug: "q-jen-37kw-50hp-vfd" },
                { label: "Q-JEN 75kW / 100HP VFD", slug: "q-jen-75kw-100hp-vfd" },
                { label: "Q-JEN 110kW / 150HP VFD", slug: "q-jen-110kw-150hp-vfd" },
                { label: "Q-JEN 220kW / 300HP VFD", slug: "q-jen-220kw-300hp-vfd" },
              ].map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/products/${item.slug}`}
                    className="inline-block py-0.5 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3 text-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white mb-4">
              Direct Manufacturer Desk
            </h3>
            <div className="flex items-start gap-2.5 text-xs leading-relaxed">
              <MapPin className="w-4 h-4 text-[#336DFD] shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs">
              <Mail className="w-4 h-4 text-[#336DFD] shrink-0 mt-0.5" />
              <span className="break-all">{settings.contact_email}</span>
            </div>
            <div className="pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {BRAND.legalOwner} • Q-JEN™ India. All
            rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-6 rounded-full tricolor-stripe" />
            Proudly Designed & Manufactured in Madurai, India
          </p>
        </div>
      </div>
    </footer>
  );
}

