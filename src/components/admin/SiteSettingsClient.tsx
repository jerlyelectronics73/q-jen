"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Phone, Sparkles, ShieldCheck, Mail } from "lucide-react";
import type { SiteSettings } from "@/types/database";
import { saveSiteSettingsAction } from "@/app/admin/actions";
import { useToast } from "@/components/ui/ToastProvider";

export default function SiteSettingsClient({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [whatsappNumber, setWhatsappNumber] = useState(
    initialSettings.whatsapp_number
  );
  const [heroHeadline, setHeroHeadline] = useState(
    initialSettings.hero_headline
  );
  const [heroSubtext, setHeroSubtext] = useState(initialSettings.hero_subtext);
  const [trust1, setTrust1] = useState(initialSettings.trust_badge_1);
  const [trust2, setTrust2] = useState(initialSettings.trust_badge_2);
  const [trust3, setTrust3] = useState(initialSettings.trust_badge_3);
  const [trust4, setTrust4] = useState(initialSettings.trust_badge_4);
  const [trust5, setTrust5] = useState(initialSettings.trust_badge_5);
  const [contactEmail, setContactEmail] = useState(
    initialSettings.contact_email
  );
  const [address, setAddress] = useState(initialSettings.address);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await saveSiteSettingsAction({
      whatsapp_number: whatsappNumber,
      hero_headline: heroHeadline,
      hero_subtext: heroSubtext,
      trust_badge_1: trust1,
      trust_badge_2: trust2,
      trust_badge_3: trust3,
      trust_badge_4: trust4,
      trust_badge_5: trust5,
      contact_email: contactEmail,
      address,
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.error || "Failed to save settings", "error");
      return;
    }

    showToast("Site settings saved and public pages refreshed", "success");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          aria-label="Back to admin"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F4E]">Site Settings</h1>
          <p className="text-xs text-slate-500">
            Update WhatsApp enquiry number, hero messaging, trust strip badges,
            and official contact info.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#0A0F4E]">
            <Phone className="w-4 h-4 text-[#1C66EB]" />
            WhatsApp Sales Channel
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              WhatsApp Number (Country code + number, digits only)
            </label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="919843334303"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm font-mono focus:border-[#1C66EB] focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Used across all &ldquo;Buy on WhatsApp&rdquo;, &ldquo;Get Price&rdquo;, and floating WhatsApp buttons.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#0A0F4E]">
            <Sparkles className="w-4 h-4 text-[#1C66EB]" />
            Hero Section Copy
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hero Headline
            </label>
            <input
              type="text"
              required
              value={heroHeadline}
              onChange={(e) => setHeroHeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hero Subtext
            </label>
            <textarea
              rows={3}
              required
              value={heroSubtext}
              onChange={(e) => setHeroSubtext(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#0A0F4E]">
            <ShieldCheck className="w-4 h-4 text-[#1C66EB]" />
            Trust Strip Badges (5 items)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Badge 1", val: trust1, set: setTrust1 },
              { label: "Badge 2", val: trust2, set: setTrust2 },
              { label: "Badge 3", val: trust3, set: setTrust3 },
              { label: "Badge 4", val: trust4, set: setTrust4 },
              { label: "Badge 5", val: trust5, set: setTrust5 },
            ].map((item) => (
              <div key={item.label}>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {item.label}
                </label>
                <input
                  type="text"
                  required
                  value={item.val}
                  onChange={(e) => item.set(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1C66EB] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-[#0A0F4E]">
            <Mail className="w-4 h-4 text-[#1C66EB]" />
            Contact Details & Factory Address
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official Contact Email
            </label>
            <input
              type="text"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="sales@yourdomain.com"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Factory / Seller Address
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Madurai, Tamil Nadu, India"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white font-semibold px-6 py-3 sm:py-2.5 text-sm shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving Settings..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

