"use client";

import { useRef } from "react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelected, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="rounded-2xl border-2 border-dashed border-border-dashed px-8 py-12 hover:border-gold/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-cloud-arrow-up text-4xl text-text-muted" />
          <p className="text-[13px] text-text-muted">
            Click to upload an image
          </p>
          <p className="text-[11px] text-text-faint">
            JPG, PNG, or WebP
          </p>
        </div>
      </button>
    </div>
  );
}
