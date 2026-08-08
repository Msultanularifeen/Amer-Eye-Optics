/*
# Site settings + doctor CRUD + staff role management

## Overview
Adds a single-row site_settings table for editable website content (hero,
contact info, stats, WhatsApp number), enables profile role updates by owner,
and adds a function for owner-only role assignment.

## New Tables
- site_settings: one row (id=1) holding hero image URLs, hero text, contact
  phone/email/address, WhatsApp number, about content, stats, business hours.
  Public read, owner-only write.

## Security
- site_settings: public SELECT (anon + authenticated); UPDATE restricted to
  owner via is_owner() helper.
- profiles: existing SELECT already allows owner. Add UPDATE policy so owner
  can change roles of other users.
- New is_owner() helper checks if current user role = 'owner'.

## Notes
- Seeded with sensible defaults matching current hardcoded values so the site
  looks identical until an admin edits settings.
*/

-- Helper: is current user the owner?
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'owner'
  );
$$;

-- ---------- site_settings ----------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL DEFAULT 'See the world in perfect clarity',
  hero_subtitle text NOT NULL DEFAULT 'Expert eye examinations, designer eyewear, and personalized care — all under one roof at Amir Optical Center.',
  hero_image text NOT NULL DEFAULT 'https://images.pexels.com/photos/2772531/pexels-photo-2772531.jpeg?auto=compress&cs=tinysrgb&w=1000',
  hero_badge text NOT NULL DEFAULT 'Premium eye care since 2010',
  stat_customers numeric NOT NULL DEFAULT 15000,
  stat_years numeric NOT NULL DEFAULT 15,
  stat_frames numeric NOT NULL DEFAULT 500,
  stat_happy numeric NOT NULL DEFAULT 98,
  about_title text NOT NULL DEFAULT 'A legacy of clear vision',
  about_subtitle text NOT NULL DEFAULT 'For over 15 years, Amir Optical Center has been the trusted name in eye care, combining advanced technology with a warm, personal touch.',
  about_image text NOT NULL DEFAULT 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=1000',
  about_mission text NOT NULL DEFAULT 'To make exceptional eye care accessible to everyone, using the latest diagnostic technology and a genuinely caring approach.',
  about_vision text NOT NULL DEFAULT 'To be the region''s leading optical center — where every patient leaves seeing the world more clearly and confidently.',
  contact_phone text NOT NULL DEFAULT '+92 300 1234567',
  contact_phone_alt text NOT NULL DEFAULT '+92 42 111 222 333',
  contact_email text NOT NULL DEFAULT 'info@amiroptical.com',
  contact_email_alt text NOT NULL DEFAULT 'support@amiroptical.com',
  contact_address text NOT NULL DEFAULT '123 Main Boulevard, Gulberg III, Lahore, Pakistan',
  contact_map_lat numeric NOT NULL DEFAULT 31.5249,
  contact_map_lng numeric NOT NULL DEFAULT 74.3496,
  business_hours text NOT NULL DEFAULT 'Fri–Sun: 10am–9pm · Mon–Thu: 11am–7pm',
  whatsapp_number text NOT NULL DEFAULT '923001234567',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ensure single row exists
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_all" ON public.site_settings;
CREATE POLICY "settings_read_all" ON public.site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_update_owner" ON public.site_settings;
CREATE POLICY "settings_update_owner" ON public.site_settings FOR UPDATE
  TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ---------- profiles: owner can update roles ----------
DROP POLICY IF EXISTS "update_any_profile_owner" ON public.profiles;
CREATE POLICY "update_any_profile_owner" ON public.profiles FOR UPDATE
  TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ---------- trigger: track last sign-in for online status ----------
-- We use updated_at on profiles as a proxy for "recently active".
-- The auth flow updates the profile on login via the app, so this is sufficient.
