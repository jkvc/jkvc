"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import ProjectRow from "./components/ProjectRow";
import {
    getShowDrafts,
    getShowDraftsServer,
    subscribeToStorage,
    toggleShowDrafts,
} from "./components/BottomBar";
import IconCircleButton from "./components/ui/IconCircleButton";
import Wordmark from "./components/brand/Wordmark";
import ContactSlab from "./components/editorial/ContactSlab";
import { projects } from "./projects/data";
import { SITE } from "./lib/site";

type Category = "ALL" | "EXPERIMENTS" | "ESSAYS";

const CATEGORIES: Category[] = ["ALL", "EXPERIMENTS", "ESSAYS"];

export default function Home() {
    const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
    const handleToggleDrafts = useCallback(() => toggleShowDrafts(), []);
    const [category, setCategory] = useState<Category>("ALL");

    // Category narrows by kind; the DRAFTS toggle is orthogonal and gates
    // whether not-ready items appear at all. Current data has no essays.
    //
    // `projects` in data.ts is maintained oldest-first so issue numbers grow
    // chronologically (№ 01 = earliest). Compute `issue` from that canonical
    // order, then reverse for display so the newest piece sits at the top.
    const visible = projects
        .map((p, i) => ({ ...p, issue: String(i + 1).padStart(2, "0") }))
        .filter((p) => {
            if (category === "ESSAYS") return false;
            return showDrafts || p.ready;
        })
        .reverse();

    return (
        <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Hero */}
                <section className="mb-10 flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-[64px] sm:text-[80px] text-ink">
                            <Wordmark />
                        </h1>
                        <p className="mt-5 font-serif italic text-xl text-ink-muted leading-snug max-w-md">
                            {SITE.tagline}
                        </p>
                    </div>
                    <div className="pt-3 flex-shrink-0">
                        <IconCircleButton href="/about" icon="fa-user" title="About" size="sm" />
                    </div>
                </section>

                {/* Category pill row + drafts toggle */}
                <section className="mt-8 mb-8">
                    <div className="flex flex-wrap items-center gap-2">
                        {CATEGORIES.map((cat) => {
                            const active = category === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`font-mono text-[10px] uppercase tracking-[0.22em] rounded-full px-3.5 py-1.5 border transition-colors ${active
                                        ? "bg-ink text-surface border-ink"
                                        : "border-rule text-ink-muted hover:border-ink hover:text-ink"
                                        }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}

                        <div className="flex-1 border-t border-rule mx-2 hidden sm:block" />

                        <button
                            onClick={handleToggleDrafts}
                            title={showDrafts ? "Hide drafts" : "Show drafts"}
                            aria-pressed={showDrafts}
                            className={`font-mono text-[10px] uppercase tracking-[0.22em] rounded-full px-3.5 py-1.5 border transition-colors inline-flex items-center gap-1.5 ${showDrafts
                                ? "bg-ink text-surface border-ink"
                                : "border-rule text-ink-muted hover:border-ink hover:text-ink"
                                }`}
                        >
                            <i className={`fa-solid ${showDrafts ? "fa-eye" : "fa-eye-slash"} text-[10px]`} />
                            <span>Drafts</span>
                        </button>
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
                            />
                        ))}
                        {visible.length === 0 && (
                            <div className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                                {category === "ESSAYS" ? "No essays yet · Coming soon" : "Nothing here"}
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
