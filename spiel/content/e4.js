/* Einsatz 4 – L4: Offene Türen. IDs NIE ändern (stecken in Spielständen). */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e4');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;
  const N = OSI.netz, H = N.hosts;

  // ------------------------------------------------------------ PC-VERSAND-02 (Frau Lindner) – Konfiguration noch vom Fremdgerät (wird auch in E5 genutzt)
  N.versand2 = {
    ipconfig: `
Windows-IP-Konfiguration


Ethernet-Adapter Ethernet:

   Verbindungsspezifisches DNS-Suffix: fo-logistik.intern
   Verbindungslokale IPv6-Adresse  . : fe80::4c1a:9e2f:7d31:b20c%12
   IPv4-Adresse  . . . . . . . . . . : 192.168.50.140
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.50.66
`,
    ipconfigAll: (tag, von = '06:48:12', bis = '07:48:12') => `
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
   Lease erhalten. . . . . . . . . . : ${tag} ${von}
   Lease läuft ab. . . . . . . . . . : ${tag} ${bis}
   Standardgateway . . . . . . . . . : 192.168.50.66
   DHCP-Server . . . . . . . . . . . : 192.168.50.66
   DNS-Server  . . . . . . . . . . . : 192.168.50.66
`
  };

  const netstatN = `
Aktive Verbindungen

  Proto  Lokale Adresse         Remoteadresse          Status
  TCP    192.168.50.140:49702   192.168.50.12:445      HERGESTELLT
  TCP    192.168.50.140:50644   203.0.113.80:443       HERGESTELLT
  TCP    192.168.50.140:50811   192.168.50.66:80       HERGESTELLT
`;
  const netstatAN = `
Aktive Verbindungen

  Proto  Lokale Adresse         Remoteadresse          Status
  TCP    0.0.0.0:135            0.0.0.0:0              ABHÖREN
  TCP    0.0.0.0:445            0.0.0.0:0              ABHÖREN
  TCP    0.0.0.0:5040           0.0.0.0:0              ABHÖREN
  TCP    0.0.0.0:49664          0.0.0.0:0              ABHÖREN
  TCP    0.0.0.0:49665          0.0.0.0:0              ABHÖREN
  TCP    192.168.50.140:139     0.0.0.0:0              ABHÖREN
  TCP    192.168.50.140:49702   192.168.50.12:445      HERGESTELLT
  TCP    192.168.50.140:50644   203.0.113.80:443       HERGESTELLT
  TCP    192.168.50.140:50811   192.168.50.66:80       HERGESTELLT
  UDP    0.0.0.0:5353           *:*
  UDP    0.0.0.0:5355           *:*
  UDP    192.168.50.140:137     *:*
  UDP    192.168.50.140:138     *:*
`;
  const pingAntw = { '192.168.50.1': { ttl: 255 }, '192.168.50.10': { ttl: 128 }, '192.168.50.12': { ttl: 128 }, '192.168.50.20': { ttl: 64 }, '192.168.50.66': { ttl: 64 }, '192.168.50.140': { ttl: 128 }, '127.0.0.1': { ttl: 128 }, '203.0.113.80': { ttl: 50, ms: 18 } };
  const terminalVersand = {
    titel: 'Eingabeaufforderung – PC-VERSAND-02 (Versand)',
    prompt: 'C:\\Users\\m.lindner>',
    befehle: [
      { cmd: 'netstat -n', out: netstatN },
      { cmd: 'netstat -an', alias: ['netstat -a -n', 'netstat -na'], out: netstatAN },
      { cmd: 'ipconfig', out: N.versand2.ipconfig },
      { cmd: 'ipconfig /all', alias: ['ipconfig -all'], out: N.versand2.ipconfigAll('Donnerstag, 24. September 2026') },
      { cmd: 'hostname', out: 'PC-VERSAND-02\n' },
      { tab: 'ping ', re: /^ping (\S+)$/, out: m => N.ping(m[1], pingAntw, H.vers2.ip) }
    ],
    spick: [
      ['netstat -n', 'bestehende TCP-Verbindungen: eigener Socket ↔ Socket der Gegenseite'],
      ['netstat -an', 'zusätzlich alle Ports, auf denen der PC selbst lauscht (ABHÖREN)'],
      ['ipconfig', 'IP-Adresse, Subnetzmaske, Standardgateway'],
      ['ipconfig /all', 'zusätzlich MAC-Adresse, DHCP-Server, DNS-Server, Lease'],
      ['ping <IP-Adresse>', 'prüft, ob unter einer IP-Adresse jemand antwortet'],
      ['hostname', 'Name des eigenen PCs']
    ]
  };

  // ------------------------------------------------------------ Mitschnitt 1: Kalles Portscan (Do 07:14, Laptop an Switch-Port 22, IP .99)
  const K = H.kalle, P = H.pi, R = H.router, T = H.tunnel, V1 = H.vers1, V2 = H.vers2, F = H.file, W = H.webmail;
  const k2p = (t, sp, dp, flags) => ({ t, typ: 'tcp', src: K.mac, dst: P.mac, sip: K.ip, dip: P.ip, sp, dp, flags, ttl: 64 });
  const p2k = (t, sp, dp, flags) => ({ t, typ: 'tcp', src: P.mac, dst: K.mac, sip: P.ip, dip: K.ip, sp, dp, flags, ttl: 64 });
  const scan = N.mitschnitt([
    k2p(0.000000, 41822, 22, 'SYN'), k2p(0.000105, 41824, 80, 'SYN'), k2p(0.000190, 41826, 443, 'SYN'), k2p(0.000268, 41828, 3389, 'SYN'),
    p2k(0.000702, 22, 41822, 'SYN, ACK'), p2k(0.000731, 80, 41824, 'SYN, ACK'), p2k(0.000804, 443, 41826, 'RST, ACK'), p2k(0.000866, 3389, 41828, 'RST, ACK'),
    k2p(0.000901, 41822, 22, 'ACK'), k2p(0.000925, 41824, 80, 'ACK'), k2p(0.001240, 41822, 22, 'RST, ACK'), k2p(0.001262, 41824, 80, 'RST, ACK'),
    { t: 1.002113, typ: 'dns', src: K.mac, dst: P.mac, sip: K.ip, dip: P.ip, sp: 52211, id: '0x51c7', name: 'srv-file.fo-logistik.intern', ttl: 64 },
    { t: 1.002790, typ: 'dns', src: P.mac, dst: K.mac, sip: P.ip, dip: K.ip, sp: 52211, id: '0x51c7', name: 'srv-file.fo-logistik.intern', antwort: F.ip, ttl: 64 },
    { t: 1.503417, typ: 'udp', src: K.mac, dst: P.mac, sip: K.ip, dip: P.ip, sp: 52213, dp: 9999, ttl: 64 },
    { t: 1.503902, typ: 'icmp', icmp: 3, src: P.mac, dst: K.mac, sip: P.ip, dip: K.ip, usp: 52213, udp: 9999, ttl: 64 }
  ], 'Sep 24, 2026 07:14:31 Mitteleuropäische Sommerzeit');

  // ------------------------------------------------------------ Mitschnitt 2: zehn Sekunden Alltag am Server-Switch (Do 07:20)
  const tun = (t, vomPi, len) => vomPi
    ? { t, typ: 'ssh', client: true, src: P.mac, dst: R.mac, sip: P.ip, dip: T.ip, sp: 48213, dp: 22, len, ttl: 64 }
    : { t, typ: 'ssh', src: R.mac, dst: P.mac, sip: T.ip, dip: P.ip, sp: 22, dp: 48213, len, ttl: 52 };
  const alltag = N.mitschnitt([
    tun(0.000000, true, 36), tun(0.031448, false, 36),
    { t: 0.802117, typ: 'dns', src: V2.mac, dst: P.mac, sip: V2.ip, dip: P.ip, sp: 60114, id: '0x2a90', name: 'srv-file.fo-logistik.intern' },
    { t: 0.802833, typ: 'dns', src: P.mac, dst: V2.mac, sip: P.ip, dip: V2.ip, sp: 60114, id: '0x2a90', name: 'srv-file.fo-logistik.intern', antwort: F.ip, ttl: 64 },
    { t: 1.904410, typ: 'tcp', src: V1.mac, dst: F.mac, sip: V1.ip, dip: F.ip, sp: 49711, dp: 445, len: 120 },
    { t: 1.905102, typ: 'tcp', src: F.mac, dst: V1.mac, sip: F.ip, dip: V1.ip, sp: 445, dp: 49711, len: 104 },
    { t: 3.511873, typ: 'tls', src: V1.mac, dst: R.mac, sip: V1.ip, dip: W.ip, sp: 50388, dp: 443, len: 517 },
    { t: 3.530265, typ: 'tls', src: R.mac, dst: V1.mac, sip: W.ip, dip: V1.ip, sp: 443, dp: 50388, len: 1250, ttl: 50 },
    tun(5.000214, true, 36), tun(5.031907, false, 36),
    tun(10.000187, true, 36), tun(10.032011, false, 36)
  ], 'Sep 24, 2026 07:20:05 Mitteleuropäische Sommerzeit');

  const filterSpick = `<details class="small" style="margin:6px 0"><summary style="cursor:pointer">📋 Filter-Spickzettel aufklappen</summary>
    <table class="t small"><tr><th>Filter</th><th>zeigt …</th></tr>
      <tr><td><code>tcp</code>, <code>udp</code>, <code>dns</code>, <code>icmp</code></td><td>nur Frames mit diesem Protokoll</td></tr>
      <tr><td><code>tcp.port == 22</code> (auch <code>tcp.srcport</code>, <code>tcp.dstport</code>, <code>udp.port</code>)</td><td>Quell- oder Ziel-Port ist 22</td></tr>
      <tr><td><code>tcp.flags.syn == 1</code> · <code>tcp.flags.ack == 1</code> · <code>tcp.flags.reset == 1</code> · <code>tcp.flags.fin == 1</code></td><td>Frames, in denen das Flag SYN / ACK / RST / FIN gesetzt ist</td></tr>
      <tr><td><code>ip.src == …</code> / <code>ip.dst == …</code> / <code>ip.addr == …</code></td><td>Quell-IP / Ziel-IP / eins von beiden</td></tr>
      <tr><td><code>&amp;&amp;</code> · <code>||</code> · <code>!</code></td><td>und · oder · nicht</td></tr></table></details>`;

  const zutritt = `<div class="evidence"><h4>🔐 Zur Erinnerung: Zutrittsprotokoll Serverraum und Besucherbuch</h4>
      <table><tr><th>Tag</th><th>Uhrzeit</th><th>Person</th></tr>
        <tr><td>Fr</td><td>14:10</td><td>Y. Demir (Hausmeister) mit M. Seidel (Drucker-Techniker, Besuch 13:55–15:20)</td></tr>
        <tr><td>Mo</td><td>08:03</td><td>L. Berger (Azubi)</td></tr>
        <tr><td>Mo</td><td>16:40</td><td>T. Brandt (IT-Leiter)</td></tr>
        <tr><td>Di</td><td>07:12</td><td>T. Brandt mit Einheit 7</td></tr></table></div>`;

  E.steps = [
    {
      id: 'e4-intro', type: 'story', titel: 'Anklopfen erlaubt', bild: 'e4_scan.jpg',
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · Serverraum · Donnerstag, 06:50 Uhr' },
        { wer: 'kalle', text: 'Guten Morgen. Ich habe meinen Laptop an Switch-Port 22 gesteckt – der war laut Patchplan frei – und mir die feste IP-Adresse 192.168.50.99 gegeben. Und das hier ist das Wichtigste des Tages:' },
        { wer: 'brandt', text: '<i>(reicht ein Blatt Papier)</i> Mein schriftlicher Auftrag. Die Einheit 7 darf das Gerät mit der 192.168.50.66 auf offene Ports prüfen. Nur dieses Gerät, nur heute.' },
        { wer: 'direktorin', text: `<i>(über Funk)</i> Wir wissen, <i>wo</i> der Pi hängt, <i>wer</i> er zu sein vorgibt und <i>welchen Weg</i> er den Paketen zeigt. Heute geht es um ${L(4)}: <b>Welche Dienste lauschen auf diesem Gerät – und mit wem spricht es?</b>` }
      ]
    },

    {
      id: 'e4-ports', type: 'lesson', tag: 'TRAINING 1 · PORTS UND SOCKETS', titel: 'Welche Tür, bitte?',
      html: `
        <p>Die IP-Adresse (${L(3)}) bringt ein Paket zum richtigen <b>Gerät</b>. Auf einem Server laufen aber viele Programme gleichzeitig – Webserver, Mailserver, Dateifreigabe. Welches Programm die Daten bekommt, entscheidet ${L(4)} mit der <b>Portnummer</b> (0 bis 65535). In der Spedition ist das das Etikett auf dem Karton: „an Abteilung Lohn“.</p>
        <h3>Drei Portbereiche</h3>
        <table class="t">
          <tr><th>Bereich</th><th>Name</th><th>wofür?</th></tr>
          <tr><td>0 – 1023</td><td><b>bekannte Ports</b> (<i>well-known ports</i>)</td><td>fest vergeben an verbreitete Dienste wie HTTP oder DNS</td></tr>
          <tr><td>1024 – 49151</td><td><b>registrierte Ports</b> (<i>registered ports</i>)</td><td>auf Antrag für bestimmte Programme eingetragen, z. B. 3389 für den Windows-Remotedesktop</td></tr>
          <tr><td>49152 – 65535</td><td><b>dynamische Ports</b> (<i>dynamic</i> oder <i>private ports</i>)</td><td>nicht vergeben – für kurzlebige Verbindungen der Clients gedacht</td></tr>
        </table>
        <p>Die Zahlen legt eine Organisation namens IANA fest. Streng eingehalten wird das aber nur bei den bekannten Ports: Registrierte Ports sind eher Empfehlungen, und die Grenze zu den dynamischen Ports nehmen viele Systeme nicht genau (dazu gleich mehr).</p>
        <h3>Feste Ports für Dienste</h3>
        <p>Ein <b>Dienst</b> (Server-Programm) <b>lauscht</b> auf einem festen Port. Nur so wissen die Clients, wo sie anklopfen müssen. Ein <b>Auszug</b> der Ports, die ihr kennen solltet – es gibt Hunderte weitere:</p>
        <table class="t">
          <tr><th>Port</th><th>Protokoll</th><th>Dienst</th></tr>
          <tr><td>22</td><td>TCP</td><td><b>SSH</b> – ein Gerät per Kommandozeile aus der Ferne steuern (verschlüsselt)</td></tr>
          <tr><td>53</td><td>UDP (selten TCP)</td><td><b>DNS</b> – Namen in IP-Adressen übersetzen</td></tr>
          <tr><td>67 / 68</td><td>UDP</td><td><b>DHCP</b> – Server / Client</td></tr>
          <tr><td>80</td><td>TCP</td><td><b>HTTP</b> – Webseiten, <b>unverschlüsselt</b></td></tr>
          <tr><td>443</td><td>TCP</td><td><b>HTTPS</b> – Webseiten, <b>verschlüsselt</b></td></tr>
          <tr><td>445</td><td>TCP</td><td><b>SMB</b> – Datei- und Druckerfreigaben (Netzlaufwerke)</td></tr>
          <tr><td>3389</td><td>TCP</td><td><b>RDP</b> – Windows-Remotedesktop</td></tr>
        </table>
        <h3>Zufällige Ports für Clients</h3>
        <p>Der <b>Client</b> (z. B. der Browser) braucht auch einen Port, damit die Antwort bei ihm ankommt. Den wählt das Betriebssystem <b>zufällig</b> für jede neue Verbindung. Öffnet ihr drei Browser-Tabs, bekommt jeder Tab seinen eigenen Quell-Port – so landet jede Antwort im richtigen Tab.</p>
        <p>Gedacht ist dafür der dynamische Bereich ab 49152 – und Windows hält sich auch daran. <b>Linux</b> dagegen nimmt standardmäßig Ports von 32768 bis 60999, also auch aus dem registrierten Bereich, und manche Programme wählen ihre Ports ganz nach eigenen Regeln. Verlasst euch also nicht auf die Grenze 49152. Die Faustregel für Mitschnitte lautet: <b>Die Seite mit dem bekannten Dienst-Port ist der Server, die Seite mit der zufällig wirkenden, meist hohen Nummer der Client.</b></p>
        <h3>Socket = IP-Adresse + Port</h3>
        <p>Die Kombination aus IP-Adresse und Port heißt <b>Socket</b>, geschrieben mit Doppelpunkt: <code>192.168.50.20:443</code>. Eine TCP-Verbindung ist durch <b>zwei Sockets</b> eindeutig bestimmt:</p>
        <div class="ws" style="padding:10px 14px">Client 192.168.50.123:<b>50722</b>  ⟷  Server 192.168.50.20:<b>443</b></div>
        <h3>TCP oder UDP?</h3>
        <table class="t">
          <tr><th></th><th>TCP</th><th>UDP</th></tr>
          <tr><td>Verbindung</td><td>wird vorher <b>aufgebaut</b> (verbindungsorientiert)</td><td>keine – es wird <b>einfach losgeschickt</b> (verbindungslos)</td></tr>
          <tr><td>Zustellung</td><td>wird bestätigt, Verlorenes wird neu gesendet, Reihenfolge stimmt</td><td>keine Bestätigung, keine Wiederholung</td></tr>
          <tr><td>typisch für</td><td>Webseiten, Dateien, SSH</td><td>DNS, DHCP, Telefonie, Videostreams</td></tr>
        </table>
        <div class="merk"><b>Achtung, zwei Arten von „Port“:</b> Der <b>Switch-Port</b> ist eine Buchse, in der ein Kabel steckt (${L(1)}). Der <b>TCP/UDP-Port</b> ist eine Nummer im Header (${L(4)}). „Port 23“ am Switch hat mit „Port 23“ im TCP-Header nichts zu tun.</div>`,
      kalle: 'Die IP-Adresse ist die Hausnummer, der Port ist die Wohnungstür. Und wer an Tür 22 klingelt, will nicht zum Pizza-Service.'
    },
    {
      id: 'e4-ports-quiz', type: 'quiz', titel: 'Tür-Check',
      fragen: [
        { id: 'e4-q-https', eingabe: 'zahl', frage: 'Auf welchem Port lauscht ein Webserver für <b>HTTPS</b>?', platzhalter: 'Portnummer', richtig: '443', erklaerung: '443 – HTTPS. Unverschlüsseltes HTTP läuft auf Port 80.', hinweise: ['Schaut in die Tabelle der Lektion.'] },
        { id: 'e4-q-dienst', frage: 'Im Socket <code>192.168.50.12:445</code> – wofür steht die <b>445</b>?', optionen: ['Für den Dienst auf dem Gerät', 'Für das Gerät im Netz', 'Für das Netz, in dem es liegt', 'Für den Switch-Port des Geräts'], richtig: 0, erklaerung: 'Vor dem Doppelpunkt steht die IP-Adresse (welches Gerät), dahinter der Port (welcher Dienst) – hier SMB, die Dateifreigabe von SRV-FILE.', hinweise: ['Socket = IP-Adresse + Port. Was davon wählt das Programm aus?'] },
        { id: 'e4-q-bereich', frage: 'Port <b>3389</b> (Windows-Remotedesktop) liegt in welchem Portbereich?', optionen: ['Registrierte Ports (registered ports)', 'Bekannte Ports (well-known ports)', 'Dynamische Ports (dynamic ports)', 'In keinem – er ist frei wählbar'], richtig: 0, erklaerung: '3389 liegt zwischen 1024 und 49151 – im Bereich der registrierten Ports. Bekannte Ports gehen nur bis 1023.', hinweise: ['Schaut in die Tabelle „Drei Portbereiche“.'] },
        { id: 'e4-q-quellport', frage: 'Warum wählt der Browser als Quell-Port eine <b>zufällige hohe</b> Nummer?', optionen: ['Damit jede Antwort beim richtigen Tab ankommt.', 'Damit der Server den Browser nicht findet.', 'Weil niedrige Ports nur für UDP gedacht sind.', 'Weil der Router hohe Ports schneller leitet.'], richtig: 0, erklaerung: 'Jede Verbindung bekommt ihren eigenen Quell-Port. Kommt die Antwort des Servers zurück, weiß das Betriebssystem an der Portnummer, zu welchem Tab (welcher Verbindung) sie gehört.', hinweise: ['Denkt an drei offene Browser-Tabs zur selben Webseite.'] },
        { id: 'e4-q-udp', frage: 'Welches Protokoll auf L4 nutzt ein PC normalerweise für eine <b>DNS-Anfrage</b>?', optionen: ['UDP', 'TCP', 'IP', 'HTTP'], richtig: 0, erklaerung: 'DNS-Anfragen sind kurz – eine Frage, eine Antwort. Dafür lohnt sich kein Verbindungsaufbau: UDP, Port 53.', hinweise: ['Die Tabelle der Lektion ordnet DNS einem der beiden Transportprotokolle zu.'] },
        { id: 'e4-q-switchport', layer: true, frage: 'Kalle sagt: „Mein Laptop steckt in <b>Switch-Port 22</b>.“ Auf welcher Schicht ist dieser „Port“ zu Hause?', richtig: 1, erklaerung: 'Ein Switch-Port ist eine Buchse für ein Kabel – L1. Mit TCP-Port 22 (SSH) hat er nichts zu tun.', hinweise: ['Lest den Merkkasten am Ende der Lektion.'] }
      ]
    },

    {
      id: 'e4-terminal', type: 'quiz', titel: 'Wer spricht mit wem?',
      intro: `<p>Ihr sitzt wieder an <b>PC-VERSAND-02</b> von Frau Lindner. Noch hat niemand etwas an seiner Konfiguration geändert – wir beobachten. Herr Brandt: „Frau Lindner hat gerade drei Dinge offen: das <b>Netzlaufwerk</b> auf SRV-FILE, ihr <b>Webmail</b> bei einem Anbieter im Internet und das <b>Lohnportal</b>. Unser echtes Lohnportal läuft übrigens <b>ausschließlich über HTTPS</b>.“</p>
        <p>Neu im Spickzettel: <code>netstat</code> zeigt die <b>Verbindungen</b> des PCs – für jede Verbindung den eigenen Socket (<i>Lokale Adresse</i>) und den der Gegenseite (<i>Remoteadresse</i>).</p>`,
      terminal: terminalVersand,
      fragen: [
        { id: 'e4-t-lohn', eingabe: 'text', frage: 'Welcher <b>Remote-Socket</b> gehört zum Lohnportal? Schreibt ihn mit Doppelpunkt, z. B. <code>1.2.3.4:56</code>.', platzhalter: 'IP-Adresse:Port', richtig: '192.168.50.66:80', erklaerung: '192.168.50.66:80. Das Netzlaufwerk ist die .12 (Port 445 = SMB), das Webmail liegt im Internet (203.0.113.80). Bleibt die Webseite im Firmennetz – und die liegt nicht auf dem Lohnserver .20, sondern auf dem Pi!', hinweise: ['Tippt <code>netstat -n</code>.', 'Zwei der drei Verbindungen könnt ihr zuordnen: Welche geht zu SRV-FILE (.12), welche ins Internet?'] },
        { id: 'e4-t-port80', frage: 'Diese Verbindung läuft über <b>Port 80</b>. Was bedeutet das?', optionen: ['Sie ist unverschlüsselt – kein echtes HTTPS.', 'Sie ist verschlüsselt – wie beim echten Portal.', 'Sie läuft über UDP – deshalb ist sie so schnell.', 'Sie geht an die Dateifreigabe des Pi.'], richtig: 0, erklaerung: 'Port 80 = HTTP, unverschlüsselt. Das echte Portal läuft nur über HTTPS (443). Frau Lindner redet also im Klartext mit dem Pi. Warum ihr Browser überhaupt bei der .66 landet? Das klären wir in Einsatz 5.', hinweise: ['Welcher Dienst gehört laut Lektion zu Port 80?'] },
        { id: 'e4-t-quelle', eingabe: 'zahl', frage: 'Welchen <b>lokalen Port</b> (Quell-Port) hat der Browser für diese Verbindung gewählt?', platzhalter: 'Portnummer', richtig: '50811', erklaerung: '50811 – eine zufällige hohe Nummer, wie es sich für einen Client gehört.', hinweise: ['Die lokale Adresse steht in der Zeile ganz links, hinter dem Doppelpunkt.'] },
        { id: 'e4-t-dns', frage: 'Der PC löst ständig Namen per DNS auf – trotzdem zeigt <code>netstat -n</code> keine einzige DNS-Verbindung. Warum?', optionen: ['DNS nutzt UDP – da gibt es keine Verbindung.', 'DNS nutzt TCP – das blendet netstat aus.', 'DNS läuft nur beim Hochfahren des PCs.', 'DNS-Verbindungen sieht nur der Router.'], richtig: 0, erklaerung: 'UDP ist verbindungslos: Frage raus, Antwort zurück, fertig. <code>netstat -n</code> listet aber nur <b>Verbindungen</b> – also TCP.', hinweise: ['Was unterscheidet UDP von TCP laut Lektion?'] },
        { id: 'e4-t-lauscht', eingabe: 'zahl', frage: 'Mit <code>netstat -an</code> seht ihr auch, auf welchen Ports der PC <b>selbst</b> lauscht (Status ABHÖREN). Auf welchem Port lauscht er für <b>Datei- und Druckerfreigaben</b>?', platzhalter: 'Portnummer', richtig: '445', erklaerung: '445 (SMB). Auch ein normaler PC ist also ein kleiner Server – jeder Port mit ABHÖREN ist eine Tür, an der man anklopfen kann.', hinweise: ['Welche Portnummer gehört laut Tabelle zu SMB?'] }
      ]
    },

    {
      id: 'e4-handshake', type: 'lesson', tag: 'TRAINING 2 · DER 3-WEGE-HANDSHAKE', titel: 'Hallo? – Hallo, ich höre! – Gut, dann los.',
      html: `
        <p>Bevor bei TCP auch nur ein Byte Nutzdaten fließt, <b>bauen Client und Server eine Verbindung auf</b>. Das ist wie ein Telefonat: Niemand redet los, bevor klar ist, dass jemand abgenommen hat. Dafür gibt es im TCP-Header <b>Flags</b> – kleine Schalter, die an oder aus sind:</p>
        <table class="t">
          <tr><th>Flag</th><th>Bedeutung</th></tr>
          <tr><td><b>SYN</b></td><td>„Ich möchte eine Verbindung aufbauen.“ (synchronize)</td></tr>
          <tr><td><b>ACK</b></td><td>„Ich habe dein letztes Segment erhalten.“ (acknowledge)</td></tr>
          <tr><td><b>RST</b></td><td>„Abbruch! Hier gibt es keine Verbindung.“ (reset)</td></tr>
          <tr><td>PSH</td><td>„Hier kommen Daten, bitte gleich weitergeben.“ (push)</td></tr>
          <tr><td><b>FIN</b></td><td>„Ich bin fertig, wir können auflegen.“ (finish)</td></tr>
        </table>
        <h3>Der Aufbau in drei Schritten</h3>
        <table class="t">
          <tr><th>Schritt</th><th>Richtung</th><th>Flags</th><th>am Telefon</th></tr>
          <tr><td>1</td><td>Client → Server</td><td><b>SYN</b></td><td>„Hallo, ist da jemand?“</td></tr>
          <tr><td>2</td><td>Server → Client</td><td><b>SYN, ACK</b></td><td>„Ja, ich höre dich – hörst du mich auch?“</td></tr>
          <tr><td>3</td><td>Client → Server</td><td><b>ACK</b></td><td>„Ja, ich höre dich. Dann los!“</td></tr>
        </table>
        <p>Erst danach fließen Daten (in Wireshark meist mit den Flags <b>PSH, ACK</b>). Jede Seite hat damit einmal „gefragt“ und einmal „bestätigt“ – nun wissen beide, dass der Weg in <b>beide Richtungen</b> funktioniert.</p>
        <h3>Ordentlich auflegen</h3>
        <p>Ist alles gesagt, wird die Verbindung <b>regulär mit FIN</b> beendet: Jede Seite meldet mit FIN „Ich bin fertig“, die andere bestätigt mit ACK. Die Einzelheiten dieses Abbaus braucht ihr für diesen Einsatz nicht. <b>RST</b> ist dagegen kein höfliches Auflegen, sondern ein <b>Abbruch</b>.</p>
        <h3>Und wenn niemand abhebt?</h3>
        <p>Lauscht auf dem TCP-Ziel-Port <b>kein Dienst</b>, antwortet das Betriebssystem des Servers auf das SYN mit <b>RST, ACK</b>: „Kein Anschluss unter dieser Nummer.“ Daran erkennt man einen <b>geschlossenen Port</b>. Ein <b>offener Port</b> antwortet mit <b>SYN, ACK</b>.</p>
        <h3>Und UDP?</h3>
        <p>UDP ist verbindungslos – es gibt <b>keinen Handshake</b>. Der Client schickt seine Frage einfach los und hofft auf eine Antwort. Das ist schneller, aber niemand bestätigt, dass die Gegenseite überhaupt zuhört.</p>
        <p class="small muted">In der Info-Spalte von Wireshark stehen bei TCP außerdem Angaben wie <i>Seq</i>, <i>Ack</i> und <i>Win</i>. Die gehören zu weiteren Feldern des TCP-Headers, die ihr später kennenlernt – für diesen Einsatz braucht ihr nur die Flags.</p>`,
      kalle: 'TCP ist das höfliche Telefonat mit „Hallo?“ und „Ja, hier!“. UDP ist die Sprachnachricht: Du quatschst einfach drauflos und weißt nie, ob sie jemand abhört.'
    },
    {
      id: 'e4-hs-sort', type: 'sort', titel: 'Verbindungsaufbau in der richtigen Reihenfolge', punkte: 8, spalten: true,
      intro: '<p>Frau Lindners Browser baut eine TCP-Verbindung zu einem Webserver auf und schickt dann seine Anfrage. Bringt die vier Segmente in die richtige Reihenfolge.</p>',
      bins: [
        { id: 's1', label: '1. Segment' }, { id: 's2', label: '2. Segment' }, { id: 's3', label: '3. Segment' }, { id: 's4', label: '4. Segment' }
      ],
      items: [
        { id: 'e4-hs-ack', text: 'ACK (Browser → Server)', ziel: 's3', erklaerung: 'Der Browser bestätigt die Antwort des Servers – damit steht die Verbindung.', hinweis: 'Der Browser bestätigt etwas, das der Server geschickt hat.' },
        { id: 'e4-hs-daten', text: 'Anfrage nach der Webseite (PSH, ACK)', ziel: 's4', erklaerung: 'Erst nach dem Handshake fließen Daten.', hinweis: 'Daten fließen erst, wenn die Verbindung steht.' },
        { id: 'e4-hs-synack', text: 'SYN, ACK (Server → Browser)', ziel: 's2', erklaerung: 'Der Server nimmt ab und bestätigt: „Ich höre dich – hörst du mich?“', hinweis: 'Der Server antwortet auf eine Anfrage.' },
        { id: 'e4-hs-syn', text: 'SYN (Browser → Server)', ziel: 's1', erklaerung: 'Der Client fängt an: „Hallo, ist da jemand?“', hinweis: 'Wer will etwas von wem?' }
      ]
    },
    {
      id: 'e4-hs-quiz', type: 'quiz', titel: 'Handshake-Check',
      fragen: [
        { id: 'e4-h-erster', frage: 'Wer schickt beim Verbindungsaufbau das erste <b>SYN</b>?', optionen: ['Der Client, der etwas vom Dienst will', 'Der Server, auf dem der Dienst lauscht', 'Der Router zwischen den beiden Netzen', 'Der Switch, an dem beide Geräte hängen'], richtig: 0, erklaerung: 'Der Client ruft an, der Server nimmt ab. Router und Switch leiten die Segmente nur weiter – sie lesen den TCP-Header gar nicht.', hinweise: ['Wer „ruft an“ – das Programm, das etwas will, oder der Dienst, der wartet?'] },
        { id: 'e4-h-zu', frage: 'Ein Client schickt ein SYN an einen TCP-Port, auf dem <b>kein Dienst</b> lauscht. Was kommt zurück?', optionen: ['Ein Segment mit RST, ACK', 'Ein Segment mit SYN, ACK', 'Ein Segment nur mit ACK', 'Ein Segment mit PSH, ACK'], richtig: 0, erklaerung: 'RST heißt „Abbruch – kein Anschluss unter dieser Nummer“. So erkennt man einen geschlossenen Port.', hinweise: ['Welches Flag bedeutet „Abbruch“?'] },
        { id: 'e4-h-offen', frage: 'Woran erkennt ihr in einem Mitschnitt, dass ein TCP-Port <b>offen</b> ist?', optionen: ['Auf das SYN folgt ein SYN, ACK.', 'Auf das SYN folgt ein RST, ACK.', 'Auf das SYN folgt gar nichts.', 'Auf das SYN folgt ein zweites SYN.'], richtig: 0, erklaerung: 'SYN, ACK heißt: Hier lauscht ein Dienst und nimmt die Verbindung an.', hinweise: ['Was antwortet ein Server, der „abhebt“?'] },
        { id: 'e4-h-udp', frage: 'Warum gibt es bei UDP <b>keinen</b> Handshake?', optionen: ['UDP ist verbindungslos.', 'UDP ist verschlüsselt.', 'UDP läuft nur im eigenen Netz.', 'UDP nutzt den Handshake von IP.'], richtig: 0, erklaerung: 'Bei UDP wird nichts aufgebaut und nichts bestätigt – das Datagramm wird einfach losgeschickt.', hinweise: ['Schaut in die Tabelle TCP oder UDP aus der ersten Lektion.'] }
      ]
    },

    {
      id: 'e4-scan-info', type: 'lesson', tag: 'TRAINING 3 · PORTSCAN MIT AUFTRAG', titel: 'An jede Tür klopfen',
      html: `
        <p>Ein <b>Portscanner</b> ist ein Programm, das bei einem Gerät der Reihe nach an viele Ports „anklopft“ und notiert, was zurückkommt. So erfährt man, welche Dienste auf dem Gerät lauschen – für die IT-Abteilung eine wichtige Bestandsaufnahme, für die Einheit 7 heute ein Beweismittel.</p>
        <h3>TCP-Ports prüfen</h3>
        <table class="t">
          <tr><th>Der Scanner schickt …</th><th>zurück kommt …</th><th>Ergebnis</th></tr>
          <tr><td rowspan="3">SYN</td><td>SYN, ACK</td><td><b>offen</b> – der Scanner bricht danach sofort ab (RST)</td></tr>
          <tr><td>RST, ACK</td><td><b>geschlossen</b></td></tr>
          <tr><td>gar nichts</td><td><b>gefiltert</b> – etwas blockiert die Anfrage unterwegs</td></tr>
        </table>
        <h3>UDP-Ports prüfen</h3>
        <p>Bei UDP gibt es kein „Hallo?“, auf das der Dienst antworten müsste. Der Scanner schickt deshalb eine <b>echte Anfrage</b>, die zum erwarteten Dienst passt – an Port 53 zum Beispiel eine DNS-Anfrage:</p>
        <table class="t">
          <tr><th>zurück kommt …</th><th>Ergebnis</th></tr>
          <tr><td>eine Antwort des Dienstes</td><td><b>offen</b></td></tr>
          <tr><td>die Fehlermeldung „Port nicht erreichbar“ (ICMP, <i>Destination unreachable – Port unreachable</i>)</td><td><b>geschlossen</b></td></tr>
          <tr><td>gar nichts</td><td><b>unklar</b> – offen oder blockiert? Scanner schreiben dann <code>open|filtered</code></td></tr>
        </table>
        <div class="merk"><b>🔒 Akte „Firewall“ – gesperrt.</b> Wer oder was Anfragen unterwegs blockiert, erfahrt ihr später.</div>
        <div class="merk"><b>⚠ Nur mit Auftrag!</b> Portscans in Netzen, für die man keinen ausdrücklichen Auftrag hat, verstoßen gegen die IT-Richtlinien von Schule und Betrieb und können strafbar sein. Genau damit hat sich Leon Berger vor zwei Wochen Ärger eingehandelt. Kalle scannt heute <b>ein</b> Gerät – mit schriftlichem Auftrag des IT-Leiters.</div>`,
      kalle: 'Portscan ohne Auftrag ist wie nachts an allen Wohnungstüren im Haus zu rütteln, um zu sehen, welche offen ist. Mit Auftrag vom Hausverwalter heißt es Sicherheitsbegehung.'
    },
    {
      id: 'e4-wireshark', type: 'quiz', titel: 'Kalles Scan im Mitschnitt',
      intro: `<p>Kalles Laptop (<b>192.168.50.99</b>) prüft den Raspberry Pi (<b>192.168.50.66</b>): vier TCP-Ports, danach zwei UDP-Ports. Filtert, klickt Frames an, klappt die Details auf – die Flags stehen in der Info-Spalte und in der TCP-Zeile.</p>${filterSpick}`,
      wireshark: { datei: 'kalle-laptop_do_0714.pcapng', pakete: scan },
      fragen: [
        { id: 'e4-ws-offen', multi: true, frage: 'Welche TCP-Ports auf dem Pi sind <b>offen</b>?', optionen: ['22', '80', '443', '3389'], fest: true, richtig: [0, 1], erklaerung: 'Port 22 (Frame 5) und Port 80 (Frame 6) antworten mit SYN, ACK – dort lauschen Dienste. 443 und 3389 antworten mit RST, ACK.', hinweise: ['Sucht die Antworten des Pi (Quelle 192.168.50.66) und schaut auf die Flags.'] },
        { id: 'e4-ws-zu443', meldung: true, frage: 'Markiert den Frame, der beweist, dass <b>Port 443</b> auf dem Pi <b>geschlossen</b> ist, und meldet ihn.', richtig: 7, erklaerung: 'Frame 7: 443 → 41826 [RST, ACK] – „Kein Anschluss unter dieser Nummer.“ Auf dem Pi lauscht also kein HTTPS-Dienst.', falsch: { 3: 'Frame 3 ist Kalles Anfrage (SYN). Gesucht ist die Antwort des Pi.', 8: 'Frame 8 gehört zu Port 3389, nicht zu 443.' }, hinweise: ['Gesucht ist eine Antwort des Pi, die von Port 443 kommt.', 'Filtert mit <code>tcp.port == 443</code>.'] },
        { id: 'e4-ws-synack', eingabe: 'filter', frage: 'Schreibt einen Filter, der nur die Frames zeigt, in denen <b>SYN und ACK</b> gleichzeitig gesetzt sind.', richtig: 'tcp.flags.syn == 1 && tcp.flags.ack == 1', erklaerung: 'Übrig bleiben Frame 5 und 6 – die Antworten der offenen Ports. Mit genau so einem Filter findet man in großen Mitschnitten schnell alle offenen Türen.', hinweise: ['Im Spickzettel stehen die Filter für einzelne Flags.', 'Zwei Bedingungen verbindet ihr mit <code>&amp;&amp;</code>: <code>tcp.flags.syn == 1 &amp;&amp; tcp.flags.ack == 1</code>'] },
        { id: 'e4-ws-f9', frage: 'In Frame 9 schickt Kalles Laptop ein <b>ACK</b> an Port 22. Was ist damit geschafft?', optionen: ['Der Handshake ist komplett, die Verbindung steht.', 'Der Port 22 wurde damit geschlossen.', 'Der Pi hat seine Daten vollständig geschickt.', 'Kalles Laptop hat sich beim Pi angemeldet.'], richtig: 0, erklaerung: 'SYN (Frame 1) – SYN, ACK (Frame 5) – ACK (Frame 9): drei Wege, Verbindung steht. Angemeldet ist Kalle damit aber noch lange nicht – für eine Anmeldung bräuchte er Benutzername und Passwort.', hinweise: ['Zählt: Das wievielte Segment dieser Verbindung ist Frame 9?'] },
        { id: 'e4-ws-rst', frage: 'Gleich danach (Frame 11) schickt Kalles Scanner <b>RST, ACK</b> an Port 22. Warum?', optionen: ['Er wollte nur wissen, ob jemand abhebt.', 'Der Pi hat die Verbindung verweigert.', 'Port 22 hat sich als geschlossen erwiesen.', 'Die Verbindung war zu langsam geworden.'], richtig: 0, erklaerung: 'Der Scanner bricht die Verbindung sofort ab, statt sie ordentlich mit FIN zu beenden – er wollte ja nur prüfen, ob der Port offen ist, und nichts mit dem Dienst anfangen.', hinweise: ['Wer schickt das RST – der Pi oder Kalles Laptop?'] },
        { id: 'e4-ws-udp53', frage: 'Frame 13 und 14: Wie hat Kalle geprüft, ob <b>UDP-Port 53</b> offen ist?', optionen: ['Mit einer echten DNS-Anfrage', 'Mit einem SYN an Port 53', 'Mit einem Ping an den Pi', 'Mit einem ARP-Request'], richtig: 0, erklaerung: 'Bei UDP gibt es keinen Handshake – also fragt der Scanner so, wie ein echter Client fragen würde: „Welche IP hat srv-file.fo-logistik.intern?“ Der Pi antwortet (Frame 14) → Port 53 ist offen, dort läuft ein DNS-Dienst.', hinweise: ['Schaut in die Protokoll-Spalte von Frame 13.'] },
        { id: 'e4-ws-9999', frage: 'Auf die Anfrage an <b>UDP-Port 9999</b> (Frame 15) antwortet der Pi mit Frame 16. Was folgt daraus?', optionen: ['Port 9999 ist geschlossen.', 'Port 9999 ist offen.', 'Das Ergebnis ist unklar.', 'Der Pi ist abgestürzt.'], richtig: 0, erklaerung: 'ICMP „Destination unreachable (Port unreachable)“ – der Pi meldet ausdrücklich: Hier lauscht niemand. Wäre gar nichts gekommen, wäre das Ergebnis unklar gewesen.', hinweise: ['Klappt in Frame 16 die ICMP-Zeile auf und vergleicht mit der UDP-Tabelle der Lektion.'] }
      ]
    },

    {
      id: 'e4-bericht', type: 'quiz', titel: 'Der Scan-Bericht',
      intro: '<p>Kalle hat den Pi vollständig durchgeprüft und druckt das Ergebnis aus. Zur Erinnerung aus Einsatz 3: Der Pi hat PCs per <b>DHCP</b> ein falsches Gateway zugeteilt und sich dabei selbst als <b>DNS-Server</b> eingetragen.</p>',
      kontext: `<div class="evidence"><h4>🖨️ Scan-Bericht 192.168.50.66 · Do 24.09.2026, 07:14 · Auftrag: T. Brandt</h4>
        <div style="white-space:pre">PORT       STATE    SERVICE
22/tcp     open     ssh
53/udp     open     domain
67/udp     open     dhcps
80/tcp     open     http
443/tcp    closed   https
3389/tcp   closed   ms-wbt-server
9999/udp   closed   unknown

MAC Address: DC:A6:32:5E:19:7A (Raspberry Pi Trading)
(Alle übrigen 65 531 TCP- und die geprüften UDP-Ports: closed)</div></div>`,
      fragen: [
        { id: 'e4-b-dienste', multi: true, frage: 'Welche Dienste bietet der Pi an?', optionen: ['SSH – Fernsteuerung', 'DNS – Namensauflösung', 'DHCP – IP-Konfiguration', 'HTTP – Webseiten', 'HTTPS – Webseiten', 'RDP – Remotedesktop'], fest: true, richtig: [0, 1, 2, 3], erklaerung: 'Offen sind 22 (SSH), 53 (DNS), 67 (DHCP) und 80 (HTTP). HTTPS und RDP sind geschlossen.', hinweise: ['Nur die Zeilen mit <code>open</code> zählen.'] },
        { id: 'e4-b-e3', frage: 'Welche Zeilen des Berichts passen zu dem, was der Pi in <b>Einsatz 3</b> getan hat?', optionen: ['53/udp und 67/udp', '22/tcp und 80/tcp', '443/tcp und 3389/tcp', '53/udp und 443/tcp'], richtig: 0, erklaerung: 'DHCP-Server (67/udp) und DNS-Server (53/udp): genau die beiden Rollen, die sich der Pi selbst gegeben hat.', hinweise: ['Welche Ports gehören zu DHCP und DNS?'] },
        { id: 'e4-b-https', frage: 'Port 80 ist offen, Port 443 geschlossen. Was heißt das für die <b>Webseite</b> auf dem Pi?', optionen: ['Sie wird nur unverschlüsselt ausgeliefert.', 'Sie wird nur verschlüsselt ausgeliefert.', 'Sie ist nur aus dem Internet erreichbar.', 'Sie ist gerade abgeschaltet worden.'], richtig: 0, erklaerung: 'Ohne Dienst auf 443 gibt es kein HTTPS – die Seite des Pi kommt im Klartext über HTTP. Erinnert ihr euch an die Akte? Bei der gefälschten Seite <b>fehlte das Schloss-Symbol</b>.', hinweise: ['Welcher Port gehört zu HTTP, welcher zu HTTPS?'] },
        { id: 'e4-b-ssh', frage: 'Wozu könnte der Täter <b>SSH</b> auf dem Pi brauchen?', optionen: ['Um den Pi aus der Ferne zu steuern', 'Um Webseiten an Browser auszuliefern', 'Um den PCs IP-Adressen zu vergeben', 'Um Namen in IP-Adressen zu übersetzen'], richtig: 0, erklaerung: 'Mit SSH steuert man ein Gerät per Kommandozeile aus der Ferne. Der Täter will seinen Pi also bedienen, ohne jedes Mal in den Serverraum zu müssen. Aber wie kommt er von draußen an den Pi heran?', hinweise: ['Schaut in die Port-Tabelle der ersten Lektion.'] }
      ]
    },

    {
      id: 'e4-tunnel-info', type: 'lesson', tag: 'TRAINING 4 · WER RUFT WEN AN?', titel: 'Der Anruf von drinnen',
      html: `
        <h3>Client oder Server? Die Ports verraten es</h3>
        <p>In einem Mitschnitt seht ihr oft nur ein paar Segmente mitten aus einer Verbindung – der Handshake liegt vielleicht Tage zurück. Wer hat die Verbindung aufgebaut? Schaut auf die Ports:</p>
        <ul><li>Die Seite mit dem <b>bekannten, festen Port</b> (22, 80, 443 …) ist der <b>Server</b> – dort lauscht der Dienst.</li>
          <li>Die Seite mit dem <b>zufälligen hohen Port</b> ist der <b>Client</b> – er hat angerufen.</li></ul>
        <h3>Raus geht's leicht, rein nicht</h3>
        <p>Der Router von F&amp;O lässt Verbindungen, die ein Gerät im Firmennetz <b>nach draußen</b> aufbaut, durch – und die Antworten darauf auch. Versucht dagegen jemand aus dem Internet, von sich aus eine Verbindung <b>ins</b> Firmennetz aufzubauen, lässt der Router das nicht durch. Der Täter kann seinen Pi also nicht einfach von zu Hause aus „anrufen“.</p>
        <h3>Der Trick: Der Pi ruft selbst an</h3>
        <p>Deshalb dreht man die Richtung um: Der Pi baut <b>von sich aus</b> eine SSH-Verbindung zu einem Server im Internet auf, den der Täter kontrolliert – und <b>hält sie dauerhaft offen</b>. Durch diese bestehende Leitung kann der Täter dann in Gegenrichtung Befehle an den Pi schicken und Daten abholen. Man spricht von einem <b>Rückkanal</b> oder <b>Reverse-Tunnel</b>.</p>
        <p>Das ist keine Erfindung von Angreifern: Viele Fernwartungsprogramme für den Support arbeiten genauso – das Gerät „ruft nach Hause“. Der Unterschied ist, ob die IT-Abteilung davon weiß.</p>
        <div class="merk"><b>Woran Ermittlerinnen und Ermittler einen Rückkanal erkennen:</b>
          <ul style="margin:6px 0 0">
            <li>Ein Gerät im Firmennetz hält eine <b>dauerhafte Verbindung</b> zu einer <b>unbekannten Adresse im Internet</b>.</li>
            <li>Auch wenn niemand arbeitet, fließen in <b>festen Abständen kleine Pakete</b> – Lebenszeichen, damit die Verbindung nicht einschläft.</li>
            <li>Der Inhalt ist <b>verschlüsselt</b> (z. B. SSH) – lesen kann man ihn nicht, aber sehen, <i>dass</i> und <i>wann</i> gesprochen wird.</li>
          </ul></div>
        <div class="merk"><b>⚠ Für die Praxis:</b> Fallen euch im Betrieb solche Verbindungen auf, meldet ihr sie nach den <b>IT-Sicherheitsvorgaben eures Betriebs</b> – ihr untersucht sie nicht auf eigene Faust.</div>`,
      kalle: 'Stellt euch vor, jemand schmuggelt ein Handy in die Firma, ruft damit seine eigene Nummer an und lässt die Leitung einfach offen. Die Pforte hält jeden Besucher auf – aber das Gespräch läuft ja schon.'
    },
    {
      id: 'e4-tunnel', type: 'quiz', titel: 'Das Lebenszeichen',
      intro: `<p>Zehn Sekunden ganz normaler Betrieb am Server-Switch, Donnerstag 07:20 Uhr (Port-Spiegelung). Beteiligte: der <b>Pi</b> .66 (dc:a6:32:5e:19:7a), der <b>Router</b> .1 (00:a0:57:2b:7c:01), <b>PC-VERSAND-01</b> .131, <b>PC-VERSAND-02</b> .140 und <b>SRV-FILE</b> .12.</p>${filterSpick}`,
      wireshark: { datei: 'sw-server-01_do_0720.pcapng', pakete: alltag },
      fragen: [
        { id: 'e4-tu-filter', eingabe: 'filter', frage: 'In der Liste taucht eine Adresse aus dem Internet auf, die nicht zu F&amp;O gehört: <b>198.51.100.23</b>. Schreibt einen Filter, der nur die Frames zeigt, die mit ihr zu tun haben.', richtig: 'ip.addr == 198.51.100.23', erklaerung: 'Sechs Frames – immer paarweise: Der Pi schickt etwas, der Server antwortet.', hinweise: ['Quelle <i>oder</i> Ziel – dafür gibt es <code>ip.addr</code>.'] },
        { id: 'e4-tu-port', eingabe: 'zahl', frage: 'Welchen <b>Ziel-Port</b> spricht der Pi auf diesem Server an?', platzhalter: 'Portnummer', richtig: '22', erklaerung: 'Port 22 – SSH. Wireshark erkennt das Protokoll auch selbst und schreibt „SSHv2“ in die Protokoll-Spalte.', hinweise: ['Markiert Frame 1 und klappt die TCP-Zeile auf.'] },
        { id: 'e4-tu-wer', frage: 'Der Handshake dieser Verbindung ist nicht im Mitschnitt. Wer hat sie <b>aufgebaut</b>?', optionen: ['Der Pi – er nutzt den hohen Port 48213.', 'Der Server – er nutzt den festen Port 22.', 'Der Router – er verbindet die beiden Netze.', 'Kalles Laptop – er hat den Scan gestartet.'], richtig: 0, erklaerung: 'Der Pi sitzt auf dem zufällig gewählten Port 48213 – er ist der Client. (48213 liegt übrigens im registrierten Bereich: typisch Linux, das Client-Ports ab 32768 vergibt.) Auf dem Server lauscht der Dienst an Port 22. Der Pi hat also selbst „nach Hause telefoniert“.', hinweise: ['Lest den ersten Abschnitt der Lektion noch einmal.'] },
        { id: 'e4-tu-takt', frage: 'Frame 1, 9 und 11 kommen nach 0, 5 und 10 Sekunden – kleine, verschlüsselte Pakete. Was ist das vermutlich?', optionen: ['Lebenszeichen, damit der Tunnel offen bleibt', 'Ein Portscan des Pi gegen den Server', 'Fehlerhafte Frames, die wiederholt werden', 'DNS-Anfragen an einen Server im Internet'], richtig: 0, erklaerung: 'Regelmäßige, kleine Pakete, auch wenn niemand arbeitet: So hält der Pi die Verbindung am Leben – der Rückkanal steht jederzeit bereit.', hinweise: ['Schaut in den Merkkasten der Lektion.'] },
        { id: 'e4-tu-lesen', frage: 'Kann Kalle mitlesen, <b>was</b> durch den Tunnel geht?', optionen: ['Nein – SSH verschlüsselt den Inhalt.', 'Ja – er sieht alles im Mitschnitt.', 'Ja – Port 22 ist nicht verschlüsselt.', 'Nein – der Router löscht den Inhalt.'], richtig: 0, erklaerung: 'Wireshark zeigt nur „Encrypted packet“. Man sieht, <i>wer</i> mit <i>wem</i> und <i>wann</i> spricht – aber nicht, <i>was</i>.', hinweise: ['Klappt in Frame 1 die Zeile „SSH Protocol“ auf.'] },
        { id: 'e4-tu-mac', eingabe: 'mac', frage: 'An welche <b>Ziel-MAC</b> schickt der Pi Frame 1?', platzhalter: 'MAC-Adresse', richtig: '00:a0:57:2b:7c:01', erklaerung: 'An den Router (LANCOM). 198.51.100.23 liegt nicht im eigenen Netz – also geht der Frame ans Gateway. Der Pi selbst benutzt brav den echten Router.', hinweise: ['Klappt in Frame 1 die Zeile „Ethernet II“ auf.'] }
      ]
    },

    {
      id: 'e4-zeit', type: 'quiz', titel: 'Seit wann telefoniert der Pi?', setzt: { demir: 'verdaechtig', seidel: 'verdaechtig' },
      intro: '<p>Herr Brandt holt aus dem Router das <b>Verbindungsprotokoll</b> – der Router notiert jede Verbindung, die aus dem Firmennetz ins Internet aufgebaut wird. Er exportiert einen <b>Auszug der letzten vier Wochen</b> (Donnerstag, 27.08., bis heute, Donnerstag, 24.09.2026) und filtert auf den Pi.</p>',
      kontext: `<div class="evidence"><h4>📋 Router · Verbindungsprotokoll · Auszug 27.08.–24.09.2026 · Filter: Quelle 192.168.50.66</h4>
          <table><tr><th>Datum</th><th>Uhrzeit</th><th>Prot.</th><th>Quelle</th><th>Ziel</th><th>Ereignis</th></tr>
            <tr><td>Fr 18.09.</td><td>14:12:07</td><td>TCP</td><td>192.168.50.66:48190</td><td>198.51.100.23:22</td><td>Verbindung aufgebaut</td></tr>
            <tr><td>Di 22.09.</td><td>11:40:02</td><td>TCP</td><td>192.168.50.66:48190</td><td>198.51.100.23:22</td><td>Verbindung abgebrochen</td></tr>
            <tr><td>Di 22.09.</td><td>11:40:33</td><td>TCP</td><td>192.168.50.66:48213</td><td>198.51.100.23:22</td><td>Verbindung aufgebaut</td></tr></table>
          <p style="margin:8px 0 0">Weitere Einträge für 192.168.50.66 im Auszug: keine.</p></div>${zutritt}`,
      fragen: [
        { id: 'e4-z-erst', frage: 'Wann hat der Pi <b>zum ersten Mal</b> eine Verbindung nach draußen aufgebaut?', optionen: ['Freitag, 14:12 Uhr', 'Montag, 08:03 Uhr', 'Montag, 08:14 Uhr', 'Dienstag, 11:40 Uhr'], richtig: 0, erklaerung: 'Freitag, 18.09., 14:12:07. Der Auszug beginnt am 27.08. – in den 22 Tagen bis zu diesem Freitag hat die .66 keine einzige Verbindung nach draußen aufgebaut. Der Pi war vorher also nicht im Netz (oder zumindest nicht aktiv).', hinweise: ['Sucht den ältesten Eintrag im Protokoll.'] },
        { id: 'e4-z-wer', multi: true, frage: 'Wer war laut Zutrittsprotokoll <b>kurz davor</b> im Serverraum?', optionen: ['Leon Berger', 'Yusuf Demir', 'Marco Seidel', 'Thomas Brandt'], fest: true, richtig: [1, 2], erklaerung: 'Um 14:10 schloss Herr Demir den Serverraum für Herrn Seidel auf – zwei Minuten später telefoniert der Pi zum ersten Mal nach draußen.', hinweise: ['Welcher Eintrag liegt kurz vor Freitag 14:12?'] },
        { id: 'e4-z-leon', frage: 'Was bedeutet das für den Verdacht gegen <b>Leon Berger</b>?', optionen: ['Der Pi lief schon vor Leons Besuch.', 'Leon hat den Pi am Montag angeschlossen.', 'Leon ist damit vollständig entlastet.', 'Das Protokoll betrifft Leon gar nicht.'], richtig: 0, erklaerung: 'Der Pi war schon am Freitag im Netz – Leons Besuch am Montag um 08:03 passt nur noch zum <i>Start des DHCP-Dienstes</i>, nicht zum Anschließen. Vollständig entlastet ist Leon damit aber nicht: Einen Dienst kann man auch per Zeitsteuerung starten oder aus der Ferne einschalten. Am Board stehen jetzt drei Namen.', hinweise: ['Wann lief der Pi nachweislich – und wann war Leon im Serverraum?'] },
        { id: 'e4-z-neu', frage: 'Am Dienstag um 11:40 bricht die Verbindung ab und steht 31 Sekunden später wieder – mit neuem Quell-Port. Was folgt daraus?', optionen: ['Der Pi baut den Tunnel selbst wieder auf.', 'Jemand hat den Pi im Serverraum neu gesteckt.', 'Der Server im Internet hat den Pi angerufen.', 'Der Router hat den Quell-Port ausgetauscht.'], richtig: 0, erklaerung: 'Neuer Quell-Port = neue Verbindung, wieder vom Pi aus (er ist die Quelle). Seit Dienstag 07:12 hat laut Zutrittsprotokoll niemand mehr den Serverraum betreten – der Pi ist so eingerichtet, dass er den Rückkanal nach einer Störung von selbst wieder aufbaut.', hinweise: ['Wer steht in der Spalte „Quelle“?', 'Wer hat den Serverraum vor Dienstag 11:40 zuletzt betreten?'] }
      ]
    },

    {
      id: 'e4-beweise', type: 'sort', titel: 'Beweise nach Schichten', punkte: 8,
      intro: '<p>Die Direktorin will die neuen Beweisstücke in der Akte sehen – nach Schichten geordnet. Vorsicht bei allem, was „Port“ heißt!</p>',
      bins: [4, 3, 2, 1].map(n => ({ id: n, kurz: 'L' + n, farbe: n, label: OSI.handbuch.find(h => h.n === n).name })),
      items: [
        { id: 'e4-bw-rst', text: 'Port 443 antwortet mit RST, ACK', ziel: 4, erklaerung: 'TCP-Flags und Ports → L4.', hinweis: 'RST ist ein Flag in welchem Header?' },
        { id: 'e4-bw-kabel22', text: 'Kalles Laptop steckt in Switch-Port 22', ziel: 1, erklaerung: 'Ein Switch-Port ist eine Buchse für ein Kabel → L1.', hinweis: 'Ist das eine Buchse oder eine Nummer im Header?' },
        { id: 'e4-bw-quellport', text: 'Tunnel: Quell-Port 48213, Ziel-Port 22', ziel: 4, erklaerung: 'Portnummern → L4.', hinweis: 'Hier geht es um Nummern im TCP-Header.' },
        { id: 'e4-bw-zielip', text: 'Gegenstelle 198.51.100.23 liegt im Internet', ziel: 3, erklaerung: 'IP-Adresse eines fremden Netzes → L3.', hinweis: 'Um welche Art von Adresse geht es?' },
        { id: 'e4-bw-routermac', text: 'Tunnel-Frames gehen an die MAC des Routers', ziel: 2, erklaerung: 'Ziel-MAC im Frame → L2.', hinweis: 'MAC-Adressen gehören zu welcher Schicht?' },
        { id: 'e4-bw-udp67', text: 'UDP-Port 67 auf dem Pi ist offen', ziel: 4, erklaerung: 'Offener UDP-Port → L4. (Der DHCP-Dienst dahinter ist L7.)', hinweis: 'Es geht um den Port, nicht um den Dienst.' },
        { id: 'e4-bw-link23', text: 'Switch-Port 23: Link aktiv, 100 Mbit/s', ziel: 1, erklaerung: 'Link und Geschwindigkeit an der Buchse → L1.', hinweis: 'Geschwindigkeit auf der Leitung …' },
        { id: 'e4-bw-66', text: 'Pi nutzt die IP .66 außerhalb des DHCP-Bereichs', ziel: 3, erklaerung: 'IP-Adresse → L3.', hinweis: 'Um welche Adresse geht es?' }
      ]
    },

    {
      id: 'e4-cliffhanger', type: 'story', titel: 'Die Tür nach draußen', bild: 'e4_tunnel.jpg', board: true,
      szenen: [
        { wer: 'kalle', text: 'Halten wir fest: Der Pi hat vier offene Türen – DHCP, DNS, eine Webseite ohne Verschlüsselung und SSH. Und er hält seit <b>Freitag, 14:12 Uhr</b> einen Tunnel zu einem Server im Internet offen. Durch den kann der Täter jederzeit rein.' },
        { wer: 'brandt', text: 'Freitag, 14:12 … Da waren doch Herr Demir und der Techniker von PrintPoint im Serverraum. Herr Demir ist seit 22 Jahren bei uns!' },
        { wer: 'direktorin', text: 'Niemand ist hier überführt, Herr Brandt – auch Herr Demir nicht. Aber das Board hat jetzt drei Namen statt einem. Wem 198.51.100.23 gehört, muss die Polizei beim Anbieter erfragen; das dauert. Wir arbeiten weiter.' },
        { wer: 'direktorin', text: 'Eine Frage ist noch offen, Agentinnen und Agenten: Frau Lindner hat die <b>richtige Adresse</b> eingetippt – warum landet ihr Browser beim Pi statt beim Lohnserver? Die Antwort liegt auf <b>L5 bis L7</b>.' },
        { wer: 'system', text: '▶ Akte „Einsatz 5 – Die Fälschung“ wird vorbereitet …' }
      ]
    },
    {
      id: 'e4-aussen', type: 'sealed', bonus: true, titel: 'Außeneinsatz: Wer hebt ab?',
      teaser: 'In Packet Tracer beobachtet ihr im Simulationsmodus den 3-Wege-Handshake zu einem Webserver – dann schaltet ihr den HTTP-Dienst ab und seht, was stattdessen zurückkommt.'
    },
    {
      id: 'e4-ende', type: 'ende', titel: 'Türsteher L4 im Einsatz!', abzeichen: 'e4-fertig', abzeichenOhneTipp: 'e4-ohne-tipp',
      text: '<p>Ihr habt die offenen Ports des Pi ermittelt, den 3-Wege-Handshake im Mitschnitt gelesen und den Rückkanal ins Internet aufgedeckt – samt Startzeit am Freitag. Die nächste Spur führt nach <b>L5 bis L7</b>.</p>'
    }
  ];
})();
