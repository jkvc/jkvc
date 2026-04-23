import Link from "next/link";

export interface RecipeMeta {
  tags?: string[];
  status?: string;
  year?: string;
  date?: string;
  /** Short red label slot (e.g. "№ 02", "ABOUT"). */
  issue?: string;
  location?: string;
  /** Bucket label — e.g. "PLAYABLE" / "READABLE". Rendered first in the
   *  meta strip so it reads as the primary classifier. */
  kind?: string;
}

interface Props {
  meta: RecipeMeta;
  /** Where the back arrow links to. Defaults to "/". Set to `null` to hide. */
  backHref?: string | null;
}

export default function RecipeHeader({ meta, backHref = "/" }: Props) {
  // Status is intentionally omitted — project pages only exist once published,
  // so the label is redundant noise. The home row still shows it.
  const parts: string[] = [];
  if (meta.kind) parts.push(meta.kind.toUpperCase());
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
      {meta.issue && (
        <span className="caption-mono text-hot">
          {/^\d/.test(meta.issue) ? `№ ${meta.issue}` : meta.issue}
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
