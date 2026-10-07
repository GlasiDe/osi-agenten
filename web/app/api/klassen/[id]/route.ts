// Eine Klasse: Lernende auflisten, umbenennen/sperren, löschen
import { abfrage, pool } from '@/lib/db';
import { eigeneKlasse, fehler, lehrkraftOderFehler } from '@/lib/rechte';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const k = await eigeneKlasse(b, (await params).id);
  if (!k) return fehler(404, 'Klasse nicht gefunden.');
  const lernende = await abfrage(
    `select u.id, u.username, m.beigetreten, s.codename, s.avatar, s.punkte, s.front, s.fall, s.aktualisiert
       from mitgliedschaft m join "user" u on u.id = m.user_id left join spielstand s on s.user_id = u.id
      where m.klasse_id = $1 order by u.username`, [k.id]);
  return Response.json({ klasse: k, lernende });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const k = await eigeneKlasse(b, (await params).id);
  if (!k) return fehler(404, 'Klasse nicht gefunden.');
  const d = ((await req.json().catch(() => ({}))) || {}) as { name?: string; aktiv?: boolean };
  const name = d.name != null ? String(d.name).trim().slice(0, 60) || k.name : k.name;
  const aktiv = typeof d.aktiv === 'boolean' ? d.aktiv : k.aktiv;
  await pool.query('update klasse set name = $2, aktiv = $3 where id = $1', [k.id, name, aktiv]);
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const k = await eigeneKlasse(b, (await params).id);
  if (!k) return fehler(404, 'Klasse nicht gefunden.');
  await pool.query('delete from klasse where id = $1', [k.id]); // Mitgliedschaften fallen mit weg, Konten bleiben
  return Response.json({ ok: true });
}
