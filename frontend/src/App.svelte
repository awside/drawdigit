<script lang="ts">
	import DebugPanel from './components/DebugPanel.svelte';
	import PixelGrid from './components/PixelGrid.svelte';
	import { DEFAULT_BRUSH } from './lib/drawing/brush';
	import { clearImage, debug } from './lib/drawing/state.svelte';

	const brushSizes = [
		{ label: 'Fine', radius: 1.1 },
		{ label: 'Medium', radius: DEFAULT_BRUSH.radius },
		{ label: 'Bold', radius: 2.3 },
	];

	let radius = $state(DEFAULT_BRUSH.radius);

	function handleClear(): void {
		clearImage();
		debug.hoveredIndex = -1;
	}
</script>

<main
	class="mx-auto flex min-h-svh max-w-5xl flex-col gap-6 px-4 py-8 text-slate-200 lg:flex-row lg:items-start lg:gap-10"
>
	<section class="flex flex-1 flex-col gap-4">
		<header class="space-y-1">
			<h1 class="text-2xl font-semibold text-white">Handwritten Digit Recognition</h1>
			<p class="text-sm text-slate-400">
				Draw a digit (0–9) on the 28×28 grid. Hold the pointer down and move slowly or
				repeatedly to make strokes brighter.
			</p>
		</header>

		<PixelGrid {radius} />
	</section>

	<aside class="flex w-full flex-col gap-4 lg:w-72">
		<button
			type="button"
			class="rounded-lg bg-sky-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
			onclick={handleClear}
		>
			Clear
		</button>

		<fieldset class="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
			<legend class="px-1 text-sm text-slate-300">Brush size</legend>
			<div class="flex gap-4">
				{#each brushSizes as size (size.label)}
					<label class="flex items-center gap-1.5 text-sm text-slate-300">
						<input type="radio" name="brush" value={size.radius} bind:group={radius} />
						{size.label}
					</label>
				{/each}
			</div>
		</fieldset>

		<DebugPanel />

		<p class="text-xs text-slate-500">
			Milestone 1: drawing surface only. No model inference yet — this 28×28 image will later be
			sent to the Python model.
		</p>
	</aside>
</main>
