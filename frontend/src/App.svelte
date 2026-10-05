<script lang="ts">
	import DebugPanel from './components/DebugPanel.svelte';
	import PixelGrid from './components/PixelGrid.svelte';
	import { DEFAULT_BRUSH } from './lib/drawing/brush';
	import { activePixelCount, clearImage, debug } from './lib/drawing/state.svelte';

	const brushSizes = [
		{ label: 'FINE', radius: 1.1 },
		{ label: 'MED', radius: DEFAULT_BRUSH.radius },
		{ label: 'BOLD', radius: 2.3 },
	];

	let radius = $state(DEFAULT_BRUSH.radius);

	const active = $derived(activePixelCount());

	function handleClear(): void {
		clearImage();
		debug.hoveredIndex = -1;
	}
</script>

<div class="min-h-svh p-3 sm:p-5 lg:p-8">
	<div class="mx-auto flex max-w-5xl flex-col border border-moss bg-void/80 shadow-[0_0_60px_-20px_rgba(84,209,138,0.35)]">
		<!-- Terminal title bar -->
		<div class="flex items-center gap-2 border-b border-moss bg-crust px-3 py-2">
			<span class="h-2.5 w-2.5 rounded-full bg-ember/90"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-sand/80"></span>
			<span class="h-2.5 w-2.5 rounded-full bg-leaf/80"></span>
			<span class="ml-3 truncate text-xs text-fern">andy@vanderbilt: ~/digit-recognition</span>
		</div>

		<div class="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
			<header class="flex flex-col gap-2">
				<div class="flex flex-wrap items-center gap-2 text-[11px] tracking-wider">
					<span class="border border-leaf/50 px-1.5 py-0.5 text-leaf">MILESTONE_1</span>
					<span class="text-fern">// drawing surface · model not wired up yet</span>
				</div>
				<h1 class="text-lg font-bold tracking-[0.18em] text-phos sm:text-xl">
					HANDWRITTEN&nbsp;DIGIT&nbsp;RECOGNITION<span class="cursor-blink" aria-hidden="true"></span>
				</h1>
				<p class="max-w-2xl text-xs leading-relaxed text-fern sm:text-sm">
					<span class="text-leaf">#</span> draw a digit 0–9 on the 28×28 grid. hold the pointer down
					and move slowly, or repeatedly, to brighten the pixels.
				</p>
			</header>

			<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-8">
				<section class="flex flex-col gap-3">
					<PixelGrid {radius} />

					<div class="flex items-center justify-between text-[11px] text-fern">
						<span>28x28 · 784 logical px</span>
						<span class="flex items-center gap-2">
							<span
								class="inline-block h-2 w-2"
								class:bg-aqua={active > 0}
								class:bg-moss={active === 0}
							></span>
							<span>active_px = {active}</span>
						</span>
					</div>
				</section>

				<aside class="flex flex-col gap-4 text-xs">
					<button
						type="button"
						class="border border-ember/70 px-3 py-2.5 font-bold tracking-wider text-ember transition hover:bg-ember/15 hover:text-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua"
						onclick={handleClear}
					>
						[ CLEAR CANVAS ]
					</button>

					<div class="border border-moss bg-crust/60 p-3">
						<p class="mb-2 text-[10px] tracking-wider text-fern"># brush_size</p>
						<div class="flex gap-1">
							{#each brushSizes as size (size.label)}
								<button
									type="button"
									class="flex-1 border px-1 py-1.5 text-[11px] tracking-wider transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua {radius ===
									size.radius
										? 'border-ember bg-ember/10 text-sand'
										: 'border-moss text-fern hover:border-leaf/60 hover:text-leaf'}"
									onclick={() => (radius = size.radius)}
								>
									{size.label}
								</button>
							{/each}
						</div>
					</div>

					<DebugPanel />

					<p class="text-[11px] leading-relaxed text-fern/80">
						<span class="text-leaf">#</span> this image will later be sent to a python
						deep-learning model. no predictions are generated yet.
					</p>
				</aside>
			</div>
		</div>
	</div>
</div>
