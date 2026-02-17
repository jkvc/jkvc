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
      "Every pixel has a name.\nWatch the image dissolve into words.",
    tags: ["Segmentation", "Canvas", "Parallax"],
    gradient: "linear-gradient(135deg, #A8A196 0%, #6B6860 100%)",
    thumbnail: "/thumnails/image-labelifier.jpg",
    ready: true,
  },
  {
    title: "Color Animate",
    slug: "color-animate",
    description:
      "Watch color drain away.\nThen flow back to life.",
    tags: ["Vision", "Animation", "Replicate"],
    gradient: "linear-gradient(135deg, #E8B4B8 0%, #9B6B6E 100%)",
    ready: false,
  },
];
