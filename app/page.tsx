"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import ProjectCard from "./components/ProjectCard";
import IconCircleButton from "./components/ui/IconCircleButton";
import { projects } from "./projects/data";

const STORAGE_KEY = "jkvc:show-drafts";

function subscribeToStorage(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

const IS_DEV = process.env.NODE_ENV === "development";

function getShowDrafts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "1";
    return IS_DEV;
  } catch {
    return IS_DEV;
  }
}

function getShowDraftsServer() {
  return false;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
  const [, forceRender] = useState(0);
  const heroRef = useRef<HTMLHeadingElement>(null);

  const toggleDrafts = useCallback(() => {
    try {
      const next = !getShowDrafts();
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // localStorage unavailable
    }
    forceRender((n) => n + 1);
  }, []);

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
          <h1 ref={heroRef} className="font-serif text-4xl tracking-tight text-text-heading">
            jkvc
          </h1>
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

        {/* Footer: wip toggle + github */}
        <footer className="mt-16 flex justify-center gap-3">
          <IconCircleButton
            onClick={toggleDrafts}
            icon={showDrafts ? "fa-eye" : "fa-eye-slash"}
            title={showDrafts ? "Hide drafts" : "Show drafts"}
            size="md"
            active={showDrafts}
            iconClassName="text-[13px]"
          />
          <IconCircleButton
            href="https://github.com/jkvc"
            icon="fa-github"
            iconFamily="fa-brands"
            title="GitHub"
            size="md"
            iconClassName="text-[14px]"
          />
        </footer>
      </div>
    </div>
  );
}
