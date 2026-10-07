/* Hell/Dunkel: folgt der Systemeinstellung, bis man selbst umschaltet (Komfort, nur in diesem Browser). */
(function () {
  'use strict';
  const Kit = window.OSIKit = window.OSIKit || {};
  const KEY = 'osiagenten.theme';
  const root = document.documentElement;
  const system = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  let gewaehlt = null;
  try { gewaehlt = localStorage.getItem(KEY); } catch (e) { /* egal */ }

  const aktuell = () => gewaehlt || system();
  const anwenden = () => { root.dataset.theme = aktuell(); };
  function umschalten() {
    gewaehlt = aktuell() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, gewaehlt); } catch (e) { /* egal */ }
    anwenden();
  }
  anwenden();
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', anwenden);
  Kit.theme = { aktuell, umschalten };
})();
