import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import { twMerge } from "tailwind-merge";
import type { MDXComponents } from "mdx/types";
import type { ImgHTMLAttributes } from "react";
import { STAMP_CONTROL_WRAP_IDLE, STAMP_FACE } from "@/app/lib/stamp";
import StampShell from "@/app/components/ui/StampShell";

const postImgClass = twMerge(
  STAMP_FACE,
  STAMP_CONTROL_WRAP_IDLE,
  "mx-auto mt-4 block h-auto w-full max-w-xl bg-surface",
);

function mergeImgClass(...extra: (string | undefined)[]) {
  return twMerge(postImgClass, ...extra);
}

const POST_IMAGE_MAX = {
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

function PostImage({
  className,
  alt,
  maxWidth,
  columnWidth,
  style,
  ...rest
}: PostImageProps) {
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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={mergeImgClass(override, className)}
      alt={alt ?? ""}
      {...rest}
      style={
        fraction != null
          ? { width: `${fraction * 100}%`, ...style }
          : style
      }
    />
  );
}

const MDX_COMPONENTS: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-8 font-sans font-black text-[2rem] leading-[1.1] tracking-tight text-ink uppercase"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-8 font-sans font-bold text-[1.625rem] leading-[1.15] tracking-tight text-ink uppercase"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-6 font-sans font-bold text-[1.25rem] leading-tight text-ink"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-4 text-[14px] leading-[1.55] text-ink-muted" {...props} />
  ),
  a: (props) => (
    <a
      className="text-hot underline decoration-hot/40 underline-offset-[3px] hover:decoration-hot font-bold"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-4 pl-5 list-disc marker:text-ink-faint space-y-1.5 text-[14px] leading-[1.55] text-ink-muted"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-4 pl-5 list-decimal marker:text-ink-faint space-y-1.5 text-[14px] leading-[1.55] text-ink-muted"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-5 border-l-4 border-hot pl-4 text-[15px] text-ink-muted italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="font-mono text-[13px] bg-surface-2 text-ink px-1.5 py-0.5 border border-ink"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className={twMerge(
        STAMP_FACE,
        STAMP_CONTROL_WRAP_IDLE,
        "mt-4 overflow-x-auto bg-surface-2 p-4 font-mono text-[13px] leading-[1.5]",
      )}
      {...props}
    />
  ),
  em: (props) => <em className="italic" {...props} />,
  strong: (props) => (
    <strong className="font-bold text-ink" {...props} />
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    const { className, alt, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={mergeImgClass(className)}
        alt={typeof alt === "string" ? alt : ""}
        {...rest}
      />
    );
  },
  PostImage,
};

const MDX_OPTIONS = {
  parseFrontmatter: false,
  blockJS: false,
  blockDangerousJS: true,
} as const;

/** Compile a single MDX string and return the rendered React node. */
async function compileSection(source: string) {
  const { content } = await compileMDX({
    source,
    components: MDX_COMPONENTS,
    options: MDX_OPTIONS,
  });
  return content;
}

interface Props {
  source: string;
}

export default async function PostBody({ source }: Props) {
  const { content } = matter(source);

  // Split on lines that are exactly `---` (optional surrounding whitespace).
  // Each chunk becomes its own stamp card — including a single-section post.
  const sections = content
    .split(/\n[ \t]*---[ \t]*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const renderedSections = await Promise.all(
    (sections.length > 0 ? sections : [content]).map(compileSection),
  );

  return (
    <div className="flex flex-col gap-6">
      {renderedSections.map((rendered, i) => (
        <StampShell
          key={i}
          variant="card"
          bleed={false}
          faceClassName="p-6 sm:p-8 [&>article>*:first-child]:mt-0"
        >
          <article className="prose-reset max-w-none">{rendered}</article>
        </StampShell>
      ))}
    </div>
  );
}
