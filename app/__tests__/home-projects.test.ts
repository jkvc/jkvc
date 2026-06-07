import { describe, expect, it } from "vitest";
import {
    DEFAULT_HOME_PROJECTS_OPTIONS,
    getVisibleHomeProjects,
} from "@/app/lib/home-projects";
import { projects, type Project } from "@/app/projects/data";

function stub(overrides: Partial<Project> & Pick<Project, "slug">): Project {
    return {
        title: overrides.slug,
        description: "",
        gradient: "",
        ready: true,
        kind: "playable",
        ...overrides,
    };
}

const catalog = [
    stub({ slug: "draft", ready: false, date: "2026-06-08" }),
    stub({ slug: "newest", date: "2026-06-07", kind: "readable" }),
    stub({ slug: "older-playable", date: "2026-05-01", kind: "playable" }),
    stub({ slug: "older-readable", date: "2026-04-01", kind: "readable" }),
];

describe("getVisibleHomeProjects", () => {
    it("assigns issue numbers from canonical catalog order", () => {
        const visible = getVisibleHomeProjects(catalog, {
            category: "all",
            showDrafts: true,
        });
        expect(visible.map((p) => [p.slug, p.issue])).toEqual([
            ["draft", "01"],
            ["newest", "02"],
            ["older-playable", "03"],
            ["older-readable", "04"],
        ]);
    });

    it("hides drafts by default and sorts newest first", () => {
        const visible = getVisibleHomeProjects(catalog, {
            category: "all",
            showDrafts: false,
        });
        expect(visible.map((p) => p.slug)).toEqual([
            "newest",
            "older-playable",
            "older-readable",
        ]);
    });

    it("filters by readable kind", () => {
        const visible = getVisibleHomeProjects(catalog, {
            category: "readable",
            showDrafts: false,
        });
        expect(visible.map((p) => p.slug)).toEqual(["newest", "older-readable"]);
    });

    it("filters by playable kind", () => {
        const visible = getVisibleHomeProjects(catalog, {
            category: "playable",
            showDrafts: false,
        });
        expect(visible.map((p) => p.slug)).toEqual(["older-playable"]);
    });

    it("default server options expose every published catalog entry", () => {
        const visible = getVisibleHomeProjects(
            projects,
            DEFAULT_HOME_PROJECTS_OPTIONS,
        );
        const published = projects.filter((p) => p.ready);
        expect(visible).toHaveLength(published.length);
        for (const project of published) {
            expect(visible.some((p) => p.slug === project.slug)).toBe(true);
        }
    });
});
