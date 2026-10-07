/* OSI-Agenten – Abschlussverhör: einzeln pro Kürzel, nur Diagnose.
   Antworten in save.verhoer[kürzel] = { start, ende, a: { frageId: { v, ok, wn? } } } – keine Punkte, keine Tipps, ein Versuch.
   Antwortoptionen sind pro Person stabil gemischt (Kürzel + Frage), damit Mitschauen weniger bringt. */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, Kit = window.OSIKit;
  const B = G.bausteine, R = G.renderer;
  const { esc, $, $$, stableShuffle } = Kit.util;
  const BEREICHE = ['Modell', 'L1', 'L2', 'L3', 'L4', 'L5–7'];
  let person = null;

  R.verhoer = (box, st, e, ctx) => {
    const qs = st.verhoerFragen;
    const V = G.save.verhoer, agenten = G.save.duo.agenten;
    const rec = k => V[k] || (V[k] = { start: null, ende: null, a: {} });
    const alleFertig = () => agenten.every(k => V[k] && V[k].ende);
    const richtige = r => qs.filter(q => r.a[q.id] && r.a[q.id].ok).length;
    if (person && !agenten.includes(person)) person = null;

    const auswahl = () => {
      person = null;
      G.tasten = null;
      const fertig = alleFertig();
      if (fertig) { ctx.fertig(); if (st.abzeichen) G.abzeichen(st.abzeichen); }
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>${esc(st.titel)}</h2></div>
        ${st.intro || ''}
        <div class="verhoer-liste">${agenten.map(k => {
          const r = V[k];
          const status = r && r.ende ? `abgeschlossen · ${richtige(r)} von ${qs.length} richtig` : r && r.start ? `begonnen · ${Object.keys(r.a).length} von ${qs.length} beantwortet` : 'noch nicht verhört';
          return `<div class="verhoer-person"><b>${esc(k)}</b><span class="muted small">${status}</span>
            ${r && r.ende ? '<span class="toc-ok">✓</span>' : `<button class="btn" data-k="${esc(k)}">${r && r.start ? 'Verhör fortsetzen' : 'Verhör beginnen'}</button>`}</div>`;
        }).join('')}</div>
        ${fertig ? `<div class="merk"><b>Alle Verhöre abgeschlossen.</b> Exportiert jetzt euren Spielstand und gebt die Datei bei eurer Lehrkraft ab – damit ist die Akte übergeben.</div>
          <div class="btnrow"><button class="btn gross" id="st-weiter">Zur Abschlussbesprechung</button><button class="btn sec" id="vh-exp">⬇ Spielstand exportieren</button></div>` : ''}</div>`;
      $$('[data-k]', box).forEach(b => b.onclick = () => { person = b.dataset.k; A.play('klick'); frage(); window.scrollTo(0, 0); });
      if (fertig) { $('#vh-exp', box).onclick = G.exportieren; $('#st-weiter', box).onclick = ctx.weiter; }
    };

    const frage = () => {
      const k = person, r = rec(k);
      if (!r.start) { r.start = new Date().toISOString(); G.persist(); }
      const i = qs.findIndex(q => !r.a[q.id]);
      if (i < 0) return abschluss();
      const q = qs[i];
      const reihe = stabilMischen(q, k);
      let opts;
      if (q.eingabe) opts = `<div class="eingabe-row"><input type="text" id="vh-in" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(q.platzhalter || 'Antwort eintippen')}"><button class="btn" id="vh-send">Absenden</button></div>`;
      else if (q.layer) opts = B.schichtKnoepfe();
      else if (q.multi) opts = `<p class="hinweiszeile">Mehrere Antworten möglich.</p><div class="opts">${reihe.map((j, n) => B.optKachel(q, j, n + 1)).join('')}</div><div class="btnrow"><button class="btn" id="vh-send">Absenden</button></div>`;
      else opts = `<div class="opts">${reihe.map((j, n) => B.optKachel(q, j, n + 1)).join('')}</div>`;
      box.innerHTML = `<div class="card aufgabe verhoer">
        <div class="task-head"><h2>🕵️ Verhör · ${esc(k)}</h2><span class="task-count">${i + 1} / ${qs.length}</span></div>
        <div class="fortschritt lila"><i style="width:${Math.round(i / qs.length * 100)}%"></i></div>
        <p class="hinweiszeile">Ein Versuch, keine Tipps, keine Punkte. Die Lösung seht ihr nach dem Absenden.</p>
        ${q.ticket ? `<div class="ticket"><div class="tno">${esc(q.ticketNr || 'Störungsmeldung')}</div>${q.ticket}</div>` : ''}
        ${q.kontext || ''}
        <div class="frage">${q.frage}</div><div id="vh-opts">${opts}
        <div class="btnrow"><button class="btn ghost" id="vh-weissnicht">🤷 Weiß ich nicht</button></div></div><div id="vh-fb"></div></div>`;
      const area = $('#vh-opts', box);
      const absenden = (wert, ok, weissNicht) => {
        if (r.a[q.id]) return;
        r.a[q.id] = weissNicht ? { v: '?', ok: false, wn: true } : { v: String(wert), ok };
        if (qs.every(x => r.a[x.id])) r.ende = new Date().toISOString();
        G.persist();
        A.play(ok ? 'richtig' : weissNicht ? 'klick' : 'falsch');
        $$('button, input', area).forEach(b => { b.disabled = true; });
        const loesung = q.eingabe ? [].concat(q.richtig)[0] : q.layer ? 'L' + [].concat(q.richtig)[0] : q.multi ? q.richtig.map(j => q.optionen[j]).join(' · ') : q.optionen[q.richtig];
        if (!q.eingabe && !q.layer) $$('.opt', area).forEach(b => { if ([].concat(q.richtig).includes(+b.dataset.i)) b.classList.add('right'); });
        const fb = B.feedback($('#vh-fb', box), ok ? true : weissNicht ? 'neutral' : false, `${ok ? '' : `Richtig wäre: <b>${loesung}</b>. `}${q.erklaerung || ''}`, 0, ok ? 'Richtig.' : weissNicht ? 'Ehrlich – gut so.' : 'Nicht richtig.');
        B.knopf(fb, 'vh-next', r.ende ? 'Verhör abschließen' : 'Nächste Frage', () => { frage(); window.scrollTo(0, 0); });
      };
      $('#vh-weissnicht', box).onclick = () => absenden(null, false, true);
      if (q.eingabe) {
        const inp = $('#vh-in', box);
        const go = () => { const roh = inp.value.trim(); if (!roh) return; const n = B.normAntwort(roh, q.eingabe); absenden(n, [].concat(q.richtig).some(x => B.normAntwort(x, q.eingabe) === n)); };
        $('#vh-send', box).onclick = go;
        inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } };
      } else if (q.layer) {
        $$('.triage-btns button', area).forEach(b => { b.onclick = () => absenden(b.dataset.v, [].concat(q.richtig).map(String).includes(b.dataset.v)); });
      } else if (q.multi) {
        const sel = B.mehrfach(area);
        $('#vh-send', box).onclick = () => { if (!sel.size) return; absenden([...sel].sort().join('+'), B.mengeGleich(sel, new Set(q.richtig))); };
      } else {
        $$('.opt', area).forEach(b => { b.onclick = () => absenden(b.dataset.i, +b.dataset.i === q.richtig); });
      }
      B.tasten(box, { enter: '#vh-next' });
    };

    const abschluss = () => {
      const k = person, r = rec(k);
      G.tasten = null;
      const bereiche = [...new Set(qs.map(q => q.bereich))].sort((a, b) => BEREICHE.indexOf(a) - BEREICHE.indexOf(b));
      const zeilen = bereiche.map(bz => {
        const f = qs.filter(q => q.bereich === bz);
        const n = f.filter(q => r.a[q.id] && r.a[q.id].ok).length;
        return `<tr><td>${esc(bz)}</td><td class="num">${n} / ${f.length}</td><td>${n === f.length ? '✔ sicher' : n ? 'teilweise – nochmal anschauen' : '✘ nochmal anschauen'}</td></tr>`;
      }).join('');
      const n = richtige(r), wn = qs.filter(q => r.a[q.id] && r.a[q.id].wn).length;
      const lob = n >= qs.length - 1 ? 'Saubere Arbeit – so sicher wünsche ich mir das in der ganzen Einheit.'
        : n >= qs.length * 0.6 ? 'Solide Arbeit. Die paar Stellen, die noch wackeln, schauen Sie sich in Ruhe noch einmal an.'
          : 'Danke für die ehrlichen Antworten – die sind mir lieber als geratene. Jetzt wissen wir genau, wo wir ansetzen.';
      A.play('abzeichen');
      box.innerHTML = `<div class="card summary"><div class="eyebrow">Verhör ${esc(k)} abgeschlossen</div><h2>${n} von ${qs.length} richtig</h2>
        <div class="links">${B.dialogHtml({ wer: 'direktorin', text: `Danke, ${esc(k)}. Sie haben diesen Fall von L1 bis L7 mitgetragen. ${lob}` })}</div>
        ${wn ? `<p class="small muted">Davon ${wn}× „Weiß ich nicht“ – ehrlich ist besser als geraten.</p>` : ''}
        <p class="muted">Das ist keine Note. Es zeigt euch und eurer Lehrkraft, wo ihr sicher seid – und was ihr euch nochmal anschauen solltet, z. B. mit „Nochmal üben“ in den Einsätzen.</p>
        <table class="t schmal">${zeilen}</table>
        <div class="btnrow mitte"><button class="btn gross" id="vh-back">Zurück zur Übersicht</button></div></div>`;
      $('#vh-back', box).onclick = () => { auswahl(); window.scrollTo(0, 0); };
    };

    if (person) frage(); else auswahl();
  };

  const stabilMischen = (q, k) => stableShuffle((q.optionen || []).map((o, j) => j), k + '|' + q.id);
})();
