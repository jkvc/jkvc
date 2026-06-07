import type { Metadata } from "next";
import RecipeHeader from "@/app/components/editorial/RecipeHeader";
import ChargeStatusPanel from "@/app/components/ChargeStatusPanel";

export const metadata: Metadata = {
  title: "Usage — jkvc",
  description: "Live charge levels for all interactive demos.",
};

export default function UsagePage() {
  return (
    <div className="min-h-screen text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <RecipeHeader meta={{ issue: "USAGE", kindIcon: "fa-bolt" }} />
        <h1 className="mt-6 font-sans font-black text-5xl leading-[1.05] tracking-tight text-ink uppercase">
          Usage
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-xl">
          Each demo uses AI models that cost real money. Charges accumulate
          automatically over time — once depleted, wait for a recharge.
        </p>

        <div className="mt-12">
          <ChargeStatusPanel />
        </div>
      </div>
    </div>
  );
}
