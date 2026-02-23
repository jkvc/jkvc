import type { Metadata } from "next";
import { Suspense } from "react";
import TextImageClient from "./TextImageClient";
import { projects } from "../data";
import ProjectPageFrame from "@/app/components/project/ProjectPageFrame";

const project = projects.find((p) => p.slug === "text-image")!;

export const metadata: Metadata = {
  title: `${project.title} | jkvc`,
  description: project.description,
};

export default function TextImagePage() {
  return (
    <ProjectPageFrame title={project.title} description={project.description}>
      <Suspense>
        <TextImageClient />
      </Suspense>
    </ProjectPageFrame>
  );
}
