/* Einsatz 0 – Grundausbildung. IDs NIE ändern (stecken in Spielständen). */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e0');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;

  E.steps = [
    // ------------------------------------------------------------ Intro
    {
      id: 'e0-intro', type: 'story', titel: 'Alarm in der Zentrale', bild: 'hq.jpg',
      szenen: [
        { wer: 'system', text: '▶ EINGEHENDER NOTRUF · Falkenrath &amp; Oltmanns Logistik GmbH · Priorität HOCH' },
        { wer: 'direktorin', text: 'Guten Morgen, Agentinnen und Agenten. Schön, dass Sie da sind – Sie kommen genau richtig. Heute Nacht ist ein Notruf der <b>Falkenrath &amp; Oltmanns Logistik GmbH</b> eingegangen. Eine Spedition, 180 Mitarbeitende, Lagerhallen, LKW-Flotte.' },
        { wer: 'direktorin', text: '<b>37 Mitarbeitende</b> haben seit Montag ihre Zugangsdaten auf einer <b>gefälschten Lohnabrechnungs-Seite</b> eingegeben. Die Seite sah exakt aus wie das echte Lohnportal. Jemand greift also gerade Passwörter ab – mitten im Firmennetz.' },
        { wer: 'kalle', text: 'Moin. Ich bin Kalle, ich mach hier die Technik. Und bevor ihr fragt: Nein, „einfach das Passwort ändern“ reicht nicht. Wir müssen rausfinden, <i>wie</i> das passiert ist. Sonst passiert es morgen wieder.' },
        { wer: 'direktorin', text: 'Die Einheit 7 ermittelt in Netzwerken <b>Schicht für Schicht</b> – daher unser Name. Bevor ich Sie zum Tatort schicke, absolvieren Sie die Grundausbildung. Kalle bringt Ihnen das Wichtigste bei.' },
        { wer: 'kalle', text: 'Keine Sorge, ich halt’s kurz. Und wenn ihr hängt: Ich geb Tipps. Die kosten allerdings ein paar Punkte – Kaffee ist teuer.' }
      ]
    },

    // ------------------------------------------------------------ Warum Schichten?
    {
      id: 'e0-warum', type: 'lesson', tag: 'TRAINING 1 · WARUM SCHICHTEN?', titel: 'Wie eine Spedition',
      html: `
        <p>Wie kommt eine Palette von Hamburg nach München? Bei F&amp;O ist das Teamarbeit – und <b>jede Abteilung macht nur ihren Teil</b>:</p>
        <table class="t">
          <tr><th>Abteilung</th><th>Was sie tut</th><th>Was sie <i>nicht</i> interessiert</th></tr>
          <tr><td>Vertrieb</td><td>nimmt den Auftrag an</td><td>welcher LKW fährt</td></tr>
          <tr><td>Lager</td><td>verpackt, klebt Etiketten</td><td>welche Autobahn genommen wird</td></tr>
          <tr><td>Disposition</td><td>plant die Route über Umschlagplätze</td><td>was in den Kartons ist</td></tr>
          <tr><td>Fahrerin/Fahrer</td><td>fährt die nächste Etappe</td><td>wer der Endkunde ist</td></tr>
        </table>
        <p>Jede Abteilung gibt ihr Ergebnis über eine <b>feste Übergabe</b> an die nächste weiter. Deshalb kann man eine Abteilung austauschen, ohne die anderen zu ändern: Fährt die Palette mit dem Zug statt mit dem LKW, muss der Vertrieb nichts anders machen.</p>
        <div class="merk"><b>Genau so funktionieren Netzwerke.</b> Die Kommunikation wird in <b>Schichten</b> zerlegt. Jede Schicht hat eine klare Aufgabe, nutzt die Schicht darunter und bietet der Schicht darüber einen Dienst an. Beispiel: Ob der PC per Kabel oder WLAN angeschlossen ist – dem Browser ist das egal.</div>
        <p>Das bekannteste Schichtenmodell ist das <b>OSI-Modell</b> (Open Systems Interconnection) mit <b>sieben Schichten</b>.</p>`,
      kalle: 'Für uns Ermittler das Wichtigste: Wenn was kaputt ist, fragen wir <i>„Auf welcher Schicht liegt das Problem?“</i> – und schon ist der Heuhaufen siebenmal kleiner.'
    },
    {
      id: 'e0-warum-quiz', type: 'quiz', titel: 'Kurzer Check: Schichten',
      fragen: [
        {
          id: 'e0-q-warum-1', frage: 'Ein PC bei F&amp;O wird vom Netzwerkkabel auf WLAN umgestellt. Was muss am Webbrowser geändert werden?',
          optionen: ['Nichts – der Browser bekommt den Wechsel gar nicht mit.', 'Der Browser braucht ein zusätzliches WLAN-Plugin.', 'Alle Webseiten müssen für WLAN angepasst werden.', 'Die IP-Adressen aller Server müssen geändert werden.'],
          richtig: 0,
          erklaerung: 'Der Browser arbeitet auf einer höheren Schicht und bekommt vom Wechsel nichts mit. Genau das ist der Vorteil von Schichten: Man kann die Übertragung (unten) austauschen, ohne die Anwendung (oben) zu ändern.',
          hinweise: ['Denkt an die Spedition: Muss der Vertrieb etwas ändern, wenn die Palette mit dem Zug statt mit dem LKW fährt?']
        },
        {
          id: 'e0-q-warum-2', frage: 'Welchen Vorteil hat das Schichtenmodell bei der Fehlersuche?',
          optionen: ['Man kann den Fehler einer Schicht zuordnen und eingrenzen.', 'Es verhindert, dass überhaupt Fehler auftreten.', 'Man braucht keine Werkzeuge wie ping mehr.', 'Fehler entstehen nur noch in der obersten Schicht.'],
          richtig: 0,
          erklaerung: 'Schicht für Schicht prüfen = eingrenzen. So arbeiten Admins – und die Einheit 7.',
          hinweise: ['Kalle hat es gerade gesagt: Der Heuhaufen wird kleiner …']
        }
      ]
    },

    // ------------------------------------------------------------ Die 7 Schichten
    {
      id: 'e0-sieben', type: 'lesson', tag: 'TRAINING 2 · DIE SIEBEN SCHICHTEN', titel: 'L1 bis L7',
      html: `
        <p>In der Praxis redet niemand von der „Vermittlungsschicht“. Man sagt <b>L3</b>. Ein „L2-Switch“, ein „L1-Problem“ – das ist euer neuer Wortschatz. <b>Die Nummern sind wichtiger als die Namen.</b></p>
        <div class="figure">${OSI.svgStapel({ eselsbruecke: true })}</div>
        <div class="merk"><b>Merksatz (von L1 nach oben):</b> <span class="hl">B</span>ei <span class="hl">S</span>turm <span class="hl">v</span>erlieren <span class="hl">T</span>anker <span class="hl">s</span>chnell <span class="hl">d</span>ie <span class="hl">A</span>nker<br>
          <b>B</b>itübertragung ${L(1)} · <b>S</b>icherung ${L(2)} · <b>V</b>ermittlung ${L(3)} · <b>T</b>ransport ${L(4)} · <b>S</b>itzung ${L(5)} · <b>D</b>arstellung ${L(6)} · <b>A</b>nwendung ${L(7)}</div>
        <p>Wichtiger als die Namen ist aber, <b>was auf welcher Nummer passiert</b>:</p>
        <ul>
          <li>${L(1)} überträgt nur <b>Bits als Signale</b> – Strom, Licht, Funk. Adressen kennt L1 nicht.</li>
          <li>${L(2)} stellt <b>im selben Netz</b> zu – mit <b>MAC-Adressen</b>. Typisches Gerät: Switch.</li>
          <li>${L(3)} findet den Weg <b>über mehrere Netze</b> – mit <b>IP-Adressen</b>. Typisches Gerät: Router.</li>
          <li>${L(4)} bringt die Daten zum richtigen <b>Programm</b> – mit <b>Ports</b>, per TCP oder UDP.</li>
          <li>${L(5)} – ${L(7)} kümmern sich um Sitzungen, Datenformate und die eigentlichen <b>Anwendungsprotokolle</b> wie HTTP oder DNS.</li>
        </ul>
        <p class="small muted">In der Praxis sind L5, L6 und L7 meist in einem Protokoll zusammengefasst (siehe TCP/IP-Modell gleich). <span class="egg" data-egg="pizza" title="?">[?]</span></p>`,
      kalle: 'Den Merksatz hab ich von einem Kapitän. Der hatte auch dauernd Netzwerkprobleme an Bord.'
    },
    {
      id: 'e0-sort', type: 'sort', titel: 'Schichten-Sortierer', punkte: 8, abzeichenFehlerfrei: 'sortierer-perfekt',
      intro: '<p>Kalle hat seine Kiste mit Begriffen umgekippt. Sortiert jeden Begriff in die richtige Schicht.</p>',
      bins: [7, 6, 5, 4, 3, 2, 1].map(n => ({ id: n, kurz: 'L' + n, farbe: n, label: OSI.handbuch.find(h => h.n === n).name, sub: OSI.handbuch.find(h => h.n === n).en })),
      items: [
        { id: 'e0-sort-switch', text: 'Switch', ziel: 2, erklaerung: 'Der klassische Switch leitet Frames anhand der MAC-Adresse weiter → L2.', hinweis: 'Mit welcher Adresse arbeitet ein Switch?' },
        { id: 'e0-sort-utf8', text: 'Zeichenkodierung (UTF-8)', ziel: 6, erklaerung: 'Wie Zeichen als Bytes dargestellt werden – Darstellung → L6.', hinweis: 'Es geht darum, wie Daten dargestellt werden.' },
        { id: 'e0-sort-kabel', text: 'Patchkabel', ziel: 1, erklaerung: 'Kabel übertragen Signale – reine L1.', hinweis: 'Kann ein Kabel Adressen lesen? Es leitet nur Signale weiter.' },
        { id: 'e0-sort-ip', text: 'IP-Adresse', ziel: 3, erklaerung: 'IP-Adressen = L3.', hinweis: 'Mit IP-Adressen arbeitet der Router.' },
        { id: 'e0-sort-tcp', text: 'TCP', ziel: 4, erklaerung: 'TCP ist ein Transportprotokoll → L4.', hinweis: 'TCP und UDP sind Transportprotokolle.' },
        { id: 'e0-sort-dns', text: 'DNS', ziel: 7, erklaerung: 'DNS übersetzt Namen in IP-Adressen – ein Anwendungsdienst → L7.', hinweis: 'Ein Dienst, den Anwendungen nutzen, um Namen aufzulösen.' },
        { id: 'e0-sort-hub', text: 'Hub', ziel: 1, erklaerung: 'Ein Hub versteht keine Adressen, er verteilt nur Signale an alle Ports → L1.', hinweis: 'Ein Hub schaut sich keine einzige Adresse an.' },
        { id: 'e0-sort-mac', text: 'MAC-Adresse', ziel: 2, erklaerung: 'MAC-Adressen = L2.', hinweis: 'Mit MAC-Adressen arbeitet der Switch.' },
        { id: 'e0-sort-sitzung', text: 'Sitzung auf- und abbauen', ziel: 5, erklaerung: 'Sitzungen verwalten – L5.', hinweis: 'Das Wort steckt schon im Namen der Schicht.' },
        { id: 'e0-sort-maske', text: 'Subnetzmaske', ziel: 3, erklaerung: 'Die Subnetzmaske gehört zur IP-Adresse → L3.', hinweis: 'Sie steht in ipconfig immer direkt unter der IPv4-Adresse.' },
        { id: 'e0-sort-port', text: 'Portnummer', ziel: 4, erklaerung: 'Ports = L4.', hinweis: 'Ports gehören zu TCP und UDP.' },
        { id: 'e0-sort-repeater', text: 'Repeater', ziel: 1, erklaerung: 'Ein Repeater verstärkt nur das Signal → L1.', hinweis: 'Er frischt nur das Signal auf.' },
        { id: 'e0-sort-http', text: 'HTTP', ziel: 7, erklaerung: 'HTTP ist das Protokoll des Webbrowsers → L7.', hinweis: 'Womit spricht der Browser mit dem Webserver?' },
        { id: 'e0-sort-router', text: 'Router', ziel: 3, erklaerung: 'Router verbinden Netze anhand der IP-Adresse → L3.', hinweis: 'Ein Router verbindet verschiedene Netze. Welche Adresse braucht man dafür?' },
        { id: 'e0-sort-udp', text: 'UDP', ziel: 4, erklaerung: 'UDP ist ebenfalls ein Transportprotokoll → L4.', hinweis: 'Der kleine, schnelle Bruder von TCP.' }
      ]
    },

    // ------------------------------------------------------------ Kapselung
    {
      id: 'e0-kapsel-lektion', type: 'lesson', tag: 'TRAINING 3 · KAPSELUNG', titel: 'Karton, Palette, LKW',
      html: `
        <p>Beim Senden läuft jede Nachricht <b>von oben nach unten</b> durch die Schichten. Jede Schicht packt die Daten der Schicht darüber ein und klebt ihr eigenes „Etikett“ davor – den <b>Header</b>. Das nennt man <b>Kapselung</b>.</p>
        <table class="t">
          <tr><th>Schicht</th><th>Spedition</th><th>Netzwerk</th></tr>
          <tr><td>${L(7)}</td><td>die Ware</td><td>die <b>Daten</b>, z. B. ein Login-Formular</td></tr>
          <tr><td>${L(4)}</td><td>Karton mit Etikett „an Abteilung Lohn“</td><td>+ <b>TCP/UDP-Header</b> mit Ports (welches Programm?)</td></tr>
          <tr><td>${L(3)}</td><td>Palette mit Zieladresse „München, Hafenstr. 5“</td><td>+ <b>IP-Header</b> mit Quell- und Ziel-IP (welcher Rechner, weltweit?)</td></tr>
          <tr><td>${L(2)}</td><td>LKW für die <i>nächste Etappe</i> bis zum nächsten Umschlagplatz</td><td>+ <b>Ethernet-Header</b> vorne mit MAC-Adressen (nächstes Gerät im selben Netz) <b>und</b> + <b>Ethernet-Trailer</b> hinten mit einer Prüfsumme (FCS)</td></tr>
          <tr><td>${L(1)}</td><td>die Straße</td><td>alles wird zu <b>Bits</b> – Strom, Licht oder Funk</td></tr>
        </table>
        <div class="frame-vis" style="margin:14px 0"><div class="l2">Ethernet</div><div class="l3">IP</div><div class="l4">TCP</div><div class="daten">Daten</div><div class="fcs">Trailer (FCS)</div></div>
        <div class="merk"><b>Nur L2 packt vorne <u>und</u> hinten etwas an:</b> Header + Trailer. Alle anderen Schichten fügen nur einen Header an.</div>
        <p>Beim Empfänger geht es <b>von unten nach oben</b>: Jede Schicht liest „ihr“ Etikett, entfernt es und gibt den Rest nach oben weiter – die <b>Entkapselung</b>.</p>
        <p>Das heißt auch: <b>Jeder Header wird genau von der gleichen Schicht beim Empfänger gelesen</b>, die ihn beim Sender geschrieben hat. Den TCP-Header, den L4 beim Sender schreibt, liest nur L4 beim Empfänger – wie das Etikett der Abteilung, das nur die Abteilung am Ziel interessiert. Man sagt: Jede Schicht „spricht“ mit ihrer <b>Partnerschicht</b> auf der Gegenseite und benutzt dafür die Schichten darunter als Transportmittel.</p>
        <div class="merk"><b>Der wichtigste Trick:</b> Am Umschlagplatz wird die Palette auf einen <b>neuen LKW</b> geladen – die Adresse auf der Palette bleibt aber gleich. Im Netz heißt das: Jeder <b>Router</b> packt das Paket in einen <b>neuen Frame mit neuen MAC-Adressen</b>. Die <b>IP-Adressen bleiben</b> vom Start bis zum Ziel gleich.</div>`,
      kalle: 'Das mit dem neuen LKW merkt ihr euch bitte. Das wird im Fall noch wichtig. Sehr wichtig.'
    },
    {
      id: 'e0-kapsel', type: 'kapsel', titel: 'Kapselungs-Puzzle',
      abschluss: 'Senden = von oben nach unten einpacken. Empfangen = von unten nach oben auspacken.',
      phasen: [
        {
          id: 'e0-kap-senden', titel: 'Senden: Der PC in der Buchhaltung schickt das Login-Formular ab', punkte: 20,
          text: '<p>Die Daten kommen von der Anwendung (L7). Baut sie in der richtigen Reihenfolge sendefertig zusammen.</p>',
          start: [{ cls: 'daten', text: 'DATEN: Login-Formular' }],
          korrekt: ['l4', 'l3', 'l2', 'l1'],
          optionen: [
            { key: 'l2', label: 'L2: Ethernet-Header + Ethernet-Trailer anbringen', wrap: { l: { cls: 'l2', text: 'Ethernet-Header | MAC' }, r: { cls: 'fcs', text: 'Trailer (FCS)' } }, falsch: 'Der Frame (L2) ist die äußerste Verpackung – der kommt erst, wenn alles andere drin ist.', ok: '✔ Der LKW ist beladen: Das Paket steckt jetzt in einem Frame.' },
            { key: 'l3', label: 'L3: IP-Header anbringen', wrap: { l: { cls: 'l3', text: 'IP | Ziel-IP' } }, falsch: 'Die Palette (IP) braucht zuerst einen Karton, den sie tragen kann.', ok: '✔ Ziel-IP drauf – jetzt ist es ein Paket.' },
            { key: 'l4', label: 'L4: TCP-Header anbringen', wrap: { l: { cls: 'l4', text: 'TCP | Port 443' } }, ok: '✔ Der Port sagt, welches Programm auf dem Server zuständig ist. Das ist jetzt ein Segment.' },
            { key: 'l1', label: 'L1: Als Bits auf die Leitung schicken', bits: true, falsch: 'Auf die Leitung geht es erst ganz am Schluss – wenn alles verpackt ist.' }
          ],
          erklaerung: 'Daten → Segment (L4) → Paket (L3) → Frame (L2, Header <b>und</b> Trailer) → Bits (L1). Von oben nach unten, jede Schicht packt die Schicht darüber ein.',
          hinweise: ['Von oben nach unten: Welche Schicht liegt direkt unter der Anwendung?', 'Die Reihenfolge ist L4 → L3 → L2 → L1.']
        },
        {
          id: 'e0-kap-empfangen', titel: 'Empfangen: Der Lohn-Server bekommt die Bits', punkte: 20,
          text: '<p>Jetzt seid ihr der Server. Packt die Nachricht in der richtigen Reihenfolge aus, bis die Anwendung die Daten bekommt.</p>',
          startBits: true,
          start: [{ cls: 'l2', text: 'Ethernet-Header | MAC' }, { cls: 'l3', text: 'IP | Ziel-IP' }, { cls: 'l4', text: 'TCP | Port 443' }, { cls: 'daten', text: 'DATEN: Login-Formular' }, { cls: 'fcs', text: 'Trailer (FCS)' }],
          korrekt: ['l1', 'l2', 'l3', 'l4', 'l7'],
          optionen: [
            { key: 'l4', label: 'L4: Port lesen, TCP-Header entfernen', unwrap: true, falsch: 'Den TCP-Header sieht man erst, wenn Frame und IP-Header weg sind.', ok: '✔ Port 443 – ab an den Webserver-Dienst.' },
            { key: 'l1', label: 'L1: Signale in Bits umwandeln → Frame', bits: false, ok: '✔ Aus den Signalen ist wieder ein Frame geworden.' },
            { key: 'l7', label: 'L7: Daten an die Anwendung übergeben', ersetze: [{ cls: 'daten', text: '✔ Login-Formular beim Lohnportal angekommen' }], falsch: 'Die Anwendung bekommt die Daten erst, wenn alle Header entfernt sind.' },
            { key: 'l3', label: 'L3: Ziel-IP prüfen, IP-Header entfernen', unwrap: true, falsch: 'Außen liegt noch etwas anderes um das Paket …', ok: '✔ Die Ziel-IP passt – das Paket ist für diesen Server.' },
            { key: 'l2', label: 'L2: Ziel-MAC & Trailer (FCS) prüfen, Header + Trailer entfernen', unwrap: true, falsch: 'Zuerst müssen aus den Signalen überhaupt wieder Bits werden.', ok: '✔ Ziel-MAC passt, die Prüfsumme im Trailer stimmt – Header und Trailer kommen weg.' }
          ],
          erklaerung: 'Bits (L1) → Frame (L2) → Paket (L3) → Segment (L4) → Daten (L7). Von unten nach oben.',
          hinweise: ['Beim Empfangen läuft alles andersherum: von unten nach oben.', 'Die Reihenfolge ist L1 → L2 → L3 → L4 → L7.']
        }
      ]
    },

    {
      id: 'e0-kapsel-quiz', type: 'quiz', titel: 'Kurzer Check: Kapselung',
      fragen: [
        {
          id: 'e0-q-warum-3', frage: 'Den TCP-Header schreibt L4 beim Sender. Wer liest ihn? Und was folgt daraus: Mit wem „spricht“ eine Schicht eigentlich?',
          optionen: ['Mit derselben Schicht auf der Gegenseite.', 'Nur mit der Schicht direkt über sich.', 'Mit allen sieben Schichten gleichzeitig.', 'Nur mit dem Kabel auf L1.'],
          richtig: 0,
          erklaerung: 'Jede Schicht spricht mit ihrer <b>Partnerschicht</b> auf der Gegenseite und nutzt die Schichten darunter als Transportmittel. L4 beim Sender schreibt den TCP-Header, L4 beim Empfänger liest ihn. L3, L2 und L1 transportieren ihn nur – so wie der LKW das Etikett des Hamburger Lagers nach München bringt, ohne es zu lesen.',
          hinweise: ['Beim Empfänger entfernt jede Schicht „ihren“ Header. Welche Schicht entfernt den TCP-Header?', 'L4 beim Empfänger – also die gleiche Schicht wie beim Sender.']
        },
        {
          id: 'e0-q-trailer', frage: 'Welche Schicht fügt beim Kapseln <b>zusätzlich zum Header</b> auch einen <b>Trailer</b> an?',
          optionen: ['L2', 'L3', 'L4', 'L7'], fest: true, richtig: 0,
          erklaerung: 'Nur L2: Ethernet-Header vorne, Ethernet-Trailer mit der Prüfsumme (FCS) hinten. Mit der Prüfsumme erkennt der Empfänger, ob der Frame unterwegs beschädigt wurde.',
          hinweise: ['Schaut euch die Grafik des Frames in der Lektion noch einmal an: Was steht ganz hinten?']
        }
      ]
    },

    // ------------------------------------------------------------ PDUs & TCP/IP
    {
      id: 'e0-pdu', type: 'lesson', tag: 'TRAINING 4 · FACHSPRACHE', titel: 'Wie heißt das Ding gerade?',
      html: `
        <p>Je nachdem, auf welcher Schicht wir hinschauen, hat die Dateneinheit einen anderen Namen – die <b>PDU</b> (Protocol Data Unit):</p>
        <table class="t">
          <tr><th>Schicht</th><th>PDU</th><th>Wer arbeitet damit?</th></tr>
          <tr><td>${L(5)} – ${L(7)}</td><td><b>Daten</b></td><td>Anwendungen, z. B. Browser, DNS</td></tr>
          <tr><td>${L(4)}</td><td><b>Segment</b> (bei TCP) bzw. <b>Datagramm</b> (bei UDP)</td><td>TCP, UDP</td></tr>
          <tr><td>${L(3)}</td><td><b>Paket</b></td><td>Router, L3-Switch</td></tr>
          <tr><td>${L(2)}</td><td><b>Frame</b></td><td>Switch, Netzwerkkarte</td></tr>
          <tr><td>${L(1)}</td><td><b>Bits</b></td><td>Kabel, Hub, Repeater</td></tr>
        </table>
        <h3>Und das TCP/IP-Modell?</h3>
        <p>Das Internet ist eigentlich nach dem einfacheren <b>TCP/IP-Modell</b> mit vier Schichten gebaut. Das OSI-Modell ist das <b>Denkmodell</b>, mit dem wir analysieren – beide passen gut aufeinander:</p>
        <table class="t">
          <tr><th>OSI</th><th>TCP/IP-Modell</th></tr>
          <tr><td>${L(5)} ${L(6)} ${L(7)}</td><td>Anwendung</td></tr>
          <tr><td>${L(4)}</td><td>Transport</td></tr>
          <tr><td>${L(3)}</td><td>Internet</td></tr>
          <tr><td>${L(1)} ${L(2)}</td><td>Netzzugang</td></tr>
        </table>
        <p class="small muted">Wenn ihr in Wireshark schaut, seht ihr genau diese Aufteilung: Ethernet, IP, TCP/UDP und dann die Anwendung.</p>`,
      kalle: 'Wer „Paket“ sagt, wenn er einen Frame meint, zahlt in die Kaffeekasse. Nur so als Info.'
    },
    {
      id: 'e0-pdu-quiz', type: 'quiz', titel: 'Fachsprache-Check',
      fragen: [
        { id: 'e0-q-pdu-switch', frage: 'Ein Switch leitet … weiter.', optionen: ['Frames', 'Pakete', 'Segmente', 'Datagramme'], richtig: 0, erklaerung: 'Switch = L2 = Frames.', hinweise: ['Auf welcher Schicht arbeitet ein Switch?'] },
        { id: 'e0-q-pdu-l3', frage: 'Wie heißt die PDU auf L3?', optionen: ['Paket', 'Frame', 'Segment', 'Bits'], richtig: 0, erklaerung: 'L3 = IP = Paket. Router arbeiten mit Paketen.', hinweise: ['Denkt an die Palette mit der Zieladresse.'] },
        { id: 'e0-q-pdu-udp', frage: 'Ein DNS-Server verschickt seine Antwort per UDP. Wie heißt die PDU auf L4 dann?', optionen: ['Datagramm', 'Segment', 'Frame', 'Paket'], richtig: 0, erklaerung: 'Bei UDP heißt die L4-PDU Datagramm, bei TCP Segment.', hinweise: ['Bei TCP heißt sie Segment – bei UDP anders.'] },
        {
          id: 'e0-q-pdu-router', frage: 'Ein Paket wird von einem Router in ein anderes Netz weitergeleitet. Was ändert sich dabei?',
          optionen: ['Die MAC-Adressen ändern sich, die IP-Adressen bleiben gleich.', 'Die IP-Adressen ändern sich, die MAC-Adressen bleiben gleich.', 'Beide Adressen bleiben gleich.', 'Beide Adressen ändern sich.'],
          richtig: 0,
          erklaerung: 'Neuer LKW, gleiche Palette: Jeder Router packt das Paket in einen neuen Frame (neue MAC-Adressen). Die IP-Adressen gelten von Anfang bis Ende. <span class="small muted">(Ausnahme NAT – das kommt später.)</span>',
          hinweise: ['Erinnert euch an den Umschlagplatz der Spedition.', 'Der LKW wird gewechselt, die Palette nicht.']
        },
        {
          id: 'e0-q-pdu-reihe', frage: 'Wie ist ein Frame von vorne nach hinten aufgebaut?',
          optionen: ['Ethernet-Header → IP-Header → TCP-Header → Daten → Ethernet-Trailer', 'Ethernet-Header → IP-Header → TCP-Header → Daten', 'IP-Header → Ethernet-Header → TCP-Header → Daten → Ethernet-Trailer', 'Ethernet-Header → IP-Header → TCP-Header → Daten → IP-Trailer'],
          richtig: 0, erklaerung: 'Vorne der Ethernet-Header, dann IP- und TCP-Header, die Daten – und ganz hinten der Ethernet-Trailer. Nur L2 hat einen Trailer.',
          falsch: { 1: 'Da fehlt etwas am Ende! L2 hängt als einzige Schicht zusätzlich einen Trailer an.', 3: 'Einen IP-Trailer gibt es nicht – nur L2 hat einen Trailer.' },
          hinweise: ['Die äußerste Verpackung wurde beim Senden zuletzt angebracht.', 'Denkt an die Prüfsumme hinten am Frame.']
        }
      ]
    },

    // ------------------------------------------------------------ Wer bin ich?
    {
      id: 'e0-wer', type: 'quiz', titel: 'Wer bin ich? – Geräte-Verhör',
      intro: '<p>Kalle hat ein paar Netzwerkgeräte „verhört“. Welches Gerät spricht hier?</p>',
      fragen: [
        { id: 'e0-wer-router', frage: '„Ich verbinde <b>verschiedene Netze</b> und entscheide anhand der <b>Ziel-IP</b>, wohin ein Paket als Nächstes geht.“', optionen: ['Router', 'Switch', 'Hub', 'Repeater'], richtig: 0, erklaerung: 'Der Router – L3. Er ist das „Standardgateway“ in eurem ipconfig.', hinweise: ['Netze verbinden, IP-Adressen lesen …'] },
        { id: 'e0-wer-hub', frage: '„Ich verstehe nichts von Adressen. Was an einem Port reinkommt, schicke ich an <b>alle</b> anderen Ports raus.“', optionen: ['Hub', 'Switch', 'Router', 'L3-Switch'], richtig: 0, erklaerung: 'Der Hub – ein reines L1-Gerät. Und ein Sicherheitsrisiko: Jeder bekommt alles mit.', hinweise: ['Wer an alle verteilt, kann keine Adressen lesen.'] },
        { id: 'e0-wer-l3', frage: '„Ich sehe aus wie ein Switch mit vielen Ports, kann aber zusätzlich <b>zwischen Netzen routen</b>.“', optionen: ['L3-Switch', 'Hub', 'Repeater', 'Patchfeld'], richtig: 0, erklaerung: 'Ein L3-Switch – Switch und Router in einem. Die „3“ im Namen sagt euch, bis zu welcher Schicht er schaut.', hinweise: ['Die Schichtnummer steckt im Namen.'] },
        { id: 'e0-wer-repeater', frage: '„Ich mache nur eines: Ich <b>verstärke das Signal</b>, damit es weiter kommt.“', optionen: ['Repeater', 'Router', 'Switch', 'L3-Switch'], richtig: 0, erklaerung: 'Der Repeater – L1. Er verstärkt Signale, ohne sie zu verstehen.', hinweise: ['„Repeat“ = wiederholen.'] },
        { id: 'e0-wer-switch', frage: '„Ich merke mir, welche <b>MAC-Adresse</b> an welchem Port hängt, und schicke Frames gezielt nur dorthin.“', optionen: ['Switch', 'Hub', 'Router', 'Repeater'], richtig: 0, erklaerung: 'Der Switch – L2. Seine MAC-Adresstabelle ist sein Gedächtnis.', hinweise: ['MAC-Adressen = L2.'] }
      ]
    },

    // ------------------------------------------------------------ Paket-Röntgen
    {
      id: 'e0-roentgen', type: 'quiz', titel: 'Paket-Röntgen',
      intro: `<p>Kalle zeigt euch einen Mitschnitt aus dem Netz von F&amp;O, aufgenommen gestern mit Wireshark. So sieht ein <b>einzelner Frame</b> von innen aus. Klickt auf die Zeilen im unteren Bereich, um sie aufzuklappen – das ist nur zum Untersuchen und zählt nicht als Antwort. <b>Die Aufgaben beantwortet ihr darunter.</b></p>`,
      kontext: () => `
        <div class="ws">
          <div class="ws-bar"><span>Mitschnitt: fo-buchhaltung.pcapng</span><span>Filter: dns</span></div>
          <div class="ws-list">
            <div class="ws-row head"><span>Nr.</span><span>Zeit</span><span>Quelle</span><span>Ziel</span><span>Prot.</span><span>Info</span></div>
            <div class="ws-row sel"><span>42</span><span>3.1172</span><span>192.168.50.123</span><span>192.168.50.10</span><span>DNS</span><span>Standard query A lohn.fo-logistik.intern</span></div>
          </div>
          <div class="ws-tree">
            <div class="ws-node"><div class="ws-lbl"><span class="tri">▸</span>Frame 42: 86 bytes on wire (688 bits), 86 bytes captured</div>
              <div class="ws-kids hidden"><div>Arrival Time: Sep 21, 2026 07:58:14</div><div>Frame Length: 86 bytes (688 bits)</div><div>[Protocols in frame: eth:ethertype:ip:udp:dns]</div></div></div>
            <div class="ws-node"><div class="ws-lbl"><span class="tri">▸</span>Ethernet II, Src: Dell_4a:11:9c (18:66:da:4a:11:9c), Dst: Microsoft_0a:32:10 (00:15:5d:0a:32:10)</div>
              <div class="ws-kids hidden"><div>Destination: 00:15:5d:0a:32:10</div><div>Source: 18:66:da:4a:11:9c</div><div>Type: IPv4 (0x0800)</div></div></div>
            <div class="ws-node"><div class="ws-lbl"><span class="tri">▸</span>Internet Protocol Version 4, Src: 192.168.50.123, Dst: 192.168.50.10</div>
              <div class="ws-kids hidden"><div>Version: 4</div><div>Time to Live: 128</div><div>Protocol: UDP (17)</div><div>Source Address: 192.168.50.123</div><div>Destination Address: 192.168.50.10</div></div></div>
            <div class="ws-node"><div class="ws-lbl"><span class="tri">▸</span>User Datagram Protocol, Src Port: 51234, Dst Port: 53</div>
              <div class="ws-kids hidden"><div>Source Port: 51234</div><div>Destination Port: 53</div><div>Length: 52</div></div></div>
            <div class="ws-node"><div class="ws-lbl"><span class="tri">▸</span>Domain Name System (query)</div>
              <div class="ws-kids hidden"><div>Transaction ID: 0x5c1e</div><div>Questions: 1</div><div>Queries: lohn.fo-logistik.intern: type A, class IN</div></div></div>
          </div>
        </div>`,
      nachKontext: box => {
        box.querySelectorAll('.ws-lbl').forEach(l => l.addEventListener('click', () => {
          const kids = l.nextElementSibling;
          kids.classList.toggle('hidden');
          l.querySelector('.tri').textContent = kids.classList.contains('hidden') ? '▸' : '▾';
        }));
      },
      fragen: [
        { id: 'e0-rt-l2', frage: 'Welche Zeile im Mitschnitt gehört zu <b>L2</b>?', optionen: ['Ethernet II …', 'Frame 42 …', 'Internet Protocol Version 4 …', 'User Datagram Protocol …', 'Domain Name System …'], richtig: 0, erklaerung: '„Ethernet II“ mit den MAC-Adressen ist L2. Die Zeile „Frame 42“ darüber ist nur Wiresharks Zusammenfassung dessen, was auf der Leitung ankam (L1).', hinweise: ['Wo stehen MAC-Adressen?', 'Klappt die Zeilen auf und sucht nach Adressen im Format xx:xx:xx:xx:xx:xx.'], falsch: { 1: '„Frame 42“ ist Wiresharks Zusammenfassung dessen, was an Bits auf der Leitung ankam – das entspricht eher L1.', 2: 'Hier stehen IP-Adressen – das ist L3.', 3: 'Hier stehen Ports – das ist L4.', 4: 'DNS ist die Anwendung – L7.' } },
        { id: 'e0-rt-l3', frage: 'Welche Zeile im Mitschnitt gehört zu <b>L3</b>?', optionen: ['Internet Protocol Version 4 …', 'Ethernet II …', 'Frame 42 …', 'User Datagram Protocol …', 'Domain Name System …'], richtig: 0, erklaerung: '„Internet Protocol Version 4“ – IP = L3.', hinweise: ['Auf L3 arbeitet der Router – mit welchen Adressen?'] },
        { id: 'e0-rt-port', frage: 'An welchen <b>Ziel-Port</b> geht diese Anfrage?', optionen: ['53', '51234', '443', '80'], richtig: 0, erklaerung: 'Ziel-Port 53 – der Standard-Port für DNS. 51234 ist nur ein zufälliger Absender-Port des PCs.', hinweise: ['Klappt die UDP-Zeile auf.', 'Achtet auf „Dst Port“ – Dst = Destination = Ziel.'] },
        { id: 'e0-rt-l4', frage: 'Diese Anfrage nutzt UDP. Wie heißt die PDU auf L4 also?', optionen: ['Datagramm', 'Segment', 'Paket', 'Frame'], richtig: 0, erklaerung: 'UDP → Datagramm. Wireshark schreibt es sogar hin: „User <b>Datagram</b> Protocol“.', hinweise: ['Schaut genau auf den Namen des Protokolls in der Zeile.'] },
        { id: 'e0-rt-l567', frage: 'Warum gibt es keine eigenen Zeilen für L5 und L6?', optionen: ['Das Anwendungsprotokoll (hier DNS) übernimmt ihre Aufgaben mit.', 'Wireshark blendet L5 und L6 aus Sicherheitsgründen aus.', 'Bei UDP werden die Schichten 5 und 6 gelöscht.', 'L5 und L6 gibt es nur bei WLAN-Verbindungen.'], richtig: 0, erklaerung: 'In der Praxis (TCP/IP-Modell) sind L5 bis L7 zur Anwendungsschicht zusammengefasst – DNS erledigt Sitzung, Darstellung und Anwendung in einem Protokoll.', hinweise: ['Erinnert euch an die Tabelle OSI ↔ TCP/IP.'] },
        { id: 'e0-rt-name', frage: 'Nach welchem Namen fragt der PC den DNS-Server?', optionen: ['lohn.fo-logistik.intern', 'srv-dc01.fo-logistik.intern', 'www.fo-logistik.de', 'microsoft.com'], richtig: 0, erklaerung: 'Das Lohnportal! Genau diese Adresse hatten die Mitarbeitenden im Browser – und landeten trotzdem auf der Fälschung.', hinweise: ['Klappt die DNS-Zeile auf.'] }
      ]
    },

    // ------------------------------------------------------------ Diagnose & Triage
    {
      id: 'e0-diagnose', type: 'lesson', tag: 'TRAINING 5 · OSI ALS WERKZEUG', titel: 'Fehler-Triage wie die Profis',
      html: `
        <p>Für Admins ist das OSI-Modell vor allem eins: eine <b>Checkliste für die Fehlersuche</b>. Die klassische Methode ist <b>Bottom-up</b> – von unten nach oben:</p>
        <table class="t">
          <tr><th>Schicht</th><th>Typische Frage</th><th>Typisches Werkzeug</th></tr>
          <tr><td>${L(1)}</td><td>Steckt das Kabel? Leuchtet die Link-LED?</td><td>Augen, Kabeltester</td></tr>
          <tr><td>${L(2)}</td><td>Kennt der Switch das Gerät? Stimmen die MAC-Adressen?</td><td><code>arp -a</code>, Switch-Tabelle</td></tr>
          <tr><td>${L(3)}</td><td>Stimmen IP, Maske, Gateway? Ist der Rechner erreichbar?</td><td><code>ipconfig</code>, <code>ping</code>, <code>tracert</code></td></tr>
          <tr><td>${L(4)}</td><td>Läuft der Dienst auf dem richtigen Port?</td><td><code>netstat</code>, Wireshark</td></tr>
          <tr><td>${L(7)}</td><td>Wird der Name richtig aufgelöst? Antwortet die Anwendung?</td><td><code>nslookup</code>, Browser</td></tr>
        </table>
        <div class="merk"><b>Faustregel:</b> Wenn eine untere Schicht nicht funktioniert, können die oberen gar nicht funktionieren. Also unten anfangen – aber schlau: Klappt <code>ping</code> auf eine IP-Adresse, sind L1 bis L3 schon mal in Ordnung.</div>`,
      kalle: 'Die Hälfte aller Netzwerkprobleme liegt auf L1: Kabel raus, Stuhl drüber, Gabelstapler drauf. Die andere Hälfte liegt auf L8. <span class="small muted">(Eine Schicht 8 gibt es im OSI-Modell natürlich nicht – so nennen Admins scherzhaft den Menschen vor dem Bildschirm.)</span>'
    },
    {
      id: 'e0-triage', type: 'quiz', titel: 'Fehler-Triage',
      intro: '<p>Das Ticketsystem von F&amp;O quillt über. Ordnet jedes Ticket der Schicht zu, auf der das Problem liegt.</p>',
      fragen: [
        { id: 'e0-tr-led', layer: true, ticketNr: 'Ticket #4711 · Disposition', ticket: '„Mein PC hat kein Netz. Hinten am Rechner leuchtet am Netzwerkanschluss gar nichts.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 1, erklaerung: 'Keine Link-LED = kein Signal = L1. Kabel prüfen!', hinweise: ['Die LED zeigt, ob überhaupt ein Signal da ist.'] },
        { id: 'e0-tr-dns', layer: true, ticketNr: 'Ticket #4712 · Buchhaltung', ticket: '„<code>ping 192.168.50.20</code> klappt. Aber <code>ping lohn.fo-logistik.intern</code> sagt: Host nicht gefunden.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 7, erklaerung: 'Per IP klappt alles (L1–L3 ok), nur der Name wird nicht aufgelöst → DNS → L7.', hinweise: ['Mit IP geht es, mit Namen nicht. Wer übersetzt Namen in IP-Adressen?'] },
        { id: 'e0-tr-ipdoppelt', layer: true, ticketNr: 'Ticket #4713 · Versand', ticket: '„Zwei PCs im Versandbüro haben dieselbe IP-Adresse. Einer fliegt immer wieder aus dem Netz.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 3, erklaerung: 'Doppelte IP-Adresse = L3-Problem.', hinweise: ['Es geht um IP-Adressen.'] },
        { id: 'e0-tr-gabel', layer: true, ticketNr: 'Ticket #4714 · Lager', ticket: '„Seit der Gabelstapler über das Kabel gefahren ist, kommen nur noch manchmal Daten an.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 1, erklaerung: 'Beschädigtes Kabel → gestörte Signale → L1. (Kalle hatte recht.)', hinweise: ['Was hat der Gabelstapler beschädigt?'] },
        { id: 'e0-tr-port', layer: true, ticketNr: 'Ticket #4715 · IT', ticket: '„Der Webserver läuft, aber jemand hat den Dienst von Port 80 auf Port 8080 umgestellt. Der Browser findet ihn nicht mehr.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 4, erklaerung: 'Falscher Port → L4.', hinweise: ['Es geht um eine Portnummer.'] },
        { id: 'e0-tr-gateway', layer: true, ticketNr: 'Ticket #4716 · Geschäftsführung', ticket: '„Im Firmennetz geht alles, aber ins Internet komme ich nicht. In <code>ipconfig</code> steht als Standardgateway 192.168.50.254 – der Router hat aber die .1.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 3, erklaerung: 'Falsches Standardgateway → das Paket findet den Weg in fremde Netze nicht → L3.', hinweise: ['Das Gateway ist der Router. Auf welcher Schicht arbeitet er?'] },
        { id: 'e0-tr-mac', layer: true, ticketNr: 'Ticket #4717 · IT', ticket: '„Der Switch hat sich für Port 5 eine falsche MAC-Adresse gemerkt und schickt die Frames an das falsche Gerät.“', frage: 'Auf welcher Schicht liegt das Problem?', richtig: 2, erklaerung: 'MAC-Adressen und Frames → L2.', hinweise: ['Es geht um MAC-Adressen und Frames.'] }
      ]
    },

    // ------------------------------------------------------------ Die Akte
    {
      id: 'e0-akte', type: 'story', titel: 'Die Akte „Lohnzettel“', bild: 'phishing.jpg', board: true,
      szenen: [
        { wer: 'direktorin', text: 'Ausbildung bestanden. Dann zur Sache. Hier ist, was wir wissen:' },
        { wer: 'system', text: '• Seit <b>Montag, 09:30 Uhr</b> melden Mitarbeitende eine „komische“ Lohnportal-Seite.<br>• In der Adresszeile stand die <b>richtige Adresse</b>: lohn.fo-logistik.intern<br>• Das Schloss-Symbol im Browser <b>fehlte</b>.<br>• Betroffen: nur Rechner im <b>Firmennetz</b>, nicht im Homeoffice.' },
        { wer: 'kalle', text: 'Moment. Die Leute haben die <i>richtige</i> Adresse eingetippt und sind trotzdem auf der falschen Seite gelandet? Dann war das keine simple Phishing-Mail. Da hat jemand <b>im Netz selbst</b> rumgefummelt.' },
        { wer: 'direktorin', text: 'Das denke ich auch. Die Geschäftsführung hat vier Personen genannt, die Zugang und womöglich ein Motiv haben. Ich habe sie an unser Board gehängt.' },
        { wer: 'direktorin', text: 'Wir gehen vor wie gelernt: <b>Bottom-up</b>. In einer Stunde fahren Sie mit Kalle zu F&amp;O und beginnen bei <b>L1</b> – im Serverraum.' },
        { wer: 'kalle', text: 'Ich bring Kaffee mit. Und eine Taschenlampe.' }
      ]
    },
    {
      id: 'e0-ende', type: 'ende', titel: 'Grundausbildung bestanden!', abzeichen: 'e0-fertig', abzeichenOhneTipp: 'e0-ohne-tipp',
      text: '<p>Ihr kennt jetzt die sieben Schichten, die Kapselung und die Fachsprache. Weiter geht es mit <b>Einsatz 1: Spuren am Kabel</b>.</p><p class="small muted">Tipp: In den Einsatzakten wartet jetzt auch die <b>Zeit-Challenge</b> auf euch.</p>'
    }
  ];
})();
