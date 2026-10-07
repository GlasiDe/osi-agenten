// Prüft die Einsatzzentrale mit simulierten Duos (inkl. Duplikat und manipulierter Datei)
// und legt Screenshots der drei Ansichten in werkzeuge/shots ab.
const { browser, seite, klick, sleep, shot } = require('./lib');

(async () => {
  const b = await browser();
  const p = await seite(b, 'lehrkraft/einsatzzentrale.html', 1400, 900);
  const fehler = [];
  const ergebnis = await p.evaluate(async () => {
    const OSI = window.OSI, S = window.OSIStore;
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const mk = (name, ag, anteil, quote) => {
      const s = S.migrate({ schema: 1, id: 'id-' + name, version: OSI.version, erstellt: new Date().toISOString(), aktualisiert: new Date().toISOString(), duo: { codename: name, agenten: ag }, pos: null, items: {}, steps: {} });
      const steps = OSI.einsaetze.flatMap(e => e.steps.map(st => ({ e, st })));
      const n = Math.round(steps.length * anteil);
      steps.slice(0, n).forEach(({ st }) => {
        s.steps[st.id] = new Date().toISOString();
        [...(st.fragen || []), ...(st.items || []), ...(st.phasen || [])].forEach(q => {
          const f = rnd() < quote ? 1 : 0;
          s.items[q.id] = { ok: true, f, h: 0, p: f ? 5 : 10, w: f ? ['1'] : [], t: new Date().toISOString() };
        });
      });
      if (steps[n]) s.pos = { e: steps[n].e.id, s: steps[n].st.id };
      s.uebung = { x: { runs: 2, gemeistert: new Date().toISOString() } };
      const vq = (OSI.einsaetze.find(e => e.id === 'verhoer').steps.find(x => x.verhoerFragen) || {}).verhoerFragen || [];
      if (anteil === 1) ag.forEach(k => { const a = {}; vq.forEach(q => { const ok = rnd() > quote; a[q.id] = ok ? { v: String([].concat(q.richtig)[0]), ok } : rnd() < .5 ? { v: '?', ok: false, wn: true } : { v: '1', ok }; }); s.verhoer[k] = { start: new Date(Date.now() - 9 * 6e4).toISOString(), ende: new Date().toISOString(), a }; });
      return s;
    };
    const saves = [mk('Nachtfalke', ['MK', 'JS'], 1, .2), mk('Kupferdraht', ['AB', 'CD'], .6, .4), mk('Paketdienst', ['EF'], .3, .6)];
    const files = saves.map(s => new File([S.encode(s)], S.dateiname(s)));
    const dup = JSON.parse(JSON.stringify(saves[2])); dup.aktualisiert = new Date(Date.now() - 864e5).toISOString();
    files.push(new File([S.encode(dup)], 'duplikat.osiagent'));
    files.push(new File([S.encode(saves[1]).replace('.', '.X')], 'manipuliert.osiagent'));
    await window.OSIZentrale.laden(files);
    return { duos: window.OSIZentrale.duos.size, abgelehnt: document.querySelectorAll('#filelist .bad').length };
  });
  if (ergebnis.duos !== 3) fehler.push(`Erwartet 3 Duos (Duplikat zusammengeführt), gefunden ${ergebnis.duos}`);
  if (ergebnis.abgelehnt !== 1) fehler.push('Manipulierte Datei wurde nicht abgelehnt');
  await sleep(2600);
  // Karte (Standard-Reiter) startet mit der Weltkarte: je Duo eine Figur an der Station seines Einsatzes
  const welt = await p.evaluate(() => {
    const P = OSIKit.progress;
    const pins = [...document.querySelectorAll('.map-pin')];
    const falsch = [...OSIZentrale.duos.values()].filter(d => {
      const f = P.front(d.save), pin = pins.find(x => x.querySelector('.map-tag').textContent === d.save.duo.codename);
      if (!pin) return true;
      const ziel = f ? document.querySelector(`.map-station[data-e="${f.e.id}"]`) : document.querySelector('.map-ziel');
      const a = pin.getBoundingClientRect(), b = ziel.getBoundingClientRect();
      return Math.abs((a.left + a.width / 2) - (b.left + b.width / 2)) > 60;
    }).map(d => d.save.duo.codename);
    return { stationen: document.querySelectorAll('.map-station').length, pins: pins.length, falsch };
  });
  if (welt.stationen !== 8) fehler.push(`Weltkarte zeigt ${welt.stationen} statt 8 Stationen`);
  if (welt.pins !== 3 || welt.falsch.length) fehler.push(`Weltkarte: ${welt.pins} Figuren, falsch platziert: ${welt.falsch.join(', ')}`);
  await p.screenshot({ path: shot('zentrale_welt'), fullPage: true });
  // Einsatz-Ansicht: nur die Duos, die gerade in diesem Einsatz sind
  const ein = await p.evaluate(async () => {
    const P = OSIKit.progress, d = [...OSIZentrale.duos.values()].find(x => P.front(x.save));
    const sel = document.querySelector('#zk-einsatz'); sel.value = P.front(d.save).e.id; sel.dispatchEvent(new Event('change'));
    await new Promise(r => setTimeout(r, 300));
    const soll = [...OSIZentrale.duos.values()].filter(x => P.front(x.save) && P.front(x.save).e.id === sel.value).length;
    return { soll, ist: document.querySelectorAll('.map-pin').length, knoten: document.querySelectorAll('.map-knoten').length, schritte: P.einsatz(sel.value).steps.length };
  });
  if (ein.ist !== ein.soll || ein.knoten !== ein.schritte) fehler.push(`Einsatz-Ansicht: ${ein.ist}/${ein.soll} Figuren, ${ein.knoten}/${ein.schritte} Knoten`);
  await klick(p, '[data-ansicht="alle"]'); await sleep(3800);
  // Alle Schritte: je Duo eine Figur mit Namensschild am nächsten offenen Schritt
  const karte = await p.evaluate(() => {
    const pins = [...document.querySelectorAll('.map-pin')];
    const P = OSIKit.progress;
    const soll = [...OSIZentrale.duos.values()].map(d => { const f = P.front(d.save); return { name: d.save.duo.codename, ziel: f ? f.st.id : null }; });
    const knoten = id => document.querySelector(`.map-knoten[data-step="${id}"]`);
    const falsch = soll.filter(x => {
      const pin = pins.find(p => p.querySelector('.map-tag').textContent === x.name);
      if (!pin) return true;
      if (!x.ziel) return false;
      const a = pin.getBoundingClientRect(), b = knoten(x.ziel).getBoundingClientRect();
      return Math.abs((a.left + a.width / 2) - (b.left + b.width / 2)) > 40 || a.bottom < b.top - 20 || a.bottom > b.bottom;
    }).map(x => x.name);
    return { pins: pins.length, knoten: document.querySelectorAll('.map-knoten').length, schritte: OSI.einsaetze.reduce((a, e) => a + e.steps.length, 0), falsch };
  });
  if (karte.pins !== 3) fehler.push(`Karte zeigt ${karte.pins} statt 3 Figuren`);
  if (karte.knoten !== karte.schritte) fehler.push(`Karte hat ${karte.knoten} Knoten für ${karte.schritte} Schritte`);
  if (karte.falsch.length) fehler.push('Figur steht nicht an ihrem Schritt: ' + karte.falsch.join(', '));
  await p.screenshot({ path: shot('zentrale_karte'), fullPage: true });
  await klick(p, '[data-tab="beamer"]'); await sleep(600);
  await p.screenshot({ path: shot('zentrale_beamer'), fullPage: true });
  await klick(p, '[data-tab="duos"]'); await p.screenshot({ path: shot('zentrale_duos'), fullPage: true });
  await klick(p, '[data-tab="aufgaben"]'); await p.screenshot({ path: shot('zentrale_aufgaben'), fullPage: false });
  await klick(p, '[data-tab="verhoer"]'); await sleep(200);
  const vz = await p.$$eval('#vh-personen tr[data-k]', r => r.length);
  if (vz !== 2) fehler.push(`Verhör-Reiter zeigt ${vz} statt 2 verhörte Personen`);
  await p.screenshot({ path: shot('zentrale_verhoer'), fullPage: true });
  fehler.push(...p.fehler);
  await b.close();
  if (fehler.length) { console.log('❌ ZENTRALE FEHLGESCHLAGEN:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log('✅ Einsatzzentrale bestanden');
})().catch(e => { console.error('❌ TESTFEHLER', e); process.exit(1); });
