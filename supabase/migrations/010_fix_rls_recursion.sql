/* Migration 010: Fix RLS infinite recursion in profiles */
/* Root cause: Admin policy subquery triggers RLS again causing infinite loop */

/* Step 1: Drop the problematic recursive admin policy */
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

/* Step 2: Create a SECURITY DEFINER function to check admin role */
/* This function bypasses RLS and reads the caller's role directly from the table */
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

/* Step 3: Create non-recursive admin policies using the helper function */

/* Admin can UPDATE any profile */
CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

/* Admin can DELETE any profile */
CREATE POLICY "Admins can delete any profile"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

/* Verify policies */
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
