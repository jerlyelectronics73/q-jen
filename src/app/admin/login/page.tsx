"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertTriangle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!configured) {
      setErrorMsg(
        "Supabase environment variables are not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    const cleanId = userId.trim();
    if (!cleanId) {
      setErrorMsg("Please enter your Admin User ID.");
      return;
    }

    const resolvedEmail = cleanId.includes("@")
      ? cleanId.toLowerCase()
      : `${cleanId.toLowerCase()}@admin.qjen.local`;

    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      });

      if (error) {
        setErrorMsg(
          error.message.toLowerCase().includes("invalid")
            ? "Invalid User ID or password."
            : error.message
        );
        setLoading(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unable to sign in right now."
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060A30] flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/logo.png"
            alt="Q-JEN Logo"
            width={72}
            height={72}
            className="mb-3"
          />
          <h1 className="text-2xl font-bold text-[#0A0F4E]">
            Q-JEN Seller Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Restricted to authorized store administrator
          </p>
        </div>

        {!configured && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Supabase Not Connected</p>
              <p className="mt-0.5 leading-relaxed">
                Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
                <code>.env.local</code>, run <code>supabase/schema.sql</code>,
                and create your admin user in Supabase Authentication.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-userid"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-userid"
                type="text"
                required
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your User ID"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white font-semibold py-2.5 px-4 text-sm transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

