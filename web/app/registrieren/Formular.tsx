'use client';
import { useState } from 'react';
import { meldungVon, senden } from '../_teile/api';
import { nachAnmeldung } from '../anmelden/Formular';

export function RegistrierFormular() {
  const [art, setArt] = useState<'lernend' | 'lehrkraft'>('lernend');
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  async function los(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    if (f.get('passwort') !== f.get('passwort2')) { setFehler('Die beiden Passwörter sind nicht gleich.'); return; }
    setLaeuft(true); setFehler('');
    const benutzername = String(f.get('benutzername')).trim();
    const r = await senden('/api/registrieren', 'POST', { benutzername, passwort: f.get('passwort'), art, klassencode: f.get('klassencode') });
    if (!r.ok) { setLaeuft(false); setFehler(meldungVon(r.daten)); return; }
    const a = await senden('/api/auth/sign-in/username', 'POST', { username: benutzername.toLowerCase(), password: f.get('passwort') });
    if (!a.ok) { location.href = '/anmelden'; return; }
    await nachAnmeldung();
  }
  return (
    <form className="formular" onSubmit={los}>
      <div className="umschalter" role="tablist">
        <button type="button" role="tab" aria-selected={art === 'lernend'} className={art === 'lernend' ? 'on' : ''} onClick={() => setArt('lernend')}>🕵️ Ich spiele mit</button>
        <button type="button" role="tab" aria-selected={art === 'lehrkraft'} className={art === 'lehrkraft' ? 'on' : ''} onClick={() => setArt('lehrkraft')}>🏫 Ich bin Lehrkraft</button>
      </div>
      {art === 'lernend' ? (
        <>
          <label htmlFor="klassencode">Klassencode</label>
          <input type="text" id="klassencode" name="klassencode" required placeholder="z. B. FALKE-7Q2" autoCapitalize="characters" spellCheck={false} />
        </>
      ) : (
        <div className="warnbar">Lehrkraft-Konten werden nach der Registrierung vom Admin <b>freigeschaltet</b>. Bis dahin könnt ihr spielen, aber noch keine Klassen anlegen.</div>
      )}
      <label htmlFor="benutzername">Benutzername</label>
      <input type="text" id="benutzername" name="benutzername" autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9][A-Za-z0-9._\-]{2,23}" autoCapitalize="off" spellCheck={false} />
      <p className="small muted">3–24 Zeichen: Buchstaben a–z, Ziffern, Punkt, Unterstrich, Bindestrich. {art === 'lernend' ? 'Bitte keinen vollen Namen – eure Lehrkraft muss euch aber erkennen.' : ''}</p>
      <label htmlFor="passwort">Passwort (mindestens 8 Zeichen)</label>
      <input type="password" id="passwort" name="passwort" autoComplete="new-password" required minLength={8} />
      <label htmlFor="passwort2">Passwort wiederholen</label>
      <input type="password" id="passwort2" name="passwort2" autoComplete="new-password" required minLength={8} />
      {fehler && <div className="meldung fehler" role="alert">{fehler}</div>}
      <div className="btnrow"><button className="btn gross" id="registrieren" disabled={laeuft}>{laeuft ? 'Einen Moment …' : 'Konto anlegen'}</button><a href="/anmelden">Schon ein Konto?</a></div>
      <p className="small muted">Gespeichert werden nur Benutzername, Passwort (verschlüsselt) und euer Spielstand. Details in der <a href="/datenschutz">Datenschutzerklärung</a>.</p>
    </form>
  );
}
