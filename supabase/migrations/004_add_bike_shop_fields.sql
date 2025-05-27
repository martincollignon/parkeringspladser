-- Add parking type field to distinguish between car parking and bike shops
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS parking_type TEXT DEFAULT 'short-term' CHECK (parking_type IN ('short-term', 'long-term'));

-- Add bike shop specific fields (services already exists as JSONB from previous migration)
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS bike_types TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS website TEXT;

-- Add index for parking type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_parking_locations_type ON parking_locations(parking_type); 