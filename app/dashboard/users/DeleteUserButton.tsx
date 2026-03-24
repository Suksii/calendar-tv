'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { removeUser } from '@/lib/actions';

export default function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setOpen(false);
    try {
      await removeUser(userId);
      toast.success('Korisnik je obrisan.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Greška pri brisanju korisnika.');
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-danger-500 hover:text-danger-700 font-medium transition-colors"
      >
        Obriši
      </button>

      {open && (
        <ConfirmModal
          title="Obriši korisnika"
          message="Jeste li sigurni da želite obrisati ovog korisnika? Ova radnja se ne može poništiti."
          confirmLabel="Obriši"
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
