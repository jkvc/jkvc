import Link from "next/link";
import { twMerge } from "tailwind-merge";
import StampShell from "@/app/components/ui/StampShell";
import {
  STAMP_CONTROL_LIFT,
  STAMP_CONTROL_SHADOW,
  STAMP_FACE,
} from "@/app/lib/stamp";
import {
  PROJECT_KINDS,
  resolveRef,
  type ProjectKind,
  type Ref,
} from "@/app/projects/data";

interface ProjectRowProps {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  ready: boolean;
  status?: string;
  date?: string;
  year?: string;
  issue?: string;
  icon?: string;
  kind?: ProjectKind;
  draft?: boolean;
  showStatus?: boolean;
  refs?: Ref[];
}

/** Handbook color pool — ink, crimson accent, olive, clay. */
const DISC_PALETTE = [
  "#15140f",
  "#C0392B",
  "#4a5240",
  "#8b6f5a",
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
    <div className="inline-flex flex-shrink-0">
      <div
        className={twMerge(
          STAMP_FACE,
          STAMP_CONTROL_SHADOW,
          STAMP_CONTROL_LIFT,
          "relative h-20 w-20 overflow-hidden",
        )}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
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
  refs,
}: ProjectRowProps) {
  const resolvedStatus = status ?? (ready ? "PUBLISHED" : "DRAFT");
  const dateLabel = date ?? year;
  const kindIcon = kind
    ? PROJECT_KINDS.find((k) => k.id === kind)?.icon
    : undefined;

  return (
    <Link href={`/projects/${slug}`} className="group block">
      <StampShell variant="card" interactive faceClassName="p-5">
        <div className="flex items-center gap-5">
          <Thumbnail
            title={title}
            thumbnail={thumbnail}
            issue={issue}
            icon={icon}
          />

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
            <h3 className="mt-1 font-sans font-extrabold text-xl leading-tight text-ink uppercase tracking-tight">
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
                  <span className="inline-block w-2 h-2 border-2 border-ink-faint" />
                )}
              </div>
            )}
            {refs && refs.length > 0 && (
              <div className="flex items-center gap-1.5">
                {refs.map((ref, i) => {
                  const r = resolveRef(ref);
                  return (
                    <span
                      key={i}
                      title={r.label}
                      aria-label={r.label}
                      className="inline-flex items-center justify-center w-5 h-5 border-2 border-rule text-ink-faint"
                    >
                      <i
                        className={`${r.iconFamily} ${r.icon} text-[9px]`}
                        aria-hidden="true"
                      />
                    </span>
                  );
                })}
              </div>
            )}
            {dateLabel && (
              <span className="caption-mono text-ink-faint">
                {dateLabel}
              </span>
            )}
          </div>
        </div>
      </StampShell>
    </Link>
  );
}
