import { notFound } from "next/navigation";
import { projects } from "../data";
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

  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      headerAddon={
        !project.ready ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 text-gold text-[10px] uppercase tracking-wider px-3 py-1 mb-3">
            <i className="fa-solid fa-hammer text-[8px]" />
            <span>Under construction</span>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] text-text-faint border border-border rounded-full px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Demo area placeholder */}
      <div className="mt-12">
        <div className="w-full aspect-video rounded-2xl border border-dashed border-border-dashed flex items-center justify-center">
          <span className="text-text-faint text-[13px]">
            Coming soon
          </span>
        </div>
      </div>
    </ProjectPageFrame>
  );
}
