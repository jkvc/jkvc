"use client";

import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ open, src, alt, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={alt ? `Image preview: ${alt}` : "Image preview"}
      className="image-lightbox m-0 h-dvh max-h-dvh w-full max-w-none border-0 bg-transparent p-0 shadow-none backdrop:bg-ink/40 backdrop:blur-md"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="flex h-full w-full cursor-default items-center justify-center px-5 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-12"
        onClick={onClose}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          onClick={onClose}
        />
      </div>
    </dialog>
  );
}
