-- Migration 019: Fix Storage bucket RLS + re-ensure organizations table RLS for anon
-- Problem: Migration 014 created storage policies requiring "authenticated" role,
-- but this app uses demo cookie-based auth (anon key only).
-- This caused all image uploads to fail silently (uploadImageToStorage falls back to base64).
-- Additionally, migration 018's table RLS fix may not have been applied yet.
-- This migration ensures both Storage and Table RLS are anon-friendly.

-- ════════════════════════════════════════════
-- Part 1: Fix Storage bucket RLS for anon access
-- ════════════════════════════════════════════

-- Drop old restrictive storage policies
DROP POLICY IF EXISTS "Allow public access to organization-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to organization-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from organization-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to organization-images" ON storage.objects;

-- Allow anon read (public images)
CREATE POLICY "Allow anon read org-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'organization-images');

-- Allow anon insert (app uses anon key with demo auth)
CREATE POLICY "Allow anon insert org-images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'organization-images');

-- Allow anon delete
CREATE POLICY "Allow anon delete org-images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'organization-images');

-- Allow anon update
CREATE POLICY "Allow anon update org-images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'organization-images')
    WITH CHECK (bucket_id = 'organization-images');

-- ════════════════════════════════════════════
-- Part 2: Re-ensure organizations table RLS is anon-friendly
-- (Duplicate of migration 018 in case it wasn't applied)
-- ════════════════════════════════════════════

-- Drop any restrictive policies that might still exist
DROP POLICY IF EXISTS "Allow public read" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.organizations;
DROP POLICY IF EXISTS "Allow anon read organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow anon write organizations" ON public.organizations;

-- Allow anon read (everyone can view the partner page)
CREATE POLICY "Allow anon read organizations v2"
    ON public.organizations FOR SELECT USING (true);

-- Allow anon write (app handles auth at application level via demo cookie)
CREATE POLICY "Allow anon write organizations v2"
    ON public.organizations FOR ALL USING (true) WITH CHECK (true);
