"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { twMerge } from "tailwind-merge";
import ProjectMasonryCard from "./components/ProjectMasonryCard";
import {
    getShowDrafts,
    getShowDraftsServer,
    subscribeToStorage,
    toggleShowDrafts,
} from "./components/BottomBar";
import Wordmark from "./components/brand/Wordmark";
import ContactSlab from "./components/editorial/ContactSlab";
import Pill from "./components/editorial/Pill";
import IconCircleButton from "./components/ui/IconCircleButton";
import StampShell from "./components/ui/StampShell";
import { useWideLayout } from "./hooks/useWideLayout";
import { STAMP_BLEED, STAMP_BLEED_TOP } from "./lib/stamp";
import { PROJECT_KINDS, projects, type ProjectKind } from "./projects/data";
import { SITE } from "./lib/site";
import { renderInlineMarkdown } from "./lib/inline-markdown";

type Category = "all" | ProjectKind;

interface CategoryMeta {
    id: Category;
    label: string;
}

const CATEGORIES: CategoryMeta[] = [
    { id: "all", label: "ALL" },
    ...PROJECT_KINDS.map((k) => ({ id: k.id as Category, label: k.label })),
];

const SHELL_TRANSITION =
    "transition-[max-width,padding,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

export default function Home() {
    const wide = useWideLayout();
    const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
    const handleToggleDrafts = useCallback(() => toggleShowDrafts(), []);
    const [category, setCategory] = useState<Category>("all");

    const visible = projects
        .map((p, i) => ({ ...p, issue: String(i + 1).padStart(2, "0") }))
        .filter((p) => {
            if (category !== "all" && p.kind !== category) return false;
            return showDrafts || p.ready;
        })
        .reverse();

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
                {/* Left lane — fixed on desktop; right column scrolls independently */}
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

                {/* Right lane — scrolls independently on desktop */}
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
                            <div className={`columns-2 gap-4 px-2 ${STAMP_BLEED_TOP}`}>
                                {visible.map((project) => (
                                    <ProjectMasonryCard
                                        key={project.slug}
                                        {...project}
                                        draft={showDrafts && !project.ready}
                                        showStatus={showDrafts}
                                    />
                                ))}
                            </div>
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
