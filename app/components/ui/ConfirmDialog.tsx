"use client";

import { useEffect, useRef } from "react";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";

interface Props {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <dialog
      ref={ref}
      className="m-0 h-dvh max-h-dvh w-full max-w-none border-0 bg-transparent p-0 shadow-none backdrop:bg-ink/30"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div
        className="flex h-full w-full items-center justify-center p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <div
          role="document"
          className="w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <StampShell
            variant="card"
            bleed={false}
            faceClassName="flex w-full flex-col gap-5 p-6"
          >
            <div className="flex flex-col gap-2">
              <p className="caption-mono text-ink">{title}</p>
              {message && (
                <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Pill type="button" onClick={onCancel}>
                {cancelLabel}
              </Pill>
              <Pill type="button" onClick={onConfirm} active>
                {confirmLabel}
              </Pill>
            </div>
          </StampShell>
        </div>
      </div>
    </dialog>
  );
}
