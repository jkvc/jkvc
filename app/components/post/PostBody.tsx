import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import { twMerge } from "tailwind-merge";
import type { MDXComponents } from "mdx/types";
import type { ImgHTMLAttributes } from "react";
import { STAMP_CONTROL_WRAP_IDLE, STAMP_FACE } from "@/app/lib/stamp";
import StampShell from "@/app/components/ui/StampShell";
import PostInlineImage from "@/app/components/post/PostInlineImage";
import { PostLightboxProvider } from "@/app/components/post/PostLightboxProvider";

export type {
  PostImageMaxWidth,
  PostImageProps,
} from "@/app/components/post/postImageStyles";

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
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <PostInlineImage {...props} />
  ),
  PostImage: PostInlineImage,
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
    <PostLightboxProvider>
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
    </PostLightboxProvider>
  );
}
