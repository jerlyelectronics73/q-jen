import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductFormClient from "@/components/admin/ProductFormClient";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const product: Product = {
    ...data,
    specs: Array.isArray(data.specs) ? data.specs : [],
    features: Array.isArray(data.features) ? data.features : [],
    product_images: Array.isArray(data.product_images)
      ? [...data.product_images].sort((a, b) => a.sort_order - b.sort_order)
      : [],
  };

  return <ProductFormClient initialProduct={product} />;
}

