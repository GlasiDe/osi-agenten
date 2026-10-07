/* OSI-Agenten – Spiel-Engine: Zustand, Punkte, Ränge, Navigation, Rendering. */
(function () {
  'use strict';
  const OSI = window.OSI;
  const S = window.OSIStore;
  const A = window.OSIAudio;
  const $ = (sel, root = document) => root.querySelector(sel);
  const app = () => $('#app');

  const G = { save: null, teacher: false, view: null };
  window.OSIGame = G;

  // ---------------------------------------------------------------- Helfer
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const now = () => new Date().toISOString();
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const figur = id => OSI.figuren[id] || OSI.figuren.system;
  const layerColor = n => `var(--L${n})`;
  G.util = { esc, shuffle, layerColor };

  function toast(html, ms = 3200) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), ms);
  }
  G.toast = toast;

  function modal(html, onOpen) {
    const m = document.createElement('div');
    m.id = 'modal';
    m.innerHTML = `<div class="box"><button class="modal-x" data-close title="Schließen" aria-label="Schließen">×</button>${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.remove(); });
    document.body.appendChild(m);
    if (onOpen) onOpen(m);
    return m;
  }
  G.modal = modal;

  // Element sanft in den sichtbaren Bereich holen (nur wenn nötig)
  function zeige(el) {
    if (!el) return;
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const oben = 70, unten = window.innerHeight - 16;
      if (r.bottom > unten || r.top < oben) el.scrollIntoView({ behavior: 'smooth', block: r.height > unten - oben ? 'start' : 'nearest' });
    });
  }
  G.zeige = zeige;

  // ---------------------------------------------------------------- Spielstand
  function neuerSpielstand(codename, k1, k2) {
    return S.migrate({
      schema: 1, id: uid(), version: OSI.version, erstellt: now(), aktualisiert: now(),
      duo: { codename, agenten: [k1, k2].filter(Boolean) },
      pos: null, items: {}, steps: {}, badges: {}, bonus: {}, exportiert: null, aenderungenSeitExport: 0
    });
  }

  function persist() {
    const s = G.save; if (!s) return;
    s.aktualisiert = now();
    s.version = OSI.version;
    const ok = S.saveLocal(s);
    G.lokalOk = ok;
    renderTopbar();
  }
  G.persist = persist;

  function exportieren() {
    S.download(G.save);
    G.save.exportiert = now();
    G.save.aenderungenSeitExport = 0;
    S.saveLocal(G.save);
    renderTopbar();
    toast('<b>Spielstand exportiert.</b><br>Die Datei liegt in eurem Download-Ordner.');
  }
  G.exportieren = exportieren;

  // ---------------------------------------------------------------- Punkte & Ränge
  const ATT = [1, 0.5, 0.3, 0.2];
  function itemPunkte(base, falsch, hinweise) {
    const m = Math.max(0.1, (ATT[Math.min(falsch, ATT.length - 1)]) - hinweise * 0.2);
    return Math.max(1, Math.round(base * m));
  }
  function itemState(id) {
    if (G.uebung) return G.uebung.items[id] || (G.uebung.items[id] = { f: 0, h: 0, p: 0, ok: false, w: [] });
    return G.save.items[id] || (G.save.items[id] = { f: 0, h: 0, p: 0, ok: false, w: [] });
  }
  G.itemState = itemState;
  function itemDone(id) { const it = G.save.items[id]; return !!(it && it.ok); }

  function punkte() {
    let p = 0;
    Object.values(G.save.items).forEach(it => { p += it.p || 0; });
    Object.values(G.save.bonus || {}).forEach(v => { p += v || 0; });
    return p;
  }
  G.punkte = punkte;

  function rang(p = punkte()) {
    let r = OSI.raenge[0], next = null;
    for (let i = 0; i < OSI.raenge.length; i++) {
      if (p >= OSI.raenge[i].ab) { r = OSI.raenge[i]; next = OSI.raenge[i + 1] || null; }
    }
    return { r, next };
  }
  G.rang = rang;

  function mitRangCheck(fn) {
    const vor = rang().r.name;
    fn();
    const nach = rang().r.name;
    if (vor !== nach) {
      A.play('rang');
      toast(`🎖️ <b>Beförderung!</b><br>Neue Freigabe: <b>${esc(nach)}</b>.`, 5000);
    }
  }

  // Richtige Antwort: Punkte vergeben, speichern. Liefert vergebene Punkte.
  function richtig(id, base = 10) {
    const it = itemState(id);
    if (it.ok) return 0;
    if (G.uebung) { it.ok = true; A.play('richtig'); return 0; }
    let gained = 0;
    mitRangCheck(() => {
      it.ok = true;
      it.p = itemPunkte(base, it.f, it.h);
      it.t = now();
      gained = it.p;
      G.save.aenderungenSeitExport = (G.save.aenderungenSeitExport || 0) + 1;
      persist();
    });
    A.play('richtig');
    return gained;
  }
  function falsch(id, wert) {
    const it = itemState(id);
    if (it.ok) return;
    it.f++;
    if (wert != null && it.w.length < 12) it.w.push(String(wert));
    if (!G.uebung) persist();
    A.play('falsch');
  }
  function hinweisNutzen(id) {
    const it = itemState(id);
    it.h++;
    if (!G.uebung) persist();
    A.play('tipp');
    return it.h;
  }
  G.richtig = richtig; G.falsch = falsch; G.hinweisNutzen = hinweisNutzen;

  function bonusPunkte(key, p) {
    if (G.save.bonus[key] != null) return;
    mitRangCheck(() => { G.save.bonus[key] = p; persist(); });
  }
  G.bonusPunkte = bonusPunkte;

  function abzeichen(id) {
    if (G.save.badges[id]) return;
    const b = OSI.abzeichen.find(x => x.id === id);
    if (!b) return;
    G.save.badges[id] = now();
    persist();
    A.play('abzeichen');
    toast(`${b.icon} <b>Abzeichen: ${esc(b.name)}</b><br>${esc(b.text)}`, 5000);
  }
  G.abzeichen = abzeichen;

  // ---------------------------------------------------------------- Übungsmodus („Nochmal üben“)
  // Der erste Durchgang bleibt maßgeblich. Übungen geben keine Punkte und ziehen keine ab.
  const UEBBAR = ['quiz', 'sort', 'kapsel', 'anklage'];
  function uebungStarten(e, st) {
    G.uebung = { stepId: st.id, items: {}, fertig: false };
    A.play('klick');
    renderStepView(e, st);
    window.scrollTo(0, 0);
  }
  function uebungFertig(st) {
    const u = G.uebung;
    if (!u || u.stepId !== st.id || u.fertig) return;
    u.fertig = true;
    const recs = Object.values(u.items);
    const f = recs.reduce((a, r) => a + r.f, 0), h = recs.reduce((a, r) => a + r.h, 0);
    const rec = G.save.uebung[st.id] || (G.save.uebung[st.id] = { runs: 0, gemeistert: null });
    rec.runs++;
    rec.letzte = { f, h, t: now() };
    let neu = false;
    if (!f && !h && !rec.gemeistert) { rec.gemeistert = now(); neu = true; }
    persist();
    const ub = document.querySelector('#uebbar');
    if (ub) {
      ub.innerHTML = `<div class="uebbar on">🔁 <b>Übung beendet</b> – ${f} Fehlversuch${f === 1 ? '' : 'e'}, ${h} Tipp${h === 1 ? '' : 's'}${rec.gemeistert ? ' · ⭐ gemeistert' : ''}<span style="flex:1"></span><button class="btn sec" id="ub-again">🔁 Nochmal</button><button class="btn sec" id="ub-stop2">Übung beenden</button></div>`;
      const e = OSI.einsaetze.find(x => x.steps.includes(st));
      document.querySelector('#ub-again').onclick = () => uebungStarten(e, st);
      document.querySelector('#ub-stop2').onclick = () => { G.uebung = null; renderStepView(e, st); };
    }
    if (neu) {
      A.play('abzeichen');
      toast('⭐ <b>Gemeistert!</b><br>Fehlerfrei und ohne Tipp geübt.', 4500);
      const anzahl = Object.values(G.save.uebung).filter(x => x.gemeistert).length;
      if (anzahl >= 5) abzeichen('training-5');
    } else {
      toast(`🔁 <b>Übung beendet.</b><br>${f} Fehlversuch${f === 1 ? '' : 'e'}, ${h} Tipp${h === 1 ? '' : 's'}.${rec.gemeistert ? '' : ' Fehlerfrei und ohne Tipp gibt es ⭐.'}`, 4500);
    }
  }
  G.uebungFertig = uebungFertig;

  // ---------------------------------------------------------------- Struktur
  const einsatz = id => OSI.einsaetze.find(e => e.id === id);
  function stepDone(st) { return !!G.save.steps[st.id]; }
  function einsatzFertig(e) { return e.steps.length > 0 && e.steps.filter(s => !s.bonus).every(stepDone); }
  function einsatzOffen(e) {
    if (G.teacher) return e.status !== 'bearbeitung' || e.steps.length > 0;
    if (e.status === 'bearbeitung') return false;
    if (G.save.unlocked[e.id]) return true; // z. B. Verhör vorzeitig durch die Lehrkraft freigegeben
    const i = OSI.einsaetze.indexOf(e);
    return i === 0 || einsatzFertig(OSI.einsaetze[i - 1]);
  }
  function stepOffen(e, idx) {
    if (G.teacher) return true;
    for (let i = 0; i < idx; i++) if (!e.steps[i].bonus && !stepDone(e.steps[i])) return false;
    return true;
  }
  function einsatzFortschritt(e) {
    const req = e.steps.filter(s => !s.bonus);
    if (!req.length) return 0;
    return req.filter(stepDone).length / req.length;
  }
  G.einsatzFertig = einsatzFertig;

  function stepAbschliessen(st) {
    if (G.save.steps[st.id]) return;
    G.save.steps[st.id] = now();
    if (st.setzt) Object.assign(G.save.board, st.setzt);
    persist();
  }
  G.stepAbschliessen = stepAbschliessen;

  function gotoStep(eid, sid) {
    G.save.pos = { e: eid, s: sid };
    S.saveLocal(G.save);
    render();
    window.scrollTo(0, 0);
  }
  G.gotoStep = gotoStep;

  function naechsterStep(e, st) {
    const i = e.steps.indexOf(st);
    const n = e.steps[i + 1];
    if (n) gotoStep(e.id, n.id);
    else { G.save.pos = null; S.saveLocal(G.save); render(); }
  }
  G.naechsterStep = naechsterStep;

  // Aktuelle Position robust bestimmen (auch nach Updates mit geänderten Schritten)
  function aktuellePosition() {
    const p = G.save.pos;
    if (p) {
      const e = einsatz(p.e);
      if (e && einsatzOffen(e)) {
        const i = e.steps.findIndex(s => s.id === p.s);
        if (i >= 0 && stepOffen(e, i)) return { e, st: e.steps[i] };
      }
    }
    return null;
  }

  function ersterOffenerStep(e) {
    return e.steps.find(s => !s.bonus && !stepDone(s)) || e.steps[0];
  }

  // ---------------------------------------------------------------- Topbar
  function renderTopbar() {
    const tb = $('#topbar');
    if (!G.save) { tb.innerHTML = `<div class="logo">EINHEIT&nbsp;7 <span>· OSI-Agenten</span></div><div class="spacer"></div>${tonBtn()}`; bindTon(); return; }
    const p = punkte();
    const { r, next } = rang(p);
    const pct = next ? Math.round((p - r.ab) / (next.ab - r.ab) * 100) : 100;
    const n = G.save.aenderungenSeitExport || 0;
    let st = '';
    if (G.lokalOk === false) st = `<span class="savestate warn" title="Der Browser erlaubt kein automatisches Speichern.">⚠ Nur Export sichert!</span>`;
    else if (n >= 10) st = `<span class="savestate warn" title="Bitte bald über 'Sichern / Laden' exportieren">● ${n} Aufgaben seit letztem Export</span>`;
    else st = `<span class="savestate" title="Automatisch im Browser gespeichert – die echte Sicherung ist trotzdem der Export">✓ gespeichert</span>`;
    tb.innerHTML = `
      <div class="logo" style="cursor:pointer" id="tb-home">EINHEIT&nbsp;7 <span>· OSI-Agenten</span></div>
      <div class="duo">Duo <b>${esc(G.save.duo.codename)}</b> · ${G.save.duo.agenten.map(esc).join(' & ')}</div>
      <div class="spacer"></div>
      <div class="rangbox" title="${next ? `Nächste Freigabe: ${esc(next.name)} ab ${next.ab} Punkten` : 'Höchste Freigabe erreicht'}">
        <span class="rang">${esc(r.name)}</span><span class="pts">${p} P</span>
        <div class="rangbar"><i style="width:${pct}%"></i></div>
      </div>
      ${st}
      <button class="tb-btn" id="tb-inhalt">📑 Inhalt</button>
      <button class="tb-btn" id="tb-handbuch">📘 Handbuch</button>
      <button class="tb-btn" id="tb-save">💾 Sichern / Laden</button>
      ${tonBtn()}
      ${G.teacher ? '<button class="tb-btn" id="tb-teacher" style="border-color:var(--orange)">🔑 Lehrkraft</button>' : ''}`;
    $('#tb-home').onclick = () => { G.save.pos = null; S.saveLocal(G.save); render(); };
    $('#tb-save').onclick = speicherDialog;
    $('#tb-handbuch').onclick = handbuch;
    $('#tb-inhalt').onclick = inhaltsverzeichnis;
    if (G.teacher) $('#tb-teacher').onclick = lehrkraftDialog;
    bindTon();
  }
  function tonBtn() { return `<button class="tb-btn" id="tb-ton" title="Soundeffekte">${A.an ? '🔊' : '🔇'}</button>`; }
  function bindTon() { const b = $('#tb-ton'); if (b) b.onclick = () => { A.set(!A.an); A.play('klick'); renderTopbar(); }; }

  // ---------------------------------------------------------------- Dialoge
  function speicherDialog() {
    const s = G.save;
    const letzter = s.exportiert ? new Date(s.exportiert).toLocaleString('de-DE') : 'noch nie';
    modal(`
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
      <span style="flex:1"></span><button class="btn sec" id="m-new" style="font-size:.85rem">Neues Duo anlegen …</button></div>`, m => {
      $('#m-exp', m).onclick = exportieren;
      $('#m-imp', m).onclick = () => $('#m-file', m).click();
      $('#m-file', m).onchange = ev => { const f = ev.target.files[0]; if (f) importieren(f, () => m.remove()); };
      $('#m-new', m).onclick = () => {
        if (confirm('Wirklich ein neues Duo anlegen? Der aktuelle Spielstand wird im Browser überschrieben. Exportiert ihn vorher, wenn ihr ihn behalten wollt!')) {
          m.remove(); G.save = null; renderStart(true);
        }
      };
    });
  }

  function itemsGeloest(s) { return Object.values(s.items || {}).filter(i => i.ok).length; }

  async function importieren(file, danach) {
    const r = await S.readFile(file);
    if (!r.ok) { alert(r.fehler); return; }
    const neu = r.save;
    if (G.save && G.save.id === neu.id) {
      const alt = itemsGeloest(G.save), nn = itemsGeloest(neu);
      if (nn < alt && !confirm(`Achtung: Die Datei enthält WENIGER Fortschritt (${nn} gelöste Aufgaben) als der aktuelle Stand (${alt}). Trotzdem laden?`)) return;
    } else if (G.save && !confirm(`Spielstand von Duo „${neu.duo.codename}“ laden? Der aktuelle Stand von „${G.save.duo.codename}“ wird im Browser ersetzt.`)) return;
    G.save = neu;
    G.lokalOk = S.saveLocal(G.save);
    if (danach) danach();
    toast(`<b>Spielstand geladen.</b><br>Willkommen zurück, Duo ${esc(neu.duo.codename)}!`);
    render();
  }
  G.importieren = importieren;

  function handbuch() {
    const rows = OSI.handbuch.map(l => `<tr><td><span class="lchip" style="background:${layerColor(l.n)}">L${l.n}</span></td><td><b>${esc(l.name)}</b><br><span class="small muted">${esc(l.en)}</span></td><td>${l.aufgabe}</td><td>${l.beispiele}</td><td>${esc(l.pdu)}</td></tr>`).join('');
    modal(`<h2>📘 Agenten-Handbuch</h2>
      <p class="small muted">Merksatz von L1 nach oben: <b class="hl">B</b>ei <b class="hl">S</b>turm <b class="hl">v</b>erlieren <b class="hl">T</b>anker <b class="hl">s</b>chnell <b class="hl">d</b>ie <b class="hl">A</b>nker</p>
      <table class="t small"><tr><th>Nr.</th><th>Schicht</th><th>Aufgabe</th><th>Beispiele</th><th>PDU</th></tr>${rows}</table>
      <h2 style="margin-top:22px">Befehlsreferenz</h2>
      ${(OSI.befehle || []).map(u => `<h3>${esc(u.umgebung)}</h3>${u.bereiche.map(b => `${b.titel ? `<p class="small muted" style="margin:8px 0 4px"><code>${esc(b.prompt)}</code> ${esc(b.titel)}</p>` : ''}
        <table class="t small">${b.befehle.map(([c, d]) => `<tr><td style="width:40%"><code>${esc(c)}</code></td><td>${esc(d)}</td></tr>`).join('')}</table>`).join('')}`).join('')}
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`);
  }

  // ---------------------------------------------------------------- Inhaltsverzeichnis
  const TYP_ICON = { story: '🎬', lesson: '📖', quiz: '❓', sort: '🗂️', kapsel: '🧩', sealed: '🔒', ende: '🏁', anklage: '⚖️', verhoer: '🕵️', urkunde: '🏅' };
  function inhaltsverzeichnis() {
    const aktE = G.save.pos ? G.save.pos.e : null;
    const teile = OSI.einsaetze.map(e => {
      if (!e.steps.length || e.status === 'bearbeitung' && !G.teacher) {
        return `<div class="toc-e toc-off"><span class="mono hl small">${esc(e.nrText)}</span> ${esc(e.titel)} <span class="small muted">– in Bearbeitung</span></div>`;
      }
      const offen = einsatzOffen(e);
      const zeilen = e.steps.map((st, i) => {
        const erreichbar = offen && stepOffen(e, i);
        const cur = G.save.pos && G.save.pos.s === st.id;
        return `<li><button class="toc-step ${cur ? 'cur' : ''}" data-e="${e.id}" data-s="${st.id}" ${erreichbar ? '' : 'disabled'}>
          <span class="toc-nr">${st.bonus ? '★' : i + 1}</span><span class="toc-ic">${TYP_ICON[st.type] || '•'}</span>
          <span class="toc-t">${esc(st.titel || st.id)}</span>${G.save.uebung[st.id] && G.save.uebung[st.id].gemeistert ? '<span title="beim Üben gemeistert">⭐</span>' : ''}${stepDone(st) ? '<span class="toc-ok">✓</span>' : erreichbar ? '' : '<span class="toc-lock">🔒</span>'}</button></li>`;
      }).join('');
      return `<details class="toc-e" ${e.id === aktE || (!aktE && offen && !einsatzFertig(e)) ? 'open' : ''}>
        <summary><span class="mono hl small">${esc(e.nrText)}</span> ${esc(e.titel)} <span class="small muted">· ${Math.round(einsatzFortschritt(e) * 100)} %</span></summary>
        <ol class="toc-list">${zeilen}</ol></details>`;
    }).join('');
    modal(`<h2>📑 Inhaltsverzeichnis</h2>
      <p class="small muted">📖 Lektion · ❓ Aufgaben · 🗂️ Sortieren · 🧩 Puzzle · 🎬 Handlung · ★ Bonus · ⭐ beim Üben gemeistert. Alles, was ihr schon erreicht habt, könnt ihr jederzeit wieder aufrufen – z. B. um in einer Lektion etwas nachzulesen.</p>
      ${teile}
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`, m => {
      m.querySelectorAll('.toc-step').forEach(b => b.onclick = () => { m.remove(); gotoStep(b.dataset.e, b.dataset.s); });
    });
  }
  G.inhaltsverzeichnis = inhaltsverzeichnis;

  // ---------------------------------------------------------------- Lehrkraft-Modus
  function lehrkraftLogin() {
    modal(`<h2>🔑 Lehrkraft-Modus</h2><p>Nur für die Lehrkraft.</p>
      <label>Passwort</label><input type="password" id="lk-pw" autocomplete="off">
      <div class="btnrow"><button class="btn" id="lk-ok">Anmelden</button><button class="btn sec" data-close>Abbrechen</button></div>`, m => {
      const go = () => {
        if (S.hash('lk|' + $('#lk-pw', m).value) === OSI.lehrkraftHash) {
          G.teacher = true; m.remove(); toast('<b>Lehrkraft-Modus aktiv.</b> Alle Akten sind offen.'); render();
        } else { $('#lk-pw', m).classList.add('shake'); setTimeout(() => $('#lk-pw', m).classList.remove('shake'), 400); }
      };
      $('#lk-ok', m).onclick = go;
      $('#lk-pw', m).onkeydown = e => { if (e.key === 'Enter') go(); };
      $('#lk-pw', m).focus();
    });
  }
  function lehrkraftDialog() {
    const liste = OSI.einsaetze.filter(e => e.steps.length).map(e => `<h3>${esc(e.nrText)} – ${esc(e.titel)}</h3><div class="opts">${e.steps.map(st => `<button class="opt" data-e="${e.id}" data-s="${st.id}">${stepDone(st) ? '✅' : '⬜'} <span class="mono small">${esc(st.id)}</span> ${esc(st.titel || st.type)}</button>`).join('')}</div>`).join('');
    modal(`<h2>🔑 Lehrkraft-Modus</h2>
      <p class="small">Springt zu jedem Schritt, ohne ihn als erledigt zu markieren. Alle Akten und Außeneinsätze sind geöffnet, solange der Modus aktiv ist.</p>
      <div class="btnrow"><button class="btn sec" id="lk-off">Modus beenden</button>
      <button class="btn sec" id="lk-unlock">Außeneinsätze in diesem Spielstand freischalten</button>
      <button class="btn sec" id="lk-verhoer">Abschlussverhör in diesem Spielstand freischalten</button></div>
      ${liste}
      <div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`, m => {
      m.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { m.remove(); gotoStep(b.dataset.e, b.dataset.s); });
      $('#lk-off', m).onclick = () => { G.teacher = false; m.remove(); render(); };
      $('#lk-unlock', m).onclick = () => { G.save.unlocked.alle = now(); persist(); toast('Außeneinsätze freigeschaltet.'); };
      $('#lk-verhoer', m).onclick = () => { G.save.unlocked.verhoer = now(); persist(); toast('Abschlussverhör freigeschaltet – auch nach Verlassen des Lehrkraft-Modus.'); };
    });
  }
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); if (G.save) (G.teacher ? lehrkraftDialog : lehrkraftLogin)(); }
  });
  G.lehrkraftLogin = lehrkraftLogin;

  // ---------------------------------------------------------------- Start
  function renderStart(forceNeu) {
    G.view = 'start';
    renderTopbar();
    const lokal = !forceNeu && S.loadLocal();
    const lsWarn = S.localAvailable() ? '' : `<div class="warnbar">⚠ Euer Browser erlaubt hier kein automatisches Speichern. Das Spiel funktioniert trotzdem – <b>exportiert euren Spielstand aber am Ende unbedingt!</b></div>`;
    app().innerHTML = `
      <div class="hero"><img src="img/hq.jpg" alt="Einsatzzentrale der Einheit 7">
        <div class="over"><div class="mono small hl">EINHEIT 7 · ABTEILUNG FÜR NETZWERKFORENSIK</div><h1>Operation <b>Lohnzettel</b></h1><div class="muted">Ein Fall in sieben Schichten.</div></div></div>
      ${lsWarn}
      <div class="grid2">
        <div class="card">
          ${lokal ? `<h2>Willkommen zurück</h2><p>Gefundener Spielstand: Duo <b>${esc(lokal.duo.codename)}</b> (${lokal.duo.agenten.map(esc).join(' & ')})</p>
            <div class="btnrow"><button class="btn" id="st-weiter">▶ Weiterspielen</button></div><hr style="border-color:var(--line);margin:18px 0">` : ''}
          <h2>${lokal ? 'Anderes Duo' : 'Neues Agenten-Duo'}</h2>
          <label>Codename eures Duos</label><input type="text" id="st-code" maxlength="24" placeholder="z. B. Nachtfalke">
          <div class="grid2"><div><label>Kürzel 1. Person</label><input type="text" id="st-k1" maxlength="12" placeholder="z. B. MK"></div>
          <div><label>Kürzel 2. Person</label><input type="text" id="st-k2" maxlength="12" placeholder="(leer, wenn allein)"></div></div>
          <p class="small muted" style="margin-top:8px">Kürzel so wählen, dass eure Lehrkraft euch erkennt – aber keine vollen Namen.</p>
          <div class="btnrow"><button class="btn ${lokal ? 'sec' : ''}" id="st-neu">Duo anlegen</button></div>
        </div>
        <div class="card">
          <h2>Spielstand-Datei laden</h2>
          <p>Ihr habt eine <code>.osiagent</code>-Datei aus eurem Duo oder aus der letzten Stunde? Dann ladet sie hier.</p>
          <div class="btnrow"><button class="btn sec" id="st-load">⬆ Datei auswählen</button><input type="file" id="st-file" accept=".osiagent" class="hidden"></div>
          <div id="st-drop" style="margin-top:14px;border:2px dashed var(--line);border-radius:10px;padding:26px;text-align:center" class="muted">… oder Datei hierher ziehen</div>
        </div>
      </div>
      <p class="small muted" style="text-align:center">Version ${esc(OSI.version)} · <a id="st-lk" style="cursor:pointer">Lehrkraft</a></p>`;
    if (lokal) $('#st-weiter').onclick = () => { G.save = lokal; G.lokalOk = true; render(); };
    $('#st-neu').onclick = () => {
      const code = $('#st-code').value.trim(), k1 = $('#st-k1').value.trim(), k2 = $('#st-k2').value.trim();
      if (!code || !k1) { alert('Bitte mindestens Codename und ein Kürzel eintragen.'); return; }
      if (lokal && !confirm(`Es gibt schon einen Spielstand von Duo „${lokal.duo.codename}“. Wirklich überschreiben? (Vorher exportieren, wenn ihr ihn noch braucht!)`)) return;
      G.save = neuerSpielstand(code, k1, k2);
      G.lokalOk = S.saveLocal(G.save);
      A.play('funk');
      gotoStep(OSI.einsaetze[0].id, OSI.einsaetze[0].steps[0].id);
    };
    $('#st-load').onclick = () => $('#st-file').click();
    $('#st-file').onchange = ev => { const f = ev.target.files[0]; if (f) importieren(f); };
    const drop = $('#st-drop');
    drop.ondragover = e => { e.preventDefault(); drop.style.borderColor = 'var(--orange)'; };
    drop.ondragleave = () => { drop.style.borderColor = ''; };
    drop.ondrop = e => { e.preventDefault(); drop.style.borderColor = ''; const f = e.dataTransfer.files[0]; if (f) importieren(f); };
    $('#st-lk').onclick = () => { if (!G.save && lokal) G.save = lokal; if (!G.save) { alert('Bitte zuerst ein Duo anlegen oder einen Spielstand laden.'); return; } lehrkraftLogin(); };
  }

  // ---------------------------------------------------------------- Übersicht (Hub)
  function renderHub() {
    G.view = 'hub';
    G.uebung = null;
    renderTopbar();
    const akten = OSI.einsaetze.map(e => {
      const offen = einsaetzOffenSafe(e);
      const fertig = einsatzFertig(e);
      const pr = Math.round(einsatzFortschritt(e) * 100);
      let stempel = '';
      if (e.status === 'bearbeitung') stempel = '<div class="stempel">IN BEARBEITUNG</div>';
      else if (fertig) stempel = '<div class="stempel ok">ERLEDIGT</div>';
      else if (!offen) stempel = '<div class="stempel">GESPERRT</div>';
      return `<div class="akte ${offen ? '' : 'locked'}" data-e="${e.id}">${stempel}
        <div class="nr">${esc(e.nrText)}</div><h3>${esc(e.titel)}</h3><div class="small muted">${esc(e.untertitel)}</div>
        ${e.status === 'bearbeitung' ? '<div class="small muted" style="margin-top:8px">Freigabe durch die Zentrale folgt.</div>' : `<div class="prog"><i style="width:${pr}%"></i></div>`}</div>`;
    }).join('');
    const ch = G.save.challenge;
    const chOffen = G.teacher || itemDone(OSI.challenge.freiNach);
    const badges = OSI.abzeichen.map(b => `<div class="badge ${G.save.badges[b.id] ? '' : 'off'}" title="${esc(b.text)}"><div class="ic">${b.icon}</div><div class="bn">${esc(b.geheim && !G.save.badges[b.id] ? '???' : b.name)}</div><div class="bd">${esc(b.geheim && !G.save.badges[b.id] ? 'Geheimes Abzeichen' : b.text)}</div></div>`).join('');
    const board = Object.keys(G.save.board).length || G.save.steps[OSI.boardAb] ? `<div class="card"><h2>🗂️ Verdächtigen-Board</h2>${boardHtml()}</div>` : '';
    app().innerHTML = `
      <h2>Einsatzakten</h2>
      <div class="akten">${akten}</div>
      <div class="grid2" style="margin-top:16px">
        <div class="card"><h2>⏱️ Zeit-Challenge</h2>
          <p>Ordnet so viele Begriffe wie möglich in ${OSI.challenge.sekunden} Sekunden der richtigen Schicht zu. Beliebig oft wiederholbar!</p>
          <p class="small muted">Euer Rekord: <b class="hl">${ch.best}</b> Richtige · Versuche: ${ch.runs}</p>
          <div class="btnrow"><button class="btn" id="hub-ch" ${chOffen ? '' : 'disabled'}>Challenge starten</button>${chOffen ? '' : '<span class="small muted">Wird im Training von Einsatz 0 freigeschaltet.</span>'}</div></div>
        <div class="card"><h2>🎖️ Abzeichen</h2><div class="badges" style="justify-content:flex-start">${badges}</div></div>
      </div>
      ${board}
      <p class="small muted" style="text-align:center">Version ${esc(OSI.version)} · <a id="hub-lk" style="cursor:pointer">Lehrkraft</a></p>`;
    $('#hub-lk').onclick = () => (G.teacher ? lehrkraftDialog : lehrkraftLogin)();
    app().querySelectorAll('.akte').forEach(el => el.onclick = () => {
      const e = einsatz(el.dataset.e);
      if (!einsaetzOffenSafe(e)) { A.play('falsch'); return; }
      const p = G.save.pos && G.save.pos.e === e.id ? G.save.pos.s : ersterOffenerStep(e).id;
      gotoStep(e.id, p);
    });
    $('#hub-ch').onclick = () => G.challenge.start();
  }
  function einsaetzOffenSafe(e) { return e.steps.length > 0 && einsatzOffen(e); }

  // „entlastet“ bleibt „vorerst“ (alte Spielstände); endgültig entlastet = „frei“
  const STEMPEL = { entlastet: 'VORERST ENTLASTET', verdaechtig: 'VERDÄCHTIG', frei: 'ENTLASTET', ueberfuehrt: 'ÜBERFÜHRT' };
  function boardHtml() {
    return `<div class="board">${OSI.verdaechtige.map(v => {
      const st = G.save.board[v.id];
      return `<div class="suspect"><div class="pin"></div><img src="img/${v.bild}" alt="${esc(v.name)}">
        ${st ? `<div class="status ${st}">${STEMPEL[st] || 'VERDÄCHTIG'}</div>` : ''}
        <h4>${esc(v.name)}</h4><div class="role">${esc(v.rolle)}</div><div class="notes">${v.notiz}</div></div>`;
    }).join('')}</div>`;
  }
  G.boardHtml = boardHtml;

  // ---------------------------------------------------------------- Schritt-Ansicht
  function renderStepView(e, st) {
    G.view = 'step';
    if (G.uebung && G.uebung.stepId !== st.id) G.uebung = null;
    renderTopbar();
    const idx = e.steps.indexOf(st);
    const nav = e.steps.map((s, i) => `<button title="${esc(s.titel || '')}" data-s="${s.id}" class="${stepDone(s) ? 'done' : ''} ${s === st ? 'cur' : ''}" ${stepOffen(e, i) ? '' : 'disabled'}>${s.bonus ? '★' : i + 1}</button>`).join('');
    app().innerHTML = `<div class="crumb"><a id="cr-hub">Einsatzakten</a> › ${esc(e.nrText)} – ${esc(e.titel)}</div>
      <div class="stepnav">${nav}</div><div id="uebbar"></div><div id="stepbox"></div>`;
    $('#cr-hub').onclick = () => { G.save.pos = null; S.saveLocal(G.save); render(); };
    app().querySelectorAll('.stepnav button').forEach(b => b.onclick = () => gotoStep(e.id, b.dataset.s));
    const box = $('#stepbox');
    const R = G.renderer[st.type];
    if (!R) { box.innerHTML = `<div class="card">Unbekannter Schritt-Typ: ${esc(st.type)}</div>`; return; }
    const ub = $('#uebbar');
    if (G.uebung) {
      ub.innerHTML = `<div class="uebbar on">🔁 <b>Übungsmodus</b> – zählt nicht für Punkte, Rang oder Fehlerquote. Schafft ihr es fehlerfrei und ohne Tipp, gibt es ⭐.
        <span style="flex:1"></span><button class="btn sec" id="ub-stop">Übung beenden</button></div>`;
      $('#ub-stop').onclick = () => { G.uebung = null; renderStepView(e, st); };
    } else if (stepDone(st) && UEBBAR.includes(st.type)) {
      const u = G.save.uebung[st.id];
      ub.innerHTML = `<div class="uebbar">✓ Erledigt${u && u.gemeistert ? ' · ⭐ beim Üben gemeistert' : u ? ` · ${u.runs}× geübt` : ''}
        <span style="flex:1"></span><button class="btn sec" id="ub-start">🔁 Nochmal üben</button></div>`;
      $('#ub-start').onclick = () => uebungStarten(e, st);
    }
    R(box, st, e, {
      fertig: () => { if (G.uebung) uebungFertig(st); else stepAbschliessen(st); },
      weiter: () => { if (G.uebung) uebungFertig(st); G.uebung = null; stepAbschliessen(st); naechsterStep(e, st); },
      done: stepDone(st),
      idx
    });
  }

  // ---------------------------------------------------------------- Haupt-Render
  function render() {
    if (!G.save) { renderStart(); return; }
    const p = aktuellePosition();
    if (p) renderStepView(p.e, p.st);
    else renderHub();
  }
  G.render = render;
  G.renderer = {};
  G.figur = figur;

  window.addEventListener('DOMContentLoaded', () => {
    const lokal = S.loadLocal();
    G.lokalOk = S.localAvailable();
    renderStart();
    if (!lokal) return;
  });
})();
