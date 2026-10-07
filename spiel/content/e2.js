/* Einsatz 2 – L2: Gestohlene Identität. IDs NIE ändern (stecken in Spielständen). */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e2');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;
  const N = OSI.netz, H = N.hosts;
  const BC = 'ff:ff:ff:ff:ff:ff';

  // ------------------------------------------------------------ Beweisstücke
  const ouiListe = `<div class="evidence"><h4>📄 Auszug aus der OUI-Liste (Herstellerkennungen der IEEE)</h4>
    <table><tr><th>OUI (erste 3 Byte)</th><th>Hersteller</th></tr>
      <tr><td>00:15:5d</td><td>Microsoft Corporation</td></tr>
      <tr><td>00:a0:57</td><td>LANCOM Systems GmbH</td></tr>
      <tr><td>18:66:da</td><td>Dell Inc.</td></tr>
      <tr><td>b8:27:eb</td><td>Raspberry Pi Foundation</td></tr>
      <tr><td>dc:a6:32</td><td>Raspberry Pi Trading Ltd</td></tr>
      <tr><td colspan="2" style="color:#6b4a1a">… über 30 000 weitere Einträge</td></tr></table></div>`;

  const macTabelle = [
    [1, '00:15:5d:0a:32:10'], [2, '00:15:5d:0a:32:14'], [3, '00:15:5d:0a:32:12'], [4, '00:11:32:8c:4e:a1'],
    [5, '18:66:da:4a:0f:e2'], [6, '18:66:da:4a:11:9c'], [7, '00:80:92:3a:11:07'], [8, '18:66:da:4b:02:17'],
    [9, '18:66:da:4b:02:5a'], [11, '18:66:da:4b:07:5d'], [12, '18:66:da:4b:22:31'], [13, '18:66:da:4a:f3:08'],
    [15, '00:a0:57:61:0c:3e'], [15, '6c:c7:ec:1d:88:02'], [15, '6c:c7:ec:1d:88:5f'], [16, '00:a0:57:61:0c:41'],
    [17, '18:66:da:4a:e0:11'], [19, '00:80:92:77:31:c4'], [23, 'dc:a6:32:5e:19:7a'], [24, '00:a0:57:2b:7c:01']
  ];
  const macTabelleHtml = () => {
    const half = Math.ceil(macTabelle.length / 2);
    const col = arr => `<table><tr><th>Port</th><th>MAC-Adresse</th><th>Typ</th></tr>${arr.map(([p, m]) => `<tr><td>${p}</td><td>${m}</td><td>dynamisch</td></tr>`).join('')}</table>`;
    return `<div class="evidence"><h4>🖥️ SW-SERVER-01 · Verwaltung › MAC-Adresstabelle · Dienstag 09:05</h4>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${col(macTabelle.slice(0, half))}${col(macTabelle.slice(half))}</div>
      <p style="margin:8px 0 0">Einträge gesamt: ${macTabelle.length} · Alterungszeit: 300 s</p></div>`;
  };

  // ------------------------------------------------------------ Terminal PC-BUCH-03
  const arpA = `
Schnittstelle: 192.168.50.123 --- 0xb
  Internetadresse       Physische Adresse     Typ
  192.168.50.1          00-a0-57-2b-7c-01     dynamisch
  192.168.50.10         00-15-5d-0a-32-10     dynamisch
  192.168.50.20         dc-a6-32-5e-19-7a     dynamisch
  192.168.50.66         dc-a6-32-5e-19-7a     dynamisch
  192.168.50.121        18-66-da-4a-0f-e2     dynamisch
  192.168.50.255        ff-ff-ff-ff-ff-ff     statisch
`;
  const ipconfig = `
Windows-IP-Konfiguration


Ethernet-Adapter Ethernet:

   Verbindungsspezifisches DNS-Suffix: fo-logistik.intern
   Verbindungslokale IPv6-Adresse  . : fe80::9a1c:44e1:2b0f:6d3a%11
   IPv4-Adresse  . . . . . . . . . . : 192.168.50.123
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.50.1
`;
  const ipconfigAll = `
Windows-IP-Konfiguration

   Hostname  . . . . . . . . . . . . : PC-BUCH-03
   Primäres DNS-Suffix . . . . . . . : fo-logistik.intern
   Knotentyp . . . . . . . . . . . . : Hybrid
   IP-Routing aktiviert  . . . . . . : Nein

Ethernet-Adapter Ethernet:

   Verbindungsspezifisches DNS-Suffix: fo-logistik.intern
   Beschreibung. . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physische Adresse . . . . . . . . : 18-66-DA-4A-11-9C
   DHCP aktiviert. . . . . . . . . . : Ja
   Autokonfiguration aktiviert . . . : Ja
   Verbindungslokale IPv6-Adresse  . : fe80::9a1c:44e1:2b0f:6d3a%11(Bevorzugt)
   IPv4-Adresse  . . . . . . . . . . : 192.168.50.123(Bevorzugt)
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Lease erhalten. . . . . . . . . . : Freitag, 18. September 2026 07:41:12
   Lease läuft ab. . . . . . . . . . : Samstag, 26. September 2026 07:41:12
   Standardgateway . . . . . . . . . : 192.168.50.1
   DHCP-Server . . . . . . . . . . . : 192.168.50.10
   DNS-Server  . . . . . . . . . . . : 192.168.50.10
`;
  const getmac = `
Physische Adresse   Transportname
=================== ==========================================================
18-66-DA-4A-11-9C   \\Device\\Tcpip_{6E1F0B2A-93C4-4D5E-A1B7-2C8D9E0F1A3B}
`;
  const pingAntw = { '192.168.50.1': { ttl: 255 }, '192.168.50.10': { ttl: 128 }, '192.168.50.20': { ttl: 64 }, '192.168.50.66': { ttl: 64 }, '192.168.50.121': { ttl: 128 }, '192.168.50.123': { ttl: 128 }, '127.0.0.1': { ttl: 128 }, '1.1.1.1': { ttl: 57, ms: 9 } };
  const terminalBuch = {
    titel: 'Eingabeaufforderung – PC-BUCH-03 (Buchhaltung)',
    prompt: 'C:\\Users\\f.yilmaz>',
    befehle: [
      { cmd: 'ipconfig', out: ipconfig },
      { cmd: 'ipconfig /all', alias: ['ipconfig -all'], out: ipconfigAll },
      { cmd: 'arp -a', alias: ['arp /a', 'arp -g'], out: arpA },
      { cmd: 'getmac', out: getmac },
      { cmd: 'hostname', out: 'PC-BUCH-03\n' },
      { tab: 'ping ', re: /^ping (\S+)$/, out: m => N.ping(m[1], pingAntw, H.buch3.ip) }
    ],
    spick: [
      ['ipconfig', 'IP-Adresse, Subnetzmaske, Standardgateway'],
      ['ipconfig /all', 'alles: zusätzlich MAC-Adresse, DHCP- und DNS-Server'],
      ['arp -a', 'ARP-Cache: Welche IP-Adresse gehört zu welcher MAC-Adresse?'],
      ['getmac', 'MAC-Adresse der eigenen Netzwerkkarte'],
      ['hostname', 'Name des eigenen PCs'],
      ['ping <IP-Adresse>', 'prüft, ob unter einer IP-Adresse jemand antwortet']
    ]
  };

  // ------------------------------------------------------------ Mitschnitt Port-Spiegel SW-SERVER-01
  const S = H.lohn, P = H.pi, B1 = H.buch1, B3 = H.buch3, R = H.router, D = H.dc;
  const mitschnitt = N.mitschnitt([
    { t: 0.000000, typ: 'arp', op: 1, src: B1.mac, dst: BC, sip: B1.ip, tip: S.ip },
    { t: 0.000412, typ: 'arp', op: 2, src: S.mac, dst: B1.mac, sip: S.ip, tip: B1.ip },
    { t: 0.001107, typ: 'arp', op: 2, src: P.mac, dst: B1.mac, sip: S.ip, tip: B1.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 0.518330, typ: 'dns', src: B1.mac, dst: D.mac, sip: B1.ip, dip: D.ip, sp: 55231, id: '0x3e11', name: 'srv-file.fo-logistik.intern' },
    { t: 0.519024, typ: 'dns', src: D.mac, dst: B1.mac, sip: D.ip, dip: B1.ip, sp: 55231, id: '0x3e11', name: 'srv-file.fo-logistik.intern', antwort: '192.168.50.12' },
    { t: 1.203117, typ: 'arp', op: 2, src: P.mac, dst: B3.mac, sip: S.ip, tip: B3.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 1.203240, typ: 'arp', op: 2, src: P.mac, dst: B1.mac, sip: S.ip, tip: B1.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 1.951806, typ: 'tcp', src: B3.mac, dst: P.mac, sip: B3.ip, dip: S.ip, sp: 50722, dp: 80, len: 412 },
    { t: 2.402551, typ: 'icmp', icmp: 8, src: B3.mac, dst: R.mac, sip: B3.ip, dip: R.ip, seq: 41 },
    { t: 2.402893, typ: 'icmp', icmp: 0, src: R.mac, dst: B3.mac, sip: R.ip, dip: B3.ip, seq: 41, ttl: 255 },
    { t: 3.203121, typ: 'arp', op: 2, src: P.mac, dst: B3.mac, sip: S.ip, tip: B3.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 3.203247, typ: 'arp', op: 2, src: P.mac, dst: B1.mac, sip: S.ip, tip: B1.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 3.874410, typ: 'tcp', src: B1.mac, dst: P.mac, sip: B1.ip, dip: S.ip, sp: 50911, dp: 80, len: 398 },
    { t: 4.100208, typ: 'arp', op: 1, src: R.mac, dst: BC, sip: R.ip, tip: B3.ip },
    { t: 4.100377, typ: 'arp', op: 2, src: B3.mac, dst: R.mac, sip: B3.ip, tip: R.ip },
    { t: 5.203119, typ: 'arp', op: 2, src: P.mac, dst: B3.mac, sip: S.ip, tip: B3.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 5.203251, typ: 'arp', op: 2, src: P.mac, dst: B1.mac, sip: S.ip, tip: B1.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 6.020934, typ: 'dns', src: B3.mac, dst: D.mac, sip: B3.ip, dip: D.ip, sp: 61802, id: '0x9b04', name: 'lohn.fo-logistik.intern' },
    { t: 6.021577, typ: 'dns', src: D.mac, dst: B3.mac, sip: D.ip, dip: B3.ip, sp: 61802, id: '0x9b04', name: 'lohn.fo-logistik.intern', antwort: '192.168.50.20' },
    { t: 7.203115, typ: 'arp', op: 2, src: P.mac, dst: B3.mac, sip: S.ip, tip: B3.ip, warn: { mac: S.mac, frame: 2 } },
    { t: 7.203244, typ: 'arp', op: 2, src: P.mac, dst: B1.mac, sip: S.ip, tip: B1.ip, warn: { mac: S.mac, frame: 2 } }
  ], 'Sep 22, 2026 09:12:07 Mitteleuropäische Sommerzeit');

  const filterSpick = `<details class="small" style="margin:6px 0"><summary style="cursor:pointer">📋 Filter-Spickzettel aufklappen</summary>
    <table class="t small"><tr><th>Filter</th><th>zeigt …</th></tr>
      <tr><td><code>arp</code>, <code>dns</code>, <code>icmp</code>, <code>tcp</code></td><td>nur Frames mit diesem Protokoll</td></tr>
      <tr><td><code>eth.src == aa:bb:cc:dd:ee:ff</code></td><td>Frames, die von dieser MAC-Adresse <b>gesendet</b> wurden</td></tr>
      <tr><td><code>eth.dst == …</code> / <code>eth.addr == …</code></td><td>… an diese MAC gesendet / Quelle <b>oder</b> Ziel</td></tr>
      <tr><td><code>ip.addr == 192.168.50.20</code></td><td>Frames mit dieser IP als Quelle oder Ziel</td></tr>
      <tr><td><code>arp.opcode == 2</code></td><td>nur ARP-Replies (1 wäre Request)</td></tr>
      <tr><td><code>&amp;&amp;</code> · <code>||</code> · <code>!</code></td><td>und · oder · nicht, z. B. <code>arp &amp;&amp; eth.src == …</code></td></tr></table></details>`;

  E.steps = [
    {
      id: 'e2-intro', type: 'story', titel: 'Ein Kästchen ohne Namen', bild: 'e2_mitschnitt.jpg',
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · IT-Büro · Dienstag, 09:10 Uhr' },
        { wer: 'kalle', text: 'Guten Morgen. Ich hab am Server-Switch eine Port-Spiegelung eingerichtet: Jeder Frame, der an irgendeinem Port ankommt, landet zusätzlich als Kopie auf meinem Laptop. Das Kästchen an Port 23 ist fleißig: Es redet ununterbrochen.' },
        { wer: 'brandt', text: 'Aber mit wem denn? Es hat doch gar keine IP-Adresse von uns bekommen. Und eine MAC-Adresse … die kann man ja nicht fälschen, die ist doch fest in der Netzwerkkarte, oder?' },
        { wer: 'kalle', text: 'Herr Brandt, ich hab gute und schlechte Nachrichten. Die gute: Jede MAC-Adresse verrät uns den Hersteller. Die schlechte: Fälschen kann man sie trotzdem.' },
        { wer: 'direktorin', text: `<i>(über Funk)</i> Heute ist ${L(2)} dran, Agentinnen und Agenten. Zwei Fragen: <b>Was</b> ist das für ein Gerät – und <b>für wen</b> gibt es sich aus? Kalle, frischen Sie bitte vorher die Grundlagen auf.` }
      ]
    },

    {
      id: 'e2-mac', type: 'lesson', tag: 'TRAINING 1 · DIE MAC-ADRESSE', titel: 'Der Ausweis der Netzwerkkarte',
      html: `
        <p>Auf ${L(2)} bekommt jede Netzwerkkarte eine <b>MAC-Adresse</b> (Media Access Control). Sie ist <b>48 Bit</b> lang und wird als <b>12 Hexadezimalziffern</b> geschrieben, in 6 Blöcken zu je einem Byte:</p>
        <div class="frame-vis" style="margin:12px 0"><div class="l2" style="background:#ffd28a">dc:a6:32</div><div class="l2">5e:19:7a</div></div>
        <table class="t">
          <tr><th>Teil</th><th>Bedeutung</th></tr>
          <tr><td><b>erste 3 Byte</b> – die <b>OUI</b> (Organizationally Unique Identifier)</td><td><b>Herstellerkennung</b>. Die IEEE vergibt sie an Hersteller. Aus der OUI kann man also ablesen, <b>wer die Netzwerkkarte gebaut hat</b>.</td></tr>
          <tr><td><b>letzte 3 Byte</b></td><td>fortlaufende Nummer, die der Hersteller für jedes Gerät vergibt</td></tr>
        </table>
        <h3>Drei Schreibweisen – eine Adresse</h3>
        <table class="t">
          <tr><th>Wo?</th><th>Schreibweise</th></tr>
          <tr><td>Wireshark, Linux</td><td><code>dc:a6:32:5e:19:7a</code></td></tr>
          <tr><td>Windows (<code>ipconfig /all</code>, <code>arp -a</code>)</td><td><code>DC-A6-32-5E-19-7A</code></td></tr>
          <tr><td>Cisco-Switches</td><td><code>dca6.325e.197a</code></td></tr>
        </table>
        <p>Groß- oder Kleinschreibung spielt keine Rolle – hexadezimal ist <code>A</code> dasselbe wie <code>a</code>.</p>
        <div class="merk"><b>Broadcast:</b> Die Adresse <code>ff:ff:ff:ff:ff:ff</code> (alle 48 Bit auf 1) bedeutet „<b>an alle</b> im selben Netz“. Einen Frame an diese Adresse leitet ein Switch an alle Ports weiter.</div>
        <div class="merk"><b>Fest eingebaut – aber nicht fälschungssicher.</b> Der Hersteller schreibt die MAC-Adresse fest in die Netzwerkkarte. Das Betriebssystem kann aber eine <b>andere Absenderadresse</b> in die Frames schreiben. Eine MAC-Adresse ist also ein Hinweis, <b>kein Beweis</b>.</div>`,
      kalle: 'Die OUI ist wie das Kennzeichen-Kürzel am Auto: „DO“ sagt euch, woher es kommt. Wer drinsitzt, sagt es euch nicht.'
    },
    {
      id: 'e2-mac-quiz', type: 'quiz', titel: 'MAC-Check',
      fragen: [
        { id: 'e2-q-mac-bits', frage: 'Wie lang ist eine MAC-Adresse?', optionen: ['48 Bit (6 Byte)', '32 Bit (4 Byte)', '128 Bit (16 Byte)', '24 Bit (3 Byte)'], richtig: 0, erklaerung: '48 Bit = 6 Byte = 12 Hexadezimalziffern. (32 Bit hat eine IPv4-Adresse, 128 Bit eine IPv6-Adresse.)', hinweise: ['Zählt die Blöcke: Jeder Block ist ein Byte.'] },
        { id: 'e2-q-mac-oui', frage: 'Welcher Teil der MAC-Adresse <code>dc:a6:32:5e:19:7a</code> verrät den Hersteller?', optionen: ['dc:a6:32 – die ersten drei Byte (OUI)', '5e:19:7a – die letzten drei Byte', 'nur dc – das erste Byte', 'Keiner – die Adresse ist zufällig.'], richtig: 0, erklaerung: 'Die ersten drei Byte sind die OUI – die Herstellerkennung.', hinweise: ['OUI = Organizationally Unique Identifier. Wie viele Byte hat sie?'] },
        { id: 'e2-q-mac-win', frage: 'In <code>ipconfig /all</code> steht <code>DC-A6-32-5E-19-7A</code>. Welche Adresse ist das in Wireshark-Schreibweise?', optionen: ['dc:a6:32:5e:19:7a', 'dc:a6:32:5e:19:7b', '32:5e:19:7a:dc:a6', 'dca6:325e:197a:0000'], richtig: 0, erklaerung: 'Gleiche Ziffern, andere Trennzeichen – und Groß-/Kleinschreibung ist egal.', hinweise: ['Nur die Trennzeichen unterscheiden sich.'] },
        { id: 'e2-q-mac-bc', frage: 'Ein Frame ist an <code>ff:ff:ff:ff:ff:ff</code> adressiert. Wer bekommt ihn?', optionen: ['Alle Geräte im selben Netz', 'Nur der Router des Netzes', 'Nur der Switch selbst', 'Niemand – die Adresse ist ungültig'], richtig: 0, erklaerung: 'Broadcast: „an alle“ im selben Netz. Der Switch leitet ihn an alle Ports weiter.', hinweise: ['Alle 48 Bit sind 1. Schaut in den ersten Merkkasten der Lektion.'] },
        { id: 'e2-q-mac-beweis', frage: 'Herr Brandt sagt: „MAC-Adressen kann man nicht fälschen.“ Stimmt das?', optionen: ['Nein – die Software kann eine andere Absender-MAC eintragen.', 'Ja – sie ist fest in die Netzwerkkarte eingebrannt.', 'Ja – der Switch blockiert gefälschte MACs sofort.', 'Nein – aber das geht nur bei WLAN-Karten.'], richtig: 0, erklaerung: 'Die eingebaute MAC ist fest, die Absender-MAC in den Frames bestimmt aber die Software. Eine MAC-Adresse ist also ein Hinweis, kein Beweis. Merkt euch das für die Anklage!', hinweise: ['Lest den zweiten Merkkasten der Lektion.'] }
      ]
    },

    {
      id: 'e2-frame', type: 'lesson', tag: 'TRAINING 2 · FRAME UND SWITCH', titel: 'Was der Switch liest',
      html: `
        <p>Ein Ethernet-Frame hat auf ${L(2)} vorne einen <b>Header</b> und hinten einen <b>Trailer</b>:</p>
        <div class="frame-vis" style="margin:12px 0;flex-wrap:wrap">
          <div class="l2">Ziel-MAC<br>6 Byte</div><div class="l2">Quell-MAC<br>6 Byte</div><div class="l2">Typ<br>2 Byte</div>
          <div class="daten">Nutzdaten (z. B. IP-Paket)<br>46 – 1500 Byte</div><div class="fcs">FCS<br>4 Byte</div></div>
        <p class="small muted" style="text-align:center">Header (Ziel-MAC, Quell-MAC, Typ) · Nutzdaten · Trailer (FCS)</p>
        <ul>
          <li>Die <b>Ziel-MAC steht vorne</b> – so kann der Switch schon nach den ersten Bytes entscheiden, wohin der Frame geht.</li>
          <li>Das Feld <b>Typ</b> sagt, was in den Nutzdaten steckt: <code>0x0800</code> = IPv4-Paket, <code>0x0806</code> = ARP.</li>
          <li>Die <b>FCS</b> (Frame Check Sequence) im Trailer ist eine Prüfsumme. Stimmt sie nicht, wird der Frame <b>verworfen</b>.</li>
        </ul>
        <h3>Wie ein Switch lernt</h3>
        <table class="t">
          <tr><th>Schritt</th><th>Was der Switch tut</th></tr>
          <tr><td>1. Lernen</td><td>Er liest die <b>Quell-MAC</b> und merkt sich in seiner <b>MAC-Adresstabelle</b>: „Diese MAC wohnt an diesem Port.“</td></tr>
          <tr><td>2. Weiterleiten</td><td>Er liest die <b>Ziel-MAC</b> und sucht sie in der Tabelle. Gefunden → Frame geht <b>nur an diesen Port</b>.</td></tr>
          <tr><td>3. Fluten</td><td>Ziel-MAC unbekannt oder Broadcast → Frame geht an <b>alle Ports außer dem Eingangsport</b>.</td></tr>
        </table>
        <div class="merk"><b>Wichtig:</b> An einem Port können <b>mehrere</b> MAC-Adressen stehen – zum Beispiel, wenn dort ein Access Point oder ein weiterer Switch hängt. Einträge, die eine Weile nicht benutzt wurden, löscht der Switch wieder (Alterung).</div>`,
      kalle: 'Ein Switch ist wie ein Postbote, der sich jede Absenderadresse merkt. Nach einer Runde weiß er, wer wo wohnt.'
    },
    {
      id: 'e2-switch', type: 'quiz', titel: 'Der lernende Switch',
      intro: '<p>Ein frisch gestarteter Switch mit <b>leerer</b> MAC-Adresstabelle. PC-A hängt an Port 5, PC-B an Port 8, der Drucker an Port 12.</p>',
      fragen: [
        { id: 'e2-sw-erst', frage: 'PC-A schickt den ersten Frame an PC-B. Was macht der Switch damit?', optionen: ['Er lernt PC-A an Port 5 und flutet den Frame.', 'Er lernt PC-A an Port 5 und schickt ihn nur an Port 8.', 'Er verwirft den Frame, weil er PC-B nicht kennt.', 'Er fragt den Router, an welchem Port PC-B hängt.'], richtig: 0, erklaerung: 'Quell-MAC lernen (PC-A an Port 5), Ziel unbekannt → fluten, also an alle Ports außer Port 5. Erst die Antwort von PC-B verrät dem Switch, wo PC-B wohnt.', hinweise: ['Die Tabelle ist leer – kennt der Switch Port von PC-B schon?'] },
        { id: 'e2-sw-antwort', frage: 'PC-B antwortet an PC-A. Was passiert jetzt?', optionen: ['Er lernt PC-B an Port 8 und schickt den Frame nur an Port 5.', 'Er lernt PC-B an Port 8 und flutet den Frame an alle Ports.', 'Er schickt den Frame an Port 5 und an Port 12.', 'Er löscht den Eintrag von PC-A aus der Tabelle.'], richtig: 0, erklaerung: 'PC-A kennt er schon (Port 5) → gezielte Weiterleitung. Und nebenbei lernt er PC-B an Port 8.', hinweise: ['Die Ziel-MAC ist jetzt PC-A. Steht die schon in der Tabelle?'] },
        { id: 'e2-sw-feld', frage: 'Welches Feld liest der Switch, um seine Tabelle zu <b>füllen</b>?', optionen: ['Die Quell-MAC', 'Die Ziel-MAC', 'Die Ziel-IP', 'Die FCS'], richtig: 0, erklaerung: 'Lernen über die Quell-MAC, weiterleiten über die Ziel-MAC.', hinweise: ['Beim Lernen geht es um die Frage: Wer hat diesen Frame geschickt?'] },
        { id: 'e2-sw-fcs', frage: 'Ein Frame kommt beschädigt an: Die FCS im Trailer passt nicht zum Inhalt. Was passiert?', optionen: ['Der Frame wird verworfen.', 'Der Switch repariert den Frame.', 'Der Frame wird trotzdem weitergeleitet, aber markiert.', 'Der Switch schickt eine Fehlermeldung an den Router.'], richtig: 0, erklaerung: 'Falsche Prüfsumme → weg damit. Fehlererkennung ist eine Aufgabe von L2.', hinweise: ['Wozu dient eine Prüfsumme?'] },
        { id: 'e2-sw-ap', frage: 'Die Tabelle kennt PC-B an Port 8. Jetzt wird PC-B an <b>Port 3</b> umgesteckt und schickt einen Frame. Was passiert mit dem Eintrag?', optionen: ['Der Eintrag wird überschrieben: PC-B steht jetzt an Port 3.', 'Nichts – der Eintrag „PC-B an Port 8“ bleibt bestehen.', 'Der Switch sperrt Port 3, weil PC-B schon bekannt ist.', 'PC-B steht nun an beiden Ports in der Tabelle.'], richtig: 0, erklaerung: 'Gelernt wird bei <b>jedem</b> Frame neu: Der Switch liest die Quell-MAC von PC-B jetzt an Port 3 und überschreibt den alten Eintrag. Praktisch beim Umstecken … und genau deshalb kann ein Gerät mit gefälschter Absender-MAC einen Switch auch in die Irre führen.', hinweise: ['Beim Lernen liest der Switch die Quell-MAC – bei welchem Frame eigentlich?', 'Er lernt nicht nur einmal, sondern bei jedem Frame.'] },
      ]
    },

    {
      id: 'e2-tabelle', type: 'quiz', titel: 'Die MAC-Adresstabelle von SW-SERVER-01',
      intro: `<p>Herr Brandt öffnet die Verwaltungsoberfläche des Switches. Zur Erinnerung: Das fremde Gerät hängt an <b>Port 23</b>. Die OUI-Liste liegt daneben.</p>`,
      kontext: () => macTabelleHtml() + ouiListe,
      fragen: [
        { id: 'e2-mt-port23', eingabe: 'mac', frage: 'Welche MAC-Adresse hat der Switch an <b>Port 23</b> gelernt? Tippt sie ab.', platzhalter: 'z. B. aa:bb:cc:dd:ee:ff', richtig: 'dc:a6:32:5e:19:7a', erklaerung: 'dc:a6:32:5e:19:7a – die MAC-Adresse des fremden Geräts. Ihr dürft sie auch mit Bindestrichen oder großgeschrieben eingeben.', hinweise: ['Sucht in der Tabelle die Zeile mit Port 23.'] },
        { id: 'e2-mt-herst', frage: 'Was belegen MAC-Tabelle und OUI-Liste über das Gerät an Port 23 – und was nicht?', optionen: ['Vermutlich ein Raspberry Pi – bewiesen ist das nicht.', 'Sicher ein Raspberry Pi – eine MAC kann nicht lügen.', 'Ein PC von Dell, wie die meisten Geräte im Netz.', 'Ein virtueller Server von Microsoft.'], richtig: 0, erklaerung: 'dc:a6:32 → Raspberry Pi Trading. Ein <b>Raspberry Pi</b> ist ein Einplatinenrechner: ein vollständiger kleiner Computer, kaum größer als eine Scheckkarte, meist mit Linux. Auf ihm können beliebige Programme laufen – auch Server. Aber denkt an Training 1: Die Absender-MAC kann gefälscht sein. Die MAC ist ein starker Hinweis, kein Beweis.', falsch: { 1: 'Erinnert euch an den zweiten Merkkasten in Training 1: Kann die Software eine andere Absender-MAC eintragen?' }, hinweise: ['Schlagt die ersten drei Byte der MAC an Port 23 in der OUI-Liste nach.', 'Und dann: Ist eine MAC-Adresse fälschungssicher?'] },
        { id: 'e2-mt-server', frage: 'An Port 1 bis 3 hängen die Server SRV-DC01, SRV-LOHN und SRV-FILE. Ihre MAC-Adressen beginnen mit <code>00:15:5d</code> (Microsoft). Die Server-Hardware stammt aber von einem ganz anderen Hersteller. Wie passt das zusammen?', optionen: ['Sie nutzen virtuelle Netzwerkkarten mit einer Microsoft-OUI.', 'Microsoft baut die Netzwerkkarten aller Windows-Server.', 'Der Switch trägt bei Servern immer den Hersteller des Betriebssystems ein.', 'Der Angreifer hat die MAC-Adressen der Server gefälscht.'], richtig: 0, erklaerung: 'Die drei Server laufen als <b>virtuelle Maschinen</b> unter Hyper-V, der Virtualisierung von Microsoft, auf einem gemeinsamen physischen Host. Jede VM bekommt eine <b>virtuelle Netzwerkkarte</b> – und deren MAC-Adresse vergibt Hyper-V aus dem Microsoft-Bereich 00:15:5d. Kennt ihr von VirtualBox: Auch dort bekommt jede VM eine eigene MAC.', falsch: { 3: 'Dann gäbe es Streit um diese Adressen – aber die Server verhalten sich völlig normal, und alle drei haben dieselbe OUI.' }, hinweise: ['Auf einem physischen Server können mehrere Server laufen …', 'Stichwort: virtuelle Maschinen.'] },
        { id: 'e2-mt-ap', frage: 'An Port 15 hat der Switch <b>drei</b> verschiedene MAC-Adressen gelernt. Was für ein Gerät ist dort wahrscheinlich angeschlossen?', optionen: ['Ein Access Point oder ein weiterer Switch', 'Ein einzelner PC mit einer Netzwerkkarte', 'Ein Patchfeld für mehrere Netzwerkdosen', 'Gar nichts – alte Einträge bleiben für immer'], richtig: 0, erklaerung: 'Hinter einem Access Point oder weiteren Switch hängen mehrere Geräte – der Switch lernt alle ihre MACs an diesem einen Port. Tatsächlich hängt dort der Access Point im Lager (die MAC mit 00:a0:57 ist er selbst), dahinter funken die Handscanner. Völlig normal.', falsch: { 1: 'Ein einzelner PC schickt Frames mit nur einer Quell-MAC.', 2: 'Ein Patchfeld ist passiv (L1): Jede Dose landet über ein eigenes Patchkabel an einem <i>eigenen</i> Switch-Port.', 3: 'Einträge, die nicht mehr benutzt werden, löscht der Switch nach der Alterungszeit (hier 300 s).' }, hinweise: ['Der Switch lernt jede Quell-MAC, die an einem Port ankommt. Wann kommen an einem Port Frames von mehreren Absendern an?'] },
        { id: 'e2-mt-uplink', frage: 'An Port 24 hängt der Router (Uplink ins Internet). Über ihn kommen Daten von Tausenden Rechnern aus dem Internet – trotzdem steht an Port 24 <b>nur eine</b> MAC-Adresse. Warum?', optionen: ['Der Router schickt die Frames mit seiner eigenen MAC ab.', 'Der Switch speichert pro Port höchstens eine MAC.', 'Rechner im Internet haben keine MAC-Adressen.', 'Der Router löscht alle Frames aus dem Internet.'], richtig: 0, erklaerung: 'Neuer LKW für jede Etappe: Der Router packt jedes Paket in einen neuen Frame mit seiner eigenen MAC als Absender. Die MACs der Internet-Rechner kommen nie im Firmennetz an – MAC-Adressen gelten nur im eigenen Netz. Die IP-Adressen der Internet-Rechner stehen dagegen weiterhin im IP-Header.', falsch: { 1: 'An Port 15 stehen doch auch drei.', 2: 'Jede Netzwerkkarte hat eine MAC – aber die gilt nur in ihrem eigenen Netz.' }, hinweise: ['Erinnert euch an die Spedition aus der Grundausbildung: Was passiert am Umschlagplatz?'] },
      ]
    },

    {
      id: 'e2-arp', type: 'lesson', tag: 'TRAINING 3 · ARP UND GESTOHLENE IDENTITÄTEN', titel: 'Wer hat 192.168.50.20?',
      html: `
        <p>Ein PC kennt die <b>IP-Adresse</b> des Lohnportals (192.168.50.20). Um den Frame zu bauen, braucht er aber die <b>MAC-Adresse</b>. Das erledigt <b>ARP</b> (Address Resolution Protocol) – ihr kennt es schon:</p>
        <table class="t">
          <tr><th>Nachricht</th><th>an wen?</th><th>Inhalt</th></tr>
          <tr><td>ARP-<b>Request</b></td><td>Broadcast (<code>ff:ff:ff:ff:ff:ff</code>)</td><td>„Wer hat 192.168.50.20? Sagt es 192.168.50.123.“</td></tr>
          <tr><td>ARP-<b>Reply</b></td><td>direkt an den Fragenden</td><td>„192.168.50.20 ist bei 00:15:5d:0a:32:14.“</td></tr>
        </table>
        <p>Die Antwort landet im <b>ARP-Cache</b> des PCs – ansehen mit <code>arp -a</code>. ARP steckt direkt im Ethernet-Frame (Typ <code>0x0806</code>), ganz ohne IP-Header. Deshalb ordnen wir ARP ${L(2)} zu: Es ist die Brücke von den IP-Adressen (${L(3)}) zu den MAC-Adressen (${L(2)}).</p>
        <h3>Die Schwachstelle</h3>
        <p>ARP prüft nichts. <b>Jedes Gerät</b> im Netz kann einen ARP-Reply schicken – auch ohne gefragt worden zu sein. Und die meisten Systeme glauben einfach der <b>letzten</b> Antwort. Gibt sich ein Gerät so als ein anderes aus, nennt man das <b>ARP-Spoofing</b> (to spoof = täuschen). Die Frames für das Opfer landen dann beim falschen Gerät: Es sitzt „in der Mitte“ (<b>Man-in-the-Middle</b>).</p>
        <div class="merk"><b>Woran Ermittlerinnen und Ermittler ARP-Spoofing erkennen:</b>
          <ul style="margin:6px 0 0">
            <li>Im ARP-Cache führt die IP-Adresse eines <b>bekannten</b> Geräts zu einer MAC-Adresse, die <b>nicht zu diesem Gerät passt</b> (z. B. ein ganz anderer Hersteller).</li>
            <li>Im Mitschnitt: ARP-<b>Replies ohne vorherigen Request</b>, oft in festen Abständen wiederholt.</li>
            <li>Für eine IP-Adresse antworten <b>zwei verschiedene MAC-Adressen</b> – Wireshark warnt: <i>„duplicate use of … detected“</i>.</li>
          </ul></div>
        <p class="small muted">Vorsicht vor Kurzschlüssen: Dass zwei IP-Adressen zur selben MAC-Adresse führen, kann auch harmlos sein – etwa bei einem Server, der auf einer Netzwerkkarte mehrere IP-Adressen hat. Verdächtig wird es erst, wenn die MAC nicht zu dem Gerät passt, das die IP-Adresse laut Dokumentation haben sollte.</p>
        <div class="merk"><b>⚠ Rechtlicher Hinweis:</b> Solche Angriffe selbst auszuprobieren ist in fremden Netzen strafbar (Computerstrafrecht, §§ 202a ff. StGB) und verstößt in Schule und Betrieb gegen die IT-Richtlinien. Wir schauen nur mit den Augen der Ermittlung darauf.</div>`,
      kalle: 'ARP ist wie ein Großraumbüro, in dem jemand ruft: „Wer ist Frau Krüger?“ – und jeder kann „Ich!“ zurückrufen.'
    },
    {
      id: 'e2-terminal', type: 'quiz', titel: 'Am PC der Buchhaltung',
      intro: '<p>Frau Yilmaz aus der Buchhaltung hat am Montag ihr Passwort auf der falschen Seite eingegeben. Ihr sitzt jetzt an ihrem PC <b>PC-BUCH-03</b>. Tippt die Befehle selbst ein – der <b>📋 Spickzettel</b> hilft. Das Terminal zählt nicht als Antwort: Probiert ruhig herum.</p>',
      terminal: terminalBuch,
      fragen: [
        { id: 'e2-t-ip', eingabe: 'ip', frage: 'Welche IPv4-Adresse hat PC-BUCH-03?', platzhalter: 'IPv4-Adresse', richtig: '192.168.50.123', erklaerung: 'Mit <code>ipconfig</code> seht ihr: 192.168.50.123.', hinweise: ['Der Befehl, der die IP-Konfiguration anzeigt, beginnt mit „ip“.', 'Tippt <code>ipconfig</code> und drückt Enter.'] },
        { id: 'e2-t-mac20', eingabe: 'mac', frage: 'Unter welcher <b>MAC-Adresse</b> hat der PC das Lohnportal <b>192.168.50.20</b> in seinem ARP-Cache gespeichert?', platzhalter: 'MAC-Adresse', richtig: 'dc:a6:32:5e:19:7a', erklaerung: 'dc-a6-32-5e-19-7a – das ist <b>nicht</b> die MAC des Servers (00:15:5d…), sondern die des Raspberry Pi!', hinweise: ['Den ARP-Cache zeigt <code>arp -a</code>.', 'Sucht in der Ausgabe die Zeile mit 192.168.50.20.'] },
        { id: 'e2-t-doppelt', multi: true, frage: 'Welche IP-Adressen führen im ARP-Cache zur <b>selben</b> MAC-Adresse <code>dc-a6-32-5e-19-7a</code>?', optionen: ['192.168.50.20', '192.168.50.66', '192.168.50.1', '192.168.50.10', '192.168.50.121'], richtig: [0, 1], erklaerung: 'Zwei IP-Adressen auf einer MAC allein wäre noch kein Beweis – ein Server kann auch mehrere IP-Adressen haben. Aber hier führt die IP des Lohnservers (ein virtueller Server mit Microsoft-MAC 00:15:5d) zu einer Raspberry-Pi-MAC. Das passt nicht zusammen. Die .66 ist offenbar die „eigene“ Adresse des Pi – die merken wir uns.', hinweise: ['Vergleicht in <code>arp -a</code> die Spalte „Physische Adresse“ Zeile für Zeile.'] },
        { id: 'e2-t-deutung', frage: 'Was bedeutet dieser ARP-Cache für Frau Yilmaz?', optionen: ['Frames für das Lohnportal landen beim Raspberry Pi.', 'Ihr PC hat eine falsche IP-Adresse bekommen.', 'Das Netzwerkkabel ihres PCs ist defekt.', 'Das Lohnportal ist ausgefallen, der Pi ersetzt es.'], richtig: 0, erklaerung: 'Ihr PC baut alle Frames für das Lohnportal mit der MAC des Pi. Die IP-Adresse im Paket stimmt (.20) – aber die Ziel-MAC im Frame führt zum Pi. Der Pi hat sich auf L2 als Lohnportal ausgegeben: eine gestohlene Identität.', hinweise: ['An welche MAC-Adresse baut der PC seine Frames für .20?'] },
        { id: 'e2-t-ping', frage: '<code>ping 192.168.50.20</code> funktioniert einwandfrei. Beweist das, dass mit dem Lohnportal alles in Ordnung ist?', optionen: ['Nein – ping zeigt nicht, <i>wer</i> antwortet.', 'Ja – sonst käme ja keine Antwort zurück.', 'Ja – ping prüft auch die MAC-Adresse.', 'Nein – ping ist im Firmennetz gesperrt.'], richtig: 0, erklaerung: 'ping prüft nur, ob unter einer IP-Adresse <i>irgendwer</i> antwortet – ob am anderen Ende der richtige Rechner sitzt, verrät es nicht.', hinweise: ['Wer bekommt den ping, wenn der ARP-Cache auf den Pi zeigt?'] }
      ]
    },

    {
      id: 'e2-filter', type: 'lesson', tag: 'TRAINING 4 · WIRESHARK-FILTER', titel: 'Die Nadel im Heuhaufen',
      html: `
        <p>Ein Mitschnitt enthält schnell Tausende Frames. Mit einem <b>Anzeigefilter</b> blendet Wireshark alles aus, was nicht passt. Die Filterzeile wird <b style="color:#4fd18b">grün</b>, wenn Wireshark den Filter versteht, und <b style="color:#ff5d5d">rot</b>, wenn nicht.</p>
        <table class="t">
          <tr><th>Filter</th><th>zeigt …</th></tr>
          <tr><td><code>arp</code> · <code>dns</code> · <code>icmp</code> · <code>tcp</code> · <code>udp</code></td><td>nur Frames mit diesem Protokoll</td></tr>
          <tr><td><code>eth.src == dc:a6:32:5e:19:7a</code></td><td>Frames, die von dieser MAC-Adresse <b>gesendet</b> wurden (Quelle)</td></tr>
          <tr><td><code>eth.dst == …</code></td><td>Frames, die an diese MAC-Adresse <b>gerichtet</b> sind (Ziel)</td></tr>
          <tr><td><code>eth.addr == …</code></td><td>Quelle <b>oder</b> Ziel ist diese MAC-Adresse</td></tr>
          <tr><td><code>ip.addr == 192.168.50.20</code></td><td>Quelle oder Ziel ist diese IP-Adresse (auch <code>ip.src</code>, <code>ip.dst</code>)</td></tr>
          <tr><td><code>arp.opcode == 1</code> / <code>== 2</code></td><td>nur ARP-Requests / nur ARP-Replies</td></tr>
          <tr><td><code>&amp;&amp;</code> (und) · <code>||</code> (oder) · <code>!</code> (nicht)</td><td>Filter kombinieren, z. B. <code>arp &amp;&amp; !eth.src == 00:15:5d:0a:32:14</code></td></tr>
        </table>
        <div class="merk"><b>Achtung Falle:</b> Zwei Gleichheitszeichen! <code>eth.src == …</code> ist richtig, <code>eth.src = …</code> versteht Wireshark nicht.</div>
        <div class="merk"><b>Woher kommt der Mitschnitt?</b> Startet ihr Wireshark auf einem normalen PC, seht ihr nur den <b>eigenen</b> Verkehr und Broadcasts – der Switch schickt fremde Frames ja gar nicht an euren Port. Deshalb richtet Kalle am Switch eine <b>Port-Spiegelung</b> (engl. <i>Port Mirroring</i>) ein: Der Switch kopiert jeden Frame, der an einem beliebigen Port ankommt, zusätzlich an den Port von Kalles Laptop. So sieht er auch, was andere Geräte miteinander austauschen. Das darf natürlich nur, wer dazu befugt ist – wie die Einheit 7 mit Auftrag der IT-Leitung.</div>
        <div class="profi"><b>🕵️ Profi-Tipp – für alle, die tiefer in die Netzwerkforensik wollen:</b> Die Port-Spiegelung allein reicht noch nicht. Normalerweise vergleicht die <b>Netzwerkkarte</b> die Ziel-MAC jedes Frames mit ihrer eigenen und <b>verwirft</b> fremde Frames sofort – noch bevor Wireshark sie zu sehen bekommt. Durch lässt sie nur Frames an die eigene MAC, Broadcasts und Multicasts. Wireshark schaltet die Karte deshalb in den <b>Promiscuous Mode</b> (Häkchen „Enable promiscuous mode“, standardmäßig an): Dann reicht sie <i>alle</i> Frames weiter.<br>
          Also: <b>Port-Spiegelung</b> sorgt dafür, dass der Switch die fremden Frames überhaupt schickt – der <b>Promiscuous Mode</b> sorgt dafür, dass die Netzwerkkarte sie behält. Früher am <b>Hub</b> (Einsatz 1) genügte der Promiscuous Mode allein, weil der Hub ohnehin alles an alle verteilt.</div>
        <p>Klickt ihr einen Frame an, seht ihr darunter seinen Aufbau – Schicht für Schicht, wie beim Paket-Röntgen in der Grundausbildung.</p>`,
      kalle: 'Ohne Filter ist Wireshark wie eine Werwölfe-Runde am helllichten Tag, bei der alle gleichzeitig durcheinanderreden. Mit Filter ist es, als würdet ihr in der Nacht-Phase nur noch die Spieler sehen, die tatsächlich Werwölfe sind. Der ganze Rest wird stumm geschaltet.'
    },
    {
      id: 'e2-wireshark', type: 'quiz', titel: 'Der Mitschnitt vom Server-Switch',
      intro: `<p>Kalles Mitschnitt vom Dienstagmorgen – acht Sekunden, aufgenommen per Port-Spiegelung am Server-Switch. Beteiligte: <b>SRV-LOHN</b> 192.168.50.20 (00:15:5d:0a:32:14), <b>PC-BUCH-01</b> .121, <b>PC-BUCH-03</b> .123, der <b>Router</b> .1 und der <b>Raspberry Pi</b> (dc:a6:32:5e:19:7a). Filtert, klickt Frames an, klappt die Details auf.</p>${filterSpick}`,
      wireshark: { datei: 'sw-server-01_di_0912.pcapng', pakete: mitschnitt },
      fragen: [
        { id: 'e2-ws-arp', eingabe: 'filter', frage: 'Schreibt einen Anzeigefilter, der <b>nur ARP-Frames</b> zeigt, und prüft ihn.', richtig: 'arp', erklaerung: 'Mit dem Filter bleiben nur noch die ARP-Frames übrig – und es sind auffällig viele Replies dabei. Euer Filter ist oben eingetragen.', hinweise: ['Der Filter ist einfach der Name des Protokolls.', 'Tippt <code>arp</code> ein.'] },
        { id: 'e2-ws-erster', meldung: true, frage: 'Frame 1 ist ein ARP-Request von PC-BUCH-01: „Wer hat 192.168.50.20?“ Darauf kommen <b>zwei</b> Antworten. Markiert die Antwort, in der sich der <b>Raspberry Pi</b> als 192.168.50.20 ausgibt, und meldet sie.', richtig: 3, erklaerung: 'Frame 3: „192.168.50.20 is at dc:a6:32:5e:19:7a“ – eine knappe Millisekunde nach der echten Antwort in Frame 2. Weil PCs meist der <b>letzten</b> Antwort glauben, gewinnt der Pi.', falsch: { 2: 'Frame 2 ist die echte Antwort des Servers (00:15:5d:0a:32:14). Die falsche kommt kurz danach.', 1: 'Frame 1 ist die Frage, nicht die Antwort.' }, hinweise: ['Schaut euch die Frames direkt nach Frame 1 an.', 'Achtet auf die Quelle: RaspberryPi_5e:19:7a.'] },
        { id: 'e2-ws-regel', frage: 'Schaut euch die Frames 6, 11, 16 und 20 an (Zeit und Info). Was ist daran auffällig?', optionen: ['Der Pi schickt alle 2 s Replies ohne vorherige Frage.', 'Der Server antwortet viel zu langsam.', 'Die Frames sind unterwegs beschädigt worden.', 'PC-BUCH-03 fragt alle 2 s nach der Server-MAC.'], richtig: 0, erklaerung: 'Replies ohne vorherigen Request, im Takt von zwei Sekunden: So hält der Pi die ARP-Caches der Opfer „frisch vergiftet“.', hinweise: ['Vergleicht die Zeitspalte: 1,2 s – 3,2 s – 5,2 s – 7,2 s.', 'Gibt es vor diesen Replies jeweils einen Request?'] },
        { id: 'e2-ws-pi', eingabe: 'filter', frage: 'Schreibt einen Filter, der <b>nur die Frames zeigt, die der Raspberry Pi gesendet hat</b>.', richtig: 'eth.src == dc:a6:32:5e:19:7a', erklaerung: 'Mit <code>eth.src == dc:a6:32:5e:19:7a</code> bleiben nur die Frames des Pi – und es sind ausschließlich gefälschte ARP-Replies.', falsch: {}, hinweise: ['Gesendet = Quelle. Die Quell-MAC heißt im Filter <code>eth.src</code>.', 'Im Filter zählt die echte MAC-Adresse, nicht der Anzeigename „RaspberryPi_5e:19:7a“ aus der Paketliste. Und zwei Gleichheitszeichen: <code>eth.src == dc:a6:32:5e:19:7a</code>'] },
        { id: 'e2-ws-dup', frage: 'Wireshark hängt an diese Frames „<i>duplicate use of 192.168.50.20 detected!</i>“ an. Was bedeutet die Warnung?', optionen: ['Zwei MAC-Adressen beanspruchen dieselbe IP-Adresse.', 'Der Frame wurde doppelt aufgezeichnet.', 'Zwei PCs haben dieselbe MAC-Adresse.', 'Der DHCP-Server hat die IP doppelt vergeben.'], richtig: 0, erklaerung: 'Zwei verschiedene MAC-Adressen behaupten, 192.168.50.20 zu haben. Klappt in Frame 3 die ARP-Zeile auf: „also in use by 00:15:5d:0a:32:14 (frame 2)“ – der echte Server und der Pi beanspruchen dieselbe IP.', hinweise: ['Markiert Frame 3 und klappt „Address Resolution Protocol (reply)“ auf.'] },
        { id: 'e2-ws-f8', eingabe: 'mac', frage: 'In <b>Frame 8</b> schickt PC-BUCH-03 Daten an das Lohnportal (Ziel-IP 192.168.50.20). An welche <b>Ziel-MAC</b> ist der Frame adressiert?', platzhalter: 'MAC-Adresse', richtig: 'dc:a6:32:5e:19:7a', erklaerung: 'Ziel-IP: das Lohnportal. Ziel-MAC: der Raspberry Pi. Auf L3 sieht alles richtig aus – die Täuschung passiert eine Schicht tiefer.', hinweise: ['Markiert Frame 8 und klappt die Zeile „Ethernet II“ auf.', 'Gesucht ist „Destination“.'] },
        { id: 'e2-ws-schicht', layer: true, frage: 'Auf welcher Schicht findet die Täuschung statt, die ihr gerade aufgedeckt habt?', richtig: 2, erklaerung: 'L2: Die IP-Adresse bleibt korrekt, aber die MAC-Adresse im Frame führt zum falschen Gerät. Eine gestohlene Identität auf L2.', hinweise: ['Welche Adresse ist falsch – die IP- oder die MAC-Adresse?'] }
      ]
    },

    {
      id: 'e2-indizien', type: 'sort', titel: 'Indizien-Check', punkte: 8, spalten: true,
      intro: '<p>Kalle hat Beobachtungen aus Einsatz 1 und 2 auf Karteikarten geschrieben. Was ist <b>normaler Netzwerkbetrieb</b> – und was ist ein <b>Indiz</b> für den Angriff?</p>',
      bins: [
        { id: 'normal', label: 'Normaler Betrieb', sub: 'passiert in jedem Netz' },
        { id: 'indiz', label: 'Indiz für den Angriff', sub: 'gehört in die Akte' }
      ],
      items: [
        { id: 'e2-in-req', text: 'ARP-Request an ff:ff:ff:ff:ff:ff', ziel: 'normal', erklaerung: 'So fragt jeder PC nach einer MAC-Adresse – per Broadcast.', hinweis: 'Wie fragt ein PC nach einer MAC-Adresse?' },
        { id: 'e2-in-reply', text: 'ARP-Replies alle 2 Sekunden, ohne vorherigen Request', ziel: 'indiz', erklaerung: 'Unaufgeforderte Replies im Takt: typisch für ARP-Spoofing.', hinweis: 'Antwortet man, wenn niemand gefragt hat?' },
        { id: 'e2-in-zwei', text: 'ARP-Cache: Die IP des Lohnservers führt zu einer Raspberry-Pi-MAC', ziel: 'indiz', erklaerung: 'Der Lohnserver hat eine Microsoft-MAC (00:15:5d). Führt seine IP zu einer ganz anderen MAC, hat sich jemand dazwischengedrängt.', hinweis: 'Welche MAC-Adresse <i>sollte</i> der Lohnserver haben?' },
        { id: 'e2-in-mehrip', text: 'Zwei IP-Adressen im ARP-Cache mit derselben MAC – laut Dokumentation ein Server mit zwei IP-Adressen', ziel: 'normal', erklaerung: 'Eine Netzwerkkarte darf mehrere IP-Adressen haben. Wenn die Dokumentation das bestätigt, ist das harmlos.', hinweis: 'Was sagt die Dokumentation dazu?' },
        { id: 'e2-in-ap', text: 'Drei MAC-Adressen an Port 15 (Access Point)', ziel: 'normal', erklaerung: 'Hinter einem Access Point hängen viele Geräte.', hinweis: 'Was hängt an Port 15?' },
        { id: 'e2-in-flut', text: 'Switch flutet einen Frame an eine noch unbekannte MAC an alle Ports', ziel: 'normal', erklaerung: 'So lernt ein Switch – ganz normal.', hinweis: 'Was macht ein Switch mit unbekannten Ziel-MACs?' },
        { id: 'e2-in-port23', text: 'MAC-Adresse an Port 23, der laut Patchplan frei ist', ziel: 'indiz', erklaerung: 'Ein undokumentiertes Gerät – unser Pi.', hinweis: 'Was steht im Patchplan bei Port 23?' },
        { id: 'e2-in-dup', text: 'Wireshark: „duplicate use of 192.168.50.20 detected!“', ziel: 'indiz', erklaerung: 'Zwei MACs streiten sich um eine IP.', hinweis: 'Zwei Geräte behaupten, dieselbe IP zu haben …' },
        { id: 'e2-in-hyperv', text: 'Server-MACs beginnen mit 00:15:5d (Microsoft)', ziel: 'normal', erklaerung: 'Virtuelle Server mit Hyper-V – normal.', hinweis: 'Was stand in der OUI-Liste bei 00:15:5d?' },
        { id: 'e2-in-p7', text: 'Port 7 läuft mit 100 Mbit/s (Etikettendrucker)', ziel: 'normal', erklaerung: 'Dokumentiertes, altes Gerät – erklärt die 100 Mbit/s.', hinweis: 'Erinnert euch an Einsatz 1.' }
      ]
    },

    {
      id: 'e2-spur', type: 'quiz', titel: 'Eine Spur zu Leon?', setzt: { berger: 'verdaechtig' },
      intro: `<div class="dialog"><img class="portrait" src="img/brandt.jpg" alt="Thomas Brandt"><div class="bubble"><div class="who">Thomas Brandt (IT-Leiter F&amp;O)</div><i>(blass)</i> „Raspberry Pi? Leon hat letzte Woche in der Mittagspause so ein Ding gezeigt – mit alten Videospielen drauf. Er war ganz stolz darauf. Und er hat sich ja schon mal mit Portscans Ärger eingehandelt …“</div></div>`,
      fragen: [
        { id: 'e2-sp-beweis', frage: 'Beweist die Herstellerkennung <code>dc:a6:32</code>, dass Leon Berger das Gerät angeschlossen hat?', optionen: ['Nein – die OUI verrät nur den Hersteller.', 'Ja – Leon besitzt einen Raspberry Pi.', 'Ja – die MAC-Adresse ist auf Leon registriert.', 'Nein – MAC-Adressen sind immer zufällig.'], richtig: 0, erklaerung: 'Ein Indiz, kein Beweis. Die OUI sagt „Raspberry Pi“, nicht „Leon“ – Raspberry Pis gibt es millionenfach. Und weil man MACs sogar fälschen kann, ist Vorsicht doppelt angebracht.', hinweise: ['Denkt an Kalles Vergleich mit dem Autokennzeichen.'] },
        { id: 'e2-sp-board', frage: 'Was schreibt ihr ans Verdächtigen-Board?', optionen: ['Leon Berger: verdächtig – Beweis fehlt noch.', 'Leon Berger: überführt – Fall abgeschlossen.', 'Leon Berger: entlastet – Azubis tun so was nicht.', 'Nichts – private Hobbys spielen keine Rolle.'], richtig: 0, erklaerung: 'Gelegenheit (Serverraum, Mo 08:03) und Fachwissen (Raspberry Pi): Das reicht für „verdächtig“ – aber nicht für eine Anklage. Die Ermittlung geht weiter.', hinweise: ['Überführt ist nur, wer bewiesen ist.'] }
      ]
    },
    {
      id: 'e2-bonus-ttl', type: 'quiz', bonus: true, titel: 'Bonus-Akte: Das verräterische TTL',
      intro: `<p>Kalle grinst: „Schaut euch nochmal die ping-Ausgaben am PC von Frau Yilmaz an. Jedes IP-Paket hat ein Feld <b>TTL</b> (Time to Live). Das Betriebssystem setzt beim Absenden einen Startwert – <b>Windows startet mit 128</b>, <b>Linux mit 64</b>. Im selben Netz kommt dieser Wert unverändert an. <b>Aber Achtung:</b> Das ist nur der voreingestellte Startwert – man kann ihn im Betriebssystem ändern. Das TTL ist also ein Indiz für das Betriebssystem der Gegenseite, kein Beweis.“</p>
        <div class="ws" style="padding:10px 14px;line-height:1.6">C:\\&gt; ping 192.168.50.10<br>Antwort von 192.168.50.10: Bytes=32 Zeit&lt;1ms TTL=128<br><br>C:\\&gt; ping 192.168.50.20<br>Antwort von 192.168.50.20: Bytes=32 Zeit&lt;1ms TTL=64</div>
        <p class="small muted">SRV-DC01 und SRV-LOHN laufen beide unter Windows Server.</p>`,
      fragen: [
        { id: 'e2-bonus-ttl-wer', frage: 'Wer hat in Wahrheit auf den ping an 192.168.50.20 geantwortet?', optionen: ['Wahrscheinlich ein Linux-Gerät wie der Pi', 'Der echte Lohnserver SRV-LOHN (Windows)', 'Der Router des Firmennetzes', 'Der DNS-Server SRV-DC01 (Windows)'], richtig: 0, punkte: 15, erklaerung: 'TTL=64 passt zum Linux-Standardwert, nicht zu Windows Server (128). Weil sich der Startwert ändern lässt, ist das kein Beweis – aber ein weiteres Indiz, das zu allen anderen Spuren passt. Genau solche Details bringen Täter zu Fall.', hinweise: ['Welcher Startwert gehört zu welchem Betriebssystem?'] }
      ]
    },
    {
      id: 'e2-cliffhanger', type: 'story', titel: 'Die .66', board: true,
      szenen: [
        { wer: 'kalle', text: 'Zusammengefasst: Ein Raspberry Pi an Port 23 gibt sich auf L2 als Lohnportal aus. Und er hat eine eigene Adresse: <b>192.168.50.66</b>.' },
        { wer: 'brandt', text: 'Moment. Unser DHCP-Server vergibt Adressen ab .100. Die .66 hat ihm niemand gegeben – die hat er sich selbst genommen.' },
        { wer: 'system', text: '▶ Mittwoch, 07:05 Uhr · Anruf aus dem Versand: „Seit heute Morgen ist das Internet so langsam. Und bei Kollegin Lindner ist die Lohnseite auch schon wieder komisch.“' },
        { wer: 'direktorin', text: 'Gute Arbeit, Agentinnen und Agenten. Leon Berger steht jetzt unter Verdacht – aber verdächtig heißt nicht schuldig. Die Spur führt nach <b>L3</b>: Wir müssen wissen, <b>wohin die Pakete im Versand wirklich gehen</b>.' },
        { wer: 'system', text: '▶ Akte „Einsatz 3 – Falsche Wegweiser“ wird vorbereitet …' }
      ]
    },
    {
      id: 'e2-aussen', type: 'sealed', bonus: true, titel: 'Außeneinsatz: Der lernende Switch',
      teaser: 'In Packet Tracer beobachtet ihr, wie ein Switch seine MAC-Adresstabelle füllt, und verfolgt im Simulationsmodus ARP-Request und ARP-Reply Schritt für Schritt.',
      inhalt: `<p>Im Außeneinsatz von Einsatz 1 habt ihr vermutet, wie der Switch das Ziel eines Frames findet. Jetzt prüft ihr das direkt am Switch – so, wie Admins es auch machen: über ein <b>Konsolenkabel</b> und die Kommandozeile des Switches. Ihr nutzt dasselbe Simulationsnetz wie in Einsatz 1.</p>
        <div class="btnrow" style="margin-bottom:10px"><a class="btn" href="aussen/E1_Wer-hoert-mit.pkt" download>⬇ Simulationsnetz herunterladen (Packet Tracer)</a></div>
        <div class="merk"><b>Befehle:</b> Welche Befehle ihr braucht, schlagt ihr in der <b>Befehlsreferenz</b> im 📘 Handbuch nach (oben in der Leiste).</div>
        <h3>Euer Auftrag</h3>
        <ol>
          <li>Öffnet das Simulationsnetz in <b>Cisco Packet Tracer</b> und spult die Zeit vor (<b>Fast Forward Time</b>), bis alle Leitungen grün angezeigt werden.</li>
          <li>Ermittelt in der <b>Command Prompt</b> von PC-1 und PC-2 deren <b>MAC-Adressen</b> und notiert sie.</li>
          <li>Verbindet <b>PC-4</b> über ein <b>Konsolenkabel</b> (Console) mit dem Switch: am PC an <b>RS 232</b>, am Switch an <b>Console</b>. Öffnet auf PC-4 unter <b>Desktop</b> das <b>Terminal</b>, bestätigt die Einstellungen mit <b>OK</b> und drückt Enter, bis <code>Switch&gt;</code> erscheint.
            <div class="profi"><b>🕵️ Profi-Tipp:</b> Über das Konsolenkabel seht ihr nur, was der Switch sendet, <b>während</b> das Kabel steckt. Was er vorher ausgegeben hat, etwa seine Startmeldungen, ist nicht mehr zu sehen. Deshalb bleibt das Terminal zunächst leer. Mit <b>Enter</b> schickt ihr dem Switch ein Lebenszeichen – er antwortet mit seiner Eingabeaufforderung.</div></li>
          <li>Fragt die <b>MAC-Adresstabelle</b> des Switches ab.</li>
          <li>Schaltet auf <b>Simulation</b> um und stellt die Filter so ein, dass nur <b>ARP</b> und <b>ICMP</b> angezeigt werden.</li>
          <li>Startet in der Command Prompt von PC-1 einen <b>Ping an PC-2</b>.</li>
          <li>Schaltet mit <b>Capture/Forward</b> Schritt für Schritt weiter und fragt die MAC-Adresstabelle jedes Mal erneut ab:
            <ol type="a">
              <li>wenn der <b>ARP-Request</b> von PC-1 beim Switch angekommen ist,</li>
              <li>nachdem der Switch ihn <b>weitergeleitet</b> hat,</li>
              <li>wenn der <b>ARP-Reply</b> von PC-2 beim Switch angekommen ist.</li>
            </ol></li>
          <li>Gleicht die Einträge mit euren notierten MAC-Adressen ab. Dann beantwortet die Fragen unten.</li>
        </ol>`,
      abschluss: `<div class="profi"><b>🕵️ Profi-Tipp – ARP am eigenen PC beobachten:</b> Startet Wireshark mit dem Filter <code>arp</code> und pingt eine IP-Adresse in eurem Netz an, die euer PC in den letzten Minuten nicht angesprochen hat. Selbst wenn der Ping keine Antwort bekommt – viele Firewalls blockieren ICMP –, seht ihr den ARP-Request an <code>ff:ff:ff:ff:ff:ff</code>. Denn bevor euer PC überhaupt pingen kann, braucht er die MAC-Adresse des Ziels. Gibt es das Gerät, kommt meist auch der ARP-Reply zurück: ARP arbeitet auf L2, daran ändert die Firewall des Ziels in der Regel nichts. <code>arp -a</code> zeigt danach den neuen Eintrag. Wer den ARP-Cache vorher leeren will, braucht Administratorrechte: <code>netsh interface ip delete arpcache</code>. Im Betrieb gelten für Mitschnitte die IT-Sicherheitsvorgaben.</div>`,
      fragen: [
        { id: 'e2-pt-mac1', eingabe: 'mac', frage: 'Welche MAC-Adresse hat <b>PC-1</b>? Tippt sie ab.', platzhalter: 'z. B. aabb.ccdd.eeff', richtig: '0060.2fce.c539', erklaerung: '0060.2fce.c539 – Cisco schreibt MAC-Adressen in drei Vierergruppen mit Punkten. Es sind dieselben 48 Bit wie bei <code>00-60-2F-CE-C5-39</code>.', hinweise: ['Welcher Befehl zeigt auch die MAC-Adresse? Schaut in die Befehlsreferenz im 📘 Handbuch.', 'In der Ausgabe von PC-1 heißt sie „Physical Address“.'] },
        { id: 'e2-pt-leer', frage: 'Direkt nach dem Öffnen ist die MAC-Adresstabelle des Switches leer. Warum?', optionen: ['Noch hat kein PC einen Frame an den Switch geschickt.', 'Der Switch muss erst einmal neu gestartet werden.', 'Die Tabelle füllt sich nur im Simulationsmodus.', 'Im Modus Switch> werden keine Einträge angezeigt.'], richtig: 0, erklaerung: 'Ein Switch lernt nur aus Frames, die bei ihm ankommen. Solange niemand sendet, gibt es nichts zu lernen.', hinweise: ['Woraus lernt ein Switch? Schaut noch einmal in die Lektion „Frame und Switch“.'] },
        { id: 'e2-pt-abfrage1', frage: 'Der ARP-Request von PC-1 ist gerade beim Switch angekommen. Was zeigt die MAC-Adresstabelle jetzt?', optionen: ['Nur PC-1 an Fa0/1', 'PC-1 an Fa0/1 und PC-2 an Fa0/2', 'Alle vier PCs an Fa0/1 bis Fa0/4', 'Noch überhaupt keinen Eintrag'], richtig: 0, erklaerung: 'Der Switch liest die <b>Absender-MAC</b> des ankommenden Frames und merkt sich: Diese MAC-Adresse wohnt an Fa0/1.', hinweise: ['Wessen MAC-Adresse steht als Absender im ARP-Request?'] },
        { id: 'e2-pt-mac2', eingabe: 'mac', frage: 'Welche MAC-Adresse hat <b>PC-2</b>? Tippt sie ab.', platzhalter: 'z. B. aabb.ccdd.eeff', richtig: '0030.f27b.29a1', erklaerung: '0030.f27b.29a1 – genau diese Adresse taucht später in der MAC-Adresstabelle auf.', hinweise: ['Gleicher Befehl wie bei PC-1, diesmal in der Command Prompt von PC-2.'] },
        { id: 'e2-pt-fluten', frage: 'Der Switch hat den ARP-Request an alle anderen Ports weitergeleitet. Was ändert sich dadurch in der Tabelle?', optionen: ['Nichts – beim Weiterleiten lernt der Switch nichts.', 'PC-2, PC-3 und PC-4 werden eingetragen.', 'Der Eintrag für PC-1 wird wieder gelöscht.', 'Die Broadcast-Adresse wird eingetragen.'], richtig: 0, erklaerung: 'Gelernt wird nur beim <b>Empfangen</b>. Die anderen PCs haben bisher nur etwas bekommen, aber selbst noch nichts gesendet.', hinweise: ['Vergleicht eure Abfragen a) und b).'] },
        { id: 'e2-pt-hub', frage: 'Am Hub im rechten Netz könnt ihr keine solche Tabelle abfragen. Warum?', optionen: ['Er liest keine MAC-Adressen, er arbeitet auf L1.', 'Packet Tracer bildet diese Funktion nicht ab.', 'Ihm fehlt nur der Anschluss für ein Konsolenkabel.', 'Seine Tabelle wird nach jedem Frame gelöscht.'], richtig: 0, erklaerung: 'Ein Hub kennt keine Adressen, er gibt die Bits an alle Ports weiter. Deshalb kam in Einsatz 1 jeder Frame bei allen PCs an. Und der Switch? Der kannte nach dem ARP-Austausch schon beide Ports – darum ging in Einsatz 1 bereits der erste ICMP-Frame nur an das Ziel. Den ARP-Austausch davor hatte euer ICMP-Filter nur ausgeblendet.', hinweise: ['Auf welcher Schicht arbeitet ein Hub – und gibt es dort Adressen?'] },
        { id: 'e2-pt-reply', frage: 'Wann taucht PC-2 in der MAC-Adresstabelle auf?', optionen: ['Wenn sein ARP-Reply beim Switch ankommt', 'Wenn der ARP-Request bei PC-2 ankommt', 'Wenn der Switch den Request an Fa0/2 schickt', 'Erst wenn der erste ICMP-Frame kommt'], richtig: 0, erklaerung: 'Mit dem ARP-Reply schickt PC-2 seinen ersten Frame. Der Switch liest die Absender-MAC und trägt PC-2 an Fa0/2 ein – genau wie vorher bei PC-1.', hinweise: ['Vergleicht eure Abfragen b) und c). Wer ist beim Reply der Absender?'] },
        { id: 'e2-pt-fehlen', frage: 'Am Ende stehen nur PC-1 und PC-2 in der Tabelle. Warum fehlen PC-3 und PC-4?', optionen: ['Sie haben selbst noch keinen Frame gesendet.', 'Sie haben den ARP-Request nicht bekommen.', 'Der Switch speichert nur zwei Einträge.', 'Sie liegen in einem anderen IP-Netz.'], richtig: 0, erklaerung: 'Den ARP-Request haben PC-3 und PC-4 sehr wohl bekommen – er ging an alle. Aber gesendet haben sie nichts, also gab es für den Switch nichts zu lernen.', hinweise: ['Bekommen allein reicht nicht. Wann lernt der Switch?'] },
        { id: 'e2-pt-abgleich', frage: 'Gleicht die MAC-Adresstabelle des Switches mit euren notierten MAC-Adressen ab. An welchem Port hat der Switch <b>PC-2</b> gelernt?', optionen: ['Fa0/2', 'Fa0/1', 'Fa0/3', 'Fa0/4'], richtig: 0, erklaerung: '0030.f27b.29a1 an Fa0/2 – das ist PC-2. Die Tabelle passt zur Verkabelung im Simulationsnetz.', hinweise: ['Sucht in der Tabelle die MAC-Adresse, die ihr bei PC-2 notiert habt.'] }
      ]
    },
    {
      id: 'e2-ende', type: 'ende', titel: 'Identitätsprüfung L2 abgeschlossen!', abzeichen: 'e2-fertig', abzeichenOhneTipp: 'e2-ohne-tipp',
      text: '<p>Ihr habt das Gerät als Raspberry Pi identifiziert und nachgewiesen, dass es sich auf L2 als Lohnportal ausgibt. Die nächste Spur führt nach <b>L3</b>.</p>'
    }
  ];
})();
