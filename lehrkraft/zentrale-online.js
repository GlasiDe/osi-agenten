/* OSI-Agenten – Live-Einsatzzentrale (nur Online-Fassung): lädt die Spielstände einer Klasse vom Server
   und aktualisiert sie alle 20 Sekunden. Aufruf: einsatzzentrale.html?klasse=<id>. Dateien hineinziehen geht weiterhin. */
(function () {
  'use strict';
  const klasse = new URLSearchParams(location.search).get('klasse');
  if (!klasse) return;
  const INTERVALL = 20000;
  const info = document.createElement('div');
  info.className = 'warnbar live';
  info.innerHTML = '🔴 <b>Live</b> · Klasse wird geladen …';
  document.getElementById('drop').before(info);

  async function holen() {
    try {
      const r = await fetch('/api/klassen/' + encodeURIComponent(klasse) + '/spielstaende', { credentials: 'same-origin' });
      if (r.status === 401) { location.href = '/anmelden?weiter=' + encodeURIComponent(location.pathname + location.search); return; }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      window.OSIZentrale.uebernehmen(d.spielstaende, 'online');
      info.innerHTML = `🔴 <b>Live</b> · Klasse <b>${d.klasse.name.replace(/[<>&]/g, '')}</b> · ${d.spielstaende.length} Spielstände · aktualisiert ${new Date().toLocaleTimeString('de-DE')} · <a href="/lehrkraft">zurück zum Lehrkraft-Bereich</a>`;
    } catch (e) {
      info.innerHTML = '⚠ Verbindung unterbrochen – neuer Versuch in 20 Sekunden.';
    }
  }
  holen();
  setInterval(() => { if (!document.hidden) holen(); }, INTERVALL);
})();
