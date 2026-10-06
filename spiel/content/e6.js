/* Finale – Die Anklage. IDs NIE ändern (stecken in Spielständen).
   Zeitachse: E3 Mi 23.09., E4 Do 24.09., E5 Fr 25.09., Finale Mo 28.09.2026 (Lohnlauf Di 29.09.).
   Bewusst nur Ermittlersicht: Befunde, Zeitspuren, Protokolle – keine Konfiguration oder Bedienung des Pi. */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e6');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;
  const H = OSI.netz.hosts;
  const LEON_NB = { name: 'NB-IT-07', ip: '192.168.50.117', mac: '18:66:da:4c:3e:07' };
  const KONTO = 'DE27 •••• •••• •••• 4711 06';
  const HANDY = '0157 •••• 48 261';

  // ------------------------------------------------------------ Beweiskarten für die Anklageschrift (Reihenfolge fest, bewusst gemischt)
  const KARTEN = [
    { t: 'Leon zeigte in der Pause einen Raspberry Pi', warum: 'Ein Pi in der Pause ist kein Verbrechen – und der Pi am Switch ist nachweislich nicht Leons Gerät.' },
    { t: 'Pi steckt in SW-SERVER-01, Port 23', warum: '' },
    { t: 'Frau Krüger hat zum Monatsende gekündigt', warum: 'Eine Kündigung ist kein Beweis. Frau Krüger hatte keinen Zugang zum Serverraum – und sie hat die Bankänderungen selbst gemeldet.' },
    { t: 'Bankänderungen von der .66 auf ein Konto', warum: '' },
    { t: 'Herr Demir hat den Generalschlüssel', warum: 'Der Schlüssel erklärt, wie Seidel hineinkam – aber nicht, wer den Pi eingerichtet hat. Herr Demir war in der Zeit am Empfang.' },
    { t: 'Allein im Serverraum am Freitagnachmittag', warum: '' },
    { t: 'Pi antwortet mit TTL 64 (Linux)', warum: 'Das TTL verrät nur das Betriebssystem des Pi – über die Person dahinter sagt es nichts.' },
    { t: 'DNS-Dienst des Pi nennt sich LEON-NB', warum: '' },
    { t: 'Leon betrat Mo 08:03 den Serverraum', warum: 'Dass Leon montags um acht kommt, hat der Täter nur <i>ausgenutzt</i>. Diese Spur hat er nicht selbst gelegt.' },
    { t: 'Servermiete mit Seidels Handynummer', warum: '' },
    { t: 'Leon machte private Portscans', warum: 'Leons Portscans waren ein Fehler – aber sie haben mit dem Pi nichts zu tun.' },
    { t: 'Seidel hilft gern der IT', warum: 'Hilfsbereitschaft ist kein Beweis. Sie hat ihm höchstens die Gelegenheit verschafft.' }
  ];
  const kartenTexte = KARTEN.map(k => k.t);
  const kartenFalsch = feldText => Object.fromEntries(KARTEN.map((k, i) => [i, k.warum ? k.warum : `Diese Karte ist ein echter Beweis – aber sie gehört in ein anderes Feld der Anklage. Gesucht ist hier: <b>${feldText}</b>.`]));

  const FELDER = [
    { id: 'e6-an-gelegenheit', label: 'Gelegenheit' },
    { id: 'e6-an-tatmittel', label: 'Tatmittel', schicht: 'e6-an-tatmittel-l' },
    { id: 'e6-an-verbindung', label: 'Spur zur Person' },
    { id: 'e6-an-motiv', label: 'Motiv', schicht: 'e6-an-motiv-l' },
    { id: 'e6-an-faehrte', label: 'Falsche Fährte', schicht: 'e6-an-faehrte-l' }
  ];

  function anklageschrift() {
    const G = window.OSIGame;
    const st = E.steps.find(s => s.id === 'e6-anklage');
    const q = id => st.fragen.find(f => f.id === id);
    const ok = id => G.itemState(id).ok;
    const leer = '<span class="leer">– noch offen –</span>';
    const p = q('e6-an-person');
    const zeilen = FELDER.map(f => {
      const fq = q(f.id);
      const sq = f.schicht && q(f.schicht);
      const wert = ok(f.id) ? `${KARTEN[fq.richtig].t}${sq && ok(sq.id) ? ' ' + L([].concat(sq.richtig)[0]) : ''}` : leer;
      return `<div class="feld"><b>${f.label}</b><span>${wert}</span></div>`;
    }).join('');
    return `<div class="anklageschrift"><h4>⚖️ Anklageschrift</h4><div class="az">Einheit 7 · Az. E7-2026-0922 · Fall „Lohnzettel“ · Falkenrath &amp; Oltmanns Logistik GmbH</div>
      <div class="feld"><b>Beschuldigt</b><span>${ok(p.id) ? '<b style="color:#8f1d0b">' + p.optionen[p.richtig] + '</b>, Externer Drucker-Techniker (PrintPoint Service)' : leer}</span></div>${zeilen}</div>`;
  }

  E.steps = [
    {
      id: 'e6-intro', type: 'story', titel: 'Alles auf den Tisch', bild: 'e6_tisch.jpg',
      szenen: [
        { wer: 'system', text: '▶ Einheit 7 · Besprechungsraum · Montag, 28.09., 08:30 Uhr' },
        { wer: 'direktorin', text: 'Guten Morgen, Agentinnen und Agenten. Über das Wochenende ist eine Menge Material eingetroffen: der Befundbericht der Polizei-Forensik zur SD-Karte des Pi, die Auskunft des Anbieters zum Server 198.51.100.23, eine Aussage von Herrn Demir – und ein Anruf aus der Buchhaltung.' },
        { wer: 'brandt', text: 'Ich habe außerdem die Lease-Tabelle unseres DHCP-Servers SRV-DC01 exportiert. Den Pi selbst hat niemand von uns mehr angefasst – der ging versiegelt an die Forensik.' },
        { wer: 'kalle', text: 'Und ich habe Kaffee gekocht. Viel Kaffee. Drei Namen am Board, ein Stapel Papier – das wird ein langer Vormittag.' },
        { wer: 'direktorin', text: 'Unsere Regel für heute: <b>Angeklagt wird nur, was wir beweisen können.</b> Wir prüfen jede Person am Board – auch die, bei der es schon „eindeutig“ aussieht. Beginnen wir mit Leon Berger.' }
      ]
    },

    {
      id: 'e6-leon', type: 'quiz', titel: 'Zwei Geräte, ein Klassenbuch',
      intro: `<p>Herr Brandt legt zwei Dokumente auf den Tisch: die <b>Lease-Tabelle</b> des echten DHCP-Servers SRV-DC01 und einen Auszug aus dem <b>Klassenbuch</b> von Leons Berufsschule. Leons Firmen-Notebook heißt <b>NB-IT-07</b>.</p>`,
      kontext: `<div class="evidence"><h4>📋 SRV-DC01 · DHCP · aktive Leases · Stand Mo 21.09.2026, 08:10 Uhr (Auszug)</h4>
          <table><tr><th>Hostname</th><th>IP-Adresse</th><th>MAC-Adresse</th><th>Lease erteilt</th></tr>
            <tr><td>PC-LAGER-03</td><td>192.168.50.152</td><td>18:66:da:4b:31:a8</td><td>Mo 21.09. 06:58</td></tr>
            <tr><td>${LEON_NB.name}</td><td>${LEON_NB.ip}</td><td>${LEON_NB.mac}</td><td>Mo 21.09. 07:52</td></tr>
            <tr><td>PC-BUCH-01</td><td>${H.buch1.ip}</td><td>${H.buch1.mac}</td><td>Mo 21.09. 07:58</td></tr></table>
          <p style="margin:8px 0 0">Lease-Verlauf ${LEON_NB.name}, 07.09.–21.09.: Mo 07.09. 07:49 · Di 08.09. 07:55 · Mi 09.09. 07:51 · Do 10.09. 07:58 · Mo 14.09. 07:50 · Di 15.09. 07:47 · Mi 16.09. 07:53 · Do 17.09. 07:56 · Mo 21.09. 07:52</p></div>
        <div class="evidence"><h4>📒 Berufskolleg Am Kanal · Klassenbuch FI-25B · Freitag, 18.09.2026 (Auszug)</h4>
          <table><tr><th>Stunde</th><th>Zeit</th><th>Fach</th><th>Fehlend</th></tr>
            <tr><td>1–2</td><td>07:45–09:15</td><td>Vernetzte Systeme</td><td>–</td></tr>
            <tr><td>3–4</td><td>09:35–11:05</td><td>Deutsch / Politik</td><td>–</td></tr>
            <tr><td>5–6</td><td>11:25–12:55</td><td>Netzwerklabor (Klassenarbeit)</td><td>–</td></tr>
            <tr><td>7–8</td><td>13:40–15:10</td><td>Anwendungsentwicklung</td><td>–</td></tr></table>
          <p style="margin:8px 0 0">Klasse vollständig anwesend, u. a. L. Berger. Unterschrift der Lehrkräfte liegt vor.</p></div>`,
      fragen: [
        { id: 'e6-l-mac', eingabe: 'mac', frage: 'Welche <b>MAC-Adresse</b> hat Leons Firmen-Notebook?', platzhalter: 'MAC-Adresse', richtig: LEON_NB.mac, erklaerung: `${LEON_NB.mac} – OUI 18:66:da (Dell), wie bei den Firmen-PCs von F&amp;O.`, hinweise: ['Sucht die Zeile mit dem Hostnamen NB-IT-07.'] },
        { id: 'e6-l-zwei', frage: 'Ist NB-IT-07 das Gerät, dessen DNS-Dienst sich als <b>LEON-NB</b> meldet?', optionen: ['Nein – es sind zwei verschiedene Geräte.', 'Ja – Leon hat sein Notebook so getauft.', 'Ja – „NB“ steht schließlich für Notebook.', 'Unklar – Hostnamen werden zufällig vergeben.'], richtig: 0, erklaerung: 'Andere MAC-Adresse (Dell statt Raspberry Pi), andere IP-Adresse (.117 statt .66), gleichzeitig im Netz aktiv: Das sind zwei Geräte. „LEON-NB“ ist nicht der Name von Leons Firmen-Notebook.', hinweise: ['Vergleicht MAC- und IP-Adresse mit denen des Pi.'] },
        { id: 'e6-l-schicht', layer: true, frage: 'Auf welcher Schicht liegt der Beweis, dass es <b>zwei verschiedene Netzwerkkarten</b> sind?', richtig: 2, erklaerung: 'MAC-Adressen gehören zu L2 – die „Ausweise“ der Netzwerkkarten.', hinweise: ['Woran unterscheidet man Netzwerkkarten?'] },
        { id: 'e6-l-freitag', frage: 'Leon sagt: „Freitags bin ich nie im Betrieb.“ Was <b>belegt</b> der Lease-Verlauf dazu?', optionen: ['Nur, dass sein Notebook freitags keine Lease bekam.', 'Dass Leon freitags nie im Betrieb ist.', 'Dass Leon freitags in der Berufsschule sitzt.', 'Nichts – Leases sagen nichts über Geräte.'], richtig: 0, erklaerung: 'Der Verlauf zeigt nur das <b>Notebook</b>: An den Freitagen hat es sich keine Lease geholt. Ob Leon selbst da war, steht nicht drin – er könnte ohne Notebook gekommen sein. Ein Indiz, kein Beweis.', hinweise: ['Welches Gerät taucht im Verlauf auf – und welche Person?'] },
        { id: 'e6-l-alibi', frage: 'Laut Klassenbuch war Leon am Fr 18.09. bis 15:10 in der Schule. Reicht das, um ihn zu entlasten?', optionen: ['Nein – der Pi kann früher angeschlossen worden sein.', 'Ja – wer in der Schule sitzt, war es nicht.', 'Ja – der Pi ging um 14:12 erstmals ins Netz.', 'Nein – Leon hätte die Schule schwänzen können.'], richtig: 0, erklaerung: 'Das Klassenbuch ist ein echter Beleg für Freitag. Aber der Tunnel um 14:12 zeigt nur, wann der Pi zum ersten Mal <i>nach draußen</i> telefoniert hat – nicht, wann er eingesteckt wurde. Ein Gerät mit Zeitsteuerung hätte auch Tage vorher angeschlossen werden können, etwa bei Leons Bandsicherung am Montag davor.', hinweise: ['Was genau wissen wir über 14:12 – und was nicht?'] },
        { id: 'e6-l-name', frage: 'Was ist zum Namen <b>LEON-NB</b> jetzt <b>belegt</b>?', optionen: ['Er gehört nicht zu Leons Firmen-Notebook.', 'Leon hat ihn ganz sicher nicht eingetragen.', 'Jemand will Leon damit gezielt belasten.', 'Leon hat sein Notebook heimlich umbenannt.'], richtig: 0, erklaerung: 'Belegt ist nur: Leons Firmen-Notebook heißt NB-IT-07 und ist ein anderes Gerät. Wer den Namen LEON-NB eingetragen hat – Leon selbst oder jemand, der ihn belasten will –, ist damit noch offen.', hinweise: ['Trennt: Was zeigen die Dokumente – und was vermutet ihr nur?'] }
      ]
    },

    {
      id: 'e6-wartezeit', type: 'quiz', titel: 'Der Pi wartet',
      intro: `<p>Kalle runzelt die Stirn: „Der Tunnel stand seit <b>Freitag, 14:12</b>. Die erste falsche Lease kam erst am <b>Montag</b>.“ Herr Brandt holt das <b>DHCP-Protokoll</b> von SRV-DC01 für diesen Zeitraum.</p>`,
      kontext: `<div class="evidence"><h4>📋 SRV-DC01 · DHCP-Protokoll · Fr 18.09., 14:00 Uhr bis Mo 21.09., 08:20 Uhr (Auszug)</h4>
          <table><tr><th>Zeitpunkt</th><th>Gerät</th><th>Meldung</th></tr>
            <tr><td>Fr 15:02</td><td>PC-LAGER-02</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Fr 16:41</td><td>PC-DISPO-01</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Sa 05:56</td><td>PC-LAGER-01</td><td>DHCPDISCOVER → OFFER 192.168.50.151</td></tr>
            <tr><td>Sa 05:56</td><td>PC-LAGER-01</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Mo 06:58</td><td>PC-LAGER-03</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Mo 07:52</td><td>NB-IT-07</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Mo 07:58</td><td>PC-BUCH-01</td><td>DHCPREQUEST, Server-ID 192.168.50.10 → ACK, Gateway 192.168.50.1, DNS 192.168.50.10</td></tr>
            <tr><td>Mo 08:14</td><td>PC-GF-01</td><td>DHCPDISCOVER → OFFER 192.168.50.153</td></tr>
            <tr><td>Mo 08:14</td><td>PC-GF-01</td><td>DHCPREQUEST, Server-ID 192.168.50.66 → eigenes Angebot zurückgezogen</td></tr></table></div>
        <div class="evidence"><h4>🔐 Zur Erinnerung: Zutrittsprotokoll Serverraum</h4>
          <table><tr><th>Tag</th><th>Uhrzeit</th><th>Person</th></tr>
            <tr><td>Fr 18.09.</td><td>14:10</td><td>Y. Demir (Hausmeister) mit M. Seidel (Drucker-Techniker)</td></tr>
            <tr><td>Mo 21.09.</td><td>08:03</td><td>L. Berger (Azubi)</td></tr></table></div>`,
      fragen: [
        { id: 'e6-w-wochenende', frage: 'Bei welchem DHCP-Server haben sich die Geräte zwischen Freitag 14:12 und Montag 07:58 ihre Einstellungen geholt?', optionen: ['Immer bei SRV-DC01', 'Ab Freitag beim Pi', 'Am Wochenende beim Router', 'Das zeigt das Protokoll nicht'], richtig: 0, erklaerung: 'Jeder Request in diesem Zeitraum nennt die Server-ID .10 – alle Geräte haben das Angebot des echten Servers gewählt. Erst um 08:14 wählt PC-GF-01 die .66.', hinweise: ['Der Request nennt den Server, den der Client gewählt hat.'] },
        { id: 'e6-w-dienst', multi: true, frage: 'Bis Montag 08:14 hat kein Gerät den Pi gewählt. Welche Erklärungen passen zu den bisherigen Beweisen?', optionen: ['Der DHCP-Dienst des Pi lief noch nicht.', 'Die Antwort des Pi kam später als die des echten Servers.', 'Der Pi war am Wochenende vom Netz getrennt.', 'Der Pi hatte am Wochenende keine IP-Adresse.'], richtig: [0, 1], erklaerung: 'Vom Netz getrennt war der Pi nicht – der Tunnel lief ab Freitag durch, mit der .66. Ob sein DHCP-Dienst noch schwieg oder ob er nur langsamer war, kann das Protokoll von SRV-DC01 nicht zeigen: Es sieht nur, welchen Server die Clients <i>wählen</i>. Beides bleibt möglich.', hinweise: ['Erinnert euch an Einsatz 4: Was lief ab Freitag 14:12 ununterbrochen?'] },
        { id: 'e6-w-wem', frage: 'Ab Montag kurz nach acht wählen Geräte den Pi. Für wen sieht <b>dieser Zeitpunkt</b> belastend aus?', optionen: ['Für Leon Berger', 'Für Yusuf Demir', 'Für Marco Seidel', 'Für Thomas Brandt'], richtig: 0, erklaerung: 'Leon betrat um 08:03 den Serverraum. Wer nur auf die Uhr schaut, denkt: Leon war drin – kurz danach ging es los. Ein zeitlicher Zusammenhang ist aber noch kein Beweis.', hinweise: ['Wer war am Montag kurz vorher im Serverraum?'] },
        { id: 'e6-w-wie', multi: true, frage: 'Angenommen, der DHCP-Dienst des Pi lief wirklich erst ab Montag kurz nach acht. Wie kann er gestartet worden sein?', optionen: ['Per Zeitsteuerung auf dem Pi', 'Per Fernzugriff durch den Tunnel', 'Von Hand, direkt am Pi im Serverraum', 'Durch einen Neustart des Switches'], richtig: [0, 1, 2], erklaerung: 'Drei Wege sind denkbar – und einer davon belastet Leon direkt, denn um 08:03 stand er im Serverraum. Mit einem Neustart des Switches hat der Dienst des Pi nichts zu tun. Welcher Weg es war, kann nur die Untersuchung des Pi selbst zeigen.', hinweise: ['Einsatz 4: Wozu dient der Tunnel?'] }
      ]
    },

    {
      id: 'e6-forensik', type: 'quiz', titel: 'Der Befund der Forensik', setzt: { berger: 'frei' },
      intro: `<p>Die Polizei-Forensik hat die SD-Karte des Pi gesichert und ausgewertet. Der Bericht ist knapp – Werkzeuge und Einstellungen des Täters stehen nicht drin, nur die Befunde mit Zeitstempeln aus den Protokollen des Geräts.</p>`,
      kontext: `<div class="evidence"><h4>🔬 Polizei-Forensik · Befundbericht (Kurzfassung) · Asservat 2026-0922-01</h4>
          <p style="margin:0 0 6px">Gegenstand: Einplatinenrechner mit SD-Karte (32 GB), am Fr 25.09.2026 sichergestellt und versiegelt übergeben. Untersucht wurde eine Kopie der SD-Karte; das Original bleibt versiegelt.</p>
          <table><tr><th>Nr.</th><th>Befund</th></tr>
            <tr><td>1</td><td>Betriebssystem: Linux</td></tr>
            <tr><td>2</td><td>Erster Start mit Verbindung zum Firmennetz: Fr 18.09.2026, 14:11 Uhr. Vorher war das Gerät nie in diesem Netz.</td></tr>
            <tr><td>3</td><td>Zeitgesteuerter Auftrag „DHCP-Dienst starten“, einmalig für Mo 21.09.2026, 08:05 Uhr – angelegt am Fr 18.09.2026 um 14:24 Uhr, ausgeführt am Mo 21.09.2026 um 08:05 Uhr</td></tr>
            <tr><td>4</td><td>Name „LEON-NB“ im DNS-Dienst: bereits vor dem ersten Start im Firmennetz eingetragen</td></tr>
            <tr><td>5</td><td>Anmeldungen direkt am Gerät (Tastatur und Bildschirm): nur Fr 18.09.2026, 14:18–14:25 Uhr. Alle späteren Zugriffe: ausschließlich über den Tunnel.</td></tr></table></div>`,
      fragen: [
        { id: 'e6-f-wann', eingabe: 'text', frage: 'Um wie viel Uhr wurde der zeitgesteuerte Auftrag <b>angelegt</b>? (hh:mm)', platzhalter: 'Uhrzeit, z. B. 09:30', richtig: ['14:24', '14.24', '14:24 uhr', '1424'], erklaerung: 'Am Freitag, 18.09., um 14:24 Uhr – während der einzigen Anmeldung direkt am Gerät (Befund 5).', hinweise: ['Befund 3.'] },
        { id: 'e6-f-belegt', multi: true, frage: 'Was ist durch die Befunde 2, 3 und 5 <b>belegt</b>?', optionen: ['Der Pi war vor Freitag nie im Firmennetz.', 'Den DHCP-Start am Montag löste eine Zeitsteuerung aus.', 'Am Montag hat niemand den Pi direkt bedient.', 'Der Name LEON-NB soll Leon gezielt belasten.', 'Herr Seidel hat den Auftrag angelegt.'], richtig: [0, 1, 2], erklaerung: 'Belegt sind Zeitpunkte aus den Protokollen des Geräts: erster Start Freitag 14:11, Auftrag für Montag 08:05, Anmeldungen am Gerät nur Freitag 14:18–14:25. <b>Nicht</b> belegt ist, <i>wer</i> am Gerät saß – und warum der Name LEON-NB gewählt wurde. Das sind Schlussfolgerungen, die weitere Beweise brauchen.', hinweise: ['Ein Befund nennt Zeitpunkte – keine Personen und keine Absichten.'] },
        { id: 'e6-f-leon', frage: 'Kann Leon den Pi eingerichtet oder den DHCP-Dienst gestartet haben?', optionen: ['Nein – zu den Zeiten am Gerät saß er im Unterricht.', 'Ja – am Montag um 08:03 war er im Serverraum.', 'Ja – er hätte es von zu Hause über den Tunnel tun können.', 'Nein – er hat gar keine Karte für den Serverraum.'], richtig: 0, erklaerung: 'Angeschlossen, eingerichtet und mit Zeitsteuerung versehen wurde der Pi am Freitag zwischen 14:11 und 14:25 – direkt am Gerät. Da saß Leon laut Klassenbuch im Unterricht. Am Montag hat niemand den Pi direkt bedient. Damit bleibt kein Beweis gegen Leon übrig: <b>Leon Berger ist entlastet.</b>', hinweise: ['Vergleicht Befund 2, 3 und 5 mit dem Klassenbuch.'] },
        { id: 'e6-f-wer', frage: 'Wer war laut Zutrittsprotokoll und Besucherbuch am Freitag um 14:24 im Serverraum?', optionen: ['Herr Demir und Herr Seidel', 'Leon Berger und Herr Demir', 'Herr Brandt und Herr Seidel', 'Nur Herr Demir allein'], richtig: 0, erklaerung: 'Um 14:10 schloss Herr Demir für Herrn Seidel auf; Herr Seidel war bis 15:20 im Haus. Andere Zutritte gab es am Freitag nicht. Die Protokolle zeigen allerdings nur, wer hineinkam – nicht, wer wann wieder ging.', hinweise: ['Zutrittsprotokoll und Besucherbuch aus Einsatz 1.'] },
        { id: 'e6-f-ttl', frage: 'Welcher Befund bestätigt eure Beobachtung aus Einsatz 2 (ping-Antworten mit <b>TTL 64</b>)?', optionen: ['Befund 1: Linux', 'Befund 2: erster Start', 'Befund 4: Name im DNS', 'Befund 5: Anmeldungen'], richtig: 0, erklaerung: 'Linux startet mit TTL 64, Windows mit 128. Das Indiz aus Einsatz 2 ist jetzt durch einen Befund bestätigt.', hinweise: ['Welcher Startwert gehört zu welchem Betriebssystem?'] },
        { id: 'e6-f-plan', frage: 'Was folgt aus Befund 4 <b>sicher</b>?', optionen: ['Der Pi kam fertig eingerichtet ins Netz.', 'Leon hat den Pi zu Hause vorbereitet.', 'Jemand wollte Leon gezielt belasten.', 'Der echte DNS hat den Namen vergeben.'], richtig: 0, erklaerung: 'Der Name stand schon fest, bevor der Pi zum ersten Mal im Firmennetz war – das Gerät wurde also vorher vorbereitet. Wer es vorbereitet hat und warum gerade dieser Name, sagt der Befund nicht.', hinweise: ['Wann wurde der Name eingetragen?'] },
        { id: 'e6-f-selbst', frage: 'Warum hat Kalle die SD-Karte nicht einfach selbst in seinen Laptop gesteckt und nachgeschaut?', optionen: ['Beweisstücke untersucht nur die Forensik.', 'SD-Karten lassen sich nicht auslesen.', 'Kalle hatte keinen Kartenleser dabei.', 'Die Karte ist mit TLS verschlüsselt.'], richtig: 0, erklaerung: 'Schon das Einstecken kann Daten auf der Karte verändern – dann taugt sie vor Gericht nicht mehr als Beweis. Deshalb arbeitet die Forensik mit einer <b>Kopie</b>, das Original bleibt versiegelt.', hinweise: ['Was passiert mit einem Beweis, an dem jemand herumprobiert hat?'] }
      ],
      nachKontext: box => { if (!box.querySelector('#forensik-merk')) { const d = document.createElement('div'); d.id = 'forensik-merk'; d.className = 'merk'; d.innerHTML = '<b>⚠ Im Betrieb gilt:</b> Fremde Geräte, die ihr im Netz findet, nicht selbst untersuchen, nicht ausschalten, nicht „mal eben“ auslesen. Meldet den Fund nach den <b>IT-Sicherheitsvorgaben eures Betriebs</b> an die zuständige Stelle (IT-Leitung bzw. Informationssicherheit). Was gesichert und wer eingeschaltet wird, entscheiden die – nicht ihr.'; box.querySelector('#kontext').after(d); } }
    },

    {
      id: 'e6-demir', type: 'quiz', titel: 'Die Aussage des Hausmeisters', setzt: { demir: 'frei' },
      intro: `<p>Herr Demir hat am Wochenende bei der Polizei ausgesagt. Dazu liegt das <b>Empfangsbuch</b> vom Freitag vor.</p>`,
      kontext: `<div class="evidence"><h4>📝 Zeugenaussage Yusuf Demir (Auszug) · aufgenommen Sa 26.09.2026</h4>
          <p style="white-space:normal;margin:0 0 6px">„Herr Seidel kam am Freitag wie immer gegen zwei. Auf dem Flur hat er gefragt, wann denn montags mal jemand von der IT im Serverraum ist – er müsse da noch was am Druckserver nachsehen lassen. Ich hab gesagt: Montags um acht macht der Azubi immer die Bandsicherung.“</p>
          <p style="white-space:normal;margin:0 0 6px">„Um zehn nach zwei hab ich ihm den Serverraum aufgeschlossen. Kurz danach rief der Empfang an, eine Lieferung fürs Lager, ich musste unterschreiben. Herr Seidel meinte, ich solle ruhig gehen, er komme klar. Als ich zurückkam, war es so gegen halb drei – er hatte seine Werkzeugkiste schon zu und hat sich bedankt.“</p>
          <p style="white-space:normal;margin:0">„Ich weiß ja, dass Externe begleitet werden müssen. Aber er kommt seit Jahren und ist immer so hilfsbereit …“</p></div>
        <div class="evidence"><h4>📒 Empfang · Warenannahme · Freitag, 18.09.2026</h4>
          <table><tr><th>Uhrzeit</th><th>Vorgang</th><th>Unterschrift</th></tr>
            <tr><td>14:13</td><td>Spedition Kröger, 3 Paletten Verpackungsmaterial (Lager) angenommen</td><td>Y. Demir</td></tr>
            <tr><td>14:27</td><td>Ware gezählt, Lieferschein quittiert</td><td>Y. Demir</td></tr></table></div>`,
      fragen: [
        { id: 'e6-d-beleg', frage: 'Für welche Zeit ist Herrn Demirs Abwesenheit vom Serverraum durch ein <b>Dokument</b> belegt – nicht nur durch seine Aussage?', optionen: ['Von 14:13 bis 14:27', 'Von 14:10 bis etwa 14:30', 'Für den ganzen Nachmittag', 'Für gar keine Zeit'], richtig: 0, erklaerung: 'Das Empfangsbuch trägt zwei Unterschriften von Herrn Demir: 14:13 und 14:27. Dazwischen war er an der Warenannahme. „Gegen halb drei“ ist nur seine Erinnerung.', hinweise: ['Welche Uhrzeiten stehen im Empfangsbuch?'] },
        { id: 'e6-d-fenster', multi: true, frage: 'Welche Ereignisse fallen in die Zeit, in der Herr Demir nachweislich an der Warenannahme war?', optionen: ['Erster Start des Pi im Firmennetz', 'Erster Tunnel nach draußen', 'Zeitgesteuerter Auftrag angelegt', 'Anmeldung direkt am Pi', 'Erste falsche Lease an einen PC'], richtig: [2, 3], erklaerung: 'Die Anmeldung am Gerät (14:18–14:25) und das Anlegen des Auftrags (14:24) liegen vollständig in Herrn Demirs belegter Abwesenheit. Erster Start (14:11) und Tunnel (14:12) liegen davor, also außerhalb des belegten Zeitraums. Ob Herr Demir da schon gegangen war, belegt kein Dokument. Die erste falsche Lease kam erst am Montag.', hinweise: ['Vergleicht mit dem Forensik-Befund und mit Einsatz 4.'] },
        { id: 'e6-d-montag', frage: 'Laut Aussage wusste Herr Seidel seit Freitag, dass Leon montags um acht im Serverraum ist. Was bedeutet das für die Ermittlung?', optionen: ['Er kannte den Zeitpunkt, der Leon belastet.', 'Er hatte dadurch Zugang zum Serverraum.', 'Er konnte so die Bandsicherung stören.', 'Es beweist, dass er der Täter ist.'], richtig: 0, erklaerung: 'Seidel kannte den Zeitpunkt, zu dem der DHCP-Start auf Leon zeigen würde. Das ist ein Indiz, kein Beweis – es zeigt, dass er die falsche Spur hätte legen <i>können</i>.', hinweise: ['Erinnert euch an die Zeitsteuerung auf 08:05.'] },
        { id: 'e6-d-regel', frage: 'Gegen welche Regel hat Herr Demir verstoßen?', optionen: ['Externe nie allein im Serverraum lassen', 'Den Generalschlüssel nie verleihen', 'Lieferungen nur vormittags annehmen', 'Den Serverraum nie aufschließen'], richtig: 0, erklaerung: 'Externe müssen in Technikräumen ständig begleitet werden. Genau diese Viertelstunde hat für die Einrichtung des Pi gereicht.', hinweise: ['Herr Demir sagt es im letzten Absatz selbst.'] },
        { id: 'e6-d-mittaeter', frage: 'Herr Demir sagt, er habe von nichts gewusst. Was <b>stützt</b> das?', optionen: ['Das Empfangsbuch', 'Seine 22 Jahre im Betrieb', 'Seine Hilfsbereitschaft', 'Sein Generalschlüssel'], richtig: 0, erklaerung: 'Dienstjahre und ein freundliches Wesen sind keine Beweise. Belegt ist: Während der Pi eingerichtet wurde, quittierte Herr Demir an der Warenannahme. Für eine Beteiligung gibt es keinen Beweis – er hat einen Fehler gemacht und wurde ausgenutzt. <b>Herr Demir ist entlastet.</b>', hinweise: ['Was davon ist ein Beleg – und was nur ein guter Eindruck?'] }
      ]
    },

    {
      id: 'e6-krueger', type: 'quiz', titel: 'Frau Krügers Fund', setzt: { krueger: 'frei' },
      intro: `<p>Frau Krüger hat zum Monatsende gekündigt und übergibt ihre Aufgaben. Dabei geht sie wie jeden Monat vor dem Lohnlauf das <b>Änderungsprotokoll</b> des Lohnportals durch – und ruft sofort bei Herrn Brandt an.</p>`,
      kontext: `<div class="evidence"><h4>📋 Lohnportal · Änderungsprotokoll · Feld „Bankverbindung“ · 01.–27.09.2026</h4>
          <table><tr><th>Zeitpunkt</th><th>Beschäftigte(r)</th><th>Abteilung</th><th>angemeldet als</th><th>Quell-IP</th><th>neue Bankverbindung</th></tr>
            <tr><td>Di 08.09. 10:14</td><td>Hoffmann, S.</td><td>Buchhaltung</td><td>Hoffmann, S.</td><td>192.168.50.122</td><td>Sparkasse · DE61 •••• •••• •••• 3381 09</td></tr>
            <tr><td>Mo 21.09. 22:47</td><td>Becker, R.</td><td>Disposition</td><td>Becker, R.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr>
            <tr><td>Di 22.09. 23:05</td><td>Yilmaz, F.</td><td>Buchhaltung</td><td>Yilmaz, F.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr>
            <tr><td>Mi 23.09. 22:51</td><td>Lindner, M.</td><td>Versand</td><td>Lindner, M.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr>
            <tr><td>Mi 23.09. 22:55</td><td>Kowalski, M.</td><td>Versand</td><td>Kowalski, M.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr>
            <tr><td>Do 24.09. 23:02</td><td>Nguyen, T.</td><td>Disposition</td><td>Nguyen, T.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr>
            <tr><td>Do 24.09. 23:06</td><td>Wagner, P.</td><td>Versand</td><td>Wagner, P.</td><td>192.168.50.66</td><td>Nordbank Direkt · ${KONTO}</td></tr></table>
          <p style="margin:8px 0 0">Nächster Lohnlauf: Di 29.09.2026. Kontonummern im Protokoll gekürzt.</p></div>`,
      fragen: [
        { id: 'e6-k-ip', eingabe: 'ip', frage: 'Von welcher <b>IP-Adresse</b> kamen die auffälligen Änderungen?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Von der .66 – dem Pi. Kein PC eines Beschäftigten hat diese Adresse.', hinweise: ['Spalte „Quell-IP“.'] },
        { id: 'e6-k-schicht', layer: true, frage: 'Auf welcher Schicht liegt diese Spur: die <b>Quell-IP</b> im Protokoll?', richtig: 3, erklaerung: 'IP-Adressen → L3.', hinweise: ['Welche Schicht arbeitet mit IP-Adressen?'] },
        { id: 'e6-k-gemeinsam', frage: 'Was haben die Änderungen von der .66 gemeinsam – außer der IP-Adresse?', optionen: ['Dasselbe Zielkonto, immer spätabends', 'Alle Beschäftigten aus dem Versand', 'Alle direkt am Lohnserver eingetragen', 'Alle von Frau Krüger freigegeben'], richtig: 0, erklaerung: 'Immer dasselbe Konto bei der Nordbank Direkt, immer zwischen 22:45 und 23:10. Die Änderung von Frau Hoffmann am 08.09. ist dagegen unauffällig: tagsüber, von einem Firmen-PC, eigene Bank.', hinweise: ['Vergleicht die Spalten Zeitpunkt und neue Bankverbindung.'] },
        { id: 'e6-k-konten', frage: 'Die Änderungen liefen unter den Konten der Beschäftigten selbst. Was folgt daraus?', optionen: ['Der Täter kannte ihre Zugangsdaten.', 'Die Beschäftigten waren alle beteiligt.', 'Das Lohnportal hat sich selbst verstellt.', 'Frau Krüger hat die Konten verwaltet.'], richtig: 0, erklaerung: 'Wer sich unter fremdem Namen anmeldet, kennt die Zugangsdaten. Es sind Beschäftigte, deren PCs über den Pi ins Lohnportal kamen (Einsatz 2, 3 und 5). Deshalb hat Herr Brandt am Freitag alle Passwörter zurückgesetzt.', hinweise: ['Wer kann sich unter einem fremden Namen anmelden?'] },
        { id: 'e6-k-motiv', frage: 'Worauf deuten die Änderungen als <b>Motiv</b> hin?', optionen: ['Gehälter auf ein fremdes Konto umleiten', 'Die Firma F&amp;O öffentlich bloßstellen', 'Leon Berger um seine Stelle bringen', 'Lohndaten an die Konkurrenz verkaufen'], richtig: 0, erklaerung: 'Beim Lohnlauf am Dienstag wären sechs Gehälter auf dasselbe Konto geflossen. Wem das Konto gehört, ist noch offen. Herr Brandt hat den Lohnlauf sofort angehalten.', hinweise: ['Was wäre beim Lohnlauf am Dienstag passiert?'] },
        { id: 'e6-k-entlastet', frage: 'Ist Frau Krüger damit entlastet?', optionen: ['Ja – kein Beweis spricht gegen sie.', 'Nein – wer kündigt, hat ein Motiv.', 'Nein – sie kennt das Lohnportal zu gut.', 'Ja – weil sie die Änderungen meldet.'], richtig: 0, erklaerung: 'Kein Zugang zum Serverraum, keine Spur im Netz, kein Bezug zum Konto. Eine Kündigung ist kein Beweis – und dass sie den Fund meldet, allein auch nicht. Entscheidend ist: Es bleibt nichts gegen sie übrig. <b>Frau Krüger ist entlastet.</b>', hinweise: ['Gibt es irgendeinen Beweis gegen sie?'] }
      ]
    },

    {
      id: 'e6-server', type: 'quiz', titel: 'Wem gehört 198.51.100.23?',
      intro: `<p>Über die Staatsanwaltschaft ist die <b>Auskunft des Anbieters</b> eingetroffen, bei dem der Server 198.51.100.23 gemietet ist. Herr Brandt legt den <b>Serviceauftrag</b> von PrintPoint vom 18.09. daneben.</p>`,
      kontext: `<div class="evidence"><h4>🏢 NordHost Rechenzentrum GmbH · Bestandsdatenauskunft (Auszug)</h4>
          <table><tr><th>Feld</th><th>Angabe</th></tr>
            <tr><td>Produkt</td><td>Virtueller Server „Mini“, IPv4 198.51.100.23</td></tr>
            <tr><td>Bestellt / freigeschaltet</td><td>Mi 16.09.2026, 21:38 / 21:41 Uhr (Freischaltung per SMS-Code)</td></tr>
            <tr><td>Kunde</td><td>L. Berger</td></tr>
            <tr><td>E-Mail</td><td>lb-it-2006@wegwerfpost.example</td></tr>
            <tr><td>Mobilnummer</td><td>${HANDY}</td></tr>
            <tr><td>Zahlung</td><td>Lastschrift · Nordbank Direkt · ${KONTO}</td></tr></table>
          <p style="margin:8px 0 0">Telefonnummer und Kontonummer für die Akte gekürzt.</p></div>
        <div class="evidence"><h4>🖨️ PrintPoint Service · Serviceauftrag PP-2026-0918-07</h4>
          <table><tr><th>Feld</th><th>Angabe</th></tr>
            <tr><td>Kunde</td><td>Falkenrath &amp; Oltmanns Logistik GmbH</td></tr>
            <tr><td>Einsatz</td><td>Fr 18.09.2026, 13:55–15:20 Uhr</td></tr>
            <tr><td>Leistung</td><td>Wartung Etagendrucker EG/1. OG, Druckserver im Serverraum geprüft</td></tr>
            <tr><td>Techniker</td><td>Marco Seidel · Mobil für Rückfragen: ${HANDY}</td></tr>
            <tr><td>Unterschrift Kunde</td><td>Y. Demir</td></tr></table></div>`,
      fragen: [
        { id: 'e6-s-kunde', frage: 'Auf welchen Namen ist der Server angemeldet?', optionen: ['L. Berger', 'M. Seidel', 'Y. Demir', 'PrintPoint Service'], richtig: 0, erklaerung: '„L. Berger“ – schon wieder Leon. Aber einen Namen kann bei einer Bestellung jeder eintippen, und die E-Mail-Adresse ist ein Wegwerf-Postfach.', hinweise: ['Zeile „Kunde“.'] },
        { id: 'e6-s-handy', frage: 'Welche Angabe verbindet den Server mit dem <b>Serviceauftrag</b>?', optionen: ['Die Mobilnummer', 'Die E-Mail-Adresse', 'Der Name des Kunden', 'Das Bestelldatum'], richtig: 0, erklaerung: 'Dieselbe Mobilnummer beim Anbieter und auf dem Serviceauftrag. Einen Namen kann man frei eintippen – an die Mobilnummer ging aber der SMS-Code zur Freischaltung, das Telefon musste also wirklich vorhanden sein.', hinweise: ['Vergleicht die beiden Dokumente Zeile für Zeile.'] },
        { id: 'e6-s-konto', frage: 'Welche Angabe verbindet den Server mit den <b>Bankänderungen</b> im Lohnportal?', optionen: ['Das Konto für die Lastschrift', 'Die Mobilnummer des Kunden', 'Der Name des Kunden', 'Die IPv4-Adresse des Servers'], richtig: 0, erklaerung: 'Die Servermiete wird von genau dem Konto bezahlt, auf das die sechs Gehälter fließen sollten. Tunnel-Server und Bankänderungen hängen am selben Konto.', hinweise: ['Schaut euch die Zeile „Zahlung“ an – und das Änderungsprotokoll von Frau Krüger.'] },
        { id: 'e6-s-datum', frage: 'Was folgt aus dem Bestelldatum <b>sicher</b>?', optionen: ['Der Server stand vor dem Besuch bereit.', 'Herr Seidel hat den Server selbst bestellt.', 'Leon hat den Server am Mittwoch bestellt.', 'Der Server gehört zu einer anderen Tat.'], richtig: 0, erklaerung: 'Bestellt am Mittwoch, Pi angeschlossen am Freitag: Die Gegenstelle für den Tunnel war vorher fertig. Wer am Mittwochabend bestellt hat, zeigt das Datum allein nicht – dafür braucht es Mobilnummer und Konto.', hinweise: ['Wann wurde der Pi angeschlossen?'] },
        { id: 'e6-s-port', eingabe: 'zahl', frage: 'Über welchen <b>Ziel-Port</b> lief der Tunnel vom Pi zu diesem Server?', platzhalter: 'Portnummer', richtig: '22', erklaerung: 'Port 22 – SSH. Über diesen Rückkanal ließ sich der Pi von außen erreichen.', hinweise: ['Schaut ins Router-Verbindungsprotokoll aus Einsatz 4.'] }
      ]
    },

    {
      id: 'e6-anklage', type: 'anklage', titel: 'Die Anklageschrift',
      intro: `<p>Die Direktorin schiebt euch ein leeres Formular hin: „Sie haben alles in der Hand, Agentinnen und Agenten. Wählen Sie die beschuldigte Person – und belegen Sie die Anklage mit je <b>einer</b> Beweiskarte pro Feld. Vorsicht: Nicht jede Karte im Stapel ist ein Beweis.“</p>`,
      kontext: anklageschrift,
      fragen: [
        { id: 'e6-an-person', frage: 'Wen klagt ihr an?', optionen: ['Leon Berger', 'Sabine Krüger', 'Marco Seidel', 'Yusuf Demir'], bilder: ['v_azubi.jpg', 'v_buchhaltung.jpg', 'v_drucker.jpg', 'v_hausmeister.jpg'], fest: true, richtig: 2, punkte: 20,
          falsch: { 0: 'Die Direktorin schüttelt den Kopf: „Als der Pi eingerichtet wurde, saß Leon nachweislich im Unterricht. Und weder der Server noch das Konto führen zu ihm. Damit kommen wir vor keinem Gericht durch.“', 1: '„Frau Krüger hatte keinen Zugang zum Serverraum und keine Spur im Netz – sie hat die Bankänderungen selbst gemeldet.“', 3: '„Während der Pi eingerichtet wurde, quittierte Herr Demir nachweislich an der Warenannahme. Er wurde ausgenutzt – ein Fehler, aber keine Tat.“' },
          erklaerung: 'Marco Seidel, externer Drucker-Techniker von PrintPoint. Jetzt muss die Anklage belegt werden – Feld für Feld.', hinweise: ['Wer war am Freitag allein im Serverraum, als der Pi eingerichtet wurde?'] },
        { id: 'e6-an-gelegenheit', karten: true, frage: '<b>Gelegenheit:</b> Wann konnte Seidel den Pi unbemerkt anschließen und einrichten?', optionen: kartenTexte, fest: true, richtig: 5, punkte: 15, falsch: kartenFalsch('die Gelegenheit, den Pi anzuschließen'), erklaerung: 'Allein im Serverraum am Freitag – belegt durch das Empfangsbuch (Herr Demir 14:13–14:27 an der Warenannahme) und die Zeitstempel der Forensik (Anmeldung am Pi 14:18–14:25).', hinweise: ['Wann war Seidel unbeobachtet?'] },
        { id: 'e6-an-tatmittel', karten: true, frage: '<b>Tatmittel:</b> Womit wurde die Tat begangen?', optionen: kartenTexte, fest: true, richtig: 1, punkte: 15, falsch: kartenFalsch('das Gerät, mit dem die Tat begangen wurde'), erklaerung: 'Der Pi an SW-SERVER-01, Port 23 – gefunden in Einsatz 1, heute in der Beweismitteltüte.', hinweise: ['Was hat Kalle in Einsatz 1 am Switch gefunden?'] },
        { id: 'e6-an-tatmittel-l', layer: true, frage: 'Auf welcher Schicht liegt diese Spur: Ein Gerät <b>steckt in einer Switch-Buchse</b>?', richtig: 1, erklaerung: 'Buchse, Kabel, Link → L1. Hier hat die Ermittlung angefangen.', hinweise: ['Switch-Port als Buchse – nicht als Nummer im Header.'] },
        { id: 'e6-an-verbindung', karten: true, frage: '<b>Spur zur Person:</b> Welches Beweisstück führt vom Tunnel direkt zu Seidel?', optionen: kartenTexte, fest: true, richtig: 9, punkte: 15, falsch: kartenFalsch('die Verbindung zwischen Tunnel-Server und Seidel'), erklaerung: 'Der Server am anderen Ende des Tunnels ist mit Seidels Mobilnummer angemeldet – und wird vom selben Konto bezahlt wie bei den Bankänderungen.', hinweise: ['Was verbindet 198.51.100.23 mit Seidel?'] },
        { id: 'e6-an-motiv', karten: true, frage: '<b>Motiv:</b> Was wollte Seidel erreichen?', optionen: kartenTexte, fest: true, richtig: 3, punkte: 15, falsch: kartenFalsch('das, worum es dem Täter eigentlich ging'), erklaerung: 'Sechs Gehälter sollten beim Lohnlauf auf sein Konto fließen.', hinweise: ['Was hat Frau Krüger gefunden?'] },
        { id: 'e6-an-motiv-l', layer: true, frage: 'Die Bankänderungen kamen von <b>192.168.50.66</b>. Auf welcher Schicht liegt diese Spur?', richtig: 3, erklaerung: 'Quell-IP-Adresse → L3.', hinweise: ['Welche Adresse ist gemeint?'] },
        { id: 'e6-an-faehrte', karten: true, frage: '<b>Falsche Fährte:</b> Welche Spur hat Seidel <b>selbst gelegt</b>, damit der Verdacht auf Leon fällt?', optionen: kartenTexte, fest: true, richtig: 7, punkte: 15, falsch: kartenFalsch('eine Spur, die der Täter selbst gelegt hat'), erklaerung: 'LEON-NB – eingetragen, bevor der Pi überhaupt im Firmennetz war (Befund 4). Ebenso gelegt: die Zeitsteuerung auf Mo 08:05 und der Name „L. Berger“ beim Server.', hinweise: ['Welcher Name steht im DNS-Dienst des Pi?'] },
        { id: 'e6-an-faehrte-l', layer: true, frage: 'Auf welcher Schicht liegt diese falsche Fährte: ein <b>Name im DNS-Dienst</b>?', richtig: 7, erklaerung: 'DNS ist ein Anwendungsdienst → L7. Von L1 bis L7: Die Beweiskette zieht sich durch das ganze Modell.', hinweise: ['Zu welcher Schicht gehört DNS?'] }
      ]
    },

    {
      id: 'e6-aufloesung', type: 'story', titel: 'Feierabend für Herrn Seidel', bild: 'e6_festnahme.jpg', board: true, setzt: { seidel: 'ueberfuehrt' },
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · Flur vor der Druckerecke · Montag, 28.09., 16:20 Uhr' },
        { wer: 'direktorin', text: 'Die Staatsanwaltschaft hat unsere Anklage übernommen. Herr Seidel kam heute Nachmittag zu einer „außerplanmäßigen Druckerwartung“ – zwei Beamte der Kriminalpolizei haben schon auf ihn gewartet. Bei der Durchsuchung fanden sie die Bankkarte zum Konto bei der Nordbank Direkt.' },
        { wer: 'brandt', text: 'Der Lohnlauf ist angehalten, alle sechs Bankverbindungen sind zurückgesetzt, die Betroffenen informiert. Es ist kein einziger Euro verloren gegangen. Und PrintPoint schickt ab sofort einen anderen Techniker – der wird begleitet.' },
        { wer: 'kalle', text: 'Ein Drucker-Techniker, der „gern der IT hilft“. Ab heute bin ich misstrauisch, wenn mir jemand Kaffee bringt.' },
        { wer: 'direktorin', text: 'Halten Sie eines fest, Agentinnen und Agenten: Gegen Leon Berger sprachen ein Raspberry Pi in der Pause, ein Name im DNS und ein Zeitpunkt. Das hätte vielen gereicht. <b>Ein Indiz ist kein Beweis</b> – erst die Beweiskette von L1 bis L7 hat den Richtigen überführt.' }
      ]
    },

    {
      id: 'e6-massnahmen', type: 'lesson', tag: 'EPILOG · BRANDTS MASSNAHMENPLAN', titel: 'Damit es nie wieder passiert',
      html: `<p>Herr Brandt hat eine Liste geschrieben. Ein Punkt gilt ab sofort: <b>Externe werden in Technikräumen ständig begleitet</b> – ohne Ausnahme. Für alles andere braucht er Technik, die ihr noch nicht kennt. Die Zentrale hat die Akten dazu angelegt, aber noch <b>gesperrt</b>.</p>
        <div class="akten-gesperrt">
          <div><h4>🔒 Port-Security / 802.1X</h4>Warum durfte ein fremdes Gerät an Port 23 überhaupt mitspielen? Ein Switch kann prüfen, wer sich einsteckt – und Fremde aussperren.<div class="gs">GESPERRT · FREIGABE FOLGT</div></div>
          <div><h4>🔒 VLAN</h4>Warum konnte ein Gerät im Serverraum direkt mit den PCs im Versand reden? Ein Switch lässt sich in getrennte Netze aufteilen.<div class="gs">GESPERRT · FREIGABE FOLGT</div></div>
          <div><h4>🔒 Firewall</h4>Warum durfte der Pi einfach einen Tunnel nach draußen aufbauen? Nicht jede Verbindung ins Internet muss erlaubt sein.<div class="gs">GESPERRT · FREIGABE FOLGT</div></div>
          <div><h4>🔒 TLS und Zertifikate</h4>Wie wird das Schloss auch im internen Netz Pflicht – so, dass eine Seite ohne Schloss sofort auffällt?<div class="gs">GESPERRT · FREIGABE FOLGT</div></div>
          <div><h4>🔒 WLAN</h4>Und was, wenn der nächste Täter gar kein Kabel braucht?<div class="gs">GESPERRT · FREIGABE FOLGT</div></div>
        </div>`,
      kalle: 'Fünf gesperrte Akten. Ich sag’s euch: Die Arbeit geht uns nicht aus.'
    },

    {
      id: 'e6-epilog', type: 'story', titel: 'Kaffee für alle', bild: 'e6_kaffee.jpg',
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · Kaffeeküche · Montag, 28.09., 17:05 Uhr' },
        { wer: 'leon', text: 'Ehrlich gesagt hab ich gedacht, ich flieg raus. Mit den Portscans hab ich Mist gebaut, klar. Aber den Pi … Danke, dass ihr nicht einfach beim ersten Verdacht stehen geblieben seid.' },
        { wer: 'demir', text: 'Und ich hab ihm die Tür aufgehalten. Zweiundzwanzig Jahre im Betrieb – und dann so was. Ab jetzt bleibt jeder Techniker an meiner Seite, und wenn er noch so nett ist.' },
        { wer: 'krueger', text: 'Wissen Sie, was das Schöne ist? Mein letzter Monat hier, und ich gehe mit einem gestoppten Lohnlauf und sechs geretteten Gehältern. Das schreibe ich mir ins Zeugnis.' },
        { wer: 'kalle', text: 'Darauf einen Kaffee. Diesmal ohne Fremdgerät an der Maschine – hab ich vorher geprüft. Auf L1.' },
        { wer: 'direktorin', text: 'Gute Arbeit, Agentinnen und Agenten. Sie haben einen Fall gelöst, der auf allen sieben Schichten gespielt hat – und Sie haben dabei das OSI-Modell von unten nach oben durchschritten. Die Akte „Operation Lohnzettel“ ist geschlossen.' }
      ]
    },

    {
      id: 'e6-ende', type: 'ende', titel: 'Fall gelöst – Operation Lohnzettel', abzeichen: 'e6-fertig', abzeichenOhneTipp: 'e6-ohne-tipp',
      text: '<p>Ihr habt Leon, Herrn Demir und Frau Krüger entlastet, die Beweiskette von <b>L1 bis L7</b> geknüpft und Marco Seidel überführt. Sechs Gehälter sind gerettet – und das OSI-Modell kennt ihr jetzt von innen.</p>'
    }
  ];
})();
