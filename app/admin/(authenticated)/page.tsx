"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
import LabeledDivider from "@/app/components/editorial/LabeledDivider";
import Pill from "@/app/components/editorial/Pill";

interface AdminLink {
  href: string;
  icon: string;
  label: string;
  description: string;
}

const ADMIN_LINKS: AdminLink[] = [
  {
    href: "/admin/usage",
    icon: "fa-bolt",
    label: "Charge Usage",
    description:
      "View and manage charge pools for all metered API endpoints. Top off individual pools.",
  },
];

export default function AdminPage() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <RecipeHeader meta={{ issue: "ADMIN", kindIcon: "fa-lock" }} />
        <h1 className="mt-6 font-serif italic text-5xl leading-[1.05] tracking-[-0.02em] text-ink">
          Admin
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-xl">
          Site administration.
        </p>

        <div className="mt-12">
          <LabeledDivider variant="full">Tools</LabeledDivider>

      <div className="divide-y divide-rule">
        {ADMIN_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 py-4 group transition-colors hover:bg-surface-deep -mx-4 px-4 rounded-lg"
          >
            <div className="w-10 h-10 rounded-full border border-rule flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
              <i
                className={`fa-solid ${link.icon} text-ink-muted group-hover:text-ink transition-colors`}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="caption-mono text-ink">{link.label}</div>
              <div className="text-[13px] text-ink-faint leading-snug mt-0.5">
                {link.description}
              </div>
            </div>
            <i
              className="fa-solid fa-chevron-right text-rule group-hover:text-ink-muted transition-colors text-xs"
              aria-hidden="true"
            />
          </a>
        ))}
      </div>

        <div className="mt-16 flex justify-center">
          <Pill
            onClick={handleLogout}
            icon="fa-right-from-bracket"
            size="xs"
          >
            log out
          </Pill>
        </div>
        </div>
      </div>
    </div>
  );
}
