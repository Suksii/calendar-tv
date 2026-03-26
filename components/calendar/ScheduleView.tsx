"use client";

import { useCallback, useEffect, useState } from "react";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { hr } from "date-fns/locale";
import { toast } from "sonner";
import EntryModal from "./EntryModal";
import ShowPopover from "./ShowPopover";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "../ui/Button";
import { MoveLeft, MoveRight } from "lucide-react";
import { getEntries, getShows, deleteEntry, type Show, type Entry } from "@/lib/api";

type Props = { isAdmin: boolean };

const DAY_NAMES = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

export default function ScheduleView({ isAdmin }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [popoverEntry, setPopoverEntry] = useState<Entry | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");
  const month = format(selectedDay, "yyyy-MM");

  const fetchEntries = useCallback(async (m: string) => {
    try {
      setEntries(await getEntries(m));
    } catch {
      toast.error("Greška pri učitavanju termina.");
    }
  }, []);

  const fetchShows = useCallback(async () => {
    try {
      setShows(await getShows());
    } catch {
      // tiha greška — dropdown će biti prazan
    }
  }, []);

  useEffect(() => {
    fetchEntries(month);
    fetchShows();
  }, [fetchEntries, fetchShows, month]);

  const dayEntries = entries
    .filter((e) => e.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  function prevWeek() {
    const prev = subWeeks(weekStart, 1);
    setWeekStart(prev);
    setSelectedDay(prev);
  }

  function nextWeek() {
    const next = addWeeks(weekStart, 1);
    setWeekStart(next);
    setSelectedDay(next);
  }

  function handleRowClick(entry: Entry, e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopoverPos({ x: rect.left, y: rect.bottom + 4 });
    setPopoverEntry(entry);
  }

  function handleEdit(entry: Entry) {
    setEditingEntry(entry);
    setModalDate(entry.date);
    setPopoverEntry(null);
  }

  function handleDelete(id: string) {
    const entry = entries.find((e) => e.id === id) ?? null;
    setPopoverEntry(null);
    setDeleteTarget(entry);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      toast.success("Termin je obrisan.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Greška pri brisanju termina.");
    }
    setDeleteTarget(null);
  }

  function handleSaved() {
    fetchEntries(month);
    fetchShows();
  }

  const weekLabel = `${format(weekStart, "dd.MM")} – ${format(addDays(weekStart, 6), "dd.MM.yyyy")}`;

  return (
    <>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Week navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <Button variant="secondary" size="sm" onClick={prevWeek} aria-label="Prethodna sedmica">
            <MoveLeft size={14} />
          </Button>
          <span className="text-sm font-medium text-zinc-300">{weekLabel}</span>
          <Button variant="secondary" size="sm" onClick={nextWeek} aria-label="Sljedeća sedmica">
            <MoveRight size={14} />
          </Button>
        </div>

        {/* Day tabs */}
        <div className="flex overflow-x-auto border-b border-zinc-800 scrollbar-none">
          {days.map((day, i) => {
            const isSelected = format(day, "yyyy-MM-dd") === selectedDateStr;
            const todayDay = isToday(day);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-20 py-3 text-center text-sm font-medium transition-colors border-r last:border-r-0 border-zinc-800 shrink-0 ${
                  isSelected
                    ? "bg-red-600 text-white"
                    : todayDay
                      ? "bg-red-950/40 text-red-400 hover:bg-red-950/60"
                      : "text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <div className="text-xs uppercase tracking-wide opacity-80">
                  {DAY_NAMES[i]}
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  {format(day, "dd.MM.")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Schedule list */}
        <div>
          {dayEntries.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Nema emisija za{" "}
              {format(selectedDay, "dd.MM.yyyy", { locale: hr })}.
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setModalDate(selectedDateStr);
                  }}
                  className="block mx-auto mt-3 text-red-500 hover:text-red-400 font-medium transition-colors"
                >
                  + Dodaj termin
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <tbody>
                {dayEntries.map((entry, i) => (
                  <tr
                    key={entry.id}
                    onClick={(e) => handleRowClick(entry, e)}
                    className={`cursor-pointer transition-colors ${
                      i % 2 === 0
                        ? "bg-zinc-900 hover:bg-zinc-800"
                        : "bg-zinc-800/30 hover:bg-zinc-800"
                    }`}
                  >
                    <td className="w-20 px-5 py-3 text-sm font-bold text-zinc-200 tabular-nums">
                      {entry.time}
                    </td>
                    <td className="px-3 py-3 text-sm text-zinc-200">
                      {entry.show_title}
                      {entry.type === "snimanje" && (
                        <span className="ml-2 text-xs text-zinc-500">
                          snimanje
                        </span>
                      )}
                    </td>
                    {entry.duration && (
                      <td className="px-5 py-3 text-xs text-zinc-500 text-right tabular-nums whitespace-nowrap">
                        {entry.duration} min
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Admin — dodaj termin */}
        {isAdmin && dayEntries.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800">
            <button
              onClick={() => {
                setEditingEntry(null);
                setModalDate(selectedDateStr);
              }}
              className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
            >
              + Dodaj termin za {format(selectedDay, "dd.MM.", { locale: hr })}
            </button>
          </div>
        )}
      </div>

      {/* Popover */}
      {popoverEntry && (
        <ShowPopover
          entry={popoverEntry}
          position={popoverPos}
          isAdmin={isAdmin}
          onClose={() => setPopoverEntry(null)}
          onEdit={() => handleEdit(popoverEntry)}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      {modalDate && (
        <EntryModal
          date={modalDate}
          entry={editingEntry}
          shows={shows}
          onClose={() => {
            setModalDate(null);
            setEditingEntry(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Confirm brisanja */}
      {deleteTarget && (
        <ConfirmModal
          title="Obriši termin"
          message={`Jeste li sigurni da želite obrisati termin "${deleteTarget.show_title}" (${deleteTarget.date} u ${deleteTarget.time})?`}
          confirmLabel="Obriši"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
