import { describe, expect, it } from "vitest";
import {
    assignProjectsToBalancedLanes,
    compareProjectsNewestFirst,
    projectChronoKey,
    splitProjectsIntoMasonryLanes,
    type Project,
} from "@/app/projects/data";

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

describe("projectChronoKey", () => {
    it("prefers date over year", () => {
        expect(
            projectChronoKey({ date: "2026-06-07", year: "2025" }),
        ).toBe("2026-06-07");
    });

    it("falls back to year", () => {
        expect(projectChronoKey({ year: "2024" })).toBe("2024-01-01");
    });
});

describe("compareProjectsNewestFirst", () => {
    it("sorts newest date first", () => {
        const older = stub({ slug: "older", date: "2025-01-01" });
        const newer = stub({ slug: "newer", date: "2026-06-07" });
        expect(compareProjectsNewestFirst(older, newer)).toBeGreaterThan(0);
        expect(compareProjectsNewestFirst(newer, older)).toBeLessThan(0);
    });

    it("breaks date ties by slug", () => {
        const a = stub({ slug: "alpha", date: "2026-01-01" });
        const b = stub({ slug: "beta", date: "2026-01-01" });
        expect(compareProjectsNewestFirst(a, b)).toBeLessThan(0);
    });
});

describe("splitProjectsIntoMasonryLanes", () => {
    it("puts even indices in left lane and odd in right", () => {
        const sorted = ["a", "b", "c", "d", "e"];
        expect(splitProjectsIntoMasonryLanes(sorted)).toEqual({
            left: ["a", "c", "e"],
            right: ["b", "d"],
        });
    });
});

describe("assignProjectsToBalancedLanes", () => {
    it("alternates when lane heights stay equal", () => {
        const sorted = [
            stub({ slug: "a" }),
            stub({ slug: "b" }),
            stub({ slug: "c" }),
        ];
        const heights = { a: 200, b: 200, c: 200 };
        expect(assignProjectsToBalancedLanes(sorted, heights, { gapPx: 0 })).toEqual({
            left: [sorted[0], sorted[2]],
            right: [sorted[1]],
        });
    });

    it("sends the next card to the shorter lane", () => {
        const sorted = [
            stub({ slug: "newest" }),
            stub({ slug: "second" }),
            stub({ slug: "third" }),
        ];
        const tallLeft = { newest: 500, second: 100, third: 100 };
        expect(
            assignProjectsToBalancedLanes(sorted, tallLeft, { gapPx: 0 }).left.map(
                (p) => p.slug,
            ),
        ).toEqual(["newest"]);
        expect(
            assignProjectsToBalancedLanes(sorted, tallLeft, { gapPx: 0 }).right.map(
                (p) => p.slug,
            ),
        ).toEqual(["second", "third"]);
    });
});
