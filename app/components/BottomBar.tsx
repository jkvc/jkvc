"use client";

import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import IconCircleButton from "@/app/components/ui/IconCircleButton";

const STORAGE_KEY = "jkvc:show-drafts";
const DRAFTS_CHANGE_EVENT = "jkvc:drafts-changed";

export function subscribeToStorage(cb: () => void) {
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", storageHandler);
  window.addEventListener(DRAFTS_CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener(DRAFTS_CHANGE_EVENT, cb);
  };
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

const EMAIL_USER = "kevinehc";
const EMAIL_DOMAIN = "gmail.com";

function EmailButton() {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), 3000);
    return () => clearTimeout(timer);
  }, [revealed]);

  return (
    <button
      onClick={() => setRevealed(true)}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-[#AAA] hover:border-gold/50 hover:text-gold transition-all cursor-pointer"
      title="Reveal email"
      aria-label="Reveal email address"
    >
      <i className="fa-solid fa-envelope text-[12px]" />
      <span className="font-mono text-[12px]">
        {EMAIL_USER}
        {revealed ? (
          <span className="text-gold">@</span>
        ) : (
          <span className="text-text-faint">{"<at>"}</span>
        )}
        {EMAIL_DOMAIN}
      </span>
    </button>
  );
}

interface BottomBarProps {
  showHome?: boolean;
  showDraftToggle?: boolean;
}

export default function BottomBar({ showHome, showDraftToggle }: BottomBarProps) {
  const showDrafts = useSyncExternalStore(subscribeToStorage, getShowDrafts, getShowDraftsServer);
  const [, forceRender] = useState(0);

  const toggleDrafts = useCallback(() => {
    try {
      const next = !getShowDrafts();
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      window.dispatchEvent(new CustomEvent(DRAFTS_CHANGE_EVENT));
    } catch {
      // localStorage unavailable
    }
    forceRender((n) => n + 1);
  }, []);

  return (
    <footer className="mt-16 flex justify-center gap-3 flex-wrap">
      {showHome && (
        <IconCircleButton
          href="/"
          icon="fa-home"
          title="Home"
          size="md"
          iconClassName="text-[14px]"
        />
      )}
      <IconCircleButton
        href="https://www.linkedin.com/in/jkvc"
        icon="fa-linkedin"
        iconFamily="fa-brands"
        title="LinkedIn"
        size="md"
        iconClassName="text-[14px]"
      />
      <IconCircleButton
        href="https://github.com/jkvc"
        icon="fa-github"
        iconFamily="fa-brands"
        title="GitHub"
        size="md"
        iconClassName="text-[14px]"
      />
      <IconCircleButton
        href="https://scholar.google.com/citations?user=eg-CJG0AAAAJ"
        icon="fa-graduation-cap"
        title="Google Scholar"
        size="md"
        iconClassName="text-[14px]"
      />
      <EmailButton />
      {showDraftToggle && (
        <IconCircleButton
          onClick={toggleDrafts}
          icon={showDrafts ? "fa-eye" : "fa-eye-slash"}
          title={showDrafts ? "Hide drafts" : "Show drafts"}
          size="md"
          active={showDrafts}
          iconClassName="text-[13px]"
        />
      )}
    </footer>
  );
}
