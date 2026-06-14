"use client";

import ProjectMasonryCard from "@/app/components/ProjectMasonryCard";
import { useImageReady } from "@/app/hooks/useImageReady";
import type { ComponentProps } from "react";

type ProjectMasonryCardDeferredProps = ComponentProps<typeof ProjectMasonryCard>;

/**
 * Renders a masonry card only after its thumbnail has loaded (or immediately
 * when there is no thumbnail). Avoids layout shift from late image paint.
 */
export default function ProjectMasonryCardDeferred(
    props: ProjectMasonryCardDeferredProps,
) {
    const imageReady = useImageReady(props.thumbnail);
    if (!imageReady) return null;
    return <ProjectMasonryCard {...props} />;
}
