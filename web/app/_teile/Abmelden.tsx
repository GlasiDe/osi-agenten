'use client';
import { senden } from './api';

export function Abmelden() {
  return <button className="tb-btn" title="Abmelden" onClick={async () => { await senden('/api/auth/sign-out', 'POST', {}); location.href = '/'; }}>🚪</button>;
}
