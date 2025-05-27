-- Add additional fields for Q-Park data
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS distance_meters FLOAT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS walking_time TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS walking_time_long TEXT;

-- Parking information
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS total_spaces INTEGER;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS electrical_spaces INTEGER;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS disabled_spaces INTEGER;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS bicycle_spaces INTEGER;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS max_vehicle_height_meters FLOAT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS is_24_7 BOOLEAN DEFAULT false;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS has_limited_spots BOOLEAN DEFAULT false;

-- Booking information
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS prebooking_enabled BOOLEAN DEFAULT false;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS prebooking_url TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS season_ticket_enabled BOOLEAN DEFAULT false;

-- Images and URLs
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS facility_image_url TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS detail_page_url TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS directions_url TEXT;

-- Additional metadata
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS services JSONB;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS facility_uid TEXT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS price FLOAT;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS is_deal BOOLEAN DEFAULT false;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT false;
ALTER TABLE parking_locations ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'qpark';

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_parking_locations_provider ON parking_locations(provider);
CREATE INDEX IF NOT EXISTS idx_parking_locations_city ON parking_locations(city);
CREATE INDEX IF NOT EXISTS idx_parking_locations_is_24_7 ON parking_locations(is_24_7);
CREATE INDEX IF NOT EXISTS idx_parking_locations_prebooking ON parking_locations(prebooking_enabled);
CREATE INDEX IF NOT EXISTS idx_parking_locations_electrical ON parking_locations(electrical_spaces);

-- Update the capacity field to use total_spaces when available
UPDATE parking_locations SET capacity = total_spaces WHERE total_spaces IS NOT NULL AND capacity IS NULL; 