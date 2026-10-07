import Link from 'next/link';
import { redirect } from 'next/navigation';
import { abfrage } from '@/lib/db';
import { benutzer, istAdmin, istLehrkraft } from '@/lib/rechte';
import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';
import { KlasseAnlegen } from './KlasseAnlegen';

type Zeile = { id: string; name: string; code: string; aktiv: boolean; lernende: number; gespielt: number };

export default async function Lehrkraft() {
  const b = await benutzer();
  if (!b) redirect('/anmelden?weiter=/lehrkraft');
  if (!istLehrkraft(b)) {
    return (<><Kopf /><main className="seite schmal"><div className="card"><h2>🏫 Lehrkraft-Bereich</h2>
      <p>Euer Lehrkraft-Konto wartet noch auf die <b>Freischaltung</b> durch den Admin. Spielen könnt ihr schon.</p>
      <a className="btn" href="/spiel/index.html">🎮 Spielen</a></div><Fuss /></main></>);
  }
  const klassen = await abfrage<Zeile>(
    `select k.id, k.name, k.code, k.aktiv, count(m.user_id)::int as lernende, count(s.user_id)::int as gespielt
       from klasse k left join mitgliedschaft m on m.klasse_id = k.id left join spielstand s on s.user_id = m.user_id
      where k.lehrkraft_id = $1 or $2 group by k.id order by k.erstellt desc`, [b.id, istAdmin(b)]);
  return (
    <>
      <Kopf />
      <main className="seite">
        <h2>🏫 Eure Klassen</h2>
        <p className="muted">Gebt den <b>Klassencode</b> an die Lernenden. Mit ihm registrieren sie sich selbst – ohne E-Mail. Die Live-Einsatzzentrale zeigt alle Figuren auf der Karte.</p>
        <div className="kacheln">
          {klassen.map(k => (
            <div key={k.id} className={`card kachel-klasse ${k.aktiv ? '' : 'gesperrt'}`}>
              <div className="eyebrow">{k.aktiv ? 'Klasse' : 'Klasse · gesperrt'}</div>
              <h3 style={{ margin: 0 }}>{k.name}</h3>
              <div className="code-gross">{k.code}</div>
              <div className="small muted">{k.lernende} Lernende · {k.gespielt} mit Spielstand</div>
              <div className="btnrow">
                <a className="btn" href={`/lehrkraft/einsatzzentrale.html?klasse=${k.id}`}>🗺️ Live-Zentrale</a>
                <Link className="btn sec" href={`/lehrkraft/klasse/${k.id}`}>Verwalten</Link>
              </div>
            </div>
          ))}
          <KlasseAnlegen />
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <h3>Material</h3>
          <p className="small"><a href="/lehrkraft/Loesungen_und_Debriefing.pdf">Lösungen und Debriefing</a> · <a href="/lehrkraft/Kurzanleitung_SuS.pdf">Kurzanleitung für Lernende</a> · <a href="/lehrkraft/Inhaltsuebersicht_Einsaetze.pdf">Inhaltsübersicht</a> · <a href="/lehrkraft/Mindestanforderungen_Vorwissen.pdf">Mindestanforderungen</a> · <a href="/lehrkraft/einsatzzentrale.html">Einsatzzentrale mit Dateien</a></p>
        </div>
        <Fuss />
      </main>
    </>
  );
}
