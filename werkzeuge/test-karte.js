// Prüft Kletterkarte und Figuren im Spiel: Figurenwahl beim Anlegen, Knoten = Schritte, aktueller Knoten = Front,
// gesperrte Knoten führen nirgends hin, die eigene Figur steht an der Front, Figur ändern (ohne Export-Hinweis),
// alte Spielstände ohne Figur bekommen eine feste Figur, Hell/Dunkel. Screenshots in werkzeuge/shots.
const { browser, seite, klick, sleep, shot } = require('./lib');

(async () => {
  const b = await browser();
  const p = await seite(b, 'spiel/index.html');
  const fehler = [];
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(300);

  // ---- Figurenwahl beim Anlegen
  const anzahl = await p.$$eval('#st-avatar .av-wahl', x => x.length);
  if (anzahl !== 15) fehler.push(`Figurenwahl zeigt ${anzahl} statt 15 Figuren`);
  if ((await p.$$eval('#st-avatar [aria-checked="true"]', x => x.length)) !== 1) fehler.push('Beim Start ist nicht genau eine Figur vorausgewählt');
  await klick(p, '#st-avatar [data-av="a07"]');
  await p.type('#st-code', 'Kartentest'); await p.type('#st-k1', 'KT');
  await klick(p, '#st-neu'); await sleep(300);
  if ((await p.evaluate(() => OSIGame.save.duo.avatar)) !== 'a07') fehler.push('Gewählte Figur wird nicht gespeichert');

  // ---- Weltkarte: eine Station je Einsatz, Figur an der Station der Front
  await p.evaluate(() => OSIGame.zurKarte()); await sleep(600);
  const w = await p.evaluate(() => ({
    stationen: document.querySelectorAll('.map-station').length,
    einsaetze: OSIKit.progress.sichtbar(false).length,
    cur: [...document.querySelectorAll('.map-station.is-cur')].map(x => x.dataset.e),
    gesperrt: document.querySelectorAll('.map-station.is-locked').length,
    front: OSIKit.progress.front(OSIGame.save)
  }));
  if (w.stationen !== w.einsaetze) fehler.push(`Weltkarte hat ${w.stationen} Stationen für ${w.einsaetze} Einsätze`);
  if (w.cur.length !== 1 || w.cur[0] !== w.front.e.id) fehler.push(`Aktuelle Station ${w.cur} statt ${w.front.e.id}`);
  if (!w.gesperrt) fehler.push('Keine gesperrten Stationen auf einer neuen Weltkarte');
  const figurAn = async sel => p.evaluate(s => {
    const pin = document.querySelector('.map-pin.is-ich'), n = document.querySelector(s);
    if (!pin || !n) return false;
    const a = pin.getBoundingClientRect(), c = n.getBoundingClientRect();
    return Math.abs((a.left + a.width / 2) - (c.left + c.width / 2)) < 12 && a.bottom >= c.top - 4 && a.bottom <= c.bottom;
  }, sel);
  if (!(await figurAn(`.map-station[data-e="${w.front.e.id}"]`))) fehler.push('Eigene Figur steht nicht an der aktuellen Station');
  if ((await p.$eval('.map-pin.is-ich [data-av]', el => el.dataset.av)) !== 'a07') fehler.push('Auf der Karte steht die falsche Figur');
  await p.screenshot({ path: shot('karte_welt'), fullPage: false });
  await klick(p, '.map-station.is-locked'); await sleep(150);
  if (!(await p.$('.map-pop:not(.hidden)'))) fehler.push('Gesperrte Station zeigt keinen Hinweis');
  if (await p.evaluate(() => OSIGame.kartenEinsatz)) fehler.push('Gesperrte Station öffnet einen Einsatz');

  // ---- Station öffnen → Pfad des Einsatzes
  await klick(p, '.map-station.is-cur'); await sleep(150);
  await klick(p, '#map-open'); await sleep(500);
  const k = await p.evaluate(() => ({
    e: OSIGame.kartenEinsatz,
    knoten: document.querySelectorAll('.map-knoten').length,
    schritte: OSI.einsaetze.find(x => x.id === OSIGame.kartenEinsatz).steps.length,
    cur: [...document.querySelectorAll('.map-knoten.is-cur')].map(x => x.dataset.step),
    gesperrt: document.querySelectorAll('.map-knoten.is-locked').length,
    front: OSIKit.progress.front(OSIGame.save).st.id
  }));
  if (k.e !== w.front.e.id) fehler.push(`„Pfad öffnen“ zeigt ${k.e} statt ${w.front.e.id}`);
  if (k.knoten !== k.schritte) fehler.push(`Einsatz-Pfad hat ${k.knoten} Knoten für ${k.schritte} Schritte`);
  if (k.cur.length !== 1 || k.cur[0] !== k.front) fehler.push(`Aktueller Knoten ${k.cur} statt ${k.front}`);
  if (!k.gesperrt) fehler.push('Keine gesperrten Knoten im neuen Einsatz-Pfad');
  if (!(await figurAn(`.map-knoten[data-step="${k.front}"]`))) fehler.push('Eigene Figur steht nicht am aktuellen Knoten');
  await p.screenshot({ path: shot('karte_einsatz'), fullPage: false });

  // gesperrter Knoten: nur Hinweis, keine Navigation
  await klick(p, '.map-knoten.is-locked'); await sleep(150);
  if (await p.evaluate(() => OSIGame.save.pos)) fehler.push('Gesperrter Knoten öffnet einen Schritt');
  if (!(await p.$('.map-pop:not(.hidden)'))) fehler.push('Gesperrter Knoten zeigt keinen Hinweis');
  // aktueller Knoten: Sprechblase → Start → ✕ führt zurück auf den Einsatz-Pfad
  await klick(p, '.map-knoten.is-cur'); await sleep(150);
  await klick(p, '#map-go'); await sleep(200);
  if ((await p.evaluate(() => OSIGame.save.pos && OSIGame.save.pos.s)) !== k.front) fehler.push('Start in der Sprechblase öffnet nicht den aktuellen Schritt');
  await klick(p, '#cr-hub'); await sleep(300);
  if ((await p.evaluate(() => OSIGame.kartenEinsatz)) !== k.e || !(await p.$('.karte-kopf'))) fehler.push('✕ im Schritt führt nicht zurück auf den Einsatz-Pfad');
  await klick(p, '#karte-welt'); await sleep(300);
  if (!(await p.$('.map-station'))) fehler.push('„◂ Weltkarte“ führt nicht zur Weltkarte');

  // ---- Fortschritt: E0 erledigt → Figur läuft auf der Weltkarte zur nächsten Station
  await p.evaluate(() => {
    const G = OSIGame, now = new Date().toISOString();
    OSI.einsaetze[0].steps.forEach(st => { G.save.steps[st.id] = now; [...(st.fragen || []), ...(st.items || []), ...(st.phasen || [])].forEach(q => { G.save.items[q.id] = { ok: true, f: 0, h: 0, p: 10, w: [] }; }); });
    G.persist(); G.zurKarte();
  });
  await sleep(2200);
  const neu = await p.evaluate(() => ({ front: OSIKit.progress.front(OSIGame.save), cur: document.querySelector('.map-station.is-cur').dataset.e, fertig: [...document.querySelectorAll('.map-station.is-done')].map(x => x.dataset.e) }));
  if (neu.cur !== 'e1' || neu.front.e.id !== 'e1') fehler.push(`Nach E0 steht die Front auf ${neu.front.e.id}, Station ${neu.cur}`);
  if (neu.fertig.join() !== 'e0') fehler.push(`Erledigte Stationen: ${neu.fertig}`);
  if (!(await figurAn('.map-station[data-e="e1"]'))) fehler.push('Figur ist nicht zur nächsten Station gelaufen');
  await p.screenshot({ path: shot('karte_e1'), fullPage: false });

  // ---- Figur ändern: gespeichert, kein Export-Hinweis, bleibt bei Export/Import erhalten
  const vorher = await p.evaluate(() => OSIGame.save.aenderungenSeitExport || 0);
  await klick(p, '#tb-figur'); await sleep(150);
  await klick(p, '#fig-wahl [data-av="a03"]'); await klick(p, '#fig-ok'); await sleep(300);
  const f = await p.evaluate(() => ({ av: OSIGame.save.duo.avatar, n: OSIGame.save.aenderungenSeitExport || 0, rt: OSIStore.decode(OSIStore.encode(OSIGame.save)).save.duo.avatar, karte: document.querySelector('.map-pin.is-ich [data-av]').dataset.av }));
  if (f.av !== 'a03' || f.karte !== 'a03') fehler.push('Figurwechsel wirkt nicht');
  if (f.n !== vorher) fehler.push('Figurwechsel zählt als Änderung für den Export-Hinweis');
  if (f.rt !== 'a03') fehler.push('Figur geht beim Export/Import verloren');

  // ---- Alte Spielstände (vor 2.0) ohne Figur: feste Figur aus der Spielstand-ID
  const alt = await p.evaluate(() => {
    const s = JSON.parse(JSON.stringify(OSIGame.save)); delete s.duo.avatar; s.version = '1.1.0';
    const t = OSIStore.encode(s), a = OSIStore.decode(t).save.duo.avatar, b = OSIStore.decode(t).save.duo.avatar;
    return { a, b, soll: OSIStore.avatarFuer(s.id), gueltig: OSIStore.avatarGueltig(a) };
  });
  if (!alt.gueltig || alt.a !== alt.b || alt.a !== alt.soll) fehler.push('Alter Spielstand bekommt keine feste Figur: ' + JSON.stringify(alt));

  // ---- Hell/Dunkel
  const t1 = await p.evaluate(() => document.documentElement.dataset.theme);
  await klick(p, '#tb-theme'); await sleep(100);
  const t2 = await p.evaluate(() => document.documentElement.dataset.theme);
  if (!t1 || t1 === t2) fehler.push(`Hell/Dunkel schaltet nicht um (${t1} → ${t2})`);
  await p.screenshot({ path: shot('karte_dunkel'), fullPage: false });
  await p.setViewport({ width: 390, height: 844 }); await sleep(300);
  await p.evaluate(() => OSIGame.render()); await sleep(800);
  await p.screenshot({ path: shot('karte_handy'), fullPage: false });

  fehler.push(...p.fehler);
  await b.close();
  if (fehler.length) { console.log('❌ KARTE FEHLGESCHLAGEN:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log(`✅ Karte und Figuren bestanden (${w.stationen} Stationen, ${k.knoten} Knoten im Einsatz-Pfad)`);
})().catch(e => { console.error('❌ TESTFEHLER', e); process.exit(1); });
