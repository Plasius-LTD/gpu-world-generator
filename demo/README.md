# GPU World Generator Demo

Minimal 3D WebGPU demo for Temperate Mixed Forest hex terrain.

## Run
From the demo folder:

```
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173/`).

## Controls
- Drag to orbit
- Shift + drag (or right-drag) to truck/pan
- Scroll to zoom
- Terrain/Feature/Foliage seeds independently control each generation layer
- Fractal mode foliage is proximity-based: sparse tree anchors, nearby understory, and occasional open-field flowers
- Regenerate to rebuild terrain

## View
- Default camera is isometric with orthographic projection.

## Requirements
- WebGPU-enabled browser (Chrome/Edge 113+).
