"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Loader2,
  Package,
} from "lucide-react";
import type { Product } from "@/types/database";
import { formatPowerRating } from "@/lib/constants";
import { getCoverImage } from "@/lib/search";
import { deleteProductAction, toggleProductFlagAction } from "@/app/admin/actions";
import { useToast } from "@/components/ui/ToastProvider";

interface Props {
  initialProducts: Product[];
}

export default function AdminDashboardClient({ initialProducts }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "best"
  >("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "draft" && p.is_active) return false;
      if (statusFilter === "best" && !p.is_best_seller) return false;

      if (!q) return true;
      const haystack = `${p.name} ${p.model_code || ""} ${p.power_kw}kw ${p.power_hp}hp ${p.slug}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.is_active).length,
      draft: products.filter((p) => !p.is_active).length,
      best: products.filter((p) => p.is_best_seller).length,
    }),
    [products]
  );

  async function handleToggle(
    product: Product,
    field: "is_active" | "is_best_seller"
  ) {
    const nextValue = !product[field];
    setBusyId(`${product.id}-${field}`);
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, [field]: nextValue } : item
      )
    );

    const res = await toggleProductFlagAction(product.id, field, nextValue);
    setBusyId(null);

    if (!res.ok) {
      // revert
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, [field]: !nextValue } : item
        )
      );
      showToast(res.error || "Update failed", "error");
      return;
    }

    showToast(
      field === "is_active"
        ? `${product.name} is now ${nextValue ? "Active (Published)" : "Draft (Hidden)"}`
        : `${product.name} ${nextValue ? "marked as Best Seller" : "removed from Best Sellers"}`,
      "success"
    );
    router.refresh();
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setBusyId(`${target.id}-delete`);
    const res = await deleteProductAction(target.id);
    setBusyId(null);
    setConfirmDelete(null);

    if (!res.ok) {
      showToast(res.error || "Failed to delete product", "error");
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== target.id));
    showToast(`Deleted ${target.name}`, "success");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0F4E]">
            VFD Product Catalog
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage ratings, specifications, product photos, and visibility. Draft
            products remain hidden from the public site until activated.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white font-semibold px-4 py-2.5 text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New VFD
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Models", value: counts.total, filter: "all" as const },
          { label: "Active (Live)", value: counts.active, filter: "active" as const },
          { label: "Drafts (Hidden)", value: counts.draft, filter: "draft" as const },
          { label: "Best Sellers", value: counts.best, filter: "best" as const },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => setStatusFilter(card.filter)}
            className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
              statusFilter === card.filter
                ? "border-[#1C66EB] bg-blue-50/70 ring-2 ring-[#1C66EB]/15"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="text-xs font-medium text-slate-500">
              {card.label}
            </div>
            <div className="text-2xl font-bold text-[#0A0F4E] mt-1">
              {card.value}
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, model code, kW or HP..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
          />
        </div>

        <select
          aria-label="Filter products by status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "active" | "draft" | "best")
          }
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-base sm:text-sm font-medium text-slate-700 focus:border-[#1C66EB] focus:outline-none"
        >
          <option value="all">All Statuses ({counts.total})</option>
          <option value="active">Active Only ({counts.active})</option>
          <option value="draft">Draft Only ({counts.draft})</option>
          <option value="best">Best Sellers ({counts.best})</option>
        </select>
      </div>

      {/* Product Table / Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">
            No matching products found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your filter or add a new VFD model.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filtered.map((product) => {
              const cover = getCoverImage(product);
              return (
                <div
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {cover.url ? (
                        <Image
                          src={cover.url}
                          alt={cover.alt || product.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-semibold text-slate-900 hover:text-[#1C66EB] block"
                      >
                        {product.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-semibold text-[#0A0F4E] bg-slate-100 px-2 py-0.5 rounded-md">
                          {formatPowerRating(product.power_kw, product.power_hp)}
                        </span>
                        <span className="text-slate-500">
                          {product.price !== null
                            ? `₹${product.price.toLocaleString("en-IN")}`
                            : "Price on WhatsApp"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {product.model_code
                          ? `Model: ${product.model_code} • `
                          : ""}
                        {product.product_images?.length || 0} photo(s)
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === `${product.id}-is_active`}
                        onClick={() => handleToggle(product, "is_active")}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          product.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {busyId === `${product.id}-is_active` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : product.is_active ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                        {product.is_active ? "Active" : "Draft"}
                      </button>

                      <button
                        type="button"
                        disabled={busyId === `${product.id}-is_best_seller`}
                        onClick={() =>
                          handleToggle(product, "is_best_seller")
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          product.is_best_seller
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {busyId === `${product.id}-is_best_seller` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Star
                            className={`w-3.5 h-3.5 ${
                              product.is_best_seller ? "fill-amber-500" : ""
                            }`}
                          />
                        )}
                        {product.is_best_seller ? "Best" : "Standard"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Model / Price</th>
                  <th className="py-3.5 px-4">Active</th>
                  <th className="py-3.5 px-4">Best Seller</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((product) => {
                  const cover = getCoverImage(product);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {cover.url ? (
                              <Image
                                src={cover.url}
                                alt={cover.alt || product.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-semibold text-slate-900 hover:text-[#1C66EB]"
                            >
                              {product.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              /{product.slug} • {product.product_images?.length || 0} photo(s)
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs font-semibold text-[#0A0F4E]">
                        {formatPowerRating(product.power_kw, product.power_hp)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        <div>
                          {product.model_code ? (
                            <span className="font-medium text-slate-800">
                              {product.model_code}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">
                              No model code
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {product.price !== null
                            ? `₹${product.price.toLocaleString("en-IN")}`
                            : "Price on WhatsApp"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={busyId === `${product.id}-is_active`}
                          onClick={() => handleToggle(product, "is_active")}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                            product.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {busyId === `${product.id}-is_active` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : product.is_active ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                          {product.is_active ? "Active" : "Draft"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={busyId === `${product.id}-is_best_seller`}
                          onClick={() =>
                            handleToggle(product, "is_best_seller")
                          }
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                            product.is_best_seller
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {busyId === `${product.id}-is_best_seller` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Star
                              className={`w-3.5 h-3.5 ${
                                product.is_best_seller ? "fill-amber-500" : ""
                              }`}
                            />
                          )}
                          {product.is_best_seller ? "Best Seller" : "Standard"}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Delete Product?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                {confirmDelete.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === `${confirmDelete.id}-delete`}
                onClick={handleDeleteConfirmed}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
              >
                {busyId === `${confirmDelete.id}-delete` && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

