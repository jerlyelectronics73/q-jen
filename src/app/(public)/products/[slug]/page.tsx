import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  getActiveProducts,
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
} from "@/lib/data";
import { BRAND, SITE_URL, formatPowerRating } from "@/lib/constants";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import ProductGallery from "@/components/public/ProductGallery";
import ProductCard from "@/components/public/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const rating = formatPowerRating(product.power_kw, product.power_hp);
  const title =
    product.seo_title || `${product.name} (${rating}) | Made in India VFD`;
  const description =
    product.seo_description ||
    product.short_description ||
    `Buy ${product.name} (${rating}) Variable Frequency Drive designed and manufactured in Madurai, Tamil Nadu by ${BRAND.legalOwner}.`;
  const coverUrl =
    product.product_images?.[0]?.image_url || `${SITE_URL}/og-image.png`;
  const canonical = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [{ url: coverUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product, 4);
  const rating = formatPowerRating(product.power_kw, product.power_hp);
  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;
  const waUrl = buildProductWhatsAppUrl({
    name: product.name,
    powerKw: product.power_kw,
    powerHp: product.power_hp,
    slug: product.slug,
    whatsappNumber: settings.whatsapp_number,
  });

  const images = product.product_images || [];
  const imageUrls =
    images.length > 0
      ? images.map((img) => img.image_url)
      : [`${SITE_URL}/og-image.png`];

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    image: imageUrls,
    sku: product.model_code || product.slug,
    brand: {
      "@type": "Brand",
      name: BRAND.name,
    },
    manufacturer: {
      "@type": "Organization",
      name: BRAND.legalOwner,
    },
    url: canonicalUrl,
  };

  if (product.price !== null) {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: canonicalUrl,
      seller: {
        "@type": "Organization",
        name: BRAND.legalOwner,
      },
    };
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${SITE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="bg-[#F8FAFC] pb-24 sm:pb-16">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 mb-5 sm:mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <li>
              <Link href="/" className="hover:text-[#1C66EB]">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/products" className="hover:text-[#1C66EB]">
                Products
              </Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Top Split: Gallery + Core Buy Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-6">
            <ProductGallery
              images={images}
              productName={product.name}
              powerKw={product.power_kw}
              powerHp={product.power_hp}
            />
          </div>

          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#0A0F4E] px-3 py-1 font-mono text-xs font-bold text-[#FACC15]">
                {rating}
              </span>
              <span className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-semibold text-orange-900">
                100% Made in India 🇮🇳
              </span>
              {product.is_best_seller && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                  Best Seller
                </span>
              )}
            </div>

            <div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#0A0F4E] leading-tight">
                {product.name}
              </h1>
              {product.model_code && (
                <p className="mt-2 font-mono text-sm text-slate-600 break-words">
                  Model Code:{" "}
                  <span className="font-semibold text-slate-900">
                    {product.model_code}
                  </span>
                </p>
              )}
            </div>

            {product.short_description && (
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Price / Direct Quote Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Direct Manufacturer Supply
                  </div>
                  {product.price !== null ? (
                    <div className="text-2xl sm:text-3xl font-bold text-[#0A0F4E] mt-0.5">
                      ₹{product.price.toLocaleString("en-IN")}
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-[#0A0F4E] mt-0.5">
                      Request Best Price on WhatsApp
                    </div>
                  )}
                </div>
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  1-Year Flexible Warranty
                </span>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[46px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 sm:px-6 py-3.5 text-sm shadow-md transition-colors text-center"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Buy on WhatsApp — Get Price & Availability</span>
              </a>

              <p className="text-xs text-slate-500 text-center">
                Connects directly to Jerly Electronics & Cooling Services, Madurai (QCI Verified • GeM OEM Seller).
              </p>
            </div>

            {/* Key Features */}
            {product.features.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h2 className="font-display text-base font-bold text-[#0A0F4E] mb-3">
                  Key Highlights
                </h2>
                <ul className="space-y-2.5">
                  {product.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#1C66EB] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Specifications & Full Description */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs h-full">
              <h2 className="font-display text-xl font-bold text-[#0A0F4E] mb-4">
                Technical Specifications
              </h2>

              {product.specs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50">
                        <th className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-slate-700 w-2/5">
                          Power Rating
                        </th>
                        <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-mono font-semibold text-[#0A0F4E] break-words">
                          {rating}
                        </td>
                      </tr>
                      {product.model_code && (
                        <tr>
                          <th className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-slate-700">
                            Model Code
                          </th>
                          <td className="py-2.5 px-3 sm:py-3 sm:px-4 font-mono text-slate-900 break-words">
                            {product.model_code}
                          </td>
                        </tr>
                      )}
                      {product.specs.map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                        >
                          <th className="py-2.5 px-3 sm:py-3 sm:px-4 font-semibold text-slate-700 break-words">
                            {row.key}
                          </th>
                          <td className="py-2.5 px-3 sm:py-3 sm:px-4 text-slate-800 break-words">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0A0F4E]">
                    <FileText className="w-4 h-4 text-[#1C66EB]" />
                    Rated Capacity: {rating}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Detailed electrical & dimensional datasheet parameters for{" "}
                    <strong>{product.name}</strong> are verified directly by our
                    engineering team upon request or updated in the Admin Console.
                  </p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C66EB] hover:underline"
                  >
                    Request datasheet on WhatsApp
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs h-full">
              <h2 className="font-display text-xl font-bold text-[#0A0F4E] mb-4">
                Engineering & Product Overview
              </h2>
              <div className="prose prose-slate prose-sm sm:prose-base max-w-none leading-relaxed text-slate-700 break-words overflow-x-auto">
                <ReactMarkdown>{product.description}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Related Power Ratings */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-14">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0A0F4E]">
                Related Q-JEN Power Ratings
              </h2>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#1C66EB] hover:underline shrink-0"
              >
                All ratings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  whatsappNumber={settings.whatsapp_number}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile "Buy on WhatsApp" Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <div className="text-xs font-bold text-[#0A0F4E] truncate">
            {product.name}
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            {product.price !== null
              ? `₹${product.price.toLocaleString("en-IN")}`
              : rating}
          </div>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 text-xs shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          Buy on WhatsApp
        </a>
      </div>
    </div>
  );
}

