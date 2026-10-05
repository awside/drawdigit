import { PIXEL_COUNT } from './constants';

/**
 * The canonical drawing data: 784 normalized intensities in [0, 1].
 *
 * This is the numeric image the model will eventually consume. It is kept
 * separate from the DOM. A plain reactive array is used so that Svelte's
 * fine-grained reactivity updates only the cells that actually change.
 * Use `toFloat32Array()` when the flat Float32Array form is needed.
 */
export const image = $state({
  pixels: new Array<number>(PIXEL_COUNT).fill(0),
});

/**
 * Transient state for the development debug panel. `hoveredIndex` is the cell
 * currently under the pointer, or -1 when the pointer is off the grid.
 */
export const debug = $state({
  hoveredIndex: -1,
});

/** Reset all 784 values to background without reloading the page. */
export function clearImage(): void {
  for (let i = 0; i < image.pixels.length; i++) {
    image.pixels[i] = 0;
  }
}

/** Snapshot of the 784 values as a Float32Array (the form a model consumes). */
export function toFloat32Array(): Float32Array {
  return Float32Array.from(image.pixels);
}

/** Number of pixels brighter than `threshold`. */
export function activePixelCount(threshold = 0.05): number {
  let count = 0;
  for (const value of image.pixels) {
    if (value > threshold) count++;
  }
  return count;
}

/** Brightest pixel value in the image. */
export function maxIntensity(): number {
  let max = 0;
  for (const value of image.pixels) {
    if (value > max) max = value;
  }
  return max;
}
