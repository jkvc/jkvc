"use client";

import { useCallback, useState } from "react";
import DotParallaxViewer from "./DotParallaxViewer";

const TEST_IMAGES = [
  { name: "mactree", src: "/test_images/mactree.jpg" },
];

export default function DebugDepth() {
  const [depthUrl, setDepthUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
    setDepthUrl(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/text-image/depth", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setDepthUrl(data.depthUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTestImage = useCallback(
    async (src: string) => {
      const res = await fetch(src);
      const blob = await res.blob();
      const file = new File([blob], src.split("/").pop() || "test.jpg", {
        type: blob.type,
      });
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-2 border-dashed border-base-300 hover:border-base-content/30 rounded-lg p-8 text-center transition-colors">
        <p className="text-base-content/50 text-sm mb-3">
          Upload an image to estimate depth
        </p>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-sm file-input-bordered rounded-full"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      <div>
        <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
          Test images
        </p>
        <div className="flex gap-2">
          {TEST_IMAGES.map((img) => (
            <button
              key={img.name}
              className="rounded-lg overflow-hidden border border-base-300 hover:border-base-content/40 transition-colors w-20 h-20 p-0 cursor-pointer"
              onClick={() => handleTestImage(img.src)}
              disabled={loading}
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-error text-sm">{error}</div>}

      {(previewUrl || depthUrl) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previewUrl && (
            <div>
              <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
                Original
              </p>
              <img
                src={previewUrl}
                alt="Original"
                className="w-full rounded-lg border border-base-300"
              />
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            depthUrl && (
              <div>
                <p className="text-xs text-base-content/40 uppercase tracking-widest mb-2">
                  Depth Map
                </p>
                <img
                  src={depthUrl}
                  alt="Depth map"
                  className="w-full rounded-lg border border-base-300"
                />
              </div>
            )
          )}
        </div>
      )}
      {depthUrl && previewUrl && (
        <DotParallaxViewer originalUrl={previewUrl} depthUrl={depthUrl} />
      )}
    </div>
  );
}
