/* Abschlussverhör – Diagnose pro Kürzel, keine Punkte. IDs NIE ändern (stecken in save.verhoer).
   Transferfragen: andere Firma, andere Adressen als im Fall. Je zwei pro Bereich, Reihenfolge bewusst gemischt.
   Nur Stoff, der im Spiel vermittelt wurde oder laut Mindestanforderungen vorausgesetzt ist. */
(function () {
  const OSI = window.OSI;
  const E = OSI.einsaetze.find(e => e.id === 'verhoer');
  const pre = t => `<div class="evidence"><pre style="margin:0;white-space:pre-wrap;font-family:var(--mono)">${t}</pre></div>`;

  E.steps = [
    {
      id: 'v-intro', type: 'story', titel: 'Einzeln, bitte', bild: 'verhoer.jpg',
      szenen: [
        { wer: 'system', text: '▶ Einheit 7 · Verhörraum 2 · Abschlussgespräch' },
        { wer: 'direktorin', text: 'Bevor ich die Akte „Lohnzettel“ schließe, spreche ich mit jeder Agentin und jedem Agenten <b>einzeln</b>. Kein Duo, kein Kalle, keine Punkte.' },
        { wer: 'direktorin', text: 'Das ist keine Prüfung. Ich will wissen, wo die Einheit sicher ist – und wo wir nachschulen müssen. Deshalb: ehrlich antworten und nicht abschreiben. Wenn Sie etwas nicht wissen, sagen Sie „Weiß ich nicht“ – das hilft mir mehr als geraten. Wer schummelt, belügt nur sich selbst.' },
        { wer: 'kalle', text: 'Ich darf diesmal nicht helfen. Ich sitze hinter dem Spiegel und trinke Kaffee. Viel Erfolg!' }
      ]
    },
    {
      id: 'v-verhoer', type: 'verhoer', titel: 'Das Abschlussverhör',
      intro: `<p>Jede Person eures Duos wird <b>einzeln</b> verhört: zwölf Fragen quer durch alle Schichten, <b>ein Versuch</b> pro Frage, keine Tipps, keine Punkte. Die Lösung seht ihr jeweils nach dem Absenden. Wer etwas nicht weiß, klickt <b>„Weiß ich nicht“</b> statt zu raten.</p>
        <div class="merk"><b>So geht's:</b> Die andere Person dreht sich weg oder setzt sich woanders hin. Wer fertig ist, gibt das Gerät weiter. Am Ende wartet die Abschlussbesprechung – danach exportiert ihr den Spielstand und gebt ihn bei eurer Lehrkraft ab.</div>`,
      verhoerFragen: [
        { id: 'v-subnetz', bereich: 'L3', frage: 'Ein PC hat die IP-Adresse <code>10.0.5.20</code> mit der Maske <code>255.255.255.0</code>. Er schickt ein Paket an <code>10.0.6.7</code>. An welche MAC-Adresse adressiert er den Frame?', optionen: ['An die MAC seines Standardgateways', 'An die MAC von 10.0.6.7', 'An die Broadcast-MAC ff:ff:ff:ff:ff:ff', 'An die MAC seines DNS-Servers'], richtig: 0, erklaerung: '10.0.6.7 liegt in einem anderen Netz (10.0.6.0/24 statt 10.0.5.0/24). Also geht der Frame an das Gateway – die Ziel-IP im Paket bleibt 10.0.6.7.' },
        { id: 'v-medium', bereich: 'L1', ticketNr: 'Ticket #2210 · Vertrieb', ticket: '„Seit wir die Schreibtische umgestellt haben, geht bei mir gar nichts mehr. Die kleine Lampe an der Netzwerkbuchse ist aus, und <code>ipconfig</code> sagt: Medienstatus – Medium getrennt.“', layer: true, frage: 'Auf welcher Schicht liegt das Problem?', richtig: 1, erklaerung: 'Keine Link-LED, „Medium getrennt“: Es kommt kein Signal an – Kabel, Stecker oder Buchse. Das ist L1.' },
        { id: 'v-nslookup', bereich: 'L5–7', kontext: pre(`C:\\> nslookup intranet.musterbau.local
Server:  dns1.musterbau.local
Address:  10.1.1.10

Name:    intranet.musterbau.local
Address:  10.1.1.80

C:\\> nslookup intranet.musterbau.local 10.1.1.53
Server:  UnKnown
Address:  10.1.1.53

Name:    intranet.musterbau.local
Address:  10.1.1.99`), frage: 'Was ist durch diese beiden Ausgaben <b>belegt</b>?', optionen: ['Zwei DNS-Server antworten unterschiedlich.', 'Der DNS-Server 10.1.1.53 ist eine Fälschung.', 'Der Webserver hat zwei Netzwerkkarten.', 'Der PC hat eine falsche Subnetzmaske.'], richtig: 0, erklaerung: 'Belegt ist nur: Für denselben Namen nennen zwei DNS-Server verschiedene Adressen. Welcher stimmt – oder ob es einen harmlosen Grund gibt –, muss man erst prüfen.' },
        { id: 'v-oui', bereich: 'L2', kontext: pre(`▾ Ethernet II
    Destination: 00:15:5d:0a:32:10
    Source: 3c:52:82:1a:4f:90
    Type: IPv4 (0x0800)
▸ Internet Protocol Version 4, Src: 10.1.1.42, Dst: 10.1.1.10`), eingabe: 'mac', platzhalter: 'drei Bytes, z. B. aa:bb:cc', frage: 'An welchen <b>drei Bytes</b> lässt sich der Hersteller der Netzwerkkarte des <b>Absenders</b> erkennen?', richtig: '3c:52:82', erklaerung: 'Die ersten drei Bytes der Quell-MAC (Source) sind die Herstellerkennung (OUI): 3c:52:82.' },
        { id: 'v-pdu', bereich: 'Modell', eingabe: 'text', platzhalter: 'Fachbegriff', frage: 'Wie heißt die Dateneinheit (PDU) auf <b>L3</b>?', richtig: ['Paket', 'Pakete', 'Packet', 'IP-Paket'], erklaerung: 'L3: Paket. Zur Erinnerung: L1 Bits, L2 Frame, L3 Paket, L4 Segment (TCP) bzw. Datagramm (UDP).' },
        { id: 'v-rst', bereich: 'L4', frage: 'Ein Client schickt ein TCP-Segment mit SYN an Port 443 eines Servers. Zurück kommt ein Segment mit <b>RST, ACK</b>. Was folgt daraus?', optionen: ['Auf TCP-Port 443 lauscht kein Dienst.', 'Die TCP-Verbindung ist jetzt aufgebaut.', 'Der Server ist im Netz nicht erreichbar.', 'Auf UDP-Port 443 lauscht auch kein Dienst.'], richtig: 0, erklaerung: 'Der Server ist erreichbar – er hat ja geantwortet. Mit RST lehnt er die Verbindung ab: Auf <b>TCP</b>-Port 443 lauscht kein Dienst. Über <b>UDP</b>-Port 443 sagt das nichts – TCP und UDP haben getrennte Ports, UDP muss man gesondert prüfen. Ein offener TCP-Port hätte mit SYN, ACK geantwortet.' },
        { id: 'v-hub', bereich: 'L1', frage: 'Was macht ein <b>Hub</b> mit einem Signal, das an einem seiner Ports ankommt?', optionen: ['Er gibt es an alle anderen Ports weiter.', 'Er schickt es nur zum Port der Ziel-MAC.', 'Er leitet es an den Router weiter.', 'Er verwirft es, wenn es fehlerhaft ist.'], richtig: 0, erklaerung: 'Ein Hub liest keine Adressen. Er verstärkt das Signal und gibt es an alle anderen Ports weiter – ein L1-Gerät.' },
        { id: 'v-kodierung', bereich: 'L5–7', ticketNr: 'Ticket #2231 · Kundenservice', ticket: '„Im Kundenportal steht nach dem Speichern: <b>Ã„nderung gespeichert</b>. Gemeint ist wohl „Änderung gespeichert“.“', layer: true, frage: 'Auf welcher Schicht liegt dieser Fehler?', richtig: 6, erklaerung: 'Die Bytes für „Ä“ in UTF-8 wurden mit einer anderen Zeichentabelle gelesen – ein Kodierungsfehler auf L6.' },
        { id: 'v-tracert', bereich: 'L3', kontext: pre(`C:\\> tracert -d 203.0.113.10

Routenverfolgung zu 203.0.113.10 über maximal 30 Hops

  1    &lt;1 ms    &lt;1 ms    &lt;1 ms  172.16.4.1
  2     6 ms     5 ms     6 ms  10.20.0.1
  3    14 ms    13 ms    14 ms  203.0.113.10

Ablaufverfolgung beendet.`), eingabe: 'zahl', platzhalter: 'Anzahl', frage: 'Über wie viele <b>Router</b> führt der Weg bis zum Ziel?', richtig: '2', erklaerung: 'Zwei: 172.16.4.1 (das Gateway) und 10.20.0.1. Die dritte Zeile ist schon das Ziel selbst.' },
        { id: 'v-kapselung', bereich: 'Modell', frage: 'Ein PC schickt eine Anfrage an einen Webserver. In welcher Reihenfolge kommen beim <b>Absenden</b> die Header dazu?', optionen: ['TCP → IP → Ethernet (Header und Trailer)', 'IP → TCP → Ethernet (Header und Trailer)', 'Ethernet (Header und Trailer) → IP → TCP', 'TCP → Ethernet (Header und Trailer) → IP'], richtig: 0, erklaerung: 'Von oben nach unten: Erst kommt der TCP-Header (L4) um die Daten, dann der IP-Header (L3), zuletzt Ethernet-Header und -Trailer (L2). Beim Empfänger wird in umgekehrter Reihenfolge ausgepackt.' },
        { id: 'v-switch', bereich: 'L2', frage: 'Ein Switch bekommt einen Frame an eine Ziel-MAC, die <b>nicht</b> in seiner MAC-Adresstabelle steht. Was macht er?', optionen: ['Er schickt ihn an alle Ports außer dem Eingang.', 'Er verwirft den Frame ohne Rückmeldung.', 'Er fragt per ARP nach der passenden MAC.', 'Er schickt den Frame an das Standardgateway.'], richtig: 0, erklaerung: 'Unbekannte Ziel-MAC → fluten: an alle Ports außer dem, über den der Frame kam. Antwortet das Ziel, lernt der Switch seine MAC über die Quell-MAC.' },
        { id: 'v-port', bereich: 'L4', kontext: pre(`Nr.  Quelle               Ziel              Prot.  Info
 17  192.168.1.20:51734   192.168.1.5:53    UDP    Länge 74`), eingabe: 'text', platzhalter: 'Name des Dienstes', frage: 'Welcher Dienst läuft vermutlich auf <b>192.168.1.5</b>?', richtig: ['DNS', 'Domain Name System', 'DNS-Server', 'Namensauflösung'], erklaerung: 'Ziel-Port 53 ist der well-known Port von DNS. 51734 ist ein zufälliger Client-Port aus dem dynamischen Bereich – „vermutlich“, weil ein Dienst auch auf einem anderen Port laufen kann.' }
      ]
    },
    {
      id: 'v-ende', type: 'urkunde', titel: 'Akte geschlossen', bild: 'abschluss.jpg', abzeichen: 'verhoer-fertig',
      szenen: [
        { wer: 'direktorin', text: 'Agentinnen und Agenten, die Akte „Operation Lohnzettel“ ist geschlossen. Sie haben ein fremdes Gerät gefunden, drei Fälschungen auf drei Schichten entlarvt, drei Verdächtige entlastet und den Täter überführt. Sechs Gehälter sind gerettet. Ich bin stolz auf diese Einheit.' },
        { wer: 'brandt', text: 'Und F&amp;O hat dazugelernt: Externe werden begleitet, und die gesperrten Akten stehen ganz oben auf meiner Liste. Danke, dass Sie nicht beim ersten Verdacht stehen geblieben sind.' },
        { wer: 'kalle', text: 'Sieben Schichten, ein Täter, null Ausreden. Ihr wart super – der Kaffee geht heute auf mich. Ausnahmsweise.' }
      ]
    }
  ];
})();
