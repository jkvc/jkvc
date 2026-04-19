import type { Metadata } from "next";
import { SITE } from "@/app/lib/site";

export const metadata: Metadata = {
  title: SITE.fullName,
  description: SITE.about.description,
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
