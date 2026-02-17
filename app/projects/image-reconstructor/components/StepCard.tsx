"use client";

interface Props {
  index: number;
  label: string;
  compositeUrl: string;
}

export default function StepCard({ index, label, compositeUrl }: Props) {
  return (
    <div className="flex gap-3">
      {/* Numbered circle + vertical line */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gold text-white text-[11px] font-bold shrink-0">
          {index}
        </div>
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex gap-3 items-center">
          <img
            src={compositeUrl}
            alt={`Step ${index}: ${label}`}
            className="w-20 h-20 rounded-lg border border-[#E8E8E8] object-cover shrink-0"
          />
          <p className="text-[13px] text-text font-medium truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}
