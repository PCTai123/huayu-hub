/* Migration 011: Create missing tables (tasks, birthday_events, notifications) */
/* + Fix RLS recursion + Seed birthday events from existing profiles */
/* Run this in Supabase SQL Editor if tasks table doesn't exist */

/* ============================================ */
/* PART 1: Tasks Table                          */
/* ============================================ */
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    team VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    related_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* Indexes */
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_team ON public.tasks(team);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON public.tasks(start_date);

/* RLS Policies */
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tasks viewable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks viewable by authenticated users"
    ON public.tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Tasks insertable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks insertable by authenticated users"
    ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Tasks updatable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks updatable by authenticated users"
    ON public.tasks FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Tasks deletable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks deletable by authenticated users"
    ON public.tasks FOR DELETE TO authenticated USING (true);

/* Trigger: auto-update updated_at */
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

/* ============================================ */
/* PART 2: Birthday Events Table                */
/* ============================================ */
CREATE TABLE IF NOT EXISTS public.birthday_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    event_date DATE NOT NULL,
    year INTEGER NOT NULL,
    notified_7days BOOLEAN DEFAULT FALSE,
    notified_1day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year)
);

CREATE INDEX IF NOT EXISTS idx_birthday_events_user_id ON public.birthday_events(user_id);
CREATE INDEX IF NOT EXISTS idx_birthday_events_event_date ON public.birthday_events(event_date);
CREATE INDEX IF NOT EXISTS idx_birthday_events_year ON public.birthday_events(year);

/* RLS */
ALTER TABLE public.birthday_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Birthday events viewable by authenticated users" ON public.birthday_events;
CREATE POLICY "Birthday events viewable by authenticated users"
    ON public.birthday_events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Birthday events insertable by authenticated users" ON public.birthday_events;
CREATE POLICY "Birthday events insertable by authenticated users"
    ON public.birthday_events FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Birthday events updatable by authenticated users" ON public.birthday_events;
CREATE POLICY "Birthday events updatable by authenticated users"
    ON public.birthday_events FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Birthday events deletable by authenticated users" ON public.birthday_events;
CREATE POLICY "Birthday events deletable by authenticated users"
    ON public.birthday_events FOR DELETE TO authenticated USING (true);

/* Trigger */
DROP TRIGGER IF EXISTS update_birthday_events_updated_at ON public.birthday_events;
CREATE TRIGGER update_birthday_events_updated_at
    BEFORE UPDATE ON public.birthday_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

/* ============================================ */
/* PART 3: Notifications Table                  */
/* ============================================ */
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(100) NOT NULL CHECK (type IN ('birthday', 'task_assigned', 'task_due', 'task_overdue', 'system')),
    related_id UUID,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

/* RLS */
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

/* ============================================ */
/* PART 4: Fix RLS Recursion (from migration 010) */
/* ============================================ */
/* Drop the problematic recursive admin policy */
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

/* Create SECURITY DEFINER function to check admin role */
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('Founder', 'Co-Founder', 'Admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Recreate non-recursive admin policies */
DROP POLICY IF EXISTS "Admin update profile" ON public.profiles;
CREATE POLICY "Admin update profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete profile" ON public.profiles;
CREATE POLICY "Admin delete profile"
    ON public.profiles FOR DELETE TO authenticated
    USING (public.is_admin());

/* ============================================ */
/* PART 5: Auto-sync birthday events function    */
/* ============================================ */
CREATE OR REPLACE FUNCTION public.sync_birthday_event()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    birth_month INTEGER;
    birth_day INTEGER;
    evt_date DATE;
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        birth_month := EXTRACT(MONTH FROM NEW.date_of_birth);
        birth_day := EXTRACT(DAY FROM NEW.date_of_birth);
        evt_date := make_date(current_year, birth_month, birth_day);
        IF evt_date < CURRENT_DATE THEN
            evt_date := make_date(current_year + 1, birth_month, birth_day);
        END IF;
        INSERT INTO public.birthday_events (user_id, full_name, birth_date, event_date, year)
        VALUES (NEW.id, NEW.full_name, NEW.date_of_birth, evt_date, EXTRACT(YEAR FROM evt_date))
        ON CONFLICT (user_id, year)
        DO UPDATE SET
            full_name = EXCLUDED.full_name,
            birth_date = EXCLUDED.birth_date,
            event_date = EXCLUDED.event_date,
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Trigger on profiles */
DROP TRIGGER IF EXISTS sync_birthday_on_profile_change ON public.profiles;
CREATE TRIGGER sync_birthday_on_profile_change
    AFTER INSERT OR UPDATE OF date_of_birth, full_name ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_birthday_event();

/* ============================================ */
/* PART 6: Seed birthday events from existing profiles */
/* ============================================ */
/* This automatically creates birthday events for all profiles with date_of_birth */
UPDATE public.profiles SET updated_at = NOW()
WHERE date_of_birth IS NOT NULL;

/* If the trigger didn't fire (e.g. on first run), manually insert */
INSERT INTO public.birthday_events (user_id, full_name, birth_date, event_date, year)
SELECT
    p.id,
    p.full_name,
    p.date_of_birth,
    CASE
        WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM p.date_of_birth)::int, EXTRACT(DAY FROM p.date_of_birth)::int) >= CURRENT_DATE
        THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM p.date_of_birth)::int, EXTRACT(DAY FROM p.date_of_birth)::int)
        ELSE make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM p.date_of_birth)::int, EXTRACT(DAY FROM p.date_of_birth)::int)
    END,
    CASE
        WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM p.date_of_birth)::int, EXTRACT(DAY FROM p.date_of_birth)::int) >= CURRENT_DATE
        THEN EXTRACT(YEAR FROM CURRENT_DATE)::int
        ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int + 1
    END
FROM public.profiles p
WHERE p.date_of_birth IS NOT NULL
ON CONFLICT (user_id, year) DO NOTHING;

/* ============================================ */
/* Verification queries                         */
/* ============================================ */
SELECT 'tasks table' as check, COUNT(*) as count FROM public.tasks;
SELECT 'birthday_events table' as check, COUNT(*) as count FROM public.birthday_events;
SELECT 'notifications table' as check, COUNT(*) as count FROM public.notifications;
SELECT 'profiles with birthday' as check, COUNT(*) as count FROM public.profiles WHERE date_of_birth IS NOT NULL;
