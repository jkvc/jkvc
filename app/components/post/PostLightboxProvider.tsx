"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ImageLightbox from "@/app/components/ui/ImageLightbox";

type LightboxState = { src: string; alt: string } | null;

const PostLightboxContext = createContext<{
  openLightbox: (src: string, alt: string) => void;
} | null>(null);

export function usePostLightbox() {
  const ctx = useContext(PostLightboxContext);
  if (!ctx) {
    throw new Error("usePostLightbox must be used within PostLightboxProvider");
  }
  return ctx;
}

export function PostLightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState>(null);

  const openLightbox = useCallback((src: string, alt: string) => {
    if (!src) return;
    setState({ src, alt });
  }, []);

  const close = useCallback(() => setState(null), []);

  const value = useMemo(() => ({ openLightbox }), [openLightbox]);

  return (
    <PostLightboxContext.Provider value={value}>
      {children}
      {state ? (
        <ImageLightbox
          open
          src={state.src}
          alt={state.alt}
          onClose={close}
        />
      ) : null}
    </PostLightboxContext.Provider>
  );
}
