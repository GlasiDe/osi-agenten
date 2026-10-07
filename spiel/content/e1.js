/* Einsatz 1 – L1: Spuren am Kabel. IDs NIE ändern (stecken in Spielständen). */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e1');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;

  // Switch-Frontansicht: 24 Ports, oben ungerade, unten gerade. LED: g = 1 Gbit/s, o = 100 Mbit/s, sonst aus
  const LED = { 1: 'g', 2: 'g', 3: 'g', 4: 'g', 5: 'g', 6: 'g', 7: 'o', 8: 'g', 9: 'g', 10: 'g', 11: 'g', 12: 'g', 13: 'g', 14: 'g', 15: 'g', 16: 'g', 17: 'g', 18: 'g', 19: 'g', 23: 'o', 24: 'g' };
  function switchSvg() {
    const w = 940, x0 = 160, pw = 50, gap = 12;
    let s = `<svg viewBox="0 0 ${w} 190" width="${w}" role="img" aria-label="Frontansicht Switch SW-SERVER-01" font-family="Consolas, monospace">
      <rect x="2" y="2" width="${w - 4}" height="150" rx="8" fill="#1c2a2e" stroke="#46616a" stroke-width="2"/>
      <text x="20" y="34" font-size="15" fill="#c9dadd" font-weight="700">SW-SERVER-01</text>
      <text x="20" y="54" font-size="11" fill="#8aa3a9">24-Port Gigabit</text>
      <circle cx="26" cy="80" r="5" fill="#4fd18b"/><text x="38" y="84" font-size="11" fill="#8aa3a9">PWR</text>`;
    for (let i = 1; i <= 24; i++) {
      const col = Math.floor((i - 1) / 2), oben = i % 2 === 1;
      const x = x0 + col * (pw + gap) + Math.floor(col / 6) * 14;
      const y = oben ? 20 : 86;
      const led = LED[i] === 'g' ? '#4fd18b' : LED[i] === 'o' ? '#ff9a2a' : '#34434a';
      const glow = LED[i] ? `<circle cx="${x + 10}" cy="${y + 8}" r="7" fill="${led}" opacity=".25"/>` : '';
      s += `<g class="port" data-pick="${i}">
        <rect class="body" x="${x}" y="${y}" width="${pw}" height="46" rx="4" fill="#0e1618" stroke="#5b7880" stroke-width="1.5"/>
        <rect x="${x + 12}" y="${y + 16}" width="${pw - 24}" height="22" rx="2" fill="#050909"/>
        <rect x="${x + 19}" y="${y + 36}" width="${pw - 38}" height="6" fill="#050909"/>
        ${glow}<circle cx="${x + 10}" cy="${y + 8}" r="4" fill="${led}"/>
        <text x="${x + pw - 6}" y="${y + 12}" text-anchor="end" font-size="11" fill="#c9dadd">${i}</text></g>`;
    }
    s += `<g font-size="12" fill="#c9dadd">
      <circle cx="130" cy="172" r="5" fill="#4fd18b"/><text x="142" y="176">LED grün = Verbindung mit 1 Gbit/s</text>
      <circle cx="400" cy="172" r="5" fill="#ff9a2a"/><text x="412" y="176">LED orange = Verbindung mit 100 Mbit/s</text>
      <circle cx="690" cy="172" r="5" fill="#34434a"/><text x="702" y="176">aus = keine Verbindung</text></g>`;
    return s + '</svg>';
  }

  const patchplan = [
    [1, 'Server SRV-DC01 (DNS/DHCP)'], [2, 'Server SRV-LOHN (Lohnportal)'], [3, 'Server SRV-FILE'], [4, 'NAS Backup'],
    [5, 'Dose B-101 Buchhaltung'], [6, 'Dose B-102 Buchhaltung'], [7, 'Etikettendrucker Lager (alt, nur 100 Mbit/s)'], [8, 'Dose D-201 Disposition'],
    [9, 'Dose D-202 Disposition'], [10, 'Dose D-203 Disposition'], [11, 'Dose V-301 Versand'], [12, 'Dose V-302 Versand'],
    [13, 'Dose G-401 Geschäftsführung'], [14, 'Dose G-402 Geschäftsführung'], [15, 'Access Point Lager'], [16, 'Access Point Büro'],
    [17, 'Dose IT-501'], [18, 'Dose IT-502'], [19, 'Multifunktionsdrucker Versand'], [20, '— frei —'],
    [21, '— frei —'], [22, '— frei —'], [23, '— frei —'], [24, 'Uplink Router/Firewall']
  ];
  function patchplanHtml() {
    const half = Math.ceil(patchplan.length / 2);
    const col = arr => `<table><tr><th>Port</th><th>angeschlossen</th></tr>${arr.map(([p, t]) => `<tr><td>${p}</td><td>${t}</td></tr>`).join('')}</table>`;
    return `<div class="evidence"><h4>📄 Patchplan SW-SERVER-01 · Stand: 01.09.2026 · gez. T. Brandt</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${col(patchplan.slice(0, half))}${col(patchplan.slice(half))}</div></div>`;
  }

  E.steps = [
    {
      id: 'e1-intro', type: 'story', titel: 'Ankunft bei Falkenrath & Oltmanns', bild: 'firma.jpg',
      szenen: [
        { wer: 'system', text: '▶ EINSATZORT · Falkenrath &amp; Oltmanns Logistik GmbH · Industriegebiet Nord · Dienstag, 06:40 Uhr' },
        { wer: 'kalle', text: 'Nieselregen, sechs Uhr vierzig, der Kaffee ist kalt. Perfekte Bedingungen für Netzwerkforensik.' },
        { wer: 'brandt', text: 'Guten Morgen! Thomas Brandt, IT-Leiter. Danke, dass Sie so schnell kommen. Ich habe alles vorbereitet: Serverraum ist aufgeschlossen, Patchplan liegt bereit. Ich versteh das alles nicht – bei uns ist alles dokumentiert!' },
        { wer: 'direktorin', text: '<i>(über Funk)</i> Agentinnen und Agenten, Sie wissen, wie wir vorgehen: <b>Bottom-up, beginnend bei L1.</b> Bevor Sie etwas anfassen, frischt Kalle mit Ihnen auf, worauf es bei der Bitübertragung ankommt.' }
      ]
    },

    {
      id: 'e1-aufgabe', type: 'lesson', tag: 'TRAINING 1 · WAS MACHT L1?', titel: 'Nur Nullen und Einsen – aber schnell',
      html: `
        <p>${L(1)} hat eine einzige Aufgabe: <b>Bits von A nach B bringen</b>. Dazu werden die Nullen und Einsen in <b>physikalische Signale</b> umgewandelt:</p>
        <table class="t">
          <tr><th>Medium</th><th>Signal</th></tr>
          <tr><td>Kupferkabel</td><td>elektrische Spannung</td></tr>
          <tr><td>Glasfaser (LWL)</td><td>Lichtimpulse</td></tr>
          <tr><td>Funk (z. B. WLAN)</td><td>elektromagnetische Wellen</td></tr>
        </table>
        <p>L1 legt fest, <b>wie</b> das passiert: Stecker, Kabeltypen, Pinbelegung, Spannungspegel, Frequenzen – und die <b>Geschwindigkeit</b> (Bitrate, z. B. 100 Mbit/s oder 1 Gbit/s).</p>
        <div class="merk"><b>Wichtig:</b> L1 weiß <b>nichts</b> über Adressen, Absender oder Inhalte. Für L1 ist alles nur ein Strom aus Bits. Wer mit wem redet, entscheidet erst L2.</div>
        <p>Beim Einstecken eines Kabels passiert übrigens schon L1-Magie: Die beiden Netzwerkanschlüsse <b>handeln die Geschwindigkeit aus</b> (<i>Autonegotiation</i>). Kann ein Gerät nur 100 Mbit/s, läuft die Verbindung mit 100 Mbit/s – das seht ihr oft an der Farbe der LED am Switch.</p>`,
      kalle: 'Merkt euch das mit der LED-Farbe. Nur so ein Gefühl.'
    },
    {
      id: 'e1-aufgabe-quiz', type: 'quiz', titel: 'L1-Check',
      fragen: [
        { id: 'e1-q-signal', frage: 'In welcher Form überträgt eine Glasfaser die Bits?', optionen: ['Als Lichtimpulse', 'Als elektrische Spannung', 'Als Funkwellen', 'Als MAC-Adressen'], richtig: 0, erklaerung: 'Glas leitet Licht – Lichtwellenleiter (LWL).', hinweise: ['Der deutsche Fachbegriff lautet Licht…leiter.'] },
        { id: 'e1-q-weiss', frage: 'Was „weiß“ L1 über die Daten, die sie überträgt?', optionen: ['Nichts – für L1 sind es nur Bits.', 'Die MAC-Adresse des Ziels.', 'Die IP-Adresse des Ziels.', 'Welches Programm die Daten bekommt.'], richtig: 0, erklaerung: 'L1 kennt keine Adressen. Das ist genau der Grund, warum ein Hub (L1) an alle verteilt.', hinweise: ['Welche Adressen gibt es auf L1? Denkt an ein Kabel: Kann ein Kabel Adressen lesen?'] },
        { id: 'e1-q-auto', frage: 'Ein alter Drucker kann nur 100 Mbit/s, der Switch-Port kann 1 Gbit/s. Was passiert beim Einstecken?', optionen: ['Beide einigen sich automatisch auf 100 Mbit/s.', 'Es kommt gar keine Verbindung zustande.', 'Sie läuft mit 1 Gbit/s, der Drucker verliert Daten.', 'Der Switch schaltet den Port dauerhaft ab.'], richtig: 0, erklaerung: 'Autonegotiation: Beide Seiten einigen sich beim Einstecken auf die höchste Geschwindigkeit, die beide können – hier 100 Mbit/s.', hinweise: ['Schaut noch einmal in den letzten Absatz der Lektion.'] }
      ]
    },

    {
      id: 'e1-medien', type: 'lesson', tag: 'TRAINING 2 · ÜBERTRAGUNGSMEDIEN', titel: 'Kupfer, Glas und Luft',
      html: `
        <h3>Kupfer: Twisted Pair</h3>
        <p>Das typische Netzwerkkabel im Büro: <b>vier Adernpaare</b>, jeweils miteinander <b>verdrillt</b> (<i>twisted</i>). Durch die Verdrillung heben sich Störungen von außen weitgehend auf. Stecker: <b>RJ45</b>.</p>
        <table class="t">
          <tr><th>Kategorie</th><th>typisch für</th></tr>
          <tr><td>Cat 5e</td><td>bis 1 Gbit/s</td></tr>
          <tr><td>Cat 6 / Cat 6A</td><td>bis 10 Gbit/s (6A auf voller Länge)</td></tr>
          <tr><td>Cat 7 / Cat 8</td><td>Verlegekabel für hohe Anforderungen / sehr kurze Strecken im Rechenzentrum</td></tr>
        </table>
        <ul><li><b>Maximale Länge</b> einer Strecke: <b>100 m</b></li>
          <li><b>UTP</b> = ungeschirmt, <b>S/FTP</b> = geschirmt (besser gegen Störungen, z. B. neben Maschinen)</li>
          <li>Günstig, einfach zu verlegen – aber <b>empfindlich gegenüber elektromagnetischen Störungen</b> (Motoren, Starkstrom)</li></ul>
        <h3>Glasfaser: Lichtwellenleiter (LWL)</h3>
        <ul><li>Überträgt <b>Licht</b> – dadurch <b>unempfindlich gegen elektromagnetische Störungen</b></li>
          <li><b>Multimode</b>: einige hundert Meter, z. B. zwischen Gebäuden auf dem Gelände</li>
          <li><b>Singlemode</b>: viele Kilometer, z. B. zwischen Standorten</li>
          <li>Keine elektrische Verbindung zwischen Gebäuden (kein Ärger mit unterschiedlichen Erdpotentialen, Blitzeinschlag)</li>
          <li>Schwerer anzuzapfen – aber teurer und empfindlich beim Knicken</li></ul>
        <h3>Funk</h3>
        <p>Keine Kabel, dafür Mobilität – ideal für Handscanner und Tablets im Lager. Aber: geteiltes Medium, Reichweite begrenzt, jeder in der Nähe kann die Signale empfangen.</p>
        <div class="merk"><b>🔒 Akte WLAN – gesperrt.</b> Standards, Frequenzen und Verschlüsselung beim WLAN bekommt ihr in einem späteren Einsatz.</div>`,
      kalle: 'Kupfer: billig. Glas: schnell und weit. Funk: bequem. Und alle drei gehen kaputt, wenn ein Gabelstapler drüberfährt. Na gut, Funk nicht.'
    },
    {
      id: 'e1-medien-sort', type: 'sort', titel: 'Medien-Einsatzplanung bei F&O', punkte: 8, spalten: true,
      intro: '<p>Herr Brandt plant die Modernisierung des Firmennetzes. Welches Medium passt am besten zu welcher Situation?</p>',
      bins: [
        { id: 'kupfer', label: 'Kupfer (Twisted Pair)', sub: 'RJ45, bis 100 m' },
        { id: 'lwl', label: 'Glasfaser (LWL)', sub: 'Licht, große Distanzen' },
        { id: 'funk', label: 'Funk', sub: 'mobil, ohne Kabel' }
      ],
      items: [
        { id: 'e1-ms-dispo', text: 'PC in der Disposition, 25 m bis zum Verteilerschrank', ziel: 'kupfer', erklaerung: 'Kurze Strecke im Büro – der Klassiker für Kupfer.', hinweis: 'Unter 100 m, normales Büro …' },
        { id: 'e1-ms-halle', text: 'Verbindung Bürogebäude ↔ Lagerhalle, 350 m', ziel: 'lwl', erklaerung: '350 m sind zu lang für Kupfer (max. 100 m) → LWL (Multimode). Bonus: keine elektrische Verbindung zwischen den Gebäuden.', hinweis: 'Wie lang darf eine Kupferstrecke höchstens sein?' },
        { id: 'e1-ms-scanner', text: 'Handscanner der Lagerarbeiter, die ständig unterwegs sind', ziel: 'funk', erklaerung: 'Wer sich bewegt, braucht Funk.', hinweis: 'Würdet ihr einem Lagerarbeiter ein Kabel hinterherziehen?' },
        { id: 'e1-ms-motoren', text: 'Kabelweg direkt neben den großen Elektromotoren der Förderbänder', ziel: 'lwl', erklaerung: 'Starke elektromagnetische Störungen → Licht lässt sich davon nicht stören.', hinweis: 'Welches Medium ist unempfindlich gegen elektromagnetische Störungen?' },
        { id: 'e1-ms-server', text: 'Server im Rack, 2 m bis zum Switch', ziel: 'kupfer', erklaerung: 'Kurz, günstig, einfach: Kupfer.', hinweis: 'Zwei Meter, im selben Schrank …' },
        { id: 'e1-ms-standort', text: 'Eigene Leitung zum zweiten Standort, 12 km entfernt', ziel: 'lwl', erklaerung: 'Kilometer → LWL, und zwar Singlemode.', hinweis: 'Kilometer schafft nur ein Medium.' },
        { id: 'e1-ms-tablet', text: 'Tablet am Gabelstapler', ziel: 'funk', erklaerung: 'Mobil → Funk.', hinweis: 'Der Gabelstapler fährt herum …' },
        { id: 'e1-ms-drucker', text: 'Drucker im Versandbüro, 8 m vom Netzwerkschrank', ziel: 'kupfer', erklaerung: 'Kurze Strecke, feste Position → Kupfer.', hinweis: 'Fester Platz, kurze Strecke.' }
      ]
    },

    {
      id: 'e1-geraete', type: 'lesson', tag: 'TRAINING 3 · L1-GERÄTE', titel: 'Geräte, die nichts verstehen',
      html: `
        <p>Auf ${L(1)} arbeiten alle Geräte, die Signale weitergeben, <b>ohne</b> Adressen zu lesen:</p>
        <table class="t">
          <tr><th>Gerät</th><th>Was es tut</th></tr>
          <tr><td>Kabel &amp; Stecker</td><td>leiten die Signale</td></tr>
          <tr><td>Patchfeld</td><td>Anschlussleiste im Schrank: Hier enden die fest verlegten Kabel der Netzwerkdosen, mit kurzen Patchkabeln geht es weiter zum Switch</td></tr>
          <tr><td>Repeater</td><td>verstärkt/erneuert das Signal, damit es weiter kommt</td></tr>
          <tr><td>Medienkonverter</td><td>wandelt z. B. elektrische Signale (Kupfer) in Licht (LWL) um – und zurück</td></tr>
          <tr><td>Hub</td><td>„Mehrfachsteckdose“ fürs Netz: schickt alles, was an einem Port reinkommt, an <b>alle</b> anderen Ports</td></tr>
        </table>
        <div class="merk"><b>Warum ist ein Hub gefährlich?</b> Weil <b>jedes angeschlossene Gerät alles mitbekommt</b>. Wer einen Hub zwischen einen PC und den Switch hängt, kann den gesamten Verkehr dieses PCs mitlesen. Deshalb gibt es in modernen Netzen keine Hubs mehr – nur noch Switches (L2).</div>
        <h3>Die LEDs am Switch</h3>
        <p>Die LED an jedem Port verrät euch L1-Informationen: <b>Leuchtet sie?</b> → Es gibt ein Signal (Link). <b>Blinkt sie?</b> → Es fließen Daten. <b>Welche Farbe?</b> → Bei vielen Switches zeigt die Farbe die ausgehandelte Geschwindigkeit.</p>`,
      kalle: 'Ein Hub im Netz ist wie ein Großraumbüro, in dem alle ihre Telefonate auf Lautsprecher führen.'
    },
    {
      id: 'e1-wer', type: 'quiz', titel: 'Wer bin ich? – L1-Edition',
      fragen: [
        { id: 'e1-wer-patch', frage: '„In mir enden die fest in der Wand verlegten Kabel der Netzwerkdosen. Von mir geht es mit kurzen Kabeln zum Switch.“', optionen: ['Patchfeld', 'Hub', 'Router', 'Medienkonverter'], richtig: 0, erklaerung: 'Das Patchfeld – passiv, reines L1.', hinweise: ['Schaut in die Tabelle der Lektion: Anschlussleiste im Schrank …'] },
        { id: 'e1-wer-konv', frage: '„Links kommt Strom rein, rechts geht Licht raus. Und umgekehrt.“', optionen: ['Medienkonverter', 'Repeater', 'Switch', 'Patchfeld'], richtig: 0, erklaerung: 'Der Medienkonverter verbindet Kupfer und Glasfaser – auf L1.', hinweise: ['Er wandelt zwischen zwei Medien.'] },
        { id: 'e1-wer-hub2', frage: '„Mit mir kann jeder alles mithören. Deshalb findet man mich heute kaum noch.“', optionen: ['Hub', 'Switch', 'Router', 'Patchfeld'], richtig: 0, erklaerung: 'Der Hub verteilt an alle Ports – der Albtraum jeder IT-Sicherheit.', hinweise: ['Großraumbüro mit Lautsprecher-Telefonaten …'] },
        { id: 'e1-wer-schicht', frage: 'Was haben Patchfeld, Medienkonverter, Repeater und Hub gemeinsam?', optionen: ['Sie arbeiten auf L1 und lesen keine Adressen.', 'Sie arbeiten auf L2 und lesen MAC-Adressen.', 'Sie arbeiten auf L3 und verbinden IP-Netze.', 'Sie arbeiten auf L7 und verstehen Protokolle.'], richtig: 0, erklaerung: 'Alle vier geben nur Signale weiter – L1.', hinweise: ['Lesen sie irgendeine Adresse?'] }
      ]
    },

    {
      id: 'e1-serverraum', type: 'story', titel: 'Im Serverraum', bild: 'kalle_einsatz.jpg',
      szenen: [
        { wer: 'system', text: '▶ Serverraum F&amp;O · Untergeschoss · 07:15 Uhr' },
        { wer: 'brandt', text: 'Das hier ist unser Herzstück. Alle Server und der zentrale Switch. Hier kommt nur rein, wer eine berechtigte Schlüsselkarte hat – oder den Generalschlüssel.' },
        { wer: 'kalle', text: 'Schöner Schrank. Ordentlich gepatcht. Fast zu ordentlich. Schaut euch mal den Switch an und vergleicht ihn mit dem Patchplan von Herrn Brandt. Ich will wissen, ob hier irgendwas hängt, das hier nicht hingehört.' }
      ]
    },
    {
      id: 'e1-switch', type: 'quiz', titel: 'Tatort Switch',
      intro: '<p>Oben seht ihr die Frontansicht des Switches, darunter den Patchplan. <b>Vergleicht beides sorgfältig.</b></p>',
      kontext: () => `<div class="switch-wrap">${switchSvg()}</div>${patchplanHtml()}`,
      fragen: [
        { id: 'e1-sw-port', pick: true, frage: 'Welcher Port <b>widerspricht dem Patchplan</b>? Klickt ihn am Switch an.', richtig: '23', erklaerung: 'Port 23 ist laut Plan frei – aber die LED leuchtet. Da hängt etwas, das nicht dokumentiert ist!', hinweise: ['Vergleicht für jeden Port: Was steht im Patchplan – und was zeigt die LED?', 'Schaut euch besonders die Ports an, die laut Plan frei sind (20 bis 23).'], falsch: { 20: 'Port 20 ist laut Plan frei – und die LED ist auch aus. Passt also.', 21: 'Port 21 ist laut Plan frei – und die LED ist auch aus. Passt also.', 22: 'Port 22 ist laut Plan frei – und die LED ist auch aus. Passt also.', 7: 'Port 7 leuchtet orange – aber laut Patchplan hängt dort der Etikettendrucker. Der ist dokumentiert.' } },
        { id: 'e1-sw-farbe', frage: 'Die LED von Port 23 leuchtet <b>orange</b>. Was bedeutet das laut Legende?', optionen: ['Die Verbindung läuft mit 100 Mbit/s.', 'Die Verbindung läuft mit 1 Gbit/s.', 'Der Port ist defekt.', 'Es fließen gerade keine Daten.'], richtig: 0, erklaerung: 'Orange = 100 Mbit/s. Das angeschlossene Gerät kann offenbar kein Gigabit – ein kleines, einfaches Gerät?', hinweise: ['Die Legende steht unter dem Switch.'] },
        { id: 'e1-sw-port7', frage: 'Port 7 leuchtet ebenfalls orange. Ist das verdächtig?', optionen: ['Nein – dort hängt laut Patchplan ein alter Drucker.', 'Ja – dort hängt bestimmt ein zweites fremdes Gerät.', 'Ja – orange bedeutet immer einen Angriff.', 'Nein – Port 7 ist laut Patchplan frei.'], richtig: 0, erklaerung: 'Dokumentation schlägt Bauchgefühl: Der alte Etikettendrucker steht im Plan und kann nur 100 Mbit/s – das erklärt die orange LED. Deshalb ist ein aktueller Patchplan so wertvoll.', hinweise: ['Was steht im Patchplan bei Port 7?'] },
        { id: 'e1-sw-wer', frage: 'Wer hat die 100 Mbit/s an Port 23 eigentlich festgelegt?', optionen: ['Switch-Port und Gerät haben sie automatisch ausgehandelt.', 'Der Router hat sie per IP-Adresse festgelegt.', 'Der DNS-Server hat sie vorgegeben.', 'Herr Brandt hat sie per Hand eingestellt.'], richtig: 0, erklaerung: 'Autonegotiation ist eine L1-Funktion: Switch-Port und Gerät einigen sich beim Einstecken auf eine Geschwindigkeit. Das fremde Gerät hat sich damit selbst verraten – es kann offenbar kein Gigabit.', hinweise: ['Erinnert euch an die erste Lektion dieses Einsatzes.'] }
      ]
    },
    {
      id: 'e1-fund', type: 'quiz', titel: 'Der Fund', bild: 'serverraum.jpg',
      intro: `<img class="scene-img" src="img/serverraum.jpg" alt="Kleines schwarzes Gerät am Switch im Licht einer Taschenlampe">
        <div class="kallebox"><img class="kalle-click" src="img/kalle.jpg" alt="Kalle"><div><b class="kalle-name">Kalle:</b> Da haben wir den Übeltäter. Kleines schwarzes Kästchen, keine Beschriftung, Strom über USB aus dem Server daneben. Verbunden mit einem <b>grauen Patchkabel, RJ45, Aufdruck „Cat 5e“, 50 cm</b>. Die LEDs blinken fröhlich vor sich hin.</div></div>`,
      fragen: [
        { id: 'e1-fund-medium', frage: 'Über welches Übertragungsmedium ist das Gerät angeschlossen?', optionen: ['Kupfer (Twisted Pair)', 'Glasfaser (Multimode)', 'Funk', 'Glasfaser (Singlemode)'], richtig: 0, erklaerung: 'RJ45 + Cat 5e = Twisted-Pair-Kupferkabel.', hinweise: ['RJ45 ist der typische Stecker für …'] },
        {
          id: 'e1-fund-weiss', multi: true, frage: 'Was wissen wir <b>allein aus L1</b> über das Gerät?',
          optionen: ['Es ist mit Port 23 verbunden.', 'Die Verbindung läuft mit 100 Mbit/s.', 'Es hängt an einem Kupferkabel.', 'Wir kennen seine MAC-Adresse.', 'Wir kennen seine IP-Adresse.', 'Wir wissen, wer es angeschlossen hat.'],
          richtig: [0, 1, 2],
          erklaerung: 'L1 liefert uns: <b>Wo</b> (Port 23), <b>wie</b> (Kupfer) und <b>wie schnell</b> (100 Mbit/s). Adressen gibt es auf L1 nicht – für die MAC-Adresse brauchen wir L2, für die IP-Adresse L3.',
          hinweise: ['Kennt L1 irgendwelche Adressen?', 'Drei Antworten stimmen – alle, die man mit Augen und LEDs feststellen kann.']
        },
        { id: 'e1-fund-abziehen', frage: 'Kalle will das Gerät sofort abziehen. Die Direktorin funkt: „Nein! Stecken lassen – das ist mit Herrn Brandt so abgesprochen.“ Warum ist das in <i>diesem</i> Fall richtig?', optionen: ['Wir wollen erst beobachten, ohne den Täter zu warnen.', 'Netzwerkkabel darf man im Betrieb nie abziehen.', 'Der Switch-Port würde beim Abziehen beschädigt.', 'Das Gerät würde dann seine IP-Adresse vergessen.'], richtig: 0, erklaerung: 'Erst beobachten, dann handeln: Abziehen würde den Angriff zwar stoppen, aber den Täter warnen und Beweise auf L2 bis L7 vernichten. Die Einheit 7 schneidet stattdessen den Verkehr mit.<div class="merk" style="margin-bottom:0"><b>⚠ Wichtig für die Praxis:</b> Im echten Betrieb gilt immer, was die <b>IT-Sicherheitsrichtlinie bzw. der Notfallplan</b> des Unternehmens vorschreibt – und dort steht bei einem Angriff oft genau das Gegenteil: <b>„betroffenes Gerät sofort vom Netz trennen“</b>. Die Einheit 7 hat hier einen ausdrücklichen Ermittlungsauftrag und stimmt ihr Vorgehen mit der IT-Leitung ab. Ihr als Mitarbeitende haltet euch an die Vorgaben eures Betriebs und meldet Auffälligkeiten sofort der IT-Sicherheit.</div>', hinweise: ['Was verlieren wir, wenn das Gerät plötzlich offline geht?'] }
      ]
    },
    {
      id: 'e1-kabeltester', type: 'quiz', bonus: true, titel: 'Bonus-Akte: Der Portstatus',
      intro: `<p>Das Kabel bleibt stecken – also kein Kabeltester. Stattdessen öffnet Kalle am Laptop die <b>Verwaltungsoberfläche des Switches</b> und ruft den Status von Port 23 ab:</p>
        <div class="ws" style="padding:10px 14px;line-height:1.7">SW-SERVER-01 › Port 23<br>
        Link ................. aktiv<br>
        Geschwindigkeit ...... 100 Mbit/s<br>
        Aushandlung .......... automatisch (Autonegotiation)<br>
        Switch-Port kann ..... 10 / 100 / 1000 Mbit/s<br>
        Gegenstelle kann ..... 10 / 100 Mbit/s<br>
        Fehlerhafte Frames ... 0</div>`,
      fragen: [
        { id: 'e1-bonus-paare', frage: 'Warum läuft Port 23 nur mit 100 Mbit/s?', optionen: ['Die Gegenstelle kann höchstens 100 Mbit/s.', 'Das Kabel ist beschädigt und bremst die Verbindung.', 'Der Switch-Port kann nur 100 Mbit/s.', 'Der Angreifer hat die Verbindung absichtlich gedrosselt.'], richtig: 0, punkte: 15, erklaerung: 'Die Gegenstelle kann nur 10 oder 100 Mbit/s, der Switch-Port bis 1000 Mbit/s. Autonegotiation wählt das Schnellste, was <b>beide</b> können: 100 Mbit/s. Und „0 fehlerhafte Frames“ zeigt: Am Kabel liegt es nicht. <span class=\"small muted\">Kleiner Zusatz für Profis: 100 Mbit/s-Ethernet nutzt nur zwei der vier Adernpaare im Kabel, Gigabit alle vier.</span>', falsch: { 1: 'Dann gäbe es fehlerhafte Frames – laut Status sind es 0.', 2: 'Schaut in die Zeile „Switch-Port kann“.' }, hinweise: ['Vergleicht die Zeilen „Switch-Port kann“ und „Gegenstelle kann“.', 'Erinnert euch an die Autonegotiation aus der ersten Lektion dieses Einsatzes.'] }
      ]
    },
    {
      id: 'e1-zutritt', type: 'quiz', titel: 'Wer war im Serverraum?', setzt: { krueger: 'entlastet' },
      intro: '<p>Herr Brandt druckt das Protokoll des elektronischen Türschlosses und das Besucherbuch aus. Zur Erinnerung: Die <b>ersten Meldungen</b> über die gefälschte Seite kamen am <b>Montag um 09:30 Uhr</b>. Das Gerät muss also vorher angeschlossen worden sein.</p>',
      kontext: `
        <div class="evidence"><h4>🔐 Zutrittsprotokoll Serverraum · Mi 16.09. bis Di 22.09.2026</h4>
          <table><tr><th>Tag</th><th>Uhrzeit</th><th>Karte / Schlüssel</th><th>Person</th></tr>
            <tr><td>Mi</td><td>17:30</td><td>Karte IT-01</td><td>T. Brandt (IT-Leiter)</td></tr>
            <tr><td>Fr</td><td>14:10</td><td>Generalschlüssel H-01</td><td>Y. Demir (Hausmeister) – siehe Besucherbuch</td></tr>
            <tr><td>Mo</td><td>08:03</td><td>Karte IT-07</td><td>L. Berger (Azubi)</td></tr>
            <tr><td>Mo</td><td>16:40</td><td>Karte IT-01</td><td>T. Brandt (IT-Leiter)</td></tr>
            <tr><td>Di</td><td>07:12</td><td>Karte IT-01</td><td>T. Brandt mit Einheit 7</td></tr></table>
          <p style="margin:8px 0 0">Berechtigte Karten: IT-01, IT-07 · Generalschlüssel: Hausmeister</p></div>
        <div class="evidence"><h4>📒 Besucherbuch Empfang</h4>
          <table><tr><th>Tag</th><th>Zeit</th><th>Name</th><th>Firma</th><th>Grund</th><th>begleitet von</th></tr>
            <tr><td>Fr</td><td>13:55–15:20</td><td>M. Seidel</td><td>PrintPoint Service</td><td>Druckerwartung; Druckserver im Serverraum</td><td>Y. Demir</td></tr></table></div>
        <p class="small muted">Außerdem bekannt: Herr Brandt war am Donnerstag und Freitag gemeinsam mit der Geschäftsführung auf einer Messe und ist laut Hotelrechnung erst am Sonntagabend zurückgekommen. Die Buchhaltung hat keine Serverraum-Karte.</p>`,
      fragen: [
        {
          id: 'e1-zt-wer', multi: true, frage: 'Wer von den Verdächtigen könnte das Gerät <b>vor Montag 09:30</b> im Serverraum angeschlossen haben?',
          optionen: ['Leon Berger (Azubi)', 'Yusuf Demir (Hausmeister)', 'Marco Seidel (Drucker-Techniker)', 'Sabine Krüger (Buchhaltung)'], fest: true,
          richtig: [0, 1, 2],
          erklaerung: 'Berger (Mo 08:03), Demir und Seidel (Fr 14:10) waren vor den ersten Meldungen im Raum. Krüger hat keinen Zugang und taucht nirgends auf.',
          hinweise: ['Geht das Zutrittsprotokoll <i>und</i> das Besucherbuch durch.', 'Seidel hat keine eigene Karte – aber er stand im Besucherbuch.']
        },
        { id: 'e1-zt-entlastet', frage: 'Wen können wir damit <b>vorerst entlasten</b>?', optionen: ['Sabine Krüger', 'Leon Berger', 'Marco Seidel', 'Yusuf Demir'], richtig: 0, erklaerung: 'Frau Krüger kam nicht in den Serverraum. Vorerst entlastet – aber „vorerst“ ist das wichtige Wort. Vielleicht hatte sie ja Hilfe …', hinweise: ['Wer taucht in keinem der beiden Dokumente auf?'] }
      ]
    },
    {
      id: 'e1-cliffhanger', type: 'story', titel: 'Eine Spur für L2', board: true,
      szenen: [
        { wer: 'kalle', text: 'Also: Drei Leute hatten die Gelegenheit. Und wir haben ein Kästchen, das mit 100 Mbit/s an Port 23 hängt. Mehr verrät uns L1 nicht.' },
        { wer: 'kalle', text: 'Aber – jedes Gerät, das in einem Ethernet-Netz mitredet, hat eine <b>MAC-Adresse</b>. Und die ersten Stellen einer MAC-Adresse verraten den <b>Hersteller</b>. Wenn ich rausfinde, <i>was</i> das für ein Kästchen ist …' },
        { wer: 'direktorin', text: 'Gute Arbeit, Agentinnen und Agenten. Die Spur führt nach <b>L2</b>. Kalle schneidet ab sofort den Verkehr am Switch mit. Sobald die Auswertung vorliegt, geht es weiter.' },
        { wer: 'system', text: '▶ Akte „Einsatz 2 – Gestohlene Identität“ wird vorbereitet …' }
      ]
    },
    {
      id: 'e1-aussen', type: 'sealed', bonus: true, titel: 'Außeneinsatz: Wer hört mit?',
      teaser: 'In Packet Tracer baut ihr das Netz der Buchhaltung nach – einmal mit Switch, einmal mit Hub – und beobachtet im Simulationsmodus, wer welche Frames zu sehen bekommt.'
    },
    {
      id: 'e1-ende', type: 'ende', titel: 'Spurensicherung L1 abgeschlossen!', abzeichen: 'e1-fertig', abzeichenOhneTipp: 'e1-ohne-tipp',
      text: '<p>Ihr habt das fremde Gerät gefunden, seine Verbindung auf L1 analysiert und eine Verdächtige vorerst entlastet. Die nächste Spur führt nach <b>L2</b>.</p>'
    }
  ];
})();
