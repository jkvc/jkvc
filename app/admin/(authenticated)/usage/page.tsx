"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ChargeStatusPanel from "@/app/components/ChargeStatusPanel";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import Pill from "@/app/components/editorial/Pill";
import { CHARGE_POOLS } from "@/app/lib/charge-pools";

export default function AdminUsagePage() {
  const router = useRouter();

  const handleTopOffAll = useCallback(async () => {
    await Promise.all(
      CHARGE_POOLS.map((pool) =>
        fetch("/api/admin/usage/topoff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ poolId: pool.id }),
        }),
      ),
    );
    window.location.reload();
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }, [router]);

  return (
    <InteriorPageShell maxWidthClassName="max-w-2xl">
      <PageStampHeader
        meta={{ eyebrow: "ADMIN", icon: "fa-lock" }}
        
        title="Charge Usage"
        subtitle="Manage charge pools. Top off individual pools or all at once."
        trailing={
          <div className="flex flex-wrap items-center gap-3">
            <Pill onClick={handleTopOffAll} icon="fa-bolt" size="xs" active>
              top off all
            </Pill>
          </div>
        }
      />

      <div className="mt-12">
        <ChargeStatusPanel showTopOff />
      </div>

      <div className="mt-16 flex justify-center">
        <Pill onClick={handleLogout} icon="fa-right-from-bracket" size="xs">
          log out
        </Pill>
      </div>
    </InteriorPageShell>
  );
}
