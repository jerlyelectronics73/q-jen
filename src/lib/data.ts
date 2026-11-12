import { createPublicSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_SITE_SETTINGS,
  FALLBACK_PREVIEW_PRODUCTS,
} from "@/lib/fallback-data";
import { normalizeSearchQuery, rankProductsSearch } from "@/lib/search";
import type {
  Product,
  ProductImage,
  ProductSpecRow,
  SearchResultItem,
  SiteSettings,
} from "@/types/database";

function normalizeProduct(row: Record<string, unknown>): Product {
  const rawSpecs = Array.isArray(row.specs) ? row.specs : [];
  const specs: ProductSpecRow[] = rawSpecs
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      key: String(item.key ?? ""),
      value: String(item.value ?? ""),
    }))
    .filter((item) => item.key.trim() !== "" || item.value.trim() !== "");

  const rawImages = Array.isArray(row.product_images) ? row.product_images : [];
  const product_images: ProductImage[] = rawImages
    .filter(
      (img): img is Record<string, unknown> =>
        Boolean(img) && typeof img === "object"
    )
    .map((img) => ({
      id: String(img.id),
      product_id: String(img.product_id),
      image_url: String(img.image_url),
      alt_text: String(img.alt_text ?? ""),
      sort_order: Number(img.sort_order ?? 0),
      is_cover: Boolean(img.is_cover),
      created_at: img.created_at ? String(img.created_at) : undefined,
    }))
    .sort((a, b) => {
      if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
      return a.sort_order - b.sort_order;
    });

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    model_code: row.model_code ? String(row.model_code) : null,
    power_kw: Number(row.power_kw),
    power_hp: Number(row.power_hp),
    short_description: String(row.short_description ?? ""),
    description: String(row.description ?? ""),
    specs,
    features: Array.isArray(row.features) ? row.features.map(String) : [],
    is_best_seller: Boolean(row.is_best_seller),
    is_active: Boolean(row.is_active),
    display_order: Number(row.display_order ?? 0),
    price:
      row.price !== null && row.price !== undefined ? Number(row.price) : null,
    seo_title: row.seo_title ? String(row.seo_title) : null,
    seo_description: row.seo_description ? String(row.seo_description) : null,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
    product_images,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return DEFAULT_SITE_SETTINGS;

  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) return FALLBACK_PREVIEW_PRODUCTS;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("power_kw", { ascending: true });

    if (error || !data) return [];
    return data.map((row) => normalizeProduct(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getBestSellerProducts(): Promise<Product[]> {
  const products = await getActiveProducts();
  const best = products.filter((p) => p.is_best_seller);
  return best.length > 0 ? best : products.slice(0, 4);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return FALLBACK_PREVIEW_PRODUCTS.find((p) => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return normalizeProduct(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const all = await getActiveProducts();
  return all
    .filter((p) => p.id !== product.id)
    .sort(
      (a, b) =>
        Math.abs(a.power_kw - product.power_kw) -
        Math.abs(b.power_kw - product.power_kw)
    )
    .slice(0, limit);
}

export async function searchActiveProducts(
  query: string,
  limit = 30
): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  const activeProducts = await getActiveProducts();
  if (!trimmed) {
    return rankProductsSearch(activeProducts, "", limit);
  }

  const supabase = createPublicSupabaseClient();
  const clientRanked = rankProductsSearch(activeProducts, trimmed, limit);

  if (!supabase) {
    return clientRanked;
  }

  try {
    // Also query Postgres FTS + pg_trgm RPC and merge any fuzzy matches missed
    const normQ = normalizeSearchQuery(trimmed);
    const { data: rpcRows } = await supabase.rpc("search_products", {
      search_query: normQ || trimmed,
      include_inactive: false,
      result_limit: limit,
    });

    if (!rpcRows || !Array.isArray(rpcRows) || rpcRows.length === 0) {
      return clientRanked;
    }

    const byId = new Map<string, SearchResultItem>();
    for (const item of clientRanked) {
      byId.set(item.id, item);
    }

    const activeById = new Map(activeProducts.map((p) => [p.id, p]));
    for (const row of rpcRows as Array<Record<string, unknown>>) {
      const id = String(row.id);
      if (byId.has(id)) continue;
      const full = activeById.get(id);
      const cover = full?.product_images?.[0];
      byId.set(id, {
        id,
        slug: String(row.slug),
        name: String(row.name),
        model_code: row.model_code ? String(row.model_code) : null,
        power_kw: Number(row.power_kw),
        power_hp: Number(row.power_hp),
        short_description: String(row.short_description ?? ""),
        is_best_seller: Boolean(row.is_best_seller),
        is_active: Boolean(row.is_active),
        display_order: Number(row.display_order ?? 0),
        price:
          row.price !== null && row.price !== undefined
            ? Number(row.price)
            : null,
        cover_image_url: cover?.image_url || null,
        cover_image_alt: cover?.alt_text || String(row.name),
        relevance_score: Number(row.relevance_score ?? 10),
        match_type: "fuzzy",
      });
    }

    return Array.from(byId.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
  } catch {
    return clientRanked;
  }
}

