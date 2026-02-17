import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import ImageReconstructorClient from "./ImageReconstructorClient";
import { projects } from "../data";

const project = projects.find((p) => p.slug === "image-reconstructor")!;

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function ImageReconstructorPage() {
  return (
    <div className="min-h-screen bg-surface text-text px-6 pt-20 pb-20 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Title & subtitle */}
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
            <ImageReconstructorClient />
          </Suspense>
        </div>

        {/* Back to home */}
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
