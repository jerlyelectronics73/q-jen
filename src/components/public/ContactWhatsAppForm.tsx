"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { POWER_RATING_CHIPS } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default function ContactWhatsAppForm({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState("15kW / 20HP");
  const [application, setApplication] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = [
      `Hello Q-JEN Team, I would like to enquire about a Variable Frequency Drive.`,
      name.trim() ? `Name: ${name.trim()}` : null,
      company.trim() ? `Company / City: ${company.trim()}` : null,
      `Required Rating: ${rating}`,
      application.trim() ? `Application / Machine: ${application.trim()}` : null,
      notes.trim() ? `Message: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const url = buildWhatsAppUrl(lines, whatsappNumber);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4"
    >
      <h2 className="font-display text-xl font-bold text-[#0A0F4E]">
        Quick WhatsApp Enquiry Form
      </h2>
      <p className="text-xs text-slate-600">
        Fill in your motor rating and machine requirement — this opens WhatsApp
        directly with your enquiry pre-formatted for fast response.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="contact-company"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Company / City
          </label>
          <input
            id="contact-company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Madurai / Coimbatore"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="contact-rating"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            VFD Power Rating
          </label>
          <select
            id="contact-rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
          >
            {POWER_RATING_CHIPS.map((c) => (
              <option key={c.kw} value={c.label}>
                {c.label}
              </option>
            ))}
            <option value="Custom / Multiple Ratings">
              Custom / Multiple Ratings
            </option>
          </select>
        </div>
        <div>
          <label
            htmlFor="contact-app"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Application / Load Type
          </label>
          <input
            id="contact-app"
            type="text"
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            placeholder="e.g. Pump, Blower, Conveyor, Textile"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-notes"
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          Additional Details
        </label>
        <textarea
          id="contact-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Quantity, delivery location, or technical questions..."
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 text-sm shadow-sm transition-colors cursor-pointer"
      >
        <MessageCircle className="w-4 h-4" />
        Send Enquiry on WhatsApp
      </button>
    </form>
  );
}

