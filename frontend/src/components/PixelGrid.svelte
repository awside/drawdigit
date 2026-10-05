<script lang="ts">
	import { DEFAULT_BRUSH, createKernel, stamp, stroke } from '../lib/drawing/brush';
	import { GRID_SIZE, PIXEL_COUNT, pixelIndex } from '../lib/drawing/constants';
	import { debug, image } from '../lib/drawing/state.svelte';
	import type { Point } from '../lib/drawing/types';

	/**
	 * Brush radius (in logical pixels). Passed in from the parent so the brush
	 * size is configurable at runtime.
	 */
	let { radius = DEFAULT_BRUSH.radius }: { radius?: number } = $props();

	const kernel = $derived(createKernel(radius));
	const flow = DEFAULT_BRUSH.flow;
	const spacing = DEFAULT_BRUSH.spacing;

	/** Stable, keyed list of cell indices so the DOM order never changes. */
	const cells = Array.from({ length: PIXEL_COUNT }, (_, index) => index);

	// Phosphor palette. Painted intensity is light green; the transient hover
	// preview uses a light blue tint. Unpainted cells are a visible dim green so
	// the near-black gutters between them always read as grid lines.
	const BACKGROUND = { r: 17, g: 44, b: 30 };
	const PAINT = { r: 142, g: 240, b: 182 };
	const ACCENT = { r: 127, g: 214, b: 255 };
	const HOVER_ALPHA = 0.5;

	/**
	 * Transient hover/brush-preview buffer. This is purely visual and never
	 * touches `image.pixels` unless the user is actively drawing.
	 */
	let glow: number[] = $state(new Array<number>(PIXEL_COUNT).fill(0));
	let glowing: number[] = [];

	let gridEl: HTMLDivElement | undefined;

	// High-frequency drawing state is kept local to this component.
	let drawing = false;
	let pointer: Point = { x: 0, y: 0 };
	let last: Point = { x: 0, y: 0 };
	let frame = 0;

	function clampToCell(value: number): number {
		const floored = Math.floor(value);
		if (floored < 0) return 0;
		if (floored > GRID_SIZE - 1) return GRID_SIZE - 1;
		return floored;
	}

	/** Map a pointer event to fractional logical coordinates (0..GRID_SIZE). */
	function toLogical(event: PointerEvent): Point {
		if (!gridEl) return { x: 0, y: 0 };
		const rect = gridEl.getBoundingClientRect();
		return {
			x: ((event.clientX - rect.left) / rect.width) * GRID_SIZE,
			y: ((event.clientY - rect.top) / rect.height) * GRID_SIZE,
		};
	}

	/** Show the brush footprint under the pointer without painting. */
	function setGlow(point: Point): void {
		for (const index of glowing) glow[index] = 0;
		glowing = [];

		const half = Math.floor(kernel.size / 2);
		const centreCol = clampToCell(point.x);
		const centreRow = clampToCell(point.y);

		for (let dy = 0; dy < kernel.size; dy++) {
			const row = centreRow + dy - half;
			if (row < 0 || row >= GRID_SIZE) continue;

			for (let dx = 0; dx < kernel.size; dx++) {
				const col = centreCol + dx - half;
				if (col < 0 || col >= GRID_SIZE) continue;

				const weight = kernel.weights[dy * kernel.size + dx];
				if (weight <= 0.03) continue;

				const index = row * GRID_SIZE + col;
				glow[index] = weight;
				glowing.push(index);
			}
		}

		debug.hoveredIndex = pixelIndex(centreCol, centreRow);
	}

	function clearGlow(): void {
		for (const index of glowing) glow[index] = 0;
		glowing = [];
		debug.hoveredIndex = -1;
	}

	/** Paint one interpolated segment of the current stroke. */
	function paintSegment(from: Point, to: Point): void {
		stroke(image.pixels, from, to, flow, kernel, spacing);
	}

	/** Animation frame loop: keeps painting while the pointer is held down. */
	function tick(): void {
		if (!drawing) return;
		paintSegment(last, pointer);
		last = pointer;
		frame = requestAnimationFrame(tick);
	}

	function onPointerDown(event: PointerEvent): void {
		if (event.button !== 0 || !gridEl) return;
		event.preventDefault();

		try {
			gridEl.setPointerCapture(event.pointerId);
		} catch {
			// Pointer capture is best-effort; drawing still works without it.
		}

		drawing = true;
		pointer = toLogical(event);
		last = pointer;
		setGlow(pointer);

		// A single dab so a click/tap paints even without movement.
		stamp(image.pixels, pointer.x, pointer.y, flow, kernel);

		frame = requestAnimationFrame(tick);
	}

	function onPointerMove(event: PointerEvent): void {
		pointer = toLogical(event);
		setGlow(pointer);
	}

	function endStroke(event: PointerEvent): void {
		if (!drawing) return;
		drawing = false;
		cancelAnimationFrame(frame);
		if (gridEl?.hasPointerCapture(event.pointerId)) {
			gridEl.releasePointerCapture(event.pointerId);
		}
	}

	function onPointerLeave(): void {
		clearGlow();
	}

	/**
	 * Compose the displayed colour for a cell from its painted intensity
	 * (grayscale) and its transient hover glow (accent tint).
	 */
	function cellColor(index: number): string {
		const painted = image.pixels[index];
		const hover = glow[index];

		let r = BACKGROUND.r;
		let g = BACKGROUND.g;
		let b = BACKGROUND.b;

		if (painted > 0) {
			r += (PAINT.r - r) * painted;
			g += (PAINT.g - g) * painted;
			b += (PAINT.b - b) * painted;
		}

		if (hover > 0) {
			const alpha = hover * HOVER_ALPHA;
			r += (ACCENT.r - r) * alpha;
			g += (ACCENT.g - g) * alpha;
			b += (ACCENT.b - b) * alpha;
		}

		return `rgb(${r | 0}, ${g | 0}, ${b | 0})`;
	}
</script>

<div
	bind:this={gridEl}
	class="pixel-grid"
	style={`grid-template-columns: repeat(${GRID_SIZE}, 1fr)`}
	role="application"
	aria-label={`${GRID_SIZE} by ${GRID_SIZE} pixel drawing grid`}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={endStroke}
	onpointercancel={endStroke}
	onpointerleave={onPointerLeave}
>
	{#each cells as index (index)}
		<div class="pixel" style={`background: ${cellColor(index)}`}></div>
	{/each}
</div>

<style>
	.pixel-grid {
		display: grid;
		width: 100%;
		/* Cap by width and by viewport height so the square always fits. */
		max-width: min(32rem, 58vh);
		aspect-ratio: 1 / 1;
		margin: 0 auto;
		/* Near-black gutters between visible dim-green cells: clear grid lines. */
		gap: 2px;
		padding: 2px;
		background: #030604;
		border: 1px solid #2f6b47;
		border-radius: 0;
		box-shadow:
			0 0 0 1px #050906,
			0 0 30px -10px rgba(84, 209, 138, 0.4);
		cursor: crosshair;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.pixel {
		border-radius: 0;
	}
</style>
