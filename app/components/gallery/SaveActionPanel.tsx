"use client";

import { useCallback, useState } from "react";
import DevOnlyButton from "@/app/components/DevOnlyButton";

interface Props {
  canSave: boolean;
  onSave: () => Promise<void>;
  onSaved?: () => void;
  text?: string;
  loadingText?: string;
  className?: string;
}

export default function SaveActionPanel({
  canSave,
  onSave,
  onSaved,
  text = "Save to Gallery",
  loadingText = "Saving…",
  className = "",
}: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await onSave();
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }, [canSave, onSave, onSaved]);

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <DevOnlyButton
        text={text}
        onClick={handleSave}
        loading={saving}
        loadingText={loadingText}
        disabled={!canSave}
      />
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
}
