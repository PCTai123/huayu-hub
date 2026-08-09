-- Migration 016: Split single ad banner into top + bottom banners
-- Adds ad_banner_top_url, ad_banner_top_position, ad_banner_bottom_url, ad_banner_bottom_position columns
-- Migrates existing ad_banner_url data to ad_banner_top_url (backward compatibility)

-- Add new columns (IF NOT EXISTS for safe re-run)
ALTER TABLE public.organizations
    ADD COLUMN IF NOT EXISTS ad_banner_top_url TEXT,
    ADD COLUMN IF NOT EXISTS ad_banner_top_position TEXT DEFAULT '50% 50%',
    ADD COLUMN IF NOT EXISTS ad_banner_bottom_url TEXT,
    ADD COLUMN IF NOT EXISTS ad_banner_bottom_position TEXT DEFAULT '50% 50%';

-- Migrate existing ad_banner_url -> ad_banner_top_url (only if top is empty)
UPDATE public.organizations
SET ad_banner_top_url = ad_banner_url,
    ad_banner_top_position = COALESCE(ad_banner_position, '50% 50%')
WHERE ad_banner_url IS NOT NULL
  AND ad_banner_url != ''
  AND (ad_banner_top_url IS NULL OR ad_banner_top_url = '');

-- Migrate section_visibility: adBanner -> adBannerTop (only if adBannerTop doesn't exist yet)
UPDATE public.organizations
SET section_visibility = jsonb_set(
    section_visibility - 'adBanner',
    '{adBannerTop}',
    COALESCE(section_visibility->'adBanner', 'false'::jsonb)
)
WHERE section_visibility ? 'adBanner'
  AND NOT (section_visibility ? 'adBannerTop');

-- Add adBannerBottom = false if it doesn't exist
UPDATE public.organizations
SET section_visibility = jsonb_set(
    section_visibility,
    '{adBannerBottom}',
    'false'::jsonb
)
WHERE NOT (section_visibility ? 'adBannerBottom');
