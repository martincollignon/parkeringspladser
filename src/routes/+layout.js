/** @type {import('./$types').LayoutLoad} */
export async function load({ url }) {
	return {
		currentUrl: url.origin
	};
} 