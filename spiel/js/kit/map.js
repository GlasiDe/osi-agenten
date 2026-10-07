/* OSI-Agenten – Kletterkarte: alle Schritte als Knoten auf einem Pfad von unten nach oben (E0 → L1 … L7 → Finale → Verhör).
   Zwei Anordnungen aus denselben Daten:
     'pfad'    – ein langer Duolingo-Pfad (Spiel)
     'spalten' – ein Turm je Kapitel nebeneinander (Einsatzzentrale/Beamer)
   Rein darstellend: Status, Klicks und Figuren kommen vom Aufrufer. */
(function () {
  'use strict';
  const Kit = window.OSIKit = window.OSIKit || {};
  const { esc } = Kit.util;

  const TYP_ICON = { story: '🎬', lesson: '📖', quiz: '❓', sort: '🗂️', kapsel: '🧩', sealed: '★', ende: '🏁', anklage: '⚖️', verhoer: '🕵️', urkunde: '🏅' };
  const TYP_NAME = { story: 'Handlung', lesson: 'Lektion', quiz: 'Aufgaben', sort: 'Sortieren', kapsel: 'Puzzle', sealed: 'Bonus-Akte', ende: 'Abschluss', anklage: 'Anklage', verhoer: 'Verhör', urkunde: 'Urkunde' };
  const farbe = e => `var(--${e.farbe || 'brand'})`;

  const MASSE = {
    pfad: { breite: 340, abstand: 92, ausschlag: 74, banner: 128, rand: 70, knoten: 66, bonus: 48 },
    spalten: { spalte: 168, abstand: 58, ausschlag: 34, banner: 82, rand: 96, knoten: 40, bonus: 30 }
  };

  // ---------- Anordnung
  function layout(kapitelListe, modus = 'pfad') {
    const M = MASSE[modus];
    const knoten = [], kapitel = [], pfade = [];
    const welle = k => Math.round(Math.sin(k * Math.PI / 4) * M.ausschlag);
    let hoehe;

    if (modus === 'pfad') {
      // von unten zählen (yb), danach umrechnen
      let yb = M.rand;
      const roh = [];
      kapitelListe.forEach(e => {
        kapitel.push({ e, yb, h: M.banner });
        yb += M.banner + 82; // Platz für die START-Blase unter dem ersten Knoten
        let k = 0;
        const seg = [];
        e.steps.forEach((st, idx) => {
          if (st.bonus) return;
          const n = { st, e, idx, x: M.breite / 2 + welle(k), yb, groesse: M.knoten };
          roh.push(n); seg.push(n); k++; yb += M.abstand;
        });
        pfade.push(seg);
        yb += 26; // Luft für die Figur auf dem letzten Knoten unter dem nächsten Banner
      });
      hoehe = yb + M.rand;
      roh.forEach(n => { n.y = hoehe - n.yb; knoten.push(n); });
      kapitel.forEach(c => { c.x = 0; c.w = M.breite; c.y = hoehe - c.yb - c.h; });
      return mitBonus({ modus, M, breite: M.breite, hoehe, knoten, kapitel, pfade: pfade.map(s => s.map(n => [n.x, n.y])), ziel: { x: M.breite / 2, y: 26 } }, kapitelListe);
    }

    // Spalten: Kapitel nebeneinander, in jeder Spalte geht es nach oben
    const max = Math.max(...kapitelListe.map(e => e.steps.filter(s => !s.bonus).length));
    hoehe = M.rand + M.banner + max * M.abstand + 84;
    kapitelListe.forEach((e, ci) => {
      const cx = ci * M.spalte + M.spalte / 2;
      kapitel.push({ e, x: ci * M.spalte + 6, w: M.spalte - 12, y: hoehe - M.banner, h: M.banner - 10 });
      let k = 0;
      const seg = [];
      e.steps.forEach((st, idx) => {
        if (st.bonus) return;
        const n = { st, e, idx, x: cx + welle(k), y: hoehe - M.banner - 44 - k * M.abstand, groesse: M.knoten };
        knoten.push(n); seg.push([n.x, n.y]); k++;
      });
      pfade.push(seg);
    });
    const breite = kapitelListe.length * M.spalte;
    // Ziel (Pokal) über dem letzten Turm – dort stehen Duos, die alles erledigt haben
    const oben = knoten[knoten.length - 1];
    const ziel = { x: breite - M.spalte / 2, y: Math.max(34, oben.y - 84) };
    return mitBonus({ modus, M, breite, hoehe, knoten, kapitel, pfade, ziel }, kapitelListe);
  }

  // Bonus-Akten liegen neben dem Pfad, zwischen ihren Nachbarn – sie gehören nicht zur Pflicht-Strecke
  function mitBonus(lay, kapitelListe) {
    const M = lay.M;
    kapitelListe.forEach(e => e.steps.forEach((st, idx) => {
      if (!st.bonus) return;
      const vor = lay.knoten.filter(n => n.e === e && n.idx < idx).pop();
      const nach = lay.knoten.find(n => n.e === e && n.idx > idx);
      const a = vor || nach, b = nach || vor;
      if (!a) return;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const mitte = lay.modus === 'pfad' ? lay.breite / 2 : Math.floor(mx / M.spalte) * M.spalte + M.spalte / 2;
      const seite = mx >= mitte ? -1 : 1;
      lay.knoten.push({ st, e, idx, bonus: true, x: mitte + seite * (lay.modus === 'pfad' ? 112 : 56), y: my, groesse: M.bonus });
    }));
    lay.strecke = lay.knoten.filter(n => !n.bonus); // Reihenfolge der Pflicht-Schritte = Laufweg der Figuren
    lay.index = Object.fromEntries(lay.strecke.map((n, i) => [n.st.id, i]));
    lay.byId = Object.fromEntries(lay.knoten.map(n => [n.st.id, n]));
    return lay;
  }

  // Weiche Kurve durch Punkte (Catmull-Rom → Bézier)
  function kurve(p) {
    if (p.length < 2) return '';
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  // ---------- Zeichnen
  // opt.status(n) → 'done' | 'cur' | 'open' | 'locked'; opt.stern(n) → bool; opt.fortschritt(e) → 0..1; opt.onKnoten(n, btn)
  function render(el, lay, opt = {}) {
    const status = opt.status || (() => 'open');
    const verbinder = lay.modus === 'spalten'
      ? lay.pfade.slice(0, -1).map((s, i) => { const a = s[s.length - 1], b = lay.pfade[i + 1][0]; return a && b ? `<path class="map-seil" d="M${a[0]},${a[1]} C${a[0] + 60},${a[1] - 80} ${b[0] - 60},${b[1] + 60} ${b[0]},${b[1]}"/>` : ''; }).join('')
      : '';
    el.innerHTML = `<div class="map map--${lay.modus}" style="width:${lay.breite}px;height:${lay.hoehe}px">
      <svg class="map-wege" width="${lay.breite}" height="${lay.hoehe}" viewBox="0 0 ${lay.breite} ${lay.hoehe}" aria-hidden="true">
        ${lay.pfade.map((s, i) => `<path class="map-weg" style="--k:${farbe(lay.kapitel[i].e)}" d="${kurve(s)}"/>`).join('')}${verbinder}
      </svg>
      ${lay.kapitel.map(c => {
        const f = opt.fortschritt ? opt.fortschritt(c.e) : null;
        const zu = opt.kapitelZu && opt.kapitelZu(c.e);
        return `<div class="map-kapitel ${zu ? 'is-locked' : ''}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--k:${farbe(c.e)}">
          <div class="map-kapitel-icon">${c.e.icon || '📁'}</div>
          <div class="map-kapitel-text"><div class="map-kapitel-nr">${esc(c.e.nrText)}</div><div class="map-kapitel-titel">${esc(c.e.titel)}</div>
          ${lay.modus === 'pfad' ? `<div class="map-kapitel-sub">${esc(c.e.untertitel || '')}</div>` : ''}
          ${f != null ? `<div class="map-kapitel-bar"><i style="width:${Math.round(f * 100)}%"></i></div>` : ''}</div></div>`;
      }).join('')}
      ${lay.ziel ? `<div class="map-ziel" style="left:${lay.ziel.x}px;top:${lay.ziel.y}px" title="Fall abgeschlossen">🏆</div>` : ''}
      ${lay.knoten.map((n, i) => {
        const s = status(n);
        const icon = s === 'locked' ? '🔒' : TYP_ICON[n.st.type] || '•';
        const stern = opt.stern && opt.stern(n);
        return `<button type="button" class="map-knoten is-${s} ${n.bonus ? 'is-bonus' : ''} typ-${n.st.type}" data-step="${esc(n.st.id)}" data-e="${esc(n.e.id)}"
          style="left:${n.x}px;top:${n.y}px;--k:${farbe(n.e)};--g:${n.groesse}px;--i:${i}" aria-label="${esc((n.st.titel || n.st.id) + ' – ' + (TYP_NAME[n.st.type] || '') + (s === 'done' ? ', erledigt' : s === 'locked' ? ', gesperrt' : ''))}">
          <span class="map-knoten-icon">${icon}</span>${s === 'done' ? '<span class="map-haken">✓</span>' : ''}${stern ? '<span class="map-stern" title="beim Üben gemeistert">⭐</span>' : ''}
          ${s === 'cur' && opt.start !== false ? '<span class="map-start">START</span>' : ''}</button>`;
      }).join('')}
      <div class="map-pins"></div>
      <div class="map-pop hidden" role="dialog"></div>
    </div>`;
    const root = el.firstElementChild;
    if (opt.onKnoten) root.addEventListener('click', ev => {
      const b = ev.target.closest('.map-knoten');
      if (!b) { if (!ev.target.closest('.map-pop')) pop(root, null); return; }
      opt.onKnoten(lay.byId[b.dataset.step], b);
    });
    return { root, lay };
  }

  // Sprechblase an einem Knoten (Titel, Status, Knöpfe). html = null schließt sie.
  function pop(root, n, html) {
    const p = root.querySelector('.map-pop');
    if (!n) { p.classList.add('hidden'); return; }
    p.innerHTML = html;
    p.style.left = n.x + 'px';
    p.style.top = (n.y + n.groesse / 2 + 14) + 'px';
    p.style.setProperty('--k', farbe(n.e));
    p.classList.remove('hidden', 'rein'); void p.offsetWidth; p.classList.add('rein');
  }

  // ---------- Figuren auf der Karte
  // pins: [{ ziel: stepId | 'ziel', avatar, name, ich, titel }]; opt.von: Start-Index für den Lauf, opt.lauf: animieren
  function pinne(karte, pins, opt = {}) {
    const { root, lay } = karte;
    const ebene = root.querySelector('.map-pins');
    const zielPos = z => z === 'ziel' && lay.ziel ? { x: lay.ziel.x, y: lay.ziel.y + 30, i: lay.strecke.length } : (() => { const n = lay.byId[z]; return n ? { x: n.x, y: n.y - n.groesse / 2 + 6, i: lay.index[z] } : null; })();
    const gruppen = {};
    pins.forEach(p => { (gruppen[p.ziel] = gruppen[p.ziel] || []).push(p); });
    const MAX = 4, versatz = lay.modus === 'spalten' ? 28 : 34;
    const els = [];
    Object.entries(gruppen).forEach(([z, ps]) => {
      const pos = zielPos(z);
      if (!pos) return;
      const sichtbar = ps.slice(0, MAX), rest = ps.slice(MAX);
      sichtbar.forEach((p, j) => {
        const dx = (j - (sichtbar.length - 1) / 2) * versatz;
        const d = document.createElement('div');
        d.className = `map-pin ${p.ich ? 'is-ich' : ''}`;
        d.title = p.titel || p.name || '';
        d.innerHTML = `${p.name ? `<span class="map-tag">${esc(p.name)}</span>` : ''}${Kit.avatars.svg(p.avatar, { titel: false })}`;
        d.style.zIndex = String(10 + Math.round(pos.y)); // weiter unten = weiter vorn
        ebene.appendChild(d);
        els.push({ d, ziel: { x: pos.x + dx, y: pos.y, i: pos.i }, dx });
      });
      if (rest.length) {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'map-mehr';
        d.textContent = '+' + rest.length;
        d.title = rest.map(p => p.name).join(', ');
        d.style.transform = `translate(${pos.x + (sichtbar.length / 2) * versatz + 10}px, ${pos.y - 20}px)`;
        d.onclick = () => { if (opt.onMehr) opt.onMehr(ps); };
        ebene.appendChild(d);
      }
    });
    const setze = (o, x, y) => { o.d.style.transform = `translate(${x}px, ${y}px)`; };
    if (!opt.lauf || Kit.util.reducedMotion()) { els.forEach(o => setze(o, o.ziel.x, o.ziel.y)); return Promise.resolve(); }
    // Lauf: Knoten für Knoten entlang der Strecke hüpfen, gestaffelt
    const punkt = i => {
      if (i >= lay.strecke.length) return lay.ziel ? [lay.ziel.x, lay.ziel.y + 30] : [lay.strecke[lay.strecke.length - 1].x, lay.strecke[lay.strecke.length - 1].y];
      const n = lay.strecke[Math.max(0, i)];
      return [n.x, n.y - n.groesse / 2 + 6];
    };
    return Promise.all(els.map((o, j) => new Promise(fertig => {
      const von = Math.max(0, Math.min(opt.von != null ? opt.von : 0, o.ziel.i));
      const hops = o.ziel.i - von;
      if (hops <= 0) { setze(o, o.ziel.x, o.ziel.y); return fertig(); }
      const dauer = Math.min(opt.maxDauer || 2600, 260 * hops);
      const start = performance.now() + j * (opt.staffel || 0);
      const [sx, sy] = punkt(von);
      setze(o, sx + o.dx, sy);
      o.d.classList.add('is-lauf');
      let letzterHop = -1;
      const schritt = now => {
        const t = Math.max(0, Math.min(1, (now - start) / dauer));
        const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const f = von + e * hops, i = Math.floor(f), r = f - i;
        const [ax, ay] = punkt(i), [bx, by] = punkt(Math.min(i + 1, o.ziel.i));
        const sprung = Math.sin(r * Math.PI) * (lay.modus === 'spalten' ? 10 : 18);
        setze(o, ax + (bx - ax) * r + o.dx, ay + (by - ay) * r - sprung);
        if (i !== letzterHop) { letzterHop = i; if (opt.onHop) opt.onHop(i); }
        if (t < 1) requestAnimationFrame(schritt);
        else { setze(o, o.ziel.x, o.ziel.y); o.d.classList.remove('is-lauf'); o.d.classList.add('is-angekommen'); fertig(); }
      };
      requestAnimationFrame(schritt);
    })));
  }

  Kit.map = { layout, render, pop, pinne, TYP_ICON, TYP_NAME, farbe };
})();
