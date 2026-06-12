"use client";

import { useEffect, useState } from "react";

/** True immediately when `src` is absent; otherwise after load or error. */
export function useImageReady(src: string | undefined): boolean {
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;

        const img = new Image();
        const finish = () => setLoadedSrc(src);
        img.onload = finish;
        img.onerror = finish;
        img.src = src;
        if (img.complete) finish();

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    if (!src) return true;
    return loadedSrc === src;
}
