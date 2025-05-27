-- Allow user_id to be null for anonymous submissions
ALTER TABLE submissions ALTER COLUMN user_id DROP NOT NULL;

-- Drop the existing RLS policies for submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON submissions;

-- Create new RLS policies that allow anonymous submissions
CREATE POLICY "Users can view own submissions or anonymous submissions" ON submissions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL
    );

CREATE POLICY "Anyone can create submissions" ON submissions
    FOR INSERT WITH CHECK (true);

-- Add a policy for moderators to view all submissions (we'll need this later)
-- For now, we'll allow authenticated users to view all submissions for moderation
CREATE POLICY "Authenticated users can view all submissions for moderation" ON submissions
    FOR SELECT USING (auth.uid() IS NOT NULL); 