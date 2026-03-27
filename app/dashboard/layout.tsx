import { redirect } from 'next/navigation';
import { getUser } from '@/lib/dal';
import Navbar from '@/components/ui/Navbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-black">
      <Navbar userName={user.name} role={user.role} isSeedAdmin={user.username === process.env.SEED_ADMIN_USERNAME} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
