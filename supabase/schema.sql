-- =====================================================
-- Huayu Hub - Supabase PostgreSQL Schema
-- =====================================================
-- Schema version: 1.0.0
-- Created: 2026-08-07
-- Description: Database schema for Huayu Hub organization management platform
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_roles_name ON roles(name);

-- =====================================================
-- 2. TEAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_order ON teams(order_index);

-- =====================================================
-- 3. PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   VARCHAR(255),
    avatar_url  TEXT,
    bio         TEXT,
    phone       VARCHAR(20),
    email       VARCHAR(255),
    birth_date  DATE,
    joined_date DATE,
    role_id     INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    team_id     INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_profiles_team_id ON profiles(team_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================================================
-- 4. ORGANIZATION
-- =====================================================
CREATE TABLE IF NOT EXISTS organization (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    logo_url      TEXT,
    banner_url    TEXT,
    location      VARCHAR(255),
    contact_email VARCHAR(255),
    website       VARCHAR(255),
    description   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ORGANIZATION_WEBSITES
-- =====================================================
CREATE TABLE IF NOT EXISTS organization_websites (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id     UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    url        TEXT NOT NULL,
    icon       VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_websites_org_id ON organization_websites(org_id);

-- =====================================================
-- 6. POSTS
-- =====================================================
CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        VARCHAR(500) NOT NULL,
    content      TEXT,
    author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visibility   VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'team_only')),
    team_id      INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    images       TEXT[] DEFAULT '{}',
    views_count  INTEGER DEFAULT 0,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_team_id ON posts(team_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- =====================================================
-- 7. COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- 8. EVENTS (Extracurricular Activities)
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title             VARCHAR(500) NOT NULL,
    date              DATE NOT NULL,
    time              TIME,
    organization_name VARCHAR(255),
    reference_link    TEXT,
    registration_link TEXT,
    topic             VARCHAR(255),
    description       TEXT,
    created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- =====================================================
-- 9. CALENDAR_EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      VARCHAR(500) NOT NULL,
    date       DATE NOT NULL,
    time       TIME,
    type       VARCHAR(20) NOT NULL DEFAULT 'activity' CHECK (type IN ('activity', 'deadline', 'birthday')),
    event_id   UUID REFERENCES events(id) ON DELETE SET NULL,
    user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_event_id ON calendar_events(event_id);
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);

-- =====================================================
-- 10. ANNOUNCEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      VARCHAR(500) NOT NULL,
    content    TEXT NOT NULL,
    posted_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_posted_by ON announcements(posted_by);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- =====================================================
-- 11. DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(255) NOT NULL,
    type       VARCHAR(50) NOT NULL CHECK (type IN ('google_drive', 'google_photos', 'certificate_website')),
    url        TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_created_by ON documents(created_by);

-- =====================================================
-- 12. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type       VARCHAR(50) NOT NULL CHECK (type IN ('mention', 'new_post', 'new_activity', 'new_deadline', 'birthday', 'new_announcement')),
    title      VARCHAR(255) NOT NULL,
    content    TEXT,
    read       BOOLEAN DEFAULT FALSE,
    related_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 13. ACTIVITY_SOURCES
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_sources (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_sources_name ON activity_sources(name);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Seed Roles
INSERT INTO roles (name, permissions) VALUES
('Founder', '{"all": true}'::jsonb),
('Co-Founder', '{"all": true}'::jsonb),
('Admin', '{"manage_users": true, "manage_content": true, "manage_events": true}'::jsonb),
('Member', '{"create_posts": true, "create_comments": true, "create_events": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Seed Teams
INSERT INTO teams (name, description, order_index) VALUES
('Media Team', 'Responsible for media production and broadcasting', 1),
('Design Team', 'Responsible for visual design and creative work', 2),
('Content Team', 'Responsible for content creation and editing', 3),
('Teaching Assistant Team', 'Responsible for teaching support and assistance', 4),
('Operation Team', 'Responsible for daily operations and logistics', 5),
('Partner Team', 'Responsible for partnership and collaboration', 6)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Helper function: Check if current user has elevated role
CREATE OR REPLACE FUNCTION public.is_elevated_role()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = auth.uid()
        AND r.name IN ('Founder', 'Co-Founder', 'Admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is Founder or Co-Founder
CREATE OR REPLACE FUNCTION public.is_founder_or_cofounder()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = auth.uid()
        AND r.name IN ('Founder', 'Co-Founder')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is Founder
CREATE OR REPLACE FUNCTION public.is_founder()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = auth.uid()
        AND r.name = 'Founder'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if current user is Founder or Admin
CREATE OR REPLACE FUNCTION public.is_founder_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN roles r ON p.role_id = r.id
        WHERE p.id = auth.uid()
        AND r.name IN ('Founder', 'Admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user owns the record
CREATE OR REPLACE FUNCTION public.is_owner(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- RLS: ROLES
-- -----------------------------------------------------
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select_authenticated ON roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY roles_insert_elevated ON roles
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY roles_update_elevated ON roles
    FOR UPDATE TO authenticated USING (is_elevated_role());

CREATE POLICY roles_delete_elevated ON roles
    FOR DELETE TO authenticated USING (is_elevated_role());

-- -----------------------------------------------------
-- RLS: PROFILES
-- -----------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_authenticated ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY profiles_insert_elevated ON profiles
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY profiles_update_elevated_or_own ON profiles
    FOR UPDATE TO authenticated USING (
        is_elevated_role() OR is_owner(id)
    );

CREATE POLICY profiles_delete_elevated ON profiles
    FOR DELETE TO authenticated USING (is_elevated_role());

-- -----------------------------------------------------
-- RLS: TEAMS
-- -----------------------------------------------------
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY teams_select_authenticated ON teams
    FOR SELECT TO authenticated USING (true);

CREATE POLICY teams_insert_elevated ON teams
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY teams_update_elevated ON teams
    FOR UPDATE TO authenticated USING (is_elevated_role());

CREATE POLICY teams_delete_elevated ON teams
    FOR DELETE TO authenticated USING (is_elevated_role());

-- -----------------------------------------------------
-- RLS: ORGANIZATION
-- -----------------------------------------------------
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

CREATE POLICY organization_select_authenticated ON organization
    FOR SELECT TO authenticated USING (true);

CREATE POLICY organization_insert_founder ON organization
    FOR INSERT TO authenticated WITH CHECK (is_founder_or_cofounder());

CREATE POLICY organization_update_founder ON organization
    FOR UPDATE TO authenticated USING (is_founder_or_cofounder());

CREATE POLICY organization_delete_founder ON organization
    FOR DELETE TO authenticated USING (is_founder_or_cofounder());

-- -----------------------------------------------------
-- RLS: ORGANIZATION_WEBSITES
-- -----------------------------------------------------
ALTER TABLE organization_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_websites_select_authenticated ON organization_websites
    FOR SELECT TO authenticated USING (true);

CREATE POLICY org_websites_insert_founder ON organization_websites
    FOR INSERT TO authenticated WITH CHECK (is_founder_or_cofounder());

CREATE POLICY org_websites_update_founder ON organization_websites
    FOR UPDATE TO authenticated USING (is_founder_or_cofounder());

CREATE POLICY org_websites_delete_founder ON organization_websites
    FOR DELETE TO authenticated USING (is_founder_or_cofounder());

-- -----------------------------------------------------
-- RLS: POSTS
-- -----------------------------------------------------
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select_authenticated ON posts
    FOR SELECT TO authenticated USING (
        visibility = 'public'
        OR visibility = 'team_only' AND EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND (
                p.team_id = posts.team_id
                OR is_elevated_role()
            )
        )
    );

CREATE POLICY posts_insert_authenticated ON posts
    FOR INSERT TO authenticated WITH CHECK (
        author_id = auth.uid()
    );

CREATE POLICY posts_update_elevated_or_own ON posts
    FOR UPDATE TO authenticated USING (
        is_elevated_role() OR is_owner(author_id)
    );

CREATE POLICY posts_delete_elevated_or_own ON posts
    FOR DELETE TO authenticated USING (
        is_elevated_role() OR is_owner(author_id)
    );

-- -----------------------------------------------------
-- RLS: COMMENTS
-- -----------------------------------------------------
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY comments_select_authenticated ON comments
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM posts p
            WHERE p.id = comments.post_id
            AND (
                p.visibility = 'public'
                OR p.visibility = 'team_only' AND EXISTS (
                    SELECT 1 FROM profiles pr
                    WHERE pr.id = auth.uid()
                    AND (pr.team_id = p.team_id OR is_elevated_role())
                )
            )
        )
    );

CREATE POLICY comments_insert_authenticated ON comments
    FOR INSERT TO authenticated WITH CHECK (
        author_id = auth.uid()
    );

CREATE POLICY comments_update_elevated_or_own ON comments
    FOR UPDATE TO authenticated USING (
        is_elevated_role() OR is_owner(author_id)
    );

CREATE POLICY comments_delete_elevated_or_own ON comments
    FOR DELETE TO authenticated USING (
        is_elevated_role() OR is_owner(author_id)
    );

-- -----------------------------------------------------
-- RLS: EVENTS
-- -----------------------------------------------------
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select_authenticated ON events
    FOR SELECT TO authenticated USING (true);

CREATE POLICY events_insert_authenticated ON events
    FOR INSERT TO authenticated WITH CHECK (
        is_elevated_role() OR is_owner(created_by)
    );

CREATE POLICY events_update_elevated_or_own ON events
    FOR UPDATE TO authenticated USING (
        is_elevated_role() OR is_owner(created_by)
    );

CREATE POLICY events_delete_elevated_or_own ON events
    FOR DELETE TO authenticated USING (
        is_elevated_role() OR is_owner(created_by)
    );

-- -----------------------------------------------------
-- RLS: CALENDAR_EVENTS
-- -----------------------------------------------------
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_events_select_authenticated ON calendar_events
    FOR SELECT TO authenticated USING (true);

CREATE POLICY calendar_events_insert_elevated ON calendar_events
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY calendar_events_update_elevated ON calendar_events
    FOR UPDATE TO authenticated USING (is_elevated_role());

CREATE POLICY calendar_events_delete_elevated ON calendar_events
    FOR DELETE TO authenticated USING (is_elevated_role());

-- -----------------------------------------------------
-- RLS: ANNOUNCEMENTS
-- -----------------------------------------------------
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY announcements_select_authenticated ON announcements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY announcements_insert_founder_admin ON announcements
    FOR INSERT TO authenticated WITH CHECK (is_founder_or_admin());

CREATE POLICY announcements_update_founder_admin ON announcements
    FOR UPDATE TO authenticated USING (is_founder_or_admin());

CREATE POLICY announcements_delete_founder_admin ON announcements
    FOR DELETE TO authenticated USING (is_founder_or_admin());

-- -----------------------------------------------------
-- RLS: DOCUMENTS
-- -----------------------------------------------------
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select_authenticated ON documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY documents_insert_elevated ON documents
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY documents_update_founder_cofounder ON documents
    FOR UPDATE TO authenticated USING (is_founder_or_cofounder());

CREATE POLICY documents_delete_founder_cofounder ON documents
    FOR DELETE TO authenticated USING (is_founder_or_cofounder());

-- -----------------------------------------------------
-- RLS: NOTIFICATIONS
-- -----------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON notifications
    FOR SELECT TO authenticated USING (
        is_owner(user_id)
    );

CREATE POLICY notifications_insert_elevated ON notifications
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE TO authenticated USING (
        is_owner(user_id)
    );

CREATE POLICY notifications_delete_own ON notifications
    FOR DELETE TO authenticated USING (
        is_owner(user_id)
    );

-- -----------------------------------------------------
-- RLS: ACTIVITY_SOURCES
-- -----------------------------------------------------
ALTER TABLE activity_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY activity_sources_select_authenticated ON activity_sources
    FOR SELECT TO authenticated USING (true);

CREATE POLICY activity_sources_insert_elevated ON activity_sources
    FOR INSERT TO authenticated WITH CHECK (is_elevated_role());

CREATE POLICY activity_sources_update_elevated ON activity_sources
    FOR UPDATE TO authenticated USING (is_elevated_role());

CREATE POLICY activity_sources_delete_elevated ON activity_sources
    FOR DELETE TO authenticated USING (is_elevated_role());

-- =====================================================
-- TRIGGERS: AUTO-UPDATE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_updated_at
    BEFORE UPDATE ON organization
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF SCHEMA
-- =====================================================
