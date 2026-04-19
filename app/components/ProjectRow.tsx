import Link from "next/link";

interface ProjectRowProps {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  thumbnail?: string;
  ready: boolean;
  year?: string;
  status?: string;
  draft?: boolean;
}

function Thumbnail({
  title,
  thumbnail,
  gradient,
}: Pick<ProjectRowProps, "title" | "thumbnail" | "gradient">) {
  return (
    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-full border border-rule">
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
      ) : (
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ background: gradient }}
        />
      )}
    </div>
  );
}

export default function ProjectRow({
  title,
  slug,
  description,
  tags,
  gradient,
  thumbnail,
  ready,
  year,
  status,
  draft,
}: ProjectRowProps) {
  const resolvedStatus = status ?? (ready ? "READY" : "DRAFT");
  const tagString = tags.map((t) => t.toUpperCase()).join(" · ");

  return (
    <Link
      href={`/projects/${slug}`}
      className="group block border-b border-rule last:border-b-0 transition-colors duration-200 hover:bg-surface-deep/60"
    >
      <div className="flex items-center gap-5 px-1 py-5">
        <Thumbnail title={title} thumbnail={thumbnail} gradient={gradient} />

        <div className="flex-1 min-w-0">
          <h3 className="font-serif italic text-xl leading-tight text-ink">
            {title}
          </h3>
          <p className="mt-1 text-[12px] text-ink-muted leading-relaxed">
            {description}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {tagString}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {year && (
            <span className="font-serif text-xl text-ink leading-none">
              <sup className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint mr-0.5 align-super">
                №
              </sup>
              {year}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
              {resolvedStatus}
            </span>
            {draft ? (
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-hot text-[9px]">
                <i className="fa-solid fa-hammer" />
              </span>
            ) : ready ? (
              <span className="inline-block w-2 h-2 rounded-full bg-hot" />
            ) : (
              <span className="inline-block w-2 h-2 rounded-full border border-ink-faint" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
