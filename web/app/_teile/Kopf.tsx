// Kopfleiste der Online-Seiten – angelehnt an die Kopfleiste im Spiel
import Link from 'next/link';
import { benutzer, istAdmin, istLehrkraft } from '@/lib/rechte';
import { Abmelden } from './Abmelden';

export async function Kopf() {
  const b = await benutzer();
  return (
    <header id="topbar">
      <Link className="tb-logo" href="/"><span className="tb-logo-mark">E7</span><span className="tb-logo-text">OSI-Agenten</span></Link>
      <span className="spacer" />
      {b ? (
        <span className="tb-tools">
          <a className="tb-btn" href="/spiel/index.html">🎮<span className="tb-label"> Spielen</span></a>
          {istLehrkraft(b) && <Link className="tb-btn" href="/lehrkraft">🏫<span className="tb-label"> Lehrkraft</span></Link>}
          {istAdmin(b) && <Link className="tb-btn" href="/admin">🛡️<span className="tb-label"> Admin</span></Link>}
          <Link className="tb-btn" href="/konto">👤<span className="tb-label"> {b.username}</span></Link>
          <Abmelden />
        </span>
      ) : (
        <span className="tb-tools">
          <Link className="tb-btn" href="/anmelden">Anmelden</Link>
          <Link className="tb-btn tb-save" href="/registrieren">Registrieren</Link>
        </span>
      )}
    </header>
  );
}
