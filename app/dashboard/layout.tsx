import { redirect } from 'next/navigation';
import { getUser } from '@/lib/dal';
import Navbar from '@/components/ui/Navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={user.name} role={user.role} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
