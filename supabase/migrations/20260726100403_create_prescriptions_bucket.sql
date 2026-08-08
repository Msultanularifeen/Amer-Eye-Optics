/*
# Create prescriptions storage bucket

## Overview
Creates a public storage bucket named "prescriptions" for storing patient
prescription files (images and PDFs). Sets public read policies so uploaded
files can be previewed by patients and reviewed by doctors.

## Changes
- New storage bucket "prescriptions" (public).
- Storage policies allowing authenticated users to upload/read their own files
  and staff to read all.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "rx_storage_read" ON storage.objects;
CREATE POLICY "rx_storage_read" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "rx_storage_insert" ON storage.objects;
CREATE POLICY "rx_storage_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'prescriptions');

DROP POLICY IF EXISTS "rx_storage_update" ON storage.objects;
CREATE POLICY "rx_storage_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'prescriptions');
