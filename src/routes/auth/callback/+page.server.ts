import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
    const next = url.searchParams.get('next') ?? '/admin';
    
    // Always redirect to the intended destination
    // Supabase will handle the authentication on the client side
    throw redirect(303, next);
}; 