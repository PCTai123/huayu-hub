-- Migration 018: Fix RLS policies for organizations table
-- Problem: Previous policies (migration 015) required authenticated role,
-- but this app uses demo auth (cookie-based), so auth.role() is always 'anon'.
-- This caused all UPDATE/INSERT/UPSERT to be silently blocked.
-- Fix: Replace policies with anon-friendly versions (same pattern as migration 017).

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Allow public read" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.organizations;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.organizations;

-- Allow anon read (everyone can view)
CREATE POLICY "Allow anon read organizations"
    ON public.organizations FOR SELECT USING (true);

-- Allow anon write (app handles auth at application level)
CREATE POLICY "Allow anon write organizations"
    ON public.organizations FOR ALL USING (true) WITH CHECK (true);
