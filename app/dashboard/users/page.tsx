import { requireAdmin } from "@/lib/dal";
import { sql } from "@/lib/db";
import Link from "next/link";
import DeleteUserButton from "./DeleteUserButton";

const LIMITS = { admin: 2, viewer: 4 };

type User = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "viewer";
  created_at: string;
};

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = (await sql`
    SELECT id, name, username, role, created_at FROM users ORDER BY created_at DESC
  `) as User[];

  const adminCount = users.filter((u) => u.role === "admin").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;
  const canAddMore = adminCount < LIMITS.admin || viewerCount < LIMITS.viewer;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Korisnici</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Administratori: {adminCount}/{LIMITS.admin} · Korisnici:{" "}
            {viewerCount}/{LIMITS.viewer}
          </p>
        </div>
        {canAddMore ? (
          <Link
            href="/dashboard/users/new"
            className="bg-linear-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded uppercase tracking-wider transition-all duration-200"
          >
            + Novi korisnik
          </Link>
        ) : (
          <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-2 rounded">
            Dostignut maksimum korisnika
          </span>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/50 border-b border-zinc-700">
              <th className="text-left px-4 py-3 font-medium text-zinc-400">
                Ime
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">
                Korisničko ime
              </th>
              <th className="text-left px-4 py-3 font-medium text-zinc-400">
                Rola
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-zinc-800/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-zinc-400">{user.username}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      user.role === "admin"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {user.role === "admin" ? "Administrator" : "Korisnik"}
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
