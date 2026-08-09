-- Migration 015: Create organizations table for cloud-synced org data
-- Replaces localStorage with Supabase Database + Supabase Storage

-- Create the organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY DEFAULT 'huayu-hub',
    name TEXT NOT NULL DEFAULT 'Huayu Hub',
    tagline TEXT NOT NULL DEFAULT 'AI x Chinese Learning Community',
    location TEXT NOT NULL DEFAULT 'Ho Chi Minh City, Vietnam',
    email TEXT NOT NULL DEFAULT 'contact@huayuhub.com',
    website TEXT NOT NULL DEFAULT 'https://huayuhub.com',
    avatar_url TEXT,
    banner_url TEXT,
    banner_position TEXT,
    story TEXT NOT NULL DEFAULT '',
    history TEXT NOT NULL DEFAULT '',
    mission TEXT NOT NULL DEFAULT '',
    achievements JSONB NOT NULL DEFAULT '[]',
    partners JSONB NOT NULL DEFAULT '[]',
    social_links JSONB NOT NULL DEFAULT '[]',
    stats JSONB NOT NULL DEFAULT '{"members":0,"teams":0,"activities":0,"yearsActive":0}',
    feedback_images JSONB NOT NULL DEFAULT '[]',
    certificate_images JSONB NOT NULL DEFAULT '[]',
    background_url TEXT,
    ad_banner_url TEXT,
    ad_banner_position TEXT,
    section_visibility JSONB NOT NULL DEFAULT '{"overview":true,"story":true,"members":true,"partners":true,"feedback":true,"certificates":true,"adBanner":true}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read organization data (public page)
CREATE POLICY IF NOT EXISTS "Allow public read"
    ON public.organizations FOR SELECT
    USING (true);

-- Allow authenticated users to update (admin)
CREATE POLICY IF NOT EXISTS "Allow authenticated update"
    ON public.organizations FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert (admin)
CREATE POLICY IF NOT EXISTS "Allow authenticated insert"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Insert default data if not exists
INSERT INTO public.organizations (id, name, tagline, location, email, website)
VALUES ('huayu-hub', 'Huayu Hub', 'AI x Chinese Learning Community', 'Ho Chi Minh City, Vietnam', 'contact@huayuhub.com', 'https://huayuhub.com')
ON CONFLICT (id) DO NOTHING;

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
