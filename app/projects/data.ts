export interface Project {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  thumbnail?: string;
  ready: boolean;
}

export const projects: Project[] = [
  {
    title: "Image Labelifier",
    slug: "text-image",
    description:
      "Every pixel has a name",
    tags: ["Segmentation", "Canvas", "Parallax"],
    gradient: "linear-gradient(135deg, #A8A196 0%, #6B6860 100%)",
    thumbnail: "/thumnails/image-labelifier.jpg",
    ready: true,
  },
  {
    title: "Image Reconstructor",
    slug: "image-reconstructor",
    description:
      "Photos are built from scratch",
    tags: ["Vision", "Image-to-Image", "Video"],
    gradient: "linear-gradient(135deg, #B8C6DB 0%, #6B7B8D 100%)",
    ready: false,
  },
  {
    title: "Magic Crankie",
    slug: "magic-crankie",
    description: "A never-ending scroll through a state machine",
    tags: ["Animation", "State Machine", "Canvas"],
    gradient: "linear-gradient(135deg, #E8B4B8 0%, #7B6B8D 100%)",
    ready: false,
  },
  {
    title: "Image Mixer",
    slug: "image-mixer",
    description: "Drop ingredients into the bowl and see what comes out",
    tags: ["Physics", "Canvas", "Image-to-Image"],
    gradient: "linear-gradient(135deg, #C4B5A0 0%, #8A7B6B 100%)",
    ready: false,
  },
];
