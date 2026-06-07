"use client";

import { twMerge } from "tailwind-merge";
import { STAMP_CARD_SHADOW, STAMP_FACE } from "@/app/lib/stamp";

interface Props {
  index: number;
  compositeUrl: string;
}

export default function StepCard({ index, compositeUrl }: Props) {
  return (
    <div className="flex gap-3">
      {/* Numbered circle + vertical line */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-ink text-surface text-xs font-bold shrink-0">
          {index}
        </div>
        <div className="w-px flex-1 bg-rule mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className={twMerge(STAMP_FACE, STAMP_CARD_SHADOW, "inline-block overflow-hidden")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={compositeUrl}
            alt={`Step ${index}`}
            className="w-20 h-20 object-cover block"
          />
        </div>
      </div>
    </div>
  );
}
