/* Migration 012: Fix missing columns in existing tables */
/* BANG notifications da ton tai nhung thieu cot is_read */

/* ============================================ */
/* PART 1: Fix notifications table              */
/* ============================================ */
/* Them cot is_read neu chua co */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'notifications'
        AND column_name = 'is_read'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

/* Dam bao cac cot khac cung ton tai */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'related_id'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN related_id UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'related_type'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN related_type VARCHAR(50);
    END IF;
END $$;

/* ============================================ */
/* PART 2: Fix birthday_events table          */
/* ============================================ */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'birthday_events' AND column_name = 'notified_7days'
    ) THEN
        ALTER TABLE public.birthday_events ADD COLUMN notified_7days BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'birthday_events' AND column_name = 'notified_1day'
    ) THEN
        ALTER TABLE public.birthday_events ADD COLUMN notified_1day BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'birthday_events' AND column_name = 'team'
    ) THEN
        ALTER TABLE public.birthday_events ADD COLUMN team VARCHAR(100);
    END IF;
END $$;

/* ============================================ */
/* PART 3: Fix tasks table                      */
/* ============================================ */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'related_link'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN related_link VARCHAR(500);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

/* ============================================ */
/* PART 4: Re-enable RLS on all tables          */
/* ============================================ */
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

/* ============================================ */
/* PART 5: Recreate RLS policies (drop if exist) */
/* ============================================ */
/* Tasks */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Tasks viewable by authenticated users" ON public.tasks;
    DROP POLICY IF EXISTS "Tasks insertable by authenticated users" ON public.tasks;
    DROP POLICY IF EXISTS "Tasks updatable by authenticated users" ON public.tasks;
    DROP POLICY IF EXISTS "Tasks deletable by authenticated users" ON public.tasks;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Tasks viewable by authenticated users"
    ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks insertable by authenticated users"
    ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks updatable by authenticated users"
    ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tasks deletable by authenticated users"
    ON public.tasks FOR DELETE TO authenticated USING (true);

/* Birthday events */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Birthday events viewable by authenticated users" ON public.birthday_events;
    DROP POLICY IF EXISTS "Birthday events insertable by authenticated users" ON public.birthday_events;
    DROP POLICY IF EXISTS "Birthday events updatable by authenticated users" ON public.birthday_events;
    DROP POLICY IF EXISTS "Birthday events deletable by authenticated users" ON public.birthday_events;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Birthday events viewable by authenticated users"
    ON public.birthday_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Birthday events insertable by authenticated users"
    ON public.birthday_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Birthday events updatable by authenticated users"
    ON public.birthday_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Birthday events deletable by authenticated users"
    ON public.birthday_events FOR DELETE TO authenticated USING (true);

/* Notifications */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications"
    ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

/* ============================================ */
/* PART 6: Seed birthday events (re-run)        */
/* ============================================ */
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
/* Verification                                 */
/* ============================================ */
SELECT 'tasks' as bang, COUNT(*) as so_dong FROM public.tasks
UNION ALL
SELECT 'birthday_events', COUNT(*) FROM public.birthday_events
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'profiles co sinh nhat', COUNT(*) FROM public.profiles WHERE date_of_birth IS NOT NULL;
