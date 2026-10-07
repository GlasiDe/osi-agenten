/* OSI-Agenten – simuliertes Terminal (Windows-Eingabeaufforderung): freies Tippen, Tab-Ergänzung, ↑-Verlauf, Spickzettel. */
(function () {
  'use strict';
  const G = window.OSIGame, A = window.OSIAudio, Kit = window.OSIKit;
  const { esc } = Kit.util;

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
})();
