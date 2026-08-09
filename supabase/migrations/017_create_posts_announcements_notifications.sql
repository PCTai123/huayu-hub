-- Migration 017: Create posts, announcements, and notifications tables
-- Moves news feed, announcements, and notifications from localStorage to Supabase DB
-- NOTE: This app uses demo auth (cookie-based), not Supabase Auth.
-- RLS policies allow anon access for read/write since auth is handled at app level.

-- Drop existing tables if they were created by an older version of this migration
-- (older versions may have had missing columns like author_name on announcements)
DROP TABLE IF EXISTS public.post_comments;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.notifications;

-- ============================================
-- POSTS TABLE (News Feed)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    images JSONB NOT NULL DEFAULT '[]',
    author_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'You',
    author_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    views INTEGER NOT NULL DEFAULT 0,
    likes INTEGER NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'public',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (idempotent)
DROP POLICY IF EXISTS "Allow public read posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated create posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated update posts" ON public.posts;
DROP POLICY IF EXISTS "Allow authenticated delete posts" ON public.posts;
DROP POLICY IF EXISTS "Allow anon all posts" ON public.posts;

-- Allow anon read (everyone can view posts)
CREATE POLICY "Allow anon read posts"
    ON public.posts FOR SELECT USING (true);

-- Allow anon create/update/delete (app handles auth at application level)
CREATE POLICY "Allow anon write posts"
    ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_posts_updated_at();

-- ============================================
-- POST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id TEXT,
    author_name TEXT NOT NULL DEFAULT 'You',
    author_avatar TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read comments" ON public.post_comments;
DROP POLICY IF EXISTS "Allow authenticated create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Allow authenticated delete comments" ON public.post_comments;
DROP POLICY IF EXISTS "Allow anon all comments" ON public.post_comments;

CREATE POLICY "Allow anon read comments"
    ON public.post_comments FOR SELECT USING (true);

CREATE POLICY "Allow anon write comments"
    ON public.post_comments FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_name TEXT NOT NULL DEFAULT 'Admin',
    author_avatar TEXT,
    date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow authenticated delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow anon all announcements" ON public.announcements;

CREATE POLICY "Allow anon read announcements"
    ON public.announcements FOR SELECT USING (true);

CREATE POLICY "Allow anon write announcements"
    ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- NOTIFICATIONS TABLE (shared across all users)
-- user_id is NULL for global notifications visible to all users
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'announcement',
    related_id TEXT,
    related_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow authenticated create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anon all notifications" ON public.notifications;

-- Allow everyone to read all notifications (global notifications + app handles user-level filtering)
CREATE POLICY "Allow anon read notifications"
    ON public.notifications FOR SELECT USING (true);

-- Allow anon create/update (app handles auth at application level)
CREATE POLICY "Allow anon write notifications"
    ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for all new tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Seed default announcement (only if table is empty)
INSERT INTO public.announcements (title, content, author_name, date)
SELECT
    'Chao mung den voi Huayu Hub',
    'Day la bai dang dau tien tren bang tin moi cua chung ta. Hy vong moi nguoi se thich khong gian nay de chia se thong tin va ket noi voi nhau!',
    'Admin',
    CURRENT_DATE::text
WHERE NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1);
