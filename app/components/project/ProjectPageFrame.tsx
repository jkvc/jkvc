import Pill from "@/app/components/editorial/Pill";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import StampShell from "@/app/components/ui/StampShell";
import {
    getProjectKindMeta,
    resolveRef,
    type ProjectKind,
    type Ref,
} from "@/app/projects/data";

const DRAFT_BADGE: Record<ProjectKind, { icon: string; label: string }> = {
    playable: { icon: "fa-hammer", label: "Under construction" },
    readable: { icon: "fa-pen-nib", label: "Draft" },
};

interface PageMeta {
    date?: string;
    year?: string;
    location?: string;
}

interface Props {
    title: string;
    description: string;
    meta?: PageMeta;
    draft?: boolean;
    kind?: ProjectKind;
    headerAddon?: React.ReactNode;
    refs?: Ref[];
    children: React.ReactNode;
    contentTopClassName?: string;
}

export default function ProjectPageFrame({
    title,
    description,
    meta,
    draft,
    kind,
    headerAddon,
    refs,
    children,
    contentTopClassName = "mt-12",
}: Props) {
    const badge = draft ? DRAFT_BADGE[kind ?? "playable"] : null;
    const kindMeta = kind ? getProjectKindMeta(kind) : null;

    return (
        <InteriorPageShell>
            {headerAddon}
            {badge && (
                <StampShell
                    variant="control"
                    inline
                    bleed={false}
                    className="mb-3"
                    faceClassName="caption-mono items-center gap-1.5 px-3 py-1 text-hot"
                >
                    <i className={`fa-solid ${badge.icon} text-[8px]`} />
                    <span>{badge.label}</span>
                </StampShell>
            )}
            {kindMeta && (
                <PageStampHeader
                    meta={{
                        eyebrow: kindMeta.label,
                        icon: kindMeta.icon,
                        date: meta?.date,
                        year: meta?.year,
                        location: meta?.location,
                    }}
                    title={title}
                    subtitle={description}
                    trailing={
                        refs && refs.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                {refs.map((ref, i) => {
                                    const r = resolveRef(ref);
                                    return (
                                        <Pill
                                            key={i}
                                            href={r.url}
                                            icon={r.icon}
                                            iconFamily={r.iconFamily}
                                            title={r.url}
                                        >
                                            {r.label}
                                        </Pill>
                                    );
                                })}
                            </div>
                        ) : undefined
                    }
                />
            )}

            <div className={contentTopClassName}>{children}</div>
        </InteriorPageShell>
    );
}
