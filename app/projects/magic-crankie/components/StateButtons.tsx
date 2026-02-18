"use client";

import { STATES } from "../lib/state-machine";

interface StateButtonsProps {
  currentStateId: string;
  onRequestState: (stateId: string) => void;
}

export default function StateButtons({
  currentStateId,
  onRequestState,
}: StateButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STATES.map((state) => {
        const isCurrent = state.id === currentStateId;
        return (
          <button
            key={state.id}
            onClick={() => onRequestState(state.id)}
            className={`flex items-center justify-center w-9 h-9 rounded-full text-[12px] font-mono font-bold transition-all duration-200 cursor-pointer ${
              isCurrent
                ? "text-white shadow-sm"
                : "bg-[#F0EDE8] text-[#AAA] hover:text-gold hover:bg-[#E8E4DD]"
            }`}
            style={isCurrent ? { background: state.color } : undefined}
            title={`Go to ${state.id}`}
          >
            {state.id}
          </button>
        );
      })}
    </div>
  );
}
