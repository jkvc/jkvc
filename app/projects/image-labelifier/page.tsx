import type { Metadata } from "next";
import { Suspense } from "react";
import ImageLabelifierClient from "./ImageLabelifierClient";
import { projects, getProjectMeta } from "../data";
import ProjectJsonLd from "@/app/components/ProjectJsonLd";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "image-labelifier")!;
const meta = getProjectMeta("image-labelifier");

export const metadata: Metadata = {
  title: project.title,
  description: project.description,
};

export default function ImageLabelifierPage() {
  return (
    <>
      <ProjectJsonLd project={project} />
      <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      draft={!project.ready}
      kind={project.kind}
      refs={project.refs}
    >
      <Suspense>
        <ImageLabelifierClient />
      </Suspense>
    </ProjectPageFrame>
    </>
  );
}
