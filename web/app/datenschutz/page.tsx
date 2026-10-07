import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';

// PLATZHALTER: Den verbindlichen Text liefert der Betreiber bzw. die Schule (z. B. mit der oder dem Datenschutzbeauftragten).
export default function Datenschutz() {
  return (
    <>
      <Kopf />
      <main className="seite schmal">
        <div className="card lesson">
          <h2>Datenschutz</h2>
          <div className="warnbar">Platzhalter – der verbindliche Text folgt durch den Betreiber.</div>
          <h3>Was gespeichert wird</h3>
          <ul>
            <li><b>Konto:</b> Benutzername und Passwort (nur als Hash). Keine E-Mail-Adresse, kein echter Name nötig.</li>
            <li><b>Spielstand:</b> Codename, Figur, gelöste Aufgaben, Punkte und Zeitpunkte – so wie in der exportierten <code>.osiagent</code>-Datei.</li>
            <li><b>Klasse:</b> Zuordnung zur Klasse der Lehrkraft (über den Klassencode).</li>
            <li><b>Sitzung:</b> ein Anmelde-Cookie, technisch notwendig. Kein Tracking, keine Werbung, keine externen Schriften.</li>
          </ul>
          <h3>Wer was sieht</h3>
          <ul>
            <li>Die eigene Lehrkraft sieht Benutzername und Spielstand ihrer Klasse.</li>
            <li>Mitschülerinnen und Mitschüler sehen nur Codename, Figur, Punkte und den aktuellen Einsatz.</li>
          </ul>
          <h3>Löschen</h3>
          <p>Unter „Konto“ lässt sich das Konto jederzeit vollständig löschen. Die Lehrkraft kann Konten ihrer Klasse löschen.</p>
          <p className="small muted">Datenbank: Neon (Postgres), Hosting: Vercel. Region, Verantwortliche und Rechtsgrundlage ergänzt der Betreiber.</p>
        </div>
        <Fuss />
      </main>
    </>
  );
}
