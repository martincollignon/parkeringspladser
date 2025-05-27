import { browser } from '$app/environment';

/**
 * Privacy-friendly analytics utilities using Umami
 * No cookies, no personal data collection, GDPR compliant
 */

/**
 * Track a custom event
 * @param eventName - Name of the event to track
 * @param eventData - Optional data to send with the event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
	if (!browser) return;
	
	// Check if Umami is loaded
	if (typeof window !== 'undefined' && (window as any).umami) {
		try {
			(window as any).umami.track(eventName, eventData);
			// DEBUG: Remove this console.log after testing
			console.log('Analytics event tracked:', eventName, eventData);
		} catch (error) {
			console.warn('Analytics tracking failed:', error);
		}
	}
}

/**
 * Track page view (usually handled automatically by Umami)
 * @param url - Optional URL to track (defaults to current page)
 */
export function trackPageView(url?: string) {
	if (!browser) return;
	
	if (typeof window !== 'undefined' && (window as any).umami) {
		try {
			(window as any).umami.track(url || window.location.pathname);
		} catch (error) {
			console.warn('Analytics page view tracking failed:', error);
		}
	}
}

/**
 * Common event tracking functions for the parking app
 */
export const analytics = {
	// Map interactions
	mapLoaded: () => trackEvent('map_loaded'),
	mapMoved: (zoom: number, center: [number, number]) => 
		trackEvent('map_moved', { zoom, lat: center[1], lng: center[0] }),
	
	// Parking interactions
	parkingSpotClicked: (spotId: string) => 
		trackEvent('parking_spot_clicked', { spot_id: spotId }),
	parkingSpotDirections: (spotId: string) => 
		trackEvent('parking_directions_clicked', { spot_id: spotId }),
	
	// Search and filters
	searchPerformed: (query: string) => 
		trackEvent('search_performed', { query_length: query.length }),
	filterApplied: (filterType: string, filterValue: string) => 
		trackEvent('filter_applied', { type: filterType, value: filterValue }),
	
	// User submissions
	submissionStarted: () => trackEvent('submission_started'),
	submissionCompleted: (spotType: string) => 
		trackEvent('submission_completed', { spot_type: spotType }),
	submissionCancelled: () => trackEvent('submission_cancelled'),
	
	// Navigation
	externalNavigation: (provider: string) => 
		trackEvent('external_navigation', { provider }),
	
	// Errors (for debugging)
	error: (errorType: string, errorMessage?: string) => 
		trackEvent('error_occurred', { type: errorType, message: errorMessage }),
}; 