<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase, type Submission } from '$lib/supabase';
	import Button from '$lib/components/ui/button/Button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/Badge.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { User } from '@supabase/supabase-js';

	let submissions: Submission[] = [];
	let isLoading = true;
	let error: string | null = null;
	
	// Supabase authentication
	let user: User | null = null;
	let isAuthLoading = true;
	let email = '';
	let password = '';
	let authError = '';
	let isSigningIn = false;

	// Check if user is authenticated
	async function checkAuth() {
		const { data: { user: currentUser } } = await supabase.auth.getUser();
		user = currentUser;
		isAuthLoading = false;
		
		if (user) {
			loadSubmissions();
		}
	}

	// Sign in with email/password
	async function signIn() {
		if (!email || !password) {
			authError = 'Udfyld venligst email og adgangskode';
			return;
		}

		isSigningIn = true;
		authError = '';

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			authError = error.message === 'Invalid login credentials' 
				? 'Forkert email eller adgangskode' 
				: error.message;
		} else {
			user = data.user;
			loadSubmissions();
		}

		isSigningIn = false;
	}

	// Sign out
	async function signOut() {
		await supabase.auth.signOut();
		user = null;
		submissions = [];
	}

	async function loadSubmissions() {
		isLoading = true;
		error = null;
		
		try {
			console.log('Loading submissions for user:', user?.email);
			
			const { data, error: supabaseError } = await supabase
				.from('submissions')
				.select('*')
				.order('created_at', { ascending: false });

			if (supabaseError) {
				console.error('Error loading submissions:', supabaseError);
				error = `Failed to load submissions: ${supabaseError.message}`;
				return;
			}

			console.log('Loaded submissions:', data?.length || 0);
			submissions = data || [];
			
			if (submissions.length === 0) {
				console.log('No submissions found. This could mean:');
				console.log('1. No submissions have been created yet');
				console.log('2. RLS policies are blocking access');
				console.log('3. Database connection issues');
			}
		} catch (err) {
			console.error('Error:', err);
			error = `Failed to connect to database: ${err instanceof Error ? err.message : 'Unknown error'}`;
		} finally {
			isLoading = false;
		}
	}

	async function approveSubmission(submission: Submission) {
		try {
			console.log('Approving submission:', submission);
			
			// Prepare the parking location data with explicit field mapping
			const parkingLocationData = {
				name: submission.parking_data.name,
				address: submission.parking_data.address || null,
				latitude: submission.parking_data.latitude,
				longitude: submission.parking_data.longitude,
				parking_type: submission.parking_data.parking_type || 'short-term',
				verified: true, // Mark as verified when approved by moderator
				source: 'user_contribution', // Track that this came from user submission
				// Common fields
				opening_hours: submission.parking_data.opening_hours || null,
				mapillary_url: submission.parking_data.mapillary_url || null,
				// Conditional fields based on parking type
				...(submission.parking_data.parking_type === 'short-term' ? {
					operator: submission.parking_data.operator || null,
					fee_info: submission.parking_data.fee_info || null,
					capacity: submission.parking_data.capacity || null,
				} : {
					bike_types: submission.parking_data.bike_types || null,
					website: submission.parking_data.website || null,
					// services field should be handled if it exists
				})
			};

			console.log('Inserting parking location data:', parkingLocationData);

			// First, insert the parking data into the main table
			const { error: insertError } = await supabase
				.from('parking_locations')
				.insert([parkingLocationData]);

			if (insertError) {
				console.error('Error inserting parking location:', insertError);
				alert(`Failed to approve submission: ${insertError.message}`);
				return;
			}

			console.log('Parking location inserted successfully, now updating submission status...');

			// Then update the submission status
			console.log('DEBUG: About to update submission status for ID:', submission.id);
			const { data: updateData, error: updateError } = await supabase
				.from('submissions')
				.update({ 
					status: 'approved',
					updated_at: new Date().toISOString()
				})
				.eq('id', submission.id)
				.select(); // Return the updated row to verify the change
			
			console.log('DEBUG: Update response - data:', updateData, 'error:', updateError);

			if (updateError) {
				console.error('Error updating submission:', updateError);
				alert(`Failed to update submission status: ${updateError.message}`);
				return;
			}

			console.log('Submission status updated successfully:', updateData);

			// Update the local submissions array immediately for instant UI feedback
			const submissionIndex = submissions.findIndex(s => s.id === submission.id);
			if (submissionIndex !== -1) {
				console.log('DEBUG: Updating local submission status from', submissions[submissionIndex].status, 'to approved');
				submissions[submissionIndex] = { ...submissions[submissionIndex], status: 'approved' };
				submissions = [...submissions]; // Trigger reactivity
				console.log('DEBUG: Local submission updated:', submissions[submissionIndex]);
			} else {
				console.error('DEBUG: Could not find submission in local array:', submission.id);
			}

			// Verify the update worked by querying the specific submission
			const { data: verifyData, error: verifyError } = await supabase
				.from('submissions')
				.select('id, status, updated_at')
				.eq('id', submission.id)
				.single();
			
			console.log('DEBUG: Direct verification query result:', verifyData, verifyError);

			// Also reload from database to ensure consistency
			console.log('Reloading submissions from database...');
			await loadSubmissions();
			console.log('DEBUG: Submissions after reload:', submissions.map(s => ({ id: s.id, status: s.status })));
			
			alert('Submission approved successfully!');
		} catch (error) {
			console.error('Error approving submission:', error);
			alert(`Failed to approve submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async function rejectSubmission(submission: Submission) {
		try {
			console.log('Rejecting submission:', submission.id);
			
			const { data: updateData, error } = await supabase
				.from('submissions')
				.update({ 
					status: 'rejected',
					updated_at: new Date().toISOString()
				})
				.eq('id', submission.id)
				.select();

			if (error) {
				console.error('Error rejecting submission:', error);
				alert(`Failed to reject submission: ${error.message}`);
				return;
			}

			console.log('Submission rejected successfully:', updateData);

			// Update the local submissions array immediately for instant UI feedback
			const submissionIndex = submissions.findIndex(s => s.id === submission.id);
			if (submissionIndex !== -1) {
				submissions[submissionIndex] = { ...submissions[submissionIndex], status: 'rejected' };
				submissions = [...submissions]; // Trigger reactivity
			}

			// Also reload from database to ensure consistency
			await loadSubmissions();
			alert('Submission rejected successfully!');
		} catch (error) {
			console.error('Error rejecting submission:', error);
			alert(`Failed to reject submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	onMount(() => {
		checkAuth();
	});

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString();
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'warning';
			case 'approved': return 'success';
			case 'rejected': return 'destructive';
			default: return 'outline';
		}
	}
</script>

<svelte:head>
	<title>Admin - Copenhagen Parking Finder</title>
</svelte:head>

<main class="container mx-auto p-6 max-w-4xl">
	{#if isAuthLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-2">Tjekker authentication...</span>
		</div>
	{:else if !user}
		<!-- Login Form -->
		<div class="max-w-md mx-auto mt-12">
			<Card.Root class="p-6">
				<Card.Header>
					<Card.Title class="text-2xl text-center">Admin Login</Card.Title>
					<Card.Description class="text-center">
						Log ind for at administrere parkeringsindlæg
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form on:submit|preventDefault={signIn} class="space-y-4">
						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								type="email"
								bind:value={email}
								placeholder="din@email.dk"
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="password">Adgangskode</Label>
							<Input
								id="password"
								type="password"
								bind:value={password}
								placeholder="••••••••"
								required
							/>
						</div>
						
						{#if authError}
							<div class="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded">
								{authError}
							</div>
						{/if}
						
						<Button 
							type="submit" 
							class="w-full" 
							disabled={isSigningIn}
						>
							{#if isSigningIn}
								Logger ind...
							{:else}
								Log ind
							{/if}
						</Button>
					</form>
				</Card.Content>
			</Card.Root>
			
			<div class="text-center mt-6">
				<a href="/" class="text-blue-600 hover:underline text-sm">← Tilbage til kortet</a>
			</div>
		</div>
	{:else}
		<!-- Admin Panel -->
		<div class="mb-8">
			<div class="flex justify-between items-center">
				<div>
					<h1 class="text-3xl font-bold mb-2">Submission Moderation</h1>
					<p class="text-muted-foreground">Review and approve parking location submissions</p>
				</div>
				<div class="flex items-center gap-4">
					<span class="text-sm text-gray-600">Logget ind som: {user.email}</span>
					<Button variant="outline" on:click={signOut}>Log ud</Button>
				</div>
			</div>
			<a href="/" class="text-blue-600 hover:underline text-sm">← Back to Map</a>
		</div>

		{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			<span class="ml-2">Loading submissions...</span>
		</div>
	{:else if error}
		<div class="text-center py-12">
			<p class="text-red-600 mb-4">{error}</p>
			<div class="space-y-2">
				<Button on:click={loadSubmissions}>Retry</Button>
				<p class="text-sm text-gray-600">Check browser console for detailed error information</p>
			</div>
		</div>
	{:else if submissions.length === 0}
		<div class="text-center py-12">
			<p class="text-muted-foreground mb-4">No submissions found</p>
			<div class="space-y-2">
				<Button on:click={loadSubmissions}>Refresh</Button>
				<p class="text-sm text-gray-600">
					Try submitting a test parking location from the main page to see it appear here.
				</p>
			</div>
		</div>
	{:else}
		<div class="space-y-4">
			{#each submissions as submission (submission.id)}
				<Card.Root class="p-6">
					<div class="flex justify-between items-start mb-4">
						<div>
							<h3 class="text-xl font-semibold">{submission.parking_data.name}</h3>
							<p class="text-sm text-muted-foreground">
								Submitted {formatDate(submission.created_at)}
							</p>
							<!-- DEBUG: Show submission ID and status -->
							<p class="text-xs text-gray-400">
								ID: {submission.id} | Status: {submission.status}
							</p>
						</div>
						<Badge variant={getStatusColor(submission.status)}>
							{submission.status.toUpperCase()}
						</Badge>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<div>
							<h4 class="font-medium mb-2">Location Details</h4>
							<div class="space-y-1 text-sm">
								{#if submission.parking_data.address}
									<p><strong>Address:</strong> {submission.parking_data.address}</p>
								{/if}
								<p><strong>Coordinates:</strong> {submission.parking_data.latitude}, {submission.parking_data.longitude}</p>
								{#if submission.parking_data.operator}
									<p><strong>Operator:</strong> {submission.parking_data.operator}</p>
								{/if}
							</div>
						</div>

						<div>
							<h4 class="font-medium mb-2">Parking Info</h4>
							<div class="space-y-1 text-sm">
								{#if submission.parking_data.fee_info}
									<p><strong>Fees:</strong> {submission.parking_data.fee_info}</p>
								{/if}
								{#if submission.parking_data.opening_hours}
									<p><strong>Hours:</strong> {submission.parking_data.opening_hours}</p>
								{/if}
								{#if submission.parking_data.capacity}
									<p><strong>Capacity:</strong> {submission.parking_data.capacity} spaces</p>
								{/if}
							</div>
						</div>
					</div>

					{#if submission.parking_data.notes}
						<div class="mb-4">
							<h4 class="font-medium mb-2">Additional Notes</h4>
							<p class="text-sm bg-gray-50 p-3 rounded">{submission.parking_data.notes}</p>
						</div>
					{/if}

					{#if submission.parking_data.mapillary_url}
						<div class="mb-4">
							<h4 class="font-medium mb-2">Mapillary Link</h4>
							<a 
								href={submission.parking_data.mapillary_url} 
								target="_blank" 
								rel="noopener noreferrer"
								class="text-blue-600 hover:underline text-sm"
							>
								{submission.parking_data.mapillary_url}
							</a>
						</div>
					{/if}

					{#if submission.status === 'pending'}
						<div class="flex gap-2 pt-4 border-t">
							<Button 
								on:click={() => approveSubmission(submission)}
								class="bg-green-600 hover:bg-green-700"
							>
								✓ Approve
							</Button>
							<Button 
								variant="destructive"
								on:click={() => rejectSubmission(submission)}
							>
								✗ Reject
							</Button>
						</div>
					{/if}
				</Card.Root>
			{/each}
		</div>
		{/if}
	{/if}
</main>

<style>
	:global(body) {
		background: #fafafa;
	}
</style> 