-- Add INSERT policy for parking_locations table
-- This allows authenticated users (admins) to insert approved submissions

CREATE POLICY "Authenticated users can insert parking locations" ON parking_locations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also add UPDATE policy for parking_locations in case we need to modify them later
CREATE POLICY "Authenticated users can update parking locations" ON parking_locations
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL); 