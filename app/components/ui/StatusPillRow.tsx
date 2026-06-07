"use client";

import { twMerge } from "tailwind-merge";
import { STAMP_CONTROL_WRAP_IDLE, STAMP_FACE } from "@/app/lib/stamp";

export type PipelineStatus = "idle" | "running" | "complete" | "error";

export interface StatusPillStep {
  id: string;
  icon: string;
  status: PipelineStatus;
  title?: string;
}

interface Props {
  steps: StatusPillStep[];
  className?: string;
}

export default function StatusPillRow({ steps, className = "" }: Props) {
  return (
    <div className={`flex justify-center gap-3 ${className}`}>
      {steps.map(({ id, icon, status, title }) => {
        const stateClasses = twMerge(
          STAMP_FACE,
          STAMP_CONTROL_WRAP_IDLE,
          "flex h-10 w-10 items-center justify-center",
          status === "running"
            ? "border-hot bg-surface text-hot"
            : status === "complete"
              ? "border-ink bg-ink text-surface"
              : status === "error"
                ? "border-hot bg-hot/10 text-hot"
                : "border-ink bg-surface text-ink",
        );

        return (
          <span
            key={id}
            className={stateClasses}
            title={title}
          >
            {status === "running" ? (
              <i className={`fa-solid ${icon} text-[13px] animate-spin`} />
            ) : status === "complete" ? (
              <i className="fa-solid fa-check text-[13px]" />
            ) : status === "error" ? (
              <i className="fa-solid fa-exclamation text-[13px]" />
            ) : (
              <i className={`fa-solid ${icon} text-[13px]`} />
            )}
          </span>
        );
      })}
    </div>
  );
}
