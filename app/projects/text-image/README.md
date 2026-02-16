# Text Image Canvas

Transform uploaded images into interactive particle parallax visualizations using depth estimation and semantic segmentation via real ML models.

## How It Works

### Pipeline

```
Upload image
  -> Depth estimation (Replicate ZoeDepth) -> grayscale depth map
  -> Semantic segmentation (Replicate SegFormer) -> labeled masks per class
  -> Sample particles from image (grid or depth-weighted)
  -> Render interactive particle canvas with parallax
```

### Particle Visualization

Each sampled pixel becomes a particle rendered on canvas. Particles can take many shapes: circles, hexagons, rounded squares, text characters, segmentation labels (English, Traditional Chinese, or FontAwesome icons). Mouse proximity enlarges nearby particles, and the closest particle gets special emphasis (3x size, halo shadow, word expansion for label shapes).

Key features:
- **Shape options**: circle, X, rounded square, hexagon, uppercase/lowercase/monospace text, segmentation labels (English, Chinese, icons)
- **Two sampling modes**: uniform grid, or depth-weighted random (CDF inversion)
- **Parallax**: particles shift with mouse movement, scaled by depth
- **Proximity interaction**: cursor enlarges nearby particles, expands closest label to full word
- **Background**: blurred original image with black or white overlay
- **Per-particle rotation**: label-based shapes get random rotation (-45 to 45 degrees)

### Tunable Parameters

| Param | What it does | Default (grid) | Default (depth-weighted) |
|-------|-------------|-----------------|--------------------------|
| Dots/edge | Grid sample density along longer edge | 45 | — |
| Points | Total particles (depth-weighted mode) | — | 1800 |
| Depth bias | How strongly depth skews sampling | — | 0.7 |
| Depth mul | Extra radius scaling by depth | 7.0 (auto) | 0.0 |
| Parallax | Max pixel shift for nearest particles | 70 | 70 |
| Opacity | Particle opacity | 1.0 | 1.0 |

## File Structure

```
text-image/
  page.tsx                          # Server component, metadata, layout
  TextImageClient.tsx               # Client orchestrator, tab state machine
  lib/
    types.ts                        # GalleryItem, SegmentResult
    particle-types.ts               # Particle, Shape, ShapeConfig, Background, Sampling
    label-maps.ts                   # ADE20K label -> Chinese char / FA icon mappings
    sampling.ts                     # sampleParticlesGrid, sampleParticlesWeighted, decodeSegmentationMasks
    shape-renderer.ts               # renderParticle, renderLabelParticle (Canvas2D)
    image-utils.ts                  # loadImage, getImageData, createBlurredBackground
  components/
    ParticleCanvas.tsx              # Core particle visualization (state, animation loop, canvas)
    ParticleControls.tsx            # Shape/background/sampling/options UI controls
    InferenceExplorer.tsx           # Expert tab: upload, depth + segmentation APIs, results
    SegmentationMap.tsx             # Colored segmentation mask overlay visualization
    ImageUploader.tsx               # Drag-drop / file picker with preview (dormant)
    ProcessingOverlay.tsx           # Spinner + step text (dormant)
    Gallery.tsx                     # Fetches + displays saved gallery items
    GalleryCard.tsx                 # Single gallery card with delete

api/text-image/
  depth/route.ts                    # POST: calls Replicate ZoeDepth, returns depth map URL
  segmentation/route.ts             # POST: calls Replicate SegFormer, returns labeled masks
  gallery/route.ts                  # GET: list from Redis, POST: upload to Blob + Redis
  gallery/[id]/route.ts             # DELETE: remove from Blob + Redis
```

## Tabs

| Tab | URL | Description |
|-----|-----|-------------|
| Canvas | `/projects/text-image` | Under construction — will reuse Expert components |
| Gallery | `?tab=gallery` | Saved images grid |
| Expert | `?tab=expert` | Full inference + particle playground (dev only) |

## Parallax Math

```
offset = mousePos * parallaxStrength * depth
```

- `mousePos`: normalized to [-1, 1], center = 0
- `depth`: 0 = far (no shift), 1 = near (max shift)
- `parallaxStrength`: max pixel displacement (default 70px)

Particles are sorted far-to-near so nearer particles draw on top.

## Env Vars

```
REPLICATE_TOKEN=r8_...                    # Replicate API for ZoeDepth + SegFormer
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...  # Vercel Blob for gallery image storage
REDIS_URL=redis://...                     # Redis for gallery metadata index
```

Gallery and inference features degrade gracefully if env vars are missing.

## Test Images

Drop test images in `public/test_images/`. They appear as clickable thumbnails in the Expert tab for quick testing without file uploads.
