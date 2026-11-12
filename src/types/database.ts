export interface ProductSpecRow {
  key: string;
  value: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  model_code: string | null;
  power_kw: number;
  power_hp: number;
  short_description: string;
  description: string;
  specs: ProductSpecRow[];
  features: string[];
  is_best_seller: boolean;
  is_active: boolean;
  display_order: number;
  price: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string;
  updated_at?: string;
  product_images?: ProductImage[];
}

export interface SiteSettings {
  id: number;
  whatsapp_number: string;
  hero_headline: string;
  hero_subtext: string;
  trust_badge_1: string;
  trust_badge_2: string;
  trust_badge_3: string;
  trust_badge_4: string;
  trust_badge_5: string;
  contact_email: string;
  address: string;
  updated_at?: string;
}

export interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  model_code: string | null;
  power_kw: number;
  power_hp: number;
  short_description: string;
  is_best_seller: boolean;
  is_active: boolean;
  display_order: number;
  price: number | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  relevance_score: number;
  match_type: "exact" | "partial" | "fuzzy";
}

