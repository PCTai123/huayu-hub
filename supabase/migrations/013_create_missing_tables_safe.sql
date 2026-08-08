/* Migration 013: Safe table creation — only creates missing tables */
/* Khong xoa du lieu cu. Chi tao bang nao chua co. */

/* ============================================ */
/* 1. TASKS TABLE (neu chua co)               */
/* ============================================ */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'tasks'
    ) THEN
        CREATE TABLE public.tasks (
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

        CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
        CREATE INDEX idx_tasks_team ON public.tasks(team);
        CREATE INDEX idx_tasks_status ON public.tasks(status);
        CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Tasks viewable by authenticated users"
            ON public.tasks FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Tasks insertable by authenticated users"
            ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Tasks updatable by authenticated users"
            ON public.tasks FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "Tasks deletable by authenticated users"
            ON public.tasks FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

/* ============================================ */
/* 2. BIRTHDAY_EVENTS TABLE (neu chua co)       */
/* ============================================ */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'birthday_events'
    ) THEN
        CREATE TABLE public.birthday_events (
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

        CREATE INDEX idx_birthday_events_user_id ON public.birthday_events(user_id);
        CREATE INDEX idx_birthday_events_event_date ON public.birthday_events(event_date);

        ALTER TABLE public.birthday_events ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Birthday events viewable by authenticated users"
            ON public.birthday_events FOR SELECT TO authenticated USING (true);
        CREATE POLICY "Birthday events insertable by authenticated users"
            ON public.birthday_events FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Birthday events updatable by authenticated users"
            ON public.birthday_events FOR UPDATE TO authenticated USING (true);
        CREATE POLICY "Birthday events deletable by authenticated users"
            ON public.birthday_events FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

/* ============================================ */
/* 3. NOTIFICATIONS TABLE (neu chua co)         */
/*    Neu da co thi chi them cot thieu          */
/* ============================================ */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'notifications'
    ) THEN
        CREATE TABLE public.notifications (
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

        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own notifications"
            ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
        CREATE POLICY "System can insert notifications"
            ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY "Users can update own notifications"
            ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
        CREATE POLICY "Users can delete own notifications"
            ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
    ELSE
        /* Bang da co — them cot thieu */
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;

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

        /* Dam bao RLS policies ton tai */
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

/* ============================================ */
/* 4. Seed birthday events tu profiles          */
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
/* 5. Kiem tra ket qua                          */
/* ============================================ */
SELECT 'tasks' as bang, (SELECT COUNT(*) FROM public.tasks) as so_dong
UNION ALL
SELECT 'birthday_events', (SELECT COUNT(*) FROM public.birthday_events)
UNION ALL
SELECT 'notifications', (SELECT COUNT(*) FROM public.notifications)
UNION ALL
SELECT 'profiles co sinh nhat', (SELECT COUNT(*) FROM public.profiles WHERE date_of_birth IS NOT NULL);
