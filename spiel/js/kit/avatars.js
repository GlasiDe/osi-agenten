/* OSI-Agenten – 15 Agenten-Figuren als selbst gezeichnetes SVG (Baukasten aus Kopf, Haaren/Kopfbedeckung,
   Kleidung und Zubehör). Reine Funktionen: von Spiel, Karte und Einsatzzentrale genutzt.
   IDs a01 … a15 NIE ändern – sie stehen in den Spielständen (save.duo.avatar). */
(function () {
  'use strict';
  const Kit = window.OSIKit = window.OSIKit || {};

  const HAUT = { 1: '#f9d9bf', 2: '#efbf98', 3: '#d49b6c', 4: '#a86e45', 5: '#6f4529' };
  const HAAR = { schwarz: '#2b2321', braun: '#6b3f22', blond: '#e3b34f', rot: '#b8482b', grau: '#a3a7ab', blau: '#3d7be0', lila: '#8a4fd8' };

  // Die Figuren. Gemischt besetzt, alle tragen das E7-Abzeichen.
  const LISTE = [
    { id: 'a01', name: 'Spürnase', haut: 2, haar: 'kurz', farbe: 'braun', jacke: '#c9a26b', hose: '#5b4a3a', extra: 'lupe' },
    { id: 'a02', name: 'Funkerin', haut: 3, haar: 'zopf', farbe: 'schwarz', jacke: '#1cb0f6', hose: '#2f4b7c', extra: 'headset' },
    { id: 'a03', name: 'Kabelflüsterer', haut: 5, haar: 'locken', farbe: 'schwarz', jacke: '#ff9600', hose: '#3c3c3c' },
    { id: 'a04', name: 'Paketfuchs', haut: 1, haar: 'kappe', farbe: 'rot', jacke: '#58cc02', hose: '#3a5a2a', kappe: '#ff9600' },
    { id: 'a05', name: 'Nachteule', haut: 1, haar: 'bob', farbe: 'blond', jacke: '#ce82ff', hose: '#4b3a6b', extra: 'brille' },
    { id: 'a06', name: 'Schattenläufer', haut: 4, haar: 'muetze', farbe: 'schwarz', jacke: '#37464f', hose: '#1f2a30', kappe: '#4b4b4b', extra: 'sonnenbrille' },
    { id: 'a07', name: 'Bitjägerin', haut: 5, haar: 'afro', farbe: 'schwarz', jacke: '#00a5a5', hose: '#24494f', extra: 'brille' },
    { id: 'a08', name: 'Portwächter', haut: 3, haar: 'hut', farbe: 'braun', jacke: '#8c6d4f', hose: '#4a3a2e', kappe: '#3c3c3c', extra: 'bart' },
    { id: 'a09', name: 'Routenplanerin', haut: 2, haar: 'kopftuch', farbe: 'schwarz', jacke: '#ff86b4', hose: '#5a3a4f', kappe: '#00a5a5' },
    { id: 'a10', name: 'Codeknackerin', haut: 1, haar: 'dutt', farbe: 'rot', jacke: '#ffc800', hose: '#4b4b4b' },
    { id: 'a11', name: 'Datenkurier', haut: 4, haar: 'stachel', farbe: 'blau', jacke: '#3aa64a', hose: '#2f3b4c', extra: 'schal', schal: '#ff4b4b' },
    { id: 'a12', name: 'Lupenblick', haut: 3, haar: 'zoepfe', farbe: 'braun', jacke: '#e5484d', hose: '#3c3c3c', extra: 'lupe' },
    { id: 'a13', name: 'Signalgeber', haut: 1, haar: 'seite', farbe: 'blond', jacke: '#2f4b9c', hose: '#1f2a44', extra: 'headset' },
    { id: 'a14', name: 'Frameforscherin', haut: 4, haar: 'lang', farbe: 'schwarz', jacke: '#8e2c48', hose: '#3a2430', extra: 'schal', schal: '#ffc800' },
    { id: 'a15', name: 'Netzpilotin', haut: 5, haar: 'kurz', farbe: 'lila', jacke: '#5b6770', hose: '#2b3338', extra: 'brille' }
  ];
  const byId = Object.fromEntries(LISTE.map(a => [a.id, a]));
  const get = id => byId[id] || LISTE[0];

  const dunkler = (hex, f = 0.78) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join('');

  // ---------- Bauteile (Koordinaten im viewBox 0 0 100 116, Kopfmitte 50/36, Radius 22)
  function haarHinten(a, h) {
    switch (a.haar) {
      case 'lang': return `<path d="M26,34 C23,60 26,74 35,76 L65,76 C74,74 77,60 74,34 Z" fill="${h}"/>`;
      case 'bob': return `<path d="M26,32 C24,50 27,60 35,60 L65,60 C73,60 76,50 74,32 Z" fill="${h}"/>`;
      case 'zopf': return `<ellipse cx="76" cy="46" rx="7" ry="14" transform="rotate(-18 76 46)" fill="${h}"/><circle cx="73" cy="32" r="3.4" fill="#ff4b4b"/>`;
      case 'zoepfe': return `<ellipse cx="25" cy="52" rx="6" ry="13" fill="${h}"/><ellipse cx="75" cy="52" rx="6" ry="13" fill="${h}"/><circle cx="25" cy="40" r="3" fill="#ffc800"/><circle cx="75" cy="40" r="3" fill="#ffc800"/>`;
      case 'afro': return `<circle cx="50" cy="31" r="29" fill="${h}"/>`;
      case 'dutt': return `<circle cx="31" cy="17" r="8.5" fill="${h}"/><circle cx="69" cy="17" r="8.5" fill="${h}"/>`;
      case 'kopftuch': return `<path d="M50,9 C23,9 21,36 23,54 C25,66 38,70 50,70 C62,70 75,66 77,54 C79,36 77,9 50,9 Z" fill="${a.kappe}"/>`;
      default: return '';
    }
  }
  function haarVorne(a, h) {
    switch (a.haar) {
      case 'kurz': case 'lang': case 'zopf': case 'zoepfe':
        return `<path d="M28,37 C26,14 74,14 72,37 C67,27 59,24 50,25 C41,24 33,27 28,37 Z" fill="${h}"/>`;
      case 'bob': return `<path d="M28,36 C26,13 74,13 72,36 L72,31 C61,27 39,27 28,31 Z" fill="${h}"/>`;
      case 'afro': return `<path d="M30,30 C34,18 66,18 70,30 C62,25 38,25 30,30 Z" fill="${dunkler(h, .85)}"/>`;
      case 'dutt': return `<path d="M28,36 C26,15 74,15 72,36 C66,27 58,25 50,26 C42,25 34,27 28,36 Z" fill="${h}"/>`;
      case 'locken': return [[32, 26], [37, 18], [45, 14], [55, 14], [63, 18], [68, 26], [28, 34], [72, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${h}"/>`).join('');
      case 'stachel': return `<path d="M28,35 L29,19 L36,26 L39,11 L46,23 L52,8 L56,23 L63,11 L65,26 L71,19 L72,35 C64,26 36,26 28,35 Z" fill="${h}"/>`;
      case 'seite': return `<path d="M28,37 C25,13 71,11 73,35 C68,24 53,20 41,30 C36,30 31,32 28,37 Z" fill="${h}"/>`;
      case 'kappe': return `<path d="M28,37 C27,30 30,27 34,27 L66,27 C70,27 73,30 72,37 Z" fill="${h}"/><path d="M27,26 C27,7 73,7 73,26 Z" fill="${a.kappe}"/><ellipse cx="50" cy="26" rx="27" ry="4.5" fill="${dunkler(a.kappe)}"/><circle cx="50" cy="11" r="2.4" fill="${dunkler(a.kappe)}"/>`;
      case 'muetze': return `<path d="M27,31 C27,7 73,7 73,31 Z" fill="${a.kappe}"/><rect x="25.5" y="25" width="49" height="10" rx="5" fill="${dunkler(a.kappe, .85)}"/><circle cx="50" cy="7" r="6" fill="#f2f2f2"/>`;
      case 'hut': return `<path d="M28,36 C27,28 31,26 36,26 L64,26 C69,26 73,28 72,36 Z" fill="${h}"/><ellipse cx="50" cy="25" rx="34" ry="6" fill="${a.kappe}"/><path d="M32,25 C32,5 68,5 68,25 Z" fill="${a.kappe}"/><rect x="32" y="18" width="36" height="5" fill="#ff9600"/>`;
      default: return '';
    }
  }
  function zubehoer(a, pose) {
    const dk = '#2b2b2b';
    switch (a.extra) {
      case 'brille': return `<g fill="rgba(255,255,255,.28)" stroke="${dk}" stroke-width="2.2"><circle cx="42" cy="38" r="6.2"/><circle cx="58" cy="38" r="6.2"/></g><path d="M48,38 L52,38" stroke="${dk}" stroke-width="2.2"/>`;
      case 'sonnenbrille': return `<rect x="33" y="33" width="15" height="9" rx="4" fill="${dk}"/><rect x="52" y="33" width="15" height="9" rx="4" fill="${dk}"/><path d="M48,36 L52,36" stroke="${dk}" stroke-width="2.4"/><path d="M36,35 L40,35" stroke="#fff" stroke-width="1.4" opacity=".6"/>`;
      case 'headset': return `<path d="M27,36 C26,8 74,8 73,36" fill="none" stroke="#333" stroke-width="4"/><rect x="22" y="31" width="8" height="13" rx="3.5" fill="#333"/><rect x="70" y="31" width="8" height="13" rx="3.5" fill="#333"/><path d="M27,44 Q29,54 41,52" fill="none" stroke="#333" stroke-width="2.4"/><circle cx="42" cy="52" r="2.6" fill="#ff4b4b"/>`;
      case 'bart': return `<path d="M41,47 Q45.5,43 50,46 Q54.5,43 59,47 Q54.5,50.5 50,48.5 Q45.5,50.5 41,47 Z" fill="${HAAR[a.farbe]}"/>`;
      case 'schal': return `<rect x="33" y="54" width="34" height="8" rx="4" fill="${a.schal}"/><rect x="55" y="58" width="8" height="17" rx="3" fill="${dunkler(a.schal, .88)}"/>`;
      case 'lupe': {
        const [hx, hy] = pose === 'jubel' ? [80, 45] : [75, 89];
        return `<path d="M${hx},${hy} L${hx + 6},${hy - 9}" stroke="#6b4a1a" stroke-width="4" stroke-linecap="round"/><circle cx="${hx + 9}" cy="${hy - 15}" r="8" fill="rgba(190,230,255,.55)" stroke="#6b4a1a" stroke-width="3"/>`;
      }
      default: return '';
    }
  }

  // ---------- Figur zusammensetzen. pose: 'stand' | 'jubel'
  function svg(id, opt = {}) {
    const a = get(id);
    const pose = opt.pose || 'stand';
    const haut = HAUT[a.haut], h = HAAR[a.farbe], jk = a.jacke, jkd = dunkler(jk);
    const jubel = pose === 'jubel';
    const arm = (sx, ex, ey) => `<path d="M${sx},63 L${ex},${ey}" stroke="${jkd}" stroke-width="10" stroke-linecap="round"/><circle cx="${ex + (ex < 50 ? -1 : 1)}" cy="${ey + (jubel ? -3 : 2)}" r="5.6" fill="${haut}"/>`;
    const arme = jubel ? arm(34, 20, 44) + arm(66, 80, 44) : arm(34, 26, 86) + arm(66, 74, 86);
    const kopftuch = a.haar === 'kopftuch';
    const kopf = kopftuch
      ? `<ellipse cx="50" cy="39" rx="19.5" ry="21.5" fill="${dunkler(a.kappe, .85)}"/><ellipse cx="50" cy="39" rx="17" ry="19" fill="${haut}"/><path d="M30,60 Q50,74 70,60" fill="none" stroke="${dunkler(a.kappe, .85)}" stroke-width="2"/>`
      : `<circle cx="28" cy="40" r="4.5" fill="${dunkler(haut, .93)}"/><circle cx="72" cy="40" r="4.5" fill="${dunkler(haut, .93)}"/><circle cx="50" cy="36" r="22" fill="${haut}"/>`;
    const mund = jubel
      ? '<path d="M44,47 Q50,57 56,47 Z" fill="#7a2e2e"/>'
      : '<path d="M45,48 Q50,52.5 55,48" fill="none" stroke="#3b2a24" stroke-width="2.2" stroke-linecap="round"/>';
    const titel = opt.titel === false ? '' : `<title>${a.name}</title>`;
    return `<svg class="av ${opt.klasse || ''}" viewBox="0 0 100 116" role="img" aria-label="Figur ${a.name}" data-av="${a.id}">${titel}
      <ellipse class="av-schatten" cx="50" cy="111" rx="22" ry="4" fill="rgba(0,0,0,.16)"/>
      <g class="av-koerper">
        <g class="av-bein av-bein-l"><path d="M43,90 L43,103" stroke="${a.hose}" stroke-width="10" stroke-linecap="round"/><ellipse cx="42" cy="106" rx="7.5" ry="4.2" fill="#3b3b3b"/></g>
        <g class="av-bein av-bein-r"><path d="M57,90 L57,103" stroke="${a.hose}" stroke-width="10" stroke-linecap="round"/><ellipse cx="58" cy="106" rx="7.5" ry="4.2" fill="#3b3b3b"/></g>
        ${haarHinten(a, h)}
        ${jubel ? arme : ''}
        <path d="M33,62 Q33,56 40,56 L60,56 Q67,56 67,62 L69,90 Q69,95 64,95 L36,95 Q31,95 31,90 Z" fill="${jk}"/>
        <path d="M43,56 L50,67 L57,56 Z" fill="#fff"/><path d="M50,67 L50,94" stroke="${jkd}" stroke-width="1.6"/>
        <circle cx="60.5" cy="70" r="4.4" fill="#ff9600" stroke="#fff" stroke-width="1.4"/>
        ${jubel ? '' : arme}
        ${kopf}
        <g class="av-gesicht">
          <ellipse cx="42" cy="38" rx="3.3" ry="4" fill="#2b2321"/><ellipse cx="58" cy="38" rx="3.3" ry="4" fill="#2b2321"/>
          <circle cx="43.2" cy="36.4" r="1.2" fill="#fff"/><circle cx="59.2" cy="36.4" r="1.2" fill="#fff"/>
          <circle cx="36" cy="46" r="4" fill="#ff7a8a" opacity=".3"/><circle cx="64" cy="46" r="4" fill="#ff7a8a" opacity=".3"/>
          ${mund}
        </g>
        ${kopftuch ? '' : haarVorne(a, h)}
        ${zubehoer(a, pose)}
      </g></svg>`;
  }

  // Auswahl-Raster (Radio-Gruppe). onWahl(id) wird bei jeder Änderung aufgerufen.
  function picker(el, gewaehlt, onWahl) {
    el.classList.add('av-picker');
    el.setAttribute('role', 'radiogroup');
    el.setAttribute('aria-label', 'Figur wählen');
    el.innerHTML = LISTE.map(a => `<button type="button" role="radio" class="av-wahl" data-av="${a.id}" aria-checked="${a.id === gewaehlt}" title="${a.name}">${svg(a.id, { titel: false })}<span>${a.name}</span></button>`).join('');
    el.addEventListener('click', ev => {
      const b = ev.target.closest('.av-wahl');
      if (!b) return;
      el.querySelectorAll('.av-wahl').forEach(x => x.setAttribute('aria-checked', String(x === b)));
      b.classList.remove('hupf'); void b.offsetWidth; b.classList.add('hupf');
      if (onWahl) onWahl(b.dataset.av);
    });
  }

  Kit.avatars = { liste: LISTE, get, name: id => get(id).name, svg, picker, zufall: () => LISTE[Math.floor(Math.random() * LISTE.length)].id };
})();
