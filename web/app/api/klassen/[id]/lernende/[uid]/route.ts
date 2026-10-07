// Lernende verwalten: aus der Klasse nehmen (?konto=loeschen löscht das ganze Konto mit Spielstand)
import { auth } from '@/lib/auth';
import { abfrage, pool } from '@/lib/db';
import { eigeneKlasse, fehler, lehrkraftOderFehler } from '@/lib/rechte';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; uid: string }> }) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const { id, uid } = await params;
  const k = await eigeneKlasse(b, id);
  if (!k) return fehler(404, 'Klasse nicht gefunden.');
  const [m] = await abfrage('select 1 from mitgliedschaft where klasse_id = $1 and user_id = $2', [k.id, uid]);
  if (!m) return fehler(404, 'Nicht in dieser Klasse.');
  if (new URL(req.url).searchParams.get('konto') === 'loeschen') {
    await (await auth.$context).internalAdapter.deleteUser(uid);
  } else {
    await pool.query('delete from mitgliedschaft where user_id = $1', [uid]);
  }
  return Response.json({ ok: true });
}
