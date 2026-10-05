/**
 * Fixed geometry and value bounds for the drawing image.
 *
 * These describe the *logical* image, which must stay 28x28 to match MNIST.
 * How large the grid appears on screen is purely a CSS concern.
 */

/** Columns and rows of the logical image. MNIST images are 28x28. */
export const GRID_SIZE = 28;

/** Total logical pixels: 28 * 28 = 784. */
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;

/** Minimum pixel intensity (background). */
export const MIN_INTENSITY = 0;

/** Maximum pixel intensity. */
export const MAX_INTENSITY = 1;

/** Constrain an intensity to the valid [0, 1] range. */
export function clampIntensity(value: number): number {
  if (value < MIN_INTENSITY) return MIN_INTENSITY;
  if (value > MAX_INTENSITY) return MAX_INTENSITY;
  return value;
}

/** Flat array index for a cell. Row-major, matching MNIST's flattening order. */
export function pixelIndex(col: number, row: number): number {
  return row * GRID_SIZE + col;
}
