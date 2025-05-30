<script lang="ts">
	import { onMount, onDestroy, mount } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_PROTOMAPS_API_KEY } from '$env/static/public';
	import type { Map as MapType } from 'maplibre-gl';

	
	// Only import CSS on client side
	if (browser) {
		import('maplibre-gl/dist/maplibre-gl.css');
	}

	export let center: [number, number] = [12.5683, 55.6761]; // Copenhagen coordinates
	export let zoom: number = 12;
	export let style: string = `https://api.protomaps.com/styles/v2/dark.json?key=${PUBLIC_PROTOMAPS_API_KEY}`; // Protomaps dark style
	export let onLocationClick: ((location: any, isClosest?: boolean) => void) | null = null;
	export let onMapClick: (() => void) | null = null;

	let mapContainer: HTMLDivElement;
	let map: MapType;
	let mapReady = false;
	let pendingLocations: any[] = [];
	let geolocateControl: any = null; // Reference to the geolocation control

	let currentPopup: any = null; // Track current popup to close it when opening a new one

	onMount(async () => {
		if (!browser) return;
		
		// Dynamically import MapLibre GL
		const maplibregl = await import('maplibre-gl');
		const { Map, NavigationControl, GeolocateControl, Popup } = maplibregl.default || maplibregl;

		// Initialize MapLibre map with Protomaps style
		map = new Map({
			container: mapContainer,
			style: style,
			center: center,
			zoom: zoom,
			attributionControl: {
				compact: false
			}
		});

		// Add navigation controls (zoom in/out, compass)
		map.addControl(new NavigationControl(), 'top-right');

		// Add geolocation control and store reference
		geolocateControl = new GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true
			},
			trackUserLocation: true,
			showUserLocation: true
		});
		map.addControl(geolocateControl, 'top-right');

		// Wait for map to load before adding data sources
		map.on('load', () => {
			console.log('Map loaded successfully');
			
			// Add parking data source (will be populated later)
			map.addSource('parking-locations', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: []
				}
			});

			// Add parking markers layer with London Underground Live styling
			map.addLayer({
				id: 'parking-markers',
				type: 'circle',
				source: 'parking-locations',
				paint: {
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						10, 8,
						15, 12,
						18, 16
					],
					'circle-color': [
						'case',
						['==', ['get', 'parking_type'], 'long-term'],
						'#059669', // Emerald for bike shops
						'#3b82f6'  // Blue for parking
					],
					'circle-stroke-width': [
						'interpolate',
						['linear'],
						['zoom'],
						10, 2,
						15, 3,
						18, 4
					],
					'circle-stroke-color': '#ffffff',
					'circle-opacity': 0.9,
					'circle-stroke-opacity': 1
				}
			});

			// Add a subtle glow effect for better visibility
			map.addLayer({
				id: 'parking-markers-glow',
				type: 'circle',
				source: 'parking-locations',
				paint: {
					'circle-radius': [
						'interpolate',
						['linear'],
						['zoom'],
						10, 12,
						15, 18,
						18, 24
					],
					'circle-color': [
						'case',
						['==', ['get', 'parking_type'], 'long-term'],
						'#059669',
						'#3b82f6'
					],
					'circle-opacity': 0.15,
					'circle-blur': 1
				}
			}, 'parking-markers'); // Insert below the main markers
			
			// Mark map as ready
			mapReady = true;
			console.log('Map is now ready for data');
			
			// Add any pending locations
			if (pendingLocations.length > 0) {
				console.log('Adding pending locations:', pendingLocations.length);
				addParkingLocations(pendingLocations);
				pendingLocations = [];
			}

			// Add click handler for parking markers
			map.on('click', 'parking-markers', async (e) => {
				
				if (e.features && e.features[0]) {
					const feature = e.features[0];
					const coordinates = (feature.geometry as any).coordinates.slice();
					const properties = feature.properties;

					console.log('🗺️ Clicked feature properties:', properties); // DEBUG: Remove this later

					// Center the map on the clicked marker with a smooth animation
					map.easeTo({
						center: coordinates,
						zoom: Math.max(map.getZoom(), 15), // Ensure minimum zoom level
						duration: 800,
						essential: true
					});

					// Create location object for the side tray
					const location = {
						id: properties?.id,
						name: properties?.name,
						address: properties?.address,
						operator: properties?.operator,
						fee_info: properties?.fee,
						opening_hours: properties?.hours,
						capacity: properties?.capacity,
						verified: properties?.verified,
						mapillary_url: properties?.mapillary_url,
						latitude: coordinates[1],
						longitude: coordinates[0],
						parking_type: properties?.parking_type,
                        website: properties?.website,
                        bike_types: properties?.bike_types
					};

					console.log('🗺️ Created location object:', location); // DEBUG: Remove this later

					// Use side tray for all devices
					if (onLocationClick) {
						onLocationClick(location, false);
					}
					
					// Close any existing popup
					if (currentPopup) {
						currentPopup.remove();
						currentPopup = null;
					}
				}
			});

			// Add general click handler to close tray when clicking outside markers
			map.on('click', (e) => {
				const features = map.queryRenderedFeatures(e.point, {
					layers: ['parking-markers']
				});
				
				// If no parking markers were clicked, call onMapClick to close tray
				if (features.length === 0 && onMapClick) {
					onMapClick();
				}
			});

			// Change cursor on hover
			map.on('mouseenter', 'parking-markers', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'parking-markers', () => {
				map.getCanvas().style.cursor = '';
			});
		});

		// Handle map errors
		map.on('error', (e) => {
			console.error('Map error:', e);
		});
	});

	onDestroy(() => {
		// Clean up map
		if (map) {
			map.remove();
		}
	});

	// Function to add parking locations to the map
	export function addParkingLocations(locations: any[]) {
		console.log('addParkingLocations called with:', locations.length, 'locations');
		console.log('Map exists:', !!map);
		console.log('Map ready:', mapReady);
		console.log('Source exists:', map && !!map.getSource('parking-locations'));
		
		if (mapReady && map && map.getSource('parking-locations')) {
			const geojsonData = {
				type: 'FeatureCollection',
				features: locations.map(location => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [location.longitude, location.latitude]
					},
					properties: {
						id: location.id,
						name: location.name,
						address: location.address,
						operator: location.operator,
						fee: location.fee_info,
						hours: location.opening_hours,
						capacity: location.capacity,
						verified: location.verified,
						mapillary_url: location.mapillary_url,
						parking_type: location.parking_type,
                        website: location.website,
                        bike_types: location.bike_types
					}
				}))
			};

			console.log('Setting geojson data:', geojsonData);
			(map.getSource('parking-locations') as any).setData(geojsonData);
			console.log('✅ Parking locations added to map');
			
			// Debug: Check if markers are visible
			setTimeout(() => {
				const features = map.querySourceFeatures('parking-locations');
				console.log('🔍 Features in source:', features.length);
			}, 1000);
		} else {
			console.log('Map not ready, storing locations for later');
			pendingLocations = locations;
		}
	}

	// Function to trigger the built-in geolocation control
	export function triggerGeolocation() {
		if (geolocateControl) {
			console.log('🗺️ Triggering built-in geolocation control');
			geolocateControl.trigger();
		}
	}

	// Function to fly to a specific location and open its popup
	export function flyToLocationAndOpen(lng: number, lat: number, zoom: number = 16, location: any) {
		if (!map) return;
		
		console.log('Flying to location:', { lng, lat, zoom });
		
		map.flyTo({
			center: [lng, lat],
			zoom: zoom,
			duration: 2000,
			essential: true
		});

		// Wait for the fly animation to complete, then open side tray
		setTimeout(() => {
			if (location && onLocationClick) {
				onLocationClick(location, true); // Mark as closest since we flew to it
				
				// Close any existing popup
				if (currentPopup) {
					currentPopup.remove();
					currentPopup = null;
				}
			}
		}, 2200); // Slightly after the fly animation completes
	}

	// Function to center map on user location
	export function centerOnLocation(lat: number, lng: number, zoom: number = 14) {
		if (!map) return;
		
		map.flyTo({
			center: [lng, lat],
			zoom: zoom,
			duration: 1500,
			essential: true
		});
	}
</script>

<div bind:this={mapContainer} class="map-container"></div>



<style>
	.map-container {
		width: 100%;
		height: 100%;
		position: relative;
	}



	/* London Underground Live inspired popup styling */
	:global(.london-underground-popup .maplibregl-popup-content) {
		padding: 0 !important;
		border-radius: 16px !important;
		background: transparent !important;
		box-shadow: none !important;
		border: none !important;
		max-width: none !important;
	}

	/* Mobile popup adjustments */
	@media (max-width: 480px) {
		:global(.london-underground-popup .maplibregl-popup-content) {
			border-radius: 12px !important;
		}

		:global(.london-underground-popup .maplibregl-popup-close-button) {
			top: 8px !important;
			right: 8px !important;
			width: 20px !important;
			height: 20px !important;
			font-size: 12px !important;
		}

		:global(.london-underground-popup .maplibregl-popup-tip) {
			border-width: 6px 6px 0 6px !important;
		}
	}

	:global(.london-underground-popup .maplibregl-popup-close-button) {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 24px;
		height: 24px;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		color: #ffffff;
		font-size: 14px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s ease;
	}

	:global(.london-underground-popup .maplibregl-popup-close-button:hover) {
		background: rgba(0, 0, 0, 0.8);
		border-color: rgba(255, 255, 255, 0.3);
		transform: scale(1.1);
	}

	:global(.london-underground-popup .maplibregl-popup-tip) {
		border-top-color: rgba(15, 20, 30, 0.98) !important;
		border-width: 8px 8px 0 8px !important;
	}

	/* Map attribution styling */
	:global(.maplibregl-ctrl-attrib) {
		background: rgba(0, 0, 0, 0.6) !important;
		backdrop-filter: blur(8px) !important;
		border-radius: 6px !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: rgba(255, 255, 255, 0.8) !important;
		font-size: 10px !important;
	}

	:global(.maplibregl-ctrl-attrib a) {
		color: rgba(255, 255, 255, 0.9) !important;
	}

	/* Navigation controls styling */
	:global(.maplibregl-ctrl-group) {
		background: rgba(0, 0, 0, 0.6) !important;
		backdrop-filter: blur(8px) !important;
		border-radius: 8px !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
	}

	:global(.maplibregl-ctrl-group button) {
		background: transparent !important;
		color: rgba(255, 255, 255, 0.9) !important;
		border: none !important;
		transition: all 0.2s ease !important;
	}

	:global(.maplibregl-ctrl-group button:hover) {
		background: rgba(255, 255, 255, 0.1) !important;
		color: #ffffff !important;
	}

	:global(.maplibregl-ctrl-group button:not(:last-child)) {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
	}
</style> 