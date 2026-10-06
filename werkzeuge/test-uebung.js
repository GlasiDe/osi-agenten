// Prüft den Übungsmodus: Wiederholen darf Punkte/gewertete Ergebnisse nie verändern,
// fehlerfreies Üben vergibt ⭐, Export/Import erhält die Übungsdaten.
const { browser, seite, klick, sleep } = require('./lib');

(async () => {
  const b = await browser();
  const p = await seite(b, 'spiel/index.html');
  const fehler = [];
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(300);
  await p.type('#st-code', 'Uebung'); await p.type('#st-k1', 'U1'); await klick(p, '#st-neu'); await sleep(300);
  const E = await p.evaluate(() => OSI.einsaetze[0].id);
  const S = await p.evaluate(() => OSI.einsaetze[0].steps.find(s => s.type === 'quiz' && s.fragen.every(q => !q.pick && !q.multi && !q.layer)).id);
  await p.evaluate((e, s) => { OSIGame.teacher = true; OSIGame.gotoStep(e, s); }, E, S); await sleep(200);
  const richtige = await p.evaluate(s => OSI.einsaetze[0].steps.find(x => x.id === s).fragen.map(q => q.richtig), S);
  const loese = async falschZuerst => {
    for (let i = 0; i < richtige.length; i++) {
      if (falschZuerst && i === 0) { await klick(p, `.opt[data-i="${richtige[0] === 0 ? 1 : 0}"]`); await sleep(40); }
      await klick(p, `.opt[data-i="${richtige[i]}"]`); await sleep(40); await klick(p, '#q-next'); await sleep(60);
    }
  };
  await loese(true);
  const vorher = await p.evaluate(() => ({ pkt: OSIGame.punkte(), items: JSON.stringify(OSIGame.save.items) }));
  await p.evaluate((e, s) => OSIGame.gotoStep(e, s), E, S); await sleep(200);
  await klick(p, '#ub-start'); await sleep(200);
  await loese(true); await sleep(150);
  let r = await p.evaluate(s => ({ pkt: OSIGame.punkte(), items: JSON.stringify(OSIGame.save.items), u: OSIGame.save.uebung[s] }), S);
  if (r.pkt !== vorher.pkt || r.items !== vorher.items) fehler.push('Übung mit Fehler hat den gewerteten Stand verändert');
  if (!r.u || r.u.runs !== 1 || r.u.gemeistert) fehler.push('Übung mit Fehler falsch protokolliert: ' + JSON.stringify(r.u));
  await klick(p, '#ub-again'); await sleep(200);
  await loese(false); await sleep(150);
  r = await p.evaluate(s => ({ pkt: OSIGame.punkte(), u: OSIGame.save.uebung[s], rt: (() => { const d = OSIStore.decode(OSIStore.encode(OSIGame.save)); return d.ok && !!d.save.uebung[s].gemeistert; })() }), S);
  if (r.pkt !== vorher.pkt) fehler.push('Fehlerfreie Übung hat Punkte verändert');
  if (!r.u.gemeistert || r.u.runs !== 2) fehler.push('Fehlerfreie Übung nicht als gemeistert erkannt');
  if (!r.rt) fehler.push('Übungsdaten gehen beim Export/Import verloren');
  fehler.push(...p.fehler);
  await b.close();
  if (fehler.length) { console.log('❌ ÜBUNGSMODUS FEHLGESCHLAGEN:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log(`✅ Übungsmodus bestanden (geprüft an ${S})`);
})().catch(e => { console.error('❌ TESTFEHLER', e); process.exit(1); });
