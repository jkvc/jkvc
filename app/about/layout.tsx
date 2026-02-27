import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Junshen Kevin Chen",
  description: "Working at the intersection of creativity, models, and algorithms. Research in VLM planning, diffusion model inference, and computer vision.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
