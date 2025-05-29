<script lang="ts">
	import Map from '../components/Map.svelte';
	import SubmissionForm from '$lib/components/SubmissionForm.svelte';
	import SideTray from '$lib/components/SideTray.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/ui/button/Button.svelte';
	import { onMount } from 'svelte';
	import { supabase, type ParkingLocation } from '$lib/supabase';

	let mapComponent: Map;
	let isLoading = true;
	let parkingData: ParkingLocation[] = [];
	let filteredData: ParkingLocation[] = [];
	let error: string | null = null;
	let userLocation: { lat: number; lng: number } | null = null;
	let isLocating = false;
	let showSubmissionForm = false;
	let clickedLocation: { lat: number; lng: number } | null = null;
	let showLongTermParking = false; // Toggle between car parking and bike shops
	let showBikeMessageDialog = false; // Show cheeky bike message popup
	let showCarOwnerDialog = false; // Show cheeky message to car owners
	let showSideTray = false; // Control side tray visibility
	let selectedLocation: ParkingLocation | null = null; // Selected location for side tray
	let isClosestLocation = false; // Whether the selected location is the closest

	async function loadParkingData() {
		try {
			console.log('🔄 Loading parking data from Supabase...');
			
			const { data, error: supabaseError } = await supabase
				.from('parking_locations')
				.select('*')
				.order('name');

			if (supabaseError) {
				console.error('Supabase error:', supabaseError);
				error = `Kunne ikke indlæse parkeringsdata: ${supabaseError.message}`;
				return;
			}

			parkingData = data || [];
			console.log(`✅ Loaded ${parkingData.length} parking locations`);
			
			// Apply initial filtering
			filterData();
			
			// If no data found, fall back to sample data for demo
			if (parkingData.length === 0) {
				console.log('⚠️ No data in database, using sample data');
				parkingData = [
					{
						id: 'sample-1',
						name: 'Q-Park Nørreport',
						address: 'Frederiksborggade 22, 1360 København K',
						latitude: 55.6837,
						longitude: 12.5732,
						parking_type: 'short-term' as const,
						operator: 'Q-Park',
						fee_info: '25 DKK/time',
						opening_hours: '24/7',
                        capacity: 500,
						verified: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					},
					{
						id: 'sample-2',
						name: 'Illum Parkering',
						address: 'Østergade 52, 1100 København K',
						latitude: 55.6794,
						longitude: 12.5803,
						parking_type: 'short-term' as const,
						operator: 'Illum',
						fee_info: '30 DKK/time',
						opening_hours: '06:00-24:00',
                        capacity: 500,
						verified: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					},
					{
						id: 'sample-3',
						name: 'Magasin Parkering',
						address: 'Kongens Nytorv 13, 1095 København K',
						latitude: 55.6777,
						longitude: 12.5854,
						parking_type: 'short-term' as const,
						operator: 'Magasin',
						fee_info: '28 DKK/time',
						opening_hours: '07:00-23:00',
						verified: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					},
					{
						id: 'sample-4',
						name: 'Black Iron Horse',
						address: 'Nørrebrogade 41, 2200 Copenhagen, Denmark',
						latitude: 55.688623,
						longitude: 12.558293,
						parking_type: 'long-term' as const,
						opening_hours: 'By appointment only',
                        website: 'https://blackironhorse.com/',
						verified: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					},
                    {
						id: 'sample-5',
						name: 'Jupiter Cykler',
						address: 'Tagensvej 43, 2200 København N, Denmark',
						latitude: 55.699767,
						longitude: 12.553183,
						parking_type: 'long-term' as const,
						opening_hours: 'Monday-Friday: 09:00-17:30 Saturday: 10:00-14:00 Sunday: Closed',
                        website: 'https://www.jupiter.dk/',
						verified: true,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString()
					}
				];
				filterData(); // Re-apply filter to sample data
			}
		} catch (err) {
			console.error('Error loading parking data:', err);
			error = 'Kunne ikke forbinde til database';
		} finally {
			isLoading = false;
		}
	}

	function filterData() {
		filteredData = parkingData.filter(location => {
			const matchesParkingType = showLongTermParking ? 
				location.parking_type === 'long-term' : 
				location.parking_type === 'short-term';
			return matchesParkingType;
		});
		
		// Sort by distance if user location is available
		if (userLocation) {
			filteredData.sort((a, b) => {
				const distanceA = calculateDistance(userLocation!.lat, userLocation!.lng, a.latitude, a.longitude);
				const distanceB = calculateDistance(userLocation!.lat, userLocation!.lng, b.latitude, b.longitude);
				return distanceA - distanceB;
			});
		}
		
		// Update map with filtered data
		if (mapComponent && filteredData.length > 0) {
			mapComponent.addParkingLocations(filteredData);
		}
	}

	function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // Earth's radius in kilometers
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLng = (lng2 - lng1) * Math.PI / 180;
		const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLng/2) * Math.sin(dLng/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	}

	async function findMyLocation() {
		if (!navigator.geolocation) {
			alert('Geolokation understøttes ikke af denne browser.');
			return;
		}

		isLocating = true;
		
		// Trigger the built-in geolocation control to show user location
		if (mapComponent) {
			mapComponent.triggerGeolocation();
		}
		
		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, {
					enableHighAccuracy: false, // Reduce accuracy to prevent jittery updates
					timeout: 15000,
					maximumAge: 600000 // 10 minutes - use cached location longer
				});
			});

			const newLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			// Only update if location has changed significantly (more than ~100 meters)
			const shouldUpdate = !userLocation || 
				calculateDistance(userLocation.lat, userLocation.lng, newLocation.lat, newLocation.lng) > 0.1;

			if (shouldUpdate) {
				userLocation = newLocation;
				// Re-filter and sort by distance
				filterData();
			} else {
				// Location hasn't changed significantly, just update the stored location
				userLocation = newLocation;
				isLocating = false;
				return;
			}

			// Find the closest parking location
			if (filteredData.length > 0) {
				const closestLocation = filteredData[0]; // Already sorted by distance
				
				// Zoom to the closest location with a nice view
				if (mapComponent) {
					mapComponent.flyToLocationAndOpen(
						closestLocation.longitude, 
						closestLocation.latitude, 
						16, // Closer zoom level
						closestLocation
					);
				}
			} else {
				// If no parking locations, just center on user location
				if (mapComponent) {
					mapComponent.centerOnLocation(userLocation.lat, userLocation.lng);
				}
			}
		} catch (error) {
			console.error('Error getting location:', error);
			alert('Kan ikke finde din placering. Tjek venligst dine browserindstillinger.');
		} finally {
			isLocating = false;
		}
	}

	function openSideTray(location: ParkingLocation, isClosest: boolean = false) {
		selectedLocation = location;
		isClosestLocation = isClosest;
		showSideTray = true;
	}

	function closeSideTray() {
		showSideTray = false;
		selectedLocation = null;
		isClosestLocation = false;
	}

	function toggleParkingType() {
		const wasShortTerm = !showLongTermParking;
		showLongTermParking = !showLongTermParking;
		
		if (showLongTermParking && wasShortTerm) {
			// Show cheeky bike message when switching to long-term parking
			showBikeMessageDialog = true;
		}
		
		// Apply filtering to show the appropriate parking type
		filterData();
	}

	function openSubmissionForm(location?: { lat: number; lng: number }) {
		clickedLocation = location || null;
		showSubmissionForm = true;
	}

	function handleSubmissionSuccess() {
		// Reload parking data to show new submissions (after moderation)
		loadParkingData();
	}

	// Manual close functions for debugging
	function closeBikeDialog() {
		console.log('🚲 Manually closing bike dialog - current state:', showBikeMessageDialog);
		showBikeMessageDialog = false;
		console.log('🚲 After closing - new state:', showBikeMessageDialog);
	}
	
	function closeCarDialog() {
		console.log('🚗 Manually closing car dialog - current state:', showCarOwnerDialog);
		showCarOwnerDialog = false;
		console.log('🚗 After closing - new state:', showCarOwnerDialog);
	}

	// Remove default Dialog close buttons after dialogs are shown
	function removeDefaultCloseButtons() {
		setTimeout(() => {
			// Remove default close buttons from bike dialog
			const bikeDialog = document.querySelector('.bike-dialog');
			if (bikeDialog) {
				const defaultButtons = bikeDialog.querySelectorAll('button:not(.custom-close)');
				defaultButtons.forEach(btn => {
					if (btn.querySelector('svg') || btn.getAttribute('aria-label')?.toLowerCase().includes('close')) {
						btn.remove();
					}
				});
			}
			
			// Remove default close buttons from car dialog
			const carDialog = document.querySelector('.car-owner-dialog');
			if (carDialog) {
				const defaultButtons = carDialog.querySelectorAll('button:not(.custom-close)');
				defaultButtons.forEach(btn => {
					if (btn.querySelector('svg') || btn.getAttribute('aria-label')?.toLowerCase().includes('close')) {
						btn.remove();
					}
				});
			}
		}, 100);
	}

	// Watch for dialog state changes and remove default buttons
	$: if (showBikeMessageDialog || showCarOwnerDialog) {
		removeDefaultCloseButtons();
	}

	onMount(() => {
		loadParkingData();
		// Show the cheeky car owner message immediately
		showCarOwnerDialog = true;
	});

	// Track if we've already initialized the map with data
	let mapInitialized = false;

	// Watch for mapComponent to become available and add data (only once)
	$: if (mapComponent && !isLoading && filteredData.length > 0 && !mapInitialized) {
		console.log('mapComponent is now available, adding parking data');
		mapInitialized = true;
		setTimeout(() => {
			mapComponent.addParkingLocations(filteredData);
		}, 500); // Small delay to ensure map is fully ready
	}
</script>

<svelte:head>
	<title>Find din parkeringsplads - {showLongTermParking ? 'Langtidsparkering' : 'Korttidsparkering'}</title>
	<meta name="description" content={showLongTermParking ? 
		"Find langtidsparkeringsmuligheder i København" : 
		"Find korttidsparkering i København når gadeparkering er optaget"} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<main class="app" class:tray-open={showSideTray}>
	<!-- Desktop: Separate header and nav tabs -->
	<div class="desktop-layout">
		<!-- Floating header overlay - inspired by London Underground Live -->
		<div class="header-overlay">
			<h1 class="title">Find din parkeringsplads</h1>
		</div>

		<!-- Navigation tabs - London Underground Live style -->
		<div class="nav-tabs">
			<button 
				class="nav-tab"
				class:active={!showLongTermParking}
				on:click={() => !showLongTermParking || toggleParkingType()}
			>
				KORTTIDSPARKERING
			</button>
			<button 
				class="nav-tab"
				class:active={showLongTermParking}
				on:click={() => showLongTermParking || toggleParkingType()}
			>
				LANGTIDSPARKERING
			</button>
		</div>
	</div>

	<!-- Mobile: Combined header and nav tabs in one tray -->
	<div class="mobile-header-tray">
		<h1 class="mobile-title">Find din parkeringsplads</h1>
		<div class="mobile-nav-tabs">
			<button 
				class="mobile-nav-tab"
				class:active={!showLongTermParking}
				on:click={() => !showLongTermParking || toggleParkingType()}
			>
				KORTTIDSPARKERING
			</button>
			<button 
				class="mobile-nav-tab"
				class:active={showLongTermParking}
				on:click={() => showLongTermParking || toggleParkingType()}
			>
				LANGTIDSPARKERING
			</button>
		</div>
	</div>

	<!-- Combined counter and add data tray below header -->
	{#if !isLoading && !error}
		<div class="info-tray">
			<!-- Counter section -->
			<div class="counter-section">
				<span class="counter-number">{filteredData.length}</span>
				<span class="counter-label">
					{#if showLongTermParking}
						cykelbutikker
					{:else}
						parkeringsarealer
					{/if}
				</span>
			</div>
			
			<!-- Add data button -->
			<button 
				on:click={() => openSubmissionForm()}
				class="add-data-button"
				title={showLongTermParking ? "Tilføj en ny cykelbutik til kortet" : "Tilføj en ny parkeringsplads til kortet"}
			>
				<svg class="add-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 2v20M2 12h20"/>
				</svg>
				<span class="add-text">
					{showLongTermParking ? "Tilføj Cykelbutik" : "Tilføj Parkeringsdata"}
				</span>
			</button>

			<!-- GitHub contribution link -->
			<a 
				href="https://github.com/martincollignon/parkeringspladser"
				target="_blank"
				rel="noopener noreferrer"
				class="github-link"
				title="Hjælp med at forbedre projektet på GitHub"
			>
				<svg class="github-icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
				<span class="github-text">Bidrag til projektet</span>
			</a>
		</div>
	{/if}

	<!-- Find Nearest button - bottom center -->
	{#if !isLoading && !error}
		<div class="find-nearest-bottom">
			<button 
				on:click={findMyLocation}
				class="find-nearest-button"
				disabled={isLocating}
				title="Find nærmeste parkeringsplads"
			>
				{#if isLocating}
					<div class="location-spinner"></div>
					<span>Finder...</span>
				{:else}
					<svg class="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<circle cx="12" cy="12" r="4"/>
						<path d="M12 2v4"/>
						<path d="M12 18v4"/>
						<path d="M2 12h4"/>
						<path d="M18 12h4"/>
					</svg>
					<span>Find Nærmeste</span>
				{/if}
			</button>
		</div>
	{/if}



	<!-- Full-screen map -->
	<div class="map-section">
		{#if isLoading}
			<div class="loading">
				<div class="loading-spinner"></div>
				<p>Indlæser parkeringspladser...</p>
			</div>
		{:else if error}
			<div class="loading">
				<div class="error-icon">⚠️</div>
				<p>{error}</p>
				<button on:click={loadParkingData} class="retry-button">Prøv Igen</button>
			</div>
		{:else}
			<Map bind:this={mapComponent} onLocationClick={openSideTray} onMapClick={closeSideTray} />
		{/if}
	</div>





	<!-- Submission Form Modal -->
	<SubmissionForm 
		bind:isOpen={showSubmissionForm}
		prefilledLocation={clickedLocation}
		initialParkingType={showLongTermParking ? 'long-term' : 'short-term'}
		on:submitted={handleSubmissionSuccess}
	/>

	<!-- Cheeky Bike Message Dialog -->
	<Dialog.Root bind:open={showBikeMessageDialog}>
		<Dialog.Content class="bike-dialog max-w-md">
			<!-- Custom close button -->
			<button 
				on:click={(e) => {
					e.preventDefault();
					e.stopPropagation();
					console.log('🚲 Close button clicked!', e);
					closeBikeDialog();
				}}
				class="custom-close absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors text-white border border-white/20 hover:border-white/40"
				style="z-index: 99999 !important; pointer-events: auto !important;"
				aria-label="Close dialog"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			
			<div class="text-center space-y-6">
				<Dialog.Header>
					<Dialog.Title class="text-2xl font-bold flex items-center gap-3 mb-4">
						<span class="text-4xl">🚲</span>
						<div class="flex flex-col">
							<span class="text-white">
								Langsigtet Løsning
							</span>
							<span class="text-sm font-normal text-gray-400 uppercase tracking-wider">
								CYKEL I KØBENHAVN
							</span>
						</div>
					</Dialog.Title>
				</Dialog.Header>
				
				<div class="space-y-6">
					<div class="text-center py-6">
						<p class="text-xl leading-relaxed text-gray-100 mb-4">
							Du kan lede efter parkering <em class="text-yellow-400 font-semibold">hele dit liv</em>...
						</p>
						<div class="flex items-center justify-center gap-4 my-6">
							<div class="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
							<span class="text-2xl">🤔</span>
							<div class="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
						</div>
						<p class="text-xl leading-relaxed text-gray-100">
							...eller du kan <strong class="text-green-400">slippe af med bilen</strong> og aldrig bekymre dig om parkering igen! 
						</p>
					</div>

					<p class="text-sm text-gray-600 mb-4">
						Cykler er en fantastisk måde at komme rundt i København på! 🚴‍♀️
					</p>
				</div>
			</div>

			<Dialog.Footer class="mt-8">
				<Button 
					on:click={(e) => {
						e.preventDefault();
						e.stopPropagation();
						console.log('🚲 CTA button clicked!');
						closeBikeDialog();
					}}
					class="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
					style="z-index: 99999 !important; pointer-events: auto !important; position: relative !important;"
				>
					<span class="flex items-center justify-center gap-2">
						<span>Fantastisk! Vis mig cykelbutikker</span>
						<span class="text-xl">🚲</span>
					</span>
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Cheeky Car Owner Message Dialog -->
	<Dialog.Root bind:open={showCarOwnerDialog}>
		<Dialog.Content class="car-owner-dialog max-w-lg">
			<!-- Custom close button -->
			<button 
				on:click={(e) => {
					e.preventDefault();
					e.stopPropagation();
					console.log('🚗 Close button clicked!', e);
					closeCarDialog();
				}}
				class="custom-close absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors text-white border border-white/20 hover:border-white/40"
				style="z-index: 99999 !important; pointer-events: auto !important;"
				aria-label="Close dialog"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			
			<div class="space-y-6">
				<Dialog.Header>
					<Dialog.Title class="text-2xl font-bold flex items-center gap-3 mb-4">
						<span class="text-4xl">🚗</span>
						<div class="flex flex-col">
							<span class="text-white">
								Parkering i København
							</span>
							<span class="text-sm font-normal text-gray-400 uppercase tracking-wider">
								BETALTE ALTERNATIVER
							</span>
						</div>
					</Dialog.Title>
				</Dialog.Header>
				
				<div class="text-center py-6">
					<p class="text-lg leading-relaxed text-gray-100 mb-4">
						Hvis du er træt af at køre rundt for at finde en parkeringsplads, så tøv ikke med at bruge de mange <em class="text-yellow-400 font-semibold">betalte alternativer</em>, der er tomme det meste af tiden.
					</p>
					<div class="flex items-center justify-center gap-4 my-6">
						<div class="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
						<span class="text-2xl">💰</span>
						<div class="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent flex-1"></div>
					</div>
					<p class="text-lg leading-relaxed text-gray-100">
						Og lad venligst ikke <strong class="text-red-400">populister</strong> bruge vores penge på at få flere parkeringspladser. Det vil kun tiltrække flere biler.
					</p>
				</div>
			</div>

			<Dialog.Footer class="mt-6 pt-4 border-t border-gray-700/50">
				<Button 
					on:click={(e) => {
						e.preventDefault();
						e.stopPropagation();
						console.log('🚗 CTA button clicked!');
						closeCarDialog();
					}}
					class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/25 border border-blue-500/30"
					style="z-index: 99999 !important; pointer-events: auto !important; position: relative !important;"
				>
					<span class="flex items-center justify-center gap-2">
						<span>Forstået! Vis mig parkeringsmulighederne</span>
						<span class="text-lg">🚗</span>
					</span>
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Side Tray -->
	<SideTray 
		isOpen={showSideTray} 
		location={selectedLocation} 
		isClosest={isClosestLocation}
		on:close={closeSideTray}
	/>
</main>

<style>
	.app {
		height: 100vh;
		position: relative;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif;
		background: #0a0a0a;
		color: #ffffff;
	}

	/* Desktop layout - show separate header and nav tabs */
	.desktop-layout {
		display: block;
	}

	/* Mobile layout - hide desktop layout */
	.mobile-header-tray {
		display: none;
	}

	/* Floating header overlay - inspired by London Underground Live */
	.header-overlay {
		position: absolute;
		top: 24px;
		left: 24px;
		z-index: 1050;
		background: rgba(15, 20, 30, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 16px 20px;
		color: white;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		transition: all 0.3s ease;
	}

	.header-overlay:hover {
		background: rgba(20, 25, 35, 0.95);
		transform: translateY(-1px);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.7),
			0 1px 0 rgba(255, 255, 255, 0.12) inset;
	}

	/* Navigation tabs - London Underground Live style */
	.nav-tabs {
		position: absolute;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1100;
		display: flex;
		background: rgba(15, 20, 30, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 4px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		transition: all 0.3s ease;
	}

	.nav-tabs:hover {
		background: rgba(20, 25, 35, 0.95);
		transform: translateX(-50%) translateY(-1px);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.7),
			0 1px 0 rgba(255, 255, 255, 0.12) inset;
	}

	.nav-tab {
		padding: 8px 16px;
		background: transparent;
		border: none;
		color: rgba(148, 163, 184, 0.8);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.8px;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 8px;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.nav-tab:hover {
		color: rgba(203, 213, 225, 0.9);
		background: rgba(255, 255, 255, 0.05);
	}

	.nav-tab.active {
		color: #ffffff;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		box-shadow: 
			0 2px 8px rgba(59, 130, 246, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1) inset;
	}

	.nav-tab.active:hover {
		background: rgba(59, 130, 246, 0.25);
		border-color: rgba(59, 130, 246, 0.4);
	}

	/* Mobile header tray - combined title and nav tabs */
	.mobile-header-tray {
		position: absolute;
		top: 12px;
		left: 12px;
		right: 12px;
		z-index: 1100;
		background: rgba(15, 20, 30, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 16px;
		color: white;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		transition: all 0.3s ease;
	}

	.mobile-title {
		margin: 0 0 12px 0;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-align: center;
	}

	.mobile-nav-tabs {
		display: flex;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 4px;
		gap: 2px;
	}

	.mobile-nav-tab {
		flex: 1;
		padding: 10px 12px;
		background: transparent;
		border: none;
		color: rgba(148, 163, 184, 0.8);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.2s ease;
		text-align: center;
	}

	.mobile-nav-tab:hover {
		color: rgba(203, 213, 225, 0.9);
		background: rgba(255, 255, 255, 0.05);
	}

	.mobile-nav-tab.active {
		color: #ffffff;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		box-shadow: 
			0 2px 8px rgba(59, 130, 246, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1) inset;
	}

	.mobile-nav-tab.active:hover {
		background: rgba(59, 130, 246, 0.25);
		border-color: rgba(59, 130, 246, 0.4);
	}







	.title {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Combined info tray below header */
	.info-tray {
		position: absolute;
		top: 100px; /* Below header */
		left: 24px;
		z-index: 1040;
		background: rgba(15, 20, 30, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 16px;
		color: white;
		display: flex;
		flex-direction: column;
		gap: 12px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		transition: all 0.3s ease;
		min-width: 220px;
	}

	.info-tray:hover {
		background: rgba(20, 25, 35, 0.95);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.7),
			0 1px 0 rgba(255, 255, 255, 0.12) inset;
	}

	.counter-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.counter-number {
		font-size: 1.5rem;
		font-weight: 700;
		color: white;
		line-height: 1;
	}

	.counter-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 2px;
	}

	.add-data-button {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.9);
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		justify-content: center;
		text-align: center;
		white-space: nowrap;
	}

	.add-data-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.25);
		color: white;
	}

	.add-icon {
		width: 12px;
		height: 12px;
		opacity: 0.8;
	}

	.github-link {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(88, 166, 255, 0.1);
		border: 1px solid rgba(88, 166, 255, 0.3);
		color: rgba(88, 166, 255, 0.9);
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		justify-content: center;
		text-align: center;
		white-space: nowrap;
		text-decoration: none;
	}

	.github-link:hover {
		background: rgba(88, 166, 255, 0.2);
		border-color: rgba(88, 166, 255, 0.5);
		color: #58a6ff;
		text-decoration: none;
		transform: translateY(-1px);
	}

	.github-icon {
		width: 12px;
		height: 12px;
		opacity: 0.8;
	}

	/* Find Nearest button - bottom center */
	.find-nearest-bottom {
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1020;
		background: rgba(15, 20, 30, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		padding: 12px 16px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		transition: all 0.3s ease, transform 0.4s ease;
	}

	.find-nearest-bottom:hover {
		background: rgba(20, 25, 35, 0.95);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.7),
			0 1px 0 rgba(255, 255, 255, 0.12) inset;
	}

	.find-nearest-button {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.4);
		color: #10b981;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		justify-content: center;
		text-align: center;
		white-space: nowrap;
		min-height: 48px;
	}

	.find-nearest-button:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.25);
		border-color: rgba(16, 185, 129, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.find-nearest-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.location-icon {
		width: 16px;
		height: 16px;
	}

	.location-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(16, 185, 129, 0.3);
		border-top: 2px solid #10b981;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	/* Removed pulse animation to prevent jitter */

	.map-section {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #6b7280;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e7eb;
		border-top: 3px solid #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.error-icon {
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.retry-button {
		margin-top: 1rem;
		padding: 8px 16px;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.retry-button:hover {
		background: #1d4ed8;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}



	/* Mobile optimizations - Proper structured layout */
	@media (max-width: 768px) {
		/* Hide desktop layout on mobile */
		.desktop-layout {
			display: none;
		}

		/* Show mobile header tray */
		.mobile-header-tray {
			display: block;
		}

		/* Info tray - below mobile header tray */
		.info-tray {
			top: 120px; /* Below mobile header tray */
			left: 12px;
			padding: 12px;
			min-width: 180px;
		}

		.counter-number {
			font-size: 1.25rem;
		}

		.counter-label {
			font-size: 0.7rem;
		}

		.add-data-button {
			padding: 8px 12px;
			font-size: 0.75rem;
		}

		.add-icon {
			width: 12px;
			height: 12px;
		}

		/* Find Nearest button - bottom center on mobile */
		.find-nearest-bottom {
			bottom: 12px;
			padding: 10px 14px;
		}

		.find-nearest-button {
			padding: 10px 14px;
			font-size: 0.8rem;
			min-height: 44px;
		}

		.location-icon {
			width: 14px;
			height: 14px;
		}

		.location-spinner {
			width: 14px;
			height: 14px;
		}

		/* Navigation tabs - top center, proper width */
		.nav-tabs {
			top: 12px;
			left: 50%;
			transform: translateX(-50%);
			right: auto;
			padding: 6px;
			border-radius: 16px;
			min-height: 56px;
			max-width: 320px;
			width: auto;
		}

		.nav-tab {
			padding: 12px 20px;
			font-size: 11px;
			font-weight: 800;
			min-height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;
			white-space: nowrap;
			letter-spacing: 0.5px;
		}

		/* Mobile: hide elements when tray is open (tray takes 85vh) */
		.app.tray-open .mobile-header-tray,
		.app.tray-open .info-tray,
		.app.tray-open .find-nearest-bottom {
			display: none; /* Hide when tray is open on mobile */
		}
	}

	/* Landscape mobile - compact horizontal layout */
	@media (max-width: 768px) and (orientation: landscape) {
		/* Hide mobile header tray in landscape for cleaner view */
		.mobile-header-tray {
			display: none;
		}

		/* Show desktop layout in landscape for more space */
		.desktop-layout {
			display: block;
		}

		/* Navigation tabs - top center, very compact */
		.nav-tabs {
			top: 6px;
			left: 50%;
			transform: translateX(-50%);
			right: auto;
			padding: 2px;
			min-height: 32px;
			max-width: calc(60vw - 16px);
		}

		.nav-tab {
			padding: 4px 12px;
			font-size: 8px;
			min-height: 26px;
			font-weight: 800;
		}

		/* Hide header overlay in landscape */
		.header-overlay {
			display: none;
		}
	}





	/* Small mobile screens - simplified layout */
	@media (max-width: 480px) {
		/* Mobile header tray - smaller */
		.mobile-header-tray {
			top: 10px;
			left: 10px;
			right: 10px;
			padding: 14px;
		}

		.mobile-title {
			font-size: 0.9rem;
			margin-bottom: 10px;
		}

		.mobile-nav-tab {
			padding: 8px 10px;
			font-size: 9px;
		}

		/* Info tray - smaller */
		.info-tray {
			top: 110px; /* Adjusted for smaller mobile header tray */
			left: 10px;
			padding: 10px;
			min-width: 160px;
		}

		.counter-number {
			font-size: 1.1rem;
		}

		.counter-label {
			font-size: 0.65rem;
		}

		.add-data-button {
			padding: 6px 10px;
			font-size: 0.7rem;
		}

		.add-icon {
			width: 10px;
			height: 10px;
		}

		/* Find Nearest button - smaller */
		.find-nearest-bottom {
			bottom: 10px;
			padding: 8px 12px;
		}

		.find-nearest-button {
			padding: 8px 12px;
			font-size: 0.75rem;
			min-height: 40px;
		}

		.location-icon {
			width: 12px;
			height: 12px;
		}

		.location-spinner {
			width: 12px;
			height: 12px;
		}

		/* Navigation tabs - slightly smaller */
		.nav-tabs {
			top: 10px;
			left: 50%;
			transform: translateX(-50%);
			right: auto;
			padding: 4px;
			min-height: 52px;
			max-width: 300px;
			width: auto;
		}

		.nav-tab {
			padding: 10px 16px;
			font-size: 10px;
			min-height: 40px;
			font-weight: 800;
		}
	}

	/* Ultra small screens - minimal layout */
	@media (max-width: 360px) {
		/* Mobile header tray - minimal */
		.mobile-header-tray {
			top: 8px;
			left: 8px;
			right: 8px;
			padding: 12px;
		}

		.mobile-title {
			font-size: 0.85rem;
			margin-bottom: 8px;
		}

		.mobile-nav-tab {
			padding: 6px 8px;
			font-size: 8px;
		}

		/* Info tray - minimal */
		.info-tray {
			top: 100px; /* Adjusted for minimal mobile header tray */
			left: 8px;
			padding: 8px;
			min-width: 140px;
		}

		.counter-number {
			font-size: 1rem;
		}

		.counter-label {
			font-size: 0.6rem;
		}

		.add-data-button {
			padding: 5px 8px;
			font-size: 0.65rem;
		}

		.add-icon {
			width: 8px;
			height: 8px;
		}

		/* Find Nearest button - minimal */
		.find-nearest-bottom {
			bottom: 8px;
			padding: 6px 10px;
		}

		.find-nearest-button {
			padding: 6px 10px;
			font-size: 0.7rem;
			min-height: 36px;
		}

		.location-icon {
			width: 10px;
			height: 10px;
		}

		.location-spinner {
			width: 10px;
			height: 10px;
		}

		/* Navigation tabs - minimal */
		.nav-tabs {
			top: 8px;
			left: 50%;
			transform: translateX(-50%);
			right: auto;
			padding: 3px;
			min-height: 48px;
			max-width: 280px;
			width: auto;
		}

		.nav-tab {
			padding: 8px 12px;
			font-size: 9px;
			min-height: 36px;
			font-weight: 800;
		}
	}

	/* Desktop: shift elements left when side tray is open */
	@media (min-width: 769px) {
		/* Shift map controls left when tray is open */
		.app.tray-open :global(.maplibregl-ctrl-top-right) {
			right: 460px !important; /* 28rem (tray width) + 12px spacing */
			transition: right 0.4s ease !important;
		}
		
		.app.tray-open :global(.maplibregl-ctrl-bottom-right) {
			right: 460px !important; /* 28rem (tray width) + 12px spacing */
			transition: right 0.4s ease !important;
		}

		/* Shift find nearest button left when tray is open */
		.app.tray-open .find-nearest-bottom {
			transform: translateX(calc(-50% - 230px)) !important; /* Move left by half tray width */
			transition: transform 0.4s ease !important;
		}
	}

	/* Smooth transition for map controls when tray opens/closes */
	:global(.maplibregl-ctrl-top-right),
	:global(.maplibregl-ctrl-bottom-right) {
		transition: right 0.4s ease !important;
	}

	/* Mobile close button styling for car dialog */
	:global(.car-owner-dialog [data-bits-dialog-close]) {
		position: absolute !important;
		top: 1rem !important;
		right: 1rem !important;
		width: 44px !important;
		height: 44px !important;
		min-width: 44px !important;
		min-height: 44px !important;
		border-radius: 50% !important;
		background: rgba(0, 0, 0, 0.6) !important;
		backdrop-filter: blur(8px) !important;
		border: 1px solid rgba(255, 255, 255, 0.2) !important;
		color: #ffffff !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		cursor: pointer !important;
		z-index: 1000 !important;
		pointer-events: auto !important;
		opacity: 1 !important;
		transition: all 0.2s ease !important;
		touch-action: manipulation !important;
	}
	
	/* Desktop close button styling for car dialog */
	@media (min-width: 769px) {
		:global(.car-owner-dialog [data-bits-dialog-close]) {
			width: 32px !important;
			height: 32px !important;
			min-width: 32px !important;
			min-height: 32px !important;
			top: 0.75rem !important;
			right: 0.75rem !important;
		}
		
		:global(.car-owner-dialog [data-bits-dialog-close] svg) {
			width: 16px !important;
			height: 16px !important;
		}
	}

	/* Hide default Dialog close buttons since we have custom ones - COMPREHENSIVE */
	:global(.bike-dialog button.absolute.right-4.top-4.rounded-sm:not(.custom-close)),
	:global(.bike-dialog [data-bits-dialog-close]:not(.custom-close)),
	:global(.bike-dialog button[aria-label*="Close"]:not(.custom-close)),
	:global(.bike-dialog button[aria-label*="close"]:not(.custom-close)) {
		display: none !important;
		visibility: hidden !important;
		opacity: 0 !important;
		pointer-events: none !important;
		position: absolute !important;
		left: -9999px !important;
		width: 0 !important;
		height: 0 !important;
		overflow: hidden !important;
	}
	
	:global(.car-owner-dialog button.absolute.right-4.top-4.rounded-sm:not(.custom-close)),
	:global(.car-owner-dialog [data-bits-dialog-close]:not(.custom-close)),
	:global(.car-owner-dialog button[aria-label*="Close"]:not(.custom-close)),
	:global(.car-owner-dialog button[aria-label*="close"]:not(.custom-close)) {
		display: none !important;
		visibility: hidden !important;
		opacity: 0 !important;
		pointer-events: none !important;
		position: absolute !important;
		left: -9999px !important;
		width: 0 !important;
		height: 0 !important;
		overflow: hidden !important;
	}
	
	/* Fallback: hide any button in top-right corner that's not our custom one */
	:global(.bike-dialog > button:first-child:not(.custom-close)),
	:global(.bike-dialog > *:last-child:not(.custom-close)) {
		display: none !important;
	}
	
	:global(.car-owner-dialog > button:first-child:not(.custom-close)),
	:global(.car-owner-dialog > *:last-child:not(.custom-close)) {
		display: none !important;
	}

	.github-link {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(88, 166, 255, 0.1);
		border: 1px solid rgba(88, 166, 255, 0.3);
		color: rgba(88, 166, 255, 0.9);
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		justify-content: center;
		text-align: center;
		white-space: nowrap;
		text-decoration: none;
	}

	.github-link:hover {
		background: rgba(88, 166, 255, 0.2);
		border-color: rgba(88, 166, 255, 0.5);
		color: #58a6ff;
		text-decoration: none;
		transform: translateY(-1px);
	}

	.github-icon {
		width: 12px;
		height: 12px;
		opacity: 0.8;
	}
</style>
