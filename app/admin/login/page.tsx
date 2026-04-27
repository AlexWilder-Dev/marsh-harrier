"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authed, go straight to dashboard
  useEffect(() => {
    fetch("/api/tables").then((r) => {
      if (r.ok) router.replace("/admin");
    }).catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.replace("/admin");
    } else {
      const data = await res.json();
      setError(data.error ?? "Incorrect password");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ochre flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-sans text-ink text-xs tracking-widest uppercase mb-3">
            Staff access
          </p>
          <h1 className="font-serif font-light text-ink text-3xl">
            The Marsh Harrier
          </h1>
          <p className="font-serif italic text-ink/40 text-lg mt-1">
            Order Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block font-sans text-[15px] tracking-widest uppercase text-ink/50 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full bg-parchment border border-ink/15 text-ink font-sans text-base px-4 py-3.5 placeholder-ink/25 focus:outline-none focus:border-ink/40 transition-colors"
              placeholder="Enter staff password"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-parchment text-ink hover:bg-parchment-dark disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
