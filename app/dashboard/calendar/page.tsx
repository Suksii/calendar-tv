import { verifySession } from '@/lib/dal';
import ScheduleView from '@/components/calendar/ScheduleView';

export default async function CalendarPage() {
  const session = await verifySession();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Raspored emisija</h1>
      </div>
      <ScheduleView isAdmin={session.role === 'admin'} />
    </div>
  );
}
