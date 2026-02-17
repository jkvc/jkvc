"use client";

import { ProcessingStep } from "../lib/types";
import Image from "next/image";

interface ProcessingViewProps {
  steps: ProcessingStep[];
  currentStep: number;
  isProcessing: boolean;
  status: string;
}

export default function ProcessingView({
  steps,
  currentStep,
  isProcessing,
  status,
}: ProcessingViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-3">
        {isProcessing ? (
          <i className="fa-solid fa-circle-notch fa-spin text-gold text-sm" />
        ) : (
          <i className="fa-solid fa-check-circle text-gold text-sm" />
        )}
        <span className="text-[13px] text-text-muted">{status}</span>
      </div>

      {/* Steps visualization */}
      <div className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <div
            key={step.stepNumber}
            className={`rounded-2xl border transition-all ${
              index === currentStep
                ? "border-gold/50 bg-gold-light/10"
                : "border-border"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-light text-text-heading text-[13px] font-medium">
                    {step.stepNumber}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Image */}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border mb-3">
                    <Image
                      src={step.imageUrl}
                      alt={`Step ${step.stepNumber}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>

                  {/* Regions detected */}
                  {step.regionsDetected.length > 0 && (
                    <div className="text-[12px] text-text-muted">
                      <p className="font-medium mb-1">Colored regions found:</p>
                      <ul className="space-y-0.5">
                        {step.regionsDetected.map((region, idx) => (
                          <li key={idx}>
                            • {region.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {step.regionsDetected.length === 0 && (
                    <p className="text-[12px] text-text-muted">
                      ✓ No more colored regions detected
                    </p>
                  )}

                  {/* Prompt used */}
                  {step.promptUsed && (
                    <p className="text-[11px] text-text-faint mt-2 italic">
                      Prompt: {step.promptUsed}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
