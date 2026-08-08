-- Migration: Create tasks table for task management system
-- Date: 2026-08-08

-- ============================================
-- 1. Tasks Table
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
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

-- ============================================
-- 2. Birthday Events Table (for calendar integration)
-- ============================================
CREATE TABLE IF NOT EXISTS birthday_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL, -- Original birth date (month/day)
    event_date DATE NOT NULL, -- Computed birthday for current year
    year INTEGER NOT NULL,
    notified_7days BOOLEAN DEFAULT FALSE,
    notified_1day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, year)
);

-- ============================================
-- 3. Notifications Table (for bell notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(100) NOT NULL CHECK (type IN ('birthday', 'task_assigned', 'task_due', 'task_overdue', 'system')),
    related_id UUID, -- Can reference task_id or birthday_event_id
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Indexes for performance
-- ============================================
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_team ON tasks(team);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_start_date ON tasks(start_date);

CREATE INDEX idx_birthday_events_user_id ON birthday_events(user_id);
CREATE INDEX idx_birthday_events_event_date ON birthday_events(event_date);
CREATE INDEX idx_birthday_events_year ON birthday_events(year);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- 5. RLS Policies for tasks
-- ============================================
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks viewable by authenticated users"
    ON tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tasks insertable by authenticated users"
    ON tasks FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Tasks updatable by authenticated users"
    ON tasks FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Tasks deletable by authenticated users"
    ON tasks FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 6. RLS Policies for birthday_events
-- ============================================
ALTER TABLE birthday_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Birthday events viewable by authenticated users"
    ON birthday_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Birthday events insertable by authenticated users"
    ON birthday_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Birthday events updatable by authenticated users"
    ON birthday_events FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Birthday events deletable by authenticated users"
    ON birthday_events FOR DELETE
    TO authenticated
    USING (true);

-- ============================================
-- 7. RLS Policies for notifications
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- 8. Function to update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tasks
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for birthday_events
CREATE TRIGGER update_birthday_events_updated_at
    BEFORE UPDATE ON birthday_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Function to auto-create birthday event when profile is created/updated
-- ============================================
CREATE OR REPLACE FUNCTION sync_birthday_event()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    birth_month INTEGER;
    birth_day INTEGER;
    event_date DATE;
BEGIN
    -- Only proceed if date_of_birth is set
    IF NEW.date_of_birth IS NOT NULL THEN
        birth_month := EXTRACT(MONTH FROM NEW.date_of_birth);
        birth_day := EXTRACT(DAY FROM NEW.date_of_birth);
        
        -- Calculate birthday for current year
        event_date := make_date(current_year, birth_month, birth_day);
        
        -- If birthday already passed this year, use next year
        IF event_date < CURRENT_DATE THEN
            event_date := make_date(current_year + 1, birth_month, birth_day);
        END IF;
        
        -- Upsert birthday event
        INSERT INTO birthday_events (user_id, full_name, birth_date, event_date, year)
        VALUES (NEW.id, NEW.full_name, NEW.date_of_birth, event_date, EXTRACT(YEAR FROM event_date))
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

-- Trigger on profiles table
CREATE TRIGGER sync_birthday_on_profile_change
    AFTER INSERT OR UPDATE OF date_of_birth, full_name ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_birthday_event();

-- ============================================
-- 10. Function to check and create notifications for upcoming birthdays
-- ============================================
CREATE OR REPLACE FUNCTION check_upcoming_birthdays()
RETURNS void AS $$
DECLARE
    birthday_record RECORD;
BEGIN
    -- Check for birthdays in 7 days
    FOR birthday_record IN 
        SELECT be.id, be.user_id, be.full_name, be.event_date
        FROM birthday_events be
        WHERE be.event_date = CURRENT_DATE + INTERVAL '7 days'
        AND be.notified_7days = FALSE
    LOOP
        -- Create notification
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            birthday_record.user_id,
            'Sinh nhật sắp đến!',
            birthday_record.full_name || ' sẽ có sinh nhật sau 7 ngày nữa (' || birthday_record.event_date || ')',
            'birthday',
            birthday_record.id,
            'birthday_event'
        );
        
        -- Mark as notified
        UPDATE birthday_events SET notified_7days = TRUE WHERE id = birthday_record.id;
    END LOOP;
    
    -- Check for birthdays in 1 day
    FOR birthday_record IN 
        SELECT be.id, be.user_id, be.full_name, be.event_date
        FROM birthday_events be
        WHERE be.event_date = CURRENT_DATE + INTERVAL '1 day'
        AND be.notified_1day = FALSE
    LOOP
        -- Create notification
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            birthday_record.user_id,
            'Sinh nhật ngày mai!',
            birthday_record.full_name || ' sẽ có sinh nhật vào ngày mai (' || birthday_record.event_date || ')',
            'birthday',
            birthday_record.id,
            'birthday_event'
        );
        
        -- Mark as notified
        UPDATE birthday_events SET notified_1day = TRUE WHERE id = birthday_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Seed data: Create initial birthday events for existing profiles
-- ============================================
-- This will be auto-populated by the trigger, but we can manually trigger it:
-- UPDATE profiles SET updated_at = NOW() WHERE date_of_birth IS NOT NULL;

-- ============================================
-- 12. Comments for documentation
-- ============================================
COMMENT ON TABLE tasks IS 'Task management table for assigning and tracking tasks';
COMMENT ON TABLE birthday_events IS 'Calendar events for member birthdays, auto-synced from profiles';
COMMENT ON TABLE notifications IS 'User notifications for birthdays, tasks, and system events';
COMMENT ON FUNCTION sync_birthday_event() IS 'Auto-creates/updates birthday calendar event when profile date_of_birth changes';
COMMENT ON FUNCTION check_upcoming_birthdays() IS 'Checks for birthdays in 7 days and 1 day, creates notifications';
