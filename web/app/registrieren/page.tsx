import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';
import { RegistrierFormular } from './Formular';

export default function Registrieren() {
  return (
    <>
      <Kopf />
      <main className="seite schmal">
        <div className="card"><h2>Registrieren</h2><RegistrierFormular /></div>
        <Fuss />
      </main>
    </>
  );
}
