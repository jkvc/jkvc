import type { Metadata } from "next";
import { SITE } from "@/app/lib/site";

// `description` intentionally omitted — the About page inherits the root
// site description from `app/layout.tsx` so we have a single source of truth.
export const metadata: Metadata = {
  title: SITE.fullName,
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
