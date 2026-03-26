"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/dashboard/calendar");
    } else {
      const data = await res.json();
      setError(data.error ?? "Greška pri prijavi.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-black via-zinc-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-red-600/20 via-red-800/20 to-red-600/20 rounded blur-xl opacity-50"></div>
          <div className="relative bg-zinc-900/90 backdrop-blur-2xl rounded shadow-2xl border border-zinc-800/50 overflow-hidden">
            <div className="h-1 bg-linear-to-r from-transparent via-red-600 to-transparent"></div>
            <div className="pt-12 pb-8 px-8 text-center relative">
              <div className="relative inline-block mb-8 group text-white">
                <span>TV kalendar</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm">
                <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                <p>Pristup administratorskom panelu</p>
                <div className="w-1 h-1 bg-red-600 rounded-full"></div>
              </div>
            </div>
            <div className="px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
                <Input
                  label="Lozinka"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />

                {error && <p className="text-sm text-danger-600">{error}</p>}

                <Button type="submit" loading={loading} fullWidth>
                  Prijavi se
                </Button>
              </form>
            </div>
            <div className="h-1 bg-linear-to-r from-transparent via-red-600/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </main>
  );
}
