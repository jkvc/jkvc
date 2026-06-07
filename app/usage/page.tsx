import type { Metadata } from "next";
import ChargeStatusPanel from "@/app/components/ChargeStatusPanel";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";

export const metadata: Metadata = {
  title: "Usage — jkvc",
  description: "Live charge levels for all interactive demos.",
};

export default function UsagePage() {
  return (
    <InteriorPageShell maxWidthClassName="max-w-2xl">
      <PageStampHeader
        meta={{ eyebrow: "USAGE", icon: "fa-bolt" }}
        title="Usage"
        subtitle="Each demo uses AI models that cost real money. Charges accumulate automatically over time — once depleted, wait for a recharge."
      />

      <div className="mt-12">
        <ChargeStatusPanel />
      </div>
    </InteriorPageShell>
  );
}
