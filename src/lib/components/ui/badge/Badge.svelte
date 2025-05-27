<script lang="ts">
	import { cn } from "$lib/utils.js";
	import { badgeVariants, type BadgeVariant } from "./index.js";

	export let variant: BadgeVariant = "default";
	let className: string = "";
	export { className as class };
</script>

<div class={cn(badgeVariants({ variant }), className)} {...$$restProps}>
	<slot />
</div> 