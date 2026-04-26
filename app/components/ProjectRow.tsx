import Link from "next/link";
import { PROJECT_KINDS, type ProjectKind } from "@/app/projects/data";

interface ProjectRowProps {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  ready: boolean;
  status?: string;
  /** ISO calendar date (YYYY-MM-DD). Rendered as a mono caption under the
   *  status label. Falls back to `year` when absent. */
  date?: string;
  year?: string;
  /** Zero-padded issue number, e.g. "01". Rendered as a red eyebrow and
   *  used to pick a per-project placeholder disc color. */
  issue?: string;
  /** Font Awesome class (without family prefix) shown in the placeholder disc. */
  icon?: string;
  /** Kind bucket (playable / readable). Drives the small glyph rendered next
   *  to the issue number. */
  kind?: ProjectKind;
  draft?: boolean;
  /** Render the right-hand status label + indicator (PUBLISHED/DRAFT + dot/hammer).
   *  When the drafts toggle is off and only published items are visible, this
   *  block is redundant — leave it off in that case. Defaults to false. */
  showStatus?: boolean;
}

/** Flat editorial color pool for thumbless projects. All warm, all on-palette —
 *  ink, crimson accent, deep olive, warm clay. Rotates by issue number so
 *  each project gets a stable distinct disc. */
const DISC_PALETTE = [
  "#141413", // ink
  "#C0392B", // hot / crimson
  "#4A5240", // deep olive
  "#8B6F5A", // warm clay
];

function Thumbnail({
  title,
  thumbnail,
  issue,
  icon,
}: Pick<ProjectRowProps, "title" | "thumbnail" | "issue" | "icon">) {
  const paletteIndex = issue
    ? (parseInt(issue, 10) - 1 + DISC_PALETTE.length) % DISC_PALETTE.length
    : 0;
  const discColor = DISC_PALETTE[paletteIndex];
  const iconClass = icon ?? "fa-asterisk";

  return (
    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-full border border-rule transition-transform duration-300 ease-out group-hover:scale-[1.08]">
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-surface/90"
          style={{ backgroundColor: discColor }}
        >
          <i className={`fa-solid ${iconClass} text-2xl`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function ProjectRow({
  title,
  slug,
  description,
  thumbnail,
  ready,
  status,
  date,
  year,
  issue,
  icon,
  kind,
  draft,
  showStatus = false,
}: ProjectRowProps) {
  const resolvedStatus = status ?? (ready ? "PUBLISHED" : "DRAFT");
  const dateLabel = date ?? year;
  const kindIcon = kind
    ? PROJECT_KINDS.find((k) => k.id === kind)?.icon
    : undefined;

  return (
    <Link href={`/projects/${slug}`} className="group block">
      <div className="flex items-center gap-5 py-5 transition-transform duration-300 ease-out group-hover:scale-[1.025]">
        <Thumbnail title={title} thumbnail={thumbnail} issue={issue} icon={icon} />

        <div className="flex-1 min-w-0">
          {(issue || kindIcon) && (
            <p className="caption-mono text-hot inline-flex items-center gap-1.5">
              {issue && <span>№ {issue}</span>}
              {kindIcon && (
                <i
                  className={`fa-solid ${kindIcon} text-[9px]`}
                  aria-label={kind}
                />
              )}
            </p>
          )}
          <h3 className="mt-0.5 font-serif italic text-xl leading-tight text-ink">
            {title}
          </h3>
          <p className="mt-1 text-[12px] text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
          {showStatus && (
            <div className="flex items-center gap-2">
              {draft ? (
                <>
                  <span className="caption-mono text-ink-faint">
                    {resolvedStatus}
                  </span>
                  <span className="inline-flex items-center justify-center w-3.5 h-3.5 text-hot text-[9px]">
                    <i className="fa-solid fa-hammer" />
                  </span>
                </>
              ) : ready ? (
                <span
                  className="inline-flex items-center justify-center w-3.5 h-3.5 text-hot text-[9px]"
                  title="Published"
                >
                  <i className="fa-solid fa-stamp" />
                </span>
              ) : (
                <span className="inline-block w-2 h-2 rounded-full border border-ink-faint" />
              )}
            </div>
          )}
          {dateLabel && (
            <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint">
              {dateLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
