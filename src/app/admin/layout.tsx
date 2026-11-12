import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { signOutAdmin } from "./actions";

export const metadata: Metadata = {
  title: {
    default: "Admin Console | Q-JEN",
    template: "%s | Q-JEN Admin",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  let adminLabel: string | null = null;

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const metaName =
        typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null;
      adminLabel =
        metaName ||
        user.email?.replace(/@admin\.qjen\.local$/i, "") ||
        "Admin";
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {adminLabel && (
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-4 lg:gap-6 min-w-0">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 sm:gap-2.5 font-bold text-[#0A0F4E] shrink-0"
                >
                  <Image
                    src="/logo.png"
                    alt="Q-JEN Logo"
                    width={36}
                    height={36}
                    className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
                  />
                  <span className="tracking-tight text-sm sm:text-base">
                    Q-JEN Admin
                  </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-700 hover:text-[#1C66EB] hover:bg-blue-50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Products
                  </Link>
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-700 hover:text-[#1C66EB] hover:bg-blue-50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Product
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-700 hover:text-[#1C66EB] hover:bg-blue-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Site Settings
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="hidden sm:inline text-xs font-medium text-slate-600 truncate max-w-[160px]">
                  {adminLabel}
                </span>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Public Site</span>
                  <span className="sm:hidden">Site</span>
                </Link>
                <form action={signOutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </form>
              </div>
            </div>

            {/* Mobile Admin Nav */}
            <div className="md:hidden border-t border-slate-100 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs font-medium">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Products
              </Link>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Product
              </Link>
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
            </div>
          </header>
        )}

        <main className="flex-1">{children}</main>
      </div>
    </ToastProvider>
  );
}

