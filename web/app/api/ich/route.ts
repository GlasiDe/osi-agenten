import { abfrage } from '@/lib/db';
import { benutzer, fehler, istLehrkraft } from '@/lib/rechte';

export async function GET() {
  const b = await benutzer();
  if (!b) return fehler(401, 'Bitte anmelden.');
  const [k] = await abfrage<{ name: string }>('select k.name from mitgliedschaft m join klasse k on k.id = m.klasse_id where m.user_id = $1', [b.id]);
  return Response.json({ benutzer: { id: b.id, name: b.username, rolle: b.rolle, istLehrkraft: istLehrkraft(b), klasse: k ? k.name : null } });
}
