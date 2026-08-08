-- Migration 004: Fix birthday events sync and add notification support
-- Date: 2026-08-08
-- 
-- This migration:
-- 1. Re-syncs birthday_events for all existing profiles
-- 2. Updates the notifications table to support global (user_id = NULL) birthday notifications
-- 3. Adds a cron-like function to check upcoming birthdays

-- ============================================
-- 1. Re-sync birthday events for existing profiles
-- ============================================
-- Trigger the sync_birthday_event function for all profiles with date_of_birth
UPDATE profiles SET updated_at = NOW() WHERE date_of_birth IS NOT NULL;

-- ============================================
-- 2. Allow global notifications (user_id can be NULL for broadcast)
-- ============================================
ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow viewing global notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own and global notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- 3. Update check_upcoming_birthdays to create GLOBAL notifications
--    (visible to all users, not just the birthday person)
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
        -- Create GLOBAL notification (user_id = NULL, visible to all)
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            NULL,
            'Sinh nhat sap den!',
            birthday_record.full_name || ' se co sinh nhat sau 7 ngay nua (' || birthday_record.event_date || ')',
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
        -- Create GLOBAL notification (user_id = NULL, visible to all)
        INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
        VALUES (
            NULL,
            'Sinh nhat ngay mai!',
            birthday_record.full_name || ' se co sinh nhat vao ngay mai (' || birthday_record.event_date || ')',
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
-- 4. Run the check once to create notifications for upcoming birthdays
-- ============================================
SELECT check_upcoming_birthdays();

-- ============================================
-- 5. Comment
-- ============================================
COMMENT ON FUNCTION check_upcoming_birthdays() IS 'Checks for birthdays in 7 days and 1 day, creates GLOBAL notifications visible to all users';
