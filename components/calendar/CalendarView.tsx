'use client';

import { useCallback, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import ShowPopover from './ShowPopover';
import EntryModal from './EntryModal';

type Show = { id: string; title: string };

type Entry = {
  id: string;
  show_id: string;
  show_title: string;
  date: string;
  time: string;
  duration: number | null;
  type: 'uzivo' | 'snimanje';
  host: string | null;
  guests: { id: string; name: string }[];
};

type Props = { isAdmin: boolean };

export default function CalendarView({ isAdmin }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Modal state
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // Popover state
  const [popoverEntry, setPopoverEntry] = useState<Entry | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  const fetchEntries = useCallback(async (month: string) => {
    const res = await fetch(`/api/entries?month=${month}`);
    if (res.ok) setEntries(await res.json());
  }, []);

  const fetchShows = useCallback(async () => {
    const res = await fetch('/api/shows');
    if (res.ok) setShows(await res.json());
  }, []);

  useEffect(() => {
    fetchEntries(currentMonth);
    fetchShows();
  }, [fetchEntries, fetchShows, currentMonth]);

  function handleDatesSet(arg: DatesSetArg) {
    const mid = new Date((arg.start.getTime() + arg.end.getTime()) / 2);
    const month = format(mid, 'yyyy-MM');
    if (month !== currentMonth) setCurrentMonth(month);
  }

  function handleDateClick(arg: DateClickArg) {
    if (!isAdmin) return;
    setEditingEntry(null);
    setModalDate(arg.dateStr);
    setPopoverEntry(null);
  }

  function handleEventClick(info: EventClickArg) {
    const entry = entries.find((e) => e.id === info.event.id);
    if (!entry) return;
    const rect = info.el.getBoundingClientRect();
    setPopoverPos({ x: rect.left, y: rect.bottom + 4 });
    setPopoverEntry(entry);
  }

  async function handleDelete(id: string) {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj termin?')) return;
    await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    setPopoverEntry(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleEdit(entry: Entry) {
    setEditingEntry(entry);
    setModalDate(entry.date);
    setPopoverEntry(null);
  }

  function handleSaved() {
    fetchEntries(currentMonth);
    fetchShows(); // refresh katalog u slučaju da je nova emisija dodata
  }

  const events = entries.map((e) => ({
    id: e.id,
    title: `${e.time} ${e.show_title}`,
    start: e.duration
      ? `${e.date}T${e.time}`
      : e.date,
    end: e.duration
      ? (() => {
          const [h, m] = e.time.split(':').map(Number);
          const total = h * 60 + m + e.duration;
          return `${e.date}T${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        })()
      : undefined,
    allDay: !e.duration,
    backgroundColor: e.type === 'uzivo' ? '#2563eb' : '#7c3aed',
    borderColor: e.type === 'uzivo' ? '#1d4ed8' : '#6d28d9',
  }));

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        {isAdmin && (
          <p className="text-xs text-gray-400 mb-3">Kliknite na datum da dodate termin</p>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="hr"
          firstDay={1}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{ today: 'Danas', month: 'Mjesec', week: 'Sedmica', day: 'Dan' }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          dayCellClassNames={() => isAdmin ? 'cursor-pointer hover:bg-blue-50' : ''}
        />
      </div>

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

      {modalDate && (
        <EntryModal
          date={modalDate}
          entry={editingEntry}
          shows={shows}
          onClose={() => { setModalDate(null); setEditingEntry(null); }}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
