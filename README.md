# DrawDigit

Interactive handwritten digit recognition — a Vanderbilt Data Science deep learning final project.

A user draws a digit (0–9) on a **28×28 pixel** surface in the browser. A convolutional neural
network trained on **MNIST** predicts the digit, and inference runs **entirely in the browser** via
ONNX Runtime Web — no inference server.

> **Project requirements:** [`FINAL_PROJECT_INSTRUCTIONS.md`](./FINAL_PROJECT_INSTRUCTIONS.md)
> **Repo orientation:** [`AGENTS.md`](./AGENTS.md)
> **Current milestone:** interactive drawing surface. **Model inference is not wired in yet.**

## Status

| Phase | Status |
| --- | --- |
| Frontend framework (Bun + Svelte + TS + Tailwind + Vite) | ✅ |
| 28×28 pixel drawing surface with intensity painting | ✅ |
| Clear/reset + debug readouts | ✅ |
| MNIST CNN training + ONNX export (`training/`) | ⬜ next milestone |
| In-browser inference (`onnxruntime-web`) + prediction UI | ⬜ next milestone |
| Netlify deployment | ⬜ next milestone |

## Requirements

- [Bun](https://bun.sh/) (tested with 1.4.x) — used as the runtime and package manager.
- Python + PyTorch (later, for training in `training/`).

## Run the frontend

```bash
cd frontend
bun install
bun run dev
```

Then open the printed local URL (default `http://localhost:5173`).

Other scripts (run from `frontend/`):

```bash
bun run build      # production build
bun run preview    # preview the production build
bun run check      # svelte-check + TypeScript type checking
```

## Repository layout

```
frontend/            # Svelte + Vite + TypeScript + Tailwind app (deployed)
│   └── public/models/   # committed ONNX weights served to the browser
training/            # PyTorch CNN training + ONNX export (offline, not deployed)
experiments/         # model comparison / ablation runs
notebooks/           # MNIST exploration / analysis
netlify.toml         # static deploy config
FINAL_PROJECT_INSTRUCTIONS.md
AGENTS.md
README.md
```

## How it works

```
Draw (28×28) → 784 values → preprocessing → ONNX model in the browser → predicted digit
```

- The user draws on a 28×28 grid, producing 784 normalized values.
- Before inference the input is preprocessed to match MNIST (crop to bounding box, scale to 20×20,
  center by center of mass in 28×28, normalize).
- A CNN trained on MNIST and exported to ONNX is loaded with `onnxruntime-web` and run in the
  browser; the top class and confidence are shown.

**Why in-browser inference?** An MNIST CNN is tiny (roughly 1–5 MB of fp32 weights) and takes only
a few milliseconds per image on CPU, so shipping the weights to the client removes the need for a
server entirely. Python/PyTorch is still used for training, but offline in `training/`.

## How the drawing works

- The logical image is always **28×28 = 784** values, in normalized intensity `[0, 1]`
  (0 = background, 1 = maximum). This matches MNIST and never changes with screen size.
- The surface is a grid of individual cells (not a freehand canvas), so the pixelation is visible
  and intentional.
- **Hover** shows a soft accent-tinted brush preview. It is purely visual and does not modify the
  stored pixel data.
- **Drawing** (pointer held down) paints intensity additively: repeated or slow movement brightens
  pixels, and the brush has a configurable radial falloff so neighbours are weaker than the centre.
- A `requestAnimationFrame` loop interpolates between pointer positions, so fast drags still produce
  continuous strokes.
- **Clear** resets all 784 values to zero immediately.

The numeric data lives in `frontend/src/lib/drawing/state.svelte.ts`. `toFloat32Array()` returns the
784 values as a `Float32Array` — the exact form the model consumes.

### Frontend source map

| Path | Purpose |
| --- | --- |
| `src/components/PixelGrid.svelte` | 28×28 surface: rendering, pointer handling, hover, painting |
| `src/components/DebugPanel.svelte` | Dev readouts + copy the 784 values |
| `src/lib/drawing/constants.ts` | `GRID_SIZE`, `PIXEL_COUNT`, clamping |
| `src/lib/drawing/types.ts` | `Point`, `Cell`, `BrushConfig`, `BrushKernel` |
| `src/lib/drawing/brush.ts` | Kernel build, `stamp`, `stroke` interpolation |
| `src/lib/drawing/state.svelte.ts` | Reactive image + debug state |

## Technology decisions

- **Plain Vite + Svelte 5 SPA** rather than SvelteKit: the app is a single static page, and the
  original plan used `src/App.svelte` + `src/main.ts`.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (no `tailwind.config.js`). Custom CSS is
  used for the pixel grid where utility classes would be less clear.
- **Svelte 5 runes** (`$state`, `$derived`, `$props`) for fine-grained reactivity, so a pointer move
  updates only the cells that actually change.
- **Client-side ONNX inference** instead of a Python backend: the model is small and fast enough to
  run in the browser, which keeps deployment to a single static site and avoids server cost.
- **Netlify** static hosting, built from `frontend/` with Bun.

## Not included yet

MNIST loading, CNN training, ONNX export, the `onnxruntime-web` runtime, input preprocessing,
prediction UI, and deployment.
