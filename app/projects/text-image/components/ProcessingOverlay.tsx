"use client";

interface Props {
  step: string;
}

export default function ProcessingOverlay({ step }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm text-base-content/60">{step}</p>
    </div>
  );
}
