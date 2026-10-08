/* Einsatz 3 – L3: Falsche Wegweiser. IDs NIE ändern (stecken in Spielständen). */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e3');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;
  const N = OSI.netz, H = N.hosts;
  const BC = 'ff:ff:ff:ff:ff:ff';

  // ------------------------------------------------------------ Terminal PC-VERSAND-02 (hat seine Konfiguration vom Fremdgerät)
  const ipconfig = `
Windows-IP-Konfiguration


Ethernet-Adapter Ethernet:

   Verbindungsspezifisches DNS-Suffix: fo-logistik.intern
   Verbindungslokale IPv6-Adresse  . : fe80::4c1a:9e2f:7d31:b20c%12
   IPv4-Adresse  . . . . . . . . . . : 192.168.50.140
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.50.66
`;
  const ipconfigAll = `
Windows-IP-Konfiguration

   Hostname  . . . . . . . . . . . . : PC-VERSAND-02
   Primäres DNS-Suffix . . . . . . . : fo-logistik.intern
   Knotentyp . . . . . . . . . . . . : Hybrid
   IP-Routing aktiviert  . . . . . . : Nein

Ethernet-Adapter Ethernet:

   Verbindungsspezifisches DNS-Suffix: fo-logistik.intern
   Beschreibung. . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physische Adresse . . . . . . . . : 18-66-DA-4B-22-31
   DHCP aktiviert. . . . . . . . . . : Ja
   Autokonfiguration aktiviert . . . : Ja
   Verbindungslokale IPv6-Adresse  . : fe80::4c1a:9e2f:7d31:b20c%12(Bevorzugt)
   IPv4-Adresse  . . . . . . . . . . : 192.168.50.140(Bevorzugt)
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Lease erhalten. . . . . . . . . . : Mittwoch, 23. September 2026 07:12:04
   Lease läuft ab. . . . . . . . . . : Mittwoch, 23. September 2026 08:12:04
   Standardgateway . . . . . . . . . : 192.168.50.66
   DHCP-Server . . . . . . . . . . . : 192.168.50.66
   DNS-Server  . . . . . . . . . . . : 192.168.50.66
`;
  const routePrint = `
===========================================================================
Schnittstellenliste
 12...18 66 da 4b 22 31 ......Intel(R) Ethernet Connection I219-LM
  1...........................Software Loopback Interface 1
===========================================================================

IPv4-Routentabelle
===========================================================================
Aktive Routen:
     Netzwerkziel    Netzwerkmaske          Gateway    Schnittstelle Metrik
          0.0.0.0          0.0.0.0    192.168.50.66   192.168.50.140     25
        127.0.0.0        255.0.0.0   Auf Verbindung         127.0.0.1    331
     192.168.50.0    255.255.255.0   Auf Verbindung    192.168.50.140    281
   192.168.50.140  255.255.255.255   Auf Verbindung    192.168.50.140    281
   192.168.50.255  255.255.255.255   Auf Verbindung    192.168.50.140    281
===========================================================================
Ständige Routen:
  Keine
`;
  const arpA = `
Schnittstelle: 192.168.50.140 --- 0xc
  Internetadresse       Physische Adresse     Typ
  192.168.50.20         dc-a6-32-5e-19-7a     dynamisch
  192.168.50.66         dc-a6-32-5e-19-7a     dynamisch
  192.168.50.255        ff-ff-ff-ff-ff-ff     statisch
`;
  const bekannt = { '192.168.50.1': { ttl: 255 }, '192.168.50.10': { ttl: 128 }, '192.168.50.20': { ttl: 64 }, '192.168.50.66': { ttl: 64 }, '192.168.50.131': { ttl: 128 }, '192.168.50.140': { ttl: 128 }, '127.0.0.1': { ttl: 128 }, '1.1.1.1': { ttl: 56, ms: 10 }, '9.9.9.9': { ttl: 56, ms: 12 } };
  const tracert = ziel => {
    const ipOk = /^(\d{1,3}\.){3}\d{1,3}$/.test(ziel) && ziel.split('.').every(x => +x <= 255);
    if (!ipOk) return `Die Routenverfolgung konnte den Zielsystemnamen ${ziel} nicht auflösen.\n(Simulation: Namen werden hier nicht aufgelöst – nutzt bitte eine IP-Adresse, z. B. 1.1.1.1.)\n`;
    if (ziel.startsWith('192.168.50.') || ziel.startsWith('127.')) {
      if (bekannt[ziel]) return N.tracert(ziel, [ziel]);
      return `\nRoutenverfolgung zu ${ziel} über maximal 30 Hops\n\n  1  192.168.50.140  meldet: Zielhost nicht erreichbar.\n\nAblaufverfolgung beendet.\n`;
    }
    return N.tracert(ziel, ['192.168.50.66', '192.168.50.1', '100.64.12.1', '203.0.113.9', ziel]);
  };
  const terminalVersand = {
    titel: 'Eingabeaufforderung – PC-VERSAND-02 (Versand)',
    prompt: 'C:\\Users\\m.lindner>',
    befehle: [
      { cmd: 'ipconfig', out: ipconfig },
      { cmd: 'ipconfig /all', alias: ['ipconfig -all'], out: ipconfigAll },
      { cmd: 'route print', alias: ['route print -4', 'route -4 print', 'netstat -r'], out: routePrint },
      { cmd: 'arp -a', alias: ['arp /a', 'arp -g'], out: arpA },
      { cmd: 'hostname', out: 'PC-VERSAND-02\n' },
      { tab: 'ping ', re: /^ping (\S+)$/, out: m => N.ping(m[1], bekannt, H.vers2.ip) },
      { tab: 'tracert ', re: /^tracert (?:-d )?(\S+)$/, out: m => tracert(m[1]) }
    ],
    spick: [
      ['ipconfig', 'IP-Adresse, Subnetzmaske, Standardgateway'],
      ['ipconfig /all', 'zusätzlich MAC-Adresse, DHCP-Server, DNS-Server, Lease'],
      ['route print', 'Routing-Tabelle des PCs'],
      ['arp -a', 'ARP-Cache: IP-Adresse → MAC-Adresse'],
      ['ping <IP-Adresse>', 'prüft, ob unter einer IP-Adresse jemand antwortet'],
      ['tracert <IP-Adresse>', 'zeigt alle Router (Hops) auf dem Weg zum Ziel'],
      ['hostname', 'Name des eigenen PCs']
    ]
  };
  const ausdruckVersand1 = `<div class="evidence"><h4>🖨️ Ausdruck von Herrn Brandt · PC-VERSAND-01 · ipconfig /all (Auszug)</h4>
    <div style="white-space:pre">IPv4-Adresse  . . . . . : 192.168.50.131
Subnetzmaske  . . . . . : 255.255.255.0
Lease erhalten. . . . . : Donnerstag, 17. September 2026 07:02:51
Lease läuft ab. . . . . : Freitag, 25. September 2026 07:02:51
Standardgateway . . . . : 192.168.50.1
DHCP-Server . . . . . . : 192.168.50.10
DNS-Server  . . . . . . : 192.168.50.10</div>
    <p style="margin:8px 0 0">Notiz Brandt: „Dieser PC wurde diese Woche <b>nicht</b> neu gestartet.“</p></div>`;

  // ------------------------------------------------------------ Mitschnitt Mittwoch 06:12 (PCs in Versand und Disposition starten nach Updates neu)
  // Port-Spiegelung am SW-SERVER-01: jeder an einem Port EINGEHENDE Frame wird einmal kopiert – deshalb sind auch Pi → Router (Port 23) und Router → Pi (Port 24) sichtbar.
  const P = H.pi, D = H.dc, R = H.router, V1 = H.vers1, V2 = H.vers2, V3 = H.dispo1;
  const off = (x, o) => Object.assign({ typ: 'dhcp', dip: '255.255.255.255', dst: BC, maske: '255.255.255.0' }, x, o);
  const PI_OFFER = { src: P.mac, sip: P.ip, server: P.ip, router: P.ip, dns: P.ip, lease: '1 hour', ttl: 64 };
  const DC_OFFER = { src: D.mac, sip: D.ip, server: D.ip, router: R.ip, dns: D.ip, lease: '8 days' };
  const mitschnitt = N.mitschnitt([
    { t: 0.000000, typ: 'dhcp', dhcp: 'Discover', src: V2.mac, dst: BC, sip: '0.0.0.0', dip: '255.255.255.255', client: V2.mac, xid: '0x6a1f33c2', host: 'PC-VERSAND-02' },
    off(PI_OFFER, { t: 0.000612, dhcp: 'Offer', client: V2.mac, xid: '0x6a1f33c2', your: '192.168.50.140' }),
    off(DC_OFFER, { t: 0.003118, dhcp: 'Offer', client: V2.mac, xid: '0x6a1f33c2', your: '192.168.50.142' }),
    { t: 0.010244, typ: 'dhcp', dhcp: 'Request', src: V2.mac, dst: BC, sip: '0.0.0.0', dip: '255.255.255.255', client: V2.mac, xid: '0x6a1f33c2', server: P.ip, wunsch: '192.168.50.140', host: 'PC-VERSAND-02' },
    off(PI_OFFER, { t: 0.011002, dhcp: 'ACK', client: V2.mac, xid: '0x6a1f33c2', your: '192.168.50.140' }),
    { t: 0.521077, typ: 'arp', op: 1, src: V2.mac, dst: BC, sip: V2.ip, tip: P.ip },
    { t: 0.521301, typ: 'arp', op: 2, src: P.mac, dst: V2.mac, sip: P.ip, tip: V2.ip },
    { t: 1.402215, typ: 'icmp', icmp: 8, src: V2.mac, dst: P.mac, sip: V2.ip, dip: '1.1.1.1', seq: 1 },
    { t: 1.402498, typ: 'icmp', icmp: 8, src: P.mac, dst: R.mac, sip: V2.ip, dip: '1.1.1.1', seq: 1, ttl: 127 },
    { t: 1.412133, typ: 'icmp', icmp: 0, src: R.mac, dst: P.mac, sip: '1.1.1.1', dip: V2.ip, seq: 1, ttl: 57 },
    { t: 1.412406, typ: 'icmp', icmp: 0, src: P.mac, dst: V2.mac, sip: '1.1.1.1', dip: V2.ip, seq: 1, ttl: 56 },
    { t: 2.050381, typ: 'icmp', icmp: 8, src: V1.mac, dst: R.mac, sip: V1.ip, dip: '1.1.1.1', seq: 9 },
    { t: 2.061720, typ: 'icmp', icmp: 0, src: R.mac, dst: V1.mac, sip: '1.1.1.1', dip: V1.ip, seq: 9, ttl: 57 },
    { t: 3.001455, typ: 'dhcp', dhcp: 'Discover', src: V3.mac, dst: BC, sip: '0.0.0.0', dip: '255.255.255.255', client: V3.mac, xid: '0x1bd70e95', host: 'PC-DISPO-01' },
    off(PI_OFFER, { t: 3.001987, dhcp: 'Offer', client: V3.mac, xid: '0x1bd70e95', your: '192.168.50.141' }),
    off(DC_OFFER, { t: 3.004402, dhcp: 'Offer', client: V3.mac, xid: '0x1bd70e95', your: '192.168.50.143' }),
    { t: 3.009871, typ: 'dhcp', dhcp: 'Request', src: V3.mac, dst: BC, sip: '0.0.0.0', dip: '255.255.255.255', client: V3.mac, xid: '0x1bd70e95', server: P.ip, wunsch: '192.168.50.141', host: 'PC-DISPO-01' },
    off(PI_OFFER, { t: 3.010630, dhcp: 'ACK', client: V3.mac, xid: '0x1bd70e95', your: '192.168.50.141' })
  ], 'Sep 23, 2026 06:12:03 Mitteleuropäische Sommerzeit');

  const filterSpick = `<details class="small" style="margin:6px 0"><summary style="cursor:pointer">📋 Filter-Spickzettel aufklappen</summary>
    <table class="t small"><tr><th>Filter</th><th>zeigt …</th></tr>
      <tr><td><code>dhcp</code>, <code>arp</code>, <code>icmp</code></td><td>nur Frames mit diesem Protokoll</td></tr>
      <tr><td><code>ip.src == …</code> / <code>ip.dst == …</code> / <code>ip.addr == …</code></td><td>Quell-IP / Ziel-IP / eins von beiden</td></tr>
      <tr><td><code>eth.src == …</code> / <code>eth.dst == …</code></td><td>Quell-MAC / Ziel-MAC</td></tr>
      <tr><td><code>&amp;&amp;</code> · <code>||</code> · <code>!</code></td><td>und · oder · nicht</td></tr></table></details>`;

  E.steps = [
    {
      id: 'e3-intro', type: 'story', titel: 'Ärger im Versand', bild: 'e3_versand.jpg',
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · Versandbüro · Mittwoch, 07:30 Uhr' },
        { wer: 'brandt', text: 'Heute Nacht haben die PCs im Versand und in der Disposition Windows-Updates bekommen und neu gestartet. Seitdem beschweren sich alle: Das Internet ist lahm, und Frau Lindner sagt, die Lohnseite sieht „irgendwie komisch“ aus. Bei PC-VERSAND-01 dagegen ist alles normal – der lief die ganze Nacht durch.' },
        { wer: 'kalle', text: 'Neu gestartet … also haben sie sich heute früh alle eine frische IP-Konfiguration geholt. Und meine Port-Spiegelung am Server-Switch lief die ganze Nacht – jeder Frame, der dort an irgendeinem Port ankam, liegt als Kopie auf meinem Laptop. Das riecht nach L3.' },
        { wer: 'direktorin', text: `<i>(über Funk)</i> Einverstanden. ${L(3)} ist heute Ihr Revier, Agentinnen und Agenten. Finden Sie heraus, <b>welchen Weg die Pakete aus dem Versand nehmen</b> – und wer ihnen diesen Weg zeigt.` }
      ]
    },

    {
      id: 'e3-weg', type: 'lesson', tag: 'TRAINING 1 · DER WEG EINES PAKETS', titel: 'Direkt oder übers Gateway?',
      html: `
        <p>Bevor ein PC ein Paket losschickt, trifft er auf ${L(3)} eine Entscheidung: <b>Liegt das Ziel in meinem eigenen Netz?</b> Das rechnet er mit seiner IP-Adresse und der <b>Subnetzmaske</b> aus – ihr kennt das vom Subnetting.</p>
        <table class="t">
          <tr><th>PC 192.168.50.140 / 255.255.255.0 will zu …</th><th>eigenes Netz?</th><th>Das Paket geht …</th><th>Ziel-MAC im Frame</th></tr>
          <tr><td>192.168.50.20 (Lohnportal)</td><td>ja (192.168.50.x)</td><td><b>direkt</b> zum Ziel</td><td>MAC von .20 (per ARP)</td></tr>
          <tr><td>1.1.1.1 (Internet)</td><td>nein</td><td>zum <b>Standardgateway</b></td><td>MAC des Gateways (per ARP)</td></tr>
        </table>
        <div class="merk"><b>Neuer LKW, gleiche Palette:</b> Auch wenn das Paket zum Gateway geht, bleibt die <b>Ziel-IP</b> im IP-Header <b>1.1.1.1</b>. Nur die <b>Ziel-MAC</b> im Frame zeigt auf das Gateway. Das Gateway (ein Router) packt das Paket dann in einen <b>neuen Frame</b> für die nächste Etappe.</div>
        <h3>Die Routing-Tabelle</h3>
        <p>Auch jeder PC hat eine kleine <b>Routing-Tabelle</b> (anzeigen mit <code>route print</code>). Die wichtigste Zeile ist die <b>Standardroute</b>:</p>
        <table class="t">
          <tr><th>Netzwerkziel</th><th>Netzwerkmaske</th><th>Gateway</th><th>Bedeutung</th></tr>
          <tr><td>0.0.0.0</td><td>0.0.0.0</td><td>192.168.50.1</td><td>„Alles, wofür ich nichts Genaueres weiß“ → ans Standardgateway</td></tr>
          <tr><td>192.168.50.0</td><td>255.255.255.0</td><td>Auf Verbindung</td><td>eigenes Netz → direkt zustellen</td></tr>
        </table>
        <h3>tracert – die Wegbeschreibung</h3>
        <p><code>tracert</code> listet jeden Router auf, den ein Paket auf dem Weg passiert – jeder Router ist ein <b>Hop</b>. Liegt das Ziel im eigenen Netz, gibt es keinen Router dazwischen: tracert zeigt dann nur das Ziel selbst.</p>
        <div class="merk"><b>Das Standardgateway muss im eigenen Netz liegen.</b> Der PC muss es ja per ARP und Frame direkt erreichen können – und das geht nur im eigenen Netz (${L(2)}).</div>`,
      kalle: 'Das Standardgateway ist der Wegweiser an der Hofausfahrt. Wer den Wegweiser umdreht, bestimmt, wo die LKW hinfahren.'
    },
    {
      id: 'e3-weg-quiz', type: 'quiz', titel: 'Wegweiser-Check',
      intro: '<p>Alle Aufgaben: Ein PC hat die IP-Adresse <b>192.168.50.140</b>, Subnetzmaske <b>255.255.255.0</b>, Standardgateway <b>192.168.50.1</b>.</p>',
      fragen: [
        { id: 'e3-q-direkt', frage: 'Der PC schickt ein Paket an <b>192.168.50.10</b>. Wie geht es auf die Reise?', optionen: ['Direkt zum Ziel', 'Über das Standardgateway', 'Über den DNS-Server', 'Gar nicht – dafür fehlt ein Router'], richtig: 0, erklaerung: '192.168.50.10 liegt im eigenen Netz 192.168.50.0/24 – also direkt, ohne Router.', hinweise: ['Vergleicht die ersten drei Zahlen (die Maske ist 255.255.255.0).'] },
        { id: 'e3-q-fremd', frage: 'Gehört <b>192.168.51.20</b> zum eigenen Netz des PCs?', optionen: ['Nein – der Netzanteil ist verschieden.', 'Ja – das ist fast dieselbe Adresse.', 'Ja – alle 192.168-Adressen sind ein Netz.', 'Das kann nur der Router entscheiden.'], richtig: 0, erklaerung: 'Bei 255.255.255.0 sind die ersten drei Oktette der Netzanteil: 192.168.50 gegen 192.168.51. Anderes Netz → Standardgateway.', hinweise: ['Welche Oktette gehören bei 255.255.255.0 zum Netzanteil?'] },
        { id: 'e3-q-zielmac', frage: 'Der PC schickt ein Paket an <b>1.1.1.1</b>. Welche <b>Ziel-MAC</b> steht im Frame, der den PC verlässt?', optionen: ['Die MAC-Adresse des Standardgateways', 'Die MAC-Adresse von 1.1.1.1', 'ff:ff:ff:ff:ff:ff (Broadcast)', 'Die eigene MAC-Adresse'], richtig: 0, erklaerung: 'Die MAC von 1.1.1.1 kennt der PC gar nicht – er liefert das Paket beim Gateway ab. Neuer LKW für jede Etappe.', hinweise: ['1.1.1.1 liegt nicht im eigenen Netz. Wohin geht der Frame also zuerst?'] },
        { id: 'e3-q-zielip', frage: 'Und welche <b>Ziel-IP</b> steht im IP-Header dieses Pakets?', optionen: ['1.1.1.1', '192.168.50.1', '192.168.50.140', '0.0.0.0'], richtig: 0, erklaerung: 'Die Ziel-IP bleibt vom Start bis zum Ziel gleich. Nur die MAC-Adressen wechseln bei jeder Etappe.', hinweise: ['Erinnert euch an die Palette mit der Zieladresse.'] },
        { id: 'e3-q-gwnetz', frage: 'Jemand trägt als Standardgateway <b>10.0.0.2</b> ein. Warum kann das nicht funktionieren?', optionen: ['Das Gateway liegt nicht im eigenen Netz.', 'Gateways müssen immer auf .1 enden.', '10er-Adressen sind im Internet verboten.', 'Es klappt – der Router findet das schon.'], richtig: 0, erklaerung: '10.0.0.2 liegt nicht im Netz 192.168.50.0/24. Den Frame zum Gateway schickt der PC aber direkt auf L2 (per ARP) – das Gateway muss also im eigenen Netz liegen.', hinweise: ['Lest den letzten Merkkasten der Lektion.'] }
      ]
    },

    {
      id: 'e3-dhcp', type: 'lesson', tag: 'TRAINING 2 · DHCP UNTER DER LUPE', titel: 'Wer verteilt die Wegweiser?',
      html: `
        <p>Woher kennt ein PC seine IP-Adresse, Maske, sein Standardgateway und den DNS-Server? Von <b>DHCP</b>. Ihr kennt DHCP schon – jetzt schauen wir genau hin. Der Ablauf hat vier Schritte, Merkwort <b>DORA</b>:</p>
        <table class="t">
          <tr><th>Schritt</th><th>Wer → an wen</th><th>Bedeutung</th></tr>
          <tr><td><b>D</b>iscover</td><td>PC → <b>Broadcast</b></td><td>„Gibt es hier einen DHCP-Server?“ Der PC hat noch keine IP-Adresse (Absender 0.0.0.0) und kennt keinen Server – also fragt er alle.</td></tr>
          <tr><td><b>O</b>ffer</td><td>Server → PC</td><td>„Ich biete dir 192.168.50.142 an, Gateway .1, DNS .10, für 8 Tage.“</td></tr>
          <tr><td><b>R</b>equest</td><td>PC → <b>Broadcast</b></td><td>„Ich nehme das Angebot von Server X.“ Per Broadcast, damit auch alle anderen Server erfahren, dass sie nicht gewählt wurden.</td></tr>
          <tr><td><b>A</b>ck</td><td>Server → PC</td><td>„Bestätigt – die Adresse gehört dir für die Leasedauer.“</td></tr>
        </table>
        <p>Ein Offer enthält neben der IP-Adresse <b>Optionen</b>, z. B. Option 1 (Subnetzmaske), <b>Option 3 (Router = Standardgateway)</b>, <b>Option 6 (DNS-Server)</b> und Option 51 (Leasedauer). DHCP läuft über UDP (Server-Port 67, Client-Port 68) und ist ein ${L(7)}-Protokoll – aber es verteilt die Wegweiser für ${L(3)}.</p>
        <h3>Die Schwachstelle</h3>
        <p>Auf den Discover darf <b>jedes Gerät</b> antworten. Die meisten PCs nehmen einfach das <b>erste Angebot</b>, das ankommt. Ein fremdes Gerät, das sich als DHCP-Server ausgibt, heißt <b>Rogue-DHCP-Server</b> (rogue = Schurke). Wer damit durchkommt, kann jedem PC ein falsches Gateway und einen falschen DNS-Server unterschieben.</p>
        <div class="merk"><b>Woran man einen Rogue-DHCP-Server erkennt:</b>
          <ul style="margin:6px 0 0">
            <li>Auf <b>einen</b> Discover kommen <b>zwei verschiedene Offers</b>.</li>
            <li>In <code>ipconfig /all</code> steht ein <b>DHCP-Server</b>, der nicht der offizielle ist.</li>
            <li>Gateway oder DNS-Server passen nicht zur Dokumentation – und <code>tracert</code> zeigt einen zusätzlichen Hop im eigenen Netz.</li>
          </ul></div>
        <div class="merk"><b>🔒 Akte „Switch-Schutz“ – gesperrt.</b> Gute Switches können DHCP-Antworten von fremden Ports blockieren. Wie das geht, erfahrt ihr später.</div>`,
      kalle: 'DHCP ist wie ein Empfang, an dem jeder Besucher fragt: „Wo muss ich hin?“ Und wer am schnellsten „Da lang!“ ruft, hat gewonnen.'
    },
    {
      id: 'e3-dora', type: 'sort', titel: 'DORA in der richtigen Reihenfolge', punkte: 8, spalten: true,
      intro: '<p>Ein PC startet und holt sich seine Konfiguration. Bringt die vier DHCP-Nachrichten in die richtige Reihenfolge.</p>',
      bins: [
        { id: 's1', label: '1. Schritt' }, { id: 's2', label: '2. Schritt' }, { id: 's3', label: '3. Schritt' }, { id: 's4', label: '4. Schritt' }
      ],
      items: [
        { id: 'e3-dora-request', text: 'Request (PC → Broadcast)', ziel: 's3', erklaerung: 'Der PC nimmt ein Angebot an – per Broadcast, damit alle Server es erfahren.', hinweis: 'Erst muss es ein Angebot geben, bevor der PC es annehmen kann.' },
        { id: 'e3-dora-ack', text: 'Ack (Server → PC)', ziel: 's4', erklaerung: 'Die Bestätigung kommt ganz zum Schluss.', hinweis: 'Das letzte Wort hat der Server.' },
        { id: 'e3-dora-discover', text: 'Discover (PC → Broadcast)', ziel: 's1', erklaerung: 'Am Anfang weiß der PC nichts – er ruft in die Runde.', hinweis: 'Womit fängt alles an, wenn der PC noch nichts weiß?' },
        { id: 'e3-dora-offer', text: 'Offer (Server → PC)', ziel: 's2', erklaerung: 'Die Server antworten mit einem Angebot.', hinweis: 'Was kommt als Antwort auf die Frage „Gibt es hier einen DHCP-Server?“' }
      ]
    },
    {
      id: 'e3-dhcp-quiz', type: 'quiz', titel: 'DHCP-Check',
      fragen: [
        { id: 'e3-q-discover', frage: 'Warum schickt der PC den <b>Discover</b> als Broadcast?', optionen: ['Er kennt den DHCP-Server noch nicht.', 'Broadcasts sind schneller als andere Frames.', 'Damit der Router die Anfrage mithören kann.', 'DHCP-Server nehmen nur Broadcasts an.'], richtig: 0, erklaerung: 'Direkt nach dem Start hat der PC noch keine IP-Konfiguration und kennt keinen DHCP-Server. Da bleibt nur: an alle fragen.', hinweise: ['Was weiß ein PC direkt nach dem Start über das Netz?'] },
        { id: 'e3-q-liefert', multi: true, frage: 'Was kann ein DHCP-Server einem PC mitteilen?', optionen: ['IP-Adresse und Subnetzmaske', 'Standardgateway', 'DNS-Server', 'Die MAC-Adresse des PCs', 'Die Portnummer des Browsers'], richtig: [0, 1, 2], erklaerung: 'IP, Maske, Gateway (Option 3), DNS-Server (Option 6) und Leasedauer. Die MAC-Adresse hat der PC selbst – sie steht in seiner Netzwerkkarte.', hinweise: ['Schaut in die Lektion: Welche Optionen stehen in einem Offer?'] },
        { id: 'e3-q-zwei', frage: 'Zwei DHCP-Server antworten auf denselben Discover. Welches Angebot nimmt ein Windows-PC normalerweise?', optionen: ['Das Offer, das zuerst ankommt.', 'Immer das des offiziellen Servers.', 'Das mit der längsten Leasedauer.', 'Keins – er meldet einen Fehler.'], richtig: 0, erklaerung: 'In der Regel nimmt der PC das Offer, das zuerst ankommt. Fest vorgeschrieben ist das nicht – es hängt vom Betriebssystem ab. Genau darauf setzt ein Rogue-DHCP-Server: schneller sein als der echte.', hinweise: ['Kalle hat es mit dem Empfang verglichen …'] }
      ]
    },

    {
      id: 'e3-terminal', type: 'quiz', titel: 'Am PC im Versand',
      intro: '<p>Ihr sitzt an <b>PC-VERSAND-02</b> von Frau Lindner, der heute Nacht neu gestartet wurde. Daneben liegt ein Ausdruck von PC-VERSAND-01, der durchgelaufen ist. Tippt die Befehle selbst ein – der <b>📋 Spickzettel</b> hilft.</p>',
      kontext: ausdruckVersand1,
      terminal: terminalVersand,
      fragen: [
        { id: 'e3-t-gw', eingabe: 'ip', frage: 'Welches <b>Standardgateway</b> hat PC-VERSAND-02?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: '192.168.50.66 – nicht der Router .1! Das ist die Adresse des Raspberry Pi aus Einsatz 2.', hinweise: ['Schon das einfache <code>ipconfig</code> zeigt das Standardgateway.'] },
        { id: 'e3-t-dhcp', eingabe: 'ip', frage: 'Von welchem <b>DHCP-Server</b> hat der PC seine Konfiguration bekommen?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Auch hier die .66. Der offizielle DHCP-Server ist SRV-DC01 mit der .10.', hinweise: ['Den DHCP-Server zeigt nur die ausführliche Variante von ipconfig.', 'Tippt <code>ipconfig /all</code>.'] },
        { id: 'e3-t-vergleich', multi: true, frage: 'Vergleicht mit dem Ausdruck von PC-VERSAND-01. Welche Einträge zeigen, dass PC-VERSAND-02 <b>falsche Wegweiser</b> bekommen hat?', optionen: ['Standardgateway', 'DNS-Server', 'DHCP-Server', 'Subnetzmaske', 'IPv4-Adresse'], richtig: [0, 1, 2], erklaerung: 'Gateway, DNS-Server und DHCP-Server zeigen auf die .66. Dass die IPv4-Adressen verschieden sind, ist normal – jeder PC hat seine eigene. Die Maske ist gleich. Und die Leasedauer von nur einer Stunde ist auch merkwürdig …', hinweise: ['Geht die Zeilen einzeln durch: Was <i>muss</i> bei zwei PCs im selben Netz gleich sein?'] },
        { id: 'e3-t-route', eingabe: 'ip', frage: 'Öffnet die Routing-Tabelle. Über welches Gateway schickt der PC alles, wofür er keine genauere Route hat (Netzwerkziel 0.0.0.0)?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Die Standardroute 0.0.0.0/0.0.0.0 zeigt auf die .66. Alles, was das eigene Netz verlässt, fährt zuerst beim Pi vorbei.', hinweise: ['Der Befehl lautet <code>route print</code>.', 'Sucht die Zeile mit Netzwerkziel 0.0.0.0.'] },
        { id: 'e3-t-hop', eingabe: 'ip', frage: 'Verfolgt den Weg zu <b>1.1.1.1</b> (ein öffentlicher DNS-Server im Internet). Welche IP-Adresse steht beim <b>ersten Hop</b>?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Erster Hop .66, zweiter Hop .1 – das Paket macht einen Umweg über den Pi, bevor es beim echten Router ankommt.', hinweise: ['Der Befehl lautet <code>tracert 1.1.1.1</code>.'] },
        { id: 'e3-t-umweg', frage: 'Warum ist der zusätzliche Hop 192.168.50.66 vor dem Router so verdächtig?', optionen: ['Der ganze Internetverkehr läuft über den Pi.', 'tracert muss immer genau einen Hop zeigen.', 'Der Pi macht das Internet dadurch schneller.', 'Gar nicht – jedes Netz hat zwei Router.'], richtig: 0, erklaerung: 'Ein Man-in-the-Middle auf L3: Der Pi spielt Router, reicht alle Pakete ins Internet weiter – und kann sie dabei mitlesen und verändern. Kein Wunder, dass das Internet im Versand langsamer ist.', hinweise: ['In der Dokumentation von F&amp;O gibt es genau einen Router: die .1.'] },
        { id: 'e3-t-lokal', frage: 'Probiert <code>tracert 192.168.50.20</code>. Warum taucht die .66 dort <b>nicht</b> auf – obwohl der Pi sich in Einsatz 2 als .20 ausgegeben hat?', optionen: ['.20 liegt im eigenen Netz.', 'Der Pi ist für das Lohnportal nicht zuständig.', 'tracert verfolgt nur Adressen im Internet.', 'Der Lohnserver blockiert den Pi.'], richtig: 0, erklaerung: '.20 liegt im eigenen Netz → direkte Zustellung, kein Router, kein Hop. Und die gefälschte MAC-Adresse aus Einsatz 2 bleibt für tracert unsichtbar: tracert zeigt nur L3. Jedes Werkzeug zeigt „seine“ Schicht – deshalb ermitteln wir Schicht für Schicht.', hinweise: ['Liegt .20 im eigenen Netz?', 'Welche Adressen zeigt tracert an – IP oder MAC?'] }
      ]
    },

    {
      id: 'e3-wireshark', type: 'quiz', titel: 'Der Mitschnitt von 06:12 Uhr',
      intro: `<p>Kalles Mitschnitt (Port-Spiegelung am Server-Switch) vom Mittwochmorgen, als die PCs neu starteten. Beteiligte: <b>PC-VERSAND-01</b> .131 (durchgelaufen), <b>PC-VERSAND-02</b> und <b>PC-DISPO-01</b> (neu gestartet), <b>SRV-DC01</b> .10 (offizieller DHCP-Server, 00:15:5d:0a:32:10), der <b>Router</b> .1 (00:a0:57:2b:7c:01) und der <b>Raspberry Pi</b> .66 (dc:a6:32:5e:19:7a).</p>${filterSpick}`,
      wireshark: { datei: 'sw-server-01_mi_0612.pcapng', pakete: mitschnitt },
      fragen: [
        { id: 'e3-ws-dhcp', eingabe: 'filter', frage: 'Schreibt einen Anzeigefilter, der <b>nur DHCP</b> zeigt.', richtig: 'dhcp', erklaerung: 'Übrig bleiben zwei DORA-Abläufe – mit einer Besonderheit: Es gibt jeweils <b>zwei</b> Offers.', hinweise: ['Wie beim ARP-Filter: einfach der Name des Protokolls.'] },
        { id: 'e3-ws-offer', meldung: true, frage: 'Auf den Discover von PC-VERSAND-02 (Frame 1) kommen zwei Offers. Markiert das Offer des <b>falschen</b> DHCP-Servers und meldet es.', richtig: [2, 15], erklaerung: 'Frame 2: Absender 192.168.50.66, Router .66, DNS .66, Leasedauer 1 Stunde. Das echte Offer von SRV-DC01 folgt erst in Frame 3.', falsch: { 3: 'Frame 3 kommt von 192.168.50.10 – dem offiziellen Server SRV-DC01.' }, hinweise: ['Schaut auf die Quell-IP der beiden Offers.', 'Der offizielle DHCP-Server hat die .10.'] },
        { id: 'e3-ws-schneller', frage: 'Warum hat PC-VERSAND-02 das falsche Angebot angenommen?', optionen: ['Es kam zuerst an.', 'Es bot die bessere IP-Adresse an.', 'Der offizielle Server hat nicht geantwortet.', 'Es bot die längere Leasedauer an.'], richtig: 0, erklaerung: 'Das falsche Offer kam nach 0,6 ms an, das echte erst nach 3,1 ms – und der PC nimmt das erste. Der Pi antwortet sofort, der offizielle Server ließ sich ein paar Millisekunden mehr Zeit. Im Request (Frame 4) wählt der PC dann ausdrücklich Server 192.168.50.66.', hinweise: ['0,000612 s gegen 0,003118 s – welches ist schneller?'] },
        { id: 'e3-ws-echt', eingabe: 'ip', frage: 'Klappt das <b>echte</b> Offer von SRV-DC01 auf. Welches Standardgateway (Option 3, Router) hätte der PC eigentlich bekommen sollen?', platzhalter: 'IP-Adresse', richtig: '192.168.50.1', erklaerung: 'Option 3: Router 192.168.50.1 – der echte Router. So steht es auch auf dem Ausdruck von PC-VERSAND-01.', hinweise: ['Markiert Frame 3 und klappt „Dynamic Host Configuration Protocol (Offer)“ auf.'] },
        { id: 'e3-ws-f8', eingabe: 'mac', frage: 'In <b>Frame 8</b> pingt PC-VERSAND-02 die 1.1.1.1 an. An welche <b>Ziel-MAC</b> geht dieser Frame?', platzhalter: 'MAC-Adresse', richtig: 'dc:a6:32:5e:19:7a', erklaerung: 'Ziel-IP 1.1.1.1, Ziel-MAC: der Raspberry Pi – weil er dem PC als Standardgateway untergeschoben wurde.', hinweise: ['Klappt in Frame 8 die Zeile „Ethernet II“ auf.'] },
        { id: 'e3-ws-f9', frage: 'Vergleicht <b>Frame 8 und Frame 9</b>. Was hat sich geändert, was ist gleich geblieben?', optionen: ['Neue MAC-Adressen, gleiche IP-Adressen', 'Neue IP-Adressen, gleiche MAC-Adressen', 'Nichts – Frame 9 ist eine Kopie', 'Die Ziel-IP wurde auf .1 geändert'], richtig: 0, erklaerung: 'Neue MAC-Adressen (jetzt vom Pi zum Router), gleiche IP-Adressen: Der Pi reicht das Paket wie ein Router an den echten Router weiter. Genau der Trick aus der Grundausbildung – neuer LKW, gleiche Palette. Übrigens sinkt dabei das TTL von 128 auf 127: Jeder Router zieht 1 ab.', hinweise: ['Vergleicht Ethernet-Zeile und IP-Zeile der beiden Frames.'] },
        { id: 'e3-ws-internet', eingabe: 'filter', frage: 'Schreibt einen Filter, der nur die Frames zeigt, deren <b>Ziel-IP 1.1.1.1</b> ist.', richtig: 'ip.dst == 1.1.1.1', erklaerung: 'Drei Frames: 8 und 9 (PC-VERSAND-02 über den Pi) und 12 (PC-VERSAND-01).', hinweise: ['Ziel-IP heißt im Filter <code>ip.dst</code>.', '<code>ip.dst == 1.1.1.1</code>'] },
        { id: 'e3-ws-v1', frage: 'Frame 12 kommt von PC-VERSAND-01 (alte, korrekte Konfiguration). Wohin schickt er seinen Frame?', optionen: ['Direkt an den echten Router', 'Ebenfalls an den Raspberry Pi', 'An den DHCP-Server SRV-DC01', 'Per Broadcast an alle Geräte'], richtig: 0, erklaerung: 'Ziel-MAC 00:a0:57:2b:7c:01 = LANCOM-Router – ohne Umweg über den Pi. So sieht der richtige Weg aus.', hinweise: ['Schaut in Frame 12 auf „Destination“ in der Ethernet-Zeile.'] }
      ]
    },

    {
      id: 'e3-beweise', type: 'sort', titel: 'Beweise nach Schichten', punkte: 8,
      intro: '<p>Die Direktorin will die Akte sauber nach Schichten geordnet haben. Auf welche Schicht bezieht sich jedes Beweisstück?</p>',
      bins: [3, 2, 1].map(n => ({ id: n, kurz: 'L' + n, farbe: n, label: OSI.handbuch.find(h => h.n === n).name })),
      items: [
        { id: 'e3-bw-gw', text: 'Standardgateway 192.168.50.66 statt .1', ziel: 3, erklaerung: 'Gateway = IP-Adresse = Weg in fremde Netze → L3.', hinweis: 'Das Gateway ist eine IP-Adresse.' },
        { id: 'e3-bw-led', text: 'Port 23 läuft mit 100 Mbit/s', ziel: 1, erklaerung: 'Geschwindigkeit der Verbindung → L1.', hinweis: 'Es geht um die Geschwindigkeit auf der Leitung.' },
        { id: 'e3-bw-arp', text: 'ARP-Cache: 192.168.50.20 → dc-a6-32-5e-19-7a', ziel: 2, erklaerung: 'Die falsche MAC-Adresse zum Lohnportal → L2.', hinweis: 'Was ist hier falsch – die IP oder die MAC?' },
        { id: 'e3-bw-hop', text: 'tracert: zusätzlicher Hop .66 vor dem Router', ziel: 3, erklaerung: 'Hops = Router auf dem Weg → L3.', hinweis: 'tracert zeigt Router – mit welchen Adressen?' },
        { id: 'e3-bw-oui', text: 'OUI dc:a6:32 = Raspberry Pi', ziel: 2, erklaerung: 'Herstellerkennung der MAC-Adresse → L2.', hinweis: 'Die OUI ist ein Teil welcher Adresse?' },
        { id: 'e3-bw-kabel', text: 'Graues Cat-5e-Patchkabel, 50 cm', ziel: 1, erklaerung: 'Kabel → L1.', hinweis: 'Kann ein Kabel Adressen lesen?' },
        { id: 'e3-bw-route', text: 'Standardroute 0.0.0.0 zeigt auf 192.168.50.66', ziel: 3, erklaerung: 'Routing-Tabelle → L3.', hinweis: 'Routing gehört zu welcher Schicht?' },
        { id: 'e3-bw-zielmac', text: 'Frame an 1.1.1.1 trägt die Ziel-MAC des Pi', ziel: 2, erklaerung: 'Die Ziel-MAC im Frame → L2. (Die Ursache liegt auf L3 – das falsche Gateway.)', hinweis: 'Um welche Adresse geht es in diesem Beweisstück genau?' }
      ]
    },

    {
      id: 'e3-zeit', type: 'quiz', titel: 'Wann ging es los?',
      intro: '<p>Herr Brandt hat die Ereignisprotokolle mehrerer PCs ausgewertet: Wann hat welcher PC am <b>Montag</b> eine neue IP-Konfiguration bekommen – und von welchem DHCP-Server?</p>',
      kontext: `<div class="evidence"><h4>📋 DHCP-Leases laut Ereignisprotokollen · Montag, 21.09.2026</h4>
          <table><tr><th>Uhrzeit</th><th>PC</th><th>DHCP-Server</th><th>Standardgateway</th></tr>
            <tr><td>06:05</td><td>PC-IT-01</td><td>192.168.50.10</td><td>192.168.50.1</td></tr>
            <tr><td>07:12</td><td>PC-DISPO-02</td><td>192.168.50.10</td><td>192.168.50.1</td></tr>
            <tr><td>07:58</td><td>PC-BUCH-01</td><td>192.168.50.10</td><td>192.168.50.1</td></tr>
            <tr><td>08:14</td><td>PC-GF-01</td><td>192.168.50.66</td><td>192.168.50.66</td></tr>
            <tr><td>08:31</td><td>PC-GF-02</td><td>192.168.50.66</td><td>192.168.50.66</td></tr>
            <tr><td>08:47</td><td>PC-DISPO-03</td><td>192.168.50.66</td><td>192.168.50.66</td></tr></table></div>
        <div class="evidence"><h4>🔐 Zur Erinnerung: Zutrittsprotokoll Serverraum (Einsatz 1)</h4>
          <table><tr><th>Tag</th><th>Uhrzeit</th><th>Person</th></tr>
            <tr><td>Fr</td><td>14:10</td><td>Y. Demir (Hausmeister) mit M. Seidel (Drucker-Techniker)</td></tr>
            <tr><td>Mo</td><td>08:03</td><td>L. Berger (Azubi)</td></tr>
            <tr><td>Mo</td><td>16:40</td><td>T. Brandt (IT-Leiter)</td></tr></table></div>`,
      fragen: [
        { id: 'e3-zt-fenster', frage: 'In welchem Zeitraum am Montag hat der falsche DHCP-Server <b>zum ersten Mal</b> geantwortet?', optionen: ['Zwischen 07:58 und 08:14 Uhr', 'Zwischen 06:05 und 07:12 Uhr', 'Schon am Freitag um 14:10 Uhr', 'Erst nach 08:47 Uhr'], richtig: 0, erklaerung: 'Um 07:58 bekam PC-BUCH-01 noch eine echte Konfiguration, um 08:14 PC-GF-01 schon eine falsche.', hinweise: ['Sucht den letzten Eintrag mit der .10 und den ersten mit der .66.'] },
        { id: 'e3-zt-wer', frage: 'Wer war laut Zutrittsprotokoll <b>genau in diesem Zeitraum</b> im Serverraum?', optionen: ['Leon Berger (Mo 08:03)', 'Yusuf Demir und Marco Seidel', 'Thomas Brandt', 'Niemand'], richtig: 0, erklaerung: 'Leon Berger betrat den Serverraum um 08:03 – elf Minuten vor der ersten falschen Antwort. Das sieht nicht gut aus für ihn.', hinweise: ['Welcher Eintrag im Zutrittsprotokoll liegt zwischen 07:58 und 08:14?'] },
        { id: 'e3-zt-beweis', frage: 'Ist Leon Berger damit überführt?', optionen: ['Nein – bekannt ist nur, wann der Dienst startete.', 'Ja – die Uhrzeit passt genau.', 'Ja – nur er kennt sich mit Raspberry Pis aus.', 'Nein – Azubis haben keinen Serverraum-Zugang.'], richtig: 0, erklaerung: 'Zeitlicher Zusammenhang ist ein <b>Indiz</b>, kein Beweis. Die Tabelle zeigt nur, wann der falsche DHCP-Server zum ersten Mal <i>geantwortet</i> hat – nicht, wann das Gerät angeschlossen wurde. Ein Computer wie der Pi kann ein Programm auch zu einer festgelegten Uhrzeit automatisch starten. Das Gerät kann also schon am Freitag angeschlossen worden sein.', hinweise: ['Was genau misst die Tabelle: den Anschluss des Geräts oder seine erste DHCP-Antwort?'] }
      ]
    },

    {
      id: 'e3-cliffhanger', type: 'story', titel: 'Wegweiser und Auskunft', bild: 'e3_wegweiser.jpg', board: true,
      szenen: [
        { wer: 'kalle', text: 'Halten wir fest: Der Pi gibt sich auf L2 als Lohnportal aus <i>und</i> verteilt per DHCP ein falsches Gateway. Er ist der umgedrehte Wegweiser an der Hofausfahrt. Alles, was ins Internet will, fährt bei ihm vorbei.' },
        { wer: 'kalle', text: 'Und noch was: Als <b>DNS-Server</b> hat er sich auch selbst eingetragen. Wer die Namen auflöst, entscheidet, auf welcher Seite man landet … Aber eins nach dem anderen.' },
        { wer: 'brandt', text: 'Leon war um 08:03 im Serverraum. Ich … ich hätte das nie von ihm gedacht.' },
        { wer: 'direktorin', text: 'Noch denkt das niemand, Herr Brandt. Wir haben Indizien, keine Beweise. Agentinnen und Agenten: Der Pi spielt Router und DHCP-Server. Als Nächstes klopfen wir an seine Türen – auf <b>L4</b>. Welche Dienste lauschen auf diesem Gerät?' },
        { wer: 'system', text: '▶ Akte „Einsatz 4 – Offene Türen“ wird vorbereitet …' }
      ]
    },
    {
      id: 'e3-aussen', type: 'sealed', bonus: true, titel: 'Außeneinsatz: Zwei Server, ein Discover',
      teaser: 'In Packet Tracer untersucht ihr Kalles Nachbau des F&amp;O-Netzes: Zwei DHCP-Server antworten auf denselben Discover. Ihr beobachtet, welches Angebot gewinnt – und was tracert danach anzeigt.',
      inhalt: `<p>Kalle hat das Netz von F&amp;O in seinem Labor nachgebaut, samt einem Nachbau des Fremdgeräts. Damit spielt ihr nach, was am Mittwochmorgen im Versand passiert ist: Was geschieht, wenn <b>zwei DHCP-Server</b> auf denselben Discover antworten? Die IP-Adressen der PCs können im Labor von denen im Fall abweichen.</p>
        <div class="btnrow" style="margin-bottom:10px"><a class="btn" href="aussen/E3_Zwei-Server-ein-Discover.pkt" download>⬇ Simulationsnetz herunterladen (Packet Tracer)</a></div>
        <div class="merk"><b>Befehle:</b> Welche Befehle ihr braucht, schlagt ihr in der <b>Befehlsreferenz</b> im 📘 Handbuch nach (oben in der Leiste).</div>
        <div class="merk"><b>Beweisstück-Regel im Labor:</b> Das Fremdgerät ist gesperrt. Ihr untersucht es nur über das Netz – so wie im Fall.</div>
        <div class="merk"><b>Kalles Laborhinweis:</b> Packet Tracer bildet zwei DHCP-Server, die gleichzeitig antworten, nicht ganz sauber ab. Mal gewinnt der eine, mal der andere, und manchmal mischt er die Angebote: die IP-Adresse vom einen Server, Gateway und DNS-Server vom anderen. Auch die Zeile <b>„DHCP Servers“</b> in der ausführlichen IP-Konfiguration stimmt dann nicht immer, und in den Details eines Offers zeigt Packet Tracer nur einen Teil der Optionen, das Gateway fehlt dort. Verlasst euch auf <b>Standardgateway</b>, <b>DNS-Server</b> und den <b>Weg zu 1.1.1.1</b>. Ein echter Windows-PC nimmt genau ein Angebot an und zeigt dessen Server an.</div>
        <h3>Euer Auftrag</h3>
        <ol>
          <li><b>Freitag – alles normal:</b> Öffnet das Simulationsnetz in <b>Cisco Packet Tracer</b> und spult die Zeit vor (<b>Fast Forward Time</b>), bis alle Leitungen grün angezeigt werden. Nur am Fremdgerät bleiben sie rot: Es ist noch ausgeschaltet. Prüft auf <b>PC-VERSAND-01</b> und <b>PC-VERSAND-02</b> über die Eingabeaufforderung die IP-Konfiguration.</li>
          <li><b>Montag, 08:05 – das Fremdgerät startet:</b> Schaltet es im Reiter <b>Physical</b> ein und spult vor, bis auch seine Leitung am Switch grün ist. Schaut danach noch einmal in die IP-Konfiguration von PC-VERSAND-01.</li>
          <li><b>Mittwoch, 06:12 – neue Konfiguration:</b>
            <ol type="a">
              <li>Schaltet auf <b>Simulation</b> um und stellt die Filter so ein, dass nur <b>DHCP</b> angezeigt wird. Lasst PC-VERSAND-02 seine IP-Konfiguration <b>abgeben</b> und dann <b>neu anfordern</b>. Verfolgt mit <b>Capture/Forward</b>, wohin der Discover geht und wer darauf antwortet. Öffnet das Offer des Fremdgeräts.</li>
              <li>Schaltet zurück auf <b>Realtime</b>. Wiederholt Abgeben und Neu-Anfordern auf PC-VERSAND-02, bis sein Standardgateway <b>192.168.50.66</b> ist. Verfolgt dann über die Eingabeaufforderung den Weg zu <b>1.1.1.1</b> und vergleicht mit PC-VERSAND-01. <b>PC-VERSAND-01 bleibt unangetastet</b> – er lief im Fall die ganze Nacht durch.</li>
            </ol></li>
          <li><b>Aufräumen:</b> Schaltet das Fremdgerät wieder aus. Verfolgt von PC-VERSAND-02 noch einmal den Weg zu 1.1.1.1. Lasst den PC dann seine Konfiguration abgeben und neu anfordern und prüft den Weg erneut. Dann beantwortet die Fragen unten.</li>
        </ol>
        <div class="merk"><b>Erst abgeben, dann neu anfordern:</b> Hat ein PC noch eine gültige Lease, fragt er beim Erneuern nur seinen bisherigen DHCP-Server – ohne Discover an alle. Erst wenn er die Lease abgibt, beginnt er wieder von vorn mit DORA. Und dann darf jeder antworten.</div>`,
      abschluss: `<div class="profi"><b>🕵️ Profi-Tipp – DORA am eigenen PC beobachten:</b> Startet Wireshark mit dem Filter <code>dhcp</code> und gebt in der Eingabeaufforderung <code>ipconfig /release</code> und danach <code>ipconfig /renew</code> ein. Ihr seht Discover, Offer, Request und Ack eures echten Netzes – mit allen Optionen, auch dem Router. Antworten zwei Server, habt ihr ein Problem gefunden. Achtung: Nach <code>/release</code> ist der PC kurz offline, und im Betrieb gelten für Mitschnitte die IT-Sicherheitsvorgaben.</div>`,
      fragen: [
        { id: 'e3-pt-start', eingabe: 'ip', frage: 'Freitag, alles normal: Welches <b>Standardgateway</b> haben die beiden PCs nach dem Öffnen?', platzhalter: 'IP-Adresse', richtig: '192.168.50.1', erklaerung: '192.168.50.1 – der echte Router RT-FO. Solange das Fremdgerät aus ist, verteilt nur SRV-DC01 Konfigurationen.', hinweise: ['Welcher Befehl zeigt das Standardgateway? Schaut in die Befehlsreferenz im 📘 Handbuch.'] },
        { id: 'e3-pt-still', frage: 'Das Fremdgerät läuft jetzt. Was hat sich an der Konfiguration von <b>PC-VERSAND-01</b> geändert?', optionen: ['Nichts – er hat nicht neu angefragt.', 'Sein Gateway wechselte sofort auf .66.', 'Er bekam eine zweite IP vom Fremdgerät.', 'Er hat seine IP-Adresse verloren.'], richtig: 0, erklaerung: 'DHCP-Server melden sich nicht von selbst. Ein PC bekommt nur dann eine Konfiguration, wenn er danach fragt – zum Beispiel beim Start. Solange PC-VERSAND-01 nicht fragt, behält er die richtigen Wegweiser.', hinweise: ['Wer beginnt bei DORA – der PC oder der Server?'] },
        { id: 'e3-pt-discover', frage: 'An wen schickt PC-VERSAND-02 seinen <b>Discover</b>?', optionen: ['Als Broadcast an alle Geräte im Netz', 'Direkt an SRV-DC01, den er schon kennt', 'An sein Standardgateway RT-FO', 'Nur an das Fremdgerät'], richtig: 0, erklaerung: 'Nach dem Abgeben hat der PC keine Konfiguration mehr und fragt alle. Im Simulationsmodus seht ihr den Umschlag an jedem Port des Switches – auch am Fremdgerät.', hinweise: ['Schaut, an welche Ports der Switch den Discover weitergibt.'] },
        { id: 'e3-pt-antworten', frage: 'Welche Geräte antworten auf den Discover mit einem <b>Offer</b>?', optionen: ['SRV-DC01 und das Fremdgerät', 'Nur SRV-DC01', 'SRV-DC01, Fremdgerät und RT-FO', 'Alle Geräte, die ihn bekommen'], richtig: 0, erklaerung: 'Zwei Offers auf einen Discover – genau das Erkennungsmerkmal aus der Lektion. Der Router RT-FO bekommt den Discover zwar auch, ist aber kein DHCP-Server und schweigt.', hinweise: ['Zählt die Umschläge, die nach dem Discover zurück zu PC-VERSAND-02 laufen. Von wem kommen sie?'] },
        { id: 'e3-pt-offer-dns', eingabe: 'ip', frage: 'Öffnet das Offer des <b>Fremdgeräts</b>. Welchen <b>DNS-Server</b> bietet es an?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: '192.168.50.66 – das Fremdgerät trägt sich selbst als DNS-Server ein. Was es damit anfangen kann, untersucht ihr in Einsatz 5.', hinweise: ['Klickt auf den Umschlag des Offers, das vom Fremdgerät kommt, und scrollt in den PDU-Details nach unten.', 'Gesucht ist die Option „Domain Name Server“.'] },
        { id: 'e3-pt-zufall', frage: 'Warum landete PC-VERSAND-02 nicht bei jedem Versuch beim Fremdgerät?', optionen: ['Es gewinnt das Angebot, das zuerst ankommt.', 'Der PC wechselt bei jedem Versuch ab.', 'Der PC bevorzugt den offiziellen Server.', 'Das Fremdgerät antwortet nur jedes 2. Mal.'], richtig: 0, erklaerung: 'Beide Server antworten, und der PC nimmt in der Regel das Angebot, das zuerst ankommt. Wer schneller ist, hängt von Zufällen wie der Auslastung ab. Ob ein Server der offizielle ist, kann der PC nicht erkennen. Im Fall war der Pi schneller – das zeigt Kalles Mitschnitt von 06:12.', hinweise: ['Erinnert euch an Kalles Vergleich mit dem Empfang.'] },
        { id: 'e3-pt-vergleich', multi: true, frage: 'PC-VERSAND-02 hat das Fremdgerät als Gateway. Vergleicht seine IP-Konfiguration mit PC-VERSAND-01. Welche Einträge zeigen auf das <b>Fremdgerät</b>?', optionen: ['Standardgateway', 'DNS-Server', 'Subnetzmaske', 'IPv4-Adresse', 'Physical Address'], richtig: [0, 1], erklaerung: 'Gateway und DNS-Server zeigen auf die .66 – wie im Fall. Die Maske ist gleich, und jeder PC hat seine eigene IP- und MAC-Adresse. Die Zeile „DHCP Servers“ lasst ihr hier außen vor, denn Packet Tracer zeigt sie in diesem Fall nicht zuverlässig an (siehe Kalles Laborhinweis).', hinweise: ['Was <i>muss</i> bei zwei PCs im selben Netz gleich sein – und was steht bei PC-VERSAND-02 anders?'] },
        { id: 'e3-pt-hop', eingabe: 'ip', frage: 'Verfolgt von PC-VERSAND-02 den Weg zu <b>1.1.1.1</b>. Welche IP-Adresse steht beim <b>ersten Hop</b>?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Erst .66, dann .1, dann 1.1.1.1 – derselbe Umweg wie im Fall. Diesmal habt ihr selbst gesehen, wie das falsche Gateway per DHCP auf den PC kam.', hinweise: ['Welcher Befehl zeigt alle Router auf dem Weg? Schaut in die Befehlsreferenz.'] },
        { id: 'e3-pt-v1', frage: 'PC-VERSAND-01 erreicht 1.1.1.1 weiter direkt über die .1. Warum?', optionen: ['Er hat nicht neu angefragt.', 'Das Fremdgerät kennt seine MAC nicht.', 'Er hängt an einem anderen Switch-Port.', 'Er hat eine feste IP-Adresse.'], richtig: 0, erklaerung: 'Er hat seine Konfiguration geholt, als das Fremdgerät noch aus war, und seitdem nicht neu gefragt – genau wie PC-VERSAND-01 im Fall, der die Nacht durchlief.', hinweise: ['Was habt ihr mit PC-VERSAND-02 gemacht, mit PC-VERSAND-01 aber nicht?'] },
        { id: 'e3-pt-aus', frage: 'Das Fremdgerät ist aus. Was zeigt der Weg von PC-VERSAND-02 zu 1.1.1.1 jetzt?', optionen: ['Keine Antwort mehr, .66 fehlt.', 'Wieder den Weg über die .1', 'Den Umweg über SRV-DC01', 'Weiter den Umweg über .66'], richtig: 0, erklaerung: 'Der PC schickt alles weiter an sein Gateway .66 – aber dort ist niemand mehr. Statt eines Umwegs gibt es jetzt gar keinen Weg ins Internet.', hinweise: ['Welches Gateway hat PC-VERSAND-02 noch eingetragen – und gibt es das Gerät noch?'] },
        { id: 'e3-pt-aufraeumen', frage: 'Bei F&amp;O ist das Fremdgerät entfernt. Was müssen die Admins <b>noch</b> tun?', optionen: ['Betroffene PCs neu anfragen lassen', 'Nichts – ohne Pi ist alles wieder gut', 'SRV-DC01 komplett neu installieren', 'Den Switch-Port 23 austauschen'], richtig: 0, erklaerung: 'Die PCs behalten die falschen Wegweiser, bis sie neu fragen. Erst Abgeben und Neu-Anfordern holt die richtige Konfiguration von SRV-DC01 – das habt ihr gerade selbst gemacht. Das Gerät zu entfernen reicht also nicht.', hinweise: ['Was ist bei PC-VERSAND-02 passiert, als ihr nur das Fremdgerät ausgeschaltet habt?'] },
        { id: 'e3-pt-beleg', frage: 'Was <b>belegt</b> Kalles Laborversuch für den Fall?', optionen: ['Wie die Wegweiser umgelenkt wurden', 'Wer den Pi angeschlossen hat', 'Dass Leon Berger der Täter ist', 'Wann der Pi angeschlossen wurde'], richtig: 0, erklaerung: 'Der Versuch zeigt den Mechanismus: Ein zweiter DHCP-Server, der schneller antwortet, verteilt falsche Wegweiser. Wer das Gerät angeschlossen hat und wann, kann ein Nachbau nicht zeigen – dafür braucht es Spuren aus dem Fall wie das Zutrittsprotokoll.', hinweise: ['Ein Nachbau im Labor – was kann er über Personen und Uhrzeiten im Fall verraten?'] }
      ]
    },
    {
      id: 'e3-ende', type: 'ende', titel: 'Wegweiser L3 überprüft!', abzeichen: 'e3-fertig', abzeichenOhneTipp: 'e3-ohne-tipp',
      text: '<p>Ihr habt den falschen DHCP-Server entlarvt, den Umweg der Pakete mit tracert und Wireshark nachgewiesen und den Zeitpunkt eingegrenzt. Die nächste Spur führt nach <b>L4</b>.</p>'
    }
  ];
})();
