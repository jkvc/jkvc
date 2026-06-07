"use client";

import { useState } from "react";
import { useCrankieEngine } from "./lib/crankie-engine";
import CrankieViewport from "./components/CrankieViewport";
import StateButtons from "./components/StateButtons";
import IconCircleButton from "@/app/components/ui/IconCircleButton";

export default function MagicCrankieClient() {
  const { segments, scrollOffset, currentStateId, requestState } =
    useCrankieEngine();
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <CrankieViewport
        segments={segments}
        scrollOffset={scrollOffset}
        showDebug={showDebug}
      />

      <div className="flex items-center gap-3">
        <StateButtons
          currentStateId={currentStateId}
          onRequestState={requestState}
        />

        <div className="w-px h-5 bg-rule" />

        <IconCircleButton
          onClick={() => setShowDebug((d) => !d)}
          icon={showDebug ? "fa-eye" : "fa-eye-slash"}
          title="Toggle debug overlay"
          active={showDebug}
        />
      </div>
    </div>
  );
}
