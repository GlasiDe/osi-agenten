/* Einsatz 5 – L5 bis L7: Die Fälschung. IDs NIE ändern (stecken in Spielständen).
   Ermittlersicht: Wie erkennt man die Fälschung? Kein Nachbau des Abgreifens. */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'e5');
  const L = n => `<span class="lchip" style="background:var(--L${n})">L${n}</span>`;
  const N = OSI.netz, H = N.hosts;
  const DOM = 'fo-logistik.intern';

  // ------------------------------------------------------------ DNS: offizieller Server SRV-DC01 (.10) und der Pi (.66, lügt nur beim Lohnportal, nennt sich LEON-NB)
  const echt = { router: '192.168.50.1', 'srv-dc01': '192.168.50.10', 'srv-file': '192.168.50.12', lohn: '192.168.50.20', 'srv-lohn': '192.168.50.20', 'pc-buch-03': '192.168.50.123', 'pc-versand-01': '192.168.50.131', 'pc-versand-02': '192.168.50.140' };
  const dnsServer = {
    '192.168.50.10': { name: 'srv-dc01.' + DOM, a: echt },
    '192.168.50.66': { name: 'LEON-NB.' + DOM, a: Object.assign({}, echt, { lohn: '192.168.50.66', 'leon-nb': '192.168.50.66' }) }
  };
  const ipOk = x => /^(\d{1,3}\.){3}\d{1,3}$/.test(x) && x.split('.').every(z => +z <= 255);
  const rueck = (s, ip) => {
    if (s.a['leon-nb'] === ip) return 'LEON-NB.' + DOM;
    const n = Object.keys(s.a).filter(k => s.a[k] === ip).sort((x, y) => (x === 'lohn') - (y === 'lohn'))[0];
    return n ? n + '.' + DOM : null;
  };
  const aufloesen = (name, server) => {
    const s = dnsServer[server]; if (!s) return null;
    const kurz = name.toLowerCase().replace(/\.$/, '').replace('.' + DOM, '');
    return s.a[kurz] || null;
  };
  function nslookup(m) {
    const ziel = m[1], server = m[2] || '192.168.50.66';
    if (!ipOk(server)) return `*** Server ${server} konnte nicht gefunden werden.\n(Simulation: Gebt den DNS-Server als IP-Adresse an, z. B. 192.168.50.10.)\n`;
    const s = dnsServer[server];
    if (!s) return `DNS request timed out.\n    timeout was 2 seconds.\nServer:  UnKnown\nAddress:  ${server}\n\n*** Zeitüberschreitung bei Anforderung an UnKnown.\n`;
    const kopf = `Server:  ${s.name}\nAddress:  ${server}\n\n`;
    if (ipOk(ziel)) {
      const n = rueck(s, ziel);
      return kopf + (n ? `Name:    ${n}\nAddress:  ${ziel}\n` : `*** ${s.name} kann ${ziel} nicht finden: Non-existent domain\n`);
    }
    const voll = ziel.toLowerCase().endsWith(DOM) ? ziel.toLowerCase() : (ziel.includes('.') ? null : ziel.toLowerCase() + '.' + DOM);
    if (!voll) return kopf + `(Simulation: Aufgelöst werden hier nur Namen aus dem Firmennetz ${DOM}, z. B. lohn.${DOM}.)\n`;
    const ip = aufloesen(voll, server);
    const anzeige = voll.startsWith('leon-nb.') ? 'LEON-NB.' + DOM : voll;
    return kopf + (ip ? `Name:    ${anzeige}\nAddress:  ${ip}\n` : `*** ${s.name} kann ${voll} nicht finden: Non-existent domain\n`);
  }
  const pingAntw = { '192.168.50.1': { ttl: 255 }, '192.168.50.10': { ttl: 128 }, '192.168.50.12': { ttl: 128 }, '192.168.50.20': { ttl: 64 }, '192.168.50.66': { ttl: 64 }, '192.168.50.123': { ttl: 128 }, '192.168.50.131': { ttl: 128 }, '192.168.50.140': { ttl: 128 }, '127.0.0.1': { ttl: 128 } };
  function ping(m) {
    const ziel = m[1];
    if (ipOk(ziel)) return N.ping(ziel, pingAntw, H.vers2.ip);
    const voll = ziel.toLowerCase().endsWith(DOM) ? ziel.toLowerCase() : ziel.toLowerCase() + '.' + DOM;
    const ip = aufloesen(voll, '192.168.50.66');
    if (!ip) return `Ping-Anforderung konnte Host "${ziel}" nicht finden. Überprüfen Sie den Namen, und versuchen Sie es erneut.\n`;
    return N.ping(ip, pingAntw, H.vers2.ip).replace(`Ping wird ausgeführt für ${ip} mit`, `Ping wird ausgeführt für ${voll} [${ip}] mit`);
  }
  const terminalVersand = {
    titel: 'Eingabeaufforderung – PC-VERSAND-02 (Versand)',
    prompt: 'C:\\Users\\m.lindner>',
    befehle: [
      { tab: 'nslookup ', re: /^nslookup (\S+)(?: (\S+))?$/, out: nslookup },
      { cmd: 'ipconfig', out: N.versand2.ipconfig },
      { cmd: 'ipconfig /all', alias: ['ipconfig -all'], out: N.versand2.ipconfigAll('Freitag, 25. September 2026', '07:48:12', '08:48:12') },
      { cmd: 'hostname', out: 'PC-VERSAND-02\n' },
      { tab: 'ping ', re: /^ping (\S+)$/, out: ping }
    ],
    spick: [
      ['nslookup <Name>', 'fragt den eingestellten DNS-Server nach der IP-Adresse zu einem Namen'],
      ['nslookup <Name> <DNS-Server>', 'fragt gezielt einen bestimmten DNS-Server'],
      ['nslookup <IP-Adresse>', 'Rückwärtssuche: Welcher Name ist zu dieser IP-Adresse eingetragen?'],
      ['ipconfig /all', 'u. a. DHCP-Server und DNS-Server des PCs'],
      ['ping <Name oder IP-Adresse>', 'prüft, ob jemand antwortet – ein Name wird vorher aufgelöst'],
      ['ipconfig', 'IP-Adresse, Subnetzmaske, Standardgateway'],
      ['hostname', 'Name des eigenen PCs']
    ]
  };

  // ------------------------------------------------------------ Browser-Ansichten (HTML, kein Bild)
  const browser = (titel, adresse, pick) => {
    const p = k => pick ? ` data-pick="${k}" style="cursor:pointer"` : '';
    return `<div style="border:1px solid #46616a;border-radius:8px;overflow:hidden;background:#fff;color:#222;font-family:Segoe UI,Arial,sans-serif;margin:8px 0">
      <div style="background:#dfe3e6;padding:6px 10px;font-size:.8rem;color:#333">${titel}</div>
      <div style="display:flex;align-items:center;gap:8px;background:#f3f4f5;padding:6px 10px;border-bottom:1px solid #ccc">
        <span style="color:#777">◀ ▶ ⟳</span>
        <span${p('adresse')} style="flex:1;background:#fff;border:1px solid #bbb;border-radius:14px;padding:3px 12px;font-size:.9rem">${adresse}</span></div>
      <div style="padding:18px 22px;display:grid;gap:10px;max-width:420px">
        <div${p('logo')} style="font-weight:800;font-size:1.2rem;color:#0d4f5c">🚚 F&amp;O Lohnportal</div>
        <div${p('felder')} style="display:grid;gap:6px"><div style="font-size:.85rem">Benutzername</div><div style="border:1px solid #aaa;height:26px;border-radius:4px"></div>
          <div style="font-size:.85rem">Passwort</div><div style="border:1px solid #aaa;height:26px;border-radius:4px"></div></div>
        <div${p('knopf')} style="background:#e06a1b;color:#fff;border-radius:4px;padding:6px 14px;width:max-content">Anmelden</div>
        <div${p('fuss')} style="font-size:.75rem;color:#777">© Falkenrath &amp; Oltmanns Logistik GmbH · Hilfe: Durchwahl 210</div></div></div>`;
  };
  const browserVergleich = `
    ${browser('📷 Bildschirmfoto PC-VERSAND-01 · Freitag 07:40', '<span style="color:#1a7f37">🔒</span> https://lohn.fo-logistik.intern/login', false)}
    ${browser('📷 Bildschirmfoto PC-VERSAND-02 (Frau Lindner) · Freitag 07:52 · <b>anklickbar</b>', '<span style="color:#b3261e">⚠ Nicht sicher</span> &nbsp;lohn.fo-logistik.intern/login', true)}`;

  // ------------------------------------------------------------ Diagramm: der Mittelsmann (SVG)
  function mitmSvg() {
    const box = (x, y, w, titel, sub, farbe) => `<rect x="${x}" y="${y}" width="${w}" height="54" rx="8" fill="#10262b" stroke="${farbe}" stroke-width="2"/>
      <text x="${x + w / 2}" y="${y + 23}" text-anchor="middle" font-size="14" font-weight="700" fill="#e3eef0">${titel}</text>
      <text x="${x + w / 2}" y="${y + 42}" text-anchor="middle" font-size="12" fill="#9dbac0">${sub}</text>`;
    const pfeil = (x1, x2, y, txt, farbe) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${farbe}" stroke-width="2" marker-end="url(#ap)"/>
      <text x="${(x1 + x2) / 2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="${farbe}">${txt}</text>`;
    return `<svg viewBox="0 0 640 210" width="640" role="img" aria-label="Der Pi als Mittelsmann zwischen Frau Lindners PC und dem echten Lohnserver" font-family="Segoe UI, Arial, sans-serif">
      <defs><marker id="ap" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#9dbac0"/></marker></defs>
      ${box(10, 78, 150, 'PC Frau Lindner', '192.168.50.140', '#4aa3df')}
      ${box(245, 78, 150, 'Raspberry Pi', '192.168.50.66', '#ff8a2a')}
      ${box(480, 78, 150, 'echter Lohnserver', '192.168.50.20', '#4fd18b')}
      ${pfeil(162, 243, 92, 'HTTP · Port 80', '#ff5d5d')}
      ${pfeil(243, 162, 128, 'ohne Schloss', '#ff5d5d')}
      ${pfeil(397, 478, 92, 'HTTPS · Port 443', '#4fd18b')}
      ${pfeil(478, 397, 128, 'verschlüsselt', '#4fd18b')}
      <text x="86" y="185" text-anchor="middle" font-size="11" fill="#9dbac0">tippt den Namen</text>
      <text x="320" y="185" text-anchor="middle" font-size="11" fill="#9dbac0">nimmt links offen, spricht rechts verschlüsselt</text>
      <text x="555" y="185" text-anchor="middle" font-size="11" fill="#9dbac0">echte Daten</text></svg>`;
  }

  // ------------------------------------------------------------ Mitschnitt: Frau Lindner ruft die Seite auf (Fr 07:52). Nur Seitenabruf – KEIN Anmeldevorgang.
  const V2 = H.vers2, P = H.pi, S = H.lohn;
  const UA = 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0';
  const HOST = 'Host: lohn.fo-logistik.intern';
  const vonPC = (t, x) => Object.assign({ t, typ: 'http', src: V2.mac, dst: P.mac, sip: V2.ip, dip: P.ip, sp: 50902, dp: 80, host: 'lohn.fo-logistik.intern' }, x);
  const zumPC = (t, x) => Object.assign({ t, typ: 'http', src: P.mac, dst: V2.mac, sip: P.ip, dip: V2.ip, sp: 80, dp: 50902, ttl: 64 }, x);
  const piServer = (t, len) => ({ t, typ: 'tls', src: P.mac, dst: S.mac, sip: P.ip, dip: S.ip, sp: 44790, dp: 443, len, ttl: 64 });
  const serverPi = (t, len) => ({ t, typ: 'tls', src: S.mac, dst: P.mac, sip: S.ip, dip: P.ip, sp: 443, dp: 44790, len });
  const mitschnitt = N.mitschnitt([
    { t: 0.000000, typ: 'dns', src: V2.mac, dst: P.mac, sip: V2.ip, dip: P.ip, sp: 61220, id: '0x7d21', name: 'lohn.fo-logistik.intern' },
    { t: 0.000688, typ: 'dns', src: P.mac, dst: V2.mac, sip: P.ip, dip: V2.ip, sp: 61220, id: '0x7d21', name: 'lohn.fo-logistik.intern', antwort: P.ip, ttl: 64 },
    { t: 0.001532, typ: 'tcp', flags: 'SYN', src: V2.mac, dst: P.mac, sip: V2.ip, dip: P.ip, sp: 50902, dp: 80 },
    { t: 0.001804, typ: 'tcp', flags: 'SYN, ACK', src: P.mac, dst: V2.mac, sip: P.ip, dip: V2.ip, sp: 80, dp: 50902, ttl: 64 },
    { t: 0.001911, typ: 'tcp', flags: 'ACK', src: V2.mac, dst: P.mac, sip: V2.ip, dip: P.ip, sp: 50902, dp: 80 },
    vonPC(0.002250, { methode: 'GET', uri: '/login', len: 412, zeilen: ['GET /login HTTP/1.1', HOST, UA, 'Accept: text/html'] }),
    piServer(0.002801, 236), serverPi(0.019514, 1380),
    zumPC(0.020233, { code: 200, status: 'OK', len: 1256, zeilen: ['HTTP/1.1 200 OK', 'Server: nginx/1.22.1', 'Content-Type: text/html; charset=utf-8', 'Content-Length: 1256'],
      html: ['<!DOCTYPE html>', '<html lang="de">', '<head><meta charset="utf-8"><title>F&O Lohnportal – Anmeldung</title></head>', '<body>', '<h1>F&amp;O Lohnportal</h1>', '<p>Bitte melden Sie sich an.</p>', '</body></html>'] })
  ], 'Sep 25, 2026 07:52:18 Mitteleuropäische Sommerzeit');

  const filterSpick = `<details class="small" style="margin:6px 0"><summary style="cursor:pointer">📋 Filter-Spickzettel aufklappen</summary>
    <table class="t small"><tr><th>Filter</th><th>zeigt …</th></tr>
      <tr><td><code>http</code>, <code>dns</code>, <code>tls</code>, <code>tcp</code></td><td>nur Frames mit diesem Protokoll</td></tr>
      <tr><td><code>ip.src == …</code> / <code>ip.dst == …</code> / <code>ip.addr == …</code></td><td>Quell-IP / Ziel-IP / eins von beiden</td></tr>
      <tr><td><code>tcp.port == 443</code> · <code>tcp.port == 80</code></td><td>Quell- oder Ziel-Port</td></tr>
      <tr><td><code>&amp;&amp;</code> · <code>||</code> · <code>!</code></td><td>und · oder · nicht</td></tr></table></details>`;

  E.steps = [
    {
      id: 'e5-intro', type: 'story', titel: 'Alles sah ganz normal aus', bild: 'e5_login.jpg',
      szenen: [
        { wer: 'system', text: '▶ Falkenrath &amp; Oltmanns · Versandbüro · Freitag, 07:45 Uhr' },
        { wer: 'brandt', text: 'Ich habe mit Frau Lindner gesprochen. Sie hat heute früh ganz normal <b>lohn.fo-logistik.intern</b> eingetippt und war danach in ihrem echten Lohnportal, mit ihren echten Abrechnungen. Ihr ist überhaupt nichts aufgefallen – nur das Schloss in der Adresszeile fehlte.' },
        { wer: 'kalle', text: 'Richtige Adresse, richtige Seite. Und gestern hat <code>netstat</code> gezeigt: Ihr Browser redet mit der <b>.66</b> auf <b>Port 80</b>, nicht mit dem echten Lohnserver. Wie kommt der Browser vom richtigen Namen zur falschen Adresse?' },
        { wer: 'direktorin', text: `<i>(über Funk)</i> Heute die oberen Schichten, Agentinnen und Agenten: ${L(7)} – Namen und Webseiten, ${L(6)} – Darstellung und Verschlüsselung, ${L(5)} – Sitzungen. Ich will verstehen, <b>wie diese Fälschung funktioniert</b> – und wie wir F&amp;O wieder sauber bekommen.` }
      ]
    },

    {
      id: 'e5-dns', type: 'lesson', tag: 'TRAINING 1 · DNS', titel: 'Das Telefonbuch des Netzes',
      html: `
        <p>Menschen merken sich Namen, Computer brauchen IP-Adressen. Das <b>Domain Name System (DNS)</b> übersetzt zwischen beiden – ein ${L(7)}-Dienst, der meist über <b>UDP, Port 53</b> läuft.</p>
        <h3>Was passiert, wenn ihr einen Namen eintippt?</h3>
        <table class="t">
          <tr><th>Schritt</th><th>Was passiert</th></tr>
          <tr><td>1</td><td>Der Browser soll <code>lohn.fo-logistik.intern</code> öffnen – er braucht aber eine IP-Adresse.</td></tr>
          <tr><td>2</td><td>Der PC fragt <b>seinen DNS-Server</b>: „Welche IP-Adresse hat lohn.fo-logistik.intern?“ Welcher DNS-Server das ist, steht in seiner IP-Konfiguration – meist per <b>DHCP</b> verteilt (Option 6).</td></tr>
          <tr><td>3</td><td>Der DNS-Server antwortet, z. B. „192.168.50.20“.</td></tr>
          <tr><td>4</td><td>Erst jetzt baut der Browser die Verbindung zu dieser IP-Adresse auf.</td></tr>
        </table>
        <div class="merk"><b>Der PC glaubt seinem DNS-Server.</b> Er prüft die Antwort nicht nach. In der Adresszeile steht weiter der Name, den ihr eingetippt habt – egal, zu welcher IP-Adresse er aufgelöst wurde. <b>Wer den DNS-Server kontrolliert, entscheidet, wohin ein Name führt.</b></div>
        <h3>nslookup – DNS von Hand fragen</h3>
        <table class="t">
          <tr><th>Befehl</th><th>fragt …</th></tr>
          <tr><td><code>nslookup lohn.fo-logistik.intern</code></td><td>den eingestellten DNS-Server nach der IP-Adresse</td></tr>
          <tr><td><code>nslookup lohn.fo-logistik.intern 192.168.50.10</code></td><td>gezielt den DNS-Server 192.168.50.10</td></tr>
          <tr><td><code>nslookup 192.168.50.10</code></td><td>umgekehrt: Welcher <b>Name</b> gehört zu dieser IP-Adresse? (<b>Rückwärtssuche</b>)</td></tr>
        </table>
        <p>Die ersten beiden Zeilen jeder nslookup-Ausgabe verraten, <b>welcher DNS-Server</b> geantwortet hat – mit Namen und IP-Adresse:</p>
        <div class="ws" style="padding:10px 14px;white-space:pre">Server:  srv-dc01.fo-logistik.intern
Address:  192.168.50.10

Name:    srv-file.fo-logistik.intern
Address:  192.168.50.12</div>`,
      kalle: 'DNS ist die Telefonauskunft. Wenn der Typ in der Auskunft euch bei „Pizzeria Luigi“ die Nummer seines Cousins gibt, bestellt ihr eben beim Cousin. Und merkt es erst, wenn die Pizza komisch schmeckt.'
    },
    {
      id: 'e5-dns-quiz', type: 'quiz', titel: 'DNS-Check',
      fragen: [
        { id: 'e5-q-zuerst', frage: 'Ihr tippt <code>lohn.fo-logistik.intern</code> in den Browser. Was muss der PC <b>als Erstes</b> herausfinden?', optionen: ['Die IP-Adresse zu diesem Namen', 'Die MAC-Adresse des Lohnservers', 'Den Port des Lohnportal-Dienstes', 'Den Standort des Lohnservers'], richtig: 0, erklaerung: 'Ohne IP-Adresse kein Paket. Erst danach kommen ARP (MAC-Adresse) und der Verbindungsaufbau zum Port.', hinweise: ['Womit adressiert ein PC ein Paket auf L3?'] },
        { id: 'e5-q-woher', frage: 'Woher weiß ein PC, welchen <b>DNS-Server</b> er fragen soll?', optionen: ['Aus seiner IP-Konfiguration, meist per DHCP', 'Er fragt immer den Router mit der .1', 'Er fragt per Broadcast alle Geräte', 'Er liest es aus dem Namen der Webseite'], richtig: 0, erklaerung: 'Der DNS-Server steht in der IP-Konfiguration (<code>ipconfig /all</code>) – meist vom DHCP-Server zugeteilt (Option 6). Genau das hat der Pi in Einsatz 3 ausgenutzt.', hinweise: ['Erinnert euch an die Optionen in einem DHCP-Offer.'] },
        { id: 'e5-q-rueck', frage: 'Was liefert eine <b>Rückwärtssuche</b> wie <code>nslookup 192.168.50.10</code>?', optionen: ['Den Namen, der zu dieser IP eingetragen ist', 'Die MAC-Adresse, die zu dieser IP gehört', 'Den Weg über alle Router zu dieser IP', 'Die Ports, die auf dieser IP offen sind'], richtig: 0, erklaerung: 'Rückwärts heißt: von der IP-Adresse zum Namen. Die MAC-Adresse liefert ARP, den Weg tracert, die Ports ein Portscan.', hinweise: ['Normal: Name → IP. Rückwärts: …?'] }
      ]
    },

    {
      id: 'e5-terminal', type: 'quiz', titel: 'Die Auskunft lügt',
      intro: '<p>Ein letztes Mal an <b>PC-VERSAND-02</b>. Sein DNS-Server ist – dank des falschen DHCP-Angebots aus Einsatz 3 – der Pi (192.168.50.66). Der offizielle DNS-Server von F&amp;O ist <b>SRV-DC01 (192.168.50.10)</b>. Tippt die Befehle selbst ein – der <b>📋 Spickzettel</b> hilft.</p>',
      terminal: terminalVersand,
      fragen: [
        { id: 'e5-t-lohn', eingabe: 'ip', frage: 'Zu welcher IP-Adresse löst PC-VERSAND-02 den Namen <b>lohn.fo-logistik.intern</b> auf?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Zur .66 – dem Pi! Der Browser fragt nach dem Lohnportal und bekommt die Adresse des Fremdgeräts.', hinweise: ['Tippt <code>nslookup lohn.fo-logistik.intern</code>.'] },
        { id: 'e5-t-echt', eingabe: 'ip', frage: 'Fragt jetzt gezielt den <b>offiziellen</b> DNS-Server 192.168.50.10. Welche IP-Adresse nennt er für lohn.fo-logistik.intern?', platzhalter: 'IP-Adresse', richtig: '192.168.50.20', erklaerung: 'SRV-DC01 sagt korrekt .20 – der echte Lohnserver. Derselbe Name, zwei verschiedene Antworten: Der Pi lügt.', hinweise: ['Den DNS-Server hängt ihr hinten an: <code>nslookup lohn.fo-logistik.intern 192.168.50.10</code>'] },
        { id: 'e5-t-file', frage: 'Probiert <code>nslookup srv-file.fo-logistik.intern</code>: Der Pi liefert die <b>richtige</b> Adresse .12. Warum fälscht er nicht alle Namen?', optionen: ['So fällt die Fälschung weniger auf.', 'Der Pi kennt nur einen einzigen Namen.', 'SRV-FILE ist gegen DNS geschützt.', 'Er hat die übrigen Namen vergessen.'], richtig: 0, erklaerung: 'Netzlaufwerke, Drucker, Internet – alles funktioniert normal. Nur beim Lohnportal lügt der Pi. Würde plötzlich gar nichts mehr gehen, wäre der Alarm sofort da.', hinweise: ['Was würde passieren, wenn im Versand plötzlich nichts mehr funktioniert?'] },
        { id: 'e5-t-schicht', layer: true, frage: 'Auf welcher Schicht findet <b>diese</b> Täuschung statt?', richtig: 7, erklaerung: 'DNS ist ein Anwendungsdienst – L7. IP-Adressen, MAC-Adressen und Ports sind alle „echt“; gelogen wird bei der Übersetzung des Namens.', hinweise: ['Welcher Dienst lügt hier?'] },
        { id: 'e5-t-name', eingabe: 'text', frage: 'Schaut auf die ersten Zeilen der nslookup-Ausgabe des Pi. Unter welchem <b>Namen</b> meldet sich der DNS-Server 192.168.50.66?', platzhalter: 'Name', richtig: ['LEON-NB.fo-logistik.intern', 'LEON-NB'], erklaerung: 'LEON-NB.fo-logistik.intern. „NB“ wie Notebook – und „Leon“ wie Leon Berger …', hinweise: ['Die Zeile beginnt mit <code>Server:</code>.', 'Probiert auch die Rückwärtssuche: <code>nslookup 192.168.50.66</code>'] },
        { id: 'e5-t-offiziell', frage: 'Fragt den offiziellen Server: <code>nslookup 192.168.50.66 192.168.50.10</code>. Was folgt aus der Antwort?', optionen: ['Den Namen kennt nur der DNS-Dienst des Pi.', 'Der Name ist im Firmennetz offiziell vergeben.', 'SRV-DC01 ist gerade ausgefallen.', 'Die .66 gehört zu Leons Firmen-Notebook.'], richtig: 0, erklaerung: '„Non-existent domain“ – der offizielle DNS-Server von F&amp;O kennt keinen Namen für die .66. „LEON-NB“ steht nur im DNS-Dienst des Pi.', hinweise: ['Was bedeutet „Non-existent domain“?'] },
        { id: 'e5-t-beweis', frage: 'Beweist der Name <b>LEON-NB</b>, dass Leon Berger den Pi eingerichtet hat?', optionen: ['Nein – den Namen kann jeder selbst eintragen.', 'Ja – der Name steht ja im DNS-Server.', 'Ja – nur Leon kennt diese Schreibweise.', 'Nein – Namen gibt es im Firmennetz nicht.'], richtig: 0, erklaerung: 'Ein selbst gewählter Name ist wie ein selbst beschriftetes Klingelschild: Da kann jeder „Berger“ draufschreiben. Wer den Pi einrichtet, kann ihn nennen, wie er will – auch so, dass der Verdacht auf jemand anderen fällt. Ein Indiz, und ein verdächtig bequemes.', hinweise: ['Wer hat den Namen in den DNS-Dienst des Pi eingetragen?'] }
      ]
    },

    {
      id: 'e5-http', type: 'lesson', tag: 'TRAINING 2 · HTTP UND HTTPS', titel: 'Frage, Antwort – und das Schloss',
      html: `
        <p>Der Browser spricht mit dem Webserver per <b>HTTP</b> (Hypertext Transfer Protocol, ${L(7)}). Das Prinzip ist immer gleich: Der Browser stellt eine <b>Anfrage</b> (Request), der Server schickt eine <b>Antwort</b> (Response). Bei HTTP ist beides <b>ganz normaler, lesbarer Text</b>.</p>
        <div class="ws" style="padding:10px 14px;white-space:pre">GET /login HTTP/1.1                 ← Methode, Pfad, Version
Host: lohn.fo-logistik.intern       ← welcher Name wurde eingetippt?

HTTP/1.1 200 OK                     ← Statuscode der Antwort
Content-Type: text/html</div>
        <table class="t">
          <tr><th>Methode</th><th>Bedeutung</th></tr>
          <tr><td><b>GET</b></td><td>„Gib mir diese Seite.“</td></tr>
          <tr><td><b>POST</b></td><td>„Hier sind Daten für dich“ – z. B. ein abgeschicktes Formular.</td></tr>
        </table>
        <table class="t">
          <tr><th>Statuscode</th><th>Bedeutung</th></tr>
          <tr><td><b>200</b> OK</td><td>Alles gut, hier ist die Seite.</td></tr>
          <tr><td><b>302</b> Found</td><td>Weiterleitung: „Geh bitte zu dieser anderen Adresse“ (Zeile <code>Location:</code>).</td></tr>
          <tr><td><b>404</b> Not Found</td><td>Diese Seite gibt es hier nicht.</td></tr>
        </table>
        <h3>HTTPS = HTTP + Verschlüsselung</h3>
        <p>Bei <b>HTTPS</b> (Port 443) läuft dasselbe HTTP – aber in einem <b>verschlüsselten Tunnel</b>, der heute <b>TLS</b> heißt. Wer die Frames unterwegs mitschneidet, sieht nur noch Zeichensalat. Außerdem muss der Server beim Verbindungsaufbau ein <b>Zertifikat</b> vorzeigen – einen digitalen Ausweis, der bestätigt: „Ich bin wirklich lohn.fo-logistik.intern.“</p>
        <table class="t">
          <tr><th>Adresszeile</th><th>Bedeutung</th></tr>
          <tr><td>🔒 https://…</td><td>verschlüsselte Verbindung, Zertifikat passt zum Namen</td></tr>
          <tr><td>⚠ Nicht sicher</td><td>unverschlüsseltes HTTP – jeder auf dem Weg kann mitlesen</td></tr>
        </table>
        <p>Wer sich für einen fremden Namen kein gültiges Zertifikat besorgen kann, muss auf HTTPS verzichten: Böte er die Seite über HTTPS an, zeigte der Browser eine große rote Warnung. Also bleibt Port 443 zu und die Seite kommt über <b>HTTP</b> – in der Hoffnung, dass niemand auf das fehlende Schloss achtet. Tippt man nur den Namen ohne <code>https://</code> ein und HTTPS klappt nicht, weichen viele Browser still auf HTTP aus.</p>
        <div class="merk"><b>Wo gehört TLS hin?</b> Das OSI-Modell ist älter als TLS, deshalb ist die Zuordnung in der Literatur nicht einheitlich. Wir ordnen TLS <b>L6</b> zu: Seine Kernaufgabe ist das Verschlüsseln, also das Umwandeln der Daten. Ihr findet aber auch <b>L5</b>, weil TLS eine gesicherte Sitzung aufbaut. Im Spiel zählt deshalb bei TLS beides als richtig.</div>
        <div class="merk"><b>🔒 Akte „TLS“ – gesperrt.</b> Wie die Verschlüsselung genau funktioniert und wie der Browser ein Zertifikat prüft, erfahrt ihr in einem späteren Einsatz.</div>`,
      kalle: 'HTTP ist eine Postkarte: Jeder Briefträger auf dem Weg kann sie lesen. HTTPS ist ein versiegelter Brief mit Ausweiskontrolle an der Haustür.'
    },
    {
      id: 'e5-browser', type: 'quiz', titel: 'Zwei Bildschirmfotos',
      intro: '<p>Herr Brandt hat heute früh zwei Bildschirmfotos gemacht: oben am PC-VERSAND-01 (richtige Konfiguration), unten am PC von Frau Lindner.</p>',
      kontext: browserVergleich,
      fragen: [
        { id: 'e5-h-pick', pick: true, frage: 'Woran hätte Frau Lindner die Fälschung erkennen können? Klickt im <b>unteren</b> Bildschirmfoto die verräterische Stelle an.', richtig: 'adresse', erklaerung: 'Die Adresszeile: „Nicht sicher“, kein Schloss, kein https. Logo, Felder und Knopf hat der Täter 1:1 nachgebaut – die kann jeder kopieren.', falsch: { logo: 'Das Logo ist eine exakte Kopie – so etwas kann jeder nachbauen.', felder: 'Die Eingabefelder sehen genauso aus wie beim Original.', knopf: 'Der Knopf ist genauso nachgebaut wie der Rest der Seite.', fuss: 'Die Fußzeile ist abgeschrieben – daran erkennt man nichts.' }, hinweise: ['Vergleicht beide Bildschirmfotos Stück für Stück.', 'Der Inhalt der Seite lässt sich kopieren. Was nicht?'] },
        { id: 'e5-h-schloss', frage: 'Was sagt das Schloss im oberen Bildschirmfoto aus?', optionen: ['Verschlüsselte Verbindung, passendes Zertifikat', 'Die Seite enthält garantiert keine Viren', 'Die Seite liegt im eigenen Firmennetz', 'Das Passwort wird nicht gespeichert'], richtig: 0, erklaerung: 'Das Schloss sagt: Die Verbindung ist verschlüsselt, und der Server hat ein Zertifikat für genau diesen Namen. Über die Inhalte der Seite sagt es nichts.', hinweise: ['Schaut in die kleine Tabelle zur Adresszeile.'] },
        { id: 'e5-h-404', frage: 'Frau Lindner vertippt sich: <code>lohn.fo-logistik.intern/logn</code>. Welchen Statuscode schickt der Server vermutlich?', optionen: ['404', '200', '302', '443'], richtig: 0, erklaerung: '404 Not Found – diese Seite gibt es nicht. (443 ist kein Statuscode, sondern der Port von HTTPS.)', hinweise: ['Welcher Code bedeutet „gibt es nicht“?'] },
        { id: 'e5-h-kein443', frage: 'Warum bietet der Täter seine Fälschung nicht einfach auch über <b>HTTPS</b> an?', optionen: ['Ihm fehlt ein gültiges Zertifikat.', 'HTTPS geht nur im Internet.', 'Ein Pi kann kein HTTPS.', 'Anmeldeseiten dürfen kein HTTPS.'], richtig: 0, erklaerung: 'Ohne passendes Zertifikat für lohn.fo-logistik.intern würde der Browser laut warnen. Ein fehlendes Schloss fällt weniger auf als eine rote Warnseite.', hinweise: ['Was muss ein Server bei HTTPS vorzeigen?'] }
      ]
    },

    {
      id: 'e5-wireshark', type: 'quiz', titel: 'Der Aufruf im Mitschnitt',
      intro: `<p>Kalles Mitschnitt vom Freitagmorgen (Port-Spiegelung am Server-Switch): Frau Lindners PC ruft „lohn.fo-logistik.intern“ auf und lädt die Anmeldeseite. Beteiligte: <b>PC-VERSAND-02</b> .140, der <b>Pi</b> .66 und der echte Lohnserver <b>SRV-LOHN</b> .20. Klickt Frames an und klappt die Details auf.</p>${filterSpick}`,
      wireshark: { datei: 'sw-server-01_fr_0752.pcapng', pakete: mitschnitt },
      fragen: [
        { id: 'e5-ws-dns', eingabe: 'ip', frage: 'Frame 1 fragt per DNS nach lohn.fo-logistik.intern. Welche IP-Adresse steht in der <b>Antwort</b> (Frame 2)?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Die .66 – der Pi nennt als Adresse des Lohnportals sich selbst. Ab hier hält der Browser die .66 für das Lohnportal.', hinweise: ['Markiert Frame 2 und klappt „Domain Name System (response)“ auf.'] },
        { id: 'e5-ws-http', eingabe: 'filter', frage: 'Schreibt einen Filter, der nur <b>HTTP</b> zeigt.', richtig: 'http', erklaerung: 'Zwei Frames: die Anfrage nach der Seite (GET) und die Antwort des Pi (200 OK). Beides im Klartext.', hinweise: ['Wie bei DNS: der Name des Protokolls.'] },
        { id: 'e5-ws-port', frage: 'Der PC holt die Seite bei der .66 über <b>Port 80</b>. Was bedeutet das für diese Verbindung?', optionen: ['Sie ist unverschlüsselt – jeder auf dem Weg liest mit.', 'Sie ist verschlüsselt wie beim echten Portal.', 'Sie läuft über UDP und ist deshalb schnell.', 'Sie geht an die Dateifreigabe des Pi.'], richtig: 0, erklaerung: 'Port 80 = HTTP, unverschlüsselt. Alles, was zwischen PC und Pi läuft, ist im Klartext – und der Pi sitzt genau auf diesem Weg.', hinweise: ['Welcher Dienst gehört zu Port 80?'] },
        { id: 'e5-ws-lesbar', frage: 'Klappt in Frame 6 die Zeile „Hypertext Transfer Protocol“ auf. Was könnt ihr dort lesen?', optionen: ['Die Anfrage als lesbaren Klartext', 'Nur unlesbaren, verschlüsselten Salat', 'Gar nichts – der Frame ist leer', 'Nur die MAC-Adressen der Geräte'], richtig: 0, erklaerung: 'Bei HTTP steht alles offen da: Methode, Pfad und die Host-Zeile lohn.fo-logistik.intern. Was der Mitschnitt hier zeigt, sieht auch der Pi – er ist ja der Empfänger.', hinweise: ['HTTP ist laut Lektion lesbarer Text.'] },
        { id: 'e5-ws-tls', frage: 'Frame 7 und 8 laufen zwischen Pi und echtem Lohnserver .20 über <b>Port 443</b>. Warum könnt ihr sie <b>nicht</b> lesen?', optionen: ['Diese Strecke ist mit TLS verschlüsselt.', 'Der Server hat die Frames gelöscht.', 'Die Frames sind beschädigt angekommen.', 'Wireshark blendet Port 443 immer aus.'], richtig: 0, erklaerung: 'Port 443, Protokoll TLS: Wireshark zeigt nur „Encrypted Application Data“. Zum echten Server ist alles verschlüsselt – nur die Strecke PC ↔ Pi ist offen.', hinweise: ['Schaut auf Port und Protokoll von Frame 7.'] },
        { id: 'e5-ws-mittelsmann', frage: 'Fasst zusammen: Welche Rolle spielt der Pi zwischen PC und echtem Server?', optionen: ['Er sitzt als Mittelsmann dazwischen.', 'Er ist nur ein zusätzlicher Switch.', 'Er ersetzt den echten Lohnserver ganz.', 'Er ist am Datenverkehr gar nicht beteiligt.'], richtig: 0, erklaerung: 'Der PC redet mit dem Pi (HTTP, offen), der Pi mit dem echten Server (HTTPS, verschlüsselt). Der Pi steht in der Mitte – ein Man-in-the-Middle auf L7. Genau deshalb merkt Frau Lindner nichts: Sie bekommt am Ende die echten Seiten zu sehen.', hinweise: ['Mit wem redet der PC, mit wem der Pi?'] }
      ]
    },

    {
      id: 'e5-mitm', type: 'lesson', tag: 'TRAINING 3 · DAS GESAMTBILD', titel: 'Drei Fälschungen, ein Mittelsmann',
      html: `
        <p>Jetzt passt alles zusammen. Der Pi hat sich auf <b>drei Schichten</b> zwischen die Nutzer und den echten Lohnserver gedrängt – jede Fälschung hättet ihr einzeln aufgedeckt, zusammen ergeben sie den ganzen Trick:</p>
        <table class="t">
          <tr><th>Schicht</th><th>Fälschung des Pi</th><th>Einsatz</th></tr>
          <tr><td>${L(2)}</td><td>ARP-Spoofing: gibt sich per MAC-Adresse als Lohnserver aus</td><td>Einsatz 2</td></tr>
          <tr><td>${L(3)}</td><td>Rogue-DHCP: teilt sich selbst als Gateway und DNS-Server zu</td><td>Einsatz 3</td></tr>
          <tr><td>${L(7)}</td><td>DNS-Lüge: löst den Namen des Lohnportals auf die eigene Adresse auf</td><td>Einsatz 5</td></tr>
        </table>
        <p>Das Ergebnis: Der Pi steht <b>in der Mitte</b>.</p>
        <div class="kapsel-stage" style="margin:14px 0">${mitmSvg()}</div>
        <p>Und weil die linke Strecke <b>ohne Schloss</b> läuft, ist sie für den Pi vollständig lesbar. Nach rechts, zum echten Server, spricht er selbst sauberes HTTPS und reicht die echten Seiten zurück – deshalb fällt nichts auf.</p>
        <div class="merk"><b>Das Muster heißt Man-in-the-Middle:</b> Jemand setzt sich unbemerkt zwischen zwei Partner und gibt sich gegenüber jedem als der jeweils andere aus. Der einzige verlässliche Schutz für die Nutzerin ist hier das <b>Schloss</b>: Bei echtem HTTPS mit gültigem Zertifikat käme kein Mittelsmann dazwischen, ohne dass der Browser laut warnt.</div>
        <div class="merk"><b>⚠ Für die Praxis:</b> Fehlt bei einer Anmeldeseite das Schloss, gebt dort <b>nichts</b> ein und meldet es der IT-Sicherheit eures Betriebs. Das gilt besonders im Firmennetz und im öffentlichen WLAN.</div>`,
      kalle: 'Der Pi ist der falsche Dolmetscher bei einem Gespräch: Er sagt jeder Seite genau das, was sie hören will – und weiß am Ende alles, was gesagt wurde.'
    },
    {
      id: 'e5-mitm-quiz', type: 'quiz', titel: 'Gesamtbild-Check',
      fragen: [
        { id: 'e5-m-genug', frage: 'Warum reicht schon die DNS-Lüge allein, damit der Browser beim Pi landet?', optionen: ['Der Browser nimmt die IP aus der DNS-Antwort.', 'DNS schaltet die Verschlüsselung ganz ab.', 'DNS ändert die MAC-Adresse des Ziel-Servers.', 'DNS öffnet den Port 80 auf dem PC.'], richtig: 0, erklaerung: 'Wenn der Name zur .66 aufgelöst wird, baut der Browser die Verbindung genau dorthin auf.', hinweise: ['Was macht der Browser mit der Antwort des DNS-Servers?'] },
        { id: 'e5-m-schutz', frage: 'Was hätte Frau Lindner am zuverlässigsten geschützt?', optionen: ['Ein echtes Schloss (HTTPS mit Zertifikat)', 'Ein deutlich längeres, komplizierteres Passwort', 'Ein ganz anderer, moderner Webbrowser', 'Ein Neustart des PCs vor dem Login'], richtig: 0, erklaerung: 'Bei echtem HTTPS hätte der Pi kein gültiges Zertifikat für den Namen vorweisen können – der Browser hätte gewarnt, bevor überhaupt etwas eingegeben wird.', hinweise: ['Was fehlte in der Adresszeile der Fälschung?'] },
        { id: 'e5-m-mitm', frage: 'Wie nennt man die Rolle, die der Pi hier spielt?', optionen: ['Man-in-the-Middle', 'Standardgateway', 'DNS-Cache', 'Load-Balancer'], richtig: 0, erklaerung: 'Man-in-the-Middle: unbemerkt zwischen zwei Partnern, gegenüber jedem als der jeweils andere.', hinweise: ['Der Begriff steht im Merkkasten der Lektion.'] }
      ]
    },

    {
      id: 'e5-kodierung', type: 'lesson', tag: 'TRAINING 4 · L6: DARSTELLUNG', titel: 'Aus Zeichen werden Bytes',
      html: `
        <p>Im Netz reisen nur Bytes – Zahlen von 0 bis 255. Damit aus Text Bytes werden (und beim Empfänger wieder derselbe Text), müssen beide Seiten dieselbe <b>Zeichenkodierung</b> benutzen: eine Tabelle, welches Zeichen zu welcher Zahl gehört. Darum kümmert sich ${L(6)}.</p>
        <h3>ASCII – die Urtabelle</h3>
        <p><b>ASCII</b> ordnet 128 Zeichen je eine Zahl zu: Buchstaben ohne Umlaute, Ziffern, Satzzeichen. Jedes Zeichen passt in <b>1 Byte</b>. Oft schreibt man die Zahl <b>hexadezimal</b> – wie bei MAC-Adressen:</p>
        <table class="t">
          <tr><th>Zeichen</th><th>A</th><th>a</th><th>7</th><th>@</th><th>Leerzeichen</th></tr>
          <tr><td>Zahl (dezimal)</td><td>65</td><td>97</td><td>55</td><td>64</td><td>32</td></tr>
          <tr><td>Zahl (hex)</td><td>41</td><td>61</td><td>37</td><td>40</td><td>20</td></tr>
        </table>
        <h3>UTF-8 – Platz für alle Zeichen der Welt</h3>
        <p>Für ä, ö, ü, ß, €, chinesische Schriftzeichen oder 😀 reicht ASCII nicht. <b>UTF-8</b> ist heute der Standard: Alle ASCII-Zeichen bleiben <b>gleich</b> (1 Byte), alle anderen bekommen <b>2 bis 4 Bytes</b>.</p>
        <table class="t">
          <tr><th>Zeichen</th><th>UTF-8-Bytes (hex)</th><th>Anzahl</th></tr>
          <tr><td>a</td><td>61</td><td>1 Byte</td></tr>
          <tr><td>ü</td><td>C3 BC</td><td>2 Bytes</td></tr>
          <tr><td>€</td><td>E2 82 AC</td><td>3 Bytes</td></tr>
          <tr><td>😀</td><td>F0 9F 98 80</td><td>4 Bytes</td></tr>
        </table>
        <div class="merk"><b>Wenn beide Seiten nicht dasselbe sprechen:</b> Liest ein Programm UTF-8-Bytes mit einer <b>alten Tabelle</b> (die jedes Byte einzeln deutet), wird aus den zwei Bytes von „ü“ plötzlich <b>„Ã¼“</b>. Aus „für“ wird „fÃ¼r“. Das ist kein Virus – nur eine falsch gewählte Kodierung.</div>
        <h3>URL-Kodierung – %XX</h3>
        <p>In Web-Adressen sind manche Zeichen „verboten“, weil sie eine Sonderbedeutung haben (z. B. trennt <code>&amp;</code> Parameter, <code>/</code> Pfadteile). Solche Zeichen werden als <b>%</b> plus Hex-Wert jedes Bytes geschrieben:</p>
        <table class="t">
          <tr><th>Zeichen</th><th>URL-kodiert</th></tr>
          <tr><td>@</td><td>%40</td></tr>
          <tr><td>Leerzeichen</td><td>%20 (oder +)</td></tr>
          <tr><td>ü</td><td>%C3%BC (die zwei UTF-8-Bytes)</td></tr>
        </table>
        <p class="small muted">Beispiel: Sucht man im Webshop nach „Müllerstraße“, steht in der Adresse <code>?suche=M%C3%BCllerstra%C3%9Fe</code> – ü und ß sind URL-kodiert.</p>
        <div class="merk"><b>Kodieren ist nicht Verschlüsseln!</b> Eine Kodierung ist öffentlich – jeder kann sie mit der Tabelle zurückwandeln. Eine <b>Verschlüsselung</b> (z. B. TLS) braucht einen geheimen <b>Schlüssel</b>; ohne ihn bleibt nur Zeichensalat. Beides gehört zu ${L(6)}.</div>`,
      kalle: 'Kodierung ist wie Morsen: Jeder mit der Morsetabelle liest mit. Verschlüsselung ist, wenn ihr vorher mit eurer Partnerin oder eurem Partner eine Geheimsprache ausgemacht habt.'
    },
    {
      id: 'e5-kodierung-quiz', type: 'quiz', titel: 'Bytes lesen',
      fragen: [
        { id: 'e5-k-at', eingabe: 'text', frage: 'In einer Web-Adresse steht <code>kontakt%40fo-logistik.de</code>. Wie lautet das im Klartext? (%40 = Hex 40 = 64)', platzhalter: 'Klartext', richtig: 'kontakt@fo-logistik.de', erklaerung: '%40 ist das Zeichen mit der Zahl 64: das @. Also kontakt@fo-logistik.de.', hinweise: ['Sucht %40 in der Tabelle zur URL-Kodierung.'] },
        { id: 'e5-k-bytes', eingabe: 'zahl', frage: 'Wie viele <b>Bytes</b> braucht das Zeichen ü in UTF-8?', platzhalter: 'Anzahl', richtig: '2', erklaerung: 'Zwei: C3 und BC. Deshalb stehen bei URL-Kodierung auch zwei %-Blöcke (%C3%BC).', hinweise: ['Schaut in die UTF-8-Tabelle.'] },
        { id: 'e5-k-kaputt', frage: 'Eine E-Mail des Portals zeigt: „Abrechnung <b>fÃ¼r</b> September“. Was ist passiert?', optionen: ['UTF-8-Bytes wurden mit falscher Tabelle gelesen.', 'Die Mail wurde unterwegs verschlüsselt.', 'Der Absender hat sich zweimal vertippt.', 'Ein Virus hat die Buchstaben vertauscht.'], richtig: 0, erklaerung: 'Das ü (C3 BC) wurde Byte für Byte als zwei einzelne Zeichen gedeutet: Ã und ¼. Ein klassischer Kodierungsfehler auf L6.', hinweise: ['Lest den Merkkasten zur falschen Tabelle.'] },
        { id: 'e5-k-geheim', frage: 'Ist die URL-Kodierung <code>%C3%BC</code> eine <b>Verschlüsselung</b>?', optionen: ['Nein – jeder kann es zurückwandeln.', 'Ja – nur der Server hat den passenden Schlüssel.', 'Ja – deshalb ist HTTP sicher genug.', 'Nein – es ist eine Komprimierung.'], richtig: 0, erklaerung: 'Nur eine Kodierung: öffentlich, ohne Schlüssel, für jeden umkehrbar. Schützen würde erst eine echte Verschlüsselung wie TLS.', hinweise: ['Lest den letzten Merkkasten der Lektion.'] }
      ]
    },

    {
      id: 'e5-sitzung', type: 'lesson', tag: 'TRAINING 5 · L5: SITZUNG', titel: 'Einmal anmelden, angemeldet bleiben',
      html: `
        <p>HTTP hat kein Gedächtnis: Jede Anfrage steht für sich. Woher weiß das Lohnportal beim nächsten Klick, dass ihr schon angemeldet seid? Dafür sorgt die <b>Sitzung</b> (engl. <i>session</i>) – die Aufgabe von ${L(5)}: Sitzungen <b>aufbauen</b>, <b>verwalten</b> und <b>beenden</b>.</p>
        <table class="t">
          <tr><th>Schritt</th><th>Was passiert</th></tr>
          <tr><td>Anmelden</td><td>Benutzername und Passwort stimmen → der Server legt eine <b>Sitzung</b> an und gibt dem Browser eine zufällige <b>Sitzungs-ID</b> mit.</td></tr>
          <tr><td>Angemeldet bleiben</td><td>Der Browser schickt diese Sitzungs-ID bei jeder weiteren Anfrage mit. So erkennt der Server: „Das ist dieselbe Sitzung, schon angemeldet.“</td></tr>
          <tr><td>Abmelden</td><td>Der Server macht die Sitzungs-ID ungültig. Ab jetzt gilt sie nicht mehr.</td></tr>
          <tr><td>Zeitüberschreitung</td><td>Passiert eine Weile nichts, läuft die Sitzung von selbst ab – man muss sich neu anmelden.</td></tr>
        </table>
        <p>Die Sitzungs-ID wird meist in einem <b>Cookie</b> gespeichert – einer kleinen Notiz, die der Browser für eine Website behält und wieder mitschickt.</p>
        <div class="merk"><b>Warum das für die Ermittlung wichtig ist:</b> Eine gültige Sitzungs-ID ist so viel wert wie das Passwort selbst – wer sie hat, gilt für den Server als angemeldet. Darum werden Sitzungen möglichst über HTTPS geschützt. War ein Konto einer Fälschung ausgesetzt, hilft nur eines: <b>Passwort ändern und alle Sitzungen beenden</b>, damit alte IDs nichts mehr wert sind.</div>`,
      kalle: 'Die Sitzungs-ID ist das Bändchen am Handgelenk auf dem Festival: einmal am Eingang bekommen, und du darfst immer wieder rein, ohne erneut das Ticket zu zeigen. Deshalb würdest du es auch niemandem leihen.'
    },
    {
      id: 'e5-sitzung-quiz', type: 'quiz', titel: 'Sitzungs-Check',
      fragen: [
        { id: 'e5-s-warum', frage: 'Warum braucht ein Portal überhaupt eine Sitzungs-ID?', optionen: ['Weil HTTP sich nichts merkt', 'Weil IP-Adressen sich dauernd ändern', 'Weil UDP keine Reihenfolge garantiert', 'Weil DNS die Anmeldung nicht kennt'], richtig: 0, erklaerung: 'HTTP ist „vergesslich“: Jede Anfrage steht für sich. Die Sitzungs-ID verbindet die Anfragen zu einer angemeldeten Sitzung.', hinweise: ['Was sagt die Lektion über das Gedächtnis von HTTP?'] },
        { id: 'e5-s-wert', frage: 'Warum ist eine gültige Sitzungs-ID so schützenswert?', optionen: ['Wer sie hat, gilt als angemeldet.', 'Sie enthält das Passwort im Klartext.', 'Ohne sie startet der PC nicht.', 'Sie ersetzt die IP-Adresse des PCs.'], richtig: 0, erklaerung: 'Der Server erkennt die Sitzung allein an der ID – nicht mehr am Passwort. Deshalb ist sie so viel wert wie ein Schlüssel.', hinweise: ['Was passiert, wenn jemand anderes dieselbe ID mitschickt?'] },
        { id: 'e5-s-abwehr', frage: 'Herr Brandt will die Konten der Betroffenen absichern. Was hilft <b>sofort</b>?', optionen: ['Passwörter ändern, Sitzungen beenden', 'Alle betroffenen PCs sofort neu starten', 'Den zentralen Switch komplett austauschen', 'Die Bildschirmhelligkeit erhöhen'], richtig: 0, erklaerung: 'Neues Passwort und beendete Sitzungen machen alte Zugangsdaten und alte Sitzungs-IDs wertlos. Und natürlich muss der Pi weg und der echte DNS- und DHCP-Dienst wiederhergestellt werden.', hinweise: ['Was macht alte Sitzungs-IDs ungültig?'] }
      ]
    },

    {
      id: 'e5-beweise', type: 'sort', titel: 'Beweise nach Schichten', punkte: 8,
      intro: '<p>Die letzten Beweisstücke für die Akte – ordnet jedes der Schicht zu, um die es geht.</p>',
      bins: [7, 6, 5, 3, 2].map(n => ({ id: n, kurz: 'L' + n, farbe: n, label: OSI.handbuch.find(h => h.n === n).name })),
      items: [
        { id: 'e5-bw-dns', text: 'Der Pi löst lohn.fo-logistik.intern auf die .66 auf', ziel: 7, erklaerung: 'DNS ist ein Anwendungsdienst → L7.', hinweis: 'Welcher Dienst übersetzt Namen?' },
        { id: 'e5-bw-http', text: 'Die gefälschte Seite kommt über HTTP, ohne Schloss', ziel: 7, erklaerung: 'HTTP ist ein Anwendungsprotokoll → L7.', hinweis: 'Womit holt der Browser Webseiten?' },
        { id: 'e5-bw-tls', text: 'Zum echten Server ist alles mit TLS verschlüsselt', ziel: [6, 5], erklaerung: 'Verschlüsselung = Umwandeln der Darstellung → L6. Weil TLS auch eine gesicherte Sitzung aufbaut, ordnen manche Bücher es L5 zu – beides zählt hier als richtig.', hinweis: 'Welche Schicht wandelt Daten um?' },
        { id: 'e5-bw-utf', text: 'Umlaut ü erscheint als „Ã¼“ (falsche Kodierung)', ziel: 6, erklaerung: 'Zeichenkodierung → L6.', hinweis: 'Zeichen zu Bytes gehört zu welcher Schicht?' },
        { id: 'e5-bw-sid', text: 'Sitzungs-ID hält den Nutzer nach dem Login angemeldet', ziel: 5, erklaerung: 'Sitzungen verwalten → L5.', hinweis: 'Das Wort steckt im Namen der Schicht.' },
        { id: 'e5-bw-name', text: 'DNS-Dienst des Pi nennt sich LEON-NB', ziel: 7, erklaerung: 'Auch ein Name im DNS gehört zur Anwendungsschicht → L7.', hinweis: 'In welchem Dienst steht dieser Name?' },
        { id: 'e5-bw-arp', text: 'ARP-Cache: .20 zeigt auf die MAC des Pi', ziel: 2, erklaerung: 'MAC-Adresse → L2.', hinweis: 'Welche Adresse ist hier gefälscht?' },
        { id: 'e5-bw-gw', text: 'Standardgateway der Versand-PCs ist die .66', ziel: 3, erklaerung: 'Gateway = IP-Adresse → L3.', hinweis: 'Das Gateway ist eine IP-Adresse.' }
      ]
    },

    {
      id: 'e5-cliffhanger', type: 'story', titel: 'Der Pi in der Tüte', bild: 'e5_beweis.jpg', board: true,
      szenen: [
        { wer: 'kalle', text: 'Damit ist das Bild komplett: Der Pi fälscht auf L2 die MAC, auf L3 das Gateway und den DNS-Server, auf L7 die Namensauflösung – und liefert die Anmeldeseite ohne Schloss aus. Ein Mittelsmann auf ganzer Linie.' },
        { wer: 'brandt', text: 'Ich habe den DNS- und DHCP-Dienst wieder auf SRV-DC01 gezogen, alle Passwörter zurückgesetzt und die Sitzungen beendet. Und ich habe – im Beisein der Einheit 7 – den Pi vom Switch getrennt und in eine Beweismitteltüte gelegt.' },
        { wer: 'direktorin', text: 'Sehr gut. Jetzt haben wir alles: das Gerät, die Mitschnitte, die Zeitspur, den Tunnel nach draußen. Drei Namen stehen noch am Board – Berger, Demir, Seidel. Zeit, die Beweiskette zu ordnen und zu entscheiden, wer es war.' },
        { wer: 'direktorin', text: 'Im <b>Finale</b> tragen wir alles zusammen und stellen die Anklage, Agentinnen und Agenten. Haltet eure Akten bereit.' },
        { wer: 'system', text: '▶ Akte „Finale – Die Anklage“ wird vorbereitet …' }
      ]
    },
    {
      id: 'e5-aussen', type: 'aussen', bonus: true, titel: 'Außeneinsatz: Name gegen Adresse',
      inhalt: `<p>Frau Lindner hat <code>lohn.fo-logistik.intern</code> richtig eingetippt und ist trotzdem beim Pi gelandet. Herr Brandt will genau sehen, wie das abläuft. Kalle hat dafür in seinem Labor nachgebaut: Frau Lindners PC mit dem DNS-Server .66, SRV-DC01 mit dem richtigen Eintrag, SRV-LOHN, der wie das echte Portal nur <b>HTTPS</b> anbietet, und den Pi mit seinem DNS-Dienst und einer Webseite über <b>HTTP</b>. Ihr verfolgt, was vor dem Laden der Seite passiert, und stellt den PC danach so ein, wie Herr Brandt es im Fall getan hat.</p>
        <div class="btnrow" style="margin-bottom:10px"><a class="btn" href="aussen/E5_Name-gegen-Adresse.pkt" download>⬇ Simulationsnetz herunterladen (Packet Tracer)</a></div>
        <div class="merk"><b>Befehle:</b> Welche Befehle ihr braucht, schlagt ihr in der <b>Befehlsreferenz</b> im 📘 Handbuch nach (oben in der Leiste).</div>
        <div class="merk"><b>Flags lesen:</b> Packet Tracer zeigt die TCP-Flags in den PDU-Details als Binärzahl, z. B. <code>FLAGS:0b00000010</code>. Jedes der acht Bits ist ein Schalter:
          <table class="t" style="margin-top:6px">
            <tr><th>Bit</th><td>7</td><td>6</td><td>5</td><td>4</td><td>3</td><td>2</td><td>1</td><td>0</td></tr>
            <tr><th>Flag</th><td>CWR</td><td>ECE</td><td>URG</td><td>ACK</td><td>PSH</td><td>RST</td><td>SYN</td><td>FIN</td></tr>
          </table>
          Beispiel: <code>0b00000010</code> – nur Bit 1 steht auf 1, also ist nur <b>SYN</b> gesetzt. Zur Gegenprobe beschreibt der Reiter <b>OSI Model</b> auf Layer 4 in Worten, welche Flags gesetzt sind.</div>
        <div class="merk"><b>Kalles Laborhinweis:</b> Ein paar Dinge sind in meinem Labor anders als bei F&amp;O:
          <ul>
            <li>Der Pi ist nicht der echte, sondern <b>mein Nachbau</b>. Wie ich ihn eingerichtet habe, dürft ihr euch ansehen. Ermittelt wird aber von außen, an PC-VERSAND-02: Alle Fragen beantwortet ihr dort.</li>
            <li>Der Browser zeigt <b>kein Schloss</b>, auch nicht bei HTTPS. Verlasst euch auf <code>http://</code> und <code>https://</code> und auf den Port.</li>
            <li>Packet Tracer merkt sich DNS-Antworten nicht und fragt jedes Mal neu. Ein echter PC hebt sie eine Weile auf. Dort wirkt das Umstellen auf einen anderen DNS-Server erst, wenn dieser Speicher geleert ist (<code>ipconfig /flushdns</code>).</li>
          </ul></div>
        <h3>Euer Auftrag</h3>
        <ol>
          <li><b>Vorbereitung:</b> Öffnet das Simulationsnetz in <b>Cisco Packet Tracer</b> und spult die Zeit vor (<b>Fast Forward Time</b>), bis alle Leitungen grün sind.</li>
          <li><b>Wie Frau Lindner:</b> Schaltet auf <b>Simulation</b> um und stellt die Filter so ein, dass nur <b>DNS</b>, <b>TCP</b>, <b>HTTP</b> und <b>HTTPS</b> angezeigt werden. Ruft auf <b>PC-VERSAND-02</b> im <b>Web Browser</b> <code>http://lohn.fo-logistik.intern</code> auf. Verfolgt mit <b>Capture/Forward</b> Schritt für Schritt, wer was an wen schickt, bis die Seite geladen ist. Öffnet die PDUs und schaut auf Adressen und Ports.</li>
          <li><b>Mit Schloss versucht:</b> Ruft <code>https://lohn.fo-logistik.intern</code> auf. Was kommt auf das SYN zurück?</li>
          <li><b>Wie Herr Brandt:</b> Tragt an PC-VERSAND-02 den offiziellen DNS-Server <b>SRV-DC01</b> (192.168.50.10) ein. Ruft dann erst <code>http://</code> und danach <code>https://lohn.fo-logistik.intern</code> auf. Wer antwortet jetzt?</li>
          <li><b>Gegenprobe:</b> Fragt in der Eingabeaufforderung den eingestellten DNS-Server nach <code>lohn.fo-logistik.intern</code> und danach gezielt den Pi. Dann beantwortet die Fragen unten.</li>
        </ol>`,
      abschluss: `<div class="profi"><b>🕵️ Profi-Tipp – Wer den DNS-Server stellt, sieht mit:</b> Jeder Name, den euer Gerät auflöst, landet beim eingestellten DNS-Server. Der weiß also, welche Seiten ihr wann aufruft – im Fall hat der Pi genau das ausgenutzt. Zu Hause ist das meist der DNS-Server des Internetanbieters. Manche stellen auf öffentliche DNS-Server um, etwa <code>1.1.1.1</code> (Cloudflare) oder <code>8.8.8.8</code> (Google). Dann sieht der Internetanbieter die Namen nicht mehr, dafür aber der neue Anbieter. Bei Proxys und VPNs ist es genauso: Die Daten werden nicht weniger, sie gehen nur an jemand anderen. Deshalb nur Anbieter nutzen, denen ihr vertraut. Im Betrieb legt die IT fest, welcher DNS-Server gilt.</div>`,
      fragen: [
        { id: 'e5-pt-zuerst', frage: 'Ihr ruft <code>http://lohn.fo-logistik.intern</code> auf. Welches Protokoll zeigt die Ereignisliste <b>als Erstes</b>?', optionen: ['DNS', 'TCP', 'HTTP', 'HTTPS'], fest: true, richtig: 0, erklaerung: 'DNS. Der PC kennt nur den Namen, verbinden kann er sich aber nur mit einer IP-Adresse. Erst wenn die Antwort da ist, folgen Handshake und HTTP-Anfrage.', hinweise: ['Was braucht der PC, bevor er ein SYN an den Server schicken kann?'] },
        { id: 'e5-pt-dnsziel', eingabe: 'ip', frage: 'An welche <b>IP-Adresse</b> schickt PC-VERSAND-02 seine DNS-Anfrage?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'An die .66 – den Pi. Der PC fragt immer den DNS-Server, der in seiner IP-Konfiguration steht.', hinweise: ['Öffnet die DNS-Anfrage und sucht im Abschnitt IP die Zieladresse.'] },
        { id: 'e5-pt-antwort', eingabe: 'ip', frage: 'Welche IP-Adresse nennt die <b>DNS-Antwort</b> für lohn.fo-logistik.intern?', platzhalter: 'IP-Adresse', richtig: '192.168.50.66', erklaerung: 'Wieder die .66: Der Pi nennt als Adresse des Lohnportals sich selbst. Wer gefragt wird und was er antwortet, sind zwei verschiedene Dinge – hier ist beides der Pi.', hinweise: ['Öffnet die DNS-Antwort, die zum PC zurückläuft, und sucht im Abschnitt DNS die Adresse.'] },
        { id: 'e5-pt-syn', eingabe: 'text', frage: 'Direkt nach der DNS-Antwort schickt der PC ein SYN. An welchen <b>Socket</b> geht es? Schreibt ihn mit Doppelpunkt.', platzhalter: 'IP-Adresse:Port', richtig: '192.168.50.66:80', erklaerung: '192.168.50.66:80. Der Browser verbindet sich blind mit der Adresse aus der DNS-Antwort, und auf dem Pi hebt der Webserver an Port 80 ab.', hinweise: ['Die IP-Adresse steht im Abschnitt IP, der Port im Abschnitt TCP.'] },
        { id: 'e5-pt-https', multi: true, frage: 'Ihr ruft mit DNS-Server .66 <code>https://lohn.fo-logistik.intern</code> auf. Welche Flags setzt das Gerät in seiner <b>Antwort</b> auf das SYN?', optionen: ['SYN', 'ACK', 'RST', 'FIN', 'PSH'], fest: true, richtig: [1, 2], erklaerung: 'RST und ACK: Auf dem Pi lauscht an Port 443 nichts. Für HTTPS bräuchte er ein Zertifikat für lohn.fo-logistik.intern – und das hat er nicht. Deshalb liefert er die Fälschung nur über HTTP aus.', hinweise: ['Lest die Flags der Antwort mit der Flag-Tafel ab.', 'Welche Bits stehen in <code>0b00010100</code> auf 1?'] },
        { id: 'e5-pt-geheilt', frage: 'Der PC fragt jetzt SRV-DC01. Ihr ruft <code>http://lohn.fo-logistik.intern</code> auf. Welches Gerät schickt das <b>RST, ACK</b>?', optionen: ['SRV-LOHN', 'Fremdgerät (Pi)', 'SRV-DC01', 'PC-VERSAND-02'], richtig: 0, erklaerung: 'SRV-LOHN. Der offizielle DNS-Server nennt die .20, also geht das SYN an das echte Portal – und das bietet wie in Einsatz 4 kein HTTP an. Mit <code>https://</code> kommt die Seite.', hinweise: ['Welche IP-Adresse nennt SRV-DC01 für den Namen, und welches Gerät hat sie?'] },
        { id: 'e5-pt-adresszeile', frage: 'Die Seite vom Pi und die vom echten Portal sehen gleich aus. Woran hätte Frau Lindner in der Adresszeile erkennen können, dass etwas nicht stimmt?', optionen: ['Am http:// statt https://', 'Am Namen in der Adresszeile', 'An der Schriftart der Seite', 'Am Titel der Seite im Tab'], richtig: 0, erklaerung: 'Der Name ist bei beiden gleich – den hat sie ja selbst eingetippt. Inhalt, Titel und Schrift lassen sich kopieren. Verräterisch ist nur, dass die Seite über HTTP kommt, ohne Schloss. Das echte Portal antwortet nur über HTTPS.', hinweise: ['Was unterscheidet die beiden Aufrufe, die eine Seite geliefert haben?'] },
        { id: 'e5-pt-beleg', frage: 'Was <b>belegt</b> Kalles Laborversuch für den Fall?', optionen: ['Dass das Ziel aus der DNS-Antwort kommt', 'Wer den falschen Eintrag angelegt hat', 'Dass Frau Lindner ihr Passwort eingab', 'Seit wann der Pi falsch geantwortet hat'], richtig: 0, erklaerung: 'Der Nachbau zeigt, wie Namensauflösung und Verbindung zusammenhängen: Der Browser geht dorthin, wohin die DNS-Antwort zeigt. Wer den Eintrag gesetzt hat und wann, kann ein Labor nicht zeigen – dafür braucht es Spuren aus dem Fall.', hinweise: ['Ein Nachbau im Labor – was kann er über Personen und Uhrzeiten im Fall verraten?'] }
      ]
    },
    {
      id: 'e5-ende', type: 'ende', titel: 'Fälschung entlarvt – L5 bis L7!', abzeichen: 'e5-fertig', abzeichenOhneTipp: 'e5-ohne-tipp',
      text: '<p>Ihr habt die DNS-Lüge nachgewiesen, das fehlende Schloss als Warnsignal erkannt und den Pi als Mittelsmann über alle Schichten hinweg entlarvt. Damit ist die Spurensuche komplett – im <b>Finale</b> stellt ihr die Anklage.</p>'
    }
  ];
})();
