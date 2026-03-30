import { verifySession } from "@/lib/dal";
import { sql } from "@/lib/db";
import { format, parseISO } from "date-fns";
import { bs } from "date-fns/locale";
import AutoPrint from "./AutoPrint";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

type Entry = {
  id: string;
  time: string;
  duration: number | null;
  show_title: string;
  type: "uzivo" | "snimanje";
  host: string | null;
  topic: string | null;
  channel: string;
};

const CHANNELS = ["RTCG1", "RTCG2", "SAT", "PAR"];

export default async function PrintPage({ searchParams }: Props) {
  await verifySession();

  const { date } = await searchParams;
  const targetDate = date ?? format(new Date(), "yyyy-MM-dd");

  const entries = (await sql`
    SELECT e.id, e.time, e.duration, e.type, e.host, e.topic, e.channel, s.title AS show_title
    FROM entries e
    JOIN shows s ON s.id = e.show_id
    WHERE e.date = ${targetDate}
    ORDER BY e.channel, e.time
  `) as Entry[];

  const byChannel = Object.fromEntries(
    CHANNELS.map((ch) => [ch, entries.filter((e) => e.channel === ch)])
  );

  const dateLabel = format(parseISO(targetDate), "EEEE, dd. MMMM yyyy.", { locale: bs });

  return (
    <div className="min-h-screen bg-white text-black">
      <AutoPrint />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8 print:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Dnevni raspored emisija</h1>
            <p className="text-sm text-gray-500 mt-1 capitalize">{dateLabel}</p>
          </div>
          <button
            onClick={undefined}
            className="print:hidden text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Štampaj
          </button>
        </div>

        <div className="space-y-8">
          {CHANNELS.map((ch) => (
            <div key={ch}>
              <h2 className="text-base font-bold text-black border-b-2 border-black pb-1 mb-3">
                {ch}
              </h2>
              {byChannel[ch].length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nema zakazanih emisija.</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-1.5 pr-4 font-semibold text-gray-600 w-16">Vrijeme</th>
                      <th className="text-left py-1.5 pr-4 font-semibold text-gray-600">Emisija</th>
                      <th className="text-left py-1.5 pr-4 font-semibold text-gray-600 w-20">Trajanje</th>
                      <th className="text-left py-1.5 pr-4 font-semibold text-gray-600 w-20">Tip</th>
                      <th className="text-left py-1.5 font-semibold text-gray-600">Voditelj</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byChannel[ch].map((entry, i) => (
                      <tr key={entry.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="py-1.5 pr-4 font-mono font-semibold">{entry.time}</td>
                        <td className="py-1.5 pr-4 font-medium">
                          {entry.show_title}
                          {entry.topic && (
                            <span className="block text-xs text-gray-500 font-normal">{entry.topic}</span>
                          )}
                        </td>
                        <td className="py-1.5 pr-4 text-gray-600">
                          {entry.duration ? `${entry.duration} min` : "—"}
                        </td>
                        <td className="py-1.5 pr-4 text-gray-600">
                          {entry.type === "uzivo" ? "Uživo" : "Snimanje"}
                        </td>
                        <td className="py-1.5 text-gray-600">{entry.host ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-gray-400 print:mt-6">
          Štampano: {format(new Date(), "dd.MM.yyyy HH:mm", { locale: bs })}
        </p>
      </div>
    </div>
  );
}
