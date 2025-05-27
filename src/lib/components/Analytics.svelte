<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	
	// Environment variables for Umami configuration
	const UMAMI_URL = import.meta.env.VITE_UMAMI_URL;
	const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID;
	const UMAMI_DOMAINS = import.meta.env.VITE_UMAMI_DOMAINS;
	
	onMount(() => {
		// Only load analytics in the browser and if configuration is provided
		if (browser && UMAMI_URL && UMAMI_WEBSITE_ID) {
			// Check if script is already loaded
			if (document.querySelector('script[data-website-id]')) {
				return;
			}
			
			// Create and configure the Umami script
			const script = document.createElement('script');
			script.defer = true;
			script.src = `${UMAMI_URL}/script.js`;
			script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
			
			// Add domains filter if specified
			if (UMAMI_DOMAINS) {
				script.setAttribute('data-domains', UMAMI_DOMAINS);
			}
			
			// Add script to head
			document.head.appendChild(script);
			
			// DEBUG: Remove this comment after testing
			console.log('Umami Analytics loaded:', { UMAMI_URL, UMAMI_WEBSITE_ID, UMAMI_DOMAINS });
		}
	});
</script>

<!-- This component doesn't render any visible content --> 