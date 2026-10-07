import { redirect } from 'next/navigation';
import { abfrage } from '@/lib/db';
import { benutzer, istLehrkraft } from '@/lib/rechte';
import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';
import { KontoAktionen } from './Aktionen';

export default async function Konto() {
  const b = await benutzer();
  if (!b) redirect('/anmelden?weiter=/konto');
  const [k] = await abfrage<{ name: string }>('select k.name from mitgliedschaft m join klasse k on k.id = m.klasse_id where m.user_id = $1', [b.id]);
  const [s] = await abfrage<{ codename: string; punkte: number; aktualisiert: Date }>('select codename, punkte, aktualisiert from spielstand where user_id = $1', [b.id]);
  const rolle = b.rolle === 'admin' ? 'Admin' : b.rolle === 'lehrkraft' ? (istLehrkraft(b) ? 'Lehrkraft' : 'Lehrkraft (wartet auf Freischaltung)') : 'Agentin/Agent';
  return (
    <>
      <Kopf />
      <main className="seite schmal">
        <div className="card">
          <div className="eyebrow">{rolle}</div>
          <h2>👤 {b.username}</h2>
          <p>{k ? <>Klasse <b>{k.name}</b></> : 'Keiner Klasse zugeordnet.'}</p>
          <p className="small muted">{s ? <>Spielstand „{s.codename}“ · {s.punkte} XP · zuletzt gespeichert {new Date(s.aktualisiert).toLocaleString('de-DE')}</> : 'Noch kein Spielstand gespeichert.'}</p>
          <div className="merk"><b>Spielstand mitnehmen:</b> Im Spiel unter 💾 <i>Sichern / Laden</i> exportieren – die Datei läuft auch in der Lite-Version ohne Internet.</div>
        </div>
        <KontoAktionen />
        <Fuss />
      </main>
    </>
  );
}
