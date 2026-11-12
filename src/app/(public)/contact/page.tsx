import type { Metadata } from "next";
import { MapPin, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { BRAND, SITE_URL } from "@/lib/constants";
import { buildGeneralEnquiryWhatsAppUrl } from "@/lib/whatsapp";
import ContactWhatsAppForm from "@/components/public/ContactWhatsAppForm";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact Q-JEN | Direct VFD Manufacturer Enquiry (Madurai, India)",
  description:
    "Contact Jerly Electronics and Cooling Services in Madurai, Tamil Nadu for Q-JEN Variable Frequency Drive pricing, availability, and technical support via WhatsApp.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const waUrl = buildGeneralEnquiryWhatsAppUrl({
    whatsappNumber: settings.whatsapp_number,
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-[#1C66EB] mb-2">
            Direct Seller & Manufacturer Support
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0F4E]">
            Contact Q-JEN India
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            No call centers or middlemen — connect directly with Jerly
            Electronics and Cooling Services in Madurai, Tamil Nadu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#0A0F4E]">
                    WhatsApp Sales Desk
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Fastest way to get model pricing, lead time, and technical advice.
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm font-bold text-emerald-700 hover:underline"
                  >
                    +{settings.whatsapp_number} — Open Chat
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1C66EB] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#0A0F4E]">
                    Manufacturing Premises
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {BRAND.legalOwner}
                    <br />
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#1C66EB] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-[#0A0F4E]">
                    Email
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 break-all">
                    {settings.contact_email}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-start gap-2.5 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#1C66EB] shrink-0 mt-0.5" />
                <span>
                  QCI Verified Manufacturer (Report {BRAND.qciReportNumber}) •
                  GeM OEM Registered VFD Seller • Trade Mark No.{" "}
                  {BRAND.trademarkNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactWhatsAppForm whatsappNumber={settings.whatsapp_number} />
          </div>
        </div>
      </div>
    </div>
  );
}

