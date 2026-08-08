/* Migration 009: Comprehensive schema fix */
/* ROOT CAUSE: DB schema doesn't match code expectations */
/* DB has: role_id(int FK), team_id(int FK), birth_date */
/* Code expects: role(varchar), team(varchar), date_of_birth, full_name, avatar_url, bio, status */
/* This migration adds all missing columns and drops the trigger entirely */

/* Step 1: Drop trigger completely (it causes "Database error saving new user") */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

/* Step 2: Add all missing columns to profiles table */
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS team VARCHAR(100),
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Member',
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

/* Step 3: Update role CHECK constraint to include all roles used in code */
DO $$ BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('Founder', 'Co-Founder', 'Admin', 'Leader', 'Member', 'Intern', 'Advisor') OR role IS NULL);

/* Step 4: Add status CHECK constraint */
DO $$ BEGIN
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('active', 'inactive', 'suspended') OR status IS NULL);

/* Step 5: Ensure RLS is enabled */
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

/* Step 6: Drop and recreate all RLS policies */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

/* Policy 1: All authenticated users can read profiles */
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

/* Policy 2: Users can update their own profile */
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

/* Policy 3: Users can insert their own profile (client-side after signUp) */
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

/* Policy 4: Admin/Founder/Co-Founder can manage all profiles */
CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Founder', 'Co-Founder', 'Admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('Founder', 'Co-Founder', 'Admin')
        )
    );

/* Step 7: Migrate data from old columns to new ones if needed */
UPDATE public.profiles
    SET full_name = COALESCE(full_name, email),
    date_of_birth = COALESCE(date_of_birth, birth_date),
    role = COALESCE(role, 'Member'),
    team = COALESCE(team, 'Other')
    WHERE full_name IS NULL OR date_of_birth IS NULL OR role IS NULL;

/* Step 8: Create updated_at trigger */
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

/* Step 9: Add indexes */
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_team ON public.profiles(team);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

/* Step 10: Verify the schema */
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
