/* OSI-Agenten – gemeinsame Bausteine der Schritt-Renderer: Sprechblasen, Kalle-Tipps, Feedback-Leiste,
   Antwort-Kacheln (Einfach-/Mehrfachwahl, Schicht-Knöpfe) und Freitext-Vergleich. */
(function () {
  'use strict';
  const G = window.OSIGame, OSI = window.OSI, Kit = window.OSIKit;
  const { esc, $, $$, layerColor } = Kit.util;
  const B = G.bausteine = {};

  // ---------------------------------------------------------------- Easter Eggs (Kalle anklicken, data-egg)
  let kalleKlicks = 0;
  B.bindEggs = root => {
    $$('.kalle-click', root).forEach(el => el.addEventListener('click', () => {
      Kit.fx.anstoss(el, 'wackel');
      if (++kalleKlicks === 5) { G.toast('☕ Kalle: „Finger weg von meinem Kaffee!“'); G.abzeichen('koffein'); }
    }));
    $$('[data-egg]', root).forEach(el => el.addEventListener('click', () => {
      const egg = OSI.eggs[el.dataset.egg];
      if (!egg) return;
      G.modal(`<div class="egg-text">${egg.text}</div><div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`);
      if (egg.abzeichen) G.abzeichen(egg.abzeichen);
    }));
  };

  // ---------------------------------------------------------------- Figuren-Sprechblasen
  // i: Position (gestaffeltes Einblenden), alt: schon gezeigt (nicht erneut animieren)
  B.dialogHtml = (sz, i = 0, alt = false) => {
    const f = G.figur(sz.wer);
    const cls = sz.wer === 'kalle' ? 'kalle' : sz.wer === 'system' ? 'system' : '';
    const img = f.bild ? `<img class="portrait ${sz.wer === 'kalle' ? 'kalle-click' : ''}" src="img/${f.bild}" alt="${esc(f.name)}">` : `<div class="portrait sys">${f.icon || '📡'}</div>`;
    return `<div class="dialog ${cls} ${alt ? 'alt' : ''}" style="--i:${i}">${img}<div class="bubble"><div class="who">${esc(f.name)}</div>${sz.text}</div></div>`;
  };
  B.kalleBox = text => `<div class="kallebox"><img class="kalle-click" src="img/${OSI.figuren.kalle.bild}" alt="Kalle"><div><b class="kalle-name">Kalle:</b> ${text}</div></div>`;
  G.kalleBox = B.kalleBox;

  // ---------------------------------------------------------------- Tipps von Kalle
  B.hinweisBlock = (q, root, onUse) => {
    const hs = q.hinweise || [];
    const wrap = document.createElement('div');
    wrap.className = 'hints';
    const draw = () => {
      const it = G.itemState(q.id);
      wrap.innerHTML = hs.slice(0, it.h).map((h, i) => `<div class="hint"><img src="img/${OSI.figuren.kalle.bild}" alt=""><div><b class="kalle-name">Tipp ${i + 1}:</b> ${h}</div></div>`).join('') +
        (hs.length && it.h < hs.length && !it.ok ? `<button class="hintbtn">💡 Kalle um ${it.h ? 'noch einen ' : 'einen '}Tipp bitten <span class="small">${G.uebung ? '(Übung – kostet nichts, aber kein ⭐)' : '(kostet Punkte)'}</span></button>` : '');
      const b = $('.hintbtn', wrap);
      if (b) b.onclick = () => { G.hinweisNutzen(q.id); draw(); if (onUse) onUse(); };
    };
    draw();
    root.appendChild(wrap);
    return draw;
  };

  // ---------------------------------------------------------------- Feedback-Leiste (Duolingo: grün/rot, klebt unten im Bild)
  // art: true = richtig, false = falsch, 'neutral'. Liefert das Element (dort hängen die Weiter-Knöpfe).
  B.feedback = (root, art, html, pts, titel) => {
    let fb = $(':scope > .feedback', root);
    if (!fb) { fb = document.createElement('div'); root.appendChild(fb); }
    const ok = art === true, neutral = art === 'neutral';
    fb.className = 'feedback sheet ' + (ok ? 'ok' : neutral ? 'neutral' : 'bad');
    fb.innerHTML = `<div class="feedback-kopf"><span class="feedback-icon">${ok ? '✔' : neutral ? '🤷' : '✘'}</span><b>${titel || (ok ? B.lob() : 'Leider nicht.')}</b>${pts ? ` <span class="pt">+${pts} XP</span>` : ''}</div>
      ${html ? `<div class="feedback-text">${html}</div>` : ''}`;
    Kit.fx.anstoss(fb, 'rein');
    return fb;
  };
  const LOB = ['Richtig!', 'Stark!', 'Genau!', 'Sauber ermittelt!', 'Volltreffer!', 'Richtig so!'];
  B.lob = () => LOB[Math.floor(Math.random() * LOB.length)];

  // Knopfzeile in die Feedback-Leiste hängen (z. B. „Nächste Aufgabe“)
  B.knopf = (fb, id, label, onClick) => {
    const row = document.createElement('div');
    row.className = 'btnrow';
    row.innerHTML = `<button class="btn" id="${id}">${label}</button>`;
    fb.appendChild(row);
    const b = $('#' + id, row);
    b.onclick = onClick;
    b.focus({ preventScroll: true });
    G.zeige(fb);
    return b;
  };

  B.weiterButton = (label = 'Weiter') => `<div class="btnrow"><button class="btn gross" id="st-weiter">${label}</button></div>`;

  // ---------------------------------------------------------------- Antwort-Kacheln
  const SCHICHTEN = [1, 2, 3, 4, 5, 6, 7];
  B.SCHICHTEN = SCHICHTEN;
  B.schichtKnoepfe = () => `<div class="triage-btns">${SCHICHTEN.map(n => `<button data-v="${n}" style="--k:${layerColor(n)}">L${n}</button>`).join('')}</div>`;
  B.optKachel = (q, i, nr, extra = '') => `<button class="opt ${q.multi ? 'multi' : ''}" data-i="${i}" ${q.multi ? 'aria-pressed="false"' : ''}>${nr != null ? `<span class="opt-nr">${nr}</span>` : ''}${q.multi ? '<span class="opt-box" aria-hidden="true"></span>' : ''}${q.bilder ? `<img src="img/${q.bilder[i]}" alt="">` : ''}<span class="opt-text">${q.optionen[i]}</span>${extra}</button>`;
  // Mehrfachauswahl umschalten; liefert die Auswahl als Set
  B.mehrfach = (root, onChange) => {
    const sel = new Set();
    $$('.opt', root).forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      if (sel.has(i)) sel.delete(i); else sel.add(i);
      b.classList.toggle('sel', sel.has(i));
      b.setAttribute('aria-pressed', String(sel.has(i)));
      window.OSIAudio.play('klick');
      if (onChange) onChange(sel);
    }));
    return sel;
  };
  B.mengeGleich = (a, b) => a.size === b.size && [...a].every(i => b.has(i));

  // Tastatur: Ziffern wählen Kachel/Schicht, Enter drückt den Haupt-Knopf
  B.tasten = (root, { enter } = {}) => {
    G.tasten = ev => {
      if (!root.isConnected) return;
      if (ev.key === 'Enter' && enter) { const b = $(enter, root); if (b && !b.disabled) { ev.preventDefault(); b.click(); } return; }
      if (!/^[1-9]$/.test(ev.key)) return;
      const b = $('.triage-btns', root) ? $(`.triage-btns button[data-v="${ev.key}"]`, root) : $$('.opt', root)[+ev.key - 1];
      if (b && !b.disabled) { ev.preventDefault(); b.click(); }
    };
  };

  // ---------------------------------------------------------------- Freitext-Antworten vergleichbar machen
  B.normAntwort = (v, art) => {
    let s = String(v || '').trim().toLowerCase();
    if (art === 'mac') return s.replace(/[^0-9a-f]/g, '');
    s = s.replace(/\s+/g, ' ');
    if (art === 'zahl' || art === 'ip') s = s.replace(/\s/g, '');
    return s;
  };
})();
