import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoCommentatorClient from "./PhotoCommentatorClient";
import { projects, getProjectMeta } from "../data";
import ProjectJsonLd from "@/app/components/ProjectJsonLd";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "photo-commentator")!;
const meta = getProjectMeta("photo-commentator");

export const metadata: Metadata = {
  title: project.title,
  description: project.description,
};

export default function PhotoCommentatorPage() {
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
          <PhotoCommentatorClient />
        </Suspense>
      </ProjectPageFrame>
    </>
  );
}
