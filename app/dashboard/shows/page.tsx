import { verifySession } from '@/lib/dal';
import { sql } from '@/lib/db';
import ShowCatalog from './ShowCatalog';

type Show = { id: string; title: string };

export default async function ShowsPage() {
  const session = await verifySession();
  const shows = (await sql`SELECT id, title FROM shows ORDER BY title ASC`) as Show[];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Katalog emisija</h1>
      <ShowCatalog shows={shows} isAdmin={session.role === 'admin'} />
    </div>
  );
}
