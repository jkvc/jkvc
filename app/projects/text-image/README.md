# Text Image Canvas

Transform uploaded images into interactive particle parallax visualizations using depth estimation and semantic segmentation via real ML models.

## Architecture

### Two Viewing Modes

| Mode | Description | Controls |
|------|-------------|----------|
| **Presentation** | Clean viewer with 4 circular preset buttons. Full-screen loading until both depth + segmentation are ready. No sliders. | Preset selector only |
| **Expert** | Full inference explorer with upload, depth/seg previews, and all tunable particle controls. | Shape, background, sampling, sliders |

Switching between modes preserves the current image and all inference state (depth map, segmentation masks). No re-inference is needed.

### Pipeline

```
Upload image (or select test image)
  -> Depth estimation (Replicate ZoeDepth) -> grayscale depth map
  -> Semantic segmentation (Replicate SegFormer) -> labeled masks per class
  -> Sample particles from image (grid or depth-weighted)
  -> Render interactive particle canvas with parallax
```

### State Flow

```
TextImageClient (orchestrator)
  ├── Shared inference state: previewUrl, depthUrl, segments, loading flags
  ├── handleFile(): triggers depth + segmentation concurrently
  ├── PresentationView (presentation mode)
  │     ├── Full-screen loading overlay (until both APIs resolve)
  │     ├── Preset selector (4 circular dot buttons)
  │     ├── ParticleCanvas (fixedConfig from preset)
  │     └── SaveToGallery
  ├── InferenceExplorer (expert mode)
  │     ├── Upload + test images
  │     ├── Depth/segmentation previews (streaming)
  │     ├── ParticleCanvas (with full ParticleControls)
  │     └── SaveToGallery
  └── Gallery
        ├── Grid of saved items (GalleryCard)
        └── Click to view → restores mode, config, all data without re-inference
```

### Presets (Presentation Mode)

Presets are defined in `lib/presets.ts`. Each preset specifies a full `ParticleConfig` plus display labels.

| Order | ID | English | Chinese | Emoji | Shape |
|-------|----|---------|---------|-------|-------|
| 1 | `label-en` | Labels | 標籤 | 🔤 | Segmentation labels (English) |
| 2 | `label-zh` | Chinese | 漢字 | 文 | Segmentation labels (Traditional Chinese) |
| 3 | `label-icon` | Icons | 圖標 | ✨ | FontAwesome icons |
| 4 | `dots` | Dots | 圓點 | ● | Circular dots |

To add/edit/reorder presets, edit the `PRESETS` array in `lib/presets.ts`.

### Gallery & Save

The "Save to Gallery" button captures:
- Canvas snapshot (PNG) → Vercel Blob
- Original image → Vercel Blob
- Depth map image → Vercel Blob
- Segmentation masks (JSON) → Vercel Blob
- Metadata (mode, presetId, config, labels, dimensions) → Redis

Opening a saved gallery item loads all assets directly and renders the particle canvas with the saved configuration — **no re-inference** is needed. The viewer opens in the same mode (presentation or expert) that was used when saving.

### Particle Visualization

Each sampled pixel becomes a particle rendered on canvas. Particles can take many shapes: circles, hexagons, rounded squares, text characters, segmentation labels (English, Traditional Chinese, or FontAwesome icons). Mouse proximity enlarges nearby particles, and the closest particle gets special emphasis (3x size, halo shadow, word expansion for label shapes).

Key features:
- **Shape options**: circle, X, rounded square, hexagon, uppercase/lowercase/monospace text, segmentation labels (English, Chinese, icons)
- **Two sampling modes**: uniform grid, or depth-weighted random (CDF inversion)
- **Parallax**: particles shift with mouse movement, scaled by depth
- **Proximity interaction**: cursor enlarges nearby particles, expands closest label to full word
- **Background**: blurred original image with black or white overlay
- **Per-particle rotation**: label-based shapes get random rotation (-45 to 45 degrees)

### Tunable Parameters (Expert Mode)

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
  TextImageClient.tsx               # Client orchestrator: mode/phase state, shared inference
  lib/
    types.ts                        # GalleryItem (with full restore data), SegmentResult
    particle-types.ts               # Particle, Shape, ShapeConfig, Background, Sampling
    presets.ts                      # Presentation mode preset definitions
    label-maps.ts                   # ADE20K label -> Chinese char / FA icon mappings
    sampling.ts                     # sampleParticlesGrid, sampleParticlesWeighted, decodeSegmentationMasks
    shape-renderer.ts               # renderParticle, renderLabelParticle (Canvas2D)
    image-utils.ts                  # loadImage, getImageData, createBlurredBackground
  components/
    PresentationView.tsx            # Presentation mode: presets, full-screen loading, clean viewer
    InferenceExplorer.tsx           # Expert mode: upload, depth + segmentation previews, full controls
    ParticleCanvas.tsx              # Core particle visualization (state, animation loop, canvas)
    ParticleControls.tsx            # Shape/background/sampling/options UI controls (expert)
    SaveToGallery.tsx               # Save button: captures canvas + all inference data
    SegmentationMap.tsx             # Colored segmentation mask overlay visualization
    Gallery.tsx                     # Fetches + displays saved gallery items, click to view
    GalleryCard.tsx                 # Single gallery card with delete + mode badge
    ImageUploader.tsx               # Drag-drop / file picker with preview (utility)
    ProcessingOverlay.tsx           # Spinner + step text (utility)

api/text-image/
  depth/route.ts                    # POST: calls Replicate ZoeDepth, returns depth map URL
  segmentation/route.ts             # POST: calls Replicate SegFormer, returns labeled masks
  gallery/route.ts                  # GET: list from Redis; POST: upload all assets to Blob + Redis
  gallery/[id]/route.ts             # DELETE: remove all blobs + Redis entry
```

## Navigation

| Tab | URL | Description |
|-----|-----|-------------|
| Canvas (Presentation) | `/projects/text-image` | Clean preset-based viewer |
| Canvas (Expert) | `?tab=expert` | Full inference + particle playground |
| Gallery | `?tab=gallery` | Saved images grid, click to restore |

The Presentation/Expert toggle is in the top-right of the Canvas tab. Switching modes preserves all current state.

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
