#!/usr/bin/env node

// OSM Contribution Guide for Copenhagen Parking Research
// This script shows what tags to add to OSM for missing facilities

const missingFacilities = [
    // Q-Park facilities
    {
        name: "Q-Park Illum",
        operator: "Q-Park",
        location: "Østergade/Købmagergade area",
        capacity: 140, // from our test results
        parking_type: "underground",
        tags: {
            "amenity": "parking",
            "name": "Q-Park Illum",
            "operator": "Q-Park",
            "capacity": "140",
            "parking": "underground",
            "fee": "yes",
            "access": "customers",
            "building": "parking"
        },
        notes: "Located under/near Illums Bolighus department store"
    },
    {
        name: "Q-Park Magasin",
        operator: "Q-Park",
        location: "Kongens Nytorv area",
        capacity: "unknown",
        parking_type: "underground",
        tags: {
            "amenity": "parking",
            "name": "Q-Park Magasin",
            "operator": "Q-Park",
            "parking": "underground",
            "fee": "yes",
            "access": "customers"
        },
        notes: "Associated with Magasin du Nord department store"
    },
    {
        name: "Q-Park Vesterport",
        operator: "Q-Park",
        location: "Vesterport Station area",
        capacity: "200", // 100+100 from our findings
        parking_type: "underground",
        tags: {
            "amenity": "parking",
            "name": "Q-Park Vesterport",
            "operator": "Q-Park",
            "capacity": "200",
            "parking": "underground",
            "fee": "yes",
            "level": "-1;-2"
        },
        notes: "Two levels found in OSM data (Niveau 1 & 2)"
    },
    
    // APCOA facilities
    {
        name: "Vognmagergade P-hus",
        operator: "APCOA",
        location: "Vognmagergade street",
        capacity: "unknown",
        parking_type: "multi-storey",
        tags: {
            "amenity": "parking",
            "name": "Vognmagergade P-hus",
            "operator": "APCOA",
            "parking": "multi-storey",
            "building": "parking",
            "fee": "yes"
        },
        notes: "APCOA FLOW app integration, ANPR technology"
    },
    {
        name: "Axel Towers P-kælder",
        operator: "APCOA",
        location: "Axel Towers building complex",
        capacity: "unknown",
        parking_type: "underground",
        tags: {
            "amenity": "parking",
            "name": "Axel Towers P-kælder",
            "operator": "APCOA",
            "parking": "underground",
            "fee": "yes",
            "access": "customers"
        },
        notes: "Part of Axel Towers office complex"
    },
    {
        name: "Tivoli Parkering",
        operator: "APCOA",
        location: "Near Tivoli Gardens",
        capacity: "unknown",
        parking_type: "unknown",
        tags: {
            "amenity": "parking",
            "name": "Tivoli Parkering",
            "operator": "APCOA",
            "fee": "yes",
            "tourism": "attraction"
        },
        notes: "Serves Tivoli Gardens visitors"
    },
    
    // Jeudan facilities
    {
        name: "Dronningens Tværgade P-hus",
        operator: "Jeudan",
        location: "Dronningens Tværgade",
        capacity: "unknown",
        parking_type: "multi-storey",
        tags: {
            "amenity": "parking",
            "name": "Dronningens Tværgade P-hus",
            "operator": "Jeudan",
            "parking": "multi-storey",
            "building": "parking",
            "fee": "yes"
        },
        notes: "Premium Jeudan facility with valet services"
    },
    {
        name: "Gammel Mønt P-hus",
        operator: "Jeudan",
        location: "Gammel Mønt street",
        capacity: "unknown",
        parking_type: "multi-storey",
        tags: {
            "amenity": "parking",
            "name": "Gammel Mønt P-hus",
            "operator": "Jeudan",
            "parking": "multi-storey",
            "building": "parking",
            "fee": "yes"
        },
        notes: "Central København K location"
    },
    {
        name: "Sankt Annæ Plads P-hus",
        operator: "Jeudan",
        location: "Sankt Annæ Plads area",
        capacity: "unknown",
        parking_type: "underground",
        tags: {
            "amenity": "parking",
            "name": "Sankt Annæ Plads P-hus",
            "operator": "Jeudan",
            "parking": "underground",
            "fee": "yes"
        },
        notes: "Premium location near waterfront"
    }
];

const improvementSuggestions = [
    {
        osm_id: "node/1727707557",
        current_name: "Q-Park Nørreport (Israels Plads)",
        improvements: {
            "website": "https://www.q-park.dk",
            "phone": "+45 70 20 30 40",
            "payment:credit_cards": "yes",
            "payment:app": "yes",
            "surveillance": "yes",
            "lit": "yes"
        },
        notes: "Add Q-Park specific amenities"
    },
    {
        osm_id: "way/223509304",
        current_name: "P-huset Berlingske Karré",
        improvements: {
            "website": "https://jeudan.dk",
            "payment:credit_cards": "yes",
            "surveillance": "yes",
            "access:conditional": "customers @ (Mo-Fr 07:00-18:00)"
        },
        notes: "Add Jeudan specific services"
    }
];

function generateOSMContributionPlan() {
    console.log('🗺️  OSM CONTRIBUTION PLAN FOR COPENHAGEN PARKING RESEARCH');
    console.log('='.repeat(80));
    
    console.log('\n📍 MISSING FACILITIES TO ADD:');
    console.log('='.repeat(50));
    
    missingFacilities.forEach((facility, i) => {
        console.log(`\n${i + 1}. ${facility.name}`);
        console.log(`   Operator: ${facility.operator}`);
        console.log(`   Location: ${facility.location}`);
        console.log(`   Capacity: ${facility.capacity}`);
        console.log(`   Type: ${facility.parking_type}`);
        console.log(`   Notes: ${facility.notes}`);
        
        console.log(`   \n   OSM Tags to add:`);
        Object.entries(facility.tags).forEach(([key, value]) => {
            console.log(`     ${key}=${value}`);
        });
    });
    
    console.log('\n🔧 EXISTING FACILITIES TO IMPROVE:');
    console.log('='.repeat(50));
    
    improvementSuggestions.forEach((improvement, i) => {
        console.log(`\n${i + 1}. ${improvement.current_name}`);
        console.log(`   OSM ID: ${improvement.osm_id}`);
        console.log(`   Notes: ${improvement.notes}`);
        
        console.log(`   \n   Additional tags to add:`);
        Object.entries(improvement.improvements).forEach(([key, value]) => {
            console.log(`     ${key}=${value}`);
        });
    });
    
    console.log('\n📋 CONTRIBUTION WORKFLOW:');
    console.log('='.repeat(50));
    console.log('1. Create OSM account at openstreetmap.org');
    console.log('2. Use iD editor (web) or JOSM (desktop) for editing');
    console.log('3. For each missing facility:');
    console.log('   a. Find the exact location using Google Maps/Street View');
    console.log('   b. Add a node or area in OSM');
    console.log('   c. Add all the tags listed above');
    console.log('   d. Add changeset comment: "Adding parking facility from local research"');
    console.log('4. For improvements:');
    console.log('   a. Search for the OSM ID');
    console.log('   b. Add the additional tags');
    console.log('   c. Add changeset comment: "Improving parking facility details"');
    
    console.log('\n🎯 RESEARCH VALUE:');
    console.log('='.repeat(50));
    console.log('• Your research provides real-world operator data');
    console.log('• Capacity information from official sources');
    console.log('• Service details (valet, ANPR, apps) not usually in OSM');
    console.log('• Commercial operator coverage gaps in OSM');
    console.log('• This would significantly improve Copenhagen parking data');
    
    console.log('\n⚠️  CONTRIBUTION GUIDELINES:');
    console.log('='.repeat(50));
    console.log('• Only add facilities you can verify exist');
    console.log('• Use aerial imagery to confirm building locations');
    console.log('• Add source="local_knowledge" or source="survey" tags');
    console.log('• Be conservative with capacity if unsure');
    console.log('• Follow OSM tagging conventions for parking');
    console.log('• Consider adding opening_hours if known');
}

function generateDataCollectionScript() {
    console.log('\n\n🔍 DATA COLLECTION SCRIPT FOR FIELD VERIFICATION:');
    console.log('='.repeat(80));
    
    console.log('\nFor each missing facility, collect:');
    console.log('1. Exact GPS coordinates (use phone GPS)');
    console.log('2. Building entrance location');
    console.log('3. Visible signage (take photos)');
    console.log('4. Capacity signs if visible');
    console.log('5. Opening hours posted');
    console.log('6. Payment methods accepted');
    console.log('7. Access restrictions (if any)');
    
    console.log('\nVerification checklist:');
    missingFacilities.forEach((facility, i) => {
        console.log(`\n${i + 1}. ${facility.name} (${facility.location})`);
        console.log(`   [ ] Located building/entrance`);
        console.log(`   [ ] Confirmed operator signage`);
        console.log(`   [ ] Recorded GPS coordinates`);
        console.log(`   [ ] Noted capacity if visible`);
        console.log(`   [ ] Checked access restrictions`);
    });
}

// Run the analysis
generateOSMContributionPlan();
generateDataCollectionScript(); 