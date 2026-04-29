"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import ProjectRow from "./components/ProjectRow";
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
import { PROJECT_KINDS, projects, type ProjectKind } from "./projects/data";
import { SITE } from "./lib/site";

/** Filter bucket: either `"all"` (show every kind) or a specific ProjectKind.
 *  The concrete kinds come from PROJECT_KINDS in data.ts — this page never
 *  hardcodes them. */
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

    // Category narrows by kind; the DRAFTS toggle is orthogonal and gates
    // whether not-ready items appear at all.
    //
    // `projects` in data.ts is maintained oldest-first so issue numbers grow
    // chronologically (№ 01 = earliest). Compute `issue` from that canonical
    // order, then reverse for display so the newest piece sits at the top.
    const visible = projects
        .map((p, i) => ({ ...p, issue: String(i + 1).padStart(2, "0") }))
        .filter((p) => {
            if (category !== "all" && p.kind !== category) return false;
            return showDrafts || p.ready;
        })
        .reverse();

    return (
        <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Hero */}
                <section className="mb-10">
                    <h1 className="text-[64px] sm:text-[80px] text-ink">
                        <Wordmark />
                    </h1>
                    <p className="mt-5 font-serif italic text-xl text-ink-muted leading-snug max-w-md">
                        {SITE.tagline}
                        {/* Inline About affordance — sized to match the pill caption
                            metrics so it reads as typographic punctuation after the
                            last word. `align-text-bottom` + `not-italic` keep the
                            circle upright on the tagline baseline. */}
                        <IconCircleButton
                            href="/about"
                            icon="fa-user"
                            title="About"
                            size="xs"
                            className="ml-2 align-text-bottom not-italic"
                        />
                    </p>
                </section>

                {/* Category pill row + drafts toggle */}
                <section className="mt-8 mb-8">
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

                {/* Projects */}
                <section>
                    <div className="flex flex-col gap-3">
                        {visible.map((project) => (
                            <ProjectRow
                                key={project.slug}
                                {...project}
                                draft={showDrafts && !project.ready}
                                showStatus={showDrafts}
                            />
                        ))}
                        {visible.length === 0 && (
                            <div className="py-10 text-center caption-mono text-ink-faint">
                                Nothing here yet
                            </div>
                        )}
                    </div>
                </section>

                <div className="mt-16">
                    <ContactSlab />
                </div>
            </div>
        </div>
    );
}
