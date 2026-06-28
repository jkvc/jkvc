"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import KleinDemoCard from "@/app/components/admin/KleinDemoCard";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import Pill from "@/app/components/editorial/Pill";

const DEMO_NAME = "Klein 9B";

export default function KleinDemoPage() {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }, [router]);

  return (
    <InteriorPageShell maxWidthClassName="max-w-2xl">
      <PageStampHeader
        meta={{ eyebrow: "ADMIN · DEMO", icon: "fa-flask" }}
        title={DEMO_NAME}
        subtitle="Flux Klein inference on Modal. 768×768 output with live SSE progress."
      />

      <div className="mt-12 flex flex-col gap-6">
        <KleinDemoCard
          demoName={DEMO_NAME}
          mode="t2i"
          icon="fa-image"
          title="Text to image"
          description="Generate from a prompt only. Progress events stream in as denoising runs."
        />
        <KleinDemoCard
          demoName={DEMO_NAME}
          mode="i2i"
          icon="fa-images"
          title="Image to image"
          description="Upload one or more conditioning images plus a prompt."
        />
      </div>

      <div className="mt-16 flex justify-center">
        <Pill onClick={handleLogout} icon="fa-right-from-bracket" size="xs">
          log out
        </Pill>
      </div>
    </InteriorPageShell>
  );
}
