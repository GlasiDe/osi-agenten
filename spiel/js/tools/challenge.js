/* OSI-Agenten – Zeit-Challenge: Begriffe in Sekunden der richtigen Schicht zuordnen.
   Immer nur ein Lauf aktiv: Wer die Challenge verlässt oder neu startet, beendet den alten Lauf (Zeitschleife + Tastatur).
   Nach einem Fehler steht die Uhr kurz, damit man die richtige Schicht lesen kann. */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, OSI = window.OSI, Kit = window.OSIKit;
  const { esc, $, $$, shuffle, layerColor } = Kit.util;
  const PAUSE = 2500;
  let lauf = 0;

  function start() {
    const C = OSI.challenge;
    const meinLauf = ++lauf;
    let pool = shuffle(C.pool), idx = 0, score = 0, fehler = 0, serie = 0, ende = Date.now() + C.sekunden * 1000, pause = false, timer = null;
    G.view = 'challenge';
    G.tasten = null;
    G.renderTopbar();
    const app = $('#app');
    const aktiv = () => meinLauf === lauf && G.view === 'challenge' && document.getElementById('ch-item');
    const stopp = () => { clearTimeout(timer); document.removeEventListener('keydown', taste); };
    const prozent = () => Math.max(0, Math.min(100, (ende - Date.now()) / (C.sekunden * 10)));

    const draw = () => {
      const it = pool[idx % pool.length];
      app.innerHTML = `<div class="challenge">
        <div class="step-kopf"><button class="step-zu" id="ch-x" title="Challenge abbrechen" aria-label="Challenge abbrechen">✕</button>
          <div class="timebar"><i id="ch-t" style="width:${prozent()}%"></i></div><span class="ch-uhr">⏱️</span></div>
        <div class="ch-top"><span class="ch-stat gruen">✔ Richtige: <b id="ch-s">${score}</b></span>${serie >= 3 ? `<span class="ch-stat flamme">🔥 ${serie}</span>` : ''}<span class="ch-stat rot">✘ ${fehler}</span></div>
        <div class="ch-item" id="ch-item">${esc(it.t)}</div>
        <div class="ch-btns">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button data-l="${n}" style="--k:${layerColor(n)}">L${n}</button>`).join('')}</div>
        <p class="hinweiszeile mitte" id="ch-hint">Tastatur: Zifferntasten 1–7</p></div>`;
      $$('.ch-btns button', app).forEach(b => b.onclick = () => antwort(+b.dataset.l));
      $('#ch-x').onclick = () => { stopp(); G.render(); };
    };
    const antwort = n => {
      if (pause || !aktiv()) return;
      const it = pool[idx % pool.length];
      if (n === it.l) { score++; serie++; A.play('klick'); idx++; draw(); Kit.fx.anstoss($('#ch-item'), 'pop'); return; }
      // Fehler: Uhr anhalten, richtige Schicht zeigen, danach mit derselben Restzeit weiter
      fehler++; serie = 0; A.play('falsch'); pause = true;
      const rest = ende - Date.now();
      clearTimeout(timer);
      const item = $('#ch-item');
      item.innerHTML = `${esc(it.t)} → <span class="lchip" style="background:${layerColor(it.l)}">L${it.l}</span>`;
      item.classList.add('falsch');
      Kit.fx.anstoss(item, 'shake');
      $('#ch-hint').innerHTML = '⏸ Uhr angehalten – gleich geht es weiter.';
      $$('.ch-btns button', app).forEach(b => { b.disabled = true; if (+b.dataset.l === n) b.classList.add('daneben'); });
      setTimeout(() => {
        if (meinLauf !== lauf || G.view !== 'challenge') return;
        pause = false; idx++; ende = Date.now() + rest;
        draw(); tick();
      }, PAUSE);
    };
    const taste = ev => { if (ev.key >= '1' && ev.key <= '7') antwort(+ev.key); };
    document.addEventListener('keydown', taste);
    const tick = () => {
      clearTimeout(timer);
      if (meinLauf !== lauf || G.view !== 'challenge') return stopp();
      if (pause) return;
      const t = $('#ch-t');
      if (t) { t.style.width = prozent() + '%'; t.parentElement.classList.toggle('knapp', prozent() < 20); }
      if (ende - Date.now() <= 0) return fertig();
      timer = setTimeout(tick, 200);
    };
    const fertig = () => {
      stopp();
      G.view = 'hub';
      const ch = G.save.challenge;
      const rekord = score > ch.best;
      ch.runs++;
      if (rekord) ch.best = score;
      G.persist();
      C.abzeichen.forEach(a => { if (score >= a.ab) G.abzeichen(a.id); });
      app.innerHTML = `<div class="card summary challenge-ende">
        <div class="kapitel-ende-figur">${Kit.avatars.svg(G.save.duo.avatar, { pose: rekord ? 'jubel' : 'stand', klasse: 'av-gross' })}</div>
        <h2>Zeit abgelaufen!</h2><div><span class="big">${score}</span> <span class="muted">Richtige</span></div><div class="muted">${fehler} Fehler</div>
        ${rekord ? '<p class="rekord">🏆 Neuer Rekord!</p>' : `<p class="muted">Euer Rekord: ${ch.best} Richtige</p>`}
        <div class="btnrow mitte"><button class="btn gross" id="ch-again">Nochmal</button><button class="btn sec" id="ch-back">Zurück</button></div></div>`;
      if (rekord) { A.play('rang'); Kit.fx.konfetti(70); }
      $('#ch-again').onclick = start;
      $('#ch-back').onclick = () => G.render();
    };
    draw(); tick();
  }

  G.challenge = { start };
})();
