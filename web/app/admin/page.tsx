import { redirect } from 'next/navigation';
import { abfrage } from '@/lib/db';
import { benutzer, istAdmin } from '@/lib/rechte';
import { Kopf } from '../_teile/Kopf';
import { Fuss } from '../_teile/Fuss';
import { AdminAktionen } from './Aktionen';

type Lk = { id: string; username: string; status: string; erstellt: Date; klassen: number };

export default async function Admin() {
  const b = await benutzer();
  if (!b) redirect('/anmelden?weiter=/admin');
  if (!istAdmin(b)) redirect('/');
  const lk = await abfrage<Lk>(
    `select u.id, u.username, u."lehrkraftStatus" as status, u."createdAt" as erstellt, count(k.id)::int as klassen
       from "user" u left join klasse k on k.lehrkraft_id = u.id where u.rolle = 'lehrkraft' group by u.id order by u."lehrkraftStatus", u."createdAt" desc`);
  const [z] = await abfrage<{ lernende: number; klassen: number; spielstaende: number }>(
    `select (select count(*)::int from "user" where rolle = 'lernend') as lernende, (select count(*)::int from klasse) as klassen, (select count(*)::int from spielstand) as spielstaende`);
  return (
    <>
      <Kopf />
      <main className="seite">
        <h2>🛡️ Admin</h2>
        <div className="statkacheln"><div className="statkachel blau"><span>Lernende</span><b>{z.lernende}</b></div><div className="statkachel gold"><span>Klassen</span><b>{z.klassen}</b></div><div className="statkachel gruen"><span>Spielstände</span><b>{z.spielstaende}</b></div></div>
        <div className="card tabelle-scroll">
          <h3>Lehrkräfte</h3>
          {lk.length ? (
            <table className="t">
              <thead><tr><th>Benutzername</th><th>Status</th><th className="num">Klassen</th><th>registriert</th><th>Aktion</th></tr></thead>
              <tbody>{lk.map(l => (
                <tr key={l.id} data-lehrkraft={l.username}>
                  <td><b>{l.username}</b></td><td>{l.status === 'frei' ? '✅ freigeschaltet' : '⏳ beantragt'}</td><td className="num">{l.klassen}</td>
                  <td className="small">{new Date(l.erstellt).toLocaleString('de-DE')}</td>
                  <td><AdminAktionen id={l.id} status={l.status} name={l.username} /></td>
                </tr>))}
              </tbody>
            </table>
          ) : <p className="muted">Noch keine Lehrkraft registriert.</p>}
          <p className="small muted">Prüft vor dem Freischalten, ob ihr die Person kennt – Lehrkräfte sehen die Spielstände ihrer Klassen und können Passwörter zurücksetzen.</p>
        </div>
        <Fuss />
      </main>
    </>
  );
}
