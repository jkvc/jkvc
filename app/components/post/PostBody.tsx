import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import type { MDXComponents } from "mdx/types";

/**
 * MDX component overrides used for editorial blog-post rendering. Headings
 * pick up Fraunces + italic accent; paragraphs get generous leading; inline
 * code and fenced pre blocks use Geist Mono with a hairline treatment.
 *
 * Kept in one place so the post voice is consistent across routes. If you
 * need a one-off tweak inside a single post, override inline with JSX
 * instead of widening this map.
 */
const MDX_COMPONENTS: MDXComponents = {
  h1: (props) => (
    <h1
      className="mt-8 font-serif text-[2rem] leading-[1.1] tracking-[-0.02em] text-ink"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="mt-8 font-serif text-[1.625rem] leading-[1.15] tracking-[-0.015em] text-ink"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-6 font-serif text-[1.25rem] leading-tight text-ink"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-4 text-[14px] leading-[1.55] text-ink-muted" {...props} />
  ),
  a: (props) => (
    <a
      className="text-hot underline decoration-hot/40 underline-offset-[3px] hover:decoration-hot"
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
      className="mt-5 border-l-2 border-rule pl-4 font-serif italic text-[15px] text-ink-muted"
      {...props}
    />
  ),
  hr: (props) => <hr className="my-8 hairline" {...props} />,
  code: (props) => (
    <code
      className="font-mono text-[13px] bg-surface-deep text-ink px-1.5 py-0.5 rounded"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-2xl border border-rule bg-surface-deep p-4 font-mono text-[13px] leading-[1.5]"
      {...props}
    />
  ),
  em: (props) => <em className="italic" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-ink" {...props} />
  ),
};

interface Props {
  /** Raw .mdx file contents. Pass the return value of `readPostSource(slug)`. */
  source: string;
}

/**
 * Server component that compiles MDX into React. Use inside any page where
 * you've already read the post file from disk. Strips frontmatter (if any)
 * before compilation so post bodies stay clean.
 */
export default async function PostBody({ source }: Props) {
  const { content } = matter(source);
  const { content: rendered } = await compileMDX({
    source: content,
    components: MDX_COMPONENTS,
    options: { parseFrontmatter: false },
  });

  return (
    <article className="prose-reset max-w-none">{rendered}</article>
  );
}
