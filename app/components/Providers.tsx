"use client";

import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-rule)",
            borderLeft: "3px solid var(--color-hot)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
          },
        }}
      />
    </>
  );
}
