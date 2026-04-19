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
  tagline: "AI Interaction engineer, human enthusiast.",
  /** Meta-description / social preview copy for the root. */
  description:
    "Diffusion, LLMs, and interaction — prototypes, essays, experiments.",
  /** Canonical origin without trailing slash. */
  url: "https://jkvc.com",
  /** Where I work / live, uppercase mono. */
  location: "SEATTLE / PARIS",
  /** Year the site was established. */
  est: "2022",
  email: "kevinehc@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/jkvc",
    github: "https://github.com/jkvc",
    scholar: "https://scholar.google.com/citations?user=eg-CJG0AAAAJ",
  },
  about: {
    /** Shared by the About page hero and its `<meta name="description">`. */
    description:
      "Working at the intersection of creativity, models, and algorithms — diffusion, LLMs, and the interactions they make possible.",
  },
} as const;
