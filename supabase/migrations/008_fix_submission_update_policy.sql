-- Fix RLS policy for updating submissions
-- The current policy might be too restrictive

-- Drop the existing update policy
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON submissions;

-- Create a more permissive update policy for authenticated users (admins)
-- This allows any authenticated user to update any submission
CREATE POLICY "Admin can update any submission" ON submissions
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Also ensure we have the correct SELECT policy
DROP POLICY IF EXISTS "Submission access policy" ON submissions;
CREATE POLICY "Submission access policy" ON submissions
    FOR SELECT USING (
        -- Allow if user owns the submission
        auth.uid() = user_id OR 
        -- Allow if submission is anonymous
        user_id IS NULL OR
        -- Allow if user is authenticated (admin access)
        auth.uid() IS NOT NULL
    ); 