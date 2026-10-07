import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';

// PLATZHALTER: Angaben nach § 5 DDG ergänzt der Betreiber.
export default function Impressum() {
  return (
    <>
      <Kopf />
      <main className="seite schmal">
        <div className="card"><h2>Impressum</h2><div className="warnbar">Platzhalter – die Angaben zum Betreiber folgen.</div>
          <p className="small muted">Inhalte: CC BY-SA 4.0 · Code: MIT. Alle Personen und Firmen im Spiel sind frei erfunden.</p></div>
        <Fuss />
      </main>
    </>
  );
}
