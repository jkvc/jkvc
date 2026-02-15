# Text Image Canvas

Transform uploaded images into interactive parallax visualizations using depth estimation, segmentation, and color extraction.

## How It Works

### Pipeline

```
Upload image
  -> Semantic segmentation (mock) -> labeled regions with masks
  -> Depth estimation (mock or Replicate ZoeDepth) -> per-region or per-pixel depth
  -> Dominant color extraction (real pixel sampling) -> RGB per region
  -> Render to parallax canvas
```

### Two Visualization Modes

**Text parallax (main canvas)** — Each segmented region's pixels are replaced with the region's class label tiled as text, colored by the region's dominant color. Regions are layered by depth and shift with mouse movement for a parallax effect. Uses pre-rendered offscreen canvases per region for performance (only compositing happens per frame).

**Dot parallax (debug tab)** — Uses per-pixel depth and color. Each sampled pixel becomes a circular dot: size proportional to closeness (depth=1 nearest/largest), color from the original image. Mouse movement shifts dots by depth for parallax. No segmentation needed — works directly from the depth map image. Parameters tunable via sliders:

| Param | What it does | Default |
|-------|-------------|---------|
| Dots/edge | Sample points along the image's longer dimension | 50 |
| Base size | Min dot radius (furthest dots) | auto from spacing |
| Depth multiplier | Extra radius at max depth | auto from spacing |
| Parallax strength | Max pixel shift for nearest dots | 20 |
| Opacity | Dot opacity | 1.0 |

## File Structure

```
text-image/
  page.tsx                    # Server component, metadata, layout
  TextImageClient.tsx         # Client orchestrator, phase state machine
  lib/
    types.ts                  # SegmentRegion, TextImageData, GalleryItem, etc.
    mock-segmentation.ts      # 5x6 grid, labels by row (sky/tree/grass/road)
    mock-depth.ts             # Vertical-position depth, top=far bottom=near
    mock-color.ts             # Real pixel sampling for dominant color
    process-image.ts          # Runs all 3 steps with progress callbacks
    canvas-renderer.ts        # preRenderLayers() + compositeWithParallax()
    parallax-engine.ts        # computeParallaxOffset(mousePos, depth, maxShift)
  components/
    ImageUploader.tsx          # Drag-drop / file picker with preview
    ProcessingOverlay.tsx      # Spinner + step text
    ParallaxCanvas.tsx         # <canvas> with rAF loop + mouse tracking
    DotParallaxViewer.tsx      # Per-pixel dot parallax with slider controls
    Gallery.tsx                # Fetches + displays saved items
    GalleryCard.tsx            # Single gallery card with delete
    DebugDepth.tsx             # Dev-only: depth estimation + dot parallax

api/text-image/
  depth/route.ts              # POST: calls Replicate ZoeDepth, returns depth map URL
  gallery/route.ts            # GET: list from Redis, POST: upload to Blob + Redis
  gallery/[id]/route.ts       # DELETE: remove from Blob + Redis
```

## State Machine

```
idle -> processing -> viewing <-> gallery
                         \-> debug (dev only)
```

- **idle**: Upload prompt
- **processing**: Spinner with step text
- **viewing**: Parallax canvas with save/reset buttons
- **gallery**: Saved images grid
- **debug**: Depth estimation testing + dot parallax viewer

Tab state persists in URL via `?tab=gallery` / `?tab=debug`.

## Parallax Math

Both modes use the same core formula:

```
offset = mousePos * maxShift * depth
```

- `mousePos`: normalized to [-1, 1], center = 0
- `depth`: 0 = far (no shift), 1 = near (max shift)
- `maxShift`: max pixel displacement (default 20px)

Text mode inverts this (`1 - depth`) because regions are sorted far-to-near. Dot mode uses depth directly since dots are also sorted far-to-near but depth=1 means closest.

## Env Vars

```
REPLICATE_TOKEN=r8_...          # Replicate API for ZoeDepth depth estimation
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...  # Vercel Blob for gallery image storage
REDIS_URL=redis://...           # Redis for gallery metadata index
```

Gallery and depth features degrade gracefully if env vars are missing (gallery returns empty, depth returns error).

## Mock Models

All three processing steps currently use mocks with simulated delays:

- **Segmentation**: Divides image into 5x6 grid, assigns labels by vertical position
- **Depth**: `depth = 1.0 - (centerY / height)` with small noise
- **Color**: Actually samples real pixels from the image (not mocked)

Each mock has a `// TODO: Replace with real model` comment. The depth API route already integrates with the real ZoeDepth model via Replicate for the debug tab.

## Test Images

Drop test images in `public/test_images/`. They appear as clickable thumbnails in the debug tab for quick testing without file uploads. Currently: `mactree.jpg` (768x479).
