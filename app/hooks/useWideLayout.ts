"use client";

import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

const WIDE_LAYOUT_QUERY = "(min-width: 1024px)";

function getWideLayoutSnapshot(): boolean {
    return window.matchMedia(WIDE_LAYOUT_QUERY).matches;
}

function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeWideLayout(onStoreChange: () => void): () => void {
    const mediaQuery = window.matchMedia(WIDE_LAYOUT_QUERY);
    let activeTransition: ViewTransition | null = null;

    const applyLayoutChange = () => {
        flushSync(() => {
            onStoreChange();
        });
    };

    const handleChange = () => {
        activeTransition?.skipTransition();
        activeTransition = null;

        if (
            typeof document === "undefined" ||
            prefersReducedMotion() ||
            !("startViewTransition" in document)
        ) {
            applyLayoutChange();
            return;
        }

        activeTransition = document.startViewTransition(applyLayoutChange);
        void activeTransition.finished
            .catch(() => {
                /* aborted or timed out — layout already applied via flushSync */
            })
            .finally(() => {
                activeTransition = null;
            });
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
}

/** Matches Tailwind `lg` — wraps breakpoint changes in View Transitions when supported. */
export function useWideLayout(): boolean {
    return useSyncExternalStore(
        subscribeWideLayout,
        getWideLayoutSnapshot,
        () => false,
    );
}
