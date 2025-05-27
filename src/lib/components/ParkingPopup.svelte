<script lang="ts">
	import MapillaryViewer from './MapillaryViewer.svelte';
	import { onMount } from 'svelte';
	
	export let location: any;
	export let isClosest: boolean = false;

	let isMobileDevice = false;

	onMount(() => {
		// Detect mobile device
		isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	});

	function formatHours(hours: string | null | undefined): string {
		if (!hours) return 'Ukendt';
		if (hours === '24/7') return '24/7';
		return hours;
	}

	function formatCapacity(capacity: number | null | undefined): number | null {
		return capacity || null;
	}

	function openDirections() {
		const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
		window.open(url, '_blank');
	}

	function openMapillaryUrl() {
		if (location.mapillary_url) {
			window.open(location.mapillary_url, '_blank');
		}
	}
</script>

{#if isMobileDevice}
	<!-- Mobile Tray Layout -->
	<div class="mobile-tray">
		<!-- Drag handle -->
		<div class="drag-handle">
			<div class="handle-bar"></div>
		</div>
		
		<!-- Scrollable content -->
		<div class="tray-content">
			<!-- Header section -->
			<div class="tray-header">
				<div class="station-info">
					<h3 class="station-name">{location.name || 'Parkeringsplads'}</h3>
					<div class="station-meta">
						<span class="district-label">Område</span>
						{#if isClosest}
							<span class="closest-indicator">Nærmeste</span>
						{/if}
					</div>
				</div>
				<div class="status-badge live">
					<span class="status-dot"></span>
					<span class="status-text">LIVE</span>
				</div>
			</div>

			<!-- Coordinates display -->
			<div class="coordinates">
				<span class="coord-label">Koordinater:</span>
				<span class="coord-values">
					{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
				</span>
			</div>
			
			<!-- Information grid -->
			<div class="info-grid">
				{#if location.address}
					<div class="info-row">
						<span class="info-icon">📍</span>
						<div class="info-content">
							<span class="info-label">Adresse</span>
							<span class="info-value">{location.address}</span>
						</div>
					</div>
				{/if}
				
				{#if location.operator}
					<div class="info-row">
						<span class="info-icon">🏢</span>
						<div class="info-content">
							<span class="info-label">Operatør</span>
							<span class="info-value">{location.operator}</span>
						</div>
					</div>
				{/if}
				
				{#if location.fee_info}
					<div class="info-row">
						<span class="info-icon">💰</span>
						<div class="info-content">
							<span class="info-label">Pris</span>
							<span class="info-value">{location.fee_info}</span>
						</div>
					</div>
				{/if}
				
				<div class="info-row">
					<span class="info-icon">🕒</span>
					<div class="info-content">
						<span class="info-label">Åbningstider</span>
						<span class="info-value">{formatHours(location.opening_hours)}</span>
					</div>
				</div>
				
				{#if formatCapacity(location.capacity)}
					<div class="info-row">
						<span class="info-icon">🚗</span>
						<div class="info-content">
							<span class="info-label">Kapacitet</span>
							<span class="info-value">{formatCapacity(location.capacity)} pladser</span>
						</div>
					</div>
				{/if}
			</div>
			
			<!-- Action buttons -->
			<div class="action-buttons">
				<button class="action-btn primary" on:click={openDirections}>
					<span class="btn-icon">🧭</span>
					<span class="btn-text">Få Vejledning</span>
				</button>
				{#if location.mapillary_url}
					<button class="action-btn secondary" on:click={openMapillaryUrl}>
						<span class="btn-icon">📷</span>
						<span class="btn-text">Gadefoto</span>
					</button>
				{/if}
			</div>

			<!-- Mapillary Street View Images -->
			<MapillaryViewer 
				latitude={location.latitude} 
				longitude={location.longitude} 
				radius={150}
				maxImages={6}
			/>
		</div>
	</div>
{:else}
	<!-- Desktop Popup Layout (existing) -->
	<div class="station-popup">
		<!-- Header section inspired by London Underground Live -->
		<div class="popup-header">
			<div class="station-info">
				<h3 class="station-name">{location.name || 'Parkeringsplads'}</h3>
				<div class="station-meta">
					<span class="district-label">Område</span>
					{#if isClosest}
						<span class="closest-indicator">Nærmeste</span>
					{/if}
				</div>
			</div>
			<div class="status-badge live">
				<span class="status-dot"></span>
				<span class="status-text">LIVE</span>
			</div>
		</div>

		<!-- Coordinates display -->
		<div class="coordinates">
			<span class="coord-label">Koordinater:</span>
			<span class="coord-values">
				Latitude: {location.latitude.toFixed(6)}<br>
				Longitude: {location.longitude.toFixed(6)}
			</span>
		</div>
		
		<!-- Information grid -->
		<div class="info-grid">
			{#if location.address}
				<div class="info-row">
					<span class="info-icon">📍</span>
					<div class="info-content">
						<span class="info-label">Adresse</span>
						<span class="info-value">{location.address}</span>
					</div>
				</div>
			{/if}
			
			{#if location.operator}
				<div class="info-row">
					<span class="info-icon">🏢</span>
					<div class="info-content">
						<span class="info-label">Operatør</span>
						<span class="info-value">{location.operator}</span>
					</div>
				</div>
			{/if}
			
			{#if location.fee_info}
				<div class="info-row">
					<span class="info-icon">💰</span>
					<div class="info-content">
						<span class="info-label">Pris</span>
						<span class="info-value">{location.fee_info}</span>
					</div>
				</div>
			{/if}
			
			<div class="info-row">
				<span class="info-icon">🕒</span>
				<div class="info-content">
					<span class="info-label">Åbningstider</span>
					<span class="info-value">{formatHours(location.opening_hours)}</span>
				</div>
			</div>
			
			{#if formatCapacity(location.capacity)}
				<div class="info-row">
					<span class="info-icon">🚗</span>
					<div class="info-content">
						<span class="info-label">Kapacitet</span>
						<span class="info-value">{formatCapacity(location.capacity)} pladser</span>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Action buttons -->
		<div class="action-buttons">
			<button class="action-btn primary" on:click={openDirections}>
				<span class="btn-icon">🧭</span>
				<span class="btn-text">Få Vejledning</span>
			</button>
			{#if location.mapillary_url}
				<button class="action-btn secondary" on:click={openMapillaryUrl}>
					<span class="btn-icon">📷</span>
					<span class="btn-text">Gadefoto</span>
				</button>
			{/if}
		</div>

		<!-- Mapillary Street View Images -->
		<MapillaryViewer 
			latitude={location.latitude} 
			longitude={location.longitude} 
			radius={150}
			maxImages={6}
		/>
	</div>
{/if}

<style>
	/* Mobile Tray Styles */
	.mobile-tray {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 10000;
		background: rgba(15, 20, 30, 0.98);
		backdrop-filter: blur(24px);
		border-top-left-radius: 24px;
		border-top-right-radius: 24px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-bottom: none;
		max-height: 85vh;
		min-height: 40vh;
		display: flex;
		flex-direction: column;
		color: #ffffff;
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		box-shadow: 
			0 -24px 80px rgba(0, 0, 0, 0.8),
			0 -8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.drag-handle {
		padding: 12px 0 8px;
		display: flex;
		justify-content: center;
		cursor: grab;
		flex-shrink: 0;
	}

	.handle-bar {
		width: 40px;
		height: 4px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		transition: background 0.2s ease;
	}

	.drag-handle:hover .handle-bar {
		background: rgba(255, 255, 255, 0.5);
	}

	.tray-content {
		flex: 1;
		overflow-y: auto;
		padding: 0 20px 20px;
		-webkit-overflow-scrolling: touch;
	}

	.tray-header {
		padding: 16px 0 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
		margin: 0 -20px 16px;
		padding-left: 20px;
		padding-right: 20px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	/* Desktop Popup Styles */
	.station-popup {
		font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
		min-width: 320px;
		max-width: 400px;
		background: rgba(15, 20, 30, 0.98);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 
			0 24px 80px rgba(0, 0, 0, 0.8),
			0 8px 32px rgba(0, 0, 0, 0.6),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
		color: #ffffff;
	}

	.popup-header {
		padding: 20px 24px 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.station-info {
		flex: 1;
		min-width: 0;
	}

	.station-name {
		margin: 0 0 8px 0;
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: #ffffff;
		background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.station-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}

	.district-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: rgba(148, 163, 184, 0.8);
		background: rgba(51, 65, 85, 0.4);
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid rgba(71, 85, 105, 0.3);
	}

	.closest-indicator {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: #3b82f6;
		background: rgba(59, 130, 246, 0.15);
		padding: 2px 8px;
		border-radius: 6px;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.status-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
		border-radius: 8px;
		flex-shrink: 0;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		background: #10b981;
		border-radius: 50%;
		/* Removed animation to prevent jitter */
	}

	.status-text {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.8px;
		color: #10b981;
	}

	/* Removed pulse animation to prevent jitter */

	.coordinates {
		padding: 16px 24px;
		background: rgba(30, 41, 59, 0.3);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
	}

	.coord-label {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		color: rgba(148, 163, 184, 0.8);
		display: block;
		margin-bottom: 4px;
	}

	.coord-values {
		font-size: 12px;
		color: rgba(203, 213, 225, 0.9);
		line-height: 1.4;
	}

	.info-grid {
		padding: 20px 24px;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 16px;
		padding: 8px 0;
	}

	.info-row:last-child {
		margin-bottom: 0;
	}

	.info-icon {
		font-size: 16px;
		width: 20px;
		text-align: center;
		opacity: 0.8;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.info-content {
		flex: 1;
		min-width: 0;
	}

	.info-label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.6px;
		color: rgba(148, 163, 184, 0.8);
		margin-bottom: 2px;
	}

	.info-value {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: rgba(241, 245, 249, 0.95);
		line-height: 1.4;
	}

	.action-buttons {
		padding: 20px 24px 24px;
		display: flex;
		gap: 12px;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(15, 23, 42, 0.4);
	}

	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px 16px;
		border: none;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		text-decoration: none;
		position: relative;
		overflow: hidden;
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: #ffffff;
		border: 1px solid rgba(59, 130, 246, 0.3);
		box-shadow: 
			0 4px 12px rgba(59, 130, 246, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.1) inset;
	}

	.action-btn.primary:hover {
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		transform: translateY(-1px);
		box-shadow: 
			0 6px 16px rgba(59, 130, 246, 0.5),
			0 1px 0 rgba(255, 255, 255, 0.15) inset;
	}

	.action-btn.secondary {
		background: rgba(51, 65, 85, 0.6);
		color: rgba(203, 213, 225, 0.9);
		border: 1px solid rgba(71, 85, 105, 0.4);
		box-shadow: 
			0 2px 8px rgba(0, 0, 0, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.05) inset;
	}

	.action-btn.secondary:hover {
		background: rgba(71, 85, 105, 0.7);
		color: rgba(241, 245, 249, 0.95);
		transform: translateY(-1px);
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.08) inset;
	}

	.btn-icon {
		font-size: 14px;
		opacity: 0.9;
	}

	.btn-text {
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.station-popup {
			min-width: calc(100vw - 40px);
			max-width: calc(100vw - 40px);
			margin: 0 20px;
		}

		.popup-header {
			padding: 12px 16px 8px;
		}

		.station-name {
			font-size: 16px;
			line-height: 1.3;
		}

		.station-meta {
			gap: 8px;
		}

		.district-label {
			font-size: 9px;
		}

		.status-badge {
			padding: 4px 8px;
		}

		.status-text {
			font-size: 9px;
		}

		.coordinates {
			padding: 8px 16px;
		}

		.coord-label {
			font-size: 10px;
		}

		.coord-values {
			font-size: 11px;
		}

		.info-grid {
			padding: 12px 16px;
		}

		.info-row {
			margin-bottom: 8px;
			gap: 8px;
		}

		.info-icon {
			font-size: 14px;
			width: 18px;
		}

		.info-label {
			font-size: 10px;
		}

		.info-value {
			font-size: 13px;
		}

		.action-buttons {
			padding: 10px 16px 14px;
			flex-direction: column;
			gap: 8px;
		}

		.action-btn {
			padding: 10px 14px;
			min-height: 40px; /* Better touch target */
			font-size: 12px;
		}

		.btn-icon {
			font-size: 13px;
		}
	}

	/* Extra small screens */
	@media (max-width: 360px) {
		.station-popup {
			min-width: calc(100vw - 24px);
			max-width: calc(100vw - 24px);
			margin: 0 12px;
		}

		.popup-header {
			padding: 10px 14px 6px;
		}

		.station-name {
			font-size: 15px;
		}

		.coordinates {
			padding: 6px 14px;
		}

		.info-grid {
			padding: 10px 14px;
		}

		.action-buttons {
			padding: 8px 14px 12px;
		}

		.action-btn {
			padding: 8px 12px;
			min-height: 38px;
			font-size: 11px;
		}
	}
</style> 