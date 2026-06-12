"use client";

import { twMerge } from "tailwind-merge";
import { usePostLightbox } from "@/app/components/post/PostLightboxProvider";
import {
  resolvePostImageLayout,
  type PostImageProps,
} from "@/app/components/post/postImageStyles";

export default function PostInlineImage({
  className,
  alt,
  src,
  maxWidth,
  columnWidth,
  style,
  ...rest
}: PostImageProps) {
  const { openLightbox } = usePostLightbox();
  const label = typeof alt === "string" && alt ? alt : "image";

  const { imgClassName, imgStyle, wrapperClassName, wrapperStyle } =
    resolvePostImageLayout({ className, maxWidth, columnWidth, style });

  const handleOpen = () => {
    if (typeof src !== "string" || !src) return;
    openLightbox(src, typeof alt === "string" ? alt : "");
  };

  return (
    <button
      type="button"
      className={twMerge(
        "mx-auto mt-4 block cursor-zoom-in border-0 bg-transparent p-0",
        wrapperClassName,
      )}
      style={wrapperStyle}
      onClick={handleOpen}
      aria-label={`View full size: ${label}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={imgClassName}
        alt={typeof alt === "string" ? alt : ""}
        src={src}
        {...rest}
        style={imgStyle}
      />
    </button>
  );
}
