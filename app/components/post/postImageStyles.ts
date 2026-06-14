import { twMerge } from "tailwind-merge";
import type { CSSProperties, ImgHTMLAttributes } from "react";

/** Layout classes for images inside {@link StampImageButton} (stamp chrome lives on the shell). */
export const POST_IMG_LAYOUT = "block h-auto w-full max-w-xl";

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
  return twMerge(POST_IMG_LAYOUT, ...extra);
}

const WRAPPER_BASE = "mx-auto mt-4 block max-w-full";

export function resolvePostImageLayout({
  className,
  maxWidth,
  columnWidth,
  style,
}: Pick<PostImageProps, "className" | "maxWidth" | "columnWidth" | "style">): {
  imgClassName: string;
  imgStyle: CSSProperties | undefined;
  wrapperClassName: string;
  wrapperStyle: CSSProperties | undefined;
} {
  const fraction =
    typeof columnWidth === "number" &&
    Number.isFinite(columnWidth) &&
    columnWidth > 0
      ? Math.min(1, columnWidth)
      : null;

  const maxWClass = maxWidth ? POST_IMAGE_MAX[maxWidth] : undefined;

  const override =
    fraction != null
      ? "w-full max-w-none"
      : maxWClass
        ? "w-full max-w-none"
        : undefined;

  const imgClassName = mergeImgClass(override, className);

  if (fraction != null) {
    return {
      imgClassName,
      imgStyle: style,
      wrapperClassName: WRAPPER_BASE,
      wrapperStyle: { width: `${fraction * 100}%` },
    };
  }

  return {
    imgClassName,
    imgStyle: style,
    wrapperClassName: twMerge(WRAPPER_BASE, "w-fit", maxWClass),
    wrapperStyle: undefined,
  };
}
