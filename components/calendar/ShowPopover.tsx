'use client';

import { useEffect, useRef } from 'react';

type Entry = {
  id: string;
  show_title: string;
  date: string;
  time: string;
  duration: number | null;
  type: 'uzivo' | 'snimanje';
  host: string | null;
  guests: { id: string; name: string }[];
};

type Props = {
  entry: Entry;
  position: { x: number; y: number };
  isAdmin: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
};

export default function ShowPopover({ entry, position, isAdmin, onClose, onEdit, onDelete }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !e.composedPath().includes(ref.current)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 300),
    top: Math.min(position.y, window.innerHeight - 350),
    zIndex: 50,
  };

  return (
    <div ref={ref} style={style} className="w-72 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-zinc-100 text-sm leading-tight pr-2">{entry.show_title}</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 shrink-0 transition-colors">✕</button>
      </div>

      <div className="space-y-1.5 text-sm text-zinc-400 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">🕐</span>
          <span>
            {entry.time}
            {entry.duration ? ` · ${entry.duration} min` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              entry.type === 'uzivo'
                ? 'bg-red-900/30 text-red-400'
                : 'bg-purple-900/30 text-purple-400'
            }`}
          >
            {entry.type === 'uzivo' ? 'Uživo' : 'Snimanje'}
          </span>
        </div>
        {entry.host && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">🎙️</span>
            <span>{entry.host}</span>
          </div>
        )}
        {entry.guests.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-zinc-500 mt-0.5">👥</span>
            <span>{entry.guests.map((g) => g.name).join(', ')}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onEdit}
            className="flex-1 text-center text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Uredi
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex-1 text-xs bg-red-950/40 hover:bg-red-950/60 text-red-500 font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Obriši
          </button>
        </div>
      )}
    </div>
  );
}
