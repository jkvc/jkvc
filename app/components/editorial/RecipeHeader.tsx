import Link from "next/link";
import { twMerge } from "tailwind-merge";
import Pill from "@/app/components/editorial/Pill";
import { STAMP_CONTROL_SHADOW } from "@/app/lib/stamp";

export interface RecipeMeta {
  status?: string;
  year?: string;
  date?: string;
  /** Short label slot (e.g. "№ 02", "ABOUT"). */
  issue?: string;
  location?: string;
  /** Font Awesome class (sans family prefix) for the bucket glyph. */
  kindIcon?: string;
}

interface Props {
  meta: RecipeMeta;
  /** Where the back arrow links to. Defaults to "/". Set to `null` to hide. */
  backHref?: string | null;
}

/**
 * Handbook-style recipe header — thick border strip with back arrow, issue
 * badge rendered as a small `<Pill>`, and right-aligned meta.
 */
export default function RecipeHeader({ meta, backHref = "/" }: Props) {
  const parts: string[] = [];
  const dateLabel = meta.date ?? meta.year;
  if (dateLabel) parts.push(dateLabel);
  if (meta.location) parts.push(meta.location.toUpperCase());

  return (
    <div
        className={twMerge(
            STAMP_CONTROL_SHADOW,
            "flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-b-2 border-ink bg-surface px-3 py-3",
        )}
    >
      {backHref && (
        <Link
          href={backHref}
          aria-label="Back to home"
          className="inline-flex items-center justify-center w-6 h-6 border-2 border-ink bg-ink text-surface hover:bg-surface hover:text-ink transition-colors -ml-1"
        >
          <i className="fa-solid fa-arrow-left text-[11px]" />
        </Link>
      )}
      {(meta.issue || meta.kindIcon) && (
        <span className="caption-mono text-hot inline-flex items-center gap-1.5 border-2 border-ink bg-surface px-2 py-0.5">
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
