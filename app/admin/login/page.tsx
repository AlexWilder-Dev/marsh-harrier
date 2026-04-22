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
    <main className="min-h-screen bg-forest-deep flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-sans text-ochre text-xs tracking-widest uppercase mb-3">
            Staff access
          </p>
          <h1 className="font-serif font-light text-parchment-light text-3xl">
            The Marsh Harrier
          </h1>
          <p className="font-serif italic text-parchment-light/30 text-lg mt-1">
            Order Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block font-sans text-[15px] tracking-widest uppercase text-parchment-light/40 mb-2"
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
              className="w-full bg-forest-rich border border-parchment-light/10 text-parchment-light font-sans text-base px-4 py-3.5 placeholder-parchment-light/20 focus:outline-none focus:border-ochre/50 transition-colors"
              placeholder="Enter staff password"
            />
          </div>

          {error && (
            <p className="font-sans text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full font-sans text-xs tracking-widest uppercase px-6 py-4 bg-ochre text-parchment-light hover:bg-ochre-light disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
