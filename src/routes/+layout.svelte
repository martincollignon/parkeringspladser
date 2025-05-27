<script>
	import '../app.css';
	import SocialMeta from '$lib/components/SocialMeta.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<!-- Default social media meta tags -->
<SocialMeta baseUrl={data.currentUrl} />

<!-- Privacy-friendly analytics (no cookies, GDPR compliant) -->
<Analytics />

<slot /> 