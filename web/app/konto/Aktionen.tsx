'use client';
import { useState } from 'react';
import { meldungVon, senden } from '../_teile/api';

export function KontoAktionen() {
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null);
  async function passwort(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget, f = new FormData(form);
    const r = await senden('/api/auth/change-password', 'POST', { currentPassword: f.get('alt'), newPassword: f.get('neu'), revokeOtherSessions: true });
    setMeldung(r.ok ? { ok: true, text: 'Passwort geändert.' } : { ok: false, text: r.daten.code === 'INVALID_PASSWORD' ? 'Das bisherige Passwort stimmt nicht.' : meldungVon(r.daten) });
    if (r.ok) form.reset();
  }
  async function loeschen() {
    if (!confirm('Konto wirklich löschen? Spielstand und Klassen-Zuordnung sind dann unwiderruflich weg. Exportiert den Spielstand vorher, wenn ihr ihn behalten wollt.')) return;
    const r = await senden('/api/konto', 'DELETE');
    if (r.ok) location.href = '/'; else setMeldung({ ok: false, text: meldungVon(r.daten) });
  }
  return (
    <>
      <form className="card formular" onSubmit={passwort}>
        <h3>Passwort ändern</h3>
        <label htmlFor="alt">Bisheriges Passwort</label><input type="password" id="alt" name="alt" autoComplete="current-password" required />
        <label htmlFor="neu">Neues Passwort (mindestens 8 Zeichen)</label><input type="password" id="neu" name="neu" autoComplete="new-password" required minLength={8} />
        {meldung && <div className={`meldung ${meldung.ok ? 'ok' : 'fehler'}`} role="status">{meldung.text}</div>}
        <div className="btnrow"><button className="btn">Passwort ändern</button></div>
      </form>
      <div className="card">
        <h3>Konto löschen</h3>
        <p className="small">Löscht Konto, Spielstand und – bei Lehrkräften – die eigenen Klassen (die Konten der Lernenden bleiben).</p>
        <button className="btn rot" onClick={loeschen}>Konto löschen</button>
      </div>
    </>
  );
}
