<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabase';
	import Button from '$lib/components/ui/button/Button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';

	export let isOpen = false;
	export let prefilledLocation: { lat: number; lng: number } | null = null;
	export let initialParkingType: 'short-term' | 'long-term' = 'short-term';

	const dispatch = createEventDispatcher();

	// Form state
	let parkingType: 'short-term' | 'long-term' = initialParkingType;

	// Form data
	let formData = {
		name: '',
		address: '',
		operator: '',
		fee_info: '',
		opening_hours: '',
		capacity: '',
		mapillary_url: '',
		website: '',
		notes: '',
		latitude: prefilledLocation?.lat || 0,
		longitude: prefilledLocation?.lng || 0,
		// Bike shop specific fields
		bike_types: '',
		services: ''
	};

	// Form state
	let isSubmitting = false;
	let submitError = '';
	let submitSuccess = false;

	// Simple captcha (basic math question)
	let captchaQuestion = '';
	let captchaAnswer = 0;
	let userCaptchaAnswer = '';

	function generateCaptcha() {
		const num1 = Math.floor(Math.random() * 10) + 1;
		const num2 = Math.floor(Math.random() * 10) + 1;
		captchaQuestion = `${num1} + ${num2} = ?`;
		captchaAnswer = num1 + num2;
	}

	function resetForm() {
		formData = {
			name: '',
			address: '',
			operator: '',
			fee_info: '',
			opening_hours: '',
			capacity: '',
			mapillary_url: '',
			notes: '',
			latitude: prefilledLocation?.lat || 0,
			longitude: prefilledLocation?.lng || 0,
			bike_types: '',
			services: '',
			website: ''
		};
		userCaptchaAnswer = '';
		submitError = '';
		submitSuccess = false;
		generateCaptcha();
	}

	async function handleSubmit() {
		// Validate captcha
		if (parseInt(userCaptchaAnswer) !== captchaAnswer) {
			submitError = 'Løs venligst regnestykket korrekt';
			return;
		}

		// Validate required fields
		if (!formData.name.trim() || !formData.latitude || !formData.longitude) {
			submitError = 'Udfyld venligst navn og placering';
			return;
		}

		isSubmitting = true;
		submitError = '';

		try {
			// Create submission data
			const submissionData = {
				parking_data: {
					name: formData.name.trim(),
					address: formData.address.trim() || null,
					latitude: formData.latitude,
					longitude: formData.longitude,
					parking_type: parkingType,
					// Common fields
					opening_hours: formData.opening_hours.trim() || null,
					mapillary_url: formData.mapillary_url.trim() || null,
					website: formData.website.trim() || null,
					notes: formData.notes.trim() || null,
					verified: false,
					// Conditional fields
					...(parkingType === 'short-term' ? {
						operator: formData.operator.trim() || null,
						fee_info: formData.fee_info.trim() || null,
						capacity: formData.capacity ? parseInt(formData.capacity) : null,
					} : {
						bike_types: formData.bike_types.trim() || null,
						services: formData.services.trim() || null,
					})
				},
				user_id: null, // Anonymous submission
				status: 'pending'
			};

			const { error } = await supabase
				.from('submissions')
				.insert([submissionData]);

			if (error) {
				console.error('Submission error:', error);
				submitError = 'Kunne ikke indsende data. Prøv venligst igen.';
				return;
			}

			submitSuccess = true;
			dispatch('submitted');

			// Reset form after successful submission
			setTimeout(() => {
				resetForm();
				isOpen = false;
			}, 2000);

		} catch (error) {
			console.error('Submission error:', error);
			submitError = 'Der opstod en uventet fejl. Prøv venligst igen.';
		} finally {
			isSubmitting = false;
		}
	}

	// Initialize captcha when component mounts
	$: if (isOpen && !captchaQuestion) {
		generateCaptcha();
	}

	// Update coordinates when prefilledLocation changes
	$: if (prefilledLocation) {
		formData.latitude = prefilledLocation.lat;
		formData.longitude = prefilledLocation.lng;
	}
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Content class="max-w-md max-h-[90vh] overflow-y-auto bg-gray-50 text-gray-900 border border-gray-300 shadow-2xl z-[9999]">
		<Dialog.Header>
			<Dialog.Title class="text-gray-900">
				Tilføj {parkingType === 'long-term' ? 'Cykelbutik' : 'Parkeringsplads'}
			</Dialog.Title>
			<Dialog.Description class="text-gray-700">
				Hjælp fællesskabet ved at tilføje en ny {parkingType === 'long-term' ? 'cykelbutik til langsigtede parkeringsløsninger' : 'korttidsparkering'}. Alle indlæg gennemgås før offentliggørelse.
			</Dialog.Description>
		</Dialog.Header>

		<form on:submit|preventDefault={handleSubmit} class="space-y-4 submission-form">
			<!-- Parking Type Selector -->
			<div class="space-y-2">
				<Label for="parking-type">Type Lokation *</Label>
				<div class="flex gap-2">
					<button
						type="button"
						on:click={() => parkingType = 'short-term'}
						class="flex-1 p-2 text-sm border rounded-md transition-colors {parkingType === 'short-term' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-300 text-gray-700'}"
					>
						🚗 Korttidsparkering
					</button>
					<button
						type="button"
						on:click={() => parkingType = 'long-term'}
						class="flex-1 p-2 text-sm border rounded-md transition-colors {parkingType === 'long-term' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-300 text-gray-700'}"
					>
						🚲 Langtidsparkering
					</button>
				</div>
			</div>

			<!-- Required fields -->
			<div class="space-y-2">
				<Label for="name">
					{parkingType === 'long-term' ? 'Cykelbutiksnavn' : 'Parkeringsnavn'} *
				</Label>
				<Input
					id="name"
					bind:value={formData.name}
					placeholder={parkingType === 'long-term' ? 'f.eks. København Cykler' : 'f.eks. Q-Park Nørreport'}
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="address">Adresse</Label>
				<Input
					id="address"
					bind:value={formData.address}
					placeholder="f.eks. Frederiksborggade 22, 1360 København K"
				/>
			</div>

			<!-- Location coordinates (read-only if prefilled) -->
			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-2">
					<Label for="latitude">Breddegrad *</Label>
					<Input
						id="latitude"
						type="number"
						step="any"
						bind:value={formData.latitude}
						readonly={!!prefilledLocation}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="longitude">Længdegrad *</Label>
					<Input
						id="longitude"
						type="number"
						step="any"
						bind:value={formData.longitude}
						readonly={!!prefilledLocation}
						required
					/>
				</div>
			</div>

			<!-- Conditional fields based on parking type -->
			{#if parkingType === 'short-term'}
				<!-- Car parking fields -->
				<div class="space-y-2">
					<Label for="operator">Operatør</Label>
					<Input
						id="operator"
						bind:value={formData.operator}
						placeholder="f.eks. Q-Park, Apcoa, osv."
					/>
				</div>

				<div class="space-y-2">
					<Label for="fee_info">Prisinformation</Label>
					<Input
						id="fee_info"
						bind:value={formData.fee_info}
						placeholder="f.eks. 25 DKK/time, 150 DKK/dag"
					/>
				</div>

				<div class="space-y-2">
					<Label for="capacity">Kapacitet (antal pladser)</Label>
					<Input
						id="capacity"
						type="number"
						bind:value={formData.capacity}
						placeholder="f.eks. 150"
					/>
				</div>
			{:else}
				<!-- Bike shop fields -->
				<div class="space-y-2">
					<Label for="bike_types">Tilgængelige Cykeltyper</Label>
					<Input
						id="bike_types"
						bind:value={formData.bike_types}
						placeholder="f.eks. Bycykler, Ladcykler, El-cykler"
					/>
				</div>

				<div class="space-y-2">
					<Label for="services">Tilbudte Tjenester</Label>
					<Input
						id="services"
						bind:value={formData.services}
						placeholder="f.eks. Salg, Reparationer, Udlejning, Opbevaring"
					/>
				</div>

				<div class="space-y-2">
					<Label for="website">Hjemmeside</Label>
					<Input
						id="website"
						bind:value={formData.website}
						placeholder="f.eks. https://copenhagenbicycles.dk"
					/>
				</div>
			{/if}

			<!-- Common fields -->
			<div class="space-y-2">
				<Label for="opening_hours">Åbningstider</Label>
				<Input
					id="opening_hours"
					bind:value={formData.opening_hours}
					placeholder="f.eks. 24/7, 06:00-24:00"
				/>
			</div>

			<div class="space-y-2">
				<Label for="mapillary_url">Mapillary URL (valgfrit)</Label>
				<Input
					id="mapillary_url"
					bind:value={formData.mapillary_url}
					placeholder="https://www.mapillary.com/..."
				/>
			</div>

			{#if parkingType === 'short-term'}
    			<div class="space-y-2">
                    <Label for="website">Hjemmeside (valgfrit)</Label>
					<Input
						id="website"
						bind:value={formData.website}
						placeholder="f.eks. https://eksempel.dk"
					/>
    			</div>
			{/if}

			<div class="space-y-2">
				<Label for="notes">Yderligere Noter</Label>
				<Textarea
					id="notes"
					bind:value={formData.notes}
					placeholder="Eventuelle yderligere oplysninger om denne lokation..."
					rows={3}
				/>
			</div>

			<!-- Simple Captcha -->
			<div class="space-y-2">
				<Label for="captcha">Sikkerhedstjek: {captchaQuestion}</Label>
				<Input
					id="captcha"
					type="number"
					bind:value={userCaptchaAnswer}
					placeholder="Indtast svaret"
					required
				/>
			</div>

			<!-- Error/Success messages -->
			{#if submitError}
				<div class="text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
					{submitError}
				</div>
			{/if}

			{#if submitSuccess}
				<div class="text-green-700 text-sm bg-green-50 border border-green-200 p-3 rounded-md">
					✅ Tak! Dit indlæg er modtaget og vil blive gennemgået snart.
				</div>
			{/if}

			<!-- Form actions -->
			<div class="flex gap-3 pt-4 border-t border-gray-200">
				<Button
					type="button"
					variant="outline"
					on:click={() => (isOpen = false)}
					disabled={isSubmitting}
					class="border-gray-300 text-gray-700 hover:bg-gray-100"
				>
					Annuller
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting || submitSuccess}
					class="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
				>
					{#if isSubmitting}
						Indsender...
					{:else if submitSuccess}
						Indsendt ✓
					{:else}
						Indsend til Gennemgang
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Ensure dialog appears above everything */
	:global([data-dialog-overlay]) {
		z-index: 9998 !important;
		background-color: rgba(0, 0, 0, 0.4) !important; /* Less opaque so logo shows through */
	}

	:global([data-dialog-content]) {
		z-index: 9999 !important;
	}

	:global(.dialog-overlay) {
		z-index: 9998 !important;
		background-color: rgba(0, 0, 0, 0.4) !important;
	}

	:global(.dialog-content) {
		z-index: 9999 !important;
	}

	/* Ensure form inputs have proper styling */
	:global(.submission-form input) {
		background: white !important;
		color: #1f2937 !important;
		border: 1px solid #d1d5db !important;
		border-radius: 6px !important;
	}

	:global(.submission-form input:focus) {
		border-color: #3b82f6 !important;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
		outline: none !important;
	}

	:global(.submission-form textarea) {
		background: white !important;
		color: #1f2937 !important;
		border: 1px solid #d1d5db !important;
		border-radius: 6px !important;
	}

	:global(.submission-form textarea:focus) {
		border-color: #3b82f6 !important;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
		outline: none !important;
	}

	:global(.submission-form label) {
		color: #374151 !important;
		font-weight: 600 !important;
		font-size: 0.875rem !important;
	}
</style>
