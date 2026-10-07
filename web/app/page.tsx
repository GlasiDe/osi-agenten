import Link from 'next/link';
import { benutzer, istLehrkraft } from '@/lib/rechte';
import { Kopf } from './_teile/Kopf';
import { Fuss } from './_teile/Fuss';
import { Parade } from './_teile/Figuren';

const FIGUREN = ['a02', 'a07', 'a01', 'a10', 'a06'];

export default async function Start() {
  const b = await benutzer();
  return (
    <>
      <Kopf />
      <main className="seite">
        <section className="start-hero">
          <img className="start-bild" src="/spiel/img/hq.jpg" alt="Einsatzzentrale der Einheit 7" />
          <div className="start-text">
            <div className="eyebrow">Einheit 7 · Abteilung für Netzwerkforensik</div>
            <h1>Operation <b>Lohnzettel</b></h1>
            <p>Ein Agenten-Krimi, in dem ihr euch das OSI-Modell Schicht für Schicht erarbeitet – jetzt online mit eurer Klasse.</p>
          </div>
        </section>
        <div className="start-grid">
          <div className="card">
            {b ? (
              <>
                <div className="eyebrow">Angemeldet als {b.username}</div>
                <h2>Willkommen zurück!</h2>
                <div className="btnrow"><a className="btn gross" href="/spiel/index.html">▶ Weiterspielen</a>
                  {istLehrkraft(b) && <Link className="btn sec" href="/lehrkraft">🏫 Lehrkraft-Bereich</Link>}</div>
              </>
            ) : (
              <>
                <h2>Mit Konto spielen</h2>
                <p>Euer Fortschritt wird automatisch gespeichert, ihr seht eure Klasse auf der Karte – und eure Lehrkraft die ganze Einsatzzentrale live.</p>
                <div className="btnrow"><Link className="btn gross" href="/anmelden">Anmelden</Link><Link className="btn sec" href="/registrieren">Registrieren</Link></div>
                <p className="small muted">Zum Registrieren braucht ihr den <b>Klassencode</b> eurer Lehrkraft. Eine E-Mail-Adresse braucht ihr nicht.</p>
              </>
            )}
          </div>
          <div className="card">
            <h2>Ohne Konto: Lite-Version</h2>
            <p>Das ganze Spiel ohne Anmeldung – im Browser oder als ZIP zum Herunterladen, auch ganz ohne Internet. Gesichert wird dort über die Export-Datei.</p>
            <div className="btnrow"><a className="btn sec" href="https://glaside.github.io/osi-agenten/spiel/">Lite-Version öffnen</a>
              <a className="btn ghost" href="https://github.com/GlasiDe/osi-agenten/releases/latest">⬇ ZIP</a></div>
          </div>
        </div>
        <Parade ids={FIGUREN} />
        <Fuss />
      </main>
    </>
  );
}
