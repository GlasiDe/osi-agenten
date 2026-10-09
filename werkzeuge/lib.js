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

// Inhaltsdateien (spiel/content/*.js), die eine HTML-Seite per <script src> lädt, in ihrer Reihenfolge
function inhaltsliste(rel) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  return [...html.matchAll(/<script\b[^>]*\bsrc="[^"]*\bcontent\/([^"/]+\.js)"/g)].map(m => m[1]);
}

// Inhalte unter Node laden wie im Spiel (Reihenfolge aus spiel/index.html). Jeder Aufruf liefert ein frisches window.OSI.
function ladeInhalte() {
  global.window = {};
  for (const f of inhaltsliste('spiel/index.html')) {
    const datei = path.join(ROOT, 'spiel/content', f);
    if (!fs.existsSync(datei)) throw new Error(`spiel/index.html lädt content/${f}, die Datei gibt es aber nicht.`);
    delete require.cache[require.resolve(datei)];
    require(datei);
  }
  return global.window.OSI;
}

module.exports = { ROOT, SHOTS, EDGE, url, sleep, browser, seite, klick, shot, inhaltsliste, ladeInhalte };
