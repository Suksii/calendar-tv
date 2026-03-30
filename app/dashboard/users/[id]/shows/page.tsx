"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

type Show = { id: string; title: string };

export default function UserShowsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [allShows, setAllShows] = useState<Show[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/shows").then((r) => r.json()),
      fetch(`/api/users/${id}/shows`).then((r) => r.json()),
    ]).then(([shows, assignedIds]: [Show[], string[]]) => {
      setAllShows(shows);
      setSelected(new Set(assignedIds));
      setLoading(false);
    });
  }, [id]);

  function toggle(showId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(showId) ? next.delete(showId) : next.add(showId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/users/${id}/shows`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showIds: Array.from(selected) }),
    });
    if (res.ok) {
      toast.success("Emisije su sačuvane.");
      router.push("/dashboard/users");
    } else {
      toast.error("Greška pri čuvanju.");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Dodjela emisija</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Odaberite emisije koje ovaj korisnik može unositi u raspored.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6 max-w-md">
        {loading ? (
          <p className="text-zinc-500 text-sm p-4">Učitavanje...</p>
        ) : allShows.length === 0 ? (
          <p className="text-zinc-500 text-sm p-4">Nema emisija u katalogu.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {allShows.map((show) => (
              <li key={show.id}>
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={selected.has(show.id)}
                    onChange={() => toggle(show.id)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span className="text-sm text-zinc-200">{show.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} loading={saving} disabled={loading}>
          Sačuvaj
        </Button>
        <Button variant="secondary" onClick={() => router.push("/dashboard/users")}>
          Otkaži
        </Button>
      </div>
    </div>
  );
}
