import { DEFAULT_WHATSAPP_NUMBER, SITE_URL, formatPowerRating } from "./constants";

export function normalizeWhatsAppNumber(raw?: string | null): string {
  const digits = (raw || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : DEFAULT_WHATSAPP_NUMBER;
}

export function buildWhatsAppUrl(
  message: string,
  whatsappNumber?: string | null
): string {
  const phone = normalizeWhatsAppNumber(whatsappNumber);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(params: {
  name: string;
  powerKw: number;
  powerHp: number;
  slug: string;
  whatsappNumber?: string | null;
  siteUrl?: string;
}): string {
  let baseUrl = (params.siteUrl || SITE_URL).replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    const locOrigin = window.location.origin.replace(/\/+$/, "");
    if (!locOrigin.includes("localhost") && !locOrigin.includes("127.0.0.1")) {
      baseUrl = locOrigin;
    }
  }
  const productUrl = `${baseUrl}/products/${params.slug}`;
  const rating = formatPowerRating(params.powerKw, params.powerHp);
  const message = `Hello Q-JEN, I am interested in the ${params.name} (${rating}). Product link: ${productUrl}. Please share price and availability.`;
  return buildWhatsAppUrl(message, params.whatsappNumber);
}

export function buildGeneralEnquiryWhatsAppUrl(params?: {
  topic?: string;
  whatsappNumber?: string | null;
}): string {
  const topic = params?.topic?.trim();
  const message = topic
    ? `Hello Q-JEN, I would like to enquire about: ${topic}. Please share details and availability.`
    : `Hello Q-JEN, I would like to enquire about your Made-in-India Variable Frequency Drives (VFDs). Please share details and pricing.`;
  return buildWhatsAppUrl(message, params?.whatsappNumber);
}

