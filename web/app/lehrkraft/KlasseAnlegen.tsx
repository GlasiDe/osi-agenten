'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { meldungVon, senden } from '../_teile/api';

export function KlasseAnlegen() {
  const router = useRouter();
  const [fehler, setFehler] = useState('');
  async function los(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const r = await senden('/api/klassen', 'POST', { name: new FormData(form).get('name') });
    if (!r.ok) { setFehler(meldungVon(r.daten)); return; }
    form.reset(); setFehler(''); router.refresh();
  }
  return (
    <form className="card formular kachel-klasse" onSubmit={los}>
      <div className="eyebrow">Neu</div>
      <h3 style={{ margin: 0 }}>Klasse anlegen</h3>
      <label htmlFor="klassenname">Name (nur für euch sichtbar)</label>
      <input type="text" id="klassenname" name="name" required maxLength={60} placeholder="z. B. Netzwerke Kurs B" />
      {fehler && <div className="meldung fehler">{fehler}</div>}
      <div className="btnrow"><button className="btn" id="klasse-neu">＋ Anlegen</button></div>
    </form>
  );
}
