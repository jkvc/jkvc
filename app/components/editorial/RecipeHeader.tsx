import Link from "next/link";

export interface RecipeMeta {
  tags?: string[];
  status?: string;
  year?: string;
  date?: string;
  /** Short red label slot (e.g. "№ 02", "ABOUT"). */
  issue?: string;
  location?: string;
  /** Font Awesome class (sans family prefix) for the bucket glyph, rendered
   *  inline with the issue number (mirrors the home row-card treatment). */
  kindIcon?: string;
}

interface Props {
  meta: RecipeMeta;
  /** Where the back arrow links to. Defaults to "/". Set to `null` to hide. */
  backHref?: string | null;
}

export default function RecipeHeader({ meta, backHref = "/" }: Props) {
  // Status is intentionally omitted — project pages only exist once published,
  // so the label is redundant noise. The kind label is likewise elided: it's
  // already conveyed by the glyph beside the issue number.
  const parts: string[] = [];
  if (meta.tags && meta.tags.length) {
    parts.push(meta.tags.map((t) => t.toUpperCase()).join(" · "));
  }
  const dateLabel = meta.date ?? meta.year;
  if (dateLabel) parts.push(dateLabel);
  if (meta.location) parts.push(meta.location.toUpperCase());

  return (
    <div className="border-t border-b border-rule py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back to home"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-ink-muted hover:text-ink transition-colors -ml-1"
        >
          <i className="fa-solid fa-arrow-left text-[11px]" />
        </Link>
      )}
      {(meta.issue || meta.kindIcon) && (
        <span className="caption-mono text-hot inline-flex items-center gap-1.5">
          {meta.issue && (
            <span>
              {/^\d/.test(meta.issue) ? `№ ${meta.issue}` : meta.issue}
            </span>
          )}
          {meta.kindIcon && (
            <i className={`fa-solid ${meta.kindIcon} text-[9px]`} aria-hidden />
          )}
        </span>
      )}
      {parts.length > 0 && (
        <span className="ml-auto caption-mono text-ink-faint text-right">
          {parts.join("  ·  ")}
        </span>
      )}
    </div>
  );
}
