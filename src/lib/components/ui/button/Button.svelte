<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { buttonVariants, type ButtonVariant, type ButtonSize } from "./index.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	type $$Props = HTMLButtonAttributes & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	};

	export let variant: ButtonVariant = "default";
	export let size: ButtonSize = "default";
	let className: string = "";
	export { className as class };
</script>

<button
	class={cn(buttonVariants({ variant, size }), className)}
	{...$$restProps}
	on:click
	on:keydown
>
	<slot />
</button> 