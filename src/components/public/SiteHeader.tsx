"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Search } from "lucide-react";
import HeaderSearch from "./HeaderSearch";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";

export default function SiteHeader({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const pathname = usePathname();
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null);
  const [openSearchPath, setOpenSearchPath] = useState<string | null>(null);
  const mobileOpen = openMenuPath === pathname;
  const mobileSearchOpen = openSearchPath === pathname;
  const waHref = buildGeneralEnquiryWhatsAppUrl({ whatsappNumber });

  const setMobileOpen = (open: boolean) => {
    setOpenMenuPath(open ? pathname : null);
  };

  const setMobileSearchOpen = (open: boolean) => {
    setOpenSearchPath(open ? pathname : null);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  function isActiveLink(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
      <div className="h-1 tricolor-stripe w-full" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1C66EB] rounded-lg"
        >
          <Image
            src="/logo.png"
            alt="Q-JEN India Logo"
            width={42}
            height={42}
            priority
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
          />
          <div className="leading-tight">
            <span className="block font-display text-base sm:text-lg font-bold tracking-tight text-[#0A0F4E]">
              Q-JEN
            </span>
            <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#1C66EB]">
              Made in India VFDs
            </span>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-0.5 lg:gap-1"
        >
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 lg:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-blue-50 text-[#1C66EB] font-semibold"
                    : "text-slate-700 hover:text-[#1C66EB] hover:bg-blue-50/80"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2.5 lg:gap-3 flex-1 justify-end max-w-sm lg:max-w-md">
          <HeaderSearch />
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 lg:px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden lg:inline">WhatsApp</span>
            <span className="lg:hidden">Chat</span>
          </a>
        </div>

        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              setMobileOpen(false);
            }}
            aria-label={mobileSearchOpen ? "Close search" : "Search VFDs"}
            aria-expanded={mobileSearchOpen}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              mobileSearchOpen
                ? "border-[#1C66EB] bg-blue-50 text-[#1C66EB]"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setMobileSearchOpen(false);
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              mobileOpen
                ? "border-[#1C66EB] bg-blue-50 text-[#1C66EB]"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quick Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3">
          <HeaderSearch
            mobileFullWidth
            autoFocus
            onNavigate={() => setMobileSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 max-h-[calc(100dvh-4.25rem)] overflow-y-auto shadow-lg">
          <HeaderSearch
            mobileFullWidth
            onNavigate={() => setMobileOpen(false)}
          />
          <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2.5">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`min-h-[44px] flex items-center rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[#1C66EB] bg-blue-50 text-[#1C66EB]"
                      : "border-slate-200 text-slate-800 hover:border-[#1C66EB] hover:text-[#1C66EB]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Q-JEN on WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}

