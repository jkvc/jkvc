# Text Image Canvas

Transform uploaded images into interactive particle-parallax visualizations using depth estimation and semantic segmentation.

## Architecture

### Two modes

| Mode | Description | Controls |
|------|-------------|----------|
| **Presentation** | Curated presets for a clean, minimal viewer. | Preset selector + mode/reset buttons |
| **Expert** | Full inspection view with depth/segmentation previews and all particle controls. | Shape/background/sampling/sliders |

Switching modes preserves current inference state (`previewUrl`, `depthUrl`, `segments`) so no re-inference is needed.

### Pipeline

```text
Upload image
  -> Depth estimation (Replicate ZoeDepth)
  -> Semantic segmentation (Replicate SegFormer)
  -> Particle sampling (grid or depth-weighted)
  -> Interactive canvas render (parallax + hover behavior)
```

### Orchestration flow

```text
TextImageClient
  ├── shared inference + gallery state
  ├── handleFile(): runs depth + segmentation in parallel
  ├── PresentationView
  │     ├── preset selector
  │     ├── ParticleCanvas (fixedConfig per preset)
  │     └── SaveToGallery
  └── InferenceExplorer
        ├── original/depth/segmentation previews
        ├── ParticleCanvas + ParticleControls
        └── SaveToGallery
```

## Presets

Presets are defined in `lib/presets.ts` and each maps to a complete `ParticleConfig` from `lib/particle-config.ts`.

| Order | ID | Label | Shape |
|-------|----|-------|-------|
| 1 | `label-en` | Labels / 標籤 | Segmentation labels (English) |
| 2 | `label-zh` | Chinese / 漢字 | Segmentation labels (Traditional Chinese) |
| 3 | `label-icon` | Icons / 圖標 | Segmentation labels (Font Awesome icons) |
| 4 | `dots` | Dots / 圓點 | Circle particles |

## Gallery persistence

Save captures:
- rendered canvas snapshot
- original image
- depth image
- segmentation JSON
- metadata (`mode`, `presetId`, dimensions, labels, full particle config)

Storage:
- blobs in Vercel Blob
- index/metadata in Redis

Loading a saved item restores the exact saved visualization without re-inference.

## File structure

```text
text-image/
  page.tsx
  TextImageClient.tsx
  lib/
    types.ts
    particle-config.ts
    particle-types.ts
    presets.ts
    label-maps.ts
    sampling.ts
    shape-renderer.ts
    image-utils.ts
  components/
    PresentationView.tsx
    InferenceExplorer.tsx
    ParticleCanvas.tsx
    ParticleControls.tsx
    SegmentationMap.tsx
    SaveToGallery.tsx
```

Shared components used by this project now live in:
- `app/components/ui` (`IconCircleButton`, `ExampleGalleryStrip`, `StatusPillRow`)
- `app/components/gallery` (`SaveActionPanel`)

## Navigation

| Route | Description |
|-------|-------------|
| `/projects/text-image` | Presentation mode |
| `/projects/text-image?mode=expert` | Expert mode |

## Parallax math

```text
offset = mousePos * parallaxStrength * depth
```

- `mousePos`: normalized to `[-1, 1]`
- `depth`: near pixels move more than far pixels
- particles are sorted far-to-near so near points draw on top

## Environment variables

```text
REPLICATE_TOKEN=...
BLOB_READ_WRITE_TOKEN=...
REDIS_URL=...
```

Features degrade gracefully if these are missing.
