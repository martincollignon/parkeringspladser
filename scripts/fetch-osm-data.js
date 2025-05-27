#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service key for admin operations
const COPENHAGEN_BBOX = '55.6000,12.4500,55.7500,12.7000'; // South, West, North, East (corrected format)

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing required environment variables: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Enhanced Overpass API query for parking in Copenhagen
const overpassQuery = `
[out:json][timeout:25];
(
  // Large parking facilities (50+ capacity) - both amenity and building tags
  nwr["amenity"="parking"]["capacity"~"^[5-9][0-9]|^[0-9]{3,}$"](55.6000,12.4500,55.7500,12.7000);
  nwr["building"="parking"]["capacity"~"^[5-9][0-9]|^[0-9]{3,}$"](55.6000,12.4500,55.7500,12.7000);
  
  // Multi-storey and underground parking
  nwr["amenity"="parking"]["parking"~"multi-storey|underground"](55.6000,12.4500,55.7500,12.7000);
  nwr["building"="parking"]["parking"~"multi-storey|underground"](55.6000,12.4500,55.7500,12.7000);
  
  // Commercial operators (check both operator and brand fields)
  nwr["operator"~"APCOA|Q-Park|Jeudan|Parkzone|Gardian|Borgergade"](55.6000,12.4500,55.7500,12.7000);
  nwr["brand"~"APCOA|Q-Park|Jeudan|Parkzone|Gardian|Borgergade"](55.6000,12.4500,55.7500,12.7000);
  
  // All parking buildings (many are missing amenity=parking tag)
  nwr["building"="parking"](55.6000,12.4500,55.7500,12.7000);
  
  // Named parking facilities
  nwr["amenity"="parking"]["name"](55.6000,12.4500,55.7500,12.7000);
  
  // Specific facility names (P-hus, P-kælder, etc.)
  nwr["name"~"P-hus|P-kælder|Parkering"](55.6000,12.4500,55.7500,12.7000);
  
  // Specific known facilities by name
  nwr["name"~"Magasin|Vesterport|Vognmagergade|Axel Towers|Tivoli|Dronningens|Gammel Mønt|Berlingske"](55.6000,12.4500,55.7500,12.7000);
);
out center meta;
`;

async function fetchOSMData() {
    console.log('🗺️  Fetching parking data from OpenStreetMap...');
    
    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `data=${encodeURIComponent(overpassQuery)}`
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📍 Found ${data.elements.length} parking elements from OSM`);
        
        return data.elements;
    } catch (error) {
        console.error('Error fetching OSM data:', error);
        throw error;
    }
}

function transformOSMElement(element) {
    const tags = element.tags || {};
    
    // Get coordinates - for ways/relations, use center if available
    let lat, lon;
    if (element.lat && element.lon) {
        lat = element.lat;
        lon = element.lon;
    } else if (element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
    } else {
        return null; // Skip elements without coordinates
    }

    // Extract relevant information
    const name = tags.name || tags['name:da'] || tags['name:en'] || 'Unnamed Parking';
    const operator = tags.operator || null;
    const capacity = tags.capacity ? parseInt(tags.capacity) : null;
    const opening_hours = tags.opening_hours || null;
    
    // Build fee information
    let fee_info = 'Paid parking';
    if (tags.charge) {
        fee_info = tags.charge;
    } else if (tags['fee:conditional']) {
        fee_info = tags['fee:conditional'];
    }

    // Build address from available tags
    const address_parts = [];
    if (tags['addr:street']) address_parts.push(tags['addr:street']);
    if (tags['addr:housenumber']) address_parts.push(tags['addr:housenumber']);
    if (tags['addr:city']) address_parts.push(tags['addr:city']);
    const address = address_parts.length > 0 ? address_parts.join(' ') : null;

    return {
        name,
        address,
        latitude: lat,
        longitude: lon,
        operator,
        fee_info,
        opening_hours,
        capacity,
        osm_id: `${element.type}/${element.id}`,
        verified: false // OSM data starts as unverified
    };
}

async function insertParkingData(parkingLocations) {
    console.log(`💾 Inserting ${parkingLocations.length} parking locations into database...`);
    
    try {
        const { data, error } = await supabase
            .from('parking_locations')
            .upsert(parkingLocations, { 
                onConflict: 'osm_id',
                ignoreDuplicates: false 
            })
            .select();

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        console.log(`✅ Successfully inserted/updated ${data.length} parking locations`);
        return data;
    } catch (error) {
        console.error('Error inserting data:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting OSM data import for Copenhagen parking...');
        
        // Fetch data from OSM
        const osmElements = await fetchOSMData();
        
        // Transform OSM data to our schema
        const parkingLocations = osmElements
            .map(transformOSMElement)
            .filter(location => location !== null); // Remove invalid entries
        
        console.log(`🔄 Transformed ${parkingLocations.length} valid parking locations`);
        
        if (parkingLocations.length === 0) {
            console.log('⚠️  No valid parking locations found. Exiting.');
            return;
        }

        // Insert into database
        await insertParkingData(parkingLocations);
        
        console.log('🎉 OSM data import completed successfully!');
        
        // Print summary
        console.log('\n📊 Summary:');
        console.log(`- Total locations: ${parkingLocations.length}`);
        console.log(`- With operators: ${parkingLocations.filter(p => p.operator).length}`);
        console.log(`- With capacity info: ${parkingLocations.filter(p => p.capacity).length}`);
        console.log(`- With opening hours: ${parkingLocations.filter(p => p.opening_hours).length}`);
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

// Run the script
main(); 