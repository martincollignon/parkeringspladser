<script>
	import '../app.css';
	import SocialMeta from '$lib/components/SocialMeta.svelte';
	
	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<!-- Default social media meta tags -->
<SocialMeta baseUrl={data.currentUrl} />

<slot /> 