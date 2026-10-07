import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';
import { AnmeldeFormular } from './Formular';

export default function Anmelden() {
  return (
    <>
      <Kopf />
      <main className="seite schmal">
        <div className="card"><h2>Anmelden</h2><AnmeldeFormular /></div>
        <Fuss />
      </main>
    </>
  );
}
