"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ChargeStatusPanel from "@/app/components/ChargeStatusPanel";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
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
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <RecipeHeader meta={{ issue: "ADMIN" }} backHref="/admin" />
        <h1 className="mt-6 font-serif italic text-5xl leading-[1.05] tracking-[-0.02em] text-ink">
          Charge Usage
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <p className="text-base leading-relaxed text-ink-muted max-w-xl flex-1">
            Manage charge pools. Top off individual pools or all at once.
          </p>
          <Pill onClick={handleTopOffAll} icon="fa-bolt" size="xs" active>
            top off all
          </Pill>
        </div>

        <div className="mt-12">
          <ChargeStatusPanel showTopOff />
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
  );
}
