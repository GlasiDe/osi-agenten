'use client';
import { useRouter } from 'next/navigation';
import { senden } from '../_teile/api';

export function AdminAktionen({ id, status, name }: { id: string; status: string; name: string }) {
  const router = useRouter();
  const tun = async (aktion: string, frage?: string) => {
    if (frage && !confirm(frage)) return;
    await senden('/api/admin/lehrkraefte', 'POST', { id, aktion });
    router.refresh();
  };
  return status === 'frei'
    ? <button className="btn ghost klein" onClick={() => tun('entziehen', `Lehrkraft-Rechte von „${name}“ entziehen?`)}>Rechte entziehen</button>
    : <div className="zeile">
        <button className="btn klein" data-aktion="freischalten" onClick={() => tun('freischalten')}>✅ Freischalten</button>
        <button className="btn ghost klein" onClick={() => tun('ablehnen', `Antrag von „${name}“ ablehnen und das Konto löschen?`)}>Ablehnen</button>
      </div>;
}
