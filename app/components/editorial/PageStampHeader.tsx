import StampShell from "@/app/components/ui/StampShell";
import KindStamp from "@/app/components/editorial/KindStamp";
import { twMerge } from "tailwind-merge";

export interface PageStampMeta {
    /** Uppercase eyebrow label (e.g. PLAYABLE, ABOUT). */
    eyebrow: string;
    icon?: string;
    date?: string;
    year?: string;
    location?: string;
}

interface PageStampHeaderProps {
    meta: PageStampMeta;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    /** Replaces default title/subtitle block when provided (e.g. About hero). */
    children?: React.ReactNode;
    /** Row below subtitle — ref pills, actions, etc. */
    trailing?: React.ReactNode;
    className?: string;
    faceClassName?: string;
}

function formatMetaTrailing(meta: PageStampMeta): string | null {
    const parts: string[] = [];
    const dateLabel = meta.date ?? meta.year;
    if (dateLabel) parts.push(dateLabel);
    if (meta.location) parts.push(meta.location.toUpperCase());
    return parts.length > 0 ? parts.join("  ·  ") : null;
}

export default function PageStampHeader({
    meta,
    title,
    subtitle,
    children,
    trailing,
    className,
    faceClassName,
}: PageStampHeaderProps) {
    const metaTrailing = formatMetaTrailing(meta);

    return (
        <StampShell
            variant="card"
            bleed={false}
            className={className}
            faceClassName={twMerge("p-6 sm:p-8", faceClassName)}
        >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <KindStamp label={meta.eyebrow} icon={meta.icon} />
                {metaTrailing && (
                    <span className="caption-mono shrink-0 text-right text-ink-faint">
                        {metaTrailing}
                    </span>
                )}
            </div>

            {children ?? (
                <>
                    {title && (
                        <h1 className="font-sans text-4xl font-black uppercase leading-[1.05] tracking-tight text-ink sm:text-5xl">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
                            {subtitle}
                        </p>
                    )}
                </>
            )}

            {trailing && <div className="mt-4">{trailing}</div>}
        </StampShell>
    );
}
