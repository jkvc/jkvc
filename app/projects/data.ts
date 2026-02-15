export interface Project {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  gradient: string;
  ready: boolean;
}

export const projects: Project[] = [
  {
    title: "Text Image Canvas",
    slug: "text-image",
    description:
      "Upload an image and watch it transform into parallax text art. Each detected region becomes its label rendered in its dominant color.",
    tags: ["Segmentation", "Canvas", "Parallax"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ready: false,
  },
];
