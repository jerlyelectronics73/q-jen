# Q-JEN Industrial VFD E-Selling Platform

Single-seller, WhatsApp-first storefront for **Q-JEN** Variable Frequency Drives (15kW / 20HP to 220kW / 300HP), designed and manufactured in Madurai, Tamil Nadu, India by **Jerly Electronics and Cooling Services**.

## Architecture Overview
- **Framework**: Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Backend & Auth**: Supabase (Postgres + `pg_trgm` / Full-Text Search + Storage + Admin-only Auth)
- **Sales Flow**: Zero customer accounts, zero cart — buyers browse/search VFD models and tap **Buy on WhatsApp** with pre-filled model & URL details.
- **Admin Console (`/admin`)**: Hidden from public navigation, `noindex` protected via Next.js proxy + metadata, and enforced by Supabase Row Level Security (RLS).

---

## Step-by-Step Setup Guide

### 1. Create a Supabase Project
1. Sign in to [Supabase](https://supabase.com/) and create a new project (choose a nearby region such as Mumbai `ap-south-1`).
2. Wait for the database to finish provisioning.

### 2. Run `supabase/schema.sql`
1. Open **SQL Editor** in your Supabase Dashboard.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it.
3. This creates:
   - `products`, `product_images`, and `site_settings` tables
   - `pg_trgm` + `tsvector` search indexes and `search_products` RPC
   - `product-images` public-read / admin-write Storage bucket
   - Strict RLS policies (public reads active products only; admin writes)
   - 15 pre-seeded draft VFD products (`is_active = false`, from `15kW / 20HP` to `220kW / 300HP`)

### 3. Disable Public Sign-Ups & Create Your Admin User
1. In Supabase Dashboard -> **Authentication** -> **Providers** -> **Email** (or **Authentication -> Sign In / Providers**):
   - **Disable** *"Allow new users to sign up"* (public sign-ups MUST be off because only you are the admin).
2. Go to **Authentication** -> **Users** -> **Add user** -> **Create new user**:
   - The `/admin/login` screen uses **User ID + Password** (mapped internally to `<userid>@admin.qjen.local`).
   - Enter `<your-userid>@admin.qjen.local` and your strong password, and check **Auto Confirm User**.

### 4. Configure Environment Variables
Copy `.env.example` to `.env.local` (for local development) and set the same variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER=919843334303
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note:** If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are left blank locally, the public storefront automatically renders a local preview fallback catalog so you can test the UI immediately on `localhost:3000`. As soon as you add your Supabase credentials, all public pages and `/admin` connect live to your Supabase database.

### 5. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the storefront, and visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to manage products, upload photos, toggle Active/Best Seller status, and edit site settings.

### 6. Deploy to Vercel
1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the repository in [Vercel](https://vercel.com/).
3. Add the four environment variables in Vercel Project Settings (`NEXT_PUBLIC_SITE_URL` should be your live `https://...` domain).
4. Deploy! Then follow [`SEO_CHECKLIST.md`](./SEO_CHECKLIST.md).
