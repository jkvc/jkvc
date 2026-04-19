import type { Metadata } from "next";
import { Suspense } from "react";
import ImageMixerClient from "./ImageMixerClient";
import { projects, getProjectMeta } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "image-mixer")!;
const meta = getProjectMeta("image-mixer");

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function ImageMixerPage() {
  return (
    <ProjectPageFrame title={project.title} description={project.description} meta={meta}>
      <Suspense>
        <ImageMixerClient />
      </Suspense>
    </ProjectPageFrame>
  );
}
