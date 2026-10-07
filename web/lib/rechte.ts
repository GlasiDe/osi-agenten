// Wer bin ich, was darf ich? Rollen: lernend · lehrkraft (erst nach Freischaltung durch den Admin) · admin
import { headers } from 'next/headers';
import { auth } from './auth';
import { abfrage } from './db';

export type Rolle = 'lernend' | 'lehrkraft' | 'admin';
export type Benutzer = { id: string; name: string; username: string; rolle: Rolle; lehrkraftStatus: string | null };

export async function benutzer(): Promise<Benutzer | null> {
  const s = await auth.api.getSession({ headers: await headers() });
  return s ? (s.user as unknown as Benutzer) : null;
}

export const istAdmin = (b: Benutzer) => b.rolle === 'admin';
export const istLehrkraft = (b: Benutzer) => b.rolle === 'admin' || (b.rolle === 'lehrkraft' && b.lehrkraftStatus === 'frei');

export const fehler = (status: number, meldung: string) => Response.json({ fehler: meldung }, { status });

export type Klasse = { id: string; name: string; code: string; aktiv: boolean; lehrkraft_id: string };

// Klasse nur, wenn sie der Lehrkraft gehört (der Admin darf alle sehen)
export async function eigeneKlasse(b: Benutzer, id: string): Promise<Klasse | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [k] = await abfrage<Klasse>('select id, name, code, aktiv, lehrkraft_id from klasse where id = $1', [id]);
  if (!k) return null;
  return istAdmin(b) || k.lehrkraft_id === b.id ? k : null;
}

// Lehrkraft-Prüfung für API-Routen: liefert Benutzer oder eine Fehler-Antwort
export async function lehrkraftOderFehler(): Promise<Benutzer | Response> {
  const b = await benutzer();
  if (!b) return fehler(401, 'Bitte anmelden.');
  if (!istLehrkraft(b)) return fehler(403, 'Nur für freigeschaltete Lehrkräfte.');
  return b;
}
