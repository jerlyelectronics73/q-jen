-- ============================================================================
-- Q-JEN Industrial VFD E-Selling Platform — Supabase Database Schema
-- Manufacturer: Jerly Electronics and Cooling Services, Madurai, Tamil Nadu, India
-- ============================================================================
-- Run this entire script in your Supabase Dashboard -> SQL Editor.
-- Before/after running:
--   1. In Supabase Dashboard -> Authentication -> Providers -> Email:
--      Disable "Confirm email" (optional) and DISABLE "Allow new users to sign up"
--      (or Authentication -> Settings -> Disable public sign-ups).
--   2. Create your single admin user manually in Authentication -> Users -> Add user.
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- Helper: Single-admin authorization check
-- Since public sign-ups are disabled in Supabase Auth, only the manually
-- created admin account(s) can obtain an authenticated session.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.role() = 'authenticated';
$$;

-- ----------------------------------------------------------------------------
-- Helper: Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Table: products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  model_code text,
  power_kw numeric(8, 2) NOT NULL CHECK (power_kw > 0),
  power_hp numeric(8, 2) NOT NULL CHECK (power_hp > 0),
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  features text[] NOT NULL DEFAULT '{}'::text[],
  is_best_seller boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  price numeric(12, 2),
  seo_title text,
  seo_description text,
  search_text text NOT NULL DEFAULT '',
  search_vector tsvector,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep search_text and search_vector synchronized automatically
CREATE OR REPLACE FUNCTION public.products_sync_search()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  kw_clean text;
  hp_clean text;
BEGIN
  kw_clean := trim(trailing '.' from trim(trailing '0' from NEW.power_kw::text));
  hp_clean := trim(trailing '.' from trim(trailing '0' from NEW.power_hp::text));

  NEW.search_text := concat_ws(
    ' ',
    NEW.name,
    coalesce(NEW.model_code, ''),
    kw_clean || 'kw',
    kw_clean || ' kw',
    hp_clean || 'hp',
    hp_clean || ' hp',
    kw_clean || 'kw ' || hp_clean || 'hp',
    coalesce(NEW.short_description, ''),
    array_to_string(coalesce(NEW.features, '{}'::text[]), ' ')
  );

  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.model_code, '')), 'A') ||
    setweight(to_tsvector('english', kw_clean || 'kw ' || kw_clean || ' kw ' || hp_clean || 'hp ' || hp_clean || ' hp'), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(NEW.features, '{}'::text[]), ' ')), 'C');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_sync_search ON public.products;
CREATE TRIGGER trg_products_sync_search
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.products_sync_search();

-- Indexes for fast filtering, sorting, FTS, and pg_trgm fuzzy matching
CREATE INDEX IF NOT EXISTS idx_products_active_order ON public.products (is_active, display_order ASC, power_kw ASC);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products (is_best_seller, is_active, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_products_power_kw ON public.products (power_kw);
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_search_text_trgm ON public.products USING GIN (search_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_model_code_trgm ON public.products USING GIN (coalesce(model_code, '') gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- Table: product_images
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort ON public.product_images (product_id, sort_order ASC, is_cover DESC);

-- ----------------------------------------------------------------------------
-- Table: site_settings (Single-row configuration editable in Admin Panel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  whatsapp_number text NOT NULL DEFAULT '919843334303',
  hero_headline text NOT NULL DEFAULT 'Precision Indian-Made VFDs Built for Industrial Endurance',
  hero_subtext text NOT NULL DEFAULT 'Designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services — Quality Council of India Verified Manufacturer & GeM OEM Registered VFD Seller.',
  trust_badge_1 text NOT NULL DEFAULT '100% Trust',
  trust_badge_2 text NOT NULL DEFAULT 'Made in India',
  trust_badge_3 text NOT NULL DEFAULT 'Proud to be an Indian Product',
  trust_badge_4 text NOT NULL DEFAULT 'Quality Tested',
  trust_badge_5 text NOT NULL DEFAULT 'Direct from Manufacturer/Seller',
  contact_email text NOT NULL DEFAULT '[Add official contact email in Admin Settings]',
  address text NOT NULL DEFAULT 'Madurai, Tamil Nadu, India [Add full factory street address in Admin Settings]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Search RPC: Exact + Partial + Full-Text + pg_trgm Fuzzy Ranked Search
-- Handles "15kw", "15 kw", "20hp", "20 HP", "15kw 20hp", model codes & typos
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_products(
  search_query text,
  include_inactive boolean DEFAULT false,
  result_limit integer DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  slug text,
  name text,
  model_code text,
  power_kw numeric,
  power_hp numeric,
  short_description text,
  is_best_seller boolean,
  is_active boolean,
  display_order integer,
  price numeric,
  relevance_score real
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  raw_q text := trim(coalesce(search_query, ''));
  norm_q text;
  ts_q tsquery;
BEGIN
  IF raw_q = '' THEN
    RETURN QUERY
    SELECT
      p.id, p.slug, p.name, p.model_code, p.power_kw, p.power_hp,
      p.short_description, p.is_best_seller, p.is_active, p.display_order, p.price,
      1.0::real AS relevance_score
    FROM public.products p
    WHERE (include_inactive AND public.is_admin()) OR p.is_active = true
    ORDER BY p.display_order ASC, p.power_kw ASC
    LIMIT result_limit;
    RETURN;
  END IF;

  -- Normalize spacing around kw/hp e.g. "15 kw" -> "15kw", "20 hp" -> "20hp"
  norm_q := lower(regexp_replace(raw_q, '(\d+(?:\.\d+)?)\s*(kw|hp)', '\1\2', 'gi'));
  ts_q := websearch_to_tsquery('english', norm_q);

  RETURN QUERY
  SELECT
    p.id, p.slug, p.name, p.model_code, p.power_kw, p.power_hp,
    p.short_description, p.is_best_seller, p.is_active, p.display_order, p.price,
    (
      -- Tier 1: Exact name, model_code, or kW/HP match
      CASE
        WHEN lower(p.name) = lower(raw_q) OR lower(coalesce(p.model_code, '')) = lower(raw_q) THEN 100.0
        WHEN p.search_text ~* ('\y' || regexp_replace(norm_q, '([.*+?^${}()|[\]\\])', '\\\1', 'g') || '\y') THEN 60.0
        ELSE 0.0
      END
      +
      -- Tier 2: Partial substring / ILIKE match
      CASE
        WHEN lower(p.search_text) LIKE '%' || lower(norm_q) || '%' THEN 25.0
        WHEN lower(p.name) LIKE '%' || lower(raw_q) || '%' THEN 20.0
        ELSE 0.0
      END
      +
      -- Tier 3: Postgres Full-Text Search rank
      coalesce(ts_rank_cd(p.search_vector, ts_q), 0.0) * 15.0
      +
      -- Tier 4: pg_trgm fuzzy similarity (handles typos)
      greatest(
        similarity(lower(p.name), lower(raw_q)),
        similarity(lower(coalesce(p.model_code, '')), lower(raw_q)),
        word_similarity(lower(norm_q), lower(p.search_text))
      ) * 10.0
    )::real AS relevance_score
  FROM public.products p
  WHERE
    ((include_inactive AND public.is_admin()) OR p.is_active = true)
    AND (
      lower(p.search_text) LIKE '%' || lower(norm_q) || '%'
      OR lower(p.name) LIKE '%' || lower(raw_q) || '%'
      OR p.search_vector @@ ts_q
      OR similarity(lower(p.name), lower(raw_q)) > 0.15
      OR similarity(lower(coalesce(p.model_code, '')), lower(raw_q)) > 0.2
      OR word_similarity(lower(norm_q), lower(p.search_text)) > 0.25
    )
  ORDER BY relevance_score DESC, p.display_order ASC, p.power_kw ASC
  LIMIT result_limit;
END;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Public can ONLY SELECT active products, images of active products, and site_settings.
-- Only the authenticated admin user can INSERT / UPDATE / DELETE.
-- ----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Products policies
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Product images policies
DROP POLICY IF EXISTS "Public can view active product images" ON public.product_images;
CREATE POLICY "Public can view active product images"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_images.product_id AND p.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admin can insert product images" ON public.product_images;
CREATE POLICY "Admin can insert product images"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update product images" ON public.product_images;
CREATE POLICY "Admin can update product images"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete product images" ON public.product_images;
CREATE POLICY "Admin can delete product images"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Site settings policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;
CREATE POLICY "Admin can update site settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert site settings" ON public.site_settings;
CREATE POLICY "Admin can insert site settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage Bucket: product-images (Public Read, Admin-only Write)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- Seed Default Site Settings
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (
  id,
  whatsapp_number,
  hero_headline,
  hero_subtext,
  trust_badge_1,
  trust_badge_2,
  trust_badge_3,
  trust_badge_4,
  trust_badge_5,
  contact_email,
  address
)
VALUES (
  1,
  '919843334303',
  'Precision Indian-Made VFDs Built for Industrial Endurance',
  'Designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services — Quality Council of India Verified Manufacturer & GeM OEM Registered VFD Seller.',
  '100% Trust',
  'Made in India',
  'Proud to be an Indian Product',
  'Quality Tested',
  'Direct from Manufacturer/Seller',
  '[Add official contact email in Admin Settings]',
  'Madurai, Tamil Nadu, India [Add full factory street address in Admin Settings]'
)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed 15 Draft Products (is_active = false until images & details are verified)
-- Note: Technical specs, model codes, and prices are left empty/null so you
-- can fill verified values directly in the Admin Panel.
-- ----------------------------------------------------------------------------
INSERT INTO public.products (
  slug,
  name,
  model_code,
  power_kw,
  power_hp,
  short_description,
  description,
  specs,
  features,
  is_best_seller,
  is_active,
  display_order,
  price,
  seo_title,
  seo_description
)
SELECT
  v.slug,
  v.name,
  NULL,
  v.power_kw,
  v.power_hp,
  'Indian-made ' || v.label || ' Variable Frequency Drive designed and manufactured in Madurai, Tamil Nadu by Jerly Electronics and Cooling Services. [Edit short summary in Admin]',
  E'Q-JEN VFD is designed and manufactured in our premises located in Madurai, Tamil Nadu, India. Jerly Electronics and Cooling Services (Quality Council of India Verified Manufacturer, Vendor Assessment Report No. VA-066652125097175, and an OEM registered VFD seller in GeM Portal) is a more than a decade-old company with three-decades-experienced engineers emerged from various industrial electronic service activities, and is the trademark owner of the brand Q-JEN and its logo (Trade Mark No. 5495858).\n\nWith all the experience gained from the service field, Q-JEN VFD is well designed with advanced features, excellent quality, and sustainability. The schematics and PCBs are designed by our experienced senior electronic and software engineers within our premises, and the final products are subjected to various trial running environments at our service-field customers'' sites to ensure dependable performance.\n\nOffered to customers with a one year flexible warranty at an economical cost compared to similar imported products available in the market.',
  '[]'::jsonb,
  ARRAY[
    'Designed & manufactured in Madurai, Tamil Nadu, India',
    'In-house schematic, PCB & software engineering',
    'Field-tested across real customer trial environments',
    'One year flexible warranty',
    'QCI Verified Manufacturer (VA-066652125097175) & GeM OEM Registered Seller'
  ]::text[],
  false,
  false,
  v.display_order,
  NULL,
  v.name || ' | Made in India AC Drive — Q-JEN',
  'Buy ' || v.name || ' direct from Jerly Electronics and Cooling Services, Madurai, India. QCI Verified Manufacturer & GeM OEM Registered Seller with one year flexible warranty.'
FROM (
  VALUES
    ('q-jen-15kw-20hp-vfd',    'Q-JEN 15kW / 20HP VFD',    15.0,  20.0,  '15kW / 20HP',   1),
    ('q-jen-18-5kw-25hp-vfd',  'Q-JEN 18.5kW / 25HP VFD',  18.5,  25.0,  '18.5kW / 25HP', 2),
    ('q-jen-22kw-30hp-vfd',    'Q-JEN 22kW / 30HP VFD',    22.0,  30.0,  '22kW / 30HP',   3),
    ('q-jen-30kw-40hp-vfd',    'Q-JEN 30kW / 40HP VFD',    30.0,  40.0,  '30kW / 40HP',   4),
    ('q-jen-37kw-50hp-vfd',    'Q-JEN 37kW / 50HP VFD',    37.0,  50.0,  '37kW / 50HP',   5),
    ('q-jen-45kw-60hp-vfd',    'Q-JEN 45kW / 60HP VFD',    45.0,  60.0,  '45kW / 60HP',   6),
    ('q-jen-55kw-75hp-vfd',    'Q-JEN 55kW / 75HP VFD',    55.0,  75.0,  '55kW / 75HP',   7),
    ('q-jen-75kw-100hp-vfd',   'Q-JEN 75kW / 100HP VFD',   75.0,  100.0, '75kW / 100HP',  8),
    ('q-jen-90kw-125hp-vfd',   'Q-JEN 90kW / 125HP VFD',   90.0,  125.0, '90kW / 125HP',  9),
    ('q-jen-110kw-150hp-vfd',  'Q-JEN 110kW / 150HP VFD',  110.0, 150.0, '110kW / 150HP', 10),
    ('q-jen-132kw-180hp-vfd',  'Q-JEN 132kW / 180HP VFD',  132.0, 180.0, '132kW / 180HP', 11),
    ('q-jen-160kw-200hp-vfd',  'Q-JEN 160kW / 200HP VFD',  160.0, 200.0, '160kW / 200HP', 12),
    ('q-jen-185kw-225hp-vfd',  'Q-JEN 185kW / 225HP VFD',  185.0, 225.0, '185kW / 225HP', 13),
    ('q-jen-200kw-250hp-vfd',  'Q-JEN 200kW / 250HP VFD',  200.0, 250.0, '200kW / 250HP', 14),
    ('q-jen-220kw-300hp-vfd',  'Q-JEN 220kW / 300HP VFD',  220.0, 300.0, '220kW / 300HP', 15)
) AS v(slug, name, power_kw, power_hp, label, display_order)
ON CONFLICT (slug) DO NOTHING;

