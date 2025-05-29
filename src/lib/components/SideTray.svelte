<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import MapillaryViewer from './MapillaryViewer.svelte';

	export let isOpen = false;
	export let location: any = null;
	export let isClosest = false;

	const dispatch = createEventDispatcher();

	// Detect if mobile for transition direction
	let isMobile = false;
	
	function checkMobile() {
		if (typeof window !== 'undefined') {
			isMobile = window.innerWidth <= 768;
		}
	}
	
	// Check on mount and resize
	if (typeof window !== 'undefined') {
		checkMobile();
		window.addEventListener('resize', checkMobile);
	}

	function closeTray() {
		dispatch('close');
	}

	function formatOpeningHours(hours: string | null): string {
		if (!hours) return 'Ukendt';
		if (hours === '24/7') return '24/7';
        // Split the string by a space followed by a capitalized word and a colon, then join with <br>
		const intervals = hours.split(/\s(?=[A-Z][a-zA-Z]+:)/);
        hours = intervals.join('<br>');
		return hours;
	}

	function formatFeeInfo(fee: string | null): string {
		if (!fee) return 'Ukendt';
		return fee;
	}

	function openMapillary() {
		if (location?.mapillary_url) {
			window.open(location.mapillary_url, '_blank');
		}
	}

	function openInMaps() {
		if (location?.latitude && location?.longitude) {
			const url = `https://maps.apple.com/?q=${location.latitude},${location.longitude}`;
			window.open(url, '_blank');
		}
	}
</script>



<!-- Side Tray - Desktop: right side, Mobile: bottom -->
{#if isOpen && location}
	<div 
		class="tray-container"
		on:keydown={(e) => e.key === 'Escape' && closeTray()}
		tabindex="-1"
		transition:fly={{ 
			x: isMobile ? 0 : 400, 
			y: isMobile ? 400 : 0, 
			duration: 400, 
			easing: quintOut 
		}}
	>
		<!-- Header -->
		<div class="tray-header">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="w-3 h-3 rounded-full {location.parking_type === 'long-term' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'}"></div>
					<h2 class="text-lg font-semibold text-white">Parkeringsinfo</h2>
				</div>
				<button 
					on:click={closeTray}
					class="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
					aria-label="Luk parkeringsinfo"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
		</div>

		<!-- Scrollable Content -->
		<div class="tray-content">
			<!-- Location Name -->
			<div class="space-y-2">
				<h3 class="text-xl font-bold text-white leading-tight">
					{location.name || 'Unavngivet lokation'}
				</h3>
				{#if isClosest}
					<div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
						<div class="w-2 h-2 rounded-full bg-emerald-400"></div>
						<span class="text-sm font-medium text-emerald-300">Nærmeste</span>
					</div>
				{/if}
			</div>

			<!-- Address -->
			{#if location.address}
				<div class="space-y-2">
					<h4 class="text-sm font-medium text-slate-400 uppercase tracking-wider">Adresse</h4>
					<p class="text-white font-medium">{location.address}</p>
				</div>
			{/if}

			<!-- Coordinates -->
			<div class="space-y-2">
				<h4 class="text-sm font-medium text-slate-400 uppercase tracking-wider">Koordinater</h4>
				<div class="bg-slate-800/50 rounded-lg p-3 font-mono text-sm">
					<div class="text-slate-300">
						<span class="text-slate-500">LAT:</span> {location.latitude?.toFixed(6) || 'N/A'}
					</div>
					<div class="text-slate-300">
						<span class="text-slate-500">LNG:</span> {location.longitude?.toFixed(6) || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Information Grid -->
			<div class="grid grid-cols-1 gap-4">
				<!-- Operator -->
				{#if location.operator}
					<div class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
						<div class="text-sm font-medium text-slate-400 mb-1">Operatør</div>
						<div class="text-white font-medium">{location.operator}</div>
					</div>
				{/if}

				<!-- Fee Info -->
				<div class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
					<div class="text-sm font-medium text-slate-400 mb-1">Pris</div>
					<div class="text-white font-medium">{formatFeeInfo(location.fee_info)}</div>
				</div>

				<!-- Opening Hours -->
				<div class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
					<div class="text-sm font-medium text-slate-400 mb-1">Åbningstider</div>
					<div class="text-white font-medium">{@html formatOpeningHours(location.opening_hours)}</div>
				</div>

				<!-- Capacity -->
				{#if location.capacity}
					<div class="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
						<div class="text-sm font-medium text-slate-400 mb-1">Kapacitet</div>
						<div class="text-white font-medium">{location.capacity} pladser</div>
					</div>
				{/if}
			</div>



			<!-- Navigation Button -->
			<div class="border-t border-slate-700/30 pt-4">
				<button 
					on:click={openInMaps}
					class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
					</svg>
					Få rutevejledning
				</button>
			</div>

			<!-- Mapillary Street View -->
			{#if location.latitude && location.longitude}
				<div>
					<MapillaryViewer 
						latitude={location.latitude} 
						longitude={location.longitude} 
						radius={100}
						maxImages={4}
					/>
				</div>
			{/if}

			<!-- Additional Action Buttons -->
			{#if location.mapillary_url}
				<div class="border-t border-slate-700/30 pt-4">
					<button 
						on:click={openMapillary}
						class="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
						</svg>
						Se Mapillary
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Responsive tray container */
	.tray-container {
		position: fixed;
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(148, 163, 184, 0.2);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
		z-index: 50;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Sticky header */
	.tray-header {
		flex-shrink: 0;
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(24px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
		padding: 1rem;
	}

	/* Scrollable content area */
	.tray-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Desktop: Side tray from right */
	@media (min-width: 769px) {
		.tray-container {
			top: 0;
			right: 0;
			height: 100vh;
			width: 100%;
			max-width: 28rem;
			border-left: 1px solid rgba(148, 163, 184, 0.2);
			border-radius: 0;
		}
	}

	/* Mobile: Bottom tray */
	@media (max-width: 768px) {
		.tray-container {
			bottom: 0;
			left: 0;
			right: 0;
			max-height: 85vh;
			border-top: 1px solid rgba(148, 163, 184, 0.2);
			border-radius: 20px 20px 0 0;
		}
	}

	/* Custom scrollbar for the content area */
	.tray-content::-webkit-scrollbar {
		width: 6px;
	}
	
	.tray-content::-webkit-scrollbar-track {
		background: rgba(51, 65, 85, 0.3);
	}
	
	.tray-content::-webkit-scrollbar-thumb {
		background: rgba(148, 163, 184, 0.5);
		border-radius: 3px;
	}
	
	.tray-content::-webkit-scrollbar-thumb:hover {
		background: rgba(148, 163, 184, 0.7);
	}
</style> 