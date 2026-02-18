import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import MagicCrankieClient from "./MagicCrankieClient";
import { projects } from "../data";

const project = projects.find((p) => p.slug === "magic-crankie")!;

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function MagicCrankiePage() {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-20 pb-20 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-text-heading">
            {project.title}
          </h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
            {project.description}
          </p>
        </div>

        <div className="mt-10">
          <Suspense>
            <MagicCrankieClient />
          </Suspense>
        </div>

        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-border text-[#AAA] hover:border-gold/50 hover:text-gold transition-all"
            title="Home"
          >
            <i className="fa-solid fa-house text-[13px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
