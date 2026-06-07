import { buildProjectJsonLd } from "@/app/lib/json-ld";
import type { Project } from "@/app/projects/data";
import JsonLd from "./JsonLd";

export default function ProjectJsonLd({ project }: { project: Project }) {
  if (!project.ready) return null;
  return <JsonLd data={buildProjectJsonLd(project)} />;
}
