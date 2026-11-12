import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return <ProductFormClient />;
}

