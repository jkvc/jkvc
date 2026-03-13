"use client";

import { useState, useCallback, useRef } from "react";
import BowlCanvas from "./components/BowlCanvas";

interface MixerImage {
  id: string;
  url: string;
  name: string;
}

const MAX_BALLS = 5;

export default function ImageMixerClient() {
  const [images, setImages] = useState<MixerImage[]>([]);
  const [mixResult, setMixResult] = useState<string | null>(null);
  const [isMixing, setIsMixing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(0);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = MAX_BALLS - images.length;
      const toAdd = Array.from(files).slice(0, remaining);

      const newImages: MixerImage[] = toAdd.map((file) => ({
        id: `ball-${idCounter.current++}`,
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      setImages((prev) => [...prev, ...newImages]);

      // Reset input so same file can be re-added
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [images.length]
  );

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const handleMix = useCallback(async () => {
    if (images.length === 0) return;
    setIsMixing(true);
    setMixResult(null);

    // Mock: simulate processing delay then show a placeholder
    await new Promise((r) => setTimeout(r, 1800));

    // Create a mock blended result by drawing all images overlaid on a canvas
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Warm background
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, 512, 512);

    // Draw each image with reducing opacity
    const loadPromises = images.map(
      (img) =>
        new Promise<HTMLImageElement>((resolve) => {
          const el = new Image();
          el.crossOrigin = "anonymous";
          el.onload = () => resolve(el);
          el.onerror = () => resolve(el);
          el.src = img.url;
        })
    );

    const loaded = await Promise.all(loadPromises);
    const opacityStep = 1 / loaded.length;

    for (let i = 0; i < loaded.length; i++) {
      ctx.globalAlpha = opacityStep + 0.1;
      const img = loaded[i];
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, 512, 512);
      }
    }
    ctx.globalAlpha = 1;

    // Add "MOCK" watermark
    ctx.fillStyle = "rgba(138, 133, 120, 0.3)";
    ctx.font = "bold 48px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("MOCK OUTPUT", 256, 270);
    ctx.font = "20px sans-serif";
    ctx.fillText("Model not connected", 256, 310);

    setMixResult(canvas.toDataURL("image/jpeg", 0.9));
    setIsMixing(false);
  }, [images]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Bowl */}
      <BowlCanvas images={images} onRemove={handleRemove} />

      {/* Hint */}
      {images.length === 0 && (
        <p className="text-[13px] text-text-muted -mt-2">
          Add up to {MAX_BALLS} images to the bowl. Drag a ball out to remove it.
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= MAX_BALLS}
          className="rounded-full px-4 py-1.5 border border-border text-[13px] text-[#AAA]
                     hover:border-gold/50 hover:text-gold transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-plus mr-1.5" />
          Add image
          {images.length > 0 && (
            <span className="ml-1 text-text-faint">
              ({images.length}/{MAX_BALLS})
            </span>
          )}
        </button>

        {/* Mix button */}
        {images.length > 0 && (
          <>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={handleMix}
              disabled={isMixing || images.length === 0}
              className="rounded-full px-5 py-1.5 bg-gold text-white text-[13px]
                         hover:bg-gold-dark transition-colors shadow-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMixing ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin mr-1.5" />
                  Mixing…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-blender mr-1.5" />
                  Mix
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Result */}
      {mixResult && (
        <div className="w-full max-w-sm mt-4">
          <p className="text-[10px] uppercase tracking-widest text-text-faint mb-2">
            Result
          </p>
          <div className="rounded-2xl overflow-hidden border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mixResult}
              alt="Mixed result"
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
