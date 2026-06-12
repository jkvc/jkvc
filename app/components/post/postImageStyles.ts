import { twMerge } from "tailwind-merge";
import type { CSSProperties, ImgHTMLAttributes } from "react";
import { STAMP_CONTROL_WRAP_IDLE, STAMP_FACE } from "@/app/lib/stamp";

export const postImgClass = twMerge(
  STAMP_FACE,
  STAMP_CONTROL_WRAP_IDLE,
  "mx-auto mt-4 block h-auto w-full max-w-xl bg-surface",
);

export const POST_IMAGE_MAX = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
  none: "max-w-none",
  prose: "max-w-prose",
} as const;

export type PostImageMaxWidth = keyof typeof POST_IMAGE_MAX;

export type PostImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "maxWidth"
> & {
  maxWidth?: PostImageMaxWidth;
  columnWidth?: number;
};

export function mergeImgClass(...extra: (string | undefined)[]) {
  return twMerge(postImgClass, ...extra);
}

export function resolvePostImageLayout({
  className,
  maxWidth,
  columnWidth,
  style,
}: Pick<PostImageProps, "className" | "maxWidth" | "columnWidth" | "style">): {
  imgClassName: string;
  imgStyle: CSSProperties | undefined;
} {
  const fraction =
    typeof columnWidth === "number" &&
    Number.isFinite(columnWidth) &&
    columnWidth > 0
      ? Math.min(1, columnWidth)
      : null;

  const override =
    fraction != null
      ? "w-auto max-w-none"
      : maxWidth
        ? POST_IMAGE_MAX[maxWidth]
        : undefined;

  const imgClassName = mergeImgClass(override, className);

  if (fraction != null) {
    return {
      imgClassName,
      imgStyle: { width: `${fraction * 100}%`, ...style },
    };
  }

  return {
    imgClassName,
    imgStyle: style,
  };
}
