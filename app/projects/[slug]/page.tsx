import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "../data";

export function generateStaticParams() {
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
    <div className="min-h-screen bg-surface text-text px-6 pt-20 pb-20 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div>
          {!project.ready && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 text-gold text-[10px] uppercase tracking-wider px-3 py-1 mb-3">
              <i className="fa-solid fa-hammer text-[8px]" />
              <span>Under construction</span>
            </div>
          )}
          <h1 className="font-serif text-3xl tracking-tight text-text-heading">
            {project.title}
          </h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-text-muted">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-text-faint border border-border rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Demo area placeholder */}
        <div className="mt-12">
          <div className="w-full aspect-video rounded-2xl border border-dashed border-border-dashed flex items-center justify-center">
            <span className="text-text-faint text-[13px]">
              Coming soon
            </span>
          </div>
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
