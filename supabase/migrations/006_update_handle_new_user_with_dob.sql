/* Migration 006: Update handle_new_user trigger to include date_of_birth */
/* This ensures that when a user registers with a birth date, it gets saved to profiles.date_of_birth */
/* The sync_birthday_event trigger (from migration 005) will then automatically create/update birthday_events */

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, team, date_of_birth)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'Member'),
        COALESCE(NEW.raw_user_meta_data->>'team', 'Other'),
        COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, NULL)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

/* Verify trigger still exists (it should from migration 001) */
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
