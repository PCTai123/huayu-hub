/* Migration 008: Remove trigger completely and fix RLS for manual profile creation */
/* This eliminates trigger-related errors during registration */

/* Step 1: Drop the trigger entirely */
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

/* Step 2: Drop the trigger function */
DROP FUNCTION IF EXISTS public.handle_new_user();

/* Step 3: Ensure profiles table RLS allows all authenticated users to insert */
/* This is needed because the client will INSERT profile after signUp */

/* First, check if the insert policy exists and recreate it broadly */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

/* Step 4: Also allow service role / anon to insert if needed (for client-side fallback) */
DO $$ BEGIN
    DROP POLICY IF EXISTS "Service can insert profiles" ON public.profiles;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

/* Note: After this migration, profiles must be created by the client code */
/* The client will call supabase.from('profiles').insert() after signUp */
