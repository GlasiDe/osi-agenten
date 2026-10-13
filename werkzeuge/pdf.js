// Erzeugt die druckfertigen A4-PDFs aus lehrkraft/quellen/*.html (per Edge).
const fs = require('fs');
const path = require('path');
const { browser, url, ROOT, sleep } = require('./lib');

// Chrome schreibt Erstellungs- und Änderungsdatum in jede PDF.
const ohneZeitstempel = buf => buf.toString('latin1').replace(/\/(CreationDate|ModDate) \(D:[^)]*\)/g, '');

const JOBS = [
  ['lehrkraft/quellen/kurzanleitung.html', 'lehrkraft/Kurzanleitung_SuS.pdf'],
  ['lehrkraft/quellen/loesungen.html', 'lehrkraft/Loesungen_und_Debriefing.pdf'],
  ['lehrkraft/quellen/offene-aufgaben.html', 'lehrkraft/Offene_Aufgaben_Lehrkraft.pdf'],
  ['lehrkraft/quellen/mindestanforderungen.html', 'lehrkraft/Mindestanforderungen_Vorwissen.pdf'],
  ['lehrkraft/quellen/inhaltsuebersicht.html', 'lehrkraft/Inhaltsuebersicht_Einsaetze.pdf']
];

(async () => {
  const b = await browser();
  let fehler = 0;
  for (const [quelle, ziel] of JOBS) {
    const p = await b.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(url(quelle), { waitUntil: 'load' });
    await sleep(200);
    const pdf = Buffer.from(await p.pdf({
      format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#888">Seite <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
    }));
    // Nur schreiben, wenn sich mehr als der Zeitstempel geändert hat – sonst meldet Git unveränderte PDFs als geändert.
    const datei = path.join(ROOT, ziel);
    const alt = fs.existsSync(datei) ? fs.readFileSync(datei) : null;
    const neu = !alt || ohneZeitstempel(alt) !== ohneZeitstempel(pdf);
    if (neu) fs.writeFileSync(datei, pdf);
    if (errs.length) { fehler++; console.log(`❌ ${ziel}: ${errs.join('; ')}`); } else console.log(`✅ ${ziel}${neu ? '' : ' (unverändert)'}`);
  }
  await b.close();
  process.exit(fehler ? 1 : 0);
})();
