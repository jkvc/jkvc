import Link from "next/link";
import StampShell from "@/app/components/ui/StampShell";
import {
    PROJECT_KINDS,
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
    const kindIcon = kind
        ? PROJECT_KINDS.find((k) => k.id === kind)?.icon
        : undefined;
    const paletteIndex = issue
        ? (parseInt(issue, 10) - 1 + DISC_PALETTE.length) % DISC_PALETTE.length
        : 0;
    const discColor = DISC_PALETTE[paletteIndex];
    const iconClass = icon ?? "fa-asterisk";

    return (
        <Link href={`/projects/${slug}`} className="group block break-inside-avoid mb-4">
            <StampShell variant="card" interactive bleed={false} faceClassName="overflow-hidden">
                <div className="overflow-hidden border-b-2 border-ink bg-surface-2">
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

                <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
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
                        <div className="flex flex-shrink-0 items-center gap-2">
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
                            {dateLabel && (
                                <span className="caption-mono text-ink-faint">{dateLabel}</span>
                            )}
                        </div>
                    </div>

                    <h3 className="mt-2 font-sans text-base font-extrabold uppercase leading-tight tracking-tight text-ink">
                        {title}
                    </h3>
                    <p className="mt-1.5 whitespace-pre-line text-[12px] leading-relaxed text-ink-muted">
                        {description}
                    </p>

                    {refs && refs.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5">
                            {refs.map((ref, i) => {
                                const r = resolveRef(ref);
                                return (
                                    <span
                                        key={i}
                                        title={r.label}
                                        aria-label={r.label}
                                        className="inline-flex h-5 w-5 items-center justify-center border-2 border-rule text-ink-faint"
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
                </div>
            </StampShell>
        </Link>
    );
}
