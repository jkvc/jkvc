import Link from "next/link";
import StampShell from "@/app/components/ui/StampShell";
import KindStamp from "@/app/components/editorial/KindStamp";
import {
    getProjectKindMeta,
    resolveRef,
    type ProjectKind,
    type Ref,
} from "@/app/projects/data";

interface ProjectMasonryCardProps {
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
    kind: ProjectKind;
    draft?: boolean;
    showStatus?: boolean;
    refs?: Ref[];
}

/** Shared footer meta — icon and date sit on the same bottom edge. */
const FOOTER_META =
    "text-[11px] leading-[11px] text-ink-faint";

/** Handbook color pool — ink, crimson accent, olive, clay. */
const DISC_PALETTE = [
    "#15140f",
    "#C0392B",
    "#4a5240",
    "#8b6f5a",
];

export default function ProjectMasonryCard({
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
}: ProjectMasonryCardProps) {
    const resolvedStatus = status ?? (ready ? "PUBLISHED" : "DRAFT");
    const dateLabel = date ?? year;
    const kindMeta = getProjectKindMeta(kind);
    const paletteIndex = issue
        ? (parseInt(issue, 10) - 1 + DISC_PALETTE.length) % DISC_PALETTE.length
        : 0;
    const discColor = DISC_PALETTE[paletteIndex];
    const iconClass = icon ?? "fa-asterisk";

    return (
        <Link href={`/projects/${slug}`} className="group block break-inside-avoid mb-4">
            <StampShell variant="card" interactive bleed={false} faceClassName="overflow-hidden">
                <div className="relative overflow-hidden border-b-2 border-ink bg-surface-2">
                    <KindStamp
                        label={kindMeta.label}
                        icon={kindMeta.icon}
                        className="absolute bottom-2 right-2 z-10"
                    />
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="block h-auto w-full"
                        />
                    ) : (
                        <div
                            className="flex aspect-[4/3] items-center justify-center text-surface/90"
                            style={{ backgroundColor: discColor }}
                        >
                            <i
                                className={`fa-solid ${iconClass} text-4xl`}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col p-4">
                    <h3 className="font-sans text-base font-extrabold uppercase leading-tight tracking-tight text-ink">
                        {title}
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                        {description}
                    </p>

                    {(showStatus || (refs && refs.length > 0) || dateLabel) && (
                        <div className="mt-3 flex min-h-[11px] items-end justify-between gap-3">
                            <div className="flex min-w-0 items-end gap-2">
                                {refs && refs.length > 0 &&
                                    refs.map((ref, i) => {
                                        const r = resolveRef(ref);
                                        return (
                                            <span
                                                key={i}
                                                title={r.label}
                                                aria-label={r.label}
                                                className={`inline-flex h-[11px] items-end ${FOOTER_META}`}
                                            >
                                                <i
                                                    className={`${r.iconFamily} ${r.icon} ${FOOTER_META}`}
                                                    aria-hidden="true"
                                                />
                                            </span>
                                        );
                                    })}
                                {showStatus && (
                                    <>
                                        {draft ? (
                                            <>
                                                <span className="caption-mono text-ink-faint">
                                                    {resolvedStatus}
                                                </span>
                                                <span className="inline-flex h-3.5 w-3.5 items-center justify-center text-[9px] text-hot">
                                                    <i className="fa-solid fa-hammer" />
                                                </span>
                                            </>
                                        ) : ready ? (
                                            <span
                                                className="inline-flex h-3.5 w-3.5 items-center justify-center text-[9px] text-hot"
                                                title="Published"
                                            >
                                                <i className="fa-solid fa-stamp" />
                                            </span>
                                        ) : (
                                            <span className="inline-block h-2 w-2 border-2 border-ink-faint" />
                                        )}
                                    </>
                                )}
                            </div>
                            {dateLabel && (
                                <span
                                    className={`shrink-0 font-mono font-normal uppercase tracking-wider ${FOOTER_META}`}
                                >
                                    {dateLabel}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </StampShell>
        </Link>
    );
}
