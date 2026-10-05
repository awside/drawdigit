<script lang="ts">
	import DebugPanel from './components/DebugPanel.svelte';
	import PixelGrid from './components/PixelGrid.svelte';
	import { DEFAULT_BRUSH } from './lib/drawing/brush';
	import { activePixelCount, clearImage, debug } from './lib/drawing/state.svelte';

	const brushSizes = [
		{ label: 'Fine', radius: 1.1, dot: 6 },
		{ label: 'Medium', radius: DEFAULT_BRUSH.radius, dot: 9 },
		{ label: 'Bold', radius: 2.3, dot: 13 },
	];

	let radius = $state(DEFAULT_BRUSH.radius);

	const active = $derived(activePixelCount());

	function handleClear(): void {
		clearImage();
		debug.hoveredIndex = -1;
	}
</script>

<div class="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:py-12">
	<header class="mb-8 flex flex-col gap-5 sm:mb-10">
		<div class="flex flex-wrap items-center gap-3">
			<span
				class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30"
			>
				<svg viewBox="0 0 24 24" class="h-5 w-5 text-white" aria-hidden="true">
					<g fill="currentColor">
						<circle cx="6" cy="6" r="1.9" />
						<circle cx="12" cy="6" r="1.9" />
						<circle cx="18" cy="6" r="1.9" />
						<circle cx="6" cy="12" r="1.9" />
						<circle cx="12" cy="12" r="1.9" />
						<circle cx="18" cy="12" r="1.9" />
						<circle cx="6" cy="18" r="1.9" />
						<circle cx="12" cy="18" r="1.9" />
						<circle cx="18" cy="18" r="1.9" />
					</g>
				</svg>
			</span>
			<span
				class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
				Drawing milestone · model not wired up yet
			</span>
		</div>

		<div>
			<h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
				Handwritten
				<span class="bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-200 bg-clip-text text-transparent">
					Digit Recognition
				</span>
			</h1>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
				Draw a digit (0–9) on the 28×28 grid below. Hold the pointer down and move slowly, or
				repeatedly, to make strokes brighter — the pixels are a real grayscale image.
			</p>
		</div>
	</header>

	<div class="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
		<section
			class="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6"
		>
			<PixelGrid {radius} />

			<div class="flex items-center justify-between px-1 text-xs text-slate-500">
				<span class="font-mono">28 × 28 · 784 logical pixels</span>
				<span class="inline-flex items-center gap-1.5">
					<span
						class="h-1.5 w-1.5 rounded-full transition-colors"
						class:bg-cyan-400={active > 0}
						class:bg-slate-600={active === 0}
					></span>
					<span class="font-mono">{active} active</span>
				</span>
			</div>
		</section>

		<aside class="flex flex-col gap-4">
			<button
				type="button"
				class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-800/50 focus-visible:ring-2 focus-visible:ring-indigo-300/70 focus-visible:outline-none active:scale-[0.99]"
				onclick={handleClear}
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" aria-hidden="true">
					<path
						d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Clear canvas
			</button>

			<div class="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
				<p class="mb-2 px-1 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
					Brush size
				</p>
				<div class="flex gap-1 rounded-xl bg-ink-950/50 p-1">
					{#each brushSizes as size (size.label)}
						<label
							class="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition {radius ===
							size.radius
								? 'bg-indigo-500/90 text-white shadow-sm shadow-indigo-900/50'
								: 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
						>
							<input
								type="radio"
								name="brush"
								value={size.radius}
								bind:group={radius}
								class="sr-only"
							/>
							<span
								class="rounded-full bg-current"
								style={`width:${size.dot}px;height:${size.dot}px`}
							></span>
							{size.label}
						</label>
					{/each}
				</div>
			</div>

			<DebugPanel />

			<p class="px-1 text-xs leading-relaxed text-slate-500">
				This image will later be sent to a Python deep-learning model. No predictions are
				generated yet.
			</p>
		</aside>
	</div>
</div>
