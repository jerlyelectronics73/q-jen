import React from "react";
import SiteHeader from "@/components/public/SiteHeader";
import SiteFooter from "@/components/public/SiteFooter";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteSettings } from "@/lib/data";
import { BRAND, SITE_URL } from "@/lib/constants";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    legalName: BRAND.legalOwner,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madurai",
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
      streetAddress: settings.address,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: `+${settings.whatsapp_number}`,
      areaServed: "IN",
      availableLanguage: ["English", "Tamil"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Q-JEN India",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <SiteHeader whatsappNumber={settings.whatsapp_number} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}

