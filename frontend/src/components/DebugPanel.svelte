<script lang="ts">
	import { GRID_SIZE } from '../lib/drawing/constants';
	import { activePixelCount, debug, image, maxIntensity, toFloat32Array } from '../lib/drawing/state.svelte';

	// Derived readouts. These recompute when the drawing data changes.
	const active = $derived(activePixelCount());
	const max = $derived(maxIntensity());
	const hovered = $derived(
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

<details class="rounded-lg border border-slate-700 bg-slate-900/60 text-sm">
	<summary class="cursor-pointer px-3 py-2 font-medium text-slate-300 select-none">
		Developer debug
	</summary>
	<dl class="grid grid-cols-2 gap-x-4 gap-y-1 px-3 pb-2 font-mono text-xs text-slate-400">
		<dt>Active pixels</dt>
		<dd class="text-right text-slate-200">{active} / {GRID_SIZE * GRID_SIZE}</dd>

		<dt>Max intensity</dt>
		<dd class="text-right text-slate-200">{max.toFixed(3)}</dd>

		<dt>Under pointer</dt>
		<dd class="text-right text-slate-200">
			{#if hovered}
				(col {hovered.col}, row {hovered.row}) = {hovered.value.toFixed(3)}
			{:else}
				—
			{/if}
		</dd>
	</dl>
	<div class="px-3 pb-3">
		<button
			type="button"
			class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
			onclick={copyValues}
		>
			{copied ? 'Copied!' : 'Copy 784 values'}
		</button>
	</div>
</details>
