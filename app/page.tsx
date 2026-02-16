"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";
import ProjectCard from "./components/ProjectCard";
import { projects } from "./projects/data";

const STORAGE_KEY = "jkvc:show-drafts";

function subscribeToStorage(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getShowDrafts() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
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
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xs font-medium uppercase tracking-widest text-base-content/40">
              Projects
            </h2>
            <button
              onClick={toggleDrafts}
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                showDrafts
                  ? "border-base-content/30 text-base-content/60 bg-base-content/5"
                  : "border-transparent text-base-content/20 hover:text-base-content/40 hover:border-base-content/15"
              }`}
              title={showDrafts ? "Hide work-in-progress projects" : "Show work-in-progress projects"}
            >
              {showDrafts ? "wip on" : "wip"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
