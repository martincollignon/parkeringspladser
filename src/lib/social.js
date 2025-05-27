// Social media metadata utilities

/** @typedef {Object} SocialMeta
 * @property {string} title
 * @property {string} description
 * @property {string} image
 * @property {string} imageAlt
 * @property {string} url
 * @property {string} type
 * @property {string} siteName
 * @property {string} twitterCard
 * @property {string|undefined} twitterSite
 */

export const defaultSocialMeta = {
	title: 'Find Parkeringsplads - Løs dine parkeringsproblemer i København',
	description: 'Hjælper københavnere med at finde kortsigtede betalte parkeringsløsninger og langsigtede løsninger på deres bilparkeringsproblemer.',
	image: '/social/og-image.png',
	imageAlt: 'Find Parkeringsplads - Parkeringsløsninger for københavnere',
	url: 'https://findparkeringsplads.dk',
	type: 'website',
	siteName: 'Find Parkeringsplads',
	twitterCard: 'summary_large_image',
	twitterSite: undefined,
};

/**
 * Generate social media meta tags for a specific page
 * @param {Partial<SocialMeta>} meta - Page-specific metadata
 * @param {string|null} [baseUrl] - Base URL to use (optional, for server-side rendering)
 * @returns {SocialMeta} Complete meta object for the page
 */
export function generateSocialMeta(meta = {}, baseUrl = null) {
	// Use provided baseUrl, or fallback to default
	const currentOrigin = baseUrl || defaultSocialMeta.url;
	
	return {
		...defaultSocialMeta,
		...meta,
		// Use current domain for URL
		url: meta.url ? new URL(meta.url, currentOrigin).toString() : currentOrigin,
		// Always make image URLs absolute
		image: meta.image ? 
			(meta.image.startsWith('http') ? meta.image : new URL(meta.image, currentOrigin).toString()) :
			new URL(defaultSocialMeta.image, currentOrigin).toString(),
	};
}

/**
 * Get structured data for JSON-LD
 * @param {Partial<SocialMeta>} meta - Page metadata
 * @param {string|null} [baseUrl] - Base URL to use (optional, for server-side rendering)
 * @returns {Object} JSON-LD structured data
 */
export function getStructuredData(meta = {}, baseUrl = null) {
	const socialMeta = generateSocialMeta(meta, baseUrl);
	
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: socialMeta.siteName,
		description: socialMeta.description,
		url: socialMeta.url,
		image: socialMeta.image,
		// No social media profiles currently
	};
} 