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

	/*
		The grid is rendered to a canvas at integer device-pixel coordinates.
		CSS grid gaps are laid out at fractional sizes, so some 1px lines round
		down to zero and disappear; drawing to a canvas keeps every line uniform.
	*/
	const LINE = '#3f7a58';
	const BACKGROUND = { r: 8, g: 18, b: 12 };
	const PAINT = { r: 142, g: 240, b: 182 };
	const ACCENT = { r: 127, g: 214, b: 255 };
	const HOVER_ALPHA = 0.5;

	/**
	 * Transient hover/brush-preview buffer. This is purely visual and never
	 * touches `image.pixels` unless the user is actively drawing.
	 */
	let glow: number[] = $state(new Array<number>(PIXEL_COUNT).fill(0));
	let glowing: number[] = [];

	let wrapEl: HTMLDivElement | undefined;
	let canvasEl: HTMLCanvasElement | undefined;
	/** Content-box width of the wrapper, tracked so the canvas can stay crisp. */
	let cssWidth = $state(0);

	// Backing-store bookkeeping so we only resize the canvas when needed.
	let lastBacking = 0;
	let lastDpr = 0;

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
		const element = canvasEl ?? wrapEl;
		if (!element) return { x: 0, y: 0 };
		const rect = element.getBoundingClientRect();
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
		if (event.button !== 0 || !wrapEl) return;
		event.preventDefault();

		try {
			wrapEl.setPointerCapture(event.pointerId);
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
		if (wrapEl?.hasPointerCapture(event.pointerId)) {
			wrapEl.releasePointerCapture(event.pointerId);
		}
	}

	function onPointerLeave(): void {
		clearGlow();
	}

	/**
	 * Compose the displayed colour for a cell from its painted intensity
	 * (phosphor green) and its transient hover glow (light blue tint).
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

	/**
	 * Render the 28x28 image plus grid lines to the canvas. All coordinates are
	 * integers in the canvas backing store, so lines are exactly uniform.
	 */
	function draw(): void {
		const canvas = canvasEl;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const target = Math.round(cssWidth * dpr);
		const gap = Math.max(1, Math.round(dpr));
		let cell = Math.floor((target - (GRID_SIZE - 1) * gap) / GRID_SIZE);
		if (cell < 1) cell = 1;
		const backing = cell * GRID_SIZE + (GRID_SIZE - 1) * gap;

		if (backing !== lastBacking || dpr !== lastDpr) {
			canvas.width = backing;
			canvas.height = backing;
			canvas.style.width = `${backing / dpr}px`;
			canvas.style.height = `${backing / dpr}px`;
			lastBacking = backing;
			lastDpr = dpr;
		}

		// Grid lines show through the gutters between cells.
		ctx.fillStyle = LINE;
		ctx.fillRect(0, 0, backing, backing);

		const stride = cell + gap;
		for (let row = 0; row < GRID_SIZE; row++) {
			const y = row * stride;
			for (let col = 0; col < GRID_SIZE; col++) {
				ctx.fillStyle = cellColor(row * GRID_SIZE + col);
				ctx.fillRect(col * stride, y, cell, cell);
			}
		}
	}

	// Track the wrapper's width so the canvas matches it while staying crisp.
	$effect(() => {
		if (!wrapEl) return;
		const observer = new ResizeObserver((entries) => {
			cssWidth = entries[0].contentRect.width;
		});
		observer.observe(wrapEl);
		return () => observer.disconnect();
	});

	// Redraw whenever the drawing data, hover glow, or size changes.
	$effect(() => {
		if (!canvasEl || cssWidth <= 0) return;
		draw();
	});
</script>

<div
	bind:this={wrapEl}
	class="pixel-grid"
	role="application"
	aria-label={`${GRID_SIZE} by ${GRID_SIZE} pixel drawing grid`}
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={endStroke}
	onpointercancel={endStroke}
	onpointerleave={onPointerLeave}
>
	<canvas class="grid-canvas" bind:this={canvasEl}></canvas>
</div>

<style>
	.pixel-grid {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		/* Cap by width and by viewport height so the square always fits. */
		max-width: min(32rem, 58vh);
		aspect-ratio: 1 / 1;
		margin: 0 auto;
		/* Dark canvas with visible green grid lines (drawn by the canvas). */
		background: #3f7a58;
		border: 1px solid #3f7a58;
		box-shadow:
			0 0 0 1px #050906,
			0 0 30px -10px rgba(84, 209, 138, 0.4);
		cursor: crosshair;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.grid-canvas {
		display: block;
		max-width: 100%;
		max-height: 100%;
		image-rendering: pixelated;
	}
</style>
