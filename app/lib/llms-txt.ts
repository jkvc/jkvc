import { SITE } from "./site";
import {
    compareProjectsNewestFirst,
    projects,
    type Project,
} from "@/app/projects/data";

export interface LlmsTxtSite {
    name: string;
    description: string;
    url: string;
    social: {
        linkedin: string;
        github: string;
        scholar: string;
    };
}

function projectUrl(site: LlmsTxtSite, slug: string): string {
    return `${site.url}/projects/${slug}`;
}

function section(title: string, urls: string[]): string[] {
    if (urls.length === 0) return [];
    return [title, ...urls.map((url) => `- ${url}`), ""];
}

/**
 * llms.txt body — derived from `SITE` + published `projects` (same rules as
 * `sitemap.ts`). Add a `ready` project to `data.ts` and it appears here.
 */
export function buildLlmsTxt(
    site: LlmsTxtSite,
    catalog: readonly Project[],
): string {
    const published = catalog
        .filter((p) => p.ready)
        .sort(compareProjectsNewestFirst);

    const essays = published
        .filter((p) => p.kind === "readable")
        .map((p) => projectUrl(site, p.slug));

    const demos = published
        .filter((p) => p.kind === "playable")
        .map((p) => projectUrl(site, p.slug));

    const lines = [
        `# ${site.name}`,
        `> ${site.description}`,
        "",
        ...section("## About", [`${site.url}/about`]),
        ...section("## Essays", essays),
        ...section("## Demos", demos),
        ...section("## Links", [
            site.social.github,
            site.social.linkedin,
            site.social.scholar,
        ]),
    ];

    return lines.join("\n").trimEnd() + "\n";
}

/** Default llms.txt for this deployment — `SITE` + canonical `projects`. */
export function getLlmsTxt(): string {
    return buildLlmsTxt(SITE, projects);
}
