import ProjectMasonryCard from "@/app/components/ProjectMasonryCard";
import { STAMP_BLEED_TOP } from "@/app/lib/stamp";
import type { MasonryProject } from "@/app/lib/home-projects";
import { splitProjectsIntoMasonryLanes } from "@/app/projects/data";

interface HomeMasonryStaticProps {
    projects: MasonryProject[];
    showDrafts: boolean;
}

/**
 * Server-rendered home masonry — deterministic even/odd lanes so crawlers and
 * the pre-hydration paint get real project links. DOM shape matches
 * `HomeMasonryGrid` (wrapper div + two flex lanes) for a clean handoff.
 */
export default function HomeMasonryStatic({
    projects,
    showDrafts,
}: HomeMasonryStaticProps) {
    const { left, right } = splitProjectsIntoMasonryLanes(projects);

    return (
        <div className={`grid grid-cols-2 gap-x-4 px-2 ${STAMP_BLEED_TOP}`}>
            {[left, right].map((lane, laneIdx) => (
                <div key={laneIdx} className="flex min-w-0 flex-col gap-4">
                    {lane.map((project) => (
                        <div key={project.slug}>
                            <ProjectMasonryCard
                                {...project}
                                draft={showDrafts && !project.ready}
                                showStatus={showDrafts}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
