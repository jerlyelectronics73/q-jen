# Q-JEN Post-Launch SEO Checklist

Use this checklist immediately after deploying your Q-JEN VFD store to your custom domain on Vercel.

## 1. Environment & Domain Canonicalization
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel Project Settings -> Environment Variables to your canonical HTTPS domain (e.g. `https://qjenindia.com`, no trailing slash).
- [ ] Redirect `www` -> apex (or apex -> `www`) in Vercel Domains so only one canonical host serves the site.
- [ ] Verify `/sitemap.xml` lists all active product pages (`/products/q-jen-15kw-20hp-vfd`, etc.).
- [ ] Verify `/robots.txt` allows `/` and disallows `/admin` and `/api/`.
- [ ] Confirm `/admin` and `/admin/login` return `X-Robots-Tag: noindex, nofollow, noarchive`.

## 2. Product Catalog Content Before Publishing
- [ ] In `/admin`, upload real product photos for each model with descriptive alt text (e.g. `"Q-JEN 15kW 20HP Variable Frequency Drive front panel view"`).
- [ ] Fill verified model codes, short descriptions, and datasheet specification rows for each drive before toggling **Active**.
- [ ] Review auto-generated SEO titles & meta descriptions on each product to ensure target keywords (`15kW 20HP VFD`, `Made in India VFD`, `AC drive India`) read naturally.

## 3. Google Search Console (GSC)
- [ ] Add your domain property in [Google Search Console](https://search.google.com/search-console) and verify via DNS TXT record.
- [ ] Submit `https://yourdomain.com/sitemap.xml` under **Sitemaps**.
- [ ] Use **URL Inspection** on `/` and top product pages (`15kW`, `22kW`, `37kW`, `75kW`, `110kW`) and click **Request Indexing**.
- [ ] Validate structured data in [Rich Results Test](https://search.google.com/test/rich-results):
  - Home page: `Organization`, `WebSite` (SearchAction), `FAQPage`.
  - Product page: `Product` (with `Offer` when price is set) and `BreadcrumbList`.

## 4. Google Business Profile (Local Industrial Visibility in Madurai & Tamil Nadu)
- [ ] Create/verify your **Google Business Profile** for **Jerly Electronics and Cooling Services** in Madurai, Tamil Nadu.
- [ ] Primary category: *Industrial Equipment Supplier* / *Electrical Equipment Manufacturer*.
- [ ] Add your verified factory street address (matching Admin -> Site Settings), website URL, WhatsApp/business phone, and genuine workshop & VFD product photos.
- [ ] Mention **Q-JEN Variable Frequency Drives (15kW – 220kW)**, **QCI Verified Manufacturer**, and **GeM OEM Seller** in your business description.

## 5. Performance & Core Web Vitals Check
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) on Mobile for `/` and `/products/[slug]`, targeting **95+ Performance, 100 SEO, 95+ Accessibility**.
- [ ] Verify all uploaded Supabase images load via `next/image` (WebP/AVIF) without layout shifts (CLS = 0).

## 6. Social Preview Verification
- [ ] Test your home URL and a product URL on WhatsApp / LinkedIn / Facebook Sharing Debugger to verify `/og-image.png` and product cover images render cleanly.

