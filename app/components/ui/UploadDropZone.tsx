"use client";

import { useRef } from "react";

interface Props {
  onFile: (file: File) => void;
  prompt: string;
  accept?: string;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function UploadDropZone({
  onFile,
  prompt,
  accept = "image/*",
  icon = "fa-wand-magic-sparkles",
  className = "",
  children,
  onClick,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`border border-dashed border-[#DDD] hover:border-gold/40 rounded-2xl p-10 text-center transition-colors cursor-pointer ${className}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f && f.type.startsWith("image/")) onFile(f);
      }}
      onClick={() => {
        onClick?.();
        fileInputRef.current?.click();
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div className="text-2xl text-gold/30 mb-3">
        <i className={`fa-solid ${icon}`} />
      </div>
      <p className="text-[13px] text-[#AAA] mb-6">
        {prompt}
      </p>
      {children}
    </div>
  );
}
