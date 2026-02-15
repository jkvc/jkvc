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
    title: "Interactive Denoising Visualizer",
    slug: "denoising-visualizer",
    description:
      "Step through reverse diffusion in real time. Control the noise schedule and watch images emerge.",
    tags: ["DDPM", "WebGL"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ready: false,
  },
  {
    title: "Guided Inpainting Canvas",
    slug: "inpainting-canvas",
    description:
      "Paint masks on images and guide diffusion to fill regions with text prompts.",
    tags: ["Inpainting", "Streaming"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    ready: false,
  },
  {
    title: "Latent Space Explorer",
    slug: "latent-space-explorer",
    description:
      "Navigate latent space. Interpolate between points and discover clusters.",
    tags: ["Latent Space", "3D"],
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    ready: false,
  },
  {
    title: "ControlNet Pose Playground",
    slug: "controlnet-pose",
    description:
      "Manipulate a 3D skeleton and generate matching images in real time.",
    tags: ["ControlNet", "Pose"],
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    ready: false,
  },
  {
    title: "Sampling Algorithm Comparison",
    slug: "sampling-comparison",
    description:
      "Side-by-side comparison of DDPM, DDIM, DPM-Solver and other samplers.",
    tags: ["Sampling", "Education"],
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ready: false,
  },
  {
    title: "Attention Map Visualizer",
    slug: "attention-maps",
    description:
      "Overlay cross-attention maps on generated images at each denoising step.",
    tags: ["Attention", "Interpretability"],
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    ready: false,
  },
];
