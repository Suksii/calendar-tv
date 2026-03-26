import { verifySession } from "@/lib/dal";
import { format, startOfWeek, parseISO, isValid } from "date-fns";
import { getEntriesForMonth, getAllShows } from "@/lib/queries";
import ScheduleView from "@/components/calendar/ScheduleView";

type Props = {
  searchParams: Promise<{ channel?: string; date?: string }>;
};

export default async function CalendarPage({ searchParams }: Props) {
  const session = await verifySession();
  const { date } = await searchParams;

  const parsedDate = date ? parseISO(date) : null;
  const baseDate = parsedDate && isValid(parsedDate) ? parsedDate : new Date();
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const initialMonth = format(weekStart, "yyyy-MM");

  const [initialEntries, initialShows] = await Promise.all([
    getEntriesForMonth(initialMonth),
    getAllShows(),
  ]);

  return (
    <div>
      <ScheduleView
        isAdmin={session.role === "admin"}
        initialEntries={initialEntries}
        initialShows={initialShows}
        initialMonth={initialMonth}
      />
    </div>
  );
}
