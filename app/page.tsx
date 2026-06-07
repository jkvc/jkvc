"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
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

export default function Home() {
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
        <div className="min-h-screen text-ink relative overflow-x-clip lg:h-dvh lg:overflow-x-clip lg:overflow-y-hidden">
            <div className="relative mx-auto w-full max-w-5xl px-0 py-12 sm:py-20 lg:h-full lg:py-0 lg:px-8 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-10">
                {/* Narrow: full-bleed until masonry max (3/5 of max-w-5xl grid), then shrink with viewport. */}
                <div className="mx-auto flex w-full min-w-0 max-w-[35.4rem] flex-col gap-10 px-2 lg:max-w-none lg:px-0 lg:contents">
                    {/* Left lane — fixed on desktop; right column scrolls independently */}
                    <aside className="flex min-h-0 flex-col gap-8 lg:h-full lg:py-8">
                        <div className="flex flex-col gap-8 lg:shrink-0">
                            <section className="overflow-visible">
                                <StampShell variant="card" faceClassName="p-8 sm:p-10">
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

                            <section>
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

                        <div className={`hidden lg:mt-auto lg:shrink-0 lg:block ${STAMP_BLEED}`}>
                            <ContactSlab />
                        </div>
                    </aside>

                    {/* Right lane — fills grid column on lg */}
                    <div className="min-w-0 lg:relative lg:w-full lg:min-h-dvh">
                        <section className="min-h-0 min-w-0 lg:h-dvh lg:overflow-y-auto lg:overscroll-y-contain lg:scrollbar-hidden lg:py-8">
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

                    <div className="lg:hidden">
                        <ContactSlab />
                    </div>
                </div>
            </div>
        </div>
    );
}
