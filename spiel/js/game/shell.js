/* OSI-Agenten – Rahmen: Kopfleiste und Dialoge (Sichern/Laden, Handbuch, Inhalt, Figur, Lehrkraft). */
(function () {
  'use strict';
  const G = window.OSIGame, OSI = window.OSI, S = window.OSIStore, A = window.OSIAudio, Kit = window.OSIKit;
  const P = Kit.progress, AV = Kit.avatars;
  const { esc, $, $$, layerColor } = Kit.util;

  // ---------------------------------------------------------------- Kopfleiste
  function renderTopbar() {
    const tb = $('#topbar');
    const logo = `<button class="tb-logo" id="tb-home" title="Zur Karte"><span class="tb-logo-mark">E7</span><span class="tb-logo-text">OSI-Agenten</span></button>`;
    if (!G.save) { tb.innerHTML = `${logo}<span class="spacer"></span>${themeBtn()}${tonBtn()}`; binden(); return; }
    const p = G.punkte(), rg = P.rang(p), heute = P.heute(G.save), n = G.save.aenderungenSeitExport || 0;
    let st;
    if (G.lokalOk === false) st = `<span class="savestate warn" title="Der Browser erlaubt kein automatisches Speichern – nur der Export sichert!">⚠<span class="tb-label"> Nur Export sichert!</span></span>`;
    else if (n >= 10) st = `<span class="savestate warn" title="Bitte bald über „Sichern / Laden“ exportieren">●<span class="tb-label"> ${n} seit Export</span></span>`;
    else st = `<span class="savestate" title="Automatisch im Browser gespeichert – die echte Sicherung ist trotzdem der Export">✓<span class="tb-label"> gespeichert</span></span>`;
    tb.innerHTML = `${logo}
      <button class="tb-figur" id="tb-figur" title="Duo ${esc(G.save.duo.codename)} · Figur ändern">${AV.svg(G.save.duo.avatar, { titel: false })}<span class="tb-duo"><b>${esc(G.save.duo.codename)}</b><small>${G.save.duo.agenten.map(esc).join(' & ')}</small></span></button>
      <span class="spacer"></span>
      <span class="tb-stat flamme ${heute ? 'an' : ''}" title="Heute erledigte Schritte">🔥<b>${heute}</b></span>
      <span class="tb-stat xp" id="tb-xp" title="Punkte (XP)">⚡<b>${p}</b></span>
      <span class="tb-rang" title="${rg.next ? `Nächste Freigabe: ${esc(rg.next.name)} ab ${rg.next.ab} Punkten` : 'Höchste Freigabe erreicht'}" style="--anteil:${Math.round(rg.anteil * 100)}">
        <span class="tb-rang-ring"><b>${rg.stufe}</b></span><span class="rang tb-label">${esc(rg.r.name.replace(/^Stufe \d+ · /, ''))}</span></span>
      ${st}
      <span class="tb-tools">
        <button class="tb-btn" id="tb-inhalt" title="Inhaltsverzeichnis">📑<span class="tb-label"> Inhalt</span></button>
        <button class="tb-btn" id="tb-handbuch" title="Agenten-Handbuch">📘<span class="tb-label"> Handbuch</span></button>
        <button class="tb-btn tb-save" id="tb-save" title="Spielstand sichern oder laden">💾<span class="tb-label-save"> Sichern / Laden</span></button>
        ${themeBtn()}${tonBtn()}
        ${G.teacher ? '<button class="tb-btn tb-teacher" id="tb-teacher" title="Lehrkraft-Modus">🔑</button>' : ''}
      </span>`;
    binden();
  }
  const tonBtn = () => `<button class="tb-btn" id="tb-ton" title="Soundeffekte ${A.an ? 'aus' : 'an'}schalten">${A.an ? '🔊' : '🔇'}</button>`;
  const themeBtn = () => `<button class="tb-btn" id="tb-theme" title="Hell/Dunkel umschalten">${Kit.theme.aktuell() === 'dark' ? '☀️' : '🌙'}</button>`;
  function binden() {
    const on = (id, fn) => { const b = $(id); if (b) b.onclick = fn; };
    on('#tb-home', () => { if (G.save) G.zurKarte(); });
    on('#tb-ton', () => { A.set(!A.an); A.play('klick'); renderTopbar(); });
    on('#tb-theme', () => { Kit.theme.umschalten(); renderTopbar(); });
    on('#tb-figur', figurDialog);
    on('#tb-save', speicherDialog);
    on('#tb-handbuch', handbuch);
    on('#tb-inhalt', inhaltsverzeichnis);
    on('#tb-teacher', lehrkraftDialog);
  }

  // ---------------------------------------------------------------- Dialoge
  function speicherDialog() {
    const s = G.save;
    const letzter = s.exportiert ? new Date(s.exportiert).toLocaleString('de-DE') : 'noch nie';
    G.modal(`
      <h2>💾 Spielstand sichern & übergeben</h2>
      <p>Das Spiel speichert automatisch im Browser. <b>Die eigentliche Sicherung ist aber die Export-Datei</b> – nur die könnt ihr an die andere Person eures Duos weitergeben und bei der Lehrkraft abgeben.</p>
      <p class="small muted">Letzter Export: ${esc(letzter)}</p>
      <div class="btnrow">
        <button class="btn" id="m-exp">⬇ Spielstand exportieren</button>
        <button class="btn sec" id="m-imp">⬆ Spielstand-Datei laden</button>
        <input type="file" id="m-file" accept=".osiagent" class="hidden">
      </div>
      <div class="merk"><b>Übergabe innerhalb des Duos:</b> Exportieren → Datei (z. B. über Teams) schicken → die andere Person klickt „Spielstand-Datei laden“.</div>
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button>
      <span class="spacer"></span><button class="btn ghost klein" id="m-new">Neues Duo anlegen …</button></div>`, (m, zu) => {
      $('#m-exp', m).onclick = G.exportieren;
      $('#m-imp', m).onclick = () => $('#m-file', m).click();
      $('#m-file', m).onchange = ev => { const f = ev.target.files[0]; if (f) G.importieren(f, zu); };
      $('#m-new', m).onclick = () => {
        if (confirm('Wirklich ein neues Duo anlegen? Der aktuelle Spielstand wird im Browser überschrieben. Exportiert ihn vorher, wenn ihr ihn behalten wollt!')) {
          zu(); G.save = null; G.renderStart(true);
        }
      };
    });
  }

  // Figur ändern – zählt nicht als Änderung für den Export-Hinweis
  function figurDialog() {
    let wahl = G.save.duo.avatar;
    G.modal(`<h2>Eure Figur</h2><p class="small muted">So erscheint euer Duo auf der Karte – und bei der Lehrkraft in der Einsatzzentrale.</p>
      <div id="fig-wahl"></div>
      <div class="btnrow"><button class="btn" id="fig-ok">Übernehmen</button><button class="btn sec" data-close>Abbrechen</button></div>`, (m, zu) => {
      AV.picker($('#fig-wahl', m), wahl, id => { wahl = id; A.play('plopp'); });
      $('#fig-ok', m).onclick = () => {
        G.save.duo.avatar = wahl;
        G.lokalOk = S.saveLocal(G.save);
        zu(); A.play('abzeichen');
        G.toast(`<b>${esc(AV.name(wahl))}</b> ist jetzt eure Figur.`, 2600, 'ok');
        G.render();
      };
    }, 'breit');
  }

  function handbuch() {
    const rows = OSI.handbuch.map(l => `<tr><td><span class="lchip" style="background:${layerColor(l.n)}">L${l.n}</span></td><td><b>${esc(l.name)}</b><br><span class="small muted">${esc(l.en)}</span></td><td>${l.aufgabe}</td><td>${l.beispiele}</td><td>${esc(l.pdu)}</td></tr>`).join('');
    G.modal(`<h2>📘 Agenten-Handbuch</h2>
      <p class="small muted">Merksatz von L1 nach oben: <b class="hl">B</b>ei <b class="hl">S</b>turm <b class="hl">v</b>erlieren <b class="hl">T</b>anker <b class="hl">s</b>chnell <b class="hl">d</b>ie <b class="hl">A</b>nker</p>
      <div class="tabelle-scroll"><table class="t small"><tr><th>Nr.</th><th>Schicht</th><th>Aufgabe</th><th>Beispiele</th><th>PDU</th></tr>${rows}</table></div>
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`, null, 'breit');
  }

  function inhaltsverzeichnis() {
    const aktE = G.save.pos ? G.save.pos.e : null;
    const teile = OSI.einsaetze.map(e => {
      if (!P.freigegeben(e, G.teacher)) return `<div class="toc-e toc-off"><span class="toc-kap" style="--k:${Kit.map.farbe(e)}">${e.icon || ''}</span> ${esc(e.nrText)} · ${esc(e.titel)} <span class="small muted">– in Bearbeitung</span></div>`;
      const offen = G.einsatzOffen(e);
      const zeilen = e.steps.map((st, i) => {
        const erreichbar = offen && G.stepOffen(e, i);
        const cur = G.save.pos && G.save.pos.s === st.id;
        const u = G.save.uebung[st.id];
        return `<li><button class="toc-step ${cur ? 'cur' : ''}" data-e="${e.id}" data-s="${st.id}" ${erreichbar ? '' : 'disabled'}>
          <span class="toc-nr">${st.bonus ? '★' : i + 1}</span><span class="toc-ic">${Kit.map.TYP_ICON[st.type] || '•'}</span>
          <span class="toc-t">${esc(st.titel || st.id)}</span>${u && u.gemeistert ? '<span title="beim Üben gemeistert">⭐</span>' : ''}${G.stepDone(st) ? '<span class="toc-ok">✓</span>' : erreichbar ? '' : '<span class="toc-lock">🔒</span>'}</button></li>`;
      }).join('');
      return `<details class="toc-e" ${e.id === aktE || (!aktE && offen && !G.einsatzFertig(e)) ? 'open' : ''}>
        <summary><span class="toc-kap" style="--k:${Kit.map.farbe(e)}">${e.icon || ''}</span> ${esc(e.nrText)} · ${esc(e.titel)} <span class="toc-pct">${Math.round(P.einsatzFortschritt(G.save, e) * 100)} %</span></summary>
        <ol class="toc-list">${zeilen}</ol></details>`;
    }).join('');
    G.modal(`<h2>📑 Inhaltsverzeichnis</h2>
      <p class="small muted">📖 Lektion · ❓ Aufgaben · 🗂️ Sortieren · 🧩 Puzzle · 🎬 Handlung · ★ Bonus · ⭐ beim Üben gemeistert. Alles, was ihr schon erreicht habt, könnt ihr jederzeit wieder aufrufen – z. B. um in einer Lektion etwas nachzulesen.</p>
      ${teile}
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`, (m, zu) => {
      $$('.toc-step', m).forEach(b => b.onclick = () => { zu(); G.gotoStep(b.dataset.e, b.dataset.s); });
    }, 'breit');
  }

  // ---------------------------------------------------------------- Lehrkraft-Modus
  function lehrkraftLogin() {
    G.modal(`<h2>🔑 Lehrkraft-Modus</h2><p>Nur für die Lehrkraft.</p>
      <label for="lk-pw">Passwort</label><input type="password" id="lk-pw" autocomplete="off">
      <div class="btnrow"><button class="btn" id="lk-ok">Anmelden</button><button class="btn sec" data-close>Abbrechen</button></div>`, (m, zu) => {
      const pw = $('#lk-pw', m);
      const go = () => {
        if (S.hash('lk|' + pw.value) === OSI.lehrkraftHash) {
          G.teacher = true; zu(); G.toast('🔑 <b>Lehrkraft-Modus aktiv.</b> Alle Akten sind offen.', 3200, 'ok'); G.render();
        } else Kit.fx.anstoss(pw, 'shake');
      };
      $('#lk-ok', m).onclick = go;
      pw.onkeydown = e => { if (e.key === 'Enter') go(); };
      pw.focus();
    });
  }
  function lehrkraftDialog() {
    const liste = OSI.einsaetze.filter(e => e.steps.length).map(e => `<h3>${esc(e.nrText)} – ${esc(e.titel)}</h3><div class="lk-steps">${e.steps.map(st => `<button class="lk-step" data-e="${e.id}" data-s="${st.id}">${G.stepDone(st) ? '✅' : '⬜'} <span class="mono small">${esc(st.id)}</span> ${esc(st.titel || st.type)}</button>`).join('')}</div>`).join('');
    G.modal(`<h2>🔑 Lehrkraft-Modus</h2>
      <p class="small">Springt zu jedem Schritt, ohne ihn als erledigt zu markieren. Alle Akten und Außeneinsätze sind geöffnet, solange der Modus aktiv ist.</p>
      <div class="btnrow"><button class="btn sec" id="lk-off">Modus beenden</button>
      <button class="btn sec" id="lk-unlock">Außeneinsätze in diesem Spielstand freischalten</button>
      <button class="btn sec" id="lk-verhoer">Abschlussverhör in diesem Spielstand freischalten</button></div>
      ${liste}
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`, (m, zu) => {
      $$('[data-s]', m).forEach(b => b.onclick = () => { zu(); G.gotoStep(b.dataset.e, b.dataset.s); });
      $('#lk-off', m).onclick = () => { G.teacher = false; zu(); G.render(); };
      $('#lk-unlock', m).onclick = () => { G.save.unlocked.alle = new Date().toISOString(); G.persist(); G.toast('Außeneinsätze freigeschaltet.'); };
      $('#lk-verhoer', m).onclick = () => { G.save.unlocked.verhoer = new Date().toISOString(); G.persist(); G.toast('Abschlussverhör freigeschaltet – auch nach Verlassen des Lehrkraft-Modus.'); };
    }, 'breit');
  }
  const lehrkraft = () => (G.teacher ? lehrkraftDialog : lehrkraftLogin)();

  Object.assign(G, { renderTopbar, speicherDialog, figurDialog, handbuch, inhaltsverzeichnis, lehrkraftLogin, lehrkraftDialog, lehrkraft });
})();
