-- Add source column to track where parking location data came from
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'unknown';

-- Add index for source column for efficient filtering
CREATE INDEX IF NOT EXISTS idx_parking_locations_source ON parking_locations(source);

-- Add helpful comment
COMMENT ON COLUMN parking_locations.source IS 
'Tracks the source of the parking location data (e.g., user_contribution, qpark, osm, manual)'; 