"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import AdminLinkCard, { type AdminLinkItem } from "@/app/components/admin/AdminLinkCard";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import LabeledDivider from "@/app/components/editorial/LabeledDivider";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import Pill from "@/app/components/editorial/Pill";

const TOOL_LINKS: AdminLinkItem[] = [
  {
    href: "/admin/usage",
    icon: "fa-bolt",
    label: "Charge Usage",
    description:
      "View and manage charge pools for all metered API endpoints. Top off individual pools.",
  },
];

const DEMO_LINKS: AdminLinkItem[] = [
  {
    href: "/admin/demos/klein",
    icon: "fa-flask",
    label: "Klein 9B",
    description:
      "Flux Klein text-to-image and image-to-image via Modal streaming. Live progress log and WebP output.",
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

      <div className="mt-12 flex flex-col gap-10">
        <section>
          <LabeledDivider variant="full">Tools</LabeledDivider>
          <div className="mt-6 flex flex-col gap-4">
            {TOOL_LINKS.map((link) => (
              <AdminLinkCard key={link.href} {...link} />
            ))}
          </div>
        </section>

        <section>
          <LabeledDivider variant="full">Demos</LabeledDivider>
          <div className="mt-6 flex flex-col gap-4">
            {DEMO_LINKS.map((link) => (
              <AdminLinkCard key={link.href} {...link} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-16 flex justify-center">
        <Pill onClick={handleLogout} icon="fa-right-from-bracket" size="xs">
          log out
        </Pill>
      </div>
    </InteriorPageShell>
  );
}
