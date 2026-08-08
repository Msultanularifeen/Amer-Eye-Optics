/*
# Add contact_messages table

## Overview
Stores messages submitted through the public Contact page form so staff can
review and follow up on general enquiries (not appointment bookings).

## New Table
- contact_messages: id, name, email, phone, subject, message, created_at, is_read

## Security
- RLS enabled.
- Anyone (anon + authenticated) can INSERT a message.
- Only staff can SELECT/UPDATE messages (for managing in admin later).
*/

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_insert_any" ON public.contact_messages;
CREATE POLICY "contact_insert_any" ON public.contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_select_staff" ON public.contact_messages;
CREATE POLICY "contact_select_staff" ON public.contact_messages FOR SELECT
  TO authenticated USING (public.is_staff());

DROP POLICY IF EXISTS "contact_update_staff" ON public.contact_messages;
CREATE POLICY "contact_update_staff" ON public.contact_messages FOR UPDATE
  TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
