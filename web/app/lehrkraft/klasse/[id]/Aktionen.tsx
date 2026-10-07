'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { meldungVon, senden } from '../../../_teile/api';

export function KlasseAktionen({ id, aktiv }: { id: string; aktiv: boolean }) {
  const router = useRouter();
  return (
    <>
      <button className="btn sec" onClick={async () => { await senden(`/api/klassen/${id}`, 'PATCH', { aktiv: !aktiv }); router.refresh(); }}>
        {aktiv ? '🔒 Registrierung sperren' : '🔓 Registrierung öffnen'}</button>
      <button className="btn ghost" onClick={async () => {
        if (!confirm('Klasse löschen? Die Konten der Lernenden bleiben bestehen, sind aber keiner Klasse mehr zugeordnet.')) return;
        await senden(`/api/klassen/${id}`, 'DELETE'); location.href = '/lehrkraft';
      }}>Klasse löschen</button>
    </>
  );
}

export function LernendeAktionen({ klasse, id, name }: { klasse: string; id: string; name: string }) {
  const router = useRouter();
  const [neu, setNeu] = useState('');
  async function passwort() {
    if (!confirm(`Neues Startpasswort für „${name}“ erzeugen? Das alte Passwort gilt dann nicht mehr.`)) return;
    const r = await senden(`/api/klassen/${klasse}/lernende/${id}/passwort`, 'POST');
    if (r.ok) setNeu(String(r.daten.passwort)); else alert(meldungVon(r.daten));
  }
  async function entfernen(konto: boolean) {
    const frage = konto ? `Konto „${name}“ mit Spielstand endgültig löschen?` : `„${name}“ aus der Klasse nehmen? Das Konto bleibt bestehen.`;
    if (!confirm(frage)) return;
    await senden(`/api/klassen/${klasse}/lernende/${id}${konto ? '?konto=loeschen' : ''}`, 'DELETE');
    router.refresh();
  }
  return (
    <div className="zeile">
      <button className="btn sec klein" data-aktion="passwort" onClick={passwort}>🔑 Passwort</button>
      <button className="btn ghost klein" onClick={() => entfernen(false)}>Entfernen</button>
      <button className="btn ghost klein" onClick={() => entfernen(true)}>Konto löschen</button>
      {neu && <span>Neues Passwort: <span className="passwort-neu" data-passwort>{neu}</span></span>}
    </div>
  );
}
