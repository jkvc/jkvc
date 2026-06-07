/** Two buckets for everything on the home page:
 *   - `playable` → interactive experiments (canvas, physics, inference UIs)
 *   - `readable` → blog posts / essays
 *
 *  This is the single source of truth for the filter pill row. To add a new
 *  kind, add an entry to PROJECT_KINDS below and the home page filter will
 *  pick it up automatically. */
export type ProjectKind = "playable" | "readable";

export interface ProjectKindMeta {
    id: ProjectKind;
    /** All-caps display label shown in the filter pill row. */
    label: string;
    /** Font Awesome class (sans family prefix), shown on masonry card kind stamps. */
    icon: string;
}

export const PROJECT_KINDS: ProjectKindMeta[] = [
    { id: "playable", label: "PLAYABLE", icon: "fa-flask" },
    { id: "readable", label: "READABLE", icon: "fa-file-lines" },
];

export function getProjectKindMeta(kind: ProjectKind): ProjectKindMeta {
    const meta = PROJECT_KINDS.find((k) => k.id === kind);
    if (!meta) {
        throw new Error(`Unknown project kind: ${kind}`);
    }
    return meta;
}

/** Typed external reference attached to a project (e.g. its source repo).
 *  `kind` selects both the icon/family and the default human-readable label
 *  via the `REF_KINDS` registry. The label can still be overridden per entry. */
export type RefKind = "code" | "skills";

export interface RefKindMeta {
    id: RefKind;
    /** Default visible label shown inside the pill (e.g. "code", "skills"). */
    label: string;
    /** Font Awesome class (sans family prefix). */
    icon: string;
    iconFamily: "fa-solid" | "fa-regular" | "fa-brands";
}

export const REF_KINDS: RefKindMeta[] = [
    { id: "code", label: "code", icon: "fa-github", iconFamily: "fa-brands" },
    { id: "skills", label: "skills", icon: "fa-github", iconFamily: "fa-brands" },
];

export interface Ref {
    kind: RefKind;
    url: string;
    /** Optional override for the default kind label. */
    label?: string;
}

export interface ResolvedRef {
    icon: string;
    iconFamily: "fa-solid" | "fa-regular" | "fa-brands";
    label: string;
    url: string;
}

export function resolveRef(ref: Ref): ResolvedRef {
    const meta = REF_KINDS.find((k) => k.id === ref.kind);
    if (!meta) {
        throw new Error(`Unknown ref kind: ${ref.kind}`);
    }
    return {
        icon: meta.icon,
        iconFamily: meta.iconFamily,
        label: ref.label ?? meta.label,
        url: ref.url,
    };
}

export interface Project {
    title: string;
    slug: string;
    description: string;
    gradient: string;
    thumbnail?: string;
    ready: boolean;
    /** Bucket on the home page filter. Required so new entries can't forget
     *  to classify themselves. */
    kind: ProjectKind;
    year?: string;
    /** ISO calendar date (YYYY-MM-DD). Day resolution is semi-arbitrary —
     *  month/year is what's meaningful. Falls back to `year` when absent. */
    date?: string;
    /** Short editorial status label. Falls back to PUBLISHED / DRAFT. */
    status?: string;
    /** Font Awesome icon class (sans family prefix), used in the placeholder
     *  disc when no `thumbnail` is provided. E.g. "fa-blender". Defaults to
     *  a neutral asterisk. */
    icon?: string;
    /** Optional list of typed external references (repo links, etc.). Rendered
     *  as small circular indicators on home rows and clickable pills under
     *  the title on the project detail page. */
    refs?: Ref[];
}

export interface ProjectMeta {
    status?: string;
    year?: string;
    date?: string;
    issue?: string;
    location?: string;
    /** Font Awesome class (sans family prefix) for the bucket glyph rendered
     *  next to the issue number in the recipe header. */
    kindIcon?: string;
    refs?: Ref[];
}

/** Build an editorial meta block for a project. Issue number comes from the
 *  project's position in the canonical `projects` array (1-indexed, zero-padded). */
export function getProjectMeta(slug: string): ProjectMeta | undefined {
    const index = projects.findIndex((p) => p.slug === slug);
    if (index === -1) return undefined;
    const p = projects[index];
    const kindMeta = PROJECT_KINDS.find((k) => k.id === p.kind);
    return {
        status: p.status ?? (p.ready ? "PUBLISHED" : "DRAFT"),
        year: p.year,
        date: p.date,
        issue: String(index + 1).padStart(2, "0"),
        kindIcon: kindMeta?.icon,
        refs: p.refs,
    };
}

export const projects: Project[] = [
    {
        title: "Image Labelifier",
        slug: "image-labelifier",
        description: "Every pixel has a name.",
        gradient: "linear-gradient(135deg, #A8A196 0%, #6B6860 100%)",
        thumbnail: "/thumnails/image-labelifier.jpg",
        ready: true,
        kind: "playable",
        year: "2025",
        date: "2025-10-01",
        status: "PUBLISHED",
        icon: "fa-tags",
        refs: [
            {
                kind: "code",
                url: "https://github.com/jkvc/jkvc/tree/main/app/projects/image-labelifier",
            },
        ],
    },
    {
        title: "Magic Crankie",
        slug: "magic-crankie",
        description: "A never-ending scroll through a state machine",
        gradient: "linear-gradient(135deg, #E8B4B8 0%, #7B6B8D 100%)",
        ready: false,
        kind: "playable",
        year: "2025",
        date: "2025-12-01",
        status: "DRAFT",
        icon: "fa-infinity",
    },
    {
        title: "Getting turn-based LLMs to work \nin the real world",
        slug: "turn-based-llms-non-turn-based-world",
        description: "(Un)fortunately, the real world is not turn-based.",
        gradient: "linear-gradient(135deg, #D4CFC2 0%, #8B6F5A 100%)",
        thumbnail:
            "/post-assets/turn-based-llms-non-turn-based-world/llm-vending-machine-thumbnail.webp",
        ready: true,
        kind: "readable",
        year: "2026",
        date: "2026-04-19",
        status: "PUBLISHED",
        icon: "fa-comments",
    },
    {
        title: "Vibe-code hangover",
        slug: "vibe-code-hangover",
        description: "And a cure perhaps.",
        gradient: "linear-gradient(135deg, #C8D2BE 0%, #6E7E63 100%)",
        thumbnail: "/post-assets/vibe-code-hangover/wine-glass.webp",
        ready: true,
        kind: "readable",
        year: "2026",
        date: "2026-04-25",
        status: "PUBLISHED",
        icon: "fa-beer-mug-empty",
        refs: [
            { kind: "skills", url: "https://github.com/jkvc/jkvc-skills" },
        ],
    },
    {
        title: "Image Reconstructor",
        slug: "image-reconstructor",
        description: "Photos are built from scratch",
        gradient: "linear-gradient(135deg, #B8C6DB 0%, #6B7B8D 100%)",
        thumbnail: "/thumnails/image-reconstructor.webp",
        ready: true,
        kind: "playable",
        year: "2026",
        date: "2026-04-29",
        status: "PUBLISHED",
        icon: "fa-images",
        refs: [
            {
                kind: "code",
                url: "https://github.com/jkvc/jkvc/tree/main/app/projects/image-reconstructor",
            },
        ],
    },
    {
        title: "Photo Commentator",
        slug: "photo-commentator",
        description: "Every corner has something to say.",
        gradient: "linear-gradient(135deg, #2A2D3A 0%, #C84B5C 100%)",
        thumbnail: "/thumnails/photo-commentator.webp",
        ready: true,
        kind: "playable",
        year: "2026",
        date: "2026-05-06",
        status: "PUBLISHED",
        icon: "fa-comment-dots",
        refs: [
            {
                kind: "code",
                url: "https://github.com/jkvc/jkvc/tree/main/app/projects/photo-commentator",
            },
        ],
    },
];
