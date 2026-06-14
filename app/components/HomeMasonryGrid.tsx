"use client";

/**
 * Home masonry — revisit if layout feels wrong.
 *
 * Goals: newest-first chrono (older lower in each lane); no dangling tall column
 * beside a short one; variable card heights pack tightly (not CSS grid rows).
 *
 * Approach: two flex lanes + assignProjectsToBalancedLanes — each next card
 * goes on the shorter lane (ResizeObserver heights). Cards mount only after
 * thumbnails load; fallback height until measured.
 *
 * If this misbehaves, check: lane rebalance on resize, thumbnail aspect ratios,
 * or swap to a measured masonry lib / stricter even-odd pairing (data.ts).
 */

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import ProjectMasonryCardDeferred from "@/app/components/ProjectMasonryCardDeferred";
import { STAMP_BLEED_TOP } from "@/app/lib/stamp";
import {
    assignProjectsToBalancedLanes,
    type Project,
} from "@/app/projects/data";

type MasonryProject = Project & { issue: string };

interface HomeMasonryGridProps {
    projects: MasonryProject[];
    showDrafts: boolean;
}

function MeasuredMasonryCard({
    project,
    showDrafts,
    onMeasure,
}: {
    project: MasonryProject;
    showDrafts: boolean;
    onMeasure: (slug: string, height: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const report = () => {
            onMeasure(project.slug, el.getBoundingClientRect().height);
        };

        report();
        const observer = new ResizeObserver(report);
        observer.observe(el);
        return () => observer.disconnect();
    }, [project.slug, onMeasure]);

    return (
        <div ref={ref}>
            <ProjectMasonryCardDeferred
                {...project}
                draft={showDrafts && !project.ready}
                showStatus={showDrafts}
            />
        </div>
    );
}

export default function HomeMasonryGrid({
    projects,
    showDrafts,
}: HomeMasonryGridProps) {
    const [heights, setHeights] = useState<Record<string, number>>({});

    const onMeasure = useCallback((slug: string, height: number) => {
        setHeights((prev) =>
            prev[slug] === height ? prev : { ...prev, [slug]: height },
        );
    }, []);

    const { left, right } = useMemo(
        () => assignProjectsToBalancedLanes(projects, heights),
        [projects, heights],
    );

    return (
        <div className={`grid grid-cols-2 gap-x-4 px-2 ${STAMP_BLEED_TOP}`}>
            {[left, right].map((lane, laneIdx) => (
                <div key={laneIdx} className="flex min-w-0 flex-col gap-4">
                    {lane.map((project) => (
                        <MeasuredMasonryCard
                            key={project.slug}
                            project={project}
                            showDrafts={showDrafts}
                            onMeasure={onMeasure}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
