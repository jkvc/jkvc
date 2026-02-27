"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import IconCircleButton from "@/app/components/ui/IconCircleButton";

const STORAGE_KEY = "jkvc:show-drafts";

function subscribeToStorage(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

const IS_DEV = process.env.NODE_ENV === "development";

export function getShowDrafts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "1";
    return IS_DEV;
  } catch {
    return IS_DEV;
  }
}

function getShowDraftsServer() {
  return false;
}

export default function BottomBar() {
  const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
  const [, forceRender] = useState(0);

  const toggleDrafts = useCallback(() => {
    try {
      const next = !getShowDrafts();
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // localStorage unavailable
    }
    forceRender((n) => n + 1);
  }, []);

  return (
    <footer className="mt-16 flex justify-center gap-3">
      <IconCircleButton
        href="/"
        icon="fa-home"
        title="Home"
        size="md"
        iconClassName="text-[14px]"
      />
      <IconCircleButton
        onClick={toggleDrafts}
        icon={showDrafts ? "fa-eye" : "fa-eye-slash"}
        title={showDrafts ? "Hide drafts" : "Show drafts"}
        size="md"
        active={showDrafts}
        iconClassName="text-[13px]"
      />
      <IconCircleButton
        href="https://github.com/jkvc"
        icon="fa-github"
        iconFamily="fa-brands"
        title="GitHub"
        size="md"
        iconClassName="text-[14px]"
      />
    </footer>
  );
}
