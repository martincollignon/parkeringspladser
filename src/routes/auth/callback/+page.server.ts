import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const code = url.searchParams.get('code');
    const next = url.searchParams.get('next') ?? '/admin';

    if (code) {
        // Handle the auth code exchange here if needed
        // For now, just redirect to the intended destination
        throw redirect(303, next);
    }

    // If no code, redirect to home
    throw redirect(303, '/');
}; 