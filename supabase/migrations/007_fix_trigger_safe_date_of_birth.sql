/* Migration 007: Fix handle_new_user trigger to safely handle NULL or invalid date_of_birth */
/* This fixes the "Database error saving new user" error during registration */

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    dob DATE;
BEGIN
    /* Try to parse date_of_birth, fallback to NULL if invalid */
    BEGIN
        dob := (NEW.raw_user_meta_data->>'date_of_birth')::DATE;
    EXCEPTION WHEN OTHERS THEN
        dob := NULL;
    END;

    INSERT INTO public.profiles (id, full_name, email, role, team, date_of_birth)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'Member'),
        COALESCE(NEW.raw_user_meta_data->>'team', 'Other'),
        dob
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* Ensure trigger exists */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
