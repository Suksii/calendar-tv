import { requireAdmin, getUser } from "@/lib/dal";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { bs } from "date-fns/locale";

type LogEntry = {
  id: string;
  user_name: string;
  action: string;
  created_at: string;
};

export default async function LogsPage() {
  await requireAdmin();
  const user = await getUser();
  if (user?.username !== process.env.SEED_ADMIN_USERNAME) redirect("/dashboard/calendar");

  const logs = (await sql`
    SELECT id, user_name, action, created_at
    FROM audit_logs
    WHERE created_at >= now() - interval '7 days'
    ORDER BY created_at DESC
  `) as LogEntry[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Logovi aktivnosti</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Prikazuju se akcije iz posljednjih 7 dana</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-zinc-500 text-sm p-4">Nema zabilježenih akcija.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-700">
                <th className="text-left px-4 py-3 font-medium text-zinc-400">Vrijeme</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-400">Izvršilac</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-400">Akcija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {format(new Date(log.created_at), "dd.MM.yyyy HH:mm", { locale: bs })}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-100 whitespace-nowrap">
                    {log.user_name}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
