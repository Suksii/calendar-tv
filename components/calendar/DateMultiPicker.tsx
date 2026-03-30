"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  format,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";
import { bs } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const DAY_LABELS = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
// date-fns getDay: 0=Sun,1=Mon,...,6=Sat — mapped to Mon-first index
const ISO_DAY: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };

type Props = {
  initialDate: string;
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
};

export default function DateMultiPicker({ initialDate, selected, onChange }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = initialDate.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  // Build grid rows
  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= monthEnd || days.length % 7 !== 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    if (days.length > 42) break;
  }

  function toggle(dateStr: string) {
    if (dateStr === initialDate) return; // initial date is always selected
    const next = new Set(selected);
    next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
    onChange(next);
  }

  function toggleWeekday(dayIndex: number) {
    // dayIndex: 0=Mon...6=Sun
    const inMonth = days.filter(
      (d) => isSameMonth(d, viewDate) && ISO_DAY[getDay(d)] === dayIndex
    );
    const strs = inMonth.map((d) => format(d, "yyyy-MM-dd"));
    const allSelected = strs.every((s) => selected.has(s));
    const next = new Set(selected);
    strs.forEach((s) => {
      if (s === initialDate) return;
      allSelected ? next.delete(s) : next.add(s);
    });
    onChange(next);
  }

  function selectAll() {
    const next = new Set(selected);
    days
      .filter((d) => isSameMonth(d, viewDate))
      .forEach((d) => next.add(format(d, "yyyy-MM-dd")));
    onChange(next);
  }

  function clearMonth() {
    const next = new Set(selected);
    days
      .filter((d) => isSameMonth(d, viewDate))
      .forEach((d) => {
        const s = format(d, "yyyy-MM-dd");
        if (s !== initialDate) next.delete(s);
      });
    onChange(next);
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const monthLabel = format(viewDate, "MMMM yyyy.", { locale: bs });
  const totalSelected = selected.size;

  return (
    <div className="space-y-2">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-zinc-200 capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week header — clickable */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => toggleWeekday(i)}
            title={`Odaberi sve ${label}`}
            className="text-center text-xs font-semibold text-zinc-500 hover:text-red-400 py-1 transition-colors"
          >
            {label}
          </button>
        ))}

        {/* Days */}
        {days.map((day) => {
          const str = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, viewDate);
          const isSelected = selected.has(str);
          const isInitial = str === initialDate;
          const isCurrentDay = isToday(day);

          return (
            <button
              key={str}
              type="button"
              onClick={() => toggle(str)}
              disabled={!inMonth}
              className={`
                aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors
                ${!inMonth ? "opacity-20 cursor-default" : ""}
                ${isSelected
                  ? "bg-red-600 text-white"
                  : isCurrentDay && inMonth
                    ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                    : inMonth
                      ? "text-zinc-300 hover:bg-zinc-700"
                      : ""}
                ${isInitial ? "ring-1 ring-red-400" : ""}
              `}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-zinc-500">
          {totalSelected} {totalSelected === 1 ? "datum odabran" : "datuma odabrano"}
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={clearMonth}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Poništi mjesec
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors"
          >
            Odaberi sve
          </button>
        </div>
      </div>
    </div>
  );
}
