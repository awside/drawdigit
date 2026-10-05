import { GRID_SIZE, clampIntensity } from './constants';
import type { BrushConfig, BrushKernel, Point } from './types';

/**
 * Default brush feel. All distances are in logical pixels (not screen pixels),
 * so the brush behaves the same regardless of how large the grid is displayed.
 *
 * - `radius` controls the size of the soft dab.
 * - `flow` controls how fast a pixel brightens per animation frame / stamp.
 * - `spacing` controls how far apart stamps are placed along a fast stroke.
 */
export const DEFAULT_BRUSH: BrushConfig = {
  radius: 1.6,
  flow: 0.15,
  spacing: 0.4,
};

/**
 * Build a radial falloff kernel using a Gaussian-like profile.
 * The centre weight is 1.0 and weights fall off smoothly with distance,
 * so neighbours receive progressively weaker intensity than the centre.
 */
export function createKernel(radius: number): BrushKernel {
  const size = Math.ceil(radius) * 2 + 1;
  const half = Math.floor(size / 2);
  const sigma = radius / 2;
  const weights = new Float32Array(size * size);

  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const ox = dx - half;
      const oy = dy - half;
      const distanceSquared = ox * ox + oy * oy;
      weights[dy * size + dx] = Math.exp(-distanceSquared / (2 * sigma * sigma));
    }
  }

  return { radius, size, weights };
}

/** Convert a fractional logical coordinate to a valid cell index, clamped to the grid. */
function clampToCell(value: number): number {
  const floored = Math.floor(value);
  if (floored < 0) return 0;
  if (floored > GRID_SIZE - 1) return GRID_SIZE - 1;
  return floored;
}

/**
 * Add `amount` of intensity, weighted by the kernel, centred on logical point (x, y).
 * Pixels are additive and clamped to [0, 1] so they never overflow.
 */
export function stamp(
  pixels: number[],
  x: number,
  y: number,
  amount: number,
  kernel: BrushKernel,
): void {
  const half = Math.floor(kernel.size / 2);
  const centreCol = clampToCell(x);
  const centreRow = clampToCell(y);

  for (let dy = 0; dy < kernel.size; dy++) {
    const row = centreRow + dy - half;
    if (row < 0 || row >= GRID_SIZE) continue;

    for (let dx = 0; dx < kernel.size; dx++) {
      const col = centreCol + dx - half;
      if (col < 0 || col >= GRID_SIZE) continue;

      const weight = kernel.weights[dy * kernel.size + dx];
      if (weight <= 0) continue;

      const index = row * GRID_SIZE + col;
      pixels[index] = clampIntensity(pixels[index] + amount * weight);
    }
  }
}

/**
 * Paint a continuous stroke from `from` to `to` by stamping the brush at
 * intervals of at most `spacing` logical pixels. This prevents the dotted-line
 * gaps that occur when pointer events arrive far apart on a fast drag.
 *
 * The starting point is skipped because it was already stamped at the end of the
 * previous segment (or on pointer-down).
 */
export function stroke(
  pixels: number[],
  from: Point,
  to: Point,
  amount: number,
  kernel: BrushKernel,
  spacing: number,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 1e-6) {
    stamp(pixels, to.x, to.y, amount, kernel);
    return;
  }

  const steps = Math.max(1, Math.ceil(distance / spacing));
  for (let step = 1; step <= steps; step++) {
    const t = step / steps;
    stamp(pixels, from.x + dx * t, from.y + dy * t, amount, kernel);
  }
}
