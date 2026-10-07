/* OSI-Agenten – Renderer für die Schritt-Typen und die Zeit-Challenge. */
(function () {
  'use strict';
  const G = window.OSIGame;
  const OSI = window.OSI;
  const A = window.OSIAudio;
  const { esc, shuffle, layerColor } = G.util;
  const $ = (sel, root = document) => root.querySelector(sel);
  const R = G.renderer;

  // ---------------------------------------------------------------- gemeinsame Bausteine
  let kalleKlicks = 0;
  function bindEggs(root) {
    root.querySelectorAll('.kalle-click').forEach(el => el.addEventListener('click', () => {
      kalleKlicks++;
      if (kalleKlicks === 5) { G.toast('☕ Kalle: „Finger weg von meinem Kaffee!“'); G.abzeichen('koffein'); }
    }));
    root.querySelectorAll('[data-egg]').forEach(el => el.addEventListener('click', () => {
      const egg = OSI.eggs[el.dataset.egg];
      if (!egg) return;
      G.modal(`<div style="padding-right:24px">${egg.text}</div><div class="btnrow"><button class="btn sec" data-close>Schließen</button></div>`);
      if (egg.abzeichen) G.abzeichen(egg.abzeichen);
    }));
  }

  function dialogHtml(sz) {
    const f = G.figur(sz.wer);
    const cls = sz.wer === 'kalle' ? 'kalle' : sz.wer === 'system' ? 'system' : '';
    const img = f.bild ? `<img class="portrait ${sz.wer === 'kalle' ? 'kalle-click' : ''}" src="img/${f.bild}" alt="${esc(f.name)}">` : `<div class="portrait sys">${f.icon || '📡'}</div>`;
    return `<div class="dialog ${cls}">${img}<div class="bubble"><div class="who">${esc(f.name)}</div>${sz.text}</div></div>`;
  }

  function kalleBox(text) {
    return `<div class="kallebox"><img class="kalle-click" src="img/${OSI.figuren.kalle.bild}" alt="Kalle"><div><b style="color:#7fd6e8">Kalle:</b> ${text}</div></div>`;
  }
  G.kalleBox = kalleBox;

  function hinweisBlock(q, root, onUse) {
    const hs = q.hinweise || [];
    const wrap = document.createElement('div');
    wrap.className = 'hints';
    const draw = () => {
      const used = G.itemState(q.id).h;
      const done = G.itemState(q.id).ok;
      wrap.innerHTML = hs.slice(0, used).map((h, i) => `<div class="hint"><img src="img/${OSI.figuren.kalle.bild}" alt=""><div><b style="color:#7fd6e8">Tipp ${i + 1}:</b> ${h}</div></div>`).join('') +
        (hs.length && used < hs.length && !done ? `<div style="margin-top:8px"><button class="hintbtn">💬 Kalle um ${used ? 'noch einen ' : 'einen '}Tipp bitten <span class="small">${G.uebung ? '(Übung – kostet nichts, aber kein ⭐)' : '(kostet Punkte)'}</span></button></div>` : '');
      const b = wrap.querySelector('.hintbtn');
      if (b) b.onclick = () => { G.hinweisNutzen(q.id); draw(); if (onUse) onUse(); };
    };
    draw();
    root.appendChild(wrap);
    return draw;
  }

  function feedback(root, ok, html, pts) {
    let fb = root.querySelector('.feedback');
    if (!fb) { fb = document.createElement('div'); root.appendChild(fb); }
    fb.className = 'feedback ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = (ok ? `<b>✔ Richtig!</b>${pts ? ` <span class="pt">+${pts} P</span>` : ''}<br>` : '<b>✘ Leider nicht.</b> ') + (html || '');
    return fb;
  }

  function weiterButton(ctx, label = 'Weiter ▸') {
    return `<div class="btnrow"><button class="btn" id="st-weiter">${label}</button></div>`;
  }

  // ---------------------------------------------------------------- Story
  R.story = (box, st, e, ctx) => {
    const sz = st.szenen;
    let shown = ctx.done ? sz.length : 1;
    const draw = () => {
      // erst abschließen, dann zeichnen – sonst zeigt das Board die neuen Stempel (setzt) noch nicht
      if (shown >= sz.length) ctx.fertig();
      box.innerHTML = `<div class="card">
        ${st.bild ? `<img class="scene-img" src="img/${st.bild}" alt="">` : ''}
        ${st.titel ? `<h2>${esc(st.titel)}</h2>` : ''}
        <div id="dlg">${sz.slice(0, shown).map(dialogHtml).join('')}</div>
        ${st.board && shown >= sz.length ? G.boardHtml() : ''}
        <div class="btnrow">${shown < sz.length ? '<button class="btn" id="dl-next">▸ Weiter</button>' : '<button class="btn" id="st-weiter">Weiter ▸</button>'}</div></div>`;
      bindEggs(box);
      const n = $('#dl-next', box);
      if (n) n.onclick = () => { shown++; A.play('klick'); draw(); G.zeige(box.querySelector('.btnrow')); };
      const w = $('#st-weiter', box);
      if (w) w.onclick = ctx.weiter;
    };
    A.play('funk');
    draw();
  };

  // ---------------------------------------------------------------- Lektion
  R.lesson = (box, st, e, ctx) => {
    box.innerHTML = `<div class="card lesson">
      ${st.tag ? `<div class="tag">${esc(st.tag)}</div>` : ''}
      <h2>${esc(st.titel)}</h2>
      ${st.html}
      ${st.kalle ? kalleBox(st.kalle) : ''}
      <div class="btnrow"><button class="btn" id="st-weiter">${ctx.done ? 'Weiter ▸' : 'Verstanden ▸'}</button></div></div>`;
    bindEggs(box);
    $('#st-weiter', box).onclick = ctx.weiter;
  };

  // ---------------------------------------------------------------- Quiz (MC, Schicht-Wahl, Klick-Auswahl, Mehrfachauswahl)
  const LAYER_OPTS = [1, 2, 3, 4, 5, 6, 7];

  R.quiz = (box, st, e, ctx) => {
    const qs = st.fragen;
    const firstOpen = () => { const i = qs.findIndex(q => !G.itemState(q.id).ok); return i < 0 ? qs.length : i; };
    let cur = firstOpen();

    const draw = () => {
      const alleFertig = qs.every(q => G.itemState(q.id).ok);
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">${Math.min(cur + 1, qs.length)} / ${qs.length}</span></div>
        ${st.intro ? `<div>${st.intro}</div>` : ''}
        ${st.kontext ? `<div id="kontext">${typeof st.kontext === 'function' ? st.kontext() : st.kontext}</div>` : ''}
        ${st.wireshark ? '<div id="ws-mount"></div>' : ''}${st.terminal ? '<div id="term-mount"></div>' : ''}
        <div id="qarea"></div></div>`;
      bindEggs(box);
      if (st.nachKontext) st.nachKontext(box);
      if (st.wireshark) wiresharkMount($('#ws-mount', box), st.wireshark, st.id);
      if (st.terminal) terminalMount($('#term-mount', box), st.terminal, st.id);
      const area = $('#qarea', box);
      if (cur >= qs.length) {
        area.innerHTML = `<div class="feedback ok"><b>Alle Aufgaben gelöst.</b></div>${st.abschluss || ''}` +
          qs.map((q, i) => `<details style="margin-top:8px"><summary class="small">${i + 1}. ${q.frage}</summary><div class="small" style="padding:6px 0 0 14px">${q.erklaerung || ''}</div></details>`).join('') + weiterButton(ctx);
        $('#st-weiter', box).onclick = ctx.weiter;
        if (alleFertig) ctx.fertig();
        return;
      }
      frage(area, qs[cur]);
    };

    const frage = (area, q) => {
      const it = G.itemState(q.id);
      area.innerHTML = `${q.ticket ? `<div class="ticket"><div class="tno">${esc(q.ticketNr || 'Störungsmeldung')}</div>${q.ticket}</div>` : ''}
        <div class="frage">${q.frage}</div><div id="opts"></div>`;
      const optsEl = $('#opts', area);
      const pickRoot = $('#kontext', box);

      const loesen = (wert, el) => {
        if (G.itemState(q.id).ok) return;
        // richtig kann auch eine Liste sein, wenn mehrere Antworten gelten (z. B. TLS auf L5 oder L6)
        const korrekt = [].concat(q.richtig).map(String).includes(String(wert));
        if (korrekt) {
          const p = G.richtig(q.id, q.punkte || 10);
          if (el) el.classList.add('right');
          area.querySelectorAll('.opt, .triage-btns button').forEach(b => b.disabled = true);
          feedback(area, true, q.erklaerung, p);
          fertigZeigen();
        } else {
          G.falsch(q.id, wert);
          if (el) { el.classList.add('wrong', 'shake'); el.disabled = true; setTimeout(() => el.classList.remove('shake'), 400); }
          G.zeige(feedback(area, false, (q.falsch && q.falsch[wert]) || 'Versucht es noch einmal – oder fragt Kalle nach einem Tipp.'));
        }
      };

      const fertigZeigen = () => {
        const hb = area.querySelector('.hints'); if (hb) hb.remove();
        const b = document.createElement('div');
        b.className = 'btnrow';
        b.innerHTML = `<button class="btn" id="q-next">${cur + 1 < qs.length ? 'Nächste Aufgabe ▸' : 'Abschließen ▸'}</button>`;
        area.appendChild(b);
        $('#q-next', area).onclick = () => { cur++; draw(); G.zeige($('#qarea', box)); };
        $('#q-next', area).focus({ preventScroll: true });
        G.zeige(b);
      };

      if (q.eingabe) {
        // Freitext: Wert eintippen (IP, MAC, Name …) oder einen Wireshark-Filter schreiben
        const istFilter = q.eingabe === 'filter';
        optsEl.innerHTML = `<div class="eingabe-row"><input type="text" id="q-in" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(q.platzhalter || (istFilter ? 'Anzeigefilter eintippen' : 'Antwort eintippen'))}">
          <button class="btn sec" id="q-check">Prüfen</button></div>`;
        const inp = $('#q-in', optsEl);
        const pruefen = () => {
          if (G.itemState(q.id).ok) return;
          const roh = inp.value.trim();
          if (!roh) return;
          let ok, wert = roh, zusatz = '';
          if (istFilter) {
            const pk = st.wireshark.pakete;
            let ist;
            try { ist = wsTreffer(pk, roh); } catch (err) { G.zeige(feedback(area, false, `Diesen Filter versteht Wireshark nicht (${esc(err.message)}). Das zählt nicht als Fehlversuch – prüft die Schreibweise im Spickzettel der Lektion.`)); return; }
            const soll = wsTreffer(pk, q.richtig);
            ok = ist.length === soll.length && ist.every((n, i) => n === soll[i]);
            if (!ok) zusatz = `Euer Filter zeigt ${ist.length} Frame${ist.length === 1 ? '' : 's'} – gesucht sind genau die ${soll.length} passenden.`;
          } else {
            const n = normAntwort(roh, q.eingabe);
            ok = [].concat(q.richtig).some(r => normAntwort(r, q.eingabe) === n);
            wert = n;
          }
          if (ok) {
            const p = G.richtig(q.id, q.punkte || 10);
            inp.disabled = true; $('#q-check', optsEl).disabled = true; inp.classList.add('right');
            if (istFilter) { const W = wsState[st.id]; if (W) { W.filter = roh; const m = $('#ws-mount', box); if (m) wiresharkMount(m, st.wireshark, st.id); } }
            feedback(area, true, q.erklaerung, p);
            fertigZeigen();
          } else {
            G.falsch(q.id, wert);
            inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400);
            const fb = (q.falsch && q.falsch[normAntwort(roh, q.eingabe)]) || zusatz || 'Das stimmt noch nicht. Schaut genau hin – oder fragt Kalle nach einem Tipp.';
            G.zeige(feedback(area, false, fb));
          }
        };
        $('#q-check', optsEl).onclick = pruefen;
        inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); pruefen(); } };
      } else if (q.meldung) {
        // Frame in der Wireshark-Liste markieren und melden
        optsEl.innerHTML = `<p class="small muted">👆 Markiert den Frame oben in der Paketliste und meldet ihn dann.</p>
          <div class="btnrow" style="margin-top:0"><button class="btn sec" id="q-melden">🚩 Markierten Frame melden</button></div>`;
        $('#q-melden', optsEl).onclick = () => {
          if (G.itemState(q.id).ok) return;
          const W = wsState[st.id];
          if (!W || W.sel == null) { G.zeige(feedback(area, false, 'Markiert zuerst einen Frame in der Paketliste (einfach anklicken).')); return; }
          if ([].concat(q.richtig).map(Number).includes(W.sel)) {
            const p = G.richtig(q.id, q.punkte || 10);
            $('#q-melden', optsEl).disabled = true;
            feedback(area, true, q.erklaerung, p);
            fertigZeigen();
          } else {
            G.falsch(q.id, W.sel);
            G.zeige(feedback(area, false, (q.falsch && q.falsch[W.sel]) || `Frame ${W.sel} ist es nicht. Schaut euch Quelle, Ziel und Info noch einmal genau an.`));
          }
        };
      } else if (q.layer) {
        optsEl.innerHTML = `<div class="triage-btns">${LAYER_OPTS.map(n => `<button data-v="${n}" style="background:${layerColor(n)}">L${n}</button>`).join('')}</div>`;
        optsEl.querySelectorAll('button').forEach(b => b.onclick = () => loesen(b.dataset.v, b));
      } else if (q.pick) {
        optsEl.innerHTML = `<p class="small muted">👆 Klickt die richtige Stelle oben an.</p>`;
        (pickRoot || box).querySelectorAll('[data-pick]').forEach(el => {
          el.onclick = () => {
            (pickRoot || box).querySelectorAll('[data-pick]').forEach(x => x.classList.remove('sel'));
            el.classList.add('sel');
            loesen(el.dataset.pick, null);
          };
        });
      } else if (q.multi) {
        const order = q.fest ? q.optionen.map((o, i) => i) : shuffle(q.optionen.map((o, i) => i));
        optsEl.innerHTML = `<p class="small muted">Mehrere Antworten möglich.</p><div class="opts">${order.map(i => `<button class="opt" data-i="${i}">☐ ${q.optionen[i]}</button>`).join('')}</div>
          <div class="btnrow"><button class="btn sec" id="q-check">Prüfen</button></div>`;
        const sel = new Set();
        optsEl.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const i = +b.dataset.i;
          if (sel.has(i)) { sel.delete(i); b.classList.remove('sel'); b.innerHTML = '☐ ' + q.optionen[i]; }
          else { sel.add(i); b.classList.add('sel'); b.innerHTML = '☑ ' + q.optionen[i]; }
        });
        $('#q-check', optsEl).onclick = () => {
          if (G.itemState(q.id).ok) return;
          const soll = new Set(q.richtig);
          const ok = sel.size === soll.size && [...sel].every(i => soll.has(i));
          if (ok) {
            const p = G.richtig(q.id, q.punkte || 10);
            optsEl.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (soll.has(+b.dataset.i)) b.classList.add('right'); });
            $('#q-check', optsEl).disabled = true;
            feedback(area, true, q.erklaerung, p);
            fertigZeigen();
          } else {
            G.falsch(q.id, [...sel].sort().join('+'));
            const zuViel = [...sel].filter(i => !soll.has(i)).length, zuWenig = [...soll].filter(i => !sel.has(i)).length;
            feedback(area, false, `${zuViel ? `${zuViel} Auswahl${zuViel > 1 ? 'en sind' : ' ist'} falsch. ` : ''}${zuWenig ? `Es fehlt noch mindestens eine richtige Antwort.` : ''}`);
          }
        };
      } else {
        const order = q.fest ? q.optionen.map((o, i) => i) : shuffle(q.optionen.map((o, i) => i));
        // Karten (Anklage): schon verwendete Beweiskarten anderer Felder sind gesperrt
        const belegt = q.karten ? qs.filter(x => x !== q && x.karten && G.itemState(x.id).ok).map(x => String(x.richtig)) : [];
        optsEl.innerHTML = `<div class="opts ${q.karten || q.bilder ? 'karten' : ''}">${order.map(i => `<button class="opt" data-i="${i}">${q.bilder ? `<img src="img/${q.bilder[i]}" alt="">` : ''}<span>${q.optionen[i]}</span>${belegt.includes(String(i)) ? '<small>liegt schon in der Anklage</small>' : ''}</button>`).join('')}</div>`;
        optsEl.querySelectorAll('.opt').forEach(b => {
          if (it.w.includes(b.dataset.i)) { b.disabled = true; b.classList.add('wrong'); }
          if (belegt.includes(b.dataset.i)) { b.disabled = true; b.classList.add('belegt'); }
          b.onclick = () => loesen(b.dataset.i, b);
        });
      }
      hinweisBlock(q, area);
    };
    draw();
  };

  // ---------------------------------------------------------------- Anklageschrift (Finale)
  // Technisch ein Quiz: Person wählen, dann je Feld eine Beweiskarte (q.karten) und ggf. die Schicht.
  // Die Anklageschrift selbst liefert der Inhalt als kontext-Funktion; sie füllt sich mit jedem gelösten Feld.
  R.anklage = (box, st, e, ctx) => R.quiz(box, st, e, ctx);

  // ---------------------------------------------------------------- Simuliertes Terminal (Windows-Eingabeaufforderung)
  // Zustand je Schritt bleibt erhalten, solange die Seite offen ist (nicht im Spielstand).
  const termState = {};
  const normCmd = s => String(s).trim().replace(/\s+/g, ' ').toLowerCase();

  function terminalMount(el, cfg, key) {
    const T = termState[key] || (termState[key] = {
      log: [{ t: 'out', s: cfg.begruessung || 'Microsoft Windows [Version 10.0.22631.4317]\n(c) Microsoft Corporation. Alle Rechte vorbehalten.\n' }],
      hist: [], hp: 0, matrix: false, entwurf: ''
    });
    const prompt = cfg.prompt || 'C:\\Users\\agent>';
    const spick = cfg.spick || [];
    const vorlagen = [...cfg.befehle.map(b => b.tab || b.cmd).filter(Boolean), 'cls', 'help'];
    el.innerHTML = `<div class="term ${T.matrix ? 'matrix' : ''}">
      <div class="term-bar"><span>▣ ${esc(cfg.titel || 'Eingabeaufforderung')}</span><span style="flex:1"></span><button class="term-spick" type="button">📋 Spickzettel</button></div>
      <div class="term-spickbox hidden"><div class="small muted" style="margin-bottom:4px">Anklicken setzt den Befehl in die Eingabezeile. <b>Tab</b> ergänzt angefangene Befehle, <b>↑</b> holt frühere Befehle zurück.</div>
        <table>${spick.map(([c, t]) => `<tr><td><code class="term-vorlage" data-c="${esc(c.replace(/<[^>]*>/g, '').trimEnd() + (c.includes('<') ? ' ' : ''))}">${esc(c)}</code></td><td>${t}</td></tr>`).join('')}</table></div>
      <div class="term-body"><div class="term-out"></div>
        <label class="term-in"><span class="term-prompt">${esc(prompt)}</span><input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Befehl eingeben"></label></div></div>`;
    const out = el.querySelector('.term-out'), inp = el.querySelector('input'), body = el.querySelector('.term-body');
    const zeichne = () => {
      out.innerHTML = T.log.map(l => `<div class="${l.t}">${esc(l.s)}</div>`).join('');
      body.scrollTop = body.scrollHeight;
    };
    const schreib = s => T.log.push({ t: 'out', s });
    const run = raw => {
      const n = normCmd(raw);
      T.log.push({ t: 'cmd', s: prompt + raw });
      if (n) T.hist.push(raw);
      T.hp = T.hist.length;
      if (!n) return;
      if (n === 'cls') { T.log = []; return; }
      if (n === 'help' || n === 'hilfe' || n === '/?') {
        schreib('Verfügbare Befehle in dieser Simulation:\n' + spick.map(([c, t]) => '  ' + c.padEnd(26) + String(t).replace(/<[^>]+>/g, '')).join('\n') + '\n  cls'.padEnd(29) + 'Bildschirm leeren\n');
        return;
      }
      if (n === 'exit') { schreib('Netter Versuch. Kalle braucht das Fenster noch.\n'); return; }
      if (/^color( 0a| a| 02| 2)$/.test(n)) {
        T.matrix = true; el.querySelector('.term').classList.add('matrix');
        schreib(''); G.abzeichen('matrix'); return;
      }
      if (/^color( 07| 7)?$/.test(n)) { T.matrix = false; el.querySelector('.term').classList.remove('matrix'); schreib(''); return; }
      for (const b of cfg.befehle) {
        let m = null;
        if (b.re) m = n.match(b.re);
        else if ([b.cmd, ...(b.alias || [])].some(c => normCmd(c) === n)) m = [n];
        if (m) { schreib(typeof b.out === 'function' ? b.out(m, n) : b.out); return; }
      }
      const erstes = n.split(' ')[0];
      if (cfg.befehle.some(b => normCmd(b.tab || b.cmd || '').split(' ')[0] === erstes)) {
        schreib(`(Simulation) „${raw.trim()}“ wird hier nicht unterstützt.\nDieser Befehl steht nur in den Varianten aus dem Spickzettel zur Verfügung.\n`);
        return;
      }
      schreib(`Der Befehl "${raw.trim().split(/\s+/)[0]}" ist entweder falsch geschrieben oder\nkonnte nicht gefunden werden.\n`);
    };
    inp.value = T.entwurf;
    inp.addEventListener('input', () => { T.entwurf = inp.value; });
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        const v = inp.value; inp.value = ''; T.entwurf = '';
        run(v); if (T.log.length > 400) T.log.splice(0, T.log.length - 400);
        A.play('klick'); zeichne();
      } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (!T.hist.length) return;
        T.hp = Math.max(0, Math.min(T.hist.length, T.hp + (ev.key === 'ArrowUp' ? -1 : 1)));
        inp.value = T.hist[T.hp] || '';
      } else if (ev.key === 'Tab') {
        ev.preventDefault();
        const v = inp.value.replace(/\s+/g, ' ').toLowerCase().trimStart();
        if (!v) return;
        const k = [...new Set(vorlagen.map(x => x.toLowerCase()).filter(x => x.startsWith(v)))];
        if (!k.length) return;
        let pre = k[0];
        k.forEach(x => { while (!x.startsWith(pre)) pre = pre.slice(0, -1); });
        if (pre.length > v.length) inp.value = pre;
        else if (k.length > 1) { T.log.push({ t: 'cmd', s: prompt + inp.value }); schreib(k.join('    ')); zeichne(); }
        T.entwurf = inp.value;
      }
    });
    el.querySelector('.term-spick').onclick = () => el.querySelector('.term-spickbox').classList.toggle('hidden');
    el.querySelectorAll('.term-vorlage').forEach(c => c.onclick = () => { inp.value = c.dataset.c; T.entwurf = inp.value; inp.focus(); });
    body.addEventListener('click', ev => { if (!window.getSelection().toString()) inp.focus({ preventScroll: true }); });
    zeichne();
  }
  G.terminalMount = terminalMount;

  // ---------------------------------------------------------------- Wireshark-Ansicht mit Anzeigefiltern
  const wsState = {};
  const WS_ALIAS = { 'eth.addr': ['eth.src', 'eth.dst'], 'ip.addr': ['ip.src', 'ip.dst'], 'udp.port': ['udp.srcport', 'udp.dstport'], 'tcp.port': ['tcp.srcport', 'tcp.dstport'] };
  const WS_PROTOS = ['frame', 'eth', 'arp', 'ip', 'icmp', 'udp', 'tcp', 'dns', 'dhcp', 'bootp', 'http', 'tls', 'ssh'];
  const WS_FELDER = ['eth.src', 'eth.dst', 'eth.addr', 'eth.type', 'ip.src', 'ip.dst', 'ip.addr', 'ip.ttl', 'udp.srcport', 'udp.dstport', 'udp.port', 'tcp.srcport', 'tcp.dstport', 'tcp.port',
    'arp.opcode', 'arp.src.hw_mac', 'arp.src.proto_ipv4', 'arp.dst.hw_mac', 'arp.dst.proto_ipv4', 'dhcp.option.dhcp', 'dhcp.hw.mac_addr', 'dhcp.option.dhcp_server_id', 'dhcp.option.router', 'dhcp.option.domain_name_server', 'dhcp.ip.your',
    'dns.qry.name', 'frame.number', 'icmp.type', 'icmp.code', 'tcp.flags.syn', 'tcp.flags.ack', 'tcp.flags.reset', 'tcp.flags.push', 'tcp.flags.fin',
    'http.request.method', 'http.request.uri', 'http.host', 'http.response.code', 'http.cookie', 'http.set_cookie'];
  const WS_MAC = ['eth.src', 'eth.dst', 'eth.addr', 'arp.src.hw_mac', 'arp.dst.hw_mac', 'dhcp.hw.mac_addr'];
  const WS_IP = ['ip.src', 'ip.dst', 'ip.addr', 'arp.src.proto_ipv4', 'arp.dst.proto_ipv4', 'dhcp.option.dhcp_server_id', 'dhcp.option.router', 'dhcp.option.domain_name_server', 'dhcp.ip.your'];
  // Wie Wireshark: Der Wert muss zum Feldtyp passen, sonst ist der Filter ungültig (rot)
  function wsWertPruefen(f, roh) {
    const v = String(roh).replace(/^"|"$/g, '');
    if (WS_MAC.includes(f) && !/^([0-9a-f]{2}[-:]){5}[0-9a-f]{2}$/i.test(v)) {
      if (/^[a-z]+_([0-9a-f]{2}:){2}[0-9a-f]{2}$/i.test(v)) throw new Error(`„${v}“ ist nur der Anzeigename, den Wireshark aus der Herstellerkennung (OUI) bildet. Im Filter braucht ihr die echte MAC-Adresse, z. B. dc:a6:32:5e:19:7a`);
      throw new Error(`„${v}“ ist keine gültige MAC-Adresse für ${f}`);
    }
    if (WS_IP.includes(f) && !(/^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(x => +x <= 255))) throw new Error(`„${v}“ ist keine gültige IPv4-Adresse für ${f}`);
  }
  const wsWert = v => { v = String(v).toLowerCase().replace(/^"|"$/g, ''); return /^([0-9a-f]{2}[-:]){5}[0-9a-f]{2}$/.test(v) ? v.replace(/-/g, ':') : v; };

  // Zerlegt einen Anzeigefilter und liefert eine Prüffunktion (Frame → true/false). Wirft bei Syntaxfehlern.
  function wsFilter(text) {
    const src = String(text || '').trim();
    if (!src) return () => true;
    const tok = [];
    const re = /\s*(==|!=|&&|\|\||!|\(|\)|"[^"]*"|[A-Za-z0-9_.:\-\/]+)/y;
    let pos = 0;
    while (pos < src.length) {
      re.lastIndex = pos;
      const m = re.exec(src);
      if (!m) { if (/^\s+$/.test(src.slice(pos))) break; throw new Error('Unerwartetes Zeichen: ' + src.slice(pos, pos + 1)); }
      tok.push(m[1]); pos = re.lastIndex;
    }
    let i = 0;
    const peek = () => (tok[i] || '').toLowerCase();
    const orE = () => { let l = andE(); while (peek() === '||' || peek() === 'or') { i++; const a = l, b = andE(); l = p => a(p) || b(p); } return l; };
    const andE = () => { let l = notE(); while (peek() === '&&' || peek() === 'and') { i++; const a = l, b = notE(); l = p => a(p) && b(p); } return l; };
    const notE = () => { if (peek() === '!' || peek() === 'not') { i++; const a = notE(); return p => !a(p); } return prim(); };
    const prim = () => {
      if (peek() === '(') { i++; const e = orE(); if (peek() !== ')') throw new Error('Klammer fehlt'); i++; return e; }
      let f = peek(); i++;
      if (f === 'bootp') f = 'dhcp';
      if (!f || !(WS_PROTOS.includes(f) || WS_FELDER.includes(f))) throw new Error('Unbekanntes Feld oder Protokoll: ' + (f || '(leer)'));
      const werte = p => (WS_ALIAS[f] || [f]).flatMap(k => p.felder[k] == null ? [] : [].concat(p.felder[k])).map(wsWert);
      const op = peek();
      if (['==', 'eq', '!=', 'ne'].includes(op)) {
        // Wie Wireshark: Ein Protokoll (ip, tcp, arp …) ist kein Feld und lässt sich nicht mit einem Wert vergleichen
        if (WS_PROTOS.includes(f)) throw new Error(`„${f}“ ist ein Protokoll, kein Feld – vergleichen könnt ihr nur Felder, z. B. ${f === 'ip' ? 'ip.addr' : f === 'eth' ? 'eth.addr' : f === 'tcp' ? 'tcp.port' : f === 'udp' ? 'udp.port' : f + '.…'} == …`);
        i++;
        if (tok[i] == null || ['&&', '||', ')', 'and', 'or'].includes(peek())) throw new Error('Wert fehlt');
        wsWertPruefen(f, tok[i]);
        const v = wsWert(tok[i++]);
        return op === '==' || op === 'eq' ? p => werte(p).includes(v) : p => { const w = werte(p); return w.length > 0 && !w.includes(v); };
      }
      return p => WS_PROTOS.includes(f) ? p.protos.includes(f) : werte(p).length > 0;
    };
    const fn = orE();
    if (i < tok.length) throw new Error('Unerwartet: ' + tok[i]);
    return fn;
  }
  G.wsFilter = wsFilter;
  const wsTreffer = (pakete, filter) => { const f = wsFilter(filter); return pakete.filter(f).map(p => p.nr); };

  function wiresharkMount(el, cfg, key) {
    const W = wsState[key] || (wsState[key] = { filter: cfg.filter || '', sel: null, offen: {}, fehler: false });
    const draw = () => {
      let sicht = cfg.pakete, fehler = false;
      try { const f = wsFilter(W.filter); sicht = cfg.pakete.filter(f); } catch (e) { fehler = e.message || true; }
      W.fehler = fehler;
      const p = cfg.pakete.find(x => x.nr === W.sel);
      el.innerHTML = `<div class="ws ws-live">
        <div class="ws-bar"><span>Mitschnitt: ${esc(cfg.datei)}</span>${cfg.info ? `<span>${esc(cfg.info)}</span>` : ''}</div>
        <div class="ws-filter ${W.filter.trim() ? (fehler ? 'bad' : 'ok') : ''}"><span class="small">Anzeigefilter:</span>
          <input type="text" spellcheck="false" autocomplete="off" autocapitalize="off" value="${esc(W.filter)}" placeholder="z. B. arp" aria-label="Anzeigefilter">
          <button type="button" class="ws-apply">▶ Anwenden</button><button type="button" class="ws-clear" title="Filter löschen">✕</button></div>
        <div class="ws-list ws-scroll">
          <div class="ws-row head"><span>Nr.</span><span>Zeit</span><span>Quelle</span><span>Ziel</span><span>Prot.</span><span>Länge</span><span>Info</span></div>
          ${fehler ? '' : sicht.map(x => `<div class="ws-row clickable p-${esc(x.prot.toLowerCase())} ${x.nr === W.sel ? 'sel' : ''}" data-nr="${x.nr}"><span>${x.nr}</span><span>${esc(x.zeit)}</span><span>${esc(x.quelle)}</span><span>${esc(x.ziel)}</span><span>${esc(x.prot)}</span><span>${x.laenge}</span><span>${esc(x.info)}</span></div>`).join('')}
        </div>
        <div class="ws-status">${fehler ? `⚠ Ungültiger Filter – Wireshark färbt die Filterzeile rot.${typeof fehler === 'string' ? ' ' + esc(fehler) : ''}` : `Angezeigt: ${sicht.length} von ${cfg.pakete.length} Frames`}${p ? ` · markiert: Frame ${p.nr}` : ''}</div>
        <div class="ws-tree">${p ? p.baum.map((n, i) => `<div class="ws-node"><div class="ws-lbl" data-i="${i}"><span class="tri">${W.offen[i] ? '▾' : '▸'}</span>${esc(n.t)}</div>
          <div class="ws-kids ${W.offen[i] ? '' : 'hidden'}">${n.kids.map(k => `<div>${esc(k)}</div>`).join('')}</div></div>`).join('') : '<div class="small muted" style="padding:4px 10px">Klickt einen Frame in der Liste an, um ihn im Detail zu sehen.</div>'}</div></div>`;
      const inp = el.querySelector('.ws-filter input');
      const anwenden = () => { W.filter = inp.value; A.play('klick'); draw(); const n = el.querySelector('.ws-filter input'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); };
      el.querySelector('.ws-apply').onclick = anwenden;
      inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); anwenden(); } };
      el.querySelector('.ws-clear').onclick = () => { W.filter = ''; draw(); };
      el.querySelectorAll('.ws-row[data-nr]').forEach(r => r.onclick = () => { W.sel = +r.dataset.nr; draw(); });
      el.querySelectorAll('.ws-lbl').forEach(l => l.onclick = () => { W.offen[l.dataset.i] = !W.offen[l.dataset.i]; draw(); });
      const sel = el.querySelector('.ws-row.sel');
      if (sel) { const box = el.querySelector('.ws-scroll'); if (sel.offsetTop < box.scrollTop || sel.offsetTop > box.scrollTop + box.clientHeight - 20) box.scrollTop = sel.offsetTop - 40; }
    };
    draw();
  }
  G.wiresharkMount = wiresharkMount;
  G.wsState = wsState;

  // Freitext-Antworten vergleichbar machen
  function normAntwort(v, art) {
    let s = String(v || '').trim().toLowerCase();
    if (art === 'mac') return s.replace(/[^0-9a-f]/g, '');
    s = s.replace(/\s+/g, ' ');
    if (art === 'zahl' || art === 'ip') s = s.replace(/\s/g, '');
    return s;
  }

  // ---------------------------------------------------------------- Sortierer (Drag & Drop oder Klick-Klick)
  R.sort = (box, st, e, ctx) => {
    let selected = null;
    const draw = () => {
      const offen = st.items.filter(it => !G.itemState(it.id).ok);
      const binsHtml = st.bins.map(b => {
        // ziel kann eine Liste sein – dann steht der Begriff in der Kiste, in die er gelegt wurde
        const drin = st.items.filter(it => G.itemState(it.id).ok && String(G.itemState(it.id).bin != null ? G.itemState(it.id).bin : [].concat(it.ziel)[0]) === String(b.id));
        return `<div class="bin ${st.spalten ? 'cols-bin' : ''}" data-bin="${b.id}">
          <div class="blabel">${b.farbe ? `<span class="lchip" style="background:${layerColor(b.farbe)}">${esc(b.kurz || b.id)}</span> ` : ''}${esc(b.label)}${b.sub ? `<small>${esc(b.sub)}</small>` : ''}</div>
          <div class="bitems">${drin.map(it => `<span class="chip placed" title="${esc(stripHtml(it.erklaerung || ''))}">${esc(it.text)}</span>`).join('')}</div></div>`;
      }).join('');
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">${st.items.length - offen.length} / ${st.items.length}</span></div>
        ${st.intro ? `<div>${st.intro}</div>` : ''}
        <div class="sorthelp">Begriff anklicken und dann die passende Kiste anklicken – oder per Drag & Drop hineinziehen.</div>
        <div class="pool" id="pool">${offen.map(it => `<span class="chip ${selected === it.id ? 'sel' : ''}" draggable="true" data-id="${it.id}">${esc(it.text)}</span>`).join('') || '<span class="muted">Alles einsortiert!</span>'}</div>
        <div class="bins ${st.spalten ? 'cols' : ''}">${binsHtml}</div>
        <div id="sfb"></div>
        <div class="btnrow">${offen.length ? `<button class="hintbtn" id="s-hint" ${selected ? '' : 'disabled'}>💬 Tipp zum ausgewählten Begriff <span class="small">${G.uebung ? '(Übung – kein ⭐)' : '(kostet Punkte)'}</span></button>` : '<button class="btn" id="st-weiter">Weiter ▸</button>'}</div>
      </div>`;
      if (!offen.length) { ctx.fertig(); $('#st-weiter', box).onclick = ctx.weiter; pruefeFehlerfrei(); }
      box.querySelectorAll('.chip[data-id]').forEach(c => {
        c.onclick = () => { selected = selected === c.dataset.id ? null : c.dataset.id; A.play('klick'); draw(); };
        c.ondragstart = ev => { selected = c.dataset.id; ev.dataTransfer.setData('text/plain', c.dataset.id); };
      });
      box.querySelectorAll('.bin').forEach(b => {
        b.onclick = () => { if (selected) drop(selected, b.dataset.bin); };
        b.ondragover = ev => { ev.preventDefault(); b.classList.add('over'); };
        b.ondragleave = () => b.classList.remove('over');
        b.ondrop = ev => { ev.preventDefault(); b.classList.remove('over'); const id = ev.dataTransfer.getData('text/plain') || selected; if (id) drop(id, b.dataset.bin); };
      });
      const hb = $('#s-hint', box);
      if (hb) hb.onclick = () => {
        const it = st.items.find(x => x.id === selected);
        if (!it) return;
        G.hinweisNutzen(it.id);
        $('#sfb', box).innerHTML = `<div class="hint"><img src="img/${OSI.figuren.kalle.bild}" alt=""><div><b style="color:#7fd6e8">Tipp zu „${esc(it.text)}“:</b> ${it.hinweis || 'Überlegt, mit welchen Adressen oder Signalen das zu tun hat.'}</div></div>`;
      };
    };
    const drop = (id, bin) => {
      const it = st.items.find(x => x.id === id);
      if (!it || G.itemState(id).ok) return;
      if ([].concat(it.ziel).map(String).includes(String(bin))) {
        const p = G.richtig(id, st.punkte || 8);
        G.itemState(id).bin = String(bin); G.persist();
        selected = null;
        draw();
        $('#sfb', box).innerHTML = `<div class="feedback ok"><b>✔ ${esc(it.text)}</b> ${p ? `<span class="pt">+${p} P</span>` : ''}<br>${it.erklaerung || ''}</div>`;
      } else {
        G.falsch(id, bin);
        const chip = box.querySelector(`.chip[data-id="${id}"]`);
        if (chip) { chip.classList.add('shake'); setTimeout(() => chip.classList.remove('shake'), 400); }
        $('#sfb', box).innerHTML = `<div class="feedback bad"><b>✘ „${esc(it.text)}“ gehört nicht dorthin.</b> ${it.falschtipp || ''}</div>`;
      }
    };
    const pruefeFehlerfrei = () => {
      if (!G.uebung && st.abzeichenFehlerfrei && st.items.every(it => G.itemState(it.id).f === 0 && G.itemState(it.id).h === 0)) G.abzeichen(st.abzeichenFehlerfrei);
    };
    draw();
  };
  function stripHtml(s) { return String(s).replace(/<[^>]+>/g, ''); }

  // ---------------------------------------------------------------- Kapselungs-Puzzle
  R.kapsel = (box, st, e, ctx) => {
    let pi = st.phasen.findIndex(ph => !G.itemState(ph.id).ok);
    if (pi < 0) pi = st.phasen.length;
    let zustand = null, schritt = 0;

    const startPhase = () => {
      const ph = st.phasen[pi];
      zustand = { teile: ph.start.map(x => Object.assign({}, x)), bits: !!ph.startBits, fertig: false };
      schritt = 0;
    };

    const vis = () => {
      if (zustand.bits) return `<div class="bits">${'0110100101001110 1010011101010010 0100101010111010 '.repeat(3)}…</div><div class="small muted">(Signale auf der Leitung)</div>`;
      return `<div class="frame-vis">${zustand.teile.map(t => `<div class="${t.cls}">${esc(t.text)}</div>`).join('')}</div>`;
    };

    const draw = () => {
      if (pi >= st.phasen.length) {
        box.innerHTML = `<div class="card"><h2>${esc(st.titel)}</h2><div class="feedback ok"><b>Beide Richtungen gemeistert!</b><br>${st.abschluss || ''}</div>${weiterButton(ctx)}</div>`;
        ctx.fertig();
        $('#st-weiter', box).onclick = ctx.weiter;
        return;
      }
      const ph = st.phasen[pi];
      if (!zustand) startPhase();
      const opts = ph.optionen;
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>${esc(st.titel)}</h2><span class="task-count">Teil ${pi + 1} / ${st.phasen.length}</span></div>
        <h3>${esc(ph.titel)}</h3><div>${ph.text}</div>
        <div class="kapsel-stage">${vis()}</div>
        <div class="small muted" style="text-align:center;margin-bottom:8px">${zustand.fertig ? '' : `Schritt ${schritt + 1} von ${ph.korrekt.length}: Was passiert als Nächstes?`}</div>
        <div class="kapsel-opts">${zustand.fertig ? '' : opts.map(o => `<button class="opt" data-k="${o.key}" ${o.benutzt ? 'disabled' : ''}>${o.label}</button>`).join('')}</div>
        <div id="kfb"></div>
        <div id="khint"></div></div>`;
      box.querySelectorAll('.opt').forEach(b => b.onclick = () => klick(b.dataset.k, b));
      if (!zustand.fertig) hinweisBlock({ id: ph.id, hinweise: ph.hinweise }, $('#khint', box));
    };

    const klick = (k, el) => {
      const ph = st.phasen[pi];
      const o = ph.optionen.find(x => x.key === k);
      if (k === ph.korrekt[schritt]) {
        A.play('klick');
        if (o.wrap) { if (o.wrap.l) zustand.teile.unshift(o.wrap.l); if (o.wrap.r) zustand.teile.push(o.wrap.r); }
        if (o.unwrap) { zustand.teile.shift(); if (zustand.teile.length && zustand.teile[zustand.teile.length - 1].cls === 'fcs') zustand.teile.pop(); }
        if (o.bits === true) zustand.bits = true;
        if (o.bits === false) zustand.bits = false;
        if (o.ersetze) zustand.teile = o.ersetze.map(x => Object.assign({}, x));
        schritt++;
        if (schritt >= ph.korrekt.length) {
          zustand.fertig = true;
          const p = G.richtig(ph.id, ph.punkte || 20);
          draw();
          $('#kfb', box).innerHTML = `<div class="feedback ok"><b>✔ ${esc(ph.titel)} geschafft!</b> ${p ? `<span class="pt">+${p} P</span>` : ''}<br>${ph.erklaerung}</div><div class="btnrow"><button class="btn" id="k-next">Weiter ▸</button></div>`;
          $('#k-next', box).onclick = () => { pi++; zustand = null; draw(); };
          G.zeige($('#k-next', box));
        } else {
          draw();
          $('#kfb', box).innerHTML = `<div class="feedback ok">${o.ok || '✔ Richtig.'}</div>`;
        }
      } else {
        G.falsch(ph.id, k);
        if (el) { el.classList.add('wrong', 'shake'); setTimeout(() => { el.classList.remove('shake', 'wrong'); }, 600); }
        $('#kfb', box).innerHTML = `<div class="feedback bad"><b>✘ Nicht in dieser Reihenfolge.</b> ${o.falsch || ''}</div>`;
        G.zeige($('#kfb', box));
      }
    };
    draw();
  };

  // ---------------------------------------------------------------- Abschlussverhör (einzeln pro Kürzel, nur Diagnose)
  // Antworten liegen in save.verhoer[kürzel] = { start, ende, a: { frageId: { v, ok } } } – keine Punkte, keine Tipps, ein Versuch.
  // Antwortoptionen werden pro Person gemischt (stabil über Kürzel + Frage), damit Mitschauen weniger bringt.
  function stabilMischen(arr, schluessel) {
    let x = (parseInt(window.OSIStore.hash(schluessel).slice(0, 6), 36) % 2147483646) + 1;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { x = (x * 16807) % 2147483647; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  let verhoerPerson = null;
  R.verhoer = (box, st, e, ctx) => {
    const qs = st.verhoerFragen;
    const V = G.save.verhoer;
    const agenten = G.save.duo.agenten;
    const rec = k => V[k] || (V[k] = { start: null, ende: null, a: {} });
    const alleFertig = () => agenten.every(k => V[k] && V[k].ende);
    if (verhoerPerson && !agenten.includes(verhoerPerson)) verhoerPerson = null;

    const auswahl = () => {
      verhoerPerson = null;
      const fertig = alleFertig();
      if (fertig) { ctx.fertig(); if (st.abzeichen) G.abzeichen(st.abzeichen); }
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>${esc(st.titel)}</h2></div>
        ${st.intro || ''}
        <div class="verhoer-liste">${agenten.map(k => {
          const r = V[k];
          const n = r ? Object.values(r.a).filter(x => x.ok).length : 0;
          const status = r && r.ende ? `abgeschlossen · ${n} von ${qs.length} richtig` : r && r.start ? `begonnen · ${Object.keys(r.a).length} von ${qs.length} beantwortet` : 'noch nicht verhört';
          return `<div class="verhoer-person"><b>${esc(k)}</b><span class="muted small">${status}</span>
            ${r && r.ende ? '<span class="toc-ok">✓</span>' : `<button class="btn" data-k="${esc(k)}">${r && r.start ? 'Verhör fortsetzen ▸' : 'Verhör beginnen ▸'}</button>`}</div>`;
        }).join('')}</div>
        ${fertig ? `<div class="merk"><b>Alle Verhöre abgeschlossen.</b> Exportiert jetzt euren Spielstand und gebt die Datei bei eurer Lehrkraft ab – damit ist die Akte übergeben.</div>
          <div class="btnrow"><button class="btn" id="st-weiter">Zur Abschlussbesprechung ▸</button><button class="btn sec" id="vh-exp">⬇ Spielstand exportieren</button></div>` : ''}</div>`;
      box.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { verhoerPerson = b.dataset.k; A.play('klick'); frage(); window.scrollTo(0, 0); });
      if (fertig) { $('#vh-exp', box).onclick = G.exportieren; $('#st-weiter', box).onclick = ctx.weiter; }
    };

    const frage = () => {
      const k = verhoerPerson, r = rec(k);
      if (!r.start) { r.start = new Date().toISOString(); G.persist(); }
      const i = qs.findIndex(q => !r.a[q.id]);
      if (i < 0) return abschluss();
      const q = qs[i];
      const reihe = stabilMischen((q.optionen || []).map((o, j) => j), k + '|' + q.id);
      let opts;
      if (q.eingabe) opts = `<div class="eingabe-row"><input type="text" id="vh-in" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="${esc(q.platzhalter || 'Antwort eintippen')}"><button class="btn sec" id="vh-send">Absenden</button></div>`;
      else if (q.layer) opts = `<div class="triage-btns">${LAYER_OPTS.map(n => `<button data-v="${n}" style="background:${layerColor(n)}">L${n}</button>`).join('')}</div>`;
      else if (q.multi) opts = `<p class="small muted">Mehrere Antworten möglich.</p><div class="opts">${reihe.map(j => `<button class="opt" data-i="${j}">☐ ${q.optionen[j]}</button>`).join('')}</div><div class="btnrow"><button class="btn sec" id="vh-send">Absenden</button></div>`;
      else opts = `<div class="opts">${reihe.map(j => `<button class="opt" data-i="${j}">${q.optionen[j]}</button>`).join('')}</div>`;
      box.innerHTML = `<div class="card">
        <div class="task-head"><h2>🕵️ Verhör · ${esc(k)}</h2><span class="task-count">${i + 1} / ${qs.length}</span></div>
        <p class="small muted">Ein Versuch, keine Tipps, keine Punkte. Die Lösung seht ihr nach dem Absenden.</p>
        ${q.ticket ? `<div class="ticket"><div class="tno">${esc(q.ticketNr || 'Störungsmeldung')}</div>${q.ticket}</div>` : ''}
        ${q.kontext || ''}
        <div class="frage">${q.frage}</div><div id="vh-opts">${opts}
        <div class="btnrow" style="margin-top:10px"><button class="btn sec" id="vh-weissnicht">🤷 Weiß ich nicht</button></div></div><div id="vh-fb"></div></div>`;
      const area = $('#vh-opts', box);
      const absenden = (wert, ok, weissNicht) => {
        if (r.a[q.id]) return;
        r.a[q.id] = weissNicht ? { v: '?', ok: false, wn: true } : { v: String(wert), ok };
        if (qs.every(x => r.a[x.id])) r.ende = new Date().toISOString();
        G.persist();
        A.play(ok ? 'richtig' : weissNicht ? 'klick' : 'falsch');
        area.querySelectorAll('button, input').forEach(b => { b.disabled = true; });
        const loesung = q.eingabe ? [].concat(q.richtig)[0] : q.layer ? 'L' + [].concat(q.richtig)[0] : q.multi ? q.richtig.map(j => q.optionen[j]).join(' · ') : q.optionen[q.richtig];
        if (!q.eingabe && !q.layer) area.querySelectorAll('.opt').forEach(b => { if ([].concat(q.richtig).includes(+b.dataset.i)) b.classList.add('right'); });
        $('#vh-fb', box).innerHTML = `<div class="feedback ${ok ? 'ok' : weissNicht ? 'neutral' : 'bad'}"><b>${ok ? '✔ Richtig.' : weissNicht ? '🤷 Ehrlich – gut so.' : '✘ Nicht richtig.'}</b> ${ok ? '' : `Richtig wäre: <b>${loesung}</b>. `}${q.erklaerung || ''}</div>
          <div class="btnrow"><button class="btn" id="vh-next">${r.ende ? 'Verhör abschließen ▸' : 'Nächste Frage ▸'}</button></div>`;
        $('#vh-next', box).onclick = () => { frage(); window.scrollTo(0, 0); };
        G.zeige($('#vh-next', box));
      };
      $('#vh-weissnicht', box).onclick = () => absenden(null, false, true);
      if (q.eingabe) {
        const inp = $('#vh-in', box);
        const go = () => { const roh = inp.value.trim(); if (!roh) return; const n = normAntwort(roh, q.eingabe); absenden(n, [].concat(q.richtig).some(x => normAntwort(x, q.eingabe) === n)); };
        $('#vh-send', box).onclick = go;
        inp.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } };
      } else if (q.layer) {
        area.querySelectorAll('.triage-btns button').forEach(b => { b.onclick = () => absenden(b.dataset.v, [].concat(q.richtig).map(String).includes(b.dataset.v)); });
      } else if (q.multi) {
        const sel = new Set();
        area.querySelectorAll('.opt').forEach(b => { b.onclick = () => { const j = +b.dataset.i; if (sel.has(j)) { sel.delete(j); b.classList.remove('sel'); b.innerHTML = '☐ ' + q.optionen[j]; } else { sel.add(j); b.classList.add('sel'); b.innerHTML = '☑ ' + q.optionen[j]; } }; });
        $('#vh-send', box).onclick = () => { if (!sel.size) return; const soll = new Set(q.richtig); absenden([...sel].sort().join('+'), sel.size === soll.size && [...sel].every(j => soll.has(j))); };
      } else {
        area.querySelectorAll('.opt').forEach(b => { b.onclick = () => absenden(b.dataset.i, +b.dataset.i === q.richtig); });
      }
    };

    const abschluss = () => {
      const k = verhoerPerson, r = rec(k);
      const BER = ['Modell', 'L1', 'L2', 'L3', 'L4', 'L5–7'];
      const bereiche = [...new Set(qs.map(q => q.bereich))].sort((a, b) => BER.indexOf(a) - BER.indexOf(b));
      const zeilen = bereiche.map(bz => {
        const f = qs.filter(q => q.bereich === bz);
        const n = f.filter(q => r.a[q.id] && r.a[q.id].ok).length;
        return `<tr><td>${esc(bz)}</td><td class="num">${n} / ${f.length}</td><td>${n === f.length ? '✔ sicher' : n ? 'teilweise – nochmal anschauen' : '✘ nochmal anschauen'}</td></tr>`;
      }).join('');
      const n = qs.filter(q => r.a[q.id] && r.a[q.id].ok).length;
      const lob = n >= qs.length - 1 ? 'Saubere Arbeit – so sicher wünsche ich mir das in der ganzen Einheit.'
        : n >= qs.length * 0.6 ? 'Solide Arbeit. Die paar Stellen, die noch wackeln, schauen Sie sich in Ruhe noch einmal an.'
        : 'Danke für die ehrlichen Antworten – die sind mir lieber als geratene. Jetzt wissen wir genau, wo wir ansetzen.';
      A.play('abzeichen');
      box.innerHTML = `<div class="card summary"><div class="mono hl">VERHÖR ${esc(k)} ABGESCHLOSSEN</div><h2>${n} von ${qs.length} richtig</h2>
        <div style="text-align:left">${dialogHtml({ wer: 'direktorin', text: `Danke, ${esc(k)}. Sie haben diesen Fall von L1 bis L7 mitgetragen. ${lob}` })}</div>
        ${(() => { const wn = qs.filter(q => r.a[q.id] && r.a[q.id].wn).length; return wn ? `<p class="small muted">Davon ${wn}× „Weiß ich nicht“ – ehrlich ist besser als geraten.</p>` : ''; })()}
        <p class="muted">Das ist keine Note. Es zeigt euch und eurer Lehrkraft, wo ihr sicher seid – und was ihr euch nochmal anschauen solltet, z. B. mit „Nochmal üben“ in den Einsätzen.</p>
        <table class="t" style="max-width:520px;margin:0 auto;text-align:left">${zeilen}</table>
        <div class="btnrow" style="justify-content:center"><button class="btn" id="vh-back">Zurück zur Übersicht ▸</button></div></div>`;
      $('#vh-back', box).onclick = () => { auswahl(); window.scrollTo(0, 0); };
    };

    if (verhoerPerson) frage(); else auswahl();
  };

  // ---------------------------------------------------------------- Abschluss mit Ernennungsurkunde (letzter Schritt des Spiels)
  function konfetti() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const w = document.createElement('div');
    w.className = 'konfetti';
    const farben = ['var(--orange)', '#7fd6e8', 'var(--ok)', '#f2e9d8'];
    w.innerHTML = Array.from({ length: 90 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${farben[i % farben.length]};animation-delay:${(Math.random() * 1.2).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 1.8).toFixed(2)}s;transform:rotate(${Math.round(Math.random() * 360)}deg)"></i>`).join('');
    document.body.appendChild(w);
    setTimeout(() => w.remove(), 5000);
  }
  // Eigenes A4-Druckblatt (genau eine Seite): wird nur zum Drucken an <body> gehängt, sonst ist alles andere ausgeblendet
  function urkundeDruckblatt(d) {
    document.querySelectorAll('.druckblatt').forEach(x => x.remove());
    const el = document.createElement('div');
    el.className = 'druckblatt';
    el.innerHTML = `<div class="db-rahmen">
      <div class="db-kopf">EINHEIT 7 · ABTEILUNG FÜR NETZWERKFORENSIK</div>
      <div class="db-titel">Ernennungsurkunde</div>
      <div class="db-linie"></div>
      <div class="db-klein">Das Agenten-Duo</div>
      <div class="db-name">${esc(d.codename)}</div>
      <div class="db-kuerzel">${d.agenten.map(esc).join(' &amp; ')}</div>
      <p class="db-text">hat die <b>Operation „Lohnzettel“</b> aufgeklärt – Spur für Spur, von L1 bis L7 –,<br>den Täter überführt und drei Verdächtige entlastet.<br>In Anerkennung dieser Leistung wird dem Duo die Freigabestufe</p>
      <div class="db-rang">${esc(d.rang)}</div>
      <div class="db-klein">verliehen.</div>
      <div class="db-werte"><div><b>${d.punkte}</b><span>Punkte</span></div><div><b>${d.akten}</b><span>Akten aufgeklärt</span></div><div><b>${d.abzeichen.length}</b><span>Abzeichen</span></div></div>
      <div class="db-abz">${d.abzeichen.map(b => `<span>${b.icon} ${esc(b.name)}</span>`).join('')}</div>
      <div class="db-fuss"><div><div class="db-unterschrift">${esc(d.datum)}</div><span>Datum</span></div><div class="db-siegel">E7</div><div><div class="db-unterschrift"><i>Albers</i></div><span>Direktorin Albers, Einheit 7</span></div></div>
    </div>`;
    document.body.appendChild(el);
    document.body.classList.add('druck-urkunde');
    const weg = () => { el.remove(); document.body.classList.remove('druck-urkunde'); window.removeEventListener('afterprint', weg); };
    window.addEventListener('afterprint', weg);
    return el;
  }
  G.urkundeDruckblatt = urkundeDruckblatt;

  R.urkunde = (box, st, e, ctx) => {
    ctx.fertig();
    if (st.abzeichen) G.abzeichen(st.abzeichen);
    const { r } = G.rang();
    const p = G.punkte();
    const ab = OSI.abzeichen.filter(b => G.save.badges[b.id]).length;
    const fall = OSI.einsaetze.filter(x => !x.diagnose && x.steps.length);
    const aufgeklaert = fall.filter(x => G.einsatzFertig(x)).length;
    const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
    box.innerHTML = `<div class="card">
      ${st.bild ? `<img class="scene-img" src="img/${st.bild}" alt="">` : ''}
      <h2>${esc(st.titel)}</h2>
      ${st.szenen.map(dialogHtml).join('')}
      <div class="urkunde">
        <div class="uk-kopf">EINHEIT 7 · ABTEILUNG FÜR NETZWERKFORENSIK</div>
        <div class="uk-titel">Ernennungsurkunde</div>
        <p>Das Agenten-Duo</p>
        <div class="uk-name">${esc(G.save.duo.codename)}</div>
        <div class="uk-kuerzel">${G.save.duo.agenten.map(esc).join(' &amp; ')}</div>
        <p>hat die <b>Operation „Lohnzettel“</b> aufgeklärt – Spur für Spur, von L1 bis L7 –,<br>den Täter überführt und drei Verdächtige entlastet.</p>
        <div class="uk-werte"><div><b>${esc(r.name)}</b><span>Freigabestufe</span></div><div><b>${p}</b><span>Punkte</span></div><div><b>${aufgeklaert} / ${fall.length}</b><span>Akten aufgeklärt</span></div><div><b>${ab}</b><span>Abzeichen</span></div></div>
        <div class="uk-fuss"><span>${esc(datum)}</span><span class="uk-gez">gez. Direktorin Albers</span></div>
        <div class="uk-siegel">E7</div>
      </div>
      <div class="btnrow" style="justify-content:center"><button class="btn" id="uk-exp">⬇ Spielstand exportieren</button><button class="btn sec" id="uk-druck">🖨 Urkunde drucken</button><button class="btn sec" id="en-hub">Zu den Einsatzakten</button></div></div>`;
    bindEggs(box);
    A.play('rang');
    konfetti();
    $('#uk-exp', box).onclick = G.exportieren;
    $('#uk-druck', box).onclick = () => {
      urkundeDruckblatt({ codename: G.save.duo.codename, agenten: G.save.duo.agenten, rang: r.name, punkte: p, akten: `${aufgeklaert} / ${fall.length}`, datum, abzeichen: OSI.abzeichen.filter(b => G.save.badges[b.id]) });
      window.print();
    };
    $('#en-hub', box).onclick = () => { G.save.pos = null; G.persist(); G.render(); };
  };

  // ---------------------------------------------------------------- Außeneinsatz (versiegelt)
  // Blockiert den Fortschritt nicht (bonus: true). Mit `fragen` wird der freigegebene Außeneinsatz zum Quiz mit dem Auftrag als Intro.
  const AUSSEN_TAG = '<div class="tag mono hl">★ AUSSENEINSATZ</div><p class="small muted">Der Einsatz blockiert den Fortschritt nicht, er kann daher später nachgeholt werden.</p>';
  R.sealed = (box, st, e, ctx) => {
    const frei = G.save.unlocked.alle || G.save.unlocked[st.id];
    if (frei && st.fragen) return R.quiz(box, Object.assign({}, st, { intro: AUSSEN_TAG + (st.inhalt || '') }), e, ctx);
    box.innerHTML = `<div class="card ${frei ? '' : 'sealed'}">
      ${AUSSEN_TAG}
      <h2>${esc(st.titel)}</h2>
      ${frei ? (st.inhalt || '<p>Die Unterlagen für diesen Außeneinsatz bekommt ihr von eurer Lehrkraft.</p>') : `<p>${st.teaser}</p>
      <div class="merk"><b>🔒 Versiegelt.</b> Diese Akte wird von der Zentrale freigegeben, sobald die Einsatzunterlagen bereitliegen.</div>`}
      <div class="btnrow"><button class="btn" id="st-weiter">Weiter ▸</button></div></div>`;
    $('#st-weiter', box).onclick = () => G.naechsterStep(e, st);
  };

  // ---------------------------------------------------------------- Einsatz-Ende
  R.ende = (box, st, e, ctx) => {
    ctx.fertig();
    if (st.abzeichen) G.abzeichen(st.abzeichen);
    const items = [];
    e.steps.forEach(s => { (s.fragen || []).forEach(q => items.push(q.id)); (s.items || []).forEach(q => items.push(q.id)); (s.phasen || []).forEach(q => items.push(q.id)); });
    const states = items.map(id => G.save.items[id]).filter(Boolean);
    const p = states.reduce((a, it) => a + (it.p || 0), 0);
    const ersteVersuch = states.filter(it => it.ok && it.f === 0).length;
    const tipps = states.reduce((a, it) => a + (it.h || 0), 0);
    if (st.abzeichenOhneTipp && tipps === 0 && states.length) G.abzeichen(st.abzeichenOhneTipp);
    const { r } = G.rang();
    box.innerHTML = `<div class="card summary">
      <div class="mono hl">${esc(e.nrText)} ABGESCHLOSSEN</div>
      <h2>${esc(st.titel)}</h2>
      <div>${st.text}</div>
      <div class="grid2" style="margin:18px 0">
        <div><div class="big">${p}</div><div class="muted">Punkte in diesem Einsatz</div></div>
        <div><div class="big">${esc(r.name)}</div><div class="muted">eure Freigabestufe</div></div>
      </div>
      <p class="muted">${ersteVersuch} von ${items.length} Aufgaben beim ersten Versuch gelöst · ${tipps} Tipp${tipps === 1 ? '' : 's'} genutzt</p>
      <div class="merk" style="text-align:left"><b>Wichtig:</b> Exportiert jetzt euren Spielstand und schickt die Datei an die andere Person eures Duos. Am Stundenende gebt ihr sie bei eurer Lehrkraft ab.</div>
      <div class="btnrow" style="justify-content:center"><button class="btn" id="en-exp">⬇ Spielstand exportieren</button><button class="btn sec" id="en-hub">Zu den Einsatzakten</button></div></div>`;
    $('#en-exp', box).onclick = G.exportieren;
    $('#en-hub', box).onclick = () => { G.save.pos = null; G.persist(); G.render(); };
  };

  // ---------------------------------------------------------------- Zeit-Challenge
  // Immer nur ein Lauf aktiv: Wer die Challenge verlässt oder neu startet, beendet den alten Lauf (Zeitschleife + Tastatur).
  let chLauf = 0;
  const CH_PAUSE = 2500; // nach einem Fehler steht die Uhr so lange, damit man die richtige Schicht lesen kann
  G.challenge = {
    start() {
      const C = OSI.challenge;
      const lauf = ++chLauf;
      let pool = shuffle(C.pool), idx = 0, score = 0, fehler = 0, ende = Date.now() + C.sekunden * 1000, pause = false, timer = null;
      G.view = 'challenge';
      const app = $('#app');
      const aktiv = () => lauf === chLauf && G.view === 'challenge' && document.getElementById('ch-item');
      const stopp = () => { clearTimeout(timer); document.removeEventListener('keydown', key); };
      const prozent = () => Math.max(0, Math.min(100, (ende - Date.now()) / (C.sekunden * 10)));
      const draw = () => {
        const it = pool[idx % pool.length];
        app.innerHTML = `<div class="card"><div class="ch-top"><span>⏱️ Zeit-Challenge</span><span>Richtige: <b class="hl" id="ch-s">${score}</b> · Fehler: ${fehler}</span></div>
          <div class="timebar"><i id="ch-t" style="width:${prozent()}%"></i></div>
          <div class="ch-item" id="ch-item">${esc(it.t)}</div>
          <div class="ch-btns">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button data-l="${n}" style="background:${layerColor(n)}">L${n}</button>`).join('')}</div>
          <p class="small muted" style="margin-top:10px" id="ch-hint">Tastatur: Zifferntasten 1–7</p></div>`;
        app.querySelectorAll('.ch-btns button').forEach(b => b.onclick = () => antwort(+b.dataset.l));
      };
      const antwort = n => {
        if (pause || !aktiv()) return;
        const it = pool[idx % pool.length];
        if (n === it.l) { score++; A.play('klick'); idx++; draw(); return; }
        // Fehler: Uhr anhalten, richtige Schicht zeigen, danach mit derselben Restzeit weiter
        fehler++; A.play('falsch'); pause = true;
        const rest = ende - Date.now();
        clearTimeout(timer);
        $('#ch-item').innerHTML = `${esc(it.t)} → <span style="color:${layerColor(it.l)}">L${it.l}</span>`;
        $('#ch-hint').innerHTML = '⏸ Uhr angehalten – gleich geht es weiter.';
        app.querySelectorAll('.ch-btns button').forEach(b => { b.disabled = true; if (+b.dataset.l === n) b.style.opacity = '.35'; });
        setTimeout(() => {
          if (lauf !== chLauf || G.view !== 'challenge') return;
          pause = false; idx++; ende = Date.now() + rest;
          draw(); tick();
        }, CH_PAUSE);
      };
      const key = ev => { if (ev.key >= '1' && ev.key <= '7') antwort(+ev.key); };
      document.addEventListener('keydown', key);
      const tick = () => {
        clearTimeout(timer);
        if (lauf !== chLauf || G.view !== 'challenge') return stopp();
        if (pause) return;
        const t = $('#ch-t'); if (t) t.style.width = prozent() + '%';
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
        app.innerHTML = `<div class="card summary"><h2>Zeit abgelaufen!</h2><div><span class="big">${score}</span> <span class="muted" style="font-size:1.2rem">Richtige</span></div><div class="muted">${fehler} Fehler</div>
          ${rekord ? '<p class="hl"><b>🏆 Neuer Rekord!</b></p>' : `<p class="muted">Euer Rekord: ${ch.best} Richtige</p>`}
          <div class="btnrow" style="justify-content:center"><button class="btn" id="ch-again">Nochmal</button><button class="btn sec" id="ch-back">Zurück</button></div></div>`;
        $('#ch-again').onclick = () => G.challenge.start();
        $('#ch-back').onclick = () => G.render();
      };
      G.renderTopbarSafe && G.renderTopbarSafe();
      draw(); tick();
    }
  };
})();
