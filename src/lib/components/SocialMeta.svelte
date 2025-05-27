<script>
	import { generateSocialMeta, getStructuredData } from '../social.js';

	/** @type {import('../social.js').SocialMeta | undefined} */
	export let meta = undefined;
	
	/** @type {string | null | undefined} */
	export let baseUrl = undefined;

	$: socialMeta = generateSocialMeta(meta, baseUrl);
	$: structuredData = getStructuredData(meta, baseUrl);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{socialMeta.title}</title>
	<meta name="title" content={socialMeta.title} />
	<meta name="description" content={socialMeta.description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={socialMeta.type} />
	<meta property="og:url" content={socialMeta.url} />
	<meta property="og:title" content={socialMeta.title} />
	<meta property="og:description" content={socialMeta.description} />
	<meta property="og:image" content={socialMeta.image} />
	<meta property="og:image:url" content={socialMeta.image} />
	<meta property="og:image:secure_url" content={socialMeta.image} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={socialMeta.imageAlt} />
	<meta property="og:site_name" content={socialMeta.siteName} />
	<!-- LinkedIn specific -->
	<meta name="image" property="og:image" content={socialMeta.image} />

	<!-- Twitter -->
	<meta property="twitter:card" content={socialMeta.twitterCard} />
	<meta property="twitter:url" content={socialMeta.url} />
	<meta property="twitter:title" content={socialMeta.title} />
	<meta property="twitter:description" content={socialMeta.description} />
	<meta property="twitter:image" content={socialMeta.image} />
	<meta property="twitter:image:alt" content={socialMeta.imageAlt} />
	{#if socialMeta.twitterSite}
		<meta property="twitter:site" content={socialMeta.twitterSite} />
	{/if}

	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head> 