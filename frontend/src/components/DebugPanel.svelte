<script lang="ts">
	import { GRID_SIZE } from '../lib/drawing/constants';
	import {
		activePixelCount,
		debug,
		image,
		maxIntensity,
		toFloat32Array,
	} from '../lib/drawing/state.svelte';

	// Derived readouts. These recompute when the drawing data changes.
	const active = $derived(activePixelCount());
	const max = $derived(maxIntensity());
	const pointer = $derived(
		debug.hoveredIndex >= 0
			? {
					col: debug.hoveredIndex % GRID_SIZE,
					row: Math.floor(debug.hoveredIndex / GRID_SIZE),
					value: image.pixels[debug.hoveredIndex],
				}
			: null,
	);

	let copied = $state(false);

	async function copyValues(): Promise<void> {
		const values = Array.from(toFloat32Array(), (value) => Number(value.toFixed(3)));
		try {
			await navigator.clipboard.writeText(JSON.stringify(values));
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			copied = false;
		}
	}
</script>

<details class="border border-moss bg-crust/60">
	<summary
		class="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[11px] tracking-wider text-leaf transition hover:bg-leaf/5 [&::-webkit-details-marker]:hidden"
	>
		<span>&gt; debug</span>
		<span class="text-fern">[ +/- ]</span>
	</summary>

	<div class="space-y-1 border-t border-moss px-3 py-2">
		<div class="flex items-center justify-between">
			<span class="text-fern">active_px</span>
			<span class="text-phos">{active}<span class="text-fern">/{GRID_SIZE * GRID_SIZE}</span></span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-fern">max_intensity</span>
			<span class="text-phos">{max.toFixed(3)}</span>
		</div>
		<div class="flex items-center justify-between">
			<span class="text-fern">pointer</span>
			<span class="text-aqua">
				{#if pointer}
					({pointer.col},{pointer.row})={pointer.value.toFixed(3)}
				{:else}
					<span class="text-fern">--</span>
				{/if}
			</span>
		</div>

		<button
			type="button"
			class="mt-2 w-full border border-moss px-3 py-1.5 text-[11px] tracking-wider text-leaf transition hover:bg-leaf/10 hover:text-phos focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
			onclick={copyValues}
		>
			{copied ? '[ COPIED 784 VALUES ]' : '[ COPY 784 VALUES ]'}
		</button>
	</div>
</details>
