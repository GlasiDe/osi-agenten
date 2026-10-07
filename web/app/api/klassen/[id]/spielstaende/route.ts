// Live-Einsatzzentrale: alle Spielstände einer Klasse (nur für die eigene Lehrkraft)
import { abfrage } from '@/lib/db';
import { eigeneKlasse, fehler, lehrkraftOderFehler } from '@/lib/rechte';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const k = await eigeneKlasse(b, (await params).id);
  if (!k) return fehler(404, 'Klasse nicht gefunden.');
  const rows = await abfrage<{ daten: Record<string, unknown> }>(
    'select s.daten from mitgliedschaft m join spielstand s on s.user_id = m.user_id where m.klasse_id = $1', [k.id]);
  return Response.json({ klasse: { id: k.id, name: k.name }, spielstaende: rows.map(r => r.daten) });
}
