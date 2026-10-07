/* OSI-Agenten – kleine Helfer für Spiel und Einsatzzentrale (ohne Abhängigkeit vom Spielzustand). */
(function () {
  'use strict';
  const Kit = window.OSIKit = window.OSIKit || {};

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
  const strip = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  // Stabil gemischt: gleiche Reihenfolge für denselben Schlüssel (z. B. Kürzel + Frage)
  const stableShuffle = (arr, schluessel) => {
    let x = (parseInt(window.OSIStore.hash(schluessel).slice(0, 6), 36) % 2147483646) + 1;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { x = (x * 16807) % 2147483647; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const pct = x => Math.round(x * 100) + ' %';
  const plural = (n, eins, mehr) => `${n} ${n === 1 ? eins : mehr}`;
  const layerColor = n => `var(--L${n})`;
  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const datumZeit = iso => iso ? new Date(iso).toLocaleString('de-DE') : '—';

  // CSV mit Semikolon und BOM (öffnet sich in Excel direkt richtig)
  function csvSpeichern(zeilen, name) {
    const txt = '﻿' + zeilen.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' }));
    a.download = `OSI-Agenten_${name}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  Kit.util = { esc, strip, shuffle, stableShuffle, $, $$, pct, plural, layerColor, reducedMotion, datumZeit, csvSpeichern };
})();
