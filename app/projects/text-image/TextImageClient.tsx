"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Gallery from "./components/Gallery";
import InferenceExplorer from "./components/InferenceExplorer";

const isDev = process.env.NODE_ENV === "development";

type Phase = "canvas" | "gallery" | "expert";

const TAB_PHASES = new Set<Phase>(["gallery", "expert"]);

function getInitialPhase(tab: string | null): Phase {
  if (tab && TAB_PHASES.has(tab as Phase)) return tab as Phase;
  return "canvas";
}

export default function TextImageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() =>
    getInitialPhase(searchParams.get("tab"))
  );

  const switchPhase = useCallback(
    (p: Phase) => {
      setPhase(p);
      const url = TAB_PHASES.has(p)
        ? `?tab=${p}`
        : window.location.pathname;
      router.replace(url, { scroll: false });
    },
    [router]
  );

  return (
    <div>
      <div className="flex gap-1.5 mb-8">
        <button
          className={`btn btn-sm rounded-full ${phase === "canvas" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase("canvas")}
        >
          Canvas
        </button>
        <button
          className={`btn btn-sm rounded-full ${phase === "gallery" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => switchPhase("gallery")}
        >
          Gallery
        </button>
        {isDev && (
          <button
            className={`btn btn-sm rounded-full ${phase === "expert" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => switchPhase("expert")}
          >
            Expert
          </button>
        )}
      </div>

      {phase === "canvas" && (
        <div className="flex items-center justify-center py-16">
          <p className="text-base-content/40 text-sm">Under construction</p>
        </div>
      )}

      {phase === "gallery" && <Gallery />}

      {phase === "expert" && isDev && <InferenceExplorer />}
    </div>
  );
}
