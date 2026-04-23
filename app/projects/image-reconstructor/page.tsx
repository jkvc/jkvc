import type { Metadata } from "next";
import { Suspense } from "react";
import ImageReconstructorClient from "./ImageReconstructorClient";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "image-reconstructor")!;
const meta = getProjectMeta("image-reconstructor");

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function ImageReconstructorPage() {
  return (
    <ProjectPageFrame
      title={project.title}
      description={project.description}
      meta={meta}
      draft={!project.ready}
      kind={project.kind}
    >
      <Suspense>
        <ImageReconstructorClient />
      </Suspense>
    </ProjectPageFrame>
  );
}
