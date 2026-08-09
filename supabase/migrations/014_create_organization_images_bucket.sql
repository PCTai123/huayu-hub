-- Migration: Create organization-images bucket for Supabase Storage
-- This creates a public bucket for storing organization images
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- Create the storage bucket
insert into storage.buckets (id, name, public)
values ('organization-images', 'organization-images', true)
on conflict (id) do update set public = true;

-- Set up RLS policies for public access (images should be publicly readable)
-- Allow anonymous users to read images
create policy "Allow public access to organization-images"
on storage.objects for select
using (bucket_id = 'organization-images');

-- Allow authenticated users to upload images
create policy "Allow authenticated uploads to organization-images"
on storage.objects for insert
with check (bucket_id = 'organization-images');

-- Allow authenticated users to delete their own images
create policy "Allow authenticated deletes from organization-images"
on storage.objects for delete
using (bucket_id = 'organization-images');

-- Allow authenticated users to update their own images
create policy "Allow authenticated updates to organization-images"
on storage.objects for update
using (bucket_id = 'organization-images')
with check (bucket_id = 'organization-images');
