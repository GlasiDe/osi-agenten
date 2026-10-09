// Konsistenzprüfung der Spielinhalte: Passen IDs, Verweise und Pflichtfelder in spiel/content/ zusammen?
// Prüft nur die Form, nicht die fachliche Richtigkeit. Läuft unter Node ohne Browser, als Erstes in npm test.
// Vorher zeigt ein Selbsttest, dass jede Regel bei einem absichtlich eingebauten Fehler anschlägt
// und Erlaubtes (z. B. „Port 443“ in der Zeit-Challenge) nicht als Fehler meldet.
// Aufruf: node konsistenz-pruefen.js   (oder npm run konsistenz)
const fs = require('fs');
const path = require('path');
const { ROOT, inhaltsliste, ladeInhalte } = require('./lib');

// Seiten, die alle Inhaltsdateien laden müssen (Spiel, Auswertung, Lösungs-PDF)
const SEITEN = ['spiel/index.html', 'lehrkraft/einsatzzentrale.html', 'lehrkraft/quellen/loesungen.html'];
// Wo in einem Schritt Aufgaben stehen (wie OSIStore.alleItems in spiel/js/storage.js): Fragen, Sortier-Begriffe, Puzzle-Phasen
const AUFGABEN_FELDER = ['fragen', 'items', 'phasen'];
// Antwortarten einer Frage und Arten der Freitext-Eingabe, wie sie R.quiz, R.verhoer und normAntwort in spiel/js/steps.js auswerten
const ANTWORTARTEN = ['optionen', 'layer', 'eingabe', 'pick', 'meldung'];
const EINGABE_ARTEN = ['ip', 'mac', 'zahl', 'text', 'filter'];
// Felder eines Schritts, die ein Abzeichen vergeben
const ABZEICHEN_FELDER = ['abzeichen', 'abzeichenOhneTipp', 'abzeichenFehlerfrei'];

const aufgabenIn = st => AUFGABEN_FELDER.flatMap(f => st[f] || []);

// Alles, was die Prüfung braucht – bei jedem Aufruf frisch, damit der Selbsttest es verändern darf
function pruefDaten() {
  return {
    OSI: ladeInhalte(),
    typen: [...fs.readFileSync(path.join(ROOT, 'spiel/js/steps.js'), 'utf8').matchAll(/^\s*R\.(\w+) = /gm)].map(m => m[1]),
    listen: Object.fromEntries(SEITEN.map(s => [s, inhaltsliste(s)])),
    dateien: fs.readdirSync(path.join(ROOT, 'spiel/content')).filter(f => f.endsWith('.js'))
  };
}

// Liefert die Liste aller Fehler (leer = alles stimmig)
function pruefen({ OSI, typen, listen, dateien }) {
  const fehler = [];
  const melde = (wo, text) => fehler.push(`${wo}: ${text}`);
  const leer = v => typeof v !== 'string' || !v.trim();
  const istSchicht = x => Number.isInteger(x) && x >= 1 && x <= 7;

  // ---- IDs: Schritte, Aufgaben und Verhörfragen teilen sich einen Namensraum, auch mit OSI.ausgemustert
  const ausgemustert = new Set(OSI.ausgemustert || []);
  const ids = new Map(); // ID → Fundort
  const schrittIds = new Set(), aufgabenIds = new Set();
  const merke = (id, wo, art) => {
    if (leer(id)) return melde(wo, `${art} ohne gültige ID`);
    if (ids.has(id)) melde(wo, `ID „${id}“ gibt es schon (${ids.get(id)})`);
    else ids.set(id, wo);
    if (ausgemustert.has(id)) melde(wo, `ID „${id}“ ist ausgemustert und darf nicht wiederverwendet werden`);
  };
  const erklaert = (x, wo) => { if (leer(x.erklaerung)) melde(wo, 'ohne erklaerung (erscheint nach dem Lösen)'); };

  // Fragen in Quiz, Anklage, Außeneinsatz und Abschlussverhör: genau eine Antwortart, passendes richtig
  const antwort = (q, wo, verhoer) => {
    const arten = ANTWORTARTEN.filter(k => q[k] != null && q[k] !== false);
    if (q.multi && !q.optionen) melde(wo, 'multi nur zusammen mit optionen');
    if (arten.length !== 1) return melde(wo, `braucht genau eine Antwortart (${ANTWORTARTEN.join(', ')}), hat ${arten.join(' + ') || 'keine'}`);
    const r = [].concat(q.richtig);
    if (q.optionen) {
      if (q.multi && !Array.isArray(q.richtig)) melde(wo, 'Mehrfachwahl: richtig muss eine Liste sein');
      // Das Abschlussverhör vergleicht bei Einfachwahl strikt mit einer Zahl, das Quiz nimmt auch eine Liste
      if (verhoer && !q.multi && !Number.isInteger(q.richtig)) melde(wo, 'Verhörfrage mit Einfachwahl: richtig muss eine einzelne Zahl sein');
      if (!r.length || !r.every(i => Number.isInteger(i) && i >= 0 && i < q.optionen.length)) melde(wo, `richtig zeigt nicht auf eine der ${q.optionen.length} Optionen (gezählt ab 0)`);
    }
    if (q.layer && (!r.length || !r.every(istSchicht))) melde(wo, 'Schichtfrage: richtig als Schicht muss 1–7 sein');
    if (q.eingabe && !EINGABE_ARTEN.includes(q.eingabe)) melde(wo, `unbekannte eingabe-Art „${q.eingabe}“ (bekannt: ${EINGABE_ARTEN.join(', ')})`);
  };

  // ---- Abzeichen: eigener Namensraum
  const abzeichen = new Set();
  OSI.abzeichen.forEach(a => {
    if (abzeichen.has(a.id)) melde('Abzeichen', `Abzeichen-ID „${a.id}“ gibt es zweimal`);
    abzeichen.add(a.id);
  });
  const abzeichenDa = (id, wo) => { if (id != null && !abzeichen.has(id)) melde(wo, `Abzeichen „${id}“ gibt es nicht in OSI.abzeichen`); };

  const verdaechtige = new Set(OSI.verdaechtige.map(v => v.id));
  const einsaetze = new Set();
  OSI.einsaetze.forEach(e => {
    if (einsaetze.has(e.id)) melde(e.id, `Einsatz-ID „${e.id}“ gibt es zweimal`);
    einsaetze.add(e.id);
    e.steps.forEach(st => {
      const wo = `${e.id} › ${st.id || '?'}`;
      const ort = x => `${wo} › ${x.id || '?'}`;
      merke(st.id, wo, 'Schritt');
      schrittIds.add(st.id);
      if (!typen.includes(st.type)) melde(wo, `unbekannter Schritt-Typ „${st.type}“ (bekannt: ${typen.join(', ')})`);

      aufgabenIn(st).forEach(a => { merke(a.id, ort(a), 'Aufgabe'); aufgabenIds.add(a.id); erklaert(a, ort(a)); });
      (st.verhoerFragen || []).forEach(q => { merke(q.id, ort(q), 'Verhörfrage'); erklaert(q, ort(q)); });

      (st.fragen || []).forEach(q => antwort(q, ort(q), false));
      (st.verhoerFragen || []).forEach(q => antwort(q, ort(q), true));
      if (st.items) {
        const faecher = new Set((st.bins || []).map(b => String(b.id)));
        st.items.forEach(it => { if (![].concat(it.ziel).every(z => faecher.has(String(z)))) melde(ort(it), `ziel „${it.ziel}“ ist kein Fach (bins)`); });
      }
      (st.phasen || []).forEach(ph => {
        const schluessel = new Set((ph.optionen || []).map(o => o.key));
        const fremd = (ph.korrekt || []).filter(k => !schluessel.has(k));
        if (fremd.length) melde(ort(ph), `korrekt nennt „${fremd.join(', ')}“, das ist keine Option`);
      });

      (st.szenen || []).forEach((sz, i) => { if (!OSI.figuren[sz.wer]) melde(wo, `Szene ${i + 1}: Figur „${sz.wer}“ gibt es nicht in OSI.figuren`); });
      ABZEICHEN_FELDER.forEach(f => abzeichenDa(st[f], wo));
      Object.keys(st.setzt || {}).forEach(v => { if (!verdaechtige.has(v)) melde(wo, `setzt: Verdächtige „${v}“ gibt es nicht in OSI.verdaechtige`); });
    });
  });

  // ---- Verweise aus meta.js
  const challenge = OSI.challenge;
  (challenge.abzeichen || []).forEach(a => abzeichenDa(a.id, 'Zeit-Challenge'));
  Object.entries(OSI.eggs || {}).forEach(([k, egg]) => abzeichenDa(egg.abzeichen, `Easter Egg ${k}`));
  if (!aufgabenIds.has(challenge.freiNach)) melde('Zeit-Challenge', `freiNach „${challenge.freiNach}“ ist keine Aufgabe (die Challenge öffnet sich, sobald diese Aufgabe gelöst ist)`);
  if (!schrittIds.has(OSI.boardAb)) melde('meta.js', `boardAb „${OSI.boardAb}“ ist kein Schritt`);

  // ---- Challenge-Pool: Werte wie „Port 443“ sind erlaubt (DESIGN.md), daher keine Längen- oder Leerzeichenregel
  const begriffe = new Set();
  challenge.pool.forEach((b, i) => {
    const wo = `Zeit-Challenge › ${leer(b.t) ? 'Eintrag ' + (i + 1) : b.t}`;
    if (leer(b.t)) return melde(wo, 'Begriff ohne Text');
    const k = b.t.trim().toLowerCase();
    if (begriffe.has(k)) melde(wo, 'Begriff doppelt');
    begriffe.add(k);
    if (!istSchicht(b.l)) melde(wo, 'braucht genau eine Schicht von 1 bis 7 (die Challenge wertet keine Listen aus)');
  });

  // ---- Script-Listen: alle Seiten laden dieselben Inhaltsdateien in derselben Reihenfolge
  const [haupt, ...andere] = SEITEN;
  andere.forEach(s => {
    if (listen[s].join() !== listen[haupt].join()) melde(s, `lädt andere Inhaltsdateien als ${haupt}: ${listen[s].join(', ')} statt ${listen[haupt].join(', ')}`);
  });
  dateien.filter(f => !listen[haupt].includes(f)).forEach(f => melde(`spiel/content/${f}`, `wird nicht geladen (Script-Tag fehlt in ${SEITEN.join(', ')})`));

  return fehler;
}

// ---------------------------------------------------------------- Selbsttest
const schritte = OSI => OSI.einsaetze.flatMap(e => e.steps);
const schritt = (OSI, f) => schritte(OSI).find(f);
const frage = (OSI, f) => schritte(OSI).flatMap(s => s.fragen || []).find(f);
const lektionen = OSI => schritte(OSI).filter(s => s.type === 'lesson');
const verhoerFrage = (OSI, f) => schritt(OSI, s => s.verhoerFragen).verhoerFragen.find(f);
const sortierer = OSI => schritt(OSI, s => s.items);
const puzzle = OSI => schritt(OSI, s => s.phasen);

// Je Fall ein eingebauter Fehler: Erwartet wird mindestens eine neue Meldung, und alle neuen Meldungen passen zum Fall.
const FEHLER = [
  ['Einsatz-ID doppelt', ({ OSI }) => { OSI.einsaetze[1].id = OSI.einsaetze[0].id; }, /Einsatz-ID .* gibt es zweimal/],
  ['Schritt ohne ID', ({ OSI }) => { lektionen(OSI)[0].id = ''; }, /Schritt ohne gültige ID/],
  ['Aufgabe ohne ID', ({ OSI }) => { delete frage(OSI, () => true).id; }, /Aufgabe ohne gültige ID/],
  ['Schritt-ID doppelt', ({ OSI }) => { lektionen(OSI)[1].id = lektionen(OSI)[0].id; }, /gibt es schon/],
  ['Aufgabe mit der ID eines Schritts', ({ OSI }) => { frage(OSI, () => true).id = lektionen(OSI)[0].id; }, /gibt es schon/],
  ['Sortier-Begriff-ID doppelt', ({ OSI }) => { const it = sortierer(OSI).items; it[1].id = it[0].id; }, /gibt es schon/],
  ['Puzzle-Phasen-ID doppelt', ({ OSI }) => { const ph = puzzle(OSI).phasen; ph[1].id = ph[0].id; }, /gibt es schon/],
  ['Verhörfrage mit der ID einer Aufgabe', ({ OSI }) => { verhoerFrage(OSI, () => true).id = frage(OSI, () => true).id; }, /gibt es schon/],
  ['ausgemusterte ID wiederverwendet', ({ OSI }) => { OSI.ausgemustert.push(lektionen(OSI)[0].id); }, /ausgemustert/],
  ['Abzeichen-ID doppelt', ({ OSI }) => { OSI.abzeichen.push(Object.assign({}, OSI.abzeichen[0])); }, /Abzeichen-ID .* gibt es zweimal/],
  ['richtig zeigt auf keine Option', ({ OSI }) => { const q = frage(OSI, q => q.optionen && !q.multi); q.richtig = q.optionen.length; }, /zeigt nicht auf eine der \d+ Optionen/],
  ['Mehrfachwahl ohne Liste', ({ OSI }) => { const q = frage(OSI, q => q.multi); q.richtig = q.richtig[0]; }, /Mehrfachwahl: richtig muss eine Liste sein/],
  ['Verhörfrage mit Einfachwahl und Liste', ({ OSI }) => { const q = verhoerFrage(OSI, q => q.optionen && !q.multi); q.richtig = [q.richtig]; }, /muss eine einzelne Zahl sein/],
  ['Verhörfrage ohne Antwortart', ({ OSI }) => { delete verhoerFrage(OSI, q => q.optionen).optionen; }, /genau eine Antwortart/],
  ['Schicht außerhalb 1–7', ({ OSI }) => { frage(OSI, q => q.layer).richtig = 8; }, /Schicht muss 1–7 sein/],
  ['Sortier-Ziel ohne Fach', ({ OSI }) => { sortierer(OSI).items[0].ziel = 'gibtsnicht'; }, /kein Fach/],
  ['Puzzle-Schlüssel unbekannt', ({ OSI }) => { puzzle(OSI).phasen[0].korrekt.push('gibtsnicht'); }, /korrekt nennt .* keine Option/],
  ['Figur unbekannt', ({ OSI }) => { schritt(OSI, s => s.szenen).szenen[0].wer = 'niemand'; }, /Figur .* gibt es nicht/],
  ...ABZEICHEN_FELDER.map(f => [`Abzeichen-Verweis unbekannt (${f})`, ({ OSI }) => { schritt(OSI, s => s[f])[f] = 'gibtsnicht'; }, /Abzeichen .* gibt es nicht/]),
  ['Abzeichen der Zeit-Challenge unbekannt', ({ OSI }) => { OSI.challenge.abzeichen[0].id = 'gibtsnicht'; }, /Abzeichen .* gibt es nicht/],
  ['Abzeichen eines Easter Eggs unbekannt', ({ OSI }) => { Object.values(OSI.eggs).find(e => e.abzeichen).abzeichen = 'gibtsnicht'; }, /Abzeichen .* gibt es nicht/],
  ['Verdächtige unbekannt', ({ OSI }) => { schritt(OSI, s => s.setzt).setzt = { niemand: 'entlastet' }; }, /Verdächtige .* gibt es nicht/],
  ['freiNach ist keine Aufgabe', ({ OSI }) => { OSI.challenge.freiNach = lektionen(OSI)[0].id; }, /freiNach/],
  ['boardAb ist kein Schritt', ({ OSI }) => { OSI.boardAb = 'gibtsnicht'; }, /boardAb/],
  ['Schritt-Typ unbekannt', ({ OSI }) => { lektionen(OSI)[0].type = 'gibtsnicht'; }, /unbekannter Schritt-Typ/],
  ['zwei Antwortarten', ({ OSI }) => { frage(OSI, q => q.layer).eingabe = 'text'; }, /genau eine Antwortart/],
  ['keine Antwortart', ({ OSI }) => { delete frage(OSI, q => q.optionen && !q.multi).optionen; }, /genau eine Antwortart/],
  ['multi ohne optionen', ({ OSI }) => { frage(OSI, q => q.layer).multi = true; }, /multi nur zusammen mit optionen/],
  ['eingabe-Art unbekannt', ({ OSI }) => { frage(OSI, q => q.eingabe).eingabe = 'gibtsnicht'; }, /unbekannte eingabe-Art/],
  ['Frage ohne Erklärung', ({ OSI }) => { delete frage(OSI, () => true).erklaerung; }, /ohne erklaerung/],
  ['Sortier-Begriff ohne Erklärung', ({ OSI }) => { sortierer(OSI).items[0].erklaerung = ' '; }, /ohne erklaerung/],
  ['Puzzle-Phase ohne Erklärung', ({ OSI }) => { delete puzzle(OSI).phasen[0].erklaerung; }, /ohne erklaerung/],
  ['Verhörfrage ohne Erklärung', ({ OSI }) => { delete verhoerFrage(OSI, () => true).erklaerung; }, /ohne erklaerung/],
  ['Challenge-Begriff leer', ({ OSI }) => { OSI.challenge.pool[0].t = ' '; }, /Challenge.*ohne Text/],
  ['Challenge-Begriff doppelt', ({ OSI }) => { const b = OSI.challenge.pool[0]; OSI.challenge.pool.push({ t: b.t.toUpperCase(), l: b.l }); }, /Challenge.*doppelt/],
  ['Challenge mit mehreren Schichten', ({ OSI }) => { OSI.challenge.pool[0].l = [2, 3]; }, /Challenge.*genau eine Schicht/],
  ['Script-Liste weicht ab', ({ listen }) => { listen['lehrkraft/einsatzzentrale.html'].pop(); }, /lädt andere Inhaltsdateien/],
  ['Inhaltsdatei nicht geladen', ({ dateien }) => { dateien.push('e7.js'); }, /wird nicht geladen/]
];

// Gegenproben: ausdrücklich Erlaubtes darf keine Meldung auslösen
const ERLAUBT = [
  ['Challenge-Wert mit Leerzeichen und über 20 Zeichen', ({ OSI }) => { OSI.challenge.pool.push({ t: 'Port 8080', l: 4 }, { t: 'Sitzungs-ID im Cookie (Anmeldung)', l: 5 }); }],
  ['Schichtfrage mit mehreren richtigen Schichten (TLS)', ({ OSI }) => { frage(OSI, q => q.layer).richtig = [6, 5]; }],
  ['Sortier-Begriff mit mehreren Zielfächern', ({ OSI }) => { const st = sortierer(OSI); st.items[0].ziel = st.bins.slice(0, 2).map(b => b.id); }],
  ['Quiz-Einfachwahl mit richtig als Liste', ({ OSI }) => { const q = frage(OSI, q => q.optionen && !q.multi); q.richtig = [q.richtig]; }]
];

function selbsttest() {
  const basis = new Set(pruefen(pruefDaten()));
  const neueMeldungen = veraendern => { const kopie = pruefDaten(); veraendern(kopie); return pruefen(kopie).filter(m => !basis.has(m)); };
  const durchgefallen = [];
  for (const [name, veraendern, erwartet] of FEHLER) {
    const neu = neueMeldungen(veraendern);
    if (!neu.length || !neu.every(m => erwartet.test(m))) durchgefallen.push(`„${name}“: erwartet ${erwartet}, gemeldet ${neu.length ? '\n      ' + neu.join('\n      ') : 'nichts'}`);
  }
  for (const [name, veraendern] of ERLAUBT) {
    const neu = neueMeldungen(veraendern);
    if (neu.length) durchgefallen.push(`„${name}“ ist erlaubt, gemeldet wurde aber:\n      ${neu.join('\n      ')}`);
  }
  return durchgefallen;
}

// ---------------------------------------------------------------- Aufruf
const durchgefallen = selbsttest();
const faelle = FEHLER.length + ERLAUBT.length;
if (durchgefallen.length) {
  console.log(`❌ Selbsttest: ${durchgefallen.length} von ${faelle} Fällen stimmen nicht – die Prüfung selbst ist fehlerhaft.`);
  durchgefallen.forEach(t => console.log('   ' + t));
  process.exit(1);
}
console.log(`✅ Selbsttest: alle ${FEHLER.length} eingebauten Fehler erkannt, ${ERLAUBT.length} Gegenproben ohne Meldung.`);

const aktuell = pruefDaten(), OSI = aktuell.OSI, alle = schritte(OSI);
const fehler = pruefen(aktuell);
if (fehler.length) {
  console.log(`❌ Inhalte: ${fehler.length} Fehler`);
  fehler.forEach(f => console.log('   ' + f));
  process.exit(1);
}
const anzahl = liste => liste.reduce((n, st) => n + st.length, 0);
console.log(`✅ Inhalte stimmig: ${alle.length} Schritte, ${anzahl(alle.map(aufgabenIn))} Aufgaben, ${anzahl(alle.map(s => s.verhoerFragen || []))} Verhörfragen, ${OSI.abzeichen.length} Abzeichen, ${OSI.challenge.pool.length} Challenge-Begriffe.`);
