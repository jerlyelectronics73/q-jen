"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Loader2, Cpu } from "lucide-react";
import type { SearchResultItem } from "@/types/database";
import { formatPowerRating } from "@/lib/constants";

export default function HeaderSearch({
  mobileFullWidth = false,
  autoFocus = false,
  onNavigate,
}: {
  mobileFullWidth?: boolean;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // Ctrl+K / Cmd+K and "/" global shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
        return;
      }

      if (!isInput && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Debounced instant search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=6`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = (await res.json()) as { results?: SearchResultItem[] };
          setResults(data.results || []);
        }
      } catch {
        // Ignore aborted requests
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      setOpen(false);
      onNavigate?.();
      router.push(`/products/${results[activeIndex].slug}`);
      return;
    }
    const trimmed = query.trim();
    setOpen(false);
    onNavigate?.();
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${mobileFullWidth ? "w-full" : "w-full max-w-[200px] lg:max-w-xs xl:max-w-sm"}`}
    >
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              setOpen(true);
              if (!val.trim()) {
                setResults([]);
                setLoading(false);
                setActiveIndex(-1);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search 15kW, 20HP, model..."
            aria-label="Search Q-JEN VFD products"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/90 pl-9 pr-11 sm:pr-12 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1C66EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20 transition-all"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setResults([]);
                setLoading(false);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="absolute right-1.5 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 absolute right-2.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 pointer-events-none">
              /
            </kbd>
          )}
        </div>
      </form>

      {open && query.trim() !== "" && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-4 flex items-center gap-2.5 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#1C66EB]" />
              Searching Q-JEN drives...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs font-medium text-slate-700">
                No direct match for &ldquo;{query}&rdquo;
              </p>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C66EB] hover:underline py-1"
              >
                Open search & WhatsApp enquiry
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div>
              <ul className="divide-y divide-slate-100 max-h-[55vh] sm:max-h-80 overflow-y-auto">
                {results.map((item, idx) => (
                  <li key={item.id}>
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      className={`flex items-center gap-3 p-3 transition-colors ${
                        idx === activeIndex
                          ? "bg-blue-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative h-11 w-11 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.cover_image_url ? (
                          <Image
                            src={item.cover_image_url}
                            alt={item.cover_image_alt || item.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <Cpu className="w-5 h-5 text-[#1C66EB]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] font-semibold text-[#1C66EB] bg-blue-50 px-2 py-0.5 rounded-full">
                            {formatPowerRating(item.power_kw, item.power_hp)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {item.model_code
                            ? `Model: ${item.model_code}`
                            : "Made in India • Q-JEN VFD"}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center justify-between px-4 py-3 sm:py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-[#1C66EB] hover:bg-blue-50/70 transition-colors"
              >
                <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

