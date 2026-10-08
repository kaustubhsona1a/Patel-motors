-- ==============================================================================
-- SUPABASE DATABASE SCHEMA SETUP SCRIPT
-- ==============================================================================
-- Run this script in your Supabase Project -> SQL Editor -> New Query.
-- Creates all tables, relational foreign keys, storage buckets, triggers,
-- indexes, and Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: metadata_versions
-- Used for client-side caching and instantaneous inventory synchronization.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. TABLE: site_settings
-- Stores showroom configuration, branding, hero media, and contact details.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    company_name TEXT,
    tagline TEXT,
    whatsapp_number TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    maps_url TEXT,
    about_image_url TEXT,
    home_hero_image_url TEXT,
    home_hero_mobile_image_url TEXT,
    home_hero_video_url TEXT,
    home_hero_mobile_video_url TEXT,
    home_hero_type TEXT DEFAULT 'image',
    logo_url TEXT,
    client_deliveries JSONB DEFAULT '[]'::jsonb,
    instagram_reels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. TABLE: vehicles
-- Stores motorcycle inventory, specs, status, inspection, and sale records.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL,
    registration_year INTEGER,
    price NUMERIC NOT NULL DEFAULT 0,
    purchase_price NUMERIC,
    mileage INTEGER NOT NULL DEFAULT 0,
    fuel_type TEXT NOT NULL DEFAULT 'Petrol',
    transmission TEXT NOT NULL DEFAULT 'Manual',
    body_type TEXT NOT NULL DEFAULT 'Superbike',
    engine TEXT,
    engine_cc INTEGER,
    color TEXT DEFAULT 'Standard',
    ownership TEXT DEFAULT '1st Owner',
    registration TEXT,
    insurance_status TEXT,
    rc_status TEXT,
    service_history TEXT,
    condition TEXT,
    location TEXT DEFAULT 'Mumbai',
    chassis_number TEXT,
    engine_number TEXT,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Draft', 'Available', 'Reserved', 'Sold', 'Archived', 'Booked', 'Deleted')),
    featured BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    inspection_notes TEXT,
    instagram_reel TEXT,
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    sale_info JSONB,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. TABLE: vehicle_images
-- Relational photo gallery supporting ordered high-resolution photographs.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. TABLE: leads
-- Stores customer valuation requests, "Sell Your Bike" submissions, and inquiries.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'New Lead',
    images TEXT[] DEFAULT '{}',
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    mileage INTEGER,
    ownership TEXT,
    expected_price NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 7. TABLE: sales_invoices
-- Relational sales invoices, delivery challans, and customer settlement records.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_time TEXT,
    sale_price NUMERIC NOT NULL DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    rto_charges NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL DEFAULT 0,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    customer_address TEXT,
    customer_identity TEXT,
    customer_gst TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Bank Transfer (NEFT/RTGS)',
    payment_status TEXT NOT NULL DEFAULT 'Paid in Full',
    payment_ref TEXT,
    hypothecation TEXT,
    insurance_company TEXT,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    balance_due NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 8. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON public.vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON public.vehicles(featured);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON public.vehicles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_display_order ON public.vehicle_images(vehicle_id, display_order);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_vehicle_id ON public.sales_invoices(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_invoice_number ON public.sales_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer_phone ON public.sales_invoices(customer_phone);

-- ==============================================================================
-- 9. AUTOMATIC TRIGGERS (UPDATED_AT & CACHE INVALIDATION)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_sales_invoices_updated_at ON public.sales_invoices;
CREATE TRIGGER trg_sales_invoices_updated_at
    BEFORE UPDATE ON public.sales_invoices
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: Invalidate vehicle metadata version on changes
CREATE OR REPLACE FUNCTION public.bump_vehicles_metadata_version()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.metadata_versions (key, version, updated_at)
    VALUES ('vehicles', 1, now())
    ON CONFLICT (key) DO UPDATE
    SET version = public.metadata_versions.version + 1,
        updated_at = now();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_vehicles_version ON public.vehicles;
CREATE TRIGGER trg_bump_vehicles_version
    AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
    FOR EACH STATEMENT EXECUTE FUNCTION public.bump_vehicles_metadata_version();

-- Trigger: Invalidate site_settings metadata version on changes
CREATE OR REPLACE FUNCTION public.bump_site_settings_metadata_version()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.metadata_versions (key, version, updated_at)
    VALUES ('site_settings', 1, now())
    ON CONFLICT (key) DO UPDATE
    SET version = public.metadata_versions.version + 1,
        updated_at = now();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_site_settings_version ON public.site_settings;
CREATE TRIGGER trg_bump_site_settings_version
    AFTER INSERT OR UPDATE OR DELETE ON public.site_settings
    FOR EACH STATEMENT EXECUTE FUNCTION public.bump_site_settings_metadata_version();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================

ALTER TABLE public.metadata_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_invoices ENABLE ROW LEVEL SECURITY;

-- Metadata Versions Policies
DROP POLICY IF EXISTS "Public can read metadata versions" ON public.metadata_versions;
CREATE POLICY "Public can read metadata versions" ON public.metadata_versions
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow write metadata versions" ON public.metadata_versions;
CREATE POLICY "Allow write metadata versions" ON public.metadata_versions
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Site Settings Policies
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow manage site settings" ON public.site_settings;
CREATE POLICY "Allow manage site settings" ON public.site_settings
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Vehicles Policies (Public can view non-deleted vehicles)
DROP POLICY IF EXISTS "Public can view vehicles" ON public.vehicles;
CREATE POLICY "Public can view vehicles" ON public.vehicles
    FOR SELECT TO public USING (is_deleted = false);

DROP POLICY IF EXISTS "Allow manage vehicles" ON public.vehicles;
CREATE POLICY "Allow manage vehicles" ON public.vehicles
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Vehicle Images Policies
DROP POLICY IF EXISTS "Public can view vehicle images" ON public.vehicle_images;
CREATE POLICY "Public can view vehicle images" ON public.vehicle_images
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow manage vehicle images" ON public.vehicle_images;
CREATE POLICY "Allow manage vehicle images" ON public.vehicle_images
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Leads Policies (Anyone can insert a lead/valuation submission)
DROP POLICY IF EXISTS "Public can insert valuation leads" ON public.leads;
CREATE POLICY "Public can insert valuation leads" ON public.leads
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage leads" ON public.leads;
CREATE POLICY "Allow manage leads" ON public.leads
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Sales Invoices Policies
DROP POLICY IF EXISTS "Allow manage sales invoices" ON public.sales_invoices;
CREATE POLICY "Allow manage sales invoices" ON public.sales_invoices
    FOR ALL TO public USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. STORAGE BUCKETS & STORAGE POLICIES
-- ==============================================================================

-- Create public bucket: vehicle-images (photos of bikes & customer valuation uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vehicle-images',
    'vehicle-images',
    true,
    52428800, -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Create public bucket: site_settings (showroom banners, logo, branding media)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site_settings',
    'site_settings',
    true,
    52428800, -- 50 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Storage Policies for vehicle-images
DROP POLICY IF EXISTS "Public Access vehicle-images" ON storage.objects;
CREATE POLICY "Public Access vehicle-images" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Allow Uploads vehicle-images" ON storage.objects;
CREATE POLICY "Allow Uploads vehicle-images" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Allow Updates vehicle-images" ON storage.objects;
CREATE POLICY "Allow Updates vehicle-images" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Allow Delete vehicle-images" ON storage.objects;
CREATE POLICY "Allow Delete vehicle-images" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'vehicle-images');

-- Storage Policies for site_settings
DROP POLICY IF EXISTS "Public Access site_settings" ON storage.objects;
CREATE POLICY "Public Access site_settings" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Allow Uploads site_settings" ON storage.objects;
CREATE POLICY "Allow Uploads site_settings" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Allow Updates site_settings" ON storage.objects;
CREATE POLICY "Allow Updates site_settings" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'site_settings');

-- Storage Policies for site_settings
DROP POLICY IF EXISTS "Allow Delete site_settings" ON storage.objects;
CREATE POLICY "Allow Delete site_settings" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'site_settings');

-- ==============================================================================
-- 12. INITIAL SYSTEM REGISTRATION (SINGLETON RECORD)
-- ==============================================================================

-- Initialize cache version keys
INSERT INTO public.metadata_versions (key, version, updated_at)
VALUES 
    ('vehicles', 1, now()),
    ('site_settings', 1, now())
ON CONFLICT (key) DO NOTHING;

-- Initialize empty site settings singleton row
INSERT INTO public.site_settings (id)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid)
ON CONFLICT (id) DO NOTHING;
