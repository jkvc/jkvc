"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import ProjectCard from "./components/ProjectCard";
import BottomBar, { getShowDrafts, subscribeToStorage } from "./components/BottomBar";
import IconCircleButton from "./components/ui/IconCircleButton";
import { projects } from "./projects/data";

function getShowDraftsServer() {
  return false;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
  const heroRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const visible = projects.filter((p) => showDrafts || p.ready);

  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-4 pb-16 sm:px-8">
      {/* Scroll-triggered navbar */}
      <div
        className={`sticky top-0 z-10 flex items-center justify-center py-3 transition-all duration-200 ${
          scrolled ? "bg-surface" : ""
        }`}
      >
        <span
          className={`font-serif text-sm tracking-wide transition-opacity duration-200 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          jkvc
        </span>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <section className="mt-24 mb-8">
          <div className="flex items-center gap-3">
            <h1 ref={heroRef} className="font-serif text-4xl tracking-tight text-text-heading">
              jkvc
            </h1>
            <IconCircleButton href="/about" icon="fa-user" title="About" size="sm" />
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-text-muted">
            A human enthusiast.
          </p>
        </section>

        {/* Projects */}
        <section className="mt-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {visible.map((project) => (
              <ProjectCard
                key={project.slug}
                {...project}
                draft={showDrafts && !project.ready}
              />
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-16">
          <p className="text-[13px] text-text-muted leading-relaxed">
            I work on diffusion model inference algorithms and build interactive
            experiences that make generative AI more understandable and
            controllable.
          </p>
        </section>

        <BottomBar showDraftToggle />
      </div>
    </div>
  );
}
