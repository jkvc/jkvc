import type { Metadata } from "next";
import { Suspense } from "react";
import MagicCrankieClient from "./MagicCrankieClient";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "magic-crankie")!;
const meta = getProjectMeta("magic-crankie");

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function MagicCrankiePage() {
  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      draft={!project.ready}
      kind={project.kind}
      refs={project.refs}
    >
      <Suspense>
        <MagicCrankieClient />
      </Suspense>
    </ProjectPageFrame>
  );
}
