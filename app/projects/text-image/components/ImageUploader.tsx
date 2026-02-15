"use client";

import { useCallback, useRef, useState } from "react";

interface Props {
  onUpload: (file: File) => void;
}

export default function ImageUploader({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    if (f.size > 10 * 1024 * 1024) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  if (preview && file) {
    return (
      <div className="flex flex-col items-center gap-4">
        <img
          src={preview}
          alt="Preview"
          className="max-h-64 rounded-lg border border-base-300"
        />
        <p className="text-sm text-base-content/60">{file.name}</p>
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm rounded-full"
            onClick={() => onUpload(file)}
          >
            Process Image
          </button>
          <button
            className="btn btn-ghost btn-sm rounded-full"
            onClick={() => {
              setFile(null);
              setPreview(null);
            }}
          >
            Choose Different
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-base-300 hover:border-base-content/30"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <p className="text-base-content/50 text-sm mb-3">
        Drop an image here or choose a file
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="file-input file-input-sm file-input-bordered rounded-full"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <p className="text-base-content/30 text-xs mt-3">Max 10MB</p>
    </div>
  );
}
