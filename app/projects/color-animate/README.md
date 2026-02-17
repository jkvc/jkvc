# Color Animate

A demo that iteratively removes color from an image and creates an animated playback showing the color flowing back to life.

## How It Works

### 1. Upload & Color Detection
- User uploads an image
- Claude vision analyzes the image to detect all colored regions
- Each colored object/region is identified with a description

### 2. Iterative Color Removal
- For each colored region detected:
  - Use Flux2Klein to convert that specific object to white
  - Re-analyze the new image with Claude Haiku
  - Repeat until no colored regions remain
- All steps are saved for playback

### 3. Concurrent Animation Generation
- While color removal is happening, the original image is sent to wan-2.5-i2v-fast
- This Replicate model generates a video animation from the image
- The animation completes in parallel with the color removal process

### 4. Playback
- Steps are played back in reverse order (white → colored)
- Each frame shows progressively more color being added back
- After the step-by-step playback, the generated video animation plays
- All data is saved to Redis for future replay without re-processing

## Tech Stack

### APIs
- **Claude 3.5 Sonnet** - Vision analysis to detect colored regions
- **Flux2Klein** (Replicate) - Image-to-image transformation to remove color
- **wan-2.5-i2v-fast** (Replicate) - Image-to-video animation generation

### Storage
- **Redis** - Stores sessions including:
  - Processing steps with images
  - Detected regions per step
  - Animation video URLs
  - Timestamps for all operations

### UI Components
- `ImageUploader` - File selection interface
- `ProcessingView` - Shows iterative color removal steps
- `PlaybackView` - Reverse animation playback with controls
- `GalleryView` - Dev-mode gallery for saved sessions

## Environment Variables

Required:
- `ANTHROPIC_API_KEY` - For Claude vision API
- `REPLICATE_TOKEN` - For Flux2Klein and wan-2.5-i2v-fast
- `REDIS_URL` - For session storage (optional, disables persistence if missing)

## API Routes

- `POST /api/color-animate/detect-color` - Analyze image for colored regions
- `POST /api/color-animate/remove-color` - Remove color from specific region
- `POST /api/color-animate/animate` - Generate video animation
- `GET /api/color-animate/gallery` - List saved sessions
- `POST /api/color-animate/gallery` - Save/update session
- `GET /api/color-animate/gallery/[id]` - Get specific session
- `DELETE /api/color-animate/gallery/[id]` - Delete session

## Design Notes

- **Concurrency**: Animation generation starts immediately when first image is uploaded, runs in parallel with color removal
- **Persistence**: All intermediate steps saved for playback tuning without reprocessing
- **Reversible**: Playback goes from final (white) back to original (colored) for dramatic effect
- **Safety limits**: Maximum 10 steps to prevent infinite loops
- **Dev mode**: Gallery view only appears in development for testing saved sessions
