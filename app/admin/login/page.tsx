"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import InteriorPageShell from "@/app/components/editorial/InteriorPageShell";
import PageStampHeader from "@/app/components/editorial/PageStampHeader";
import Pill from "@/app/components/editorial/Pill";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.trim() }),
        });

        if (res.ok) {
          const raw = searchParams.get("from") || "/admin";
          const from = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";
          router.push(from);
        } else {
          setError("nope");
          setToken("");
        }
      } catch {
        setError("something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [token, searchParams, router],
  );

  return (
    <InteriorPageShell maxWidthClassName="max-w-2xl">
      <PageStampHeader
        meta={{ eyebrow: "ADMIN", icon: "fa-lock" }}
        title="Admin"
        subtitle="Say the magic word."
      />

      <form onSubmit={handleSubmit} className="mt-12 max-w-xs">
        <input
          id="magic-word"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="···"
          autoFocus
          autoComplete="off"
          className="w-full border-b border-rule bg-transparent py-2 text-[15px] text-ink outline-none transition-colors placeholder:text-rule focus:border-ink"
        />
        {error && <p className="caption-mono mt-3 text-hot">{error}</p>}
        <div className="mt-6">
          <Pill type="submit" disabled={loading || !token.trim()} size="xs">
            {loading ? (
              <i className="fa-solid fa-spinner animate-spin" aria-hidden="true" />
            ) : (
              "enter"
            )}
          </Pill>
        </div>
      </form>
    </InteriorPageShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
