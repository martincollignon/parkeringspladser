-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core parking locations table
CREATE TABLE parking_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    operator TEXT,
    fee_info TEXT,
    opening_hours TEXT,
    capacity INTEGER,
    osm_id TEXT UNIQUE,
    mapillary_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User submissions queue
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    parking_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderator_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_parking_locations_coordinates ON parking_locations(latitude, longitude);
CREATE INDEX idx_parking_locations_osm_id ON parking_locations(osm_id);
CREATE INDEX idx_parking_locations_verified ON parking_locations(verified);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);

-- Enable Row Level Security
ALTER TABLE parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parking_locations (public read access)
CREATE POLICY "Public can view parking locations" ON parking_locations
    FOR SELECT USING (true);

-- RLS Policies for submissions (users can only see their own)
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_parking_locations_updated_at 
    BEFORE UPDATE ON parking_locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 