<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let placeholder = 'Search locations...';
	export let value = '';
	export let disabled = false;
	
	const dispatch = createEventDispatcher<{
		search: string;
		clear: void;
	}>();
	
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatch('search', value);
	}
	
	function handleClear() {
		value = '';
		dispatch('clear');
		dispatch('search', '');
	}
</script>

<div class="relative w-full">
	<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
		<svg class="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	</div>
	
	<input
		type="text"
		{placeholder}
		{value}
		{disabled}
		on:input={handleInput}
		class="w-full pl-10 pr-10 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
	/>
	
	{#if value}
		<button
			type="button"
			on:click={handleClear}
			class="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	{/if}
</div> 