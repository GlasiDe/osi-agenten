// Admin: Lehrkraft-Anträge freischalten, ablehnen (Konto löschen) oder Rechte entziehen
import { auth } from '@/lib/auth';
import { abfrage, pool } from '@/lib/db';
import { benutzer, fehler, istAdmin } from '@/lib/rechte';

async function adminOderFehler() {
  const b = await benutzer();
  if (!b) return fehler(401, 'Bitte anmelden.');
  if (!istAdmin(b)) return fehler(403, 'Nur für den Admin.');
  return b;
}

export async function GET() {
  const b = await adminOderFehler();
  if (b instanceof Response) return b;
  const lehrkraefte = await abfrage(
    `select id, username, "lehrkraftStatus" as status, "createdAt" as erstellt from "user" where rolle = 'lehrkraft' order by "lehrkraftStatus", "createdAt" desc`);
  return Response.json({ lehrkraefte });
}

export async function POST(req: Request) {
  const b = await adminOderFehler();
  if (b instanceof Response) return b;
  const { id, aktion } = ((await req.json().catch(() => ({}))) || {}) as { id?: string; aktion?: string };
  const [u] = await abfrage<{ id: string }>(`select id from "user" where id = $1 and rolle = 'lehrkraft'`, [String(id)]);
  if (!u) return fehler(404, 'Lehrkraft nicht gefunden.');
  if (aktion === 'freischalten') await pool.query(`update "user" set "lehrkraftStatus" = 'frei' where id = $1`, [u.id]);
  else if (aktion === 'entziehen') await pool.query(`update "user" set "lehrkraftStatus" = 'beantragt' where id = $1`, [u.id]);
  else if (aktion === 'ablehnen') await (await auth.$context).internalAdapter.deleteUser(u.id);
  else return fehler(400, 'Unbekannte Aktion.');
  return Response.json({ ok: true });
}
