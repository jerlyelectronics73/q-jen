"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductSpecRow } from "@/types/database";

async function requireAdminClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Unauthorized: Admin session required.");
  }
  return supabase;
}

function revalidatePublicCatalog(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function signOutAdmin() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function toggleProductFlagAction(
  id: string,
  field: "is_active" | "is_best_seller",
  value: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update({ [field]: value })
      .eq("id", id)
      .select("slug")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePublicCatalog(data?.slug);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to update product.",
    };
  }
}

export interface ProductPayloadInput {
  id?: string;
  name: string;
  slug: string;
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
  images: Array<{
    id?: string;
    image_url: string;
    alt_text: string;
    sort_order: number;
    is_cover: boolean;
  }>;
}

export async function saveProductAction(
  payload: ProductPayloadInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const supabase = await requireAdminClient();

    const cleanSpecs = (payload.specs || []).filter(
      (r) => r.key.trim() !== "" || r.value.trim() !== ""
    );
    const cleanFeatures = (payload.features || [])
      .map((f) => f.trim())
      .filter(Boolean);

    const record = {
      name: payload.name.trim(),
      slug: payload.slug.trim().toLowerCase(),
      model_code: payload.model_code?.trim() || null,
      power_kw: Number(payload.power_kw),
      power_hp: Number(payload.power_hp),
      short_description: payload.short_description.trim(),
      description: payload.description.trim(),
      specs: cleanSpecs,
      features: cleanFeatures,
      is_best_seller: Boolean(payload.is_best_seller),
      is_active: Boolean(payload.is_active),
      display_order: Number(payload.display_order) || 0,
      price:
        payload.price !== null &&
        payload.price !== undefined &&
        !Number.isNaN(Number(payload.price))
          ? Number(payload.price)
          : null,
      seo_title: payload.seo_title?.trim() || null,
      seo_description: payload.seo_description?.trim() || null,
    };

    let productId = payload.id;

    if (productId) {
      const { error } = await supabase
        .from("products")
        .update(record)
        .eq("id", productId);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(record)
        .select("id")
        .single();
      if (error) return { ok: false, error: error.message };
      productId = data.id;
    }

    if (productId) {
      // Sync product_images cleanly
      await supabase
        .from("product_images")
        .delete()
        .eq("product_id", productId);

      const images = (payload.images || []).filter((img) =>
        img.image_url.trim()
      );
      if (images.length > 0) {
        const hasCover = images.some((img) => img.is_cover);
        const rowsToInsert = images.map((img, idx) => ({
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt_text.trim() || `${record.name} image ${idx + 1}`,
          sort_order: idx,
          is_cover: hasCover ? Boolean(img.is_cover) : idx === 0,
        }));
        const { error: imgErr } = await supabase
          .from("product_images")
          .insert(rowsToInsert);
        if (imgErr) return { ok: false, error: imgErr.message };
      }
    }

    revalidatePublicCatalog(record.slug);
    revalidatePath("/admin");
    return { ok: true, id: productId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save product.",
    };
  }
}

export async function deleteProductAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidatePublicCatalog(existing?.slug);
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to delete product.",
    };
  }
}

export interface SiteSettingsInput {
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
}

export async function saveSiteSettingsAction(
  input: SiteSettingsInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await requireAdminClient();
    const digits = input.whatsapp_number.replace(/\D/g, "");
    if (digits.length < 10) {
      return {
        ok: false,
        error: "Please enter a valid WhatsApp number with country code (e.g. 919843334303).",
      };
    }

    const { error } = await supabase.from("site_settings").upsert(
      {
        id: 1,
        whatsapp_number: digits,
        hero_headline: input.hero_headline.trim(),
        hero_subtext: input.hero_subtext.trim(),
        trust_badge_1: input.trust_badge_1.trim(),
        trust_badge_2: input.trust_badge_2.trim(),
        trust_badge_3: input.trust_badge_3.trim(),
        trust_badge_4: input.trust_badge_4.trim(),
        trust_badge_5: input.trust_badge_5.trim(),
        contact_email: input.contact_email.trim(),
        address: input.address.trim(),
      },
      { onConflict: "id" }
    );

    if (error) return { ok: false, error: error.message };

    revalidatePublicCatalog();
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }
}

