// Klassen der Lehrkraft: auflisten und anlegen (mit eindeutigem Klassencode)
import { abfrage } from '@/lib/db';
import { fehler, istAdmin, lehrkraftOderFehler } from '@/lib/rechte';
import { klassencode } from '@/lib/werte';

export async function GET() {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const klassen = await abfrage(
    `select k.id, k.name, k.code, k.aktiv, k.erstellt, count(m.user_id)::int as lernende
       from klasse k left join mitgliedschaft m on m.klasse_id = k.id
      where k.lehrkraft_id = $1 or $2 group by k.id order by k.erstellt desc`, [b.id, istAdmin(b)]);
  return Response.json({ klassen });
}

export async function POST(req: Request) {
  const b = await lehrkraftOderFehler();
  if (b instanceof Response) return b;
  const { name } = ((await req.json().catch(() => ({}))) || {}) as { name?: string };
  const n = String(name ?? '').trim().slice(0, 60);
  if (!n) return fehler(400, 'Bitte einen Namen für die Klasse angeben.');
  for (let i = 0; i < 8; i++) {
    try {
      const [k] = await abfrage('insert into klasse (lehrkraft_id, name, code) values ($1, $2, $3) returning id, name, code, aktiv', [b.id, n, klassencode()]);
      return Response.json({ klasse: k });
    } catch (e) {
      if ((e as { code?: string }).code !== '23505') throw e; // Code schon vergeben → neuer Versuch
    }
  }
  return fehler(500, 'Kein freier Klassencode gefunden – bitte nochmal versuchen.');
}
