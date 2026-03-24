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

  // keep popover on screen
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 300),
    top: Math.min(position.y, window.innerHeight - 350),
    zIndex: 50,
  };

  return (
    <div ref={ref} style={style} className="w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-2">{entry.show_title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">✕</button>
      </div>

      <div className="space-y-1.5 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🕐</span>
          <span>
            {entry.time}
            {entry.duration ? ` · ${entry.duration} min` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              entry.type === 'uzivo' ? 'bg-primary-100 text-primary-700' : 'bg-snimanje-100 text-snimanje-700'
            }`}
          >
            {entry.type === 'uzivo' ? 'Uživo' : 'Snimanje'}
          </span>
        </div>
        {entry.host && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">🎙️</span>
            <span>{entry.host}</span>
          </div>
        )}
        {entry.guests.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400 mt-0.5">👥</span>
            <span>{entry.guests.map((g) => g.name).join(', ')}</span>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 text-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Uredi
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex-1 text-xs bg-danger-50 hover:bg-danger-100 text-danger-600 font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Obriši
          </button>
        </div>
      )}
    </div>
  );
}
