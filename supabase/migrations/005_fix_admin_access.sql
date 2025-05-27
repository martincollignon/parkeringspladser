-- Fix RLS policies for admin access to submissions
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view own submissions or anonymous submissions" ON submissions;
DROP POLICY IF EXISTS "Authenticated users can view all submissions for moderation" ON submissions;

-- Create a single, clear policy for viewing submissions
-- This allows:
-- 1. Users to view their own submissions (if they have user_id)
-- 2. Anonymous submissions to be viewed by anyone
-- 3. Authenticated users to view ALL submissions (for admin purposes)
CREATE POLICY "Submission access policy" ON submissions
    FOR SELECT USING (
        -- Allow if user owns the submission
        auth.uid() = user_id OR 
        -- Allow if submission is anonymous
        user_id IS NULL OR
        -- Allow if user is authenticated (admin access)
        auth.uid() IS NOT NULL
    );

-- Ensure the insert policy still works
DROP POLICY IF EXISTS "Anyone can create submissions" ON submissions;
CREATE POLICY "Anyone can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

-- Add update policy for admin actions (approve/reject)
CREATE POLICY "Authenticated users can update submissions" ON submissions
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL); 