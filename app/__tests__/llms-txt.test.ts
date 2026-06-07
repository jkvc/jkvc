import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "@/app/lib/llms-txt";
import { SITE } from "@/app/lib/site";
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

const miniSite = {
    name: "jkvc",
    description: "Test site description.",
    url: "https://jkvc.ai",
    social: SITE.social,
} as const;

describe("buildLlmsTxt", () => {
    it("renders site header and about link", () => {
        const body = buildLlmsTxt(miniSite, []);
        expect(body).toContain("# jkvc");
        expect(body).toContain("> Test site description.");
        expect(body).toContain("- https://jkvc.ai/about");
    });

    it("lists published essays and demos separately, newest first", () => {
        const body = buildLlmsTxt(miniSite, [
            stub({ slug: "older-essay", kind: "readable", date: "2026-01-01" }),
            stub({ slug: "newer-essay", kind: "readable", date: "2026-06-07" }),
            stub({ slug: "older-demo", kind: "playable", date: "2026-05-01" }),
            stub({ slug: "new-demo", kind: "playable", date: "2026-06-07" }),
            stub({ slug: "draft-demo", kind: "playable", ready: false }),
        ]);

        const essayBlock = body.split("## Demos")[0];
        const demoBlock = body.split("## Demos")[1] ?? "";

        expect(essayBlock.indexOf("/projects/newer-essay")).toBeLessThan(
            essayBlock.indexOf("/projects/older-essay"),
        );
        expect(essayBlock).not.toContain("draft-demo");

        expect(demoBlock.indexOf("/projects/new-demo")).toBeLessThan(
            demoBlock.indexOf("/projects/older-demo"),
        );
        expect(demoBlock).not.toContain("draft-demo");
    });

    it("includes external profile links", () => {
        const body = buildLlmsTxt(miniSite, []);
        expect(body).toContain(SITE.social.github);
        expect(body).toContain(SITE.social.linkedin);
    });

    it("covers every published project in the live catalog", () => {
        const body = buildLlmsTxt(SITE, projects);
        const published = projects.filter((p) => p.ready);
        for (const project of published) {
            expect(body).toContain(`${SITE.url}/projects/${project.slug}`);
        }
        const drafts = projects.filter((p) => !p.ready);
        for (const project of drafts) {
            expect(body).not.toContain(`${SITE.url}/projects/${project.slug}`);
        }
    });
});
