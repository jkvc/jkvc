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
];
