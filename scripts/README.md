# Scripts Directory

This directory contains utility scripts for data processing and OpenStreetMap integration. **Note: These scripts are not actively used by the main application** and are provided for reference and development purposes only.

## Scripts Overview

### `fetch-osm-data.js`
- **Purpose**: Fetches parking data from OpenStreetMap using the Overpass API
- **Status**: Development/reference only
- **Usage**: `node scripts/fetch-osm-data.js`
- **Requirements**: Requires `SUPABASE_SERVICE_KEY` environment variable
- **Description**: Queries OSM for parking facilities in Copenhagen and imports them into a Supabase database

### `osm-contribution-guide.js`
- **Purpose**: Generates a contribution plan for improving OpenStreetMap parking data
- **Status**: Development/reference only
- **Usage**: `node scripts/osm-contribution-guide.js`
- **Description**: Analyzes missing parking facilities and suggests improvements for OSM data

## Important Notes

1. **Not Required for Application**: The main Copenhagen Parking Finder application does not depend on these scripts
2. **Development Tools**: These are development and research tools used during the project's data exploration phase
3. **OSM References**: Scripts may reference specific parking operators (like Jeudan, APCOA, Q-Park) as they exist in real OpenStreetMap data
4. **Environment Variables**: Some scripts require Supabase credentials that are not needed for the main application

## Usage Warning

These scripts are provided for:
- Understanding the data research process
- Reference for similar projects
- Development and testing purposes

They should not be considered part of the production application stack. 