/**
 * Canonical site copy and identity. Every string referenced more than once —
 * in metadata, components, or OG images — should live here. If a value is
 * truly local to one file (e.g. a hero's JSX-formatted title), keep it inline.
 */
export const SITE = {
    /** Short brand / wordmark. */
    name: "jkvc",
    /** Full legal / display name. */
    fullName: "Junshen Kevin Chen",
    /** Short one-liner for the home hero. */
    tagline: "This is an experimental ~~AI~~ human that can occasionally make mistakes. \nAlways verify important information.",
    /** Meta-description / social preview copy for the root. */
    description:
        "A personal website. Somewhere in here is a mix of ML modeling, inference systems, interaction engineering, generative art.",
    /** Top-line categories — rendered uppercase + dot-joined in the OG masthead.
     *  Kept as an explicit list (not derived from `description`) so reworking
     *  the description prose doesn't silently break the OG card. */
    keywords: ["ML modeling", "inference", "interaction", "generative art"] as const,
    /** Canonical origin without trailing slash. */
    url: "https://jkvc.ai",
    /** Where I work / live, uppercase mono. */
    location: "SEATTLE & LILLE",
    /** Year the site was established. */
    est: "2022",
    email: "kevinehc@gmail.com",
    social: {
        linkedin: "https://www.linkedin.com/in/jkvc",
        github: "https://github.com/jkvc",
        scholar: "https://scholar.google.com/citations?user=eg-CJG0AAAAJ",
    },
} as const;
