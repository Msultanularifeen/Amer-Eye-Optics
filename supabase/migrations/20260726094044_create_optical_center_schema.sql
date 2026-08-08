/*
# Amir Optical Center — Complete Schema

Creates all tables, the is_staff() helper, and RLS policies in the correct order:
1. All tables (profiles first so the function body resolves)
2. is_staff() helper function
3. All RLS policies (function now exists)

## Tables
- profiles: extends auth.users (full_name, phone, role)
- services: eye testing services
- doctors: optometrist profiles
- products: eyewear inventory with SKU, stock, images, features
- appointments: bookings linked to service + doctor
- prescriptions: uploaded Rx files per user
- reviews: product reviews
- wishlist: user favorited products
- orders: customer orders (items as jsonb)
- offers: coupons and seasonal discounts
- blog_posts: eye care articles
- testimonials: customer testimonials

## Security
- RLS enabled on every table.
- Catalog tables (services, doctors, products, offers, blog_posts, testimonials, reviews): public read, staff-only write.
- User-owned tables (appointments, prescriptions, wishlist): owner or staff.
- profiles: own row only (staff can read all).
- appointments/orders: allow anon insert for guest booking/checkout.

## Notes
- profiles.id references auth.users(id) ON DELETE CASCADE.
- Orders store items as jsonb so history survives product edits.
- Appointments allow anon insert so guests can book without an account.
*/

-- ================= TABLES =================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','owner','receptionist','doctor','sales')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Eye',
  price numeric NOT NULL DEFAULT 0,
  duration_mins integer NOT NULL DEFAULT 30
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  qualification text NOT NULL,
  experience_years integer NOT NULL DEFAULT 0,
  specialization text NOT NULL,
  bio text NOT NULL DEFAULT '',
  photo text NOT NULL DEFAULT '',
  available_days text[] NOT NULL DEFAULT ARRAY['Friday','Saturday','Sunday'],
  rating numeric NOT NULL DEFAULT 5.0,
  reviews_count integer NOT NULL DEFAULT 0
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  category text NOT NULL,
  gender text NOT NULL DEFAULT 'unisex' CHECK (gender IN ('men','women','kids','unisex')),
  type text NOT NULL,
  brand text NOT NULL DEFAULT '',
  material text NOT NULL DEFAULT '',
  frame_shape text NOT NULL DEFAULT '',
  frame_size text NOT NULL DEFAULT '',
  lens_size text NOT NULL DEFAULT '',
  frame_color text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  discount_price numeric,
  currency text NOT NULL DEFAULT 'PKR',
  stock integer NOT NULL DEFAULT 0,
  availability text NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock','low_stock','out_of_stock')),
  warranty text NOT NULL DEFAULT '1 Year',
  sku text NOT NULL DEFAULT '',
  barcode text NOT NULL DEFAULT '',
  supplier text NOT NULL DEFAULT '',
  purchase_cost numeric NOT NULL DEFAULT 0,
  expiry date,
  images text[] NOT NULL DEFAULT ARRAY[]::text[],
  description text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT ARRAY[]::text[],
  prescription_ready boolean NOT NULL DEFAULT false,
  lens_type text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 5.0,
  reviews_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_gender_idx ON public.products (gender);
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  age integer,
  gender text,
  reason text,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  date date NOT NULL,
  time text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  prescription_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_user_idx ON public.appointments (user_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments (date);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments (status);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  reviewed boolean NOT NULL DEFAULT false,
  notes text
);
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_id);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number text NOT NULL UNIQUE,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','refunded')),
  channel text NOT NULL DEFAULT 'online' CHECK (channel IN ('online','whatsapp')),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value numeric NOT NULL DEFAULT 0,
  valid_until date NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  image text NOT NULL DEFAULT '',
  author text NOT NULL DEFAULT 'Amir Optical',
  published_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5) DEFAULT 5,
  quote text NOT NULL,
  avatar text NOT NULL DEFAULT ''
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- ================= HELPER FUNCTION =================
-- Created AFTER profiles exists so the body validates.

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('owner','receptionist','doctor','sales')
  );
$$;

-- ================= POLICIES =================

-- profiles
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_staff());
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- services (public read, staff write)
DROP POLICY IF EXISTS "services_read_all" ON public.services;
CREATE POLICY "services_read_all" ON public.services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "services_staff_insert" ON public.services;
CREATE POLICY "services_staff_insert" ON public.services FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "services_staff_update" ON public.services;
CREATE POLICY "services_staff_update" ON public.services FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "services_staff_delete" ON public.services;
CREATE POLICY "services_staff_delete" ON public.services FOR DELETE
  TO authenticated USING (public.is_staff());

-- doctors
DROP POLICY IF EXISTS "doctors_read_all" ON public.doctors;
CREATE POLICY "doctors_read_all" ON public.doctors FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "doctors_staff_insert" ON public.doctors;
CREATE POLICY "doctors_staff_insert" ON public.doctors FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "doctors_staff_update" ON public.doctors;
CREATE POLICY "doctors_staff_update" ON public.doctors FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "doctors_staff_delete" ON public.doctors;
CREATE POLICY "doctors_staff_delete" ON public.doctors FOR DELETE
  TO authenticated USING (public.is_staff());

-- products
DROP POLICY IF EXISTS "products_read_all" ON public.products;
CREATE POLICY "products_read_all" ON public.products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "products_staff_insert" ON public.products;
CREATE POLICY "products_staff_insert" ON public.products FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "products_staff_update" ON public.products;
CREATE POLICY "products_staff_update" ON public.products FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "products_staff_delete" ON public.products;
CREATE POLICY "products_staff_delete" ON public.products FOR DELETE
  TO authenticated USING (public.is_staff());

-- appointments
DROP POLICY IF EXISTS "appt_select_own_or_staff" ON public.appointments;
CREATE POLICY "appt_select_own_or_staff" ON public.appointments FOR SELECT
  TO anon, authenticated USING (auth.uid() = user_id OR public.is_staff());
DROP POLICY IF EXISTS "appt_insert_any" ON public.appointments;
CREATE POLICY "appt_insert_any" ON public.appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "appt_update_own_or_staff" ON public.appointments;
CREATE POLICY "appt_update_own_or_staff" ON public.appointments FOR UPDATE
  TO anon, authenticated USING (auth.uid() = user_id OR public.is_staff()) WITH CHECK (true);
DROP POLICY IF EXISTS "appt_delete_own_or_staff" ON public.appointments;
CREATE POLICY "appt_delete_own_or_staff" ON public.appointments FOR DELETE
  TO anon, authenticated USING (auth.uid() = user_id OR public.is_staff());

-- prescriptions
DROP POLICY IF EXISTS "rx_select_own_or_staff" ON public.prescriptions;
CREATE POLICY "rx_select_own_or_staff" ON public.prescriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_staff());
DROP POLICY IF EXISTS "rx_insert_own" ON public.prescriptions;
CREATE POLICY "rx_insert_own" ON public.prescriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rx_update_own_or_staff" ON public.prescriptions;
CREATE POLICY "rx_update_own_or_staff" ON public.prescriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_staff()) WITH CHECK (true);
DROP POLICY IF EXISTS "rx_delete_own" ON public.prescriptions;
CREATE POLICY "rx_delete_own" ON public.prescriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- reviews
DROP POLICY IF EXISTS "reviews_read_all" ON public.reviews;
CREATE POLICY "reviews_read_all" ON public.reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_delete_own_or_staff" ON public.reviews;
CREATE POLICY "reviews_delete_own_or_staff" ON public.reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_staff());

-- wishlist
DROP POLICY IF EXISTS "wish_select_own" ON public.wishlist;
CREATE POLICY "wish_select_own" ON public.wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wish_insert_own" ON public.wishlist;
CREATE POLICY "wish_insert_own" ON public.wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wish_delete_own" ON public.wishlist;
CREATE POLICY "wish_delete_own" ON public.wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- orders
DROP POLICY IF EXISTS "orders_select_own_or_staff" ON public.orders;
CREATE POLICY "orders_select_own_or_staff" ON public.orders FOR SELECT
  TO anon, authenticated USING (auth.uid() = user_id OR public.is_staff());
DROP POLICY IF EXISTS "orders_insert_any" ON public.orders;
CREATE POLICY "orders_insert_any" ON public.orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "orders_update_staff" ON public.orders;
CREATE POLICY "orders_update_staff" ON public.orders FOR UPDATE
  TO anon, authenticated USING (public.is_staff()) WITH CHECK (true);

-- offers
DROP POLICY IF EXISTS "offers_read_all" ON public.offers;
CREATE POLICY "offers_read_all" ON public.offers FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "offers_staff_insert" ON public.offers;
CREATE POLICY "offers_staff_insert" ON public.offers FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "offers_staff_update" ON public.offers;
CREATE POLICY "offers_staff_update" ON public.offers FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "offers_staff_delete" ON public.offers;
CREATE POLICY "offers_staff_delete" ON public.offers FOR DELETE
  TO authenticated USING (public.is_staff());

-- blog_posts
DROP POLICY IF EXISTS "blog_read_all" ON public.blog_posts;
CREATE POLICY "blog_read_all" ON public.blog_posts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "blog_staff_insert" ON public.blog_posts;
CREATE POLICY "blog_staff_insert" ON public.blog_posts FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "blog_staff_update" ON public.blog_posts;
CREATE POLICY "blog_staff_update" ON public.blog_posts FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "blog_staff_delete" ON public.blog_posts;
CREATE POLICY "blog_staff_delete" ON public.blog_posts FOR DELETE
  TO authenticated USING (public.is_staff());

-- testimonials
DROP POLICY IF EXISTS "test_read_all" ON public.testimonials;
CREATE POLICY "test_read_all" ON public.testimonials FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "test_staff_insert" ON public.testimonials;
CREATE POLICY "test_staff_insert" ON public.testimonials FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "test_staff_update" ON public.testimonials;
CREATE POLICY "test_staff_update" ON public.testimonials FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "test_staff_delete" ON public.testimonials;
CREATE POLICY "test_staff_delete" ON public.testimonials FOR DELETE
  TO authenticated USING (public.is_staff());
