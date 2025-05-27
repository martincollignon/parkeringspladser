<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cn } from "$lib/utils.js";
	import { Search, X } from "lucide-svelte";
	
	export let placeholder = 'Søg parkeringspladser...';
	export let value = '';
	export let disabled = false;
	let className: string = "";
	export { className as class };
	
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

<div class={cn("relative w-full", className)}>
	<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
		<Search class="h-4 w-4 text-muted-foreground" />
	</div>
	
	<input
		type="text"
		{placeholder}
		{value}
		{disabled}
		on:input={handleInput}
		class="flex h-10 w-full rounded-md border border-input bg-background/20 backdrop-blur-xl pl-10 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	/>
	
	{#if value}
		<button
			type="button"
			on:click={handleClear}
			class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
		>
			<X class="h-4 w-4" />
		</button>
	{/if}
</div> 