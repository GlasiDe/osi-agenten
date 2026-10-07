// Eigenes Konto löschen – mit Spielstand, Mitgliedschaft und (bei Lehrkräften) den eigenen Klassen
import { auth } from '@/lib/auth';
import { benutzer, fehler } from '@/lib/rechte';

export async function DELETE() {
  const b = await benutzer();
  if (!b) return fehler(401, 'Bitte anmelden.');
  await (await auth.$context).internalAdapter.deleteUser(b.id);
  return Response.json({ ok: true });
}
