/*
# Lens types and lens orders

## Overview
Adds a lens catalog (blue cut, anti-glare, photochromic, etc.) and a lens ordering
system where users pick a lens type, enter their prescription sphere/cylinder/axis
values (+2.00, -1.50, etc.), optionally select a frame, and place an order that
staff can view and confirm in the admin panel.

## New Tables
- `lens_types`: catalog of available lens types with price, description, features.
  Columns: id, name, slug, description, price, features (text[]), image, is_active,
  sort_order, created_at.
- `lens_orders`: lens prescription orders.
  Columns: id, user_id, lens_type_id, frame (text, optional), right_sphere, right_cylinder,
  right_axis, left_sphere, left_cylinder, left_axis, pd_distance, customer_name, phone,
  email, address, notes, status, created_at.

## Security
- lens_types: public read (anon + authenticated), staff write.
- lens_orders: authenticated users insert/read own; staff read all + update status.
*/

-- ---------- lens_types ----------
CREATE TABLE IF NOT EXISTS public.lens_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  features text[] NOT NULL DEFAULT ARRAY[]::text[],
  image text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lens_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lt_read_all" ON public.lens_types;
CREATE POLICY "lt_read_all" ON public.lens_types FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "lt_staff_insert" ON public.lens_types;
CREATE POLICY "lt_staff_insert" ON public.lens_types FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "lt_staff_update" ON public.lens_types;
CREATE POLICY "lt_staff_update" ON public.lens_types FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "lt_staff_delete" ON public.lens_types;
CREATE POLICY "lt_staff_delete" ON public.lens_types FOR DELETE
  TO authenticated USING (public.is_staff());

-- ---------- lens_orders ----------
CREATE TABLE IF NOT EXISTS public.lens_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lens_type_id uuid NOT NULL REFERENCES public.lens_types(id) ON DELETE RESTRICT,
  frame text,
  right_sphere text NOT NULL DEFAULT '',
  right_cylinder text NOT NULL DEFAULT '',
  right_axis text NOT NULL DEFAULT '',
  left_sphere text NOT NULL DEFAULT '',
  left_cylinder text NOT NULL DEFAULT '',
  left_axis text NOT NULL DEFAULT '',
  pd_distance text,
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lens_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lo_user_select_own" ON public.lens_orders;
CREATE POLICY "lo_user_select_own" ON public.lens_orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "lo_insert" ON public.lens_orders;
CREATE POLICY "lo_insert" ON public.lens_orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "lo_staff_update" ON public.lens_orders;
CREATE POLICY "lo_staff_update" ON public.lens_orders FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "lo_staff_delete" ON public.lens_orders;
CREATE POLICY "lo_staff_delete" ON public.lens_orders FOR DELETE
  TO authenticated USING (public.is_staff());

-- ---------- seed lens types ----------
INSERT INTO public.lens_types (name, slug, description, price, features, image, is_active, sort_order) VALUES
('Blue Cut Lens', 'blue-cut', 'Blocks harmful blue light from digital screens. Perfect for daily computer and phone users.', 2500, ARRAY['Reduces eye strain', 'Blocks blue light', 'Anti-glare coating', 'Scratch resistant'], 'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=800', true, 1),
('Anti-Glare Lens', 'anti-glare', 'Reduces reflections for clearer vision and better appearance in photos.', 1800, ARRAY['Reduces glare', 'Better night vision', 'Easy to clean', 'UV protection'], 'https://images.pexels.com/photos/8430586/pexels-photo-8430586.jpeg?auto=compress&cs=tinysrgb&w=800', true, 2),
('Photochromic Lens', 'photochromic', 'Automatically darkens in sunlight and clears indoors. Two lenses in one.', 4500, ARRAY['Auto-tinting', 'UV protection', 'Indoor & outdoor', 'No need for sunglasses'], 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800', true, 3),
('Progressive Lens', 'progressive', 'Multifocal lens for clear vision at all distances — near, mid, and far — without lines.', 8000, ARRAY['No visible lines', 'Near & far vision', 'Smooth transition', 'Premium quality'], 'https://images.pexels.com/photos/3783385/pexels-photo-3783385.jpeg?auto=compress&cs=tinysrgb&w=800', true, 4),
('Single Vision Lens', 'single-vision', 'Standard lens for single prescription — nearsightedness or farsightedness.', 1200, ARRAY['Lightweight', 'Clear vision', 'Affordable', 'Scratch resistant'], 'https://images.pexels.com/photos/277424/pexels-photo-277424.jpeg?auto=compress&cs=tinysrgb&w=800', true, 5),
('Bifocal Lens', 'bifocal', 'Two prescriptions in one lens — distance vision on top, reading on the bottom.', 3500, ARRAY['Two prescriptions', 'Distance & reading', 'Durable', 'Classic design'], 'https://images.pexels.com/photos/8430586/pexels-photo-8430586.jpeg?auto=compress&cs=tinysrgb&w=800', true, 6),
('Polarized Sunglass Lens', 'polarized', 'Reduces glare from water and roads. Perfect for driving and outdoor activities.', 3000, ARRAY['Reduces glare', '100% UV protection', 'Better contrast', 'Ideal for driving'], 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=800', true, 7),
('High Index Thin Lens', 'high-index', 'Ultra-thin and lightweight lens for strong prescriptions. Looks better and feels lighter.', 4000, ARRAY['Ultra thin', 'Lightweight', 'For strong prescriptions', 'Stylish appearance'], 'https://images.pexels.com/photos/2772531/pexels-photo-2772531.jpeg?auto=compress&cs=tinysrgb&w=800', true, 8)
ON CONFLICT (slug) DO NOTHING;
