// Prüft die Zeit-Challenge: Uhr steht nach einem Fehler, verlassene Läufe laufen nicht weiter,
// ein Neustart hat genau eine Uhr, Endanzeige „Richtige“. Läuft mit verkürzter Zeit (8 s).
const { browser, seite, klick, sleep, shot } = require('./lib');

(async () => {
  const b = await browser();
  const p = await seite(b, 'spiel/index.html');
  const fehler = [];
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(300);
  await p.type('#st-code', 'Uhrtest'); await p.type('#st-k1', 'U1'); await klick(p, '#st-neu'); await sleep(200);
  await p.evaluate(() => { OSI.challenge.sekunden = 8; });
  const breite = () => p.$eval('#ch-t', el => parseFloat(el.style.width)).catch(() => null);
  const aktuell = () => p.evaluate(() => { const t = document.getElementById('ch-item').textContent.trim(); return OSI.challenge.pool.find(x => x.t === t); });

  // 1) Fehler → Uhr steht, richtige Schicht wird gezeigt, danach geht es weiter
  await p.evaluate(() => OSIGame.challenge.start()); await sleep(300);
  const it = await aktuell();
  await klick(p, `.ch-btns button[data-l="${it.l === 1 ? 2 : 1}"]`); await sleep(100);
  const w1 = await breite(); await sleep(1200); const w2 = await breite();
  if (w1 == null || Math.abs(w1 - w2) > 0.5) fehler.push(`Uhr läuft während der Fehlerpause weiter (${w1} → ${w2})`);
  if (!(await p.$eval('#ch-item', el => el.textContent.includes('→')))) fehler.push('Nach einem Fehler wird die richtige Schicht nicht angezeigt');
  await p.keyboard.press(String(it.l)); await sleep(100);
  if ((await p.$eval('#ch-s', el => el.textContent)) !== '0') fehler.push('Während der Pause werden Antworten gezählt');
  await sleep(1500);
  const w3 = await breite(); await sleep(600); const w4 = await breite();
  if (!(w4 < w3)) fehler.push(`Uhr läuft nach der Pause nicht weiter (${w3} → ${w4})`);
  await p.screenshot({ path: shot('challenge_lauf'), fullPage: true });

  // 2) Challenge verlassen: der alte Lauf darf später kein Ergebnis mehr anzeigen
  await p.evaluate(() => OSIGame.render()); await sleep(200);
  await sleep(8500);
  if (await p.evaluate(() => document.body.textContent.includes('Zeit abgelaufen'))) fehler.push('Verlassener Lauf zeigt trotzdem ein Ergebnis an');

  // 3) Neustart: genau eine Uhr (Balken fällt gleichmäßig, springt nach richtigen Antworten nicht auf 100 %)
  await p.evaluate(() => OSIGame.challenge.start()); await sleep(1200);
  const v1 = await breite();
  const it2 = await aktuell();
  await p.keyboard.press(String(it2.l)); await sleep(50);
  const v2 = await breite();
  if (v2 > v1 + 1) fehler.push(`Balken springt nach richtiger Antwort zurück (${v1} → ${v2})`);
  await sleep(1000); const v3 = await breite();
  const erwartet = v2 - 12.5; // 1 s von 8 s = 12,5 %
  if (Math.abs(v3 - erwartet) > 6) fehler.push(`Balken läuft nicht mit einfacher Geschwindigkeit (${v2} → ${v3}, erwartet ≈ ${erwartet.toFixed(1)})`);

  // 4) Endanzeige
  await sleep(7500);
  const ende = await p.evaluate(() => { const bg = document.querySelector('.summary .big'); return bg ? bg.parentElement.textContent.replace(/\s+/g, ' ').trim() : null; });
  if (!ende) fehler.push('Keine Endanzeige nach Ablauf der Zeit');
  else if (!/^\d+ Richtige$/.test(ende)) fehler.push(`Endanzeige nicht „<Zahl> Richtige“ in einer Zeile: „${ende}“`);
  if (await p.evaluate(() => document.body.textContent.includes('Treffer'))) fehler.push('Das Wort „Treffer“ taucht noch auf');
  await p.screenshot({ path: shot('challenge_ende'), fullPage: true });

  fehler.push(...p.fehler);
  await b.close();
  if (fehler.length) { console.log('❌ ZEIT-CHALLENGE FEHLGESCHLAGEN:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log('✅ Zeit-Challenge bestanden');
})().catch(e => { console.error('❌ TESTFEHLER', e); process.exit(1); });
