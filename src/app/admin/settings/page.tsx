import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/fallback-data";
import SiteSettingsClient from "@/components/admin/SiteSettingsClient";
import type { SiteSettings } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  const settings: SiteSettings = data
    ? { ...DEFAULT_SITE_SETTINGS, ...data }
    : DEFAULT_SITE_SETTINGS;

  return <SiteSettingsClient initialSettings={settings} />;
}

