"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Suspense } from "react";

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
    <div className="min-h-screen bg-surface text-ink px-6 pt-16 pb-16 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="mt-6 font-serif italic text-5xl leading-[1.05] tracking-[-0.02em] text-ink">
          Admin
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted max-w-xl">
          Say the magic word.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 max-w-xs">
          <input
            id="magic-word"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="···"
            autoFocus
            autoComplete="off"
            className="w-full bg-transparent border-b border-rule text-[15px] text-ink py-2 outline-none focus:border-ink transition-colors placeholder:text-rule"
          />
          {error && (
            <p className="caption-mono text-hot mt-3">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="mt-6 caption-mono rounded-full border border-rule text-ink-muted hover:border-ink hover:text-ink transition-colors h-8 px-5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? (
              <i
                className="fa-solid fa-spinner animate-spin"
                aria-hidden="true"
              />
            ) : (
              "enter"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
