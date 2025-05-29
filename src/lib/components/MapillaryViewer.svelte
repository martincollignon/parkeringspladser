<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_MAPILLARY_ACCESS_TOKEN } from '$env/static/public';

	export let latitude: number;
	export let longitude: number;
	export let radius: number = 100; // Search radius in meters
	export let maxImages: number = 6;

	interface MapillaryImage {
		id: string;
		thumb_1024_url: string;
		thumb_2048_url: string;
		computed_compass_angle: number;
		captured_at: string;
		geometry: {
			coordinates: [number, number];
		};
	}

	let images: MapillaryImage[] = [];
	let loading = true;
	let error: string | null = null;
	let selectedImage: MapillaryImage | null = null;
	let showContributeSection = false;
	let selectedIndex: number | null = null;

	async function fetchMapillaryImages() {
		if (!browser || !PUBLIC_MAPILLARY_ACCESS_TOKEN) {
			error = 'Mapillary API-nøgle ikke konfigureret';
			loading = false;
			return;
		}

		try {
			loading = true;
			error = null;

			// Mapillary API v4 endpoint for images near a location
			const url = new URL('https://graph.mapillary.com/images');
			url.searchParams.set('access_token', PUBLIC_MAPILLARY_ACCESS_TOKEN);
			url.searchParams.set('fields', 'id,thumb_1024_url,thumb_2048_url,computed_compass_angle,captured_at,geometry');
			url.searchParams.set('bbox', getBoundingBox(longitude, latitude, radius));
			url.searchParams.set('limit', maxImages.toString());

			console.log('🔍 Fetching Mapillary images for:', { latitude, longitude, radius });

			const response = await fetch(url.toString());
			
			if (!response.ok) {
				throw new Error(`Mapillary API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			images = data.data || [];
			
			console.log(`📸 Found ${images.length} Mapillary images`);
			
			if (images.length === 0) {
				error = 'Ingen gadeniveau-billeder fundet i dette område';
			}
		} catch (err) {
			console.error('Error fetching Mapillary images:', err);
			error = err instanceof Error ? err.message : 'Kunne ikke indlæse gadebilleder';
		} finally {
			loading = false;
		}
	}

	function getBoundingBox(lng: number, lat: number, radiusMeters: number): string {
		// Convert radius from meters to degrees (rough approximation)
		const radiusDegrees = radiusMeters / 111000; // 1 degree ≈ 111km
		
		const minLng = lng - radiusDegrees;
		const minLat = lat - radiusDegrees;
		const maxLng = lng + radiusDegrees;
		const maxLat = lat + radiusDegrees;
		
		return `${minLng},${minLat},${maxLng},${maxLat}`;
	}

	function formatDate(dateString: string): string {
		try {
			return new Date(dateString).toLocaleDateString('da-DK', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return 'Ukendt dato';
		}
	}

	function getCompassDirection(angle: number): string {
		const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		const index = Math.round(angle / 45) % 8;
		return directions[index];
	}

	function openImageViewer(image: MapillaryImage) {
		const index = images.findIndex(img => img.id === image.id);
		if (index !== -1) {
			selectedIndex = index;
			selectedImage = image;
		}
	}

	function closeImageViewer() {
		selectedImage = null;
		selectedIndex = null;
	}

	function goToPreviousImage() {
		if (selectedIndex !== null) {
			selectedIndex = (selectedIndex - 1 + images.length) % images.length;
			selectedImage = images[selectedIndex];
		}
	}

	function goToNextImage() {
		if (selectedIndex !== null) {
			selectedIndex = (selectedIndex + 1) % images.length;
			selectedImage = images[selectedIndex];
		}
	}

	onMount(() => {
		fetchMapillaryImages();
	});

	// Handle escape key and arrow keys
	function handleKeydown(event: KeyboardEvent) {
		if (selectedImage) {
			if (event.key === 'Escape') {
				closeImageViewer();
			} else if (event.key === 'ArrowLeft') {
				goToPreviousImage();
			} else if (event.key === 'ArrowRight') {
				goToNextImage();
			}
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

<div class="mapillary-viewer">
	<div class="mapillary-header">
		<h4 class="mapillary-title">
			<span class="mapillary-icon">📸</span>
			Gadebilleder
		</h4>
		{#if !loading && !error && images.length > 0}
			<span class="image-count">{images.length} image{images.length !== 1 ? 's' : ''}</span>
		{/if}
	</div>

	{#if loading}
		<div class="mapillary-loading">
			<div class="loading-spinner"></div>
			<span>Indlæser gadebilleder...</span>
		</div>
	{:else if error}
		<div class="mapillary-error">
			<span class="error-icon">⚠️</span>
			<span class="error-text">{error}</span>
		</div>
	{:else if images.length === 0}
		<div class="mapillary-empty">
			<span class="empty-icon">📷</span>
			<span class="empty-text">Ingen gadebilleder tilgængelige for denne lokation</span>
		</div>
	{:else}
		<div class="mapillary-grid">
			{#each images as image (image.id)}
				<button 
					class="mapillary-thumbnail"
					on:click={() => openImageViewer(image)}
					title="View street image from {formatDate(image.captured_at)}"
				>
					<img 
						src={image.thumb_1024_url} 
						alt="Street view from {formatDate(image.captured_at)}"
						loading="lazy"
					/>
					<div class="thumbnail-overlay">
						<span class="compass-direction">
							{getCompassDirection(image.computed_compass_angle)}
						</span>
						<span class="capture-date">
							{formatDate(image.captured_at)}
						</span>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<!-- Contribution section -->
<div class="contribute-section">
	<button 
		class="contribute-toggle"
		on:click={() => showContributeSection = !showContributeSection}
		aria-expanded={showContributeSection}
	>
		<span class="contribute-toggle-icon">📱</span>
		<span class="contribute-toggle-text">Hjælp med at forbedre dækningen</span>
		<svg 
			class="contribute-chevron" 
			class:expanded={showContributeSection}
			viewBox="0 0 24 24" 
			fill="none" 
			stroke="currentColor" 
			stroke-width="2"
		>
			<polyline points="6,9 12,15 18,9"></polyline>
		</svg>
	</button>
	
	{#if showContributeSection}
		<div class="contribute-content">
			<p class="contribute-description">
				Du kan hjælpe andre bilister ved at tage billeder af dette parkeringsområde med Mapillary-appen - både udendørs og indendørs.
			</p>
			<div class="contribute-actions">
				<a 
					href="https://www.mapillary.com/mobile" 
					target="_blank" 
					rel="noopener noreferrer"
					class="contribute-btn primary"
				>
					<span class="btn-icon">📲</span>
					Download Mapillary App
				</a>
				<a 
					href="https://help.mapillary.com/hc/en-us/articles/115001636009-How-to-capture-images" 
					target="_blank" 
					rel="noopener noreferrer"
					class="contribute-btn secondary"
				>
					<span class="btn-icon">📖</span>
					Sådan Bidrager Du
				</a>
			</div>
			<div class="contribute-tips">
				<div class="tip-item">
					<span class="tip-icon">💡</span>
					<span class="tip-text">Tag billeder af parkeringsindgange, udgange, skilte og indendørs områder</span>
				</div>
				<div class="tip-item">
					<span class="tip-icon">🎯</span>
					<span class="tip-text">Billeder hjælper andre bilister med at finde og navigere til parkeringspladser</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Full-screen image viewer -->
{#if selectedImage}
	<div class="image-viewer-overlay" on:click={closeImageViewer}>
		<div class="image-viewer-container" on:click|stopPropagation>
			<button class="close-button" on:click={closeImageViewer}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
			
			<!-- Navigation Buttons -->
			{#if images.length > 1}
				<button class="nav-button prev-button" on:click|stopPropagation={goToPreviousImage}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>
				<button class="nav-button next-button" on:click|stopPropagation={goToNextImage}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			{/if}
			
			<img 
				src={selectedImage.thumb_2048_url} 
				alt="Gadebillede fra {formatDate(selectedImage.captured_at)}"
				class="full-image"
			/>

			<!-- Image Numbering -->
			{#if selectedIndex !== null && images.length > 0}
				<div class="image-numbering">
					{selectedIndex + 1} / {images.length}
				</div>
			{/if}

			<div class="image-info">
				<div class="image-meta">
					<span class="meta-item">
						<span class="meta-icon">🧭</span>
						Retning {getCompassDirection(selectedImage.computed_compass_angle)}
					</span>
					<span class="meta-item">
						<span class="meta-icon">📅</span>
						{formatDate(selectedImage.captured_at)}
					</span>
				</div>
				<div class="mapillary-credit">
					<span>Billede fra Mapillary</span>
					<a 
						href="https://www.mapillary.com/app/?pKey={selectedImage.id}" 
						target="_blank" 
						rel="noopener noreferrer"
						class="mapillary-link"
					>
						Se på Mapillary
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.mapillary-viewer {
		margin-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		padding: 16px 24px 0;
	}

	.mapillary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.mapillary-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0;
	}

	.mapillary-icon {
		font-size: 16px;
	}

	.image-count {
		font-size: 12px;
		color: #6b7280;
		background: #f3f4f6;
		padding: 2px 8px;
		border-radius: 12px;
	}

	.mapillary-loading,
	.mapillary-error,
	.mapillary-empty {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px;
		text-align: center;
		color: #6b7280;
		font-size: 13px;
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #e5e7eb;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.mapillary-error {
		color: #dc2626;
		background: #fef2f2;
		border-radius: 6px;
	}

	.mapillary-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 8px;
	}

	.mapillary-thumbnail {
		position: relative;
		aspect-ratio: 16/9;
		border: none;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		background: #f3f4f6;
	}

	.mapillary-thumbnail:hover {
		transform: scale(1.02);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.mapillary-thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
		color: white;
		padding: 8px 6px 4px;
		font-size: 10px;
		display: flex;
		justify-content: space-between;
		align-items: end;
	}

	.compass-direction {
		font-weight: 600;
		background: rgba(255, 255, 255, 0.2);
		padding: 2px 4px;
		border-radius: 3px;
	}

	.capture-date {
		opacity: 0.9;
	}

	/* Full-screen viewer */
	.image-viewer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.image-viewer-container {
		position: relative;
		max-width: 90vw;
		max-height: 90vh;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
	}

	.close-button {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 32px;
		height: 32px;
		background: rgba(0, 0, 0, 0.7);
		border: none;
		border-radius: 50%;
		color: white;
		cursor: pointer;
		z-index: 1001;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}

	.close-button:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.close-button svg {
		width: 16px;
		height: 16px;
	}

	.full-image {
		width: 100%;
		height: auto;
		max-height: calc(90vh - 80px);
		object-fit: contain;
		display: block;
	}

	.image-numbering {
		position: absolute;
		top: 12px;
		left: 12px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		font-size: 14px;
		padding: 4px 8px;
		border-radius: 4px;
		z-index: 1001;
	}

	.image-info {
		padding: 16px;
		background: white;
	}

	.image-meta {
		display: flex;
		gap: 16px;
		margin-bottom: 12px;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		color: #374151;
	}

	.meta-icon {
		font-size: 16px;
	}

	.mapillary-credit {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
		color: #6b7280;
		border-top: 1px solid #e5e7eb;
		padding-top: 12px;
	}

	.mapillary-link {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}

	.mapillary-link:hover {
		text-decoration: underline;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.mapillary-viewer {
			padding: 12px 16px 0;
		}

		.mapillary-grid {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.image-viewer-overlay {
			padding: 10px;
		}
		
		.image-meta {
			flex-direction: column;
			gap: 8px;
		}
		
		.mapillary-credit {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.contribute-actions {
			flex-direction: column;
			gap: 8px;
		}

		.contribute-btn {
			width: 100%;
			justify-content: center;
		}

		.contribute-tips {
			flex-direction: column;
		}
	}

	/* Contribution section styles */
	.contribute-section {
		margin-top: 12px;
		border-radius: 8px;
		overflow: hidden;
		background: #1e293b;
		border: 1px solid #334155;
	}

	.contribute-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 13px;
		color: #94a3b8;
		transition: all 0.2s ease;
		text-align: left;
	}

	.contribute-toggle:hover {
		background: #334155;
		color: #cbd5e1;
	}

	.contribute-toggle-icon {
		font-size: 14px;
		opacity: 0.8;
	}

	.contribute-toggle-text {
		flex: 1;
		font-weight: 500;
	}

	.contribute-chevron {
		width: 16px;
		height: 16px;
		transition: transform 0.2s ease;
		opacity: 0.6;
	}

	.contribute-chevron.expanded {
		transform: rotate(180deg);
	}

	.contribute-content {
		padding: 0 12px 12px 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-top: 1px solid #334155;
		background: #0f172a;
	}

	.contribute-description {
		font-size: 12px;
		color: #94a3b8;
		margin: 12px 0 0 0;
		line-height: 1.4;
	}

	.contribute-actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.contribute-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 6px;
		text-decoration: none;
		font-size: 11px;
		font-weight: 500;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
		flex: 1;
		min-width: 120px;
		justify-content: center;
	}

	.contribute-btn.primary {
		background: #1e40af;
		color: #e2e8f0;
		box-shadow: 0 1px 2px rgba(30, 64, 175, 0.3);
	}

	.contribute-btn.primary:hover {
		background: #1d4ed8;
		box-shadow: 0 2px 4px rgba(29, 78, 216, 0.4);
		color: #f1f5f9;
	}

	.contribute-btn.secondary {
		background: #334155;
		color: #cbd5e1;
		border: 1px solid #475569;
	}

	.contribute-btn.secondary:hover {
		background: #475569;
		border-color: #64748b;
		color: #e2e8f0;
	}

	.btn-icon {
		font-size: 14px;
	}

	.contribute-tips {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}

	.tip-item {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		color: #64748b;
		flex: 1;
	}

	.tip-icon {
		font-size: 10px;
		opacity: 0.8;
	}

	.tip-text {
		line-height: 1.3;
	}

	/* Navigation Button Styles */
	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(51, 65, 85, 0.7); /* slate-700 with opacity */
		color: white;
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 110;
		transition: background-color 0.2s ease-in-out;
	}

	.nav-button:hover {
		background-color: rgba(51, 65, 85, 0.9);
	}

	.nav-button svg {
		width: 30px;
		height: 30px;
	}

	.prev-button {
		left: 1rem;
	}

	.next-button {
		right: 1rem;
	}

	/* Adjust button positions on smaller screens */
	@media (max-width: 768px) {
		.nav-button {
			width: 40px;
			height: 40px;
		}

		.nav-button svg {
			width: 24px;
			height: 24px;
		}

		.prev-button {
			left: 0.5rem;
		}

		.next-button {
			right: 0.5rem;
		}
	}
</style> 