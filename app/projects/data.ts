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
];
