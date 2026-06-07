"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import LabeledDivider from "@/app/components/editorial/LabeledDivider";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import Pill from "@/app/components/editorial/Pill";
import StampShell from "@/app/components/ui/StampShell";
import { STAMP_CONTROL_SHADOW, STAMP_FACE } from "@/app/lib/stamp";
import { twMerge } from "tailwind-merge";

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
    <InteriorPageShell maxWidthClassName="max-w-2xl">
      <PageStampHeader
        meta={{ eyebrow: "ADMIN", icon: "fa-lock" }}
        title="Admin"
        subtitle="Site administration."
      />

      <div className="mt-12">
        <LabeledDivider variant="full">Tools</LabeledDivider>

        <div className="mt-6 flex flex-col gap-4">
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="group block">
              <StampShell
                variant="card"
                interactive
                bleed={false}
                faceClassName="p-5 group-hover:border-hot"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={twMerge(
                      STAMP_FACE,
                      STAMP_CONTROL_SHADOW,
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center bg-surface text-ink transition-colors group-hover:border-hot group-hover:text-hot",
                    )}
                    aria-hidden="true"
                  >
                    <i className={`fa-solid ${link.icon} text-[13px]`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="caption-mono text-ink">{link.label}</div>
                    <p className="mt-1 text-[13px] leading-snug text-ink-faint">
                      {link.description}
                    </p>
                  </div>
                  <i
                    className="fa-solid fa-chevron-right shrink-0 text-xs text-rule transition-colors group-hover:text-ink-muted"
                    aria-hidden="true"
                  />
                </div>
              </StampShell>
            </Link>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Pill onClick={handleLogout} icon="fa-right-from-bracket" size="xs">
            log out
          </Pill>
        </div>
      </div>
    </InteriorPageShell>
  );
}
