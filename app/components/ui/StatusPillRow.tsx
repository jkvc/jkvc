"use client";

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
        const stateClasses =
          status === "running"
            ? "border-gold/40 text-gold"
            : status === "complete"
              ? "border-[#D0D0D0] text-[#AAA]"
              : status === "error"
                ? "border-red-300 text-red-500"
                : "border-[#E8E8E8] text-[#CCC]";

        return (
          <span
            key={id}
            className={`flex items-center justify-center w-10 h-10 rounded-full border ${stateClasses}`}
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
