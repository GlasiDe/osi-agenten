/* Soundeffekte per Web Audio – keine Dateien, standardmäßig aus. */
(function () {
  'use strict';
  let ctx = null;
  let an = false;
  try { an = localStorage.getItem('osiagenten.ton') === '1'; } catch (e) { /* egal */ }

  function c() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    return ctx;
  }
  function ton(freq, dauer, typ = 'sine', start = 0, vol = 0.08) {
    const a = c(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = typ; o.frequency.value = freq;
    const t = a.currentTime + start;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dauer + 0.02);
  }
  const fx = {
    richtig() { ton(660, .12, 'triangle'); ton(990, .18, 'triangle', .09); },
    falsch() { ton(180, .25, 'sawtooth', 0, .05); },
    klick() { ton(1200, .03, 'square', 0, .03); },
    funk() { ton(1400, .05, 'square', 0, .03); ton(1400, .05, 'square', .08, .03); ton(1800, .08, 'square', .16, .03); },
    rang() { [523, 659, 784, 1047].forEach((f, i) => ton(f, .22, 'triangle', i * .11, .07)); },
    abzeichen() { ton(880, .1, 'triangle'); ton(1320, .25, 'triangle', .1); },
    tipp() { ton(420, .04, 'square', 0, .02); },
    kombo() { [784, 988, 1175].forEach((f, i) => ton(f, .12, 'triangle', i * .07, .06)); },
    kapitel() { [523, 659, 784, 1047, 1319].forEach((f, i) => ton(f, .26, 'triangle', i * .12, .07)); ton(1568, .5, 'sine', .62, .05); },
    hupf() { ton(520, .06, 'sine', 0, .04); ton(780, .05, 'sine', .04, .03); },
    plopp() { ton(880, .05, 'sine', 0, .05); }
  };
  window.OSIAudio = {
    get an() { return an; },
    set(v) { an = !!v; try { localStorage.setItem('osiagenten.ton', an ? '1' : '0'); } catch (e) { /* egal */ } if (an) c(); },
    play(n) { if (an && fx[n]) { try { fx[n](); } catch (e) { /* egal */ } } }
  };
})();
