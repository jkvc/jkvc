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
    /** Font Awesome class (sans family prefix), rendered next to the issue
     *  number on home-row cards to signal the kind at a glance. */
    icon: string;
}

export const PROJECT_KINDS: ProjectKindMeta[] = [
    { id: "playable", label: "PLAYABLE", icon: "fa-play" },
    { id: "readable", label: "READABLE", icon: "fa-book-open" },
];

export interface Project {
    title: string;
    slug: string;
    description: string;
    tags: string[];
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
}

export interface ProjectMeta {
    tags?: string[];
    status?: string;
    year?: string;
    date?: string;
    issue?: string;
    location?: string;
    /** Font Awesome class (sans family prefix) for the bucket glyph rendered
     *  next to the issue number in the recipe header. */
    kindIcon?: string;
}

/** Build an editorial meta block for a project. Issue number comes from the
 *  project's position in the canonical `projects` array (1-indexed, zero-padded). */
export function getProjectMeta(slug: string): ProjectMeta | undefined {
    const index = projects.findIndex((p) => p.slug === slug);
    if (index === -1) return undefined;
    const p = projects[index];
    const kindMeta = PROJECT_KINDS.find((k) => k.id === p.kind);
    return {
        tags: p.tags,
        status: p.status ?? (p.ready ? "PUBLISHED" : "DRAFT"),
        year: p.year,
        date: p.date,
        issue: String(index + 1).padStart(2, "0"),
        kindIcon: kindMeta?.icon,
    };
}

export const projects: Project[] = [
    {
        title: "Image Labelifier",
        slug: "text-image",
        description: "Every pixel has a name.",
        tags: ["Upload", "Segment", "Hover"],
        gradient: "linear-gradient(135deg, #A8A196 0%, #6B6860 100%)",
        thumbnail: "/thumnails/image-labelifier.jpg",
        ready: true,
        kind: "playable",
        year: "2025",
        date: "2025-10-01",
        status: "PUBLISHED",
        icon: "fa-tags",
    },
    {
        title: "Image Reconstructor",
        slug: "image-reconstructor",
        description: "Photos are built from scratch",
        tags: ["Vision", "Image-to-Image", "Video"],
        gradient: "linear-gradient(135deg, #B8C6DB 0%, #6B7B8D 100%)",
        ready: false,
        kind: "playable",
        year: "2025",
        date: "2025-11-01",
        status: "DRAFT",
        icon: "fa-images",
    },
    {
        title: "Magic Crankie",
        slug: "magic-crankie",
        description: "A never-ending scroll through a state machine",
        tags: ["Animation", "State Machine", "Canvas"],
        gradient: "linear-gradient(135deg, #E8B4B8 0%, #7B6B8D 100%)",
        ready: false,
        kind: "playable",
        year: "2025",
        date: "2025-12-01",
        status: "DRAFT",
        icon: "fa-infinity",
    },
    {
        title: "Image Mixer",
        slug: "image-mixer",
        description: "Drop ingredients into the bowl and see what comes out",
        tags: ["Physics", "Canvas", "Image-to-Image"],
        gradient: "linear-gradient(135deg, #C4B5A0 0%, #8A7B6B 100%)",
        ready: false,
        kind: "playable",
        year: "2026",
        date: "2026-01-01",
        status: "DRAFT",
        icon: "fa-blender",
    },
    {
        title: "Getting turn-based LLMs to work in the real world",
        slug: "turn-based-llms-non-turn-based-world",
        description: "And the real world is not turn-based.",
        tags: ["LLMs", "Interaction", "Agents"],
        gradient: "linear-gradient(135deg, #D4CFC2 0%, #8B6F5A 100%)",
        ready: false,
        kind: "readable",
        year: "2026",
        date: "2026-04-19",
        status: "DRAFT",
        icon: "fa-comments",
    },
];
