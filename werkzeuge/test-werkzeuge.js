// Prüft die Ermittlungswerkzeuge: Wireshark-Anzeigefilter (Parser und Treffer) und das simulierte Terminal
// (alle Spickzettel-Befehle, Tab-Ergänzung, Verlauf, unbekannte Befehle). Screenshots in werkzeuge/shots.
const { browser, seite, klick, sleep, shot } = require('./lib');

(async () => {
  const b = await browser();
  const p = await seite(b, 'spiel/index.html');
  const fehler = [];
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(300);
  await p.type('#st-code', 'Werkzeug'); await p.type('#st-k1', 'W1'); await klick(p, '#st-neu'); await sleep(200);
  await p.evaluate(() => { OSIGame.teacher = true; });

  // ---- Filter: gegen alle Mitschnitte der Einsätze
  const f = await p.evaluate(() => {
    const out = [];
    const steps = OSI.einsaetze.flatMap(e => e.steps).filter(s => s.wireshark);
    const treffer = (s, t) => s.wireshark.pakete.filter(OSIGame.wsFilter(t)).map(x => x.nr).join(',');
    const erwarte = (s, t, soll) => { let ist; try { ist = treffer(s, t); } catch (e) { ist = 'FEHLER ' + e.message; } if (ist !== soll) out.push(`${s.id}: „${t}“ liefert [${ist}], erwartet [${soll}]`); };
    const ungueltig = (s, t) => { try { OSIGame.wsFilter(t); out.push(`${s.id}: „${t}“ hätte ungültig sein müssen`); } catch (e) { } };
    for (const s of steps) {
      const alle = s.wireshark.pakete.map(x => x.nr).join(',');
      erwarte(s, '', alle);
      erwarte(s, 'arp || !arp', alle);
      erwarte(s, 'arp && !arp', '');
      ['eth.src = aa', 'ip.adr == 1.1.1.1', 'arp &&', '(arp', 'eth.src ==', 'arp ; dns', 'eth.src == RaspberryPi_5e:19:7a', 'arp && eth.src==RaspberryPi_5e:19:7a', 'ip.addr == 192.168.50.300', 'ip.src == dc:a6:32:5e:19:7a', 'eth.dst == 192.168.50.1', 'ip == 198.51.100.23', 'tcp == 22', 'arp != 1'].forEach(t => ungueltig(s, t));
      // jede Filter-Aufgabe muss mindestens einen Frame treffen und darf nicht alles zeigen
      s.fragen.filter(q => q.eingabe === 'filter').forEach(q => { const n = treffer(s, q.richtig).split(',').filter(Boolean).length; if (!n || n === s.wireshark.pakete.length) out.push(`${q.id}: Filter „${q.richtig}“ trifft ${n} Frames`); });
      s.fragen.filter(q => q.meldung).forEach(q => [].concat(q.richtig).forEach(n => { if (!s.wireshark.pakete.some(x => x.nr === n)) out.push(`${q.id}: Frame ${n} gibt es nicht`); }));
    }
    const e2 = steps.find(s => s.id === 'e2-wireshark');
    if (e2) {
      erwarte(e2, 'eth.src == DC-A6-32-5E-19-7A', treffer(e2, 'eth.src == dc:a6:32:5e:19:7a'));
      erwarte(e2, 'arp and not eth.src == dc:a6:32:5e:19:7a', '1,2,14,15');
      erwarte(e2, 'arp.opcode == 1', '1,14');
      erwarte(e2, 'ip.addr == 192.168.50.20', '8,13');
      erwarte(e2, 'tcp.port == 80', '8,13');
    }
    const e3 = steps.find(s => s.id === 'e3-wireshark');
    if (e3) {
      erwarte(e3, 'bootp', treffer(e3, 'dhcp'));
      erwarte(e3, 'udp.port == 67', treffer(e3, 'dhcp'));
      erwarte(e3, 'dhcp.option.router == 192.168.50.66', '2,5,15,18');
      erwarte(e3, 'ip.dst != 1.1.1.1 && icmp', '10,11,13');
    }
    return { out, n: steps.length };
  });
  if (!f.n) fehler.push('Kein Schritt mit Wireshark-Ansicht gefunden');
  fehler.push(...f.out);

  // ---- Antwortlängen: Die richtige Antwort darf nicht auffällig länger sein als die längste falsche
  const lang = await p.evaluate(() => {
    const strip = t => String(t).replace(/<[^>]+>/g, '');
    const out = [];
    OSI.einsaetze.forEach(e => e.steps.forEach(st => [...(st.fragen || []), ...(st.verhoerFragen || [])].forEach(q => {
      if (!q.optionen) return;
      const r = [].concat(q.richtig), L = q.optionen.map(o => strip(o).length);
      const maxR = Math.max(...r.map(i => L[i])), maxF = Math.max(...L.filter((x, i) => !r.includes(i)));
      if (maxR > 15 && maxR / maxF > 1.3) out.push(`${q.id}: richtige Antwort ${maxR} Zeichen, längste falsche ${maxF} – Längen angleichen`);
    })));
    return out;
  });
  fehler.push(...lang);

  // ---- Terminal: alle Befehle aus den Konfigurationen wirklich eintippen
  const terms = await p.evaluate(() => OSI.einsaetze.flatMap(e => e.steps.filter(s => s.terminal).map(s => ({ e: e.id, s: s.id, cmds: s.terminal.befehle.map(b => b.cmd || (b.tab + '192.168.50.1')).concat(s.terminal.befehle.filter(b => b.tab && b.tab.startsWith('tracert')).map(() => 'tracert 1.1.1.1')) }))));
  if (!terms.length) fehler.push('Kein Schritt mit Terminal gefunden');
  const tippe = async text => { await p.focus('.term-in input'); await p.keyboard.type(text); await p.keyboard.press('Enter'); await sleep(30); };
  const letzte = () => p.$$eval('.term-out > div', d => d.length ? d[d.length - 1].textContent : '');
  for (const t of terms) {
    await p.evaluate((e, s) => OSIGame.gotoStep(e, s), t.e, t.s); await sleep(200);
    for (const c of t.cmds) {
      await tippe(c);
      const o = await letzte();
      if (/falsch geschrieben|\(Simulation\)/.test(o) || o.trim().length < 5) fehler.push(`${t.s}: Befehl „${c}“ liefert keine sinnvolle Ausgabe: ${o.slice(0, 80)}`);
    }
    await tippe('dir');
    if (!/falsch geschrieben/.test(await letzte())) fehler.push(`${t.s}: unbekannter Befehl wird nicht gemeldet`);
    await p.focus('.term-in input'); await p.keyboard.type('ipc'); await p.keyboard.press('Tab');
    const v = await p.$eval('.term-in input', el => el.value);
    if (v !== 'ipconfig') fehler.push(`${t.s}: Tab-Ergänzung liefert „${v}“ statt „ipconfig“`);
    await p.$eval('.term-in input', el => { el.value = ''; el.dispatchEvent(new Event('input')); });
    await p.keyboard.press('ArrowUp');
    const h = await p.$eval('.term-in input', el => el.value);
    if (h !== 'dir') fehler.push(`${t.s}: Pfeil hoch holt „${h}“ statt „dir“`);
    await p.$eval('.term-in input', el => { el.value = ''; el.dispatchEvent(new Event('input')); });
    // Zustand bleibt beim Wechsel zur nächsten Aufgabe erhalten
    const vor = (await p.$$('.term-out > div')).length;
    await p.evaluate(() => { const a = OSIGame.save.pos; OSIGame.gotoStep(a.e, a.s); }); await sleep(150);
    if ((await p.$$('.term-out > div')).length !== vor) fehler.push(`${t.s}: Terminal-Verlauf geht beim Neuzeichnen verloren`);
    await p.screenshot({ path: shot('terminal_' + t.s), fullPage: true });
  }
  // Geheimes Abzeichen
  await tippe('color 0a');
  if (!(await p.evaluate(() => !!OSIGame.save.badges.matrix))) fehler.push('color 0a vergibt das Matrix-Abzeichen nicht');

  // ---- Wireshark-Ansicht bedienen
  const ws = await p.evaluate(() => { const e = OSI.einsaetze.find(x => x.steps.some(s => s.wireshark)); const s = e.steps.find(s => s.wireshark); OSIGame.gotoStep(e.id, s.id); return s.id; });
  await sleep(200);
  await p.$eval('.ws-filter input', el => { el.value = 'arp'; }); await klick(p, '.ws-apply'); await sleep(100);
  const zeilen = await p.$$eval('.ws-row[data-nr]', r => r.length);
  const soll = await p.evaluate(sid => OSI.einsaetze.flatMap(e => e.steps).find(s => s.id === sid).wireshark.pakete.filter(x => x.prot === 'ARP').length, ws);
  if (zeilen !== soll) fehler.push(`Wireshark-Ansicht zeigt ${zeilen} statt ${soll} ARP-Frames`);
  await klick(p, '.ws-row[data-nr="3"]'); await sleep(80); await klick(p, '.ws-lbl[data-i="2"]'); await sleep(80);
  if (!(await p.$('.ws-kids:not(.hidden)'))) fehler.push('Details eines Frames lassen sich nicht aufklappen');
  await p.$eval('.ws-filter input', el => { el.value = 'eth.src = x'; }); await klick(p, '.ws-apply'); await sleep(80);
  if (!(await p.$('.ws-filter.bad'))) fehler.push('Ungültiger Filter wird nicht rot markiert');
  await p.$eval('.ws-filter input', el => { el.value = 'arp'; }); await klick(p, '.ws-apply'); await sleep(80);
  await p.screenshot({ path: shot('wireshark_' + ws), fullPage: true });
  // schmales Fenster (Handy/Tablet)
  await p.setViewport({ width: 420, height: 900 }); await sleep(150);
  await p.screenshot({ path: shot('wireshark_schmal'), fullPage: false });

  fehler.push(...p.fehler);
  await b.close();
  if (fehler.length) { console.log('❌ WERKZEUGE FEHLGESCHLAGEN:\n  ' + fehler.join('\n  ')); process.exit(1); }
  console.log(`✅ Werkzeuge bestanden (${f.n} Mitschnitte, ${terms.length} Terminals)`);
})().catch(e => { console.error('❌ TESTFEHLER', e); process.exit(1); });
