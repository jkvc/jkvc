import { notFound } from "next/navigation";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";
import PostBody from "@/app/components/post/PostBody";
import { readPostSource } from "@/app/lib/posts";

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

  // Readable entries render from `posts/<slug>.mdx`. Playable entries
  // without a dedicated `app/projects/<slug>/page.tsx` route fall through
  // to the generic "Coming soon" placeholder.
  const postSource =
    project.kind === "readable" ? await readPostSource(slug) : null;

  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      draft={!project.ready}
      kind={project.kind}
      refs={project.refs}
    >
      {postSource ? (
        <PostBody source={postSource} />
      ) : (
        <div className="mt-4">
          <div className="w-full aspect-video rounded-2xl border border-dashed border-rule flex items-center justify-center">
            <span className="caption-mono text-ink-faint">Coming soon</span>
          </div>
        </div>
      )}
    </ProjectPageFrame>
  );
}
