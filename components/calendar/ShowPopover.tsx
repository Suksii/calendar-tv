"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Entry = {
  id: string;
  show_title: string;
  date: string;
  time: string;
  duration: number | null;
  channel: string;
  type: "uzivo" | "snimanje";
  host: string | null;
  topic: string | null;
  guests: { id: string; name: string }[];
};

type Props = {
  entry: Entry;
  position: { x: number; y: number };
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 w-20 shrink-0">
      {children}
    </span>
  );
}

export default function ShowPopover({
  entry,
  position,
  canEdit,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !e.composedPath().includes(ref.current)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const desktopStyle: React.CSSProperties = isMobile
    ? {}
    : {
        position: "fixed",
        left: Math.min(position.x, window.innerWidth - 380),
        top: Math.min(position.y, window.innerHeight - 320),
        zIndex: 50,
        width: 360,
      };

  const mobileStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
      }
    : {};

  const style = { ...desktopStyle, ...mobileStyle };

  return (
    <motion.div
      ref={ref}
      style={style}
      className="bg-zinc-900 border border-zinc-700 shadow-2xl p-5 sm:rounded-xl rounded-t-2xl"
      initial={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.92, y: -4 }}
      animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
      exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-zinc-100 text-base leading-tight pr-3">
          {entry.show_title}
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-200 shrink-0 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-3">
          <Label>Program</Label>
          <span className="text-sm font-semibold text-zinc-100">{entry.channel}</span>
        </div>

        <div className="flex items-center gap-3">
          <Label>Tip</Label>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              entry.type === "uzivo"
                ? "bg-red-900/30 text-red-400"
                : "bg-purple-900/30 text-purple-400"
            }`}
          >
            {entry.type === "uzivo" ? "Uživo" : "Snimanje"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Label>Vrijeme</Label>
          <span className="text-sm text-zinc-200 font-mono">
            {entry.time}
            {entry.duration ? (
              <span className="text-zinc-500 font-sans ml-1.5">· {entry.duration} min</span>
            ) : null}
          </span>
        </div>

        {entry.host && (
          <div className="flex items-center gap-3">
            <Label>Voditelj</Label>
            <span className="text-sm text-zinc-200">{entry.host}</span>
          </div>
        )}

        {entry.guests.length > 0 && (
          <div className="flex items-start gap-3">
            <Label>Gosti</Label>
            <span className="text-sm text-zinc-200 leading-snug">
              {entry.guests.map((g) => g.name).join(", ")}
            </span>
          </div>
        )}

        {entry.topic && (
          <div className="flex items-start gap-3 pt-2 border-t border-zinc-800">
            <Label>Tema</Label>
            <span className="text-sm text-zinc-300 leading-snug">{entry.topic}</span>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-2 pt-3 border-t border-zinc-800">
          <button
            onClick={onEdit}
            className="flex-1 text-center text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg px-3 py-2 transition-colors"
          >
            Uredi
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex-1 text-sm bg-red-950/40 hover:bg-red-950/60 text-red-500 font-medium rounded-lg px-3 py-2 transition-colors"
          >
            Obriši
          </button>
        </div>
      )}
    </motion.div>
  );
}
