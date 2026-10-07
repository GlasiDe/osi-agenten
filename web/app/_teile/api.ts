'use client';
// Kleine Helfer für Formulare: JSON senden, Fehlermeldung des Servers zurückgeben
export async function senden(url: string, methode: string, body?: unknown): Promise<{ ok: boolean; daten: Record<string, unknown> }> {
  const r = await fetch(url, { method: methode, headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: body === undefined ? undefined : JSON.stringify(body) });
  const daten = await r.json().catch(() => ({}));
  return { ok: r.ok, daten };
}
// Better Auth liefert Fehler als { message } oder { code }
export const meldungVon = (d: Record<string, unknown>, ersatz = 'Das hat nicht geklappt.') => String(d.fehler || d.message || ersatz);
