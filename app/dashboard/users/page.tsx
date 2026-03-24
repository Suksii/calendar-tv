import { requireAdmin } from '@/lib/dal';
import { sql } from '@/lib/db';
import Link from 'next/link';
import DeleteUserButton from './DeleteUserButton';

const LIMITS = { admin: 2, viewer: 4 };

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
  created_at: string;
};

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = (await sql`
    SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC
  `) as User[];

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const viewerCount = users.filter((u) => u.role === 'viewer').length;
  const canAddMore = adminCount < LIMITS.admin || viewerCount < LIMITS.viewer;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Korisnici</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Administratori: {adminCount}/{LIMITS.admin} · Preglednici: {viewerCount}/{LIMITS.viewer}
          </p>
        </div>
        {canAddMore ? (
          <Link
            href="/dashboard/users/new"
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Novi korisnik
          </Link>
        ) : (
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
            Dostignut maksimum korisnika
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ime</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rola</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Preglednik'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.id !== session.userId && (
                    <DeleteUserButton userId={user.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
