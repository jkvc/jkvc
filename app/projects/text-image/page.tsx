import type { Metadata } from "next";
import { Suspense } from "react";
import TextImageClient from "./TextImageClient";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "text-image")!;
const meta = getProjectMeta("text-image");

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function TextImagePage() {
  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      draft={!project.ready}
      kind={project.kind}
    >
      <Suspense>
        <TextImageClient />
      </Suspense>
    </ProjectPageFrame>
  );
}
