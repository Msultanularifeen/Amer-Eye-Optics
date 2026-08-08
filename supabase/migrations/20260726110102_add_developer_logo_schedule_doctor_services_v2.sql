/*
# Developer info, logo/favicon, doctor schedules, doctor_services, images bucket

## Overview
Adds developer credit fields, logo/favicon/site name to site_settings.
Adds doctor schedule (work_start, work_end, slot_duration, off_days) and
doctor_services junction table so booking shows only doctors who offer a service.
Adds images storage bucket for uploads.

## Changes
- site_settings: +developer_name, developer_photo, developer_whatsapp,
  developer_bio, developer_title, logo_url, favicon_url, site_name
- doctors: +work_start, work_end, slot_duration_mins, off_days
- doctor_services: junction table (doctor_id, service_id) with unique constraint
- Storage bucket "images" (public) for product/doctor/hero image uploads

## Security
- site_settings: public read, owner-only update (existing policies cover new columns).
- doctor_services: public read, staff write (like other catalog tables).
- images bucket: public read, authenticated upload.
*/

-- ---------- site_settings additions ----------
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS developer_name text NOT NULL DEFAULT 'Muhammad Sultan Ul Arifeen',
  ADD COLUMN IF NOT EXISTS developer_whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS developer_bio text NOT NULL DEFAULT 'Passionate full-stack developer & designer creating beautiful, functional business websites.',
  ADD COLUMN IF NOT EXISTS developer_title text NOT NULL DEFAULT 'Developer & Designer',
  ADD COLUMN IF NOT EXISTS developer_photo text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS favicon_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS site_name text NOT NULL DEFAULT 'Amir Optical';

-- ---------- doctor schedule + off days ----------
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS work_start text NOT NULL DEFAULT '10:00',
  ADD COLUMN IF NOT EXISTS work_end text NOT NULL DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS slot_duration_mins integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS off_days text[] NOT NULL DEFAULT ARRAY[]::text[];

-- ---------- doctor_services junction ----------
CREATE TABLE IF NOT EXISTS public.doctor_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE (doctor_id, service_id)
);
ALTER TABLE public.doctor_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ds_read_all" ON public.doctor_services;
CREATE POLICY "ds_read_all" ON public.doctor_services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ds_staff_insert" ON public.doctor_services;
CREATE POLICY "ds_staff_insert" ON public.doctor_services FOR INSERT
  TO authenticated WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "ds_staff_delete" ON public.doctor_services;
CREATE POLICY "ds_staff_delete" ON public.doctor_services FOR DELETE
  TO authenticated USING (public.is_staff());

-- ---------- images storage bucket ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "images_read_all" ON storage.objects;
CREATE POLICY "images_read_all" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "images_insert_auth" ON storage.objects;
CREATE POLICY "images_insert_auth" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "images_update_auth" ON storage.objects;
CREATE POLICY "images_update_auth" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'images');

DROP POLICY IF EXISTS "images_delete_auth" ON storage.objects;
CREATE POLICY "images_delete_auth" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'images');

-- ---------- seed doctor_services: assign all services to all doctors ----------
INSERT INTO public.doctor_services (doctor_id, service_id)
SELECT d.id, s.id FROM public.doctors d CROSS JOIN public.services s
ON CONFLICT (doctor_id, service_id) DO NOTHING;
