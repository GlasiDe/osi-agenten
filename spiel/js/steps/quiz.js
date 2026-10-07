/* OSI-Agenten – Aufgaben-Schritte: quiz (Einfachwahl, Schicht-Wahl, Klick-Auswahl, Mehrfachauswahl, Freitext,
   Frame melden – optional mit Terminal und Wireshark-Ansicht) und anklage (Beweiskarten im Finale). */
(function () {
  'use strict';
  const G = window.OSIGame, Kit = window.OSIKit;
  const B = G.bausteine, R = G.renderer;
  const { esc, $, $$, shuffle } = Kit.util;

  const korrekt = (q, wert) => [].concat(q.richtig).map(String).includes(String(wert)); // richtig kann eine Liste sein (z. B. TLS auf L5 oder L6)

  R.quiz = (box, st, e, ctx) => {
    const qs = st.fragen;
    const ersteOffene = () => { const i = qs.findIndex(q => !G.itemState(q.id).ok); return i < 0 ? qs.length : i; };
    let cur = ersteOffene();

    const draw = () => {
      box.innerHTML = `<div class="card aufgabe">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">${Math.min(cur + 1, qs.length)} / ${qs.length}</span></div>
        <div class="task-punkte">${qs.map((q, i) => `<i class="${G.itemState(q.id).ok ? 'ok' : i === cur ? 'cur' : ''}"></i>`).join('')}</div>
        ${st.intro ? `<div class="intro">${st.intro}</div>` : ''}
        ${st.kontext ? `<div id="kontext">${typeof st.kontext === 'function' ? st.kontext() : st.kontext}</div>` : ''}
        ${st.wireshark ? '<div id="ws-mount"></div>' : ''}${st.terminal ? '<div id="term-mount"></div>' : ''}
        <div id="qarea"></div></div>`;
      B.bindEggs(box);
      if (st.nachKontext) st.nachKontext(box);
      if (st.wireshark) G.wiresharkMount($('#ws-mount', box), st.wireshark, st.id);
      if (st.terminal) G.terminalMount($('#term-mount', box), st.terminal, st.id);
      const area = $('#qarea', box);
      if (cur >= qs.length) return zusammenfassung(area);
      frage(area, qs[cur]);
    };

    const zusammenfassung = area => {
      area.innerHTML = `<div class="feedback ok"><div class="feedback-kopf"><span class="feedback-icon">✔</span><b>Alle Aufgaben gelöst.</b></div></div>` +
        qs.map((q, i) => `<details class="rueckblick"><summary>${i + 1}. ${q.frage}</summary><div class="small">${q.erklaerung || ''}</div></details>`).join('') + B.weiterButton();
      $('#st-weiter', box).onclick = ctx.weiter;
      B.tasten(box, { enter: '#st-weiter' });
      if (qs.every(q => G.itemState(q.id).ok)) ctx.fertig();
    };

    const frage = (area, q) => {
      G.tasten = null;
      const it = G.itemState(q.id);
      area.innerHTML = `${q.ticket ? `<div class="ticket"><div class="tno">${esc(q.ticketNr || 'Störungsmeldung')}</div>${q.ticket}</div>` : ''}
        <div class="frage">${q.frage}</div><div id="opts"></div>`;
      const optsEl = $('#opts', area);

      const geloest = (el, sperren) => {
        const p = G.richtig(q.id, q.punkte || 10, el || optsEl);
        if (el) { el.classList.add('right'); Kit.fx.anstoss(el, 'pop'); }
        if (sperren) sperren();
        const hb = $('.hints', area); if (hb) hb.remove();
        const fb = B.feedback(area, true, q.erklaerung, p);
        B.knopf(fb, 'q-next', cur + 1 < qs.length ? 'Nächste Aufgabe' : 'Abschließen', () => { cur++; draw(); G.zeige($('#qarea', box)); });
        $$('.task-punkte i', box)[cur].className = 'ok';
      };
      const daneben = (wert, el, text) => {
        G.falsch(q.id, wert);
        if (el) { el.classList.add('wrong'); Kit.fx.anstoss(el, 'shake'); }
        G.zeige(B.feedback(area, false, text || (q.falsch && q.falsch[wert]) || 'Versucht es noch einmal – oder fragt Kalle nach einem Tipp.'));
      };
      // Einfachwahl und Schicht-Wahl: ein Klick entscheidet
      const waehlen = (wert, el) => {
        if (G.itemState(q.id).ok) return;
        if (korrekt(q, wert)) geloest(el, () => $$('.opt, .triage-btns button', area).forEach(b => { b.disabled = true; }));
        else { daneben(wert, el); if (el) el.disabled = true; }
      };

      if (q.eingabe) {
        // Freitext: Wert eintippen (IP, MAC, Name …) oder einen Wireshark-Filter schreiben
        const istFilter = q.eingabe === 'filter';
        optsEl.innerHTML = `<div class="eingabe-row"><input type="text" id="q-in" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(q.platzhalter || (istFilter ? 'Anzeigefilter eintippen' : 'Antwort eintippen'))}">
          <button class="btn" id="q-check">Prüfen</button></div>`;
        const inp = $('#q-in', optsEl);
        const pruefen = () => {
          if (G.itemState(q.id).ok) return;
          const roh = inp.value.trim();
          if (!roh) return;
          let ok, wert = roh, zusatz = '';
          if (istFilter) {
            const pk = st.wireshark.pakete;
            let ist;
            try { ist = G.wsTreffer(pk, roh); } catch (err) { G.zeige(B.feedback(area, false, `Diesen Filter versteht Wireshark nicht (${esc(err.message)}). Das zählt nicht als Fehlversuch – prüft die Schreibweise im Spickzettel der Lektion.`, 0, 'Ungültiger Filter')); return; }
            const soll = G.wsTreffer(pk, q.richtig);
            ok = ist.length === soll.length && ist.every((n, i) => n === soll[i]);
            if (!ok) zusatz = `Euer Filter zeigt ${ist.length} Frame${ist.length === 1 ? '' : 's'} – gesucht sind genau die ${soll.length} passenden.`;
          } else {
            wert = B.normAntwort(roh, q.eingabe);
            ok = [].concat(q.richtig).some(r => B.normAntwort(r, q.eingabe) === wert);
          }
          if (ok) {
            geloest(inp, () => { inp.disabled = true; $('#q-check', optsEl).disabled = true; });
            if (istFilter) { const W = G.wsState[st.id]; if (W) { W.filter = roh; G.wiresharkMount($('#ws-mount', box), st.wireshark, st.id); } }
          } else daneben(wert, inp, (q.falsch && q.falsch[B.normAntwort(roh, q.eingabe)]) || zusatz || 'Das stimmt noch nicht. Schaut genau hin – oder fragt Kalle nach einem Tipp.');
        };
        $('#q-check', optsEl).onclick = pruefen;
        inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); pruefen(); } };
      } else if (q.meldung) {
        // Frame in der Wireshark-Liste markieren und melden
        optsEl.innerHTML = `<p class="hinweiszeile">👆 Markiert den Frame oben in der Paketliste und meldet ihn dann.</p>
          <div class="btnrow"><button class="btn" id="q-melden">🚩 Markierten Frame melden</button></div>`;
        $('#q-melden', optsEl).onclick = () => {
          if (G.itemState(q.id).ok) return;
          const W = G.wsState[st.id];
          if (!W || W.sel == null) { G.zeige(B.feedback(area, 'neutral', 'Markiert zuerst einen Frame in der Paketliste (einfach anklicken).', 0, 'Noch kein Frame markiert')); return; }
          if ([].concat(q.richtig).map(Number).includes(W.sel)) geloest($('#q-melden', optsEl), () => { $('#q-melden', optsEl).disabled = true; });
          else daneben(W.sel, null, (q.falsch && q.falsch[W.sel]) || `Frame ${W.sel} ist es nicht. Schaut euch Quelle, Ziel und Info noch einmal genau an.`);
        };
      } else if (q.layer) {
        optsEl.innerHTML = B.schichtKnoepfe();
        $$('.triage-btns button', optsEl).forEach(b => b.onclick = () => waehlen(b.dataset.v, b));
      } else if (q.pick) {
        optsEl.innerHTML = '<p class="hinweiszeile">👆 Klickt die richtige Stelle oben an.</p>';
        const root = $('#kontext', box) || box;
        $$('[data-pick]', root).forEach(el => el.onclick = () => {
          $$('[data-pick]', root).forEach(x => x.classList.remove('sel'));
          el.classList.add('sel');
          waehlen(el.dataset.pick, null);
        });
      } else if (q.multi) {
        const order = q.fest ? q.optionen.map((o, i) => i) : shuffle(q.optionen.map((o, i) => i));
        optsEl.innerHTML = `<p class="hinweiszeile">Mehrere Antworten möglich.</p><div class="opts">${order.map((i, n) => B.optKachel(q, i, n + 1)).join('')}</div>
          <div class="btnrow"><button class="btn" id="q-check" disabled>Prüfen</button></div>`;
        const sel = B.mehrfach(optsEl, s => { $('#q-check', optsEl).disabled = !s.size; });
        $('#q-check', optsEl).onclick = () => {
          if (G.itemState(q.id).ok) return;
          const soll = new Set(q.richtig);
          if (B.mengeGleich(sel, soll)) {
            geloest(null, () => { $$('.opt', optsEl).forEach(b => { b.disabled = true; if (soll.has(+b.dataset.i)) b.classList.add('right'); }); $('#q-check', optsEl).disabled = true; });
          } else {
            const zuViel = [...sel].filter(i => !soll.has(i)).length, zuWenig = [...soll].filter(i => !sel.has(i)).length;
            daneben([...sel].sort().join('+'), null, `${zuViel ? `${zuViel} Auswahl${zuViel > 1 ? 'en sind' : ' ist'} falsch. ` : ''}${zuWenig ? 'Es fehlt noch mindestens eine richtige Antwort.' : ''}`);
          }
        };
        B.tasten(optsEl, { enter: '#q-check' });
      } else {
        const order = q.fest ? q.optionen.map((o, i) => i) : shuffle(q.optionen.map((o, i) => i));
        // Karten (Anklage): schon verwendete Beweiskarten anderer Felder sind gesperrt
        const belegt = q.karten ? qs.filter(x => x !== q && x.karten && G.itemState(x.id).ok).map(x => String(x.richtig)) : [];
        optsEl.innerHTML = `<div class="opts ${q.karten || q.bilder ? 'karten' : ''}">${order.map((i, n) => B.optKachel(q, i, q.karten || q.bilder ? null : n + 1, belegt.includes(String(i)) ? '<small>liegt schon in der Anklage</small>' : '')).join('')}</div>`;
        $$('.opt', optsEl).forEach(b => {
          if (it.w.includes(b.dataset.i)) { b.disabled = true; b.classList.add('wrong'); }
          if (belegt.includes(b.dataset.i)) { b.disabled = true; b.classList.add('belegt'); }
          b.onclick = () => waehlen(b.dataset.i, b);
        });
      }
      if (!q.eingabe && !q.multi) B.tasten(area, { enter: '#q-next' });
      B.hinweisBlock(q, area);
    };
    draw();
  };

  // Anklageschrift (Finale): technisch ein Quiz – Person wählen, dann je Feld eine Beweiskarte (q.karten) und ggf. die Schicht.
  // Die Anklageschrift selbst liefert der Inhalt als kontext-Funktion; sie füllt sich mit jedem gelösten Feld.
  R.anklage = (box, st, e, ctx) => R.quiz(box, st, e, ctx);
})();
