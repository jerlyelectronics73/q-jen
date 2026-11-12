import type { Product, SiteSettings } from "@/types/database";
import {
  DEFAULT_WHATSAPP_NUMBER,
  POWER_RATING_CHIPS,
  VERIFIED_DEFAULT_FEATURES,
  VERIFIED_PRODUCT_DESCRIPTION,
  slugifyProductName,
} from "./constants";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
  hero_headline: "Precision Indian-Made VFDs Built for Industrial Endurance",
  hero_subtext:
    "Designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services — Quality Council of India Verified Manufacturer & GeM OEM Registered VFD Seller.",
  trust_badge_1: "100% Trust",
  trust_badge_2: "Made in India",
  trust_badge_3: "Proud to be an Indian Product",
  trust_badge_4: "Quality Tested",
  trust_badge_5: "Direct from Manufacturer/Seller",
  contact_email: "[Add official contact email in Admin Settings]",
  address:
    "Madurai, Tamil Nadu, India [Add full factory street address in Admin Settings]",
};

/**
 * Local fallback catalog used ONLY when Supabase environment variables are not
 * yet configured (e.g. first-run local preview before connecting Supabase).
 * Once NEXT_PUBLIC_SUPABASE_URL & NEXT_PUBLIC_SUPABASE_ANON_KEY are set,
 * public pages strictly query active products from Supabase.
 */
export const FALLBACK_PREVIEW_PRODUCTS: Product[] = POWER_RATING_CHIPS.map(
  (chip, idx) => {
    const name = `Q-JEN ${chip.label} VFD`;
    const slug = slugifyProductName(name);
    return {
      id: `preview-${idx + 1}`,
      slug,
      name,
      model_code: null,
      power_kw: chip.kw,
      power_hp: chip.hp,
      short_description: `Indian-made ${chip.label} Variable Frequency Drive designed and manufactured in Madurai, Tamil Nadu. [Edit model summary & specs in Admin]`,
      description: VERIFIED_PRODUCT_DESCRIPTION,
      specs: [],
      features: VERIFIED_DEFAULT_FEATURES,
      is_best_seller: idx < 4,
      is_active: true,
      display_order: idx + 1,
      price: null,
      seo_title: `${name} | Made in India AC Drive — Q-JEN`,
      seo_description: `Buy ${name} direct from Jerly Electronics and Cooling Services, Madurai, India. QCI Verified Manufacturer & GeM OEM Registered Seller with one year flexible warranty.`,
      product_images: [],
    };
  }
);

