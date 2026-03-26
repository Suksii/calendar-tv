'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { addShow, removeShow } from '@/lib/actions';

type Show = { id: string; title: string };
type ConfirmState = { id: string; title: string } | null;

export default function ShowCatalog({ shows: initial, isAdmin }: { shows: Show[]; isAdmin: boolean }) {
  const [shows, setShows] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const show = await addShow(newTitle.trim());
      setShows((prev) => [...prev, show].sort((a, b) => a.title.localeCompare(b.title)));
      setNewTitle('');
      toast.success(`Emisija "${show.title}" dodana u katalog.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri dodavanju emisije.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!confirm) return;
    const { id, title } = confirm;
    setConfirm(null);
    try {
      await removeShow(id);
      setShows((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Emisija "${title}" obrisana.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju emisije.');
    }
  }

  return (
    <>
      <div className="max-w-lg space-y-4">
        {isAdmin && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Naziv emisije (npr. Dnevnik 1)"
              className="flex-1 bg-transparent border border-zinc-600 text-zinc-100 placeholder-zinc-500 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 disabled:opacity-50 text-white font-semibold rounded px-5 py-2.5 text-sm transition-all duration-200 uppercase tracking-wider"
            >
              Dodaj
            </button>
          </form>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {shows.length === 0 ? (
            <p className="text-zinc-500 text-sm p-4">Nema emisija u katalogu.</p>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {shows.map((show) => (
                <li key={show.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/40 transition-colors">
                  <span className="text-sm text-zinc-200">{show.title}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setConfirm({ id: show.id, title: show.title })}
                      className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
                    >
                      Obriši
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          title="Obriši emisiju"
          message={`Brisanjem emisije "${confirm.title}" biće obrisani i svi termini vezani za nju. Ova radnja se ne može poništiti.`}
          confirmLabel="Obriši"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
