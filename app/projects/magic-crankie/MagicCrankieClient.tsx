"use client";

import { useState } from "react";
import { useCrankieEngine } from "./lib/crankie-engine";
import CrankieViewport from "./components/CrankieViewport";
import StateButtons from "./components/StateButtons";

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

        <div className="w-px h-5 bg-[#E0E0E0]" />

        <button
          onClick={() => setShowDebug((d) => !d)}
          className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all cursor-pointer ${
            showDebug
              ? "border-gold/50 text-gold"
              : "border-[#E0E0E0] text-[#AAA] hover:border-gold/50 hover:text-gold"
          }`}
          title="Toggle debug overlay"
        >
          <i
            className={`fa-solid ${showDebug ? "fa-eye" : "fa-eye-slash"} text-[12px]`}
          />
        </button>
      </div>
    </div>
  );
}
