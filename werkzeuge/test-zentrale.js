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
  await sleep(1200);
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
