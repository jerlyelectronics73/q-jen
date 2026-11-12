import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("display_order", { ascending: true })
    .order("power_kw", { ascending: true });

  const products: Product[] = (data || []).map((row) => ({
    ...row,
    specs: Array.isArray(row.specs) ? row.specs : [],
    features: Array.isArray(row.features) ? row.features : [],
    product_images: Array.isArray(row.product_images) ? row.product_images : [],
  }));

  return <AdminDashboardClient initialProducts={products} />;
}

