"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  UploadCloud,
  ArrowUp,
  ArrowDown,
  Star,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { Product, ProductSpecRow } from "@/types/database";
import {
  VERIFIED_DEFAULT_FEATURES,
  VERIFIED_PRODUCT_DESCRIPTION,
  slugifyProductName,
} from "@/lib/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { useToast } from "@/components/ui/ToastProvider";

interface EditableImage {
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  is_cover: boolean;
}

interface Props {
  initialProduct?: Product | null;
}

export default function ProductFormClient({ initialProduct }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(initialProduct?.id);

  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialProduct?.slug));

  const [powerKw, setPowerKw] = useState(
    initialProduct?.power_kw ? String(initialProduct.power_kw) : ""
  );
  const [powerHp, setPowerHp] = useState(
    initialProduct?.power_hp ? String(initialProduct.power_hp) : ""
  );
  const [modelCode, setModelCode] = useState(initialProduct?.model_code || "");
  const [displayOrder, setDisplayOrder] = useState(
    String(initialProduct?.display_order ?? 0)
  );
  const [price, setPrice] = useState(
    initialProduct?.price !== null && initialProduct?.price !== undefined
      ? String(initialProduct.price)
      : ""
  );

  const [shortDescription, setShortDescription] = useState(
    initialProduct?.short_description || ""
  );
  const [description, setDescription] = useState(
    initialProduct?.description || VERIFIED_PRODUCT_DESCRIPTION
  );
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  const [features, setFeatures] = useState<string[]>(
    initialProduct?.features && initialProduct.features.length > 0
      ? initialProduct.features
      : VERIFIED_DEFAULT_FEATURES
  );
  const [specs, setSpecs] = useState<ProductSpecRow[]>(
    initialProduct?.specs && initialProduct.specs.length > 0
      ? initialProduct.specs
      : []
  );

  const [images, setImages] = useState<EditableImage[]>(
    (initialProduct?.product_images || []).map((img, i) => ({
      id: img.id,
      image_url: img.image_url,
      alt_text: img.alt_text,
      sort_order: img.sort_order ?? i,
      is_cover: img.is_cover,
    }))
  );

  const [isActive, setIsActive] = useState(
    initialProduct ? initialProduct.is_active : false
  );
  const [isBestSeller, setIsBestSeller] = useState(
    initialProduct ? initialProduct.is_best_seller : false
  );

  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seo_description || ""
  );
  const [seoTouched, setSeoTouched] = useState(
    Boolean(initialProduct?.seo_title || initialProduct?.seo_description)
  );

  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function syncAutoFields(nextName: string) {
    if (!slugTouched) {
      setSlug(slugifyProductName(nextName));
    }
    if (!seoTouched && nextName.trim()) {
      setSeoTitle(`${nextName.trim()} | Made in India AC Drive — Q-JEN`);
      setSeoDescription(
        `Buy ${nextName.trim()} direct from Jerly Electronics and Cooling Services, Madurai, India. QCI Verified Manufacturer & GeM OEM Registered Seller with one year flexible warranty.`
      );
    }
  }

  function handleNameChange(val: string) {
    setName(val);
    syncAutoFields(val);
  }

  function regenerateSeo() {
    const cleanName = name.trim() || "Q-JEN VFD";
    setSlug(slugifyProductName(cleanName));
    setSeoTitle(`${cleanName} | Made in India AC Drive — Q-JEN`);
    setSeoDescription(
      `Buy ${cleanName} direct from Jerly Electronics and Cooling Services, Madurai, India. QCI Verified Manufacturer & GeM OEM Registered Seller with one year flexible warranty.`
    );
    setSlugTouched(false);
    setSeoTouched(false);
    showToast("Slug and SEO metadata regenerated from product name", "success");
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) {
      showToast("Please select valid image files (JPG, PNG, WebP, AVIF)", "error");
      return;
    }

    setUploading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const baseSlug = slugifyProductName(slug || name || "q-jen-vfd");
      const uploaded: EditableImage[] = [];

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          showToast(`${file.name} exceeds 5MB limit and was skipped.`, "error");
          continue;
        }
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `products/${baseSlug}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "31536000",
            upsert: false,
          });

        if (uploadError) {
          showToast(`Upload failed for ${file.name}: ${uploadError.message}`, "error");
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploaded.push({
          image_url: urlData.publicUrl,
          alt_text: `${name.trim() || "Q-JEN VFD"} product view`,
          sort_order: images.length + uploaded.length,
          is_cover: images.length === 0 && uploaded.length === 0,
        });
      }

      if (uploaded.length > 0) {
        setImages((prev) => [...prev, ...uploaded]);
        showToast(`Uploaded ${uploaded.length} image(s)`, "success");
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Image upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  function setCoverImage(index: number) {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_cover: i === index }))
    );
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((i) => i.is_cover)) {
        filtered[0] = { ...filtered[0], is_cover: true };
      }
      return filtered.map((img, i) => ({ ...img, sort_order: i }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const kwNum = Number(powerKw);
    const hpNum = Number(powerHp);
    if (!name.trim()) {
      showToast("Product name is required.", "error");
      return;
    }
    if (!slug.trim()) {
      showToast("URL slug is required.", "error");
      return;
    }
    if (!Number.isFinite(kwNum) || kwNum <= 0) {
      showToast("Enter a valid positive kW rating.", "error");
      return;
    }
    if (!Number.isFinite(hpNum) || hpNum <= 0) {
      showToast("Enter a valid positive HP rating.", "error");
      return;
    }

    setSaving(true);
    const parsedPrice = price.trim() === "" ? null : Number(price);
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      showToast("Price must be blank or a valid non-negative number.", "error");
      setSaving(false);
      return;
    }

    const res = await saveProductAction({
      id: initialProduct?.id,
      name,
      slug,
      model_code: modelCode || null,
      power_kw: kwNum,
      power_hp: hpNum,
      short_description: shortDescription,
      description,
      specs,
      features,
      is_best_seller: isBestSeller,
      is_active: isActive,
      display_order: Number(displayOrder) || 0,
      price: parsedPrice,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      images,
    });

    setSaving(false);
    if (!res.ok) {
      showToast(res.error || "Failed to save product", "error");
      return;
    }

    showToast(
      isEditing ? "Product updated successfully" : "Product created successfully",
      "success"
    );
    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!initialProduct?.id) return;
    setDeleting(true);
    const res = await deleteProductAction(initialProduct.id);
    setDeleting(false);
    setConfirmDeleteOpen(false);
    if (!res.ok) {
      showToast(res.error || "Failed to delete product", "error");
      return;
    }
    showToast("Product deleted", "success");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            aria-label="Back to products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0F4E]">
              {isEditing ? `Edit ${initialProduct?.name}` : "Add New VFD Model"}
            </h1>
            <p className="text-xs text-slate-500">
              All fields save directly to Supabase and automatically revalidate public pages.
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Delete Product
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0A0F4E]">
            1. Core Product Identity & Rating
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Q-JEN 15kW / 20HP VFD"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="q-jen-15kw-20hp-vfd"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-[#1C66EB] focus:outline-none focus:ring-2 focus:ring-[#1C66EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Power Rating (kW) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={powerKw}
                onChange={(e) => setPowerKw(e.target.value)}
                placeholder="e.g. 15"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Power Rating (HP) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={powerHp}
                onChange={(e) => setPowerHp(e.target.value)}
                placeholder="e.g. 20"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Model Code (Optional)
              </label>
              <input
                type="text"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="[Add official Q-JEN model code]"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price in ₹ (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Leave blank for quote"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm focus:border-[#1C66EB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#1C66EB] focus:ring-[#1C66EB]"
              />
              <span className="text-sm font-medium text-slate-800">
                Active (Visible on Public Site)
              </span>
            </label>

            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-800">
                Mark as Best Seller
              </span>
            </label>
          </div>
        </section>

        {/* Descriptions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0A0F4E]">
            2. Descriptions (Markdown Supported)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Description (shown on product cards & search)
            </label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="[Add concise model summary — e.g. application fit and rating overview]"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Full Product Description (Markdown)
              </label>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDescTab("write")}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                    descTab === "write"
                      ? "bg-[#1C66EB] text-white"
                      : "text-slate-600"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setDescTab("preview")}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                    descTab === "preview"
                      ? "bg-[#1C66EB] text-white"
                      : "text-slate-600"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {descTab === "write" ? (
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono focus:border-[#1C66EB] focus:outline-none"
              />
            ) : (
              <div className="min-h-[180px] rounded-xl border border-slate-200 bg-slate-50 p-4 prose prose-sm max-w-none text-slate-700">
                <ReactMarkdown>{description}</ReactMarkdown>
              </div>
            )}
          </div>
        </section>

        {/* Features List */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0A0F4E]">
              3. Key Features List
            </h2>
            <button
              type="button"
              onClick={() => setFeatures((prev) => [...prev, ""])}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#1C66EB] hover:bg-blue-50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Feature
            </button>
          </div>

          <div className="space-y-2.5">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) =>
                    setFeatures((prev) =>
                      prev.map((item, i) => (i === idx ? e.target.value : item))
                    )
                  }
                  placeholder="[Enter verified feature]"
                  className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1C66EB] focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Remove feature"
                  onClick={() =>
                    setFeatures((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Specs Editor */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0A0F4E]">
                4. Technical Specifications Table
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add only verified specifications from your engineering datasheet.
                Empty table shows a polite prompt for buyers to request datasheet on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setSpecs((prev) => [...prev, { key: "", value: "" }])
              }
              className="self-start sm:self-auto inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#1C66EB] hover:bg-blue-50 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Spec Row
            </button>
          </div>

          {specs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              No specification rows added yet. Click &ldquo;Add Spec Row&rdquo; to enter verified parameters.
            </div>
          ) : (
            <div className="space-y-2.5">
              {specs.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center"
                >
                  <input
                    type="text"
                    value={row.key}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, key: e.target.value } : item
                        )
                      )
                    }
                    placeholder="Parameter (e.g. Input Voltage)"
                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1C66EB] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) =>
                      setSpecs((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, value: e.target.value } : item
                        )
                      )
                    }
                    placeholder="[Enter verified value]"
                    className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-[#1C66EB] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Remove spec row"
                    onClick={() =>
                      setSpecs((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer justify-self-end"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Product Images Uploader */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#0A0F4E]">
            5. Product Images (Supabase Storage)
          </h2>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.length) {
                uploadFiles(e.dataTransfer.files);
              }
            }}
            className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-[#1C66EB] bg-blue-50"
                : "border-slate-300 bg-slate-50/60 hover:border-slate-400"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) {
                  uploadFiles(e.target.files);
                  e.target.value = "";
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-sm text-[#1C66EB] font-medium">
                <Loader2 className="w-8 h-8 animate-spin" />
                Uploading images to Supabase Storage...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-9 h-9 text-[#1C66EB]" />
                <p className="text-sm font-semibold text-slate-800">
                  Drag & drop product images here, or click to browse
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG, WebP, or AVIF • Max 5MB per image
                </p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div
                  key={`${img.image_url}-${idx}`}
                  className={`rounded-xl border p-3 flex gap-3 items-start ${
                    img.is_cover
                      ? "border-[#1C66EB] bg-blue-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || "Product preview"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      type="text"
                      value={img.alt_text}
                      onChange={(e) =>
                        setImages((prev) =>
                          prev.map((item, i) =>
                            i === idx
                              ? { ...item, alt_text: e.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="Descriptive alt text for SEO"
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#1C66EB] focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCoverImage(idx)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium cursor-pointer ${
                          img.is_cover
                            ? "bg-[#1C66EB] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        {img.is_cover ? "Cover" : "Set Cover"}
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        aria-label="Move image up"
                        className="p-1 rounded-md bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        aria-label="Move image down"
                        className="p-1 rounded-md bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                        className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SEO Metadata */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#0A0F4E]">
              6. SEO Metadata
            </h2>
            <button
              type="button"
              onClick={regenerateSeo}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Auto-generate from Name
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SEO Title
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => {
                  setSeoTouched(true);
                  setSeoTitle(e.target.value);
                }}
                placeholder="Auto-generated if left blank"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SEO Meta Description
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => {
                  setSeoTouched(true);
                  setSeoDescription(e.target.value);
                }}
                placeholder="Auto-generated if left blank"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-[#1C66EB] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Sticky Submit Bar */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          <Link
            href="/admin"
            className="text-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C66EB] hover:bg-[#1552C4] text-white font-semibold px-6 py-3 sm:py-2.5 text-sm shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </form>

      {confirmDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Delete {initialProduct?.name}?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              This will permanently remove the product and its database image records.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

