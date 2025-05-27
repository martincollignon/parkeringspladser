import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

// Type definitions for our database tables
export interface ParkingLocation {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    parking_type: 'short-term' | 'long-term';
    // Car parking fields
    operator?: string;
    fee_info?: string;
    capacity?: number;
    // Bike shop fields
    bike_types?: string;
    services?: any; // JSONB field from previous migration
    website?: string;
    // Common fields
    opening_hours?: string;
    osm_id?: string;
    mapillary_url?: string;
    verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface Submission {
    id: string;
    user_id: string;
    parking_data: any;
    status: 'pending' | 'approved' | 'rejected';
    moderator_notes?: string;
    created_at: string;
    updated_at: string;
} 