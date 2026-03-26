"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { hr } from "date-fns/locale";
import { toast } from "sonner";
import EntryModal from "./EntryModal";
import ShowPopover from "./ShowPopover";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "../ui/Button";
import { MoveLeft, MoveRight } from "lucide-react";
import {
  getEntries,
  getShows,
  deleteEntry,
  type Show,
  type Entry,
  type Channel,
} from "@/lib/api";

const CHANNELS: { value: Channel; label: string }[] = [
  { value: "RTCG1", label: "RTCG1" },
  { value: "RTCG2", label: "RTCG2" },
  { value: "SAT", label: "SAT" },
  { value: "PAR", label: "PAR" },
];

type Props = {
  isAdmin: boolean;
  initialEntries: Entry[];
  initialShows: Show[];
  initialMonth: string;
};

const DAY_NAMES = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

const weekVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

const scheduleVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04 },
  }),
};

export default function ScheduleView({
  isAdmin,
  initialEntries,
  initialShows,
  initialMonth,
}: Props) {
  const [{ date: dateStr, channel }, setParams] = useQueryStates({
    date: parseAsString.withDefault(format(new Date(), "yyyy-MM-dd")),
    channel: parseAsStringLiteral(["RTCG1", "RTCG2", "SAT", "PAR"] as const).withDefault("RTCG1"),
  }, { shallow: false });

  // Koristimo T00:00:00 da spriječimo UTC timezone pomak
  const selectedDay = new Date(dateStr + "T00:00:00");

  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [shows, setShows] = useState<Show[]>(initialShows);
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [popoverEntry, setPopoverEntry] = useState<Entry | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Entry | null>(null);
  const [slideDir, setSlideDir] = useState(1);

  const loadedMonths = useRef<Set<string>>(new Set([initialMonth]));

  const weekStart = startOfWeek(selectedDay, { weekStartsOn: 1 });
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

  useEffect(() => {
    if (loadedMonths.current.has(month)) return;
    loadedMonths.current.add(month);
    fetchEntries(month);
  }, [month, fetchEntries]);

  const dayEntries = entries
    .filter((e) => e.date === selectedDateStr && e.channel === channel)
    .sort((a, b) => a.time.localeCompare(b.time));

  function prevWeek() {
    setSlideDir(-1);
    setParams({ date: format(subWeeks(weekStart, 1), "yyyy-MM-dd") });
  }

  function nextWeek() {
    setSlideDir(1);
    setParams({ date: format(addWeeks(weekStart, 1), "yyyy-MM-dd") });
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
      toast.error(
        err instanceof Error ? err.message : "Greška pri brisanju termina.",
      );
    }
    setDeleteTarget(null);
  }

  async function handleSaved() {
    loadedMonths.current.delete(month);
    await fetchEntries(month);
    loadedMonths.current.add(month);
    try {
      setShows(await getShows());
    } catch {
      /* tiha greška */
    }
  }

  const weekLabel = `${format(weekStart, "dd.MM")} – ${format(addDays(weekStart, 6), "dd.MM.yyyy")}`;

  return (
    <>
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Channel tabs */}
        <div className="flex border-b border-zinc-800">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              onClick={() => setParams({ channel: ch.value })}
              className={`flex-1 py-2.5 text-sm font-semibold tracking-wide transition-colors border-r last:border-r-0 border-zinc-800 ${
                channel === ch.value
                  ? "bg-red-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevWeek}
            aria-label="Prethodna sedmica"
          >
            <MoveLeft size={14} />
          </Button>
          <AnimatePresence mode="wait" initial={false} custom={slideDir}>
            <motion.span
              key={weekLabel}
              custom={slideDir}
              variants={weekVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-zinc-300"
            >
              {weekLabel}
            </motion.span>
          </AnimatePresence>
          <Button
            variant="secondary"
            size="sm"
            onClick={nextWeek}
            aria-label="Sljedeća sedmica"
          >
            <MoveRight size={14} />
          </Button>
        </div>

        {/* Day tabs */}
        <div className="overflow-hidden border-b border-zinc-800">
          <AnimatePresence mode="wait" initial={false} custom={slideDir}>
            <motion.div
              key={weekStart.getTime()}
              custom={slideDir}
              variants={weekVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="flex overflow-x-auto scrollbar-none"
            >
              {days.map((day, i) => {
                const isSelected =
                  format(day, "yyyy-MM-dd") === selectedDateStr;
                const todayDay = isToday(day);
                return (
                  <motion.button
                    key={i}
                    onClick={() => setParams({ date: format(day, "yyyy-MM-dd") })}
                    whileTap={{ scale: 0.95 }}
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
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Schedule list */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDateStr}
            variants={scheduleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.18 }}
          >
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
                    <motion.tr
                      key={entry.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={(e) => handleRowClick(entry, e)}
                      whileHover={{ backgroundColor: "rgba(39,39,42,0.8)" }}
                      className={`cursor-pointer ${
                        i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"
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
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </AnimatePresence>

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
      <AnimatePresence>
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
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {modalDate && (
          <EntryModal
            date={modalDate}
            entry={editingEntry}
            defaultChannel={channel}
            shows={shows}
            onClose={() => {
              setModalDate(null);
              setEditingEntry(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Confirm brisanja */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            title="Obriši termin"
            message={`Jeste li sigurni da želite obrisati termin "${deleteTarget.show_title}" (${deleteTarget.date} u ${deleteTarget.time})?`}
            confirmLabel="Obriši"
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
