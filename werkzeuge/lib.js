// Gemeinsame Helfer für die Test- und Build-Werkzeuge.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
// Chromium-Browser für Tests und PDFs: CHROME_PATH, sonst Edge/Chrome an den üblichen Orten (Windows, macOS, Linux).
const EDGE = [
  process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
].find(p => p && fs.existsSync(p));

const url = rel => pathToFileURL(path.join(ROOT, rel)).href;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function browser() {
  const puppeteer = require('puppeteer-core');
  if (!EDGE) throw new Error('Kein Edge/Chrome gefunden – Pfad in CHROME_PATH angeben.');
  return puppeteer.launch({ executablePath: EDGE, headless: 'new' });
}

// Seite mit Fehlerprotokoll öffnen
async function seite(b, rel, breite = 1366, hoehe = 768) {
  const p = await b.newPage();
  await p.setViewport({ width: breite, height: hoehe });
  p.fehler = [];
  p.on('pageerror', e => p.fehler.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p.fehler.push('CONSOLE ' + m.text()); });
  await p.goto(url(rel));
  await sleep(300);
  return p;
}

// Klick per DOM (unabhängig von Scrollposition und fixierter Kopfleiste)
async function klick(p, sel) {
  const ok = await p.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return false;
    // SVG-Elemente haben kein .click() – dann ein echtes Klick-Ereignis auslösen
    if (typeof el.click === 'function') el.click(); else el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return true;
  }, sel);
  if (!ok) throw new Error('Element nicht gefunden: ' + sel);
}

function shot(name) { fs.mkdirSync(SHOTS, { recursive: true }); return path.join(SHOTS, name + '.png'); }

module.exports = { ROOT, SHOTS, EDGE, url, sleep, browser, seite, klick, shot };
