import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "../data";

export function generateStaticParams() {
  // Generate pages for all projects so they're reachable when the
  // client-side "show drafts" toggle is enabled, even in production.
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] text-base-content px-6 pt-4 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-sm opacity-50 hover:opacity-80 transition-opacity"
        >
          &larr; Back
        </Link>

        <div className="mt-12">
          {!project.ready && (
            <div className="inline-block bg-black/5 text-base-content/50 text-xs font-medium uppercase tracking-wider px-3 py-1.5 rounded mb-4">
              Under construction
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-base-content/60">{project.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-base-content/50 border border-base-300 rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Demo area placeholder */}
        <div className="mt-12">
          <div
            className="w-full aspect-video rounded-lg flex items-center justify-center"
            style={{ background: project.gradient }}
          >
            <span className="text-white/80 text-sm font-medium">
              Demo goes here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
