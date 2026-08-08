/*
# Add frame reference to lens_orders

## Overview
When a customer orders lenses and chooses to buy a frame from the shop, we want to
link that lens order to a specific product (frame) from the catalog. This adds
columns to store the frame product id, name, price, and image so the owner sees
"this frame + custom lenses" in the admin panel — without joining or losing data
if the product is later removed.

## Changes
- ADD COLUMN frame_product_id (uuid, nullable, references products)
- ADD COLUMN frame_name, frame_price, frame_image (denormalized snapshot)
- ADD COLUMN lens_price (so total = lens + frame is computable)

## Security
No policy changes — existing lens_orders policies already cover these columns.
*/

ALTER TABLE public.lens_orders
  ADD COLUMN IF NOT EXISTS frame_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS frame_name text,
  ADD COLUMN IF NOT EXISTS frame_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frame_image text,
  ADD COLUMN IF NOT EXISTS lens_price numeric NOT NULL DEFAULT 0;
