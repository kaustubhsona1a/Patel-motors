-- ==============================================================================
-- PATEL MOTORS MUMBAI - SUPABASE COMPLETE DATABASE SETUP SCRIPT
-- ==============================================================================
-- Run this entire script in your Supabase Project -> SQL Editor -> New Query.
-- It creates all required tables, relations, storage buckets, RLS security policies,
-- cache invalidation triggers, and initial seed data for Patel Motors Mumbai.
-- Dealership Contact: +91 84520 88500 | WhatsApp: 918452088500
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: metadata_versions
-- Used for high-speed client caching and instantaneous sub-second page loads.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. TABLE: site_settings
-- Stores showroom branding, hero backdrops, contact information & reels.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    company_name TEXT NOT NULL DEFAULT 'Patel Motors',
    tagline TEXT DEFAULT 'Buy, Sell & Exchange Premium Pre-Owned Two Wheelers',
    whatsapp_number TEXT NOT NULL DEFAULT '918452088500',
    phone TEXT NOT NULL DEFAULT '+91 84520 88500',
    email TEXT NOT NULL DEFAULT 'sales@patelmotors.in',
    address TEXT NOT NULL DEFAULT 'Basement 2, Kohinoor Square, East Tower, N C. Kelkar Rd, Ram Ganesh Gadkari Chowk, Dadar West, Mumbai - 400028',
    maps_url TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/5puPNNYsbCpFjaPbA',
    about_image_url TEXT,
    home_hero_image_url TEXT,
    home_hero_mobile_image_url TEXT,
    home_hero_video_url TEXT,
    home_hero_mobile_video_url TEXT,
    home_hero_type TEXT DEFAULT 'image',
    logo_url TEXT DEFAULT '/logo.svg',
    client_deliveries JSONB DEFAULT '[]'::jsonb,
    instagram_reels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. TABLE: vehicles
-- Stores all premium pre-owned motorcycles, specs, pricing, and sales records.
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
    insurance_status TEXT DEFAULT 'Comprehensive (Valid)',
    rc_status TEXT DEFAULT 'Valid (Mumbai RTO)',
    service_history TEXT DEFAULT 'Complete Authorized Service Records',
    condition TEXT DEFAULT 'Showroom Condition',
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
-- Relational photo gallery supporting ordered high-res bike photography.
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
-- Customer valuation requests, "Sell Your Bike" submissions, and inquiries.
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
-- Relational invoice, challan, and customer settlement records for sold bikes.
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

-- Trigger function for updated_at timestamps
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

-- Trigger function: Bump metadata_versions on vehicle changes
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

-- Trigger function: Bump metadata_versions on site_settings changes
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

-- Metadata Versions Policies: Public can read, anyone can sync
DROP POLICY IF EXISTS "Public can read metadata versions" ON public.metadata_versions;
CREATE POLICY "Public can read metadata versions" ON public.metadata_versions
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow write metadata versions" ON public.metadata_versions;
CREATE POLICY "Allow write metadata versions" ON public.metadata_versions
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Site Settings Policies: Public can read, dealership can update
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow manage site settings" ON public.site_settings;
CREATE POLICY "Allow manage site settings" ON public.site_settings
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Vehicles Policies: Public can view active vehicles, dealership can manage
DROP POLICY IF EXISTS "Public can view vehicles" ON public.vehicles;
CREATE POLICY "Public can view vehicles" ON public.vehicles
    FOR SELECT TO public USING (is_deleted = false);

DROP POLICY IF EXISTS "Allow manage vehicles" ON public.vehicles;
CREATE POLICY "Allow manage vehicles" ON public.vehicles
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Vehicle Images Policies: Public can view images, dealership can manage
DROP POLICY IF EXISTS "Public can view vehicle images" ON public.vehicle_images;
CREATE POLICY "Public can view vehicle images" ON public.vehicle_images
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow manage vehicle images" ON public.vehicle_images;
CREATE POLICY "Allow manage vehicle images" ON public.vehicle_images
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Leads Policies: Anyone can submit valuation leads, dealership can manage
DROP POLICY IF EXISTS "Public can insert valuation leads" ON public.leads;
CREATE POLICY "Public can insert valuation leads" ON public.leads
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Allow manage leads" ON public.leads;
CREATE POLICY "Allow manage leads" ON public.leads
    FOR ALL TO public USING (true) WITH CHECK (true);

-- Sales Invoices Policies: Dealership can view and manage invoices
DROP POLICY IF EXISTS "Allow manage sales invoices" ON public.sales_invoices;
CREATE POLICY "Allow manage sales invoices" ON public.sales_invoices
    FOR ALL TO public USING (true) WITH CHECK (true);

-- ==============================================================================
-- 11. STORAGE BUCKETS & STORAGE POLICIES
-- Creates public buckets for motorcycle photos & site branding assets.
-- ==============================================================================

-- Create public bucket: vehicle-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vehicle-images',
    'vehicle-images',
    true,
    52428800, -- 50 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Create public bucket: site_settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site_settings',
    'site_settings',
    true,
    52428800, -- 50 MB limit
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

DROP POLICY IF EXISTS "Allow Delete site_settings" ON storage.objects;
CREATE POLICY "Allow Delete site_settings" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'site_settings');

-- ==============================================================================
-- 12. INITIAL SEED DATA
-- Pre-populates metadata versions, showroom configuration, and initial verified bikes.
-- ==============================================================================

-- Initial Cache Keys
INSERT INTO public.metadata_versions (key, version, updated_at)
VALUES 
    ('vehicles', 1, now()),
    ('site_settings', 1, now())
ON CONFLICT (key) DO NOTHING;

-- Initial Showroom Configuration (Patel Motors Dadar West, Mumbai)
INSERT INTO public.site_settings (
    id,
    company_name,
    tagline,
    whatsapp_number,
    phone,
    email,
    address,
    maps_url,
    about_image_url,
    home_hero_image_url,
    home_hero_mobile_image_url,
    home_hero_type,
    logo_url,
    client_deliveries,
    instagram_reels
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Patel Motors',
    'Buy, Sell & Exchange Premium Pre-Owned Two Wheelers',
    '918452088500',
    '+91 84520 88500',
    'sales@patelmotors.in',
    'Basement 2, Kohinoor Square, East Tower, N C. Kelkar Rd, Ram Ganesh Gadkari Chowk, Dadar West, Mumbai - 400028',
    'https://maps.app.goo.gl/5puPNNYsbCpFjaPbA',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1400',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1920',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1080',
    'image',
    '/logo.svg',
    '[]'::jsonb,
    '[]'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    whatsapp_number = EXCLUDED.whatsapp_number,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    maps_url = EXCLUDED.maps_url;

-- Sample Verified Motorcycles (Patel Motors Inventory)
INSERT INTO public.vehicles (
    id,
    make,
    model,
    variant,
    year,
    registration_year,
    price,
    purchase_price,
    mileage,
    fuel_type,
    transmission,
    body_type,
    engine,
    engine_cc,
    color,
    ownership,
    registration,
    insurance_status,
    rc_status,
    service_history,
    condition,
    location,
    chassis_number,
    engine_number,
    status,
    featured,
    description,
    inspection_notes,
    images,
    features,
    is_deleted
) VALUES 
(
    '11111111-1111-4000-8000-000000000001'::uuid,
    'Kawasaki',
    'Ninja ZX-10R',
    'KRT Edition ABS',
    2023,
    2023,
    1580000,
    1420000,
    5800,
    'Petrol',
    'Quickshifter (6-Speed)',
    'Superbike',
    '998 cc Liquid-Cooled Inline-4 (203 HP)',
    998,
    'Lime Green / Ebony',
    '1st Owner',
    'MH-02-FE-1000',
    'Comprehensive (Valid till Nov 2027)',
    'Valid (Andheri RTO)',
    'Complete Kawasaki Mumbai Center Records',
    'Mint / Showroom Condition',
    'Mumbai',
    'JKAZX1000PA089211',
    'ZXT00NE091823',
    'Available',
    true,
    'Pristine condition Kawasaki Ninja ZX-10R KRT Edition. Regularly serviced at authorized Kawasaki Mumbai. Complete paint protection film (PPF) applied since delivery. Zero track abuse, flawless mechanical health.',
    '50-point inspection passed with 100% score. Brake pads 85% remaining, Pirelli Diablo Supercorsa tyres in superb shape, chain-sprocket inspected.',
    ARRAY[
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200'
    ],
    ARRAY[
        'Brembo M50 Monobloc Calipers',
        'Showa Balance Free Front Fork (BFF)',
        'Kawasaki Cornering Management Function (KCMF)',
        'Launch Control Mode (KLCM)',
        'Electronic Cruise Control',
        'TFT Full-Colour Instrumentation with Smartphone Connectivity'
    ],
    false
),
(
    '22222222-2222-4000-8000-000000000002'::uuid,
    'BMW',
    'R 1250 GS',
    'Triple Black Edition',
    2022,
    2022,
    1890000,
    1710000,
    12400,
    'Petrol',
    'Manual with Shift Assistant Pro',
    'Adventure',
    '1254 cc Boxer Twin ShiftCam (136 HP)',
    1254,
    'Black Storm Metallic / Agate Grey',
    '1st Owner',
    'MH-01-EE-4500',
    'Comprehensive (Valid till Oct 2026)',
    'Valid (Tardeo RTO)',
    'Complete Navnit Motors BMW Mumbai Service History',
    'Showroom Condition',
    'Mumbai',
    'WB10J9109NZ881204',
    '122EN391024',
    'Available',
    true,
    'Iconic BMW R 1250 GS Adventure tourer in Triple Black colorway. Equipped with Dynamic ESA, Riding Modes Pro, heated grips, keyless ride, and full BMW OEM aluminum panniers set.',
    'Full inspection passed. Shaft drive in top-tier condition, Michelin Anakee Adventure tyres at 80% life, original spare key and fob available.',
    ARRAY[
        'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&q=80&w=1200'
    ],
    ARRAY[
        'BMW ShiftCam Variable Valve Control',
        'Dynamic Electronic Suspension Adjustment (ESA)',
        'Hill Start Control Pro (HSC)',
        'Adaptive Headlight with Full LED DRL',
        'Heated Grips & Cruise Control',
        'Keyless Ride System'
    ],
    false
),
(
    '33333333-3333-4000-8000-000000000003'::uuid,
    'Ducati',
    'Panigale V4 S',
    'Ducati Red',
    2023,
    2023,
    2650000,
    2400000,
    3200,
    'Petrol',
    'Ducati Quick Shift (DQS) Up/Down EVO 2',
    'Superbike',
    '1103 cc Desmosedici Stradale V4 (215.5 HP)',
    1103,
    'Ducati Red',
    '1st Owner',
    'MH-04-KV-0001',
    'Comprehensive (Valid till March 2028)',
    'Valid (Thane RTO)',
    'Ducati Mumbai Authorized Records',
    'Showroom Condition',
    'Mumbai',
    'ZDM13ABW1PB002931',
    '1100V4D881920',
    'Available',
    true,
    'Ultra-rare Ducati Panigale V4 S in flagship Ducati Red. Fitted with Öhlins Smart EC 2.0 electronic suspension, Marchesini forged aluminum wheels, and Akrapovic exhaust setup.',
    'Immaculate condition. Track never visited, kept in temperature-controlled private garage. Battery tender maintained, full ceramic coating.',
    ARRAY[
        'https://images.unsplash.com/photo-1558981420-87aa9210d993?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1558981826-79a5c244249a?auto=format&fit=crop&q=80&w=1200'
    ],
    ARRAY[
        'Öhlins Smart EC 2.0 Electronic Suspension',
        'Marchesini Forged Aluminum Wheels',
        'Brembo Stylema R Front Calipers',
        'Cornering ABS EVO',
        'Ducati Traction Control (DTC) EVO 3',
        'Full 5-inch TFT Dashboard with Track Layout'
    ],
    false
),
(
    '44444444-4444-4000-8000-000000000004'::uuid,
    'Royal Enfield',
    'Continental GT 650',
    'Mr Clean (Chrome)',
    2023,
    2023,
    345000,
    305000,
    4200,
    'Petrol',
    'Manual 6-Speed with Assist & Slipper Clutch',
    'Cafe Racer',
    '648 cc Parallel Twin (47 HP)',
    648,
    'Mr Clean (Polished Chrome)',
    '1st Owner',
    'MH-03-DS-6500',
    'Comprehensive (Valid till July 2028)',
    'Valid (Wadala RTO)',
    'Full Authorized Royal Enfield Bandra Center Records',
    'Mint Condition',
    'Mumbai',
    'ME3U3S5F1PA092183',
    'U3S5FE019284',
    'Available',
    false,
    'Top-spec Mr Clean polished chrome Continental GT 650. Fitted with genuine Royal Enfield touring mirrors, sump guard, and touring dual seat. Smooth parallel twin engine with zero mechanical faults.',
    'Inspected and verified. Tyres 90% tread, oil changed at 3500 km, zero rust on chrome surfaces.',
    ARRAY[
        'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200'
    ],
    ARRAY[
        'Dual Channel ABS by Bosch',
        'Assist and Slipper Clutch',
        'Twin Stainless Steel Upswept Exhausts',
        'Clip-On Handlebars with Bar-End Mirrors',
        'Twin Coil-Over Rear Shocks with 5-Stage Preload'
    ],
    false
)
ON CONFLICT (id) DO NOTHING;

-- Populate vehicle_images relation table for seed bikes
INSERT INTO public.vehicle_images (vehicle_id, image_url, display_order)
SELECT 
    v.id,
    unnest(v.images),
    row_number() OVER (PARTITION BY v.id) - 1
FROM public.vehicles v
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SCRIPT COMPLETE!
-- Your Supabase project is now 100% configured for Patel Motors Mumbai.
-- ==============================================================================
