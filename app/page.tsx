"use client";

import { useEffect, useRef, useState } from "react";
import ProjectCard from "./components/ProjectCard";

const projects = [
  {
    title: "Interactive Denoising Visualizer",
    description:
      "Step through reverse diffusion in real time. Control the noise schedule and watch images emerge.",
    tags: ["DDPM", "WebGL"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "Guided Inpainting Canvas",
    description:
      "Paint masks on images and guide diffusion to fill regions with text prompts.",
    tags: ["Inpainting", "Streaming"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "Latent Space Explorer",
    description:
      "Navigate latent space. Interpolate between points and discover clusters.",
    tags: ["Latent Space", "3D"],
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    title: "ControlNet Pose Playground",
    description:
      "Manipulate a 3D skeleton and generate matching images in real time.",
    tags: ["ControlNet", "Pose"],
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    title: "Sampling Algorithm Comparison",
    description:
      "Side-by-side comparison of DDPM, DDIM, DPM-Solver and other samplers.",
    tags: ["Sampling", "Education"],
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    title: "Attention Map Visualizer",
    description:
      "Overlay cross-attention maps on generated images at each denoising step.",
    tags: ["Attention", "Interpretability"],
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-base-content px-6 pt-4 pb-16 sm:px-8">
      {/* Scroll-triggered navbar */}
      <div
        className={`sticky top-0 z-10 flex items-center justify-center py-3 transition-all duration-200 ${
          scrolled ? "bg-[#FCFCFC]" : ""
        }`}
      >
        <span
          className={`font-semibold text-sm tracking-wide transition-opacity duration-200 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          jkvc
        </span>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <section className="mt-24 mb-8 text-center">
          <h1 ref={heroRef} className="text-4xl font-bold tracking-tight">
            jkvc
          </h1>
          <p className="mt-4 text-base-content/60 text-lg">
            Diffusion models, novel interfaces.
          </p>
        </section>

        {/* Projects */}
        <section id="projects" className="mt-16">
          <h2 className="text-xs font-medium uppercase tracking-widest text-base-content/40 mb-6">
            Projects
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mt-16 max-w-sm mx-auto">
          <h2 className="text-xs font-medium uppercase tracking-widest text-base-content/40 mb-4">
            About
          </h2>
          <p className="text-sm text-base-content/70 leading-relaxed">
            I work on diffusion model inference algorithms and build interactive
            experiences that make generative AI more understandable and
            controllable.
          </p>
        </section>

        {/* Contact */}
        <footer className="mt-16 text-center">
          <div className="flex justify-center gap-6">
            <a
              href="https://github.com/jkvc"
              className="opacity-50 hover:opacity-80 transition-opacity text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://twitter.com/jkvc"
              className="opacity-50 hover:opacity-80 transition-opacity text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="mailto:placeholder@example.com"
              className="opacity-50 hover:opacity-80 transition-opacity text-sm"
            >
              Email
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
