/** A point in logical pixel space. May be fractional while interpolating a stroke. */
export interface Point {
  x: number;
  y: number;
}

/** Integer cell coordinates on the 28x28 grid. */
export interface Cell {
  col: number;
  row: number;
}

/** Tunable brush parameters. Radius and spacing are in logical pixels. */
export interface BrushConfig {
  /** Distance from the centre at which falloff approaches zero. */
  radius: number;
  /** Intensity added at the brush centre per stamp. */
  flow: number;
  /** Maximum distance between stamps along a stroke segment (prevents gaps). */
  spacing: number;
}

/** A precomputed radial falloff kernel. */
export interface BrushKernel {
  radius: number;
  /** Side length of the square kernel (always odd). */
  size: number;
  /** Row-major weights in [0, 1], strongest at the centre. */
  weights: Float32Array;
}
