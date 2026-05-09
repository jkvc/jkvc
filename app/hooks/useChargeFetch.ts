"use client";

import { useCallback } from "react";
import { toast } from "sonner";

function formatRetryTime(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

/**
 * Wraps fetch() with automatic 429 / out_of_charge detection.
 * On depletion, fires a sonner toast that links to /usage.
 * Returns the Response so callers handle other errors normally.
 */
export function useChargeFetch() {
  const chargeFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await fetch(input, init);

      if (response.status === 429) {
        try {
          const cloned = response.clone();
          const body = await cloned.json();
          if (body.error === "out_of_charge") {
            const retryStr = formatRetryTime(body.retryAfterMs ?? 0);
            toast.error(`Out of charge — recharges in ${retryStr}`, {
              description: "Click to see all charge levels",
              duration: 8000,
              action: {
                label: "View usage",
                onClick: () => {
                  window.location.href = "/usage";
                },
              },
            });
          }
        } catch {
          // Non-JSON 429 — not from charge system, ignore
        }
      }

      return response;
    },
    [],
  );

  return chargeFetch;
}
