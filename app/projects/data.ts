export interface Project {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  thumbnail?: string;
  ready: boolean;
  year?: string;
  /** Full month+year label (e.g. "OCT 2025"). Falls back to `year` when absent. */
  date?: string;
  /** Short editorial status label. Falls back to READY / DRAFT. */
  status?: string;
}

export interface ProjectMeta {
  tags?: string[];
  status?: string;
  year?: string;
  date?: string;
  issue?: string;
  location?: string;
}

/** Build an editorial meta block for a project. Issue number comes from the
 *  project's position in the canonical `projects` array (1-indexed, zero-padded). */
export function getProjectMeta(slug: string): ProjectMeta | undefined {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return undefined;
  const p = projects[index];
  return {
    tags: p.tags,
    status: p.status ?? (p.ready ? "READY" : "DRAFT"),
    year: p.year,
    date: p.date,
    issue: String(index + 1).padStart(2, "0"),
  };
}

export const projects: Project[] = [
  {
    title: "Image Labelifier",
    slug: "text-image",
    description: "Every pixel has a name",
    tags: ["Segmentation", "Canvas", "Parallax"],
    gradient: "linear-gradient(135deg, #A8A196 0%, #6B6860 100%)",
    thumbnail: "/thumnails/image-labelifier.jpg",
    ready: true,
    year: "2025",
    date: "OCT 2025",
    status: "READY",
  },
  {
    title: "Image Reconstructor",
    slug: "image-reconstructor",
    description: "Photos are built from scratch",
    tags: ["Vision", "Image-to-Image", "Video"],
    gradient: "linear-gradient(135deg, #B8C6DB 0%, #6B7B8D 100%)",
    ready: false,
    year: "2025",
    date: "NOV 2025",
    status: "IN PROGRESS",
  },
  {
    title: "Magic Crankie",
    slug: "magic-crankie",
    description: "A never-ending scroll through a state machine",
    tags: ["Animation", "State Machine", "Canvas"],
    gradient: "linear-gradient(135deg, #E8B4B8 0%, #7B6B8D 100%)",
    ready: false,
    year: "2025",
    date: "DEC 2025",
    status: "DRAFT",
  },
  {
    title: "Image Mixer",
    slug: "image-mixer",
    description: "Drop ingredients into the bowl and see what comes out",
    tags: ["Physics", "Canvas", "Image-to-Image"],
    gradient: "linear-gradient(135deg, #C4B5A0 0%, #8A7B6B 100%)",
    ready: false,
    year: "2026",
    date: "JAN 2026",
    status: "DRAFT",
  },
];
