"use client";

import { useChargeFetch as useChargeFetchBase } from "next-charge/client";
import { toast } from "sonner";
import { useMemo } from "react";

export function useChargeFetch() {
  const onOutOfCharge = useMemo(
    () =>
      (_body: { retryAfterMs: number; poolId: string }, retryStr: string) => {
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
      },
    [],
  );

  return useChargeFetchBase({ onOutOfCharge });
}
