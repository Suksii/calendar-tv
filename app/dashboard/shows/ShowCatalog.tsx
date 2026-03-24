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

  async function handleAdd(e: React.FormEvent) {
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
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Dodaj
            </button>
          </form>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {shows.length === 0 ? (
            <p className="text-gray-500 text-sm p-4">Nema emisija u katalogu.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {shows.map((show) => (
                <li key={show.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-900">{show.title}</span>
                  {isAdmin && (
                    <button
                      onClick={() => setConfirm({ id: show.id, title: show.title })}
                      className="text-xs text-danger-500 hover:text-danger-700 font-medium transition-colors"
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
