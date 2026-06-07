"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";
import HomeMasonryGrid from "@/app/components/HomeMasonryGrid";
import {
    getShowDrafts,
    getShowDraftsServer,
    subscribeToStorage,
    toggleShowDrafts,
} from "@/app/components/BottomBar";
import Wordmark from "@/app/components/brand/Wordmark";
import ContactSlab from "@/app/components/editorial/ContactSlab";
import Pill from "@/app/components/editorial/Pill";
import IconCircleButton from "@/app/components/ui/IconCircleButton";
import StampShell from "@/app/components/ui/StampShell";
import { useWideLayout } from "@/app/hooks/useWideLayout";
import {
    getVisibleHomeProjects,
    type HomeCategory,
} from "@/app/lib/home-projects";
import { STAMP_BLEED } from "@/app/lib/stamp";
import { SITE } from "@/app/lib/site";
import { renderInlineMarkdown } from "@/app/lib/inline-markdown";
import {
    PROJECT_KINDS,
    projects,
} from "@/app/projects/data";

interface CategoryMeta {
    id: HomeCategory;
    label: string;
}

const CATEGORIES: CategoryMeta[] = [
    { id: "all", label: "ALL" },
    ...PROJECT_KINDS.map((k) => ({ id: k.id as HomeCategory, label: k.label })),
];

const SHELL_TRANSITION =
    "transition-[max-width,padding,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

function subscribeNoop() {
    return () => {};
}

/** False on server + during hydration; true once the client has committed. */
function useIsClient() {
    return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

interface HomePageClientProps {
    /** Pre-rendered static masonry from the server page (default view HTML). */
    children: React.ReactNode;
}

export default function HomePageClient({ children }: HomePageClientProps) {
    const wide = useWideLayout();
    const isClient = useIsClient();
    const showDrafts = useSyncExternalStore(
        subscribeToStorage,
        getShowDrafts,
        getShowDraftsServer,
    );
    const handleToggleDrafts = useCallback(() => toggleShowDrafts(), []);
    const [category, setCategory] = useState<HomeCategory>("all");

    const visible = getVisibleHomeProjects(projects, { category, showDrafts });
    const useMeasuredGrid = isClient;

    return (
        <div
            className={twMerge(
                "min-h-screen text-ink relative overflow-x-clip",
                wide && "h-dvh overflow-y-hidden",
            )}
        >
            <div
                className={twMerge(
                    "relative mx-auto w-full min-w-0",
                    SHELL_TRANSITION,
                    wide
                        ? "max-w-5xl h-dvh py-0 px-8 grid grid-cols-[2fr_3fr] grid-rows-1 gap-10 items-stretch"
                        : "max-w-[35.4rem] flex flex-col gap-10 px-2 py-12 sm:py-20",
                )}
            >
                <aside
                    className={twMerge(
                        "flex min-h-0 flex-col [view-transition-name:home-aside]",
                        wide ? "h-full py-8 justify-between gap-0" : "gap-8",
                    )}
                >
                    <div className={twMerge("flex flex-col gap-8", wide && "shrink-0")}>
                        <section
                            className={twMerge(
                                "overflow-visible [view-transition-name:home-hero]",
                                !wide && "px-2",
                            )}
                        >
                            <StampShell
                                variant="card"
                                bleed={false}
                                className={wide ? STAMP_BLEED : undefined}
                                faceClassName="p-8 sm:p-10"
                            >
                                <span className="font-mono text-[11px] font-bold tracking-wider text-hot inline-block border border-ink bg-surface-2 px-2.5 py-0.5 mb-5 normal-case">
                                    A DUMP OF STUFF, SUCH AS IT IS
                                </span>
                                <h1 className="text-[64px] sm:text-[80px] text-ink leading-none">
                                    <Wordmark href="/about" interactive={false} />
                                </h1>
                                <p className="mt-6 text-sm leading-relaxed text-ink-muted">
                                    {renderInlineMarkdown(SITE.tagline)}
                                </p>
                            </StampShell>
                        </section>

                        <section
                            className={twMerge(
                                "[view-transition-name:home-filters]",
                                !wide && "px-2",
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                {CATEGORIES.map((cat) => (
                                    <Pill
                                        key={cat.id}
                                        active={category === cat.id}
                                        onClick={() => setCategory(cat.id)}
                                    >
                                        {cat.label}
                                    </Pill>
                                ))}

                                <div className="flex-1 hairline mx-2 hidden sm:block" />

                                <IconCircleButton
                                    onClick={handleToggleDrafts}
                                    icon={showDrafts ? "fa-eye" : "fa-eye-slash"}
                                    title={showDrafts ? "Hide drafts" : "Show drafts"}
                                    size="xs"
                                    active={showDrafts}
                                />
                            </div>
                        </section>
                    </div>

                    {wide && (
                        <div
                            className={twMerge(
                                "shrink-0 [view-transition-name:home-contact]",
                                STAMP_BLEED,
                            )}
                        >
                            <ContactSlab />
                        </div>
                    )}
                </aside>

                <div
                    className={twMerge(
                        "min-w-0 [view-transition-name:home-masonry]",
                        wide && "relative w-full min-h-dvh",
                    )}
                >
                    <section
                        className={twMerge(
                            "min-h-0 min-w-0",
                            wide &&
                            "h-dvh overflow-y-auto overscroll-y-contain scrollbar-hidden py-8",
                        )}
                    >
                        {visible.length > 0 ? (
                            useMeasuredGrid ? (
                                <HomeMasonryGrid
                                    projects={visible}
                                    showDrafts={showDrafts}
                                />
                            ) : (
                                children
                            )
                        ) : (
                            <div className="py-10 text-center caption-mono text-ink-faint">
                                Nothing here yet
                            </div>
                        )}
                    </section>
                </div>

                {!wide && (
                    <div className="px-2 [view-transition-name:home-contact]">
                        <ContactSlab />
                    </div>
                )}
            </div>
        </div>
    );
}
