/* Migration: Fix missing birthday tables after crash */

CREATE TABLE IF NOT EXISTS birthday_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_birthday_events_user_id ON birthday_events(user_id);
CREATE INDEX IF NOT EXISTS idx_birthday_events_event_date ON birthday_events(event_date);
CREATE INDEX IF NOT EXISTS idx_birthday_events_year ON birthday_events(year);

ALTER TABLE birthday_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Birthday events viewable by authenticated users"
        ON birthday_events FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Birthday events insertable by authenticated users"
        ON birthday_events FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Birthday events updatable by authenticated users"
        ON birthday_events FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Birthday events deletable by authenticated users"
        ON birthday_events FOR DELETE TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER update_birthday_events_updated_at
        BEFORE UPDATE ON birthday_events
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION sync_birthday_event()
RETURNS TRIGGER AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    birth_month INTEGER;
    birth_day INTEGER;
    event_date DATE;
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        birth_month := EXTRACT(MONTH FROM NEW.date_of_birth);
        birth_day := EXTRACT(DAY FROM NEW.date_of_birth);
        event_date := make_date(current_year, birth_month, birth_day);
        IF event_date < CURRENT_DATE THEN
            event_date := make_date(current_year + 1, birth_month, birth_day);
        END IF;

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

DROP TRIGGER IF EXISTS sync_birthday_on_profile_change ON profiles;
CREATE TRIGGER sync_birthday_on_profile_change
    AFTER INSERT OR UPDATE OF date_of_birth, full_name ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_birthday_event();

CREATE OR REPLACE FUNCTION check_upcoming_birthdays()
RETURNS void AS $$
DECLARE
    birthday_record RECORD;
BEGIN
    FOR birthday_record IN
        SELECT be.id, be.user_id, be.full_name, be.event_date
        FROM birthday_events be
        WHERE be.event_date = CURRENT_DATE + INTERVAL '7 days'
        AND be.notified_7days = FALSE
    LOOP
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            NULL,
            'Sinh nhat sap den!',
            birthday_record.full_name || ' se co sinh nhat sau 7 ngay nua (' || birthday_record.event_date || ')',
            'birthday',
            birthday_record.id,
            'birthday_event'
        );
        UPDATE birthday_events SET notified_7days = TRUE WHERE id = birthday_record.id;
    END LOOP;

    FOR birthday_record IN
        SELECT be.id, be.user_id, be.full_name, be.event_date
        FROM birthday_events be
        WHERE be.event_date = CURRENT_DATE + INTERVAL '1 day'
        AND be.notified_1day = FALSE
    LOOP
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            NULL,
            'Sinh nhat ngay mai!',
            birthday_record.full_name || ' se co sinh nhat vao ngay mai (' || birthday_record.event_date || ')',
            'birthday',
            birthday_record.id,
            'birthday_event'
        );
        UPDATE birthday_events SET notified_1day = TRUE WHERE id = birthday_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own and global notifications" ON notifications;

CREATE POLICY "Users can view own and global notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

UPDATE profiles SET date_of_birth = date_of_birth WHERE date_of_birth IS NOT NULL;

SELECT check_upcoming_birthdays();
