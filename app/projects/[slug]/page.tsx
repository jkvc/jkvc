import { notFound } from "next/navigation";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

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

  const meta = getProjectMeta(slug);

  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      headerAddon={
        !project.ready ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-hot/40 text-hot text-[10px] uppercase tracking-[0.22em] font-mono px-3 py-1 mb-3">
            <i className="fa-solid fa-hammer text-[8px]" />
            <span>Under construction</span>
          </div>
        ) : undefined
      }
    >
      {/* Demo area placeholder */}
      <div className="mt-4">
        <div className="w-full aspect-video rounded-2xl border border-dashed border-rule flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            Coming soon
          </span>
        </div>
      </div>
    </ProjectPageFrame>
  );
}
