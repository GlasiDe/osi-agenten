// Rangliste der eigenen Klasse für Lernende: nur Codename, Figur, Punkte und Front – keine Benutzernamen
import { abfrage } from '@/lib/db';
import { benutzer, fehler } from '@/lib/rechte';

export async function GET() {
  const b = await benutzer();
  if (!b) return fehler(401, 'Bitte anmelden.');
  const liste = await abfrage<{ codename: string; avatar: string; punkte: number; front: string | null; ich: boolean }>(
    `select s.codename, s.avatar, s.punkte, s.front, (s.user_id = $1) as ich
       from mitgliedschaft ich join mitgliedschaft m on m.klasse_id = ich.klasse_id
       join spielstand s on s.user_id = m.user_id
      where ich.user_id = $1
      order by s.punkte desc limit 200`, [b.id]);
  return Response.json({ liste });
}
