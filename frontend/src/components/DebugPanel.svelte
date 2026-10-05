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

<details class="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
	<summary
		class="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:text-white [&::-webkit-details-marker]:hidden"
	>
		<span class="inline-flex items-center gap-2">
			<svg viewBox="0 0 24 24" class="h-4 w-4 text-slate-500" fill="none" aria-hidden="true">
				<path
					d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
				/>
			</svg>
			Developer debug
		</span>
		<svg
			viewBox="0 0 24 24"
			class="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
			fill="none"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
		</svg>
	</summary>

	<div class="space-y-3 border-t border-white/5 px-4 py-3">
		<div class="grid grid-cols-2 gap-2">
			<div class="rounded-xl border border-white/5 bg-ink-950/50 px-3 py-2">
				<p class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
					Active pixels
				</p>
				<p class="mt-0.5 font-mono text-sm text-white">
					{active}<span class="text-slate-600"> / {GRID_SIZE * GRID_SIZE}</span>
				</p>
			</div>
			<div class="rounded-xl border border-white/5 bg-ink-950/50 px-3 py-2">
				<p class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
					Max intensity
				</p>
				<p class="mt-0.5 font-mono text-sm text-white">{max.toFixed(3)}</p>
			</div>
		</div>

		<div
			class="flex items-center justify-between rounded-xl border border-white/5 bg-ink-950/50 px-3 py-2"
		>
			<p class="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
				Under pointer
			</p>
			<p class="font-mono text-xs text-slate-300">
				{#if hovered}
					({hovered.col}, {hovered.row}) <span class="text-slate-600">=</span>
					<span class="text-white">{hovered.value.toFixed(3)}</span>
				{:else}
					<span class="text-slate-600">—</span>
				{/if}
			</p>
		</div>

		<button
			type="button"
			class="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-300/70 focus-visible:outline-none"
			onclick={copyValues}
		>
			{copied ? 'Copied 784 values ✓' : 'Copy 784 values as JSON'}
		</button>
	</div>
</details>
