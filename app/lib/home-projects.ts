import {
    compareProjectsNewestFirst,
    type Project,
    type ProjectKind,
} from "@/app/projects/data";

export type HomeCategory = "all" | ProjectKind;

export type MasonryProject = Project & { issue: string };

export interface HomeProjectsOptions {
    category: HomeCategory;
    showDrafts: boolean;
}

/** Default server / first-paint home grid — published projects, all categories. */
export const DEFAULT_HOME_PROJECTS_OPTIONS: HomeProjectsOptions = {
    category: "all",
    showDrafts: false,
};

/**
 * Home masonry source list — issue numbers follow canonical `projects` order;
 * visibility and sort match the interactive home filters.
 */
export function getVisibleHomeProjects(
    catalog: readonly Project[],
    { category, showDrafts }: HomeProjectsOptions,
): MasonryProject[] {
    return catalog
        .map((p, i) => ({ ...p, issue: String(i + 1).padStart(2, "0") }))
        .filter((p) => {
            if (category !== "all" && p.kind !== category) return false;
            return showDrafts || p.ready;
        })
        .sort(compareProjectsNewestFirst);
}
