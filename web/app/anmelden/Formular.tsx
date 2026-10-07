'use client';
import { useState } from 'react';
import { meldungVon, senden } from '../_teile/api';

// Nach dem Anmelden: zurück zur angefragten Seite (nur eigene Pfade), sonst Lehrkraft-Bereich bzw. Spiel
export async function nachAnmeldung() {
  const weiter = new URLSearchParams(location.search).get('weiter');
  if (weiter && weiter.startsWith('/') && !weiter.startsWith('//')) { location.href = weiter; return; }
  const r = await fetch('/api/ich', { credentials: 'same-origin' });
  const d = r.ok ? await r.json() : null;
  location.href = d && d.benutzer.istLehrkraft ? '/lehrkraft' : '/spiel/index.html';
}

export function AnmeldeFormular() {
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  async function los(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    setLaeuft(true); setFehler('');
    const r = await senden('/api/auth/sign-in/username', 'POST', { username: String(f.get('benutzername')).trim().toLowerCase(), password: f.get('passwort') });
    if (!r.ok) { setLaeuft(false); setFehler(r.daten.code === 'INVALID_USERNAME_OR_PASSWORD' ? 'Benutzername oder Passwort stimmt nicht.' : meldungVon(r.daten)); return; }
    await nachAnmeldung();
  }
  return (
    <form className="formular" onSubmit={los}>
      <label htmlFor="benutzername">Benutzername</label>
      <input type="text" id="benutzername" name="benutzername" autoComplete="username" required autoCapitalize="off" spellCheck={false} />
      <label htmlFor="passwort">Passwort</label>
      <input type="password" id="passwort" name="passwort" autoComplete="current-password" required />
      {fehler && <div className="meldung fehler" role="alert">{fehler}</div>}
      <div className="btnrow"><button className="btn gross" id="anmelden" disabled={laeuft}>{laeuft ? 'Einen Moment …' : 'Anmelden'}</button><a href="/registrieren">Noch kein Konto?</a></div>
      <p className="small muted">Passwort vergessen? Eure Lehrkraft kann es zurücksetzen.</p>
    </form>
  );
}
