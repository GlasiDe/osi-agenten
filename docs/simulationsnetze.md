# Simulationsnetze der Außeneinsätze

Technische Beschreibung der Packet-Tracer-Dateien in `spiel/aussen/`, damit Aufträge und Fragen ohne Öffnen der `.pkt` geschrieben und geprüft werden können. Didaktische Ziele der Außeneinsätze stehen in `DESIGN.md`. Ändert sich eine `.pkt`, wird diese Datei mit angepasst.

Cisco-Geräte (Router, Switches) stehen hier mit ihrer **vollständigen CLI-Befehlsfolge**, die sich in ein frisches Gerät einfügen (CLI) oder 1:1 nachtippen lässt. So lässt sich ein Netz nach Fehlern oder nach einem Packet-Tracer-Update nachbauen, statt es neu zu erfinden. Geräte ohne CLI (PCs, Server-PT) stehen als Einstellungen in der Oberfläche.

## `E1_Wer-hoert-mit.pkt` (Außeneinsätze E1 und E2)

Zwei getrennte Netze ohne Verbindung untereinander, alle PCs mit fester IP in 192.168.0.0/24.

| Gerät | IP-Adresse | MAC-Adresse | Anschluss |
|---|---|---|---|
| PC-1 | 192.168.0.11 | `0060.2fce.c539` | Switch Fa0/1 |
| PC-2 | 192.168.0.12 | `0030.f27b.29a1` | Switch Fa0/2 |
| PC-3 | 192.168.0.13 | | Switch Fa0/3 |
| PC-4 | 192.168.0.14 | | Switch Fa0/4 |
| PC-5 | 192.168.0.15 | | Hub Fa0 |
| PC-6 | 192.168.0.16 | | Hub Fa1 |
| PC-7 | 192.168.0.17 | | Hub Fa2 |
| PC-8 | 192.168.0.18 | | Hub Fa3 |

- Switch: Cisco 2960-24TT, ohne Konfiguration, MAC-Adresstabelle nach dem Öffnen leer.
- Hub: Hub-PT.
- Verbindung der PCs zu Switch/Hub mit Copper Straight-Through-Kabeln
- Konsolenkabel: nicht gesteckt; in E2 stecken die Lernenden es selbst (PC-4 RS 232 → Switch Console).

## `E3_Zwei-Server-ein-Discover.pkt` (Außeneinsatz E3)

Nachbildung des F&O-Netzes („Kalles Labor“) in 192.168.50.0/24, Ports wie im Patchplan von SW-SERVER-01 (E1). Der Pi wird von einem Cisco-Router gespielt, weil er DHCP verteilen **und** weiterleiten muss (Extra-Hop in `tracert`). Beim Speichern ist der Pi **ausgeschaltet**.

| Gerät | Typ | IP-Adresse | Gateway | Anschluss |
|---|---|---|---|---|
| RT-FO | Cisco 1941 | G0/0 192.168.50.1, G0/1 1.1.1.254 | – | G0/0 → SW Fa0/24, G0/1 → SRV-INTERNET |
| SRV-INTERNET | Server-PT | 1.1.1.1 (statisch) | 1.1.1.254 | RT-FO G0/1 |
| SW-SERVER-01 | Cisco 2960-24TT | – | – | – |
| SRV-DC01 | Server-PT, DHCP an | 192.168.50.10 (statisch) | 192.168.50.1 | Fa0/1 |
| PC-VERSAND-01 | PC-PT | DHCP | DHCP | Fa0/11 |
| PC-VERSAND-02 | PC-PT | DHCP | DHCP | Fa0/12 |
| Fremdgerät (Pi) | Cisco 1941, gesperrt, eigenes Icon | G0/0 192.168.50.66 | Standardroute → .1 | Fa0/23 |

- Alle Verbindungen Copper Straight-Through, außer RT-FO G0/1 ↔ SRV-INTERNET (Copper Cross-Over; Packet Tracer akzeptiert meist auch Straight-Through).
- Getrennte DHCP-Bereiche, damit keine doppelten Adressen entstehen: SRV-DC01 .100–.149, Pi .150–.199. Die Adressen der PCs hängen von der Startreihenfolge ab und werden nicht abgefragt.
- Zugang zum Pi (bewusst nur eine Hürde, keine Geheimhaltung): Konsole und `enable` jeweils Passwort `forensik`.
- Icon des Pi (logisch und physisch): `quellbilder/pt-einplatinenrechner_128.png`, selbst gezeichnet (Quelle `pt-einplatinenrechner.svg`). Packet Tracer bettet es in die `.pkt` ein.

### SRV-DC01 (Oberfläche)
- Desktop → IP Configuration: Static, 192.168.50.10 / 255.255.255.0, Gateway 192.168.50.1, DNS 192.168.50.10
- Services → DHCP: Service **On**, Pool `serverPool`: Default Gateway 192.168.50.1, DNS Server 192.168.50.10, Start IP 192.168.50.100, Subnet Mask 255.255.255.0, Maximum Number of Users 50 → **Save**
- Eine Leasedauer lässt sich in Server-PT nicht einstellen.

### SRV-INTERNET (Oberfläche)
- Desktop → IP Configuration: Static, 1.1.1.1 / 255.255.255.0, Gateway 1.1.1.254
- Services → DHCP: **Off**

### PCs (Oberfläche)
- Desktop → IP Configuration: **DHCP**. Anzeigename = Hostname (PC-VERSAND-01 usw.)

### RT-FO (CLI)
```
enable
configure terminal
hostname RT-FO
no ip domain-lookup
interface GigabitEthernet0/0
 description LAN F&O (SW-SERVER-01 Fa0/24)
 ip address 192.168.50.1 255.255.255.0
 no shutdown
 exit
interface GigabitEthernet0/1
 description Internet (SRV-INTERNET)
 ip address 1.1.1.254 255.255.255.0
 no shutdown
 exit
end
copy running-config startup-config
```

### SW-SERVER-01 (CLI)
Nur Name und Portbeschreibungen wie im Patchplan, sonst Werkszustand.
```
enable
configure terminal
hostname SW-SERVER-01
interface FastEthernet0/1
 description Server SRV-DC01 (DNS/DHCP)
 exit
interface FastEthernet0/11
 description Dose V-301 Versand
 exit
interface FastEthernet0/12
 description Dose V-302 Versand
 exit
interface FastEthernet0/24
 description Uplink Router/Firewall
 exit
end
copy running-config startup-config
```

### Fremdgerät (Pi) (CLI)
Packet Tracer kennt `no ip redirects`, `lease` und `ip dhcp ping packets` nicht, Option 51 lässt sich auch nicht über `option` setzen. Die Leasedauer von 1 h aus dem Fall ist deshalb nicht nachgebildet. Der Extra-Hop in `tracert` erscheint trotzdem (.66 → .1 → 1.1.1.1).
```
enable
configure terminal
hostname FREMDGERAET
no ip domain-lookup
ip dhcp excluded-address 192.168.50.1 192.168.50.149
ip dhcp excluded-address 192.168.50.200 192.168.50.254
ip dhcp pool LAN
 network 192.168.50.0 255.255.255.0
 default-router 192.168.50.66
 dns-server 192.168.50.66
 exit
interface GigabitEthernet0/0
 ip address 192.168.50.66 255.255.255.0
 no shutdown
 exit
ip route 0.0.0.0 0.0.0.0 192.168.50.1
enable secret forensik
line console 0
 password forensik
 login
 exit
line vty 0 4
 transport input none
 exit
service password-encryption
end
copy running-config startup-config
```
Danach im Reiter Physical ausschalten und die Datei speichern. Ohne `copy running-config startup-config` ist die Konfiguration nach dem Einschalten weg.

### Eigenheiten von Packet Tracer 9.0 (getestet 08.10.2026)
Zwei DHCP-Server im selben Netz bildet Packet Tracer nicht korrekt ab. Der Außeneinsatz ist darauf zugeschnitten (Merkkasten „Kalles Laborhinweis“), im Debriefing aufgreifen.
- Der PC beantwortet **jedes** Offer mit einem eigenen Request (richtig wäre einer), und beide Server bestätigen jeden Request, ohne Server Identifier oder eigene Ausschlüsse zu prüfen. Das erste Ack gewinnt. Folge: gemischte Konfigurationen, z. B. IP-Adresse aus dem Bereich von SRV-DC01 mit Gateway und DNS .66. Gateway und DNS kommen dabei immer paarweise vom selben Server.
- `ipconfig /renew` ohne `/release` schickt den Request als Broadcast statt unicast an den bisherigen Server; auch dann antworten beide. **PC-VERSAND-01 darf deshalb nicht erneuert werden**, solange beide Server laufen.
- `ipconfig /all` zeigt unter „DHCP Servers“ bei gemischter Konfiguration den falschen Server (z. B. .10 bei Gateway .66). Keine Aufgabe fragt danach.
- Die PDU-Details eines Offers/Acks zeigen nur Option 6 (DNS) und 15 (Domain Name), **nicht** Option 3 (Router).
- Läuft nur ein Server (Pi aus), verläuft DORA sauber. Phase 4 des Auftrags (Pi aus, `tracert` scheitert, `/release` + `/renew` → .10) funktioniert.
- Nach dem Öffnen holen sich die PCs ihre Konfiguration neu (alle Geräte fahren hoch). Fast Forward nötig, nach dem Einschalten des Pi ebenfalls, bis sein Switch-Port grün ist.

## `E4_Wer-hebt-ab.pkt` (Außeneinsatz E4)

Nachbildung im Kleinen („Kalles Labor“): Kalles Laptop und ein Nachbau von SRV-LOHN am SW-SERVER-01, Ports wie im Patchplan (E1). Kein Router, kein DHCP, alle Adressen fest in 192.168.50.0/24. SRV-LOHN wird im „Auslieferungszustand“ gespeichert (HTTP **und** HTTPS an); die Lernenden schalten HTTP selbst ab.

| Gerät | Typ | IP-Adresse | Anschluss |
|---|---|---|---|
| SW-SERVER-01 | Cisco 2960-24TT | – | – |
| SRV-LOHN | Server-PT | 192.168.50.20 /24 (statisch) | Fa0/2 |
| Laptop Kalle | Laptop-PT | 192.168.50.99 /24 (statisch) | Fa0/22 |

- Verbindungen Copper Straight-Through.
- Kein Gateway und kein DNS-Server nötig, die Lernenden rufen die Seite per IP-Adresse auf.

### SW-SERVER-01 (CLI)
Nur Name und Portbeschreibungen, sonst Werkszustand.
```
enable
configure terminal
hostname SW-SERVER-01
interface FastEthernet0/2
 description Server SRV-LOHN (Lohnportal)
 exit
interface FastEthernet0/22
 description Laptop Kalle (Labor)
 exit
end
copy running-config startup-config
```

### SRV-LOHN (Oberfläche)
- Config → Settings: Display Name `SRV-LOHN`
- Desktop → IP Configuration: Static, 192.168.50.20 / 255.255.255.0, Gateway und DNS leer
- Services → HTTP: **HTTP On**, **HTTPS On**
- Services → HTTP → File Manager:
  - `quellbilder/pt-fo-logistik.jpg` importieren (Import). Das Bild ist `quellbilder/firma.png`, auf 480 px Breite verkleinert (JPG, Qualität 82).
  - `index.html` bearbeiten (Edit) und vollständig durch den Code unten ersetzen, dann Save. Die übrigen Beispielseiten von Packet Tracer dürfen bleiben.
- Alle anderen Dienste unter Services auf **Off** (DHCP, DNS, FTP, EMAIL, TFTP, SYSLOG, AAA, NTP …), damit nur Port 80 und 443 eine Rolle spielen.

`index.html` (Umlaute als HTML-Entities, weil der Browser von Packet Tracer UTF-8 nicht zuverlässig darstellt; CSS wird kaum unterstützt, deshalb HTML-Attribute):
```html
<html>
<head><title>F&amp;O Lohnportal (Labor)</title></head>
<body bgcolor="#0f2a30" text="#e8f1f2">
<center>
<img src="pt-fo-logistik.jpg" width="480" height="274" alt="F&amp;O Logistik">
<h2><font color="#ff8a3d">Falkenrath &amp; Oltmanns Logistik GmbH</font></h2>
<h3>Lohnportal &middot; Nachbau in Kalles Labor</h3>
<table border="1" cellpadding="6" bordercolor="#ff8a3d" width="480">
<tr><td>Server</td><td>SRV-LOHN &middot; 192.168.50.20</td></tr>
<tr><td>Zweck</td><td>Testaufbau f&uuml;r die Ermittlung &ndash; kein echtes Portal, keine Anmeldung</td></tr>
</table>
<p>Seite geladen? Dann hat der Server auf eurem Port <b>abgehoben</b>.<br>
Schaut im Simulationsmodus nach, welcher Port das war.</p>
<p><font size="2" color="#9fb8bc">OSI-Agenten &middot; Operation Lohnzettel</font></p>
</center>
</body>
</html>
```

### Laptop Kalle (Oberfläche)
- Config → Settings: Display Name `Laptop Kalle`
- Desktop → IP Configuration: Static, 192.168.50.99 / 255.255.255.0, Gateway und DNS leer

Danach im Realtime-Modus speichern, HTTP und HTTPS am Server an.

### Eigenheiten von Packet Tracer 9.0 (getestet 08.10.2026)
Im Auftrag als „Kalles Laborhinweis“ genannt; keine Aufgabe fragt danach.
- Die TCP-Flags zeigen die PDU-Details nur als Bitfeld (`FLAGS:0b00010010` = ACK + SYN; Reihenfolge Bit 7 → 0: CWR, ECE, URG, ACK, PSH, RST, SYN, FIN). Der Reiter „OSI Model“ nennt sie zusätzlich in Textform. Die Werte stimmen: SYN `0b00000010`, SYN+ACK `0b00010010`, ACK `0b00010000`, RST+ACK `0b00010100`.
- Ist HTTP aus, antwortet der Server auf das SYN an Port 80 mit RST+ACK; der Browser zeigt „Server Reset Connection“.
- HTTPS erscheint im Simulationsmodus als Typ „HTTPS“; einen Filter für TLS/SSL gibt es nicht. Ein Schloss zeigt der Browser nicht.
- Quell-Ports werden fortlaufend ab 1025 vergeben, nicht zufällig im dynamischen Bereich.
- `netstat` gibt es nur ohne Optionen (kein `-a`, `-n`). Der Browser baut Verbindungen sofort wieder ab, die Zeilen stehen deshalb schon auf `FIN_WAIT_1`/`FIN_WAIT_2` oder `CLOSED` und verschwinden schnell. Die Eingabeaufforderung lässt sich nur öffnen, wenn der Browser geschlossen ist. Gefragt wird deshalb nur der Remote-Socket (Spalte „Foreign Address“).
- Sequenz- und Bestätigungsnummern sind im Header sichtbar, werden im Spiel aber nicht behandelt.

## `E5_Name-gegen-Adresse.pkt` (Außeneinsatz E5)

Nachbildung im Kleinen („Kalles Labor“): Frau Lindners PC, SRV-DC01 mit DNS, SRV-LOHN und das Fremdgerät am SW-SERVER-01, Ports wie im Patchplan (E1). Kein Router, kein DHCP, alle Adressen fest in 192.168.50.0/24. Beim Speichern hat PC-VERSAND-02 die **.66** als DNS-Server eingetragen (Zustand wie im Fall); die Lernenden stellen später selbst auf .10 um. Den DHCP-Weg zum falschen DNS-Server zeigt schon E3.

| Gerät | Typ | IP-Adresse | Dienste | Anschluss |
|---|---|---|---|---|
| SW-SERVER-01 | Cisco 2960-24TT | – | – | – |
| SRV-DC01 | Server-PT | 192.168.50.10 /24 | DNS: `lohn.fo-logistik.intern` → .20 | Fa0/1 |
| SRV-LOHN | Server-PT | 192.168.50.20 /24 | nur HTTPS | Fa0/2 |
| PC-VERSAND-02 | PC-PT | 192.168.50.140 /24, DNS 192.168.50.66 | – | Fa0/12 |
| Fremdgerät (Pi) | Server-PT, eigenes Icon | 192.168.50.66 /24 | DNS: `lohn.fo-logistik.intern` → .66, nur HTTP | Fa0/23 |

- Verbindungen Copper Straight-Through.
- Der Pi ist diesmal ein Server-PT, weil er DNS **und** HTTP anbieten muss. Server-PT lässt sich nicht sperren; der Auftrag sagt offen, dass es Kalles Nachbau ist und von außen (am PC) ermittelt wird. Keine Aufgabe lässt sich aus dem Reiter Services beantworten.
- Icon wie in E3: `quellbilder/pt-einplatinenrechner_128.png`.
- Beide Webseiten sind vollständig gleich (Absicht: Der Seite sieht man die Fälschung nicht an). Keine Anmeldefelder, auf beiden der Hinweis „Testaufbau“.

### SW-SERVER-01 (CLI)
Nur Name und Portbeschreibungen wie im Patchplan, sonst Werkszustand.
```
enable
configure terminal
hostname SW-SERVER-01
interface FastEthernet0/1
 description Server SRV-DC01 (DNS/DHCP)
 exit
interface FastEthernet0/2
 description Server SRV-LOHN (Lohnportal)
 exit
interface FastEthernet0/12
 description Dose V-302 Versand
 exit
end
copy running-config startup-config
```
Port Fa0/23 bekommt bewusst keine Beschreibung (im Patchplan aus E1 ist er frei).

### SRV-DC01 (Oberfläche)
- Config → Settings: Display Name `SRV-DC01`
- Desktop → IP Configuration: Static, 192.168.50.10 / 255.255.255.0, Gateway leer, DNS 192.168.50.10
- Services → DNS: DNS Service **On**, Eintrag Name `lohn.fo-logistik.intern`, Type `A Record`, Address `192.168.50.20` → **Add**
- Alle anderen Dienste **Off** (HTTP, HTTPS, DHCP, FTP, EMAIL …)

### SRV-LOHN (Oberfläche)
- Wie in E4 (Display Name, IP 192.168.50.20), aber Services → HTTP: **HTTP Off**, **HTTPS On** (Endzustand von E4)
- **Kein Bild** im File Manager (siehe Eigenheiten unten); ein aus E4 übernommenes `pt-fo-logistik.jpg` löschen
- `index.html` vollständig durch den Code unten ersetzen
- Alle anderen Dienste **Off**

### Fremdgerät (Pi) (Oberfläche)
- Config → Settings: Display Name `Fremdgerät (Pi)`
- Desktop → IP Configuration: Static, 192.168.50.66 / 255.255.255.0, Gateway und DNS leer
- Services → DNS: DNS Service **On**, Eintrag Name `lohn.fo-logistik.intern`, Type `A Record`, Address `192.168.50.66` → **Add**
- Services → HTTP: **HTTP On**, **HTTPS Off**; `index.html` durch denselben Code wie bei SRV-LOHN ersetzen, kein Bild
- Alle anderen Dienste **Off**

### PC-VERSAND-02 (Oberfläche)
- Config → Settings: Display Name `PC-VERSAND-02`
- Desktop → IP Configuration: Static, 192.168.50.140 / 255.255.255.0, Gateway leer, DNS Server **192.168.50.66**

`index.html` für SRV-LOHN **und** Pi (gleicher Code; Umlaute als HTML-Entities wie in E4):
```html
<html>
<head><title>F&amp;O Lohnportal (Labor)</title></head>
<body bgcolor="#0f2a30" text="#e8f1f2">
<center>
<h1><font color="#ff8a3d">F&amp;O Logistik</font></h1>
<h2><font color="#ff8a3d">Falkenrath &amp; Oltmanns Logistik GmbH</font></h2>
<h3>Lohnportal &middot; Nachbau in Kalles Labor</h3>
<table border="1" cellpadding="6" bordercolor="#ff8a3d" width="480">
<tr><td>Zweck</td><td>Testaufbau f&uuml;r die Ermittlung &ndash; kein echtes Portal, keine Anmeldung</td></tr>
</table>
<p>Seite geladen? Schaut im Simulationsmodus nach,<br>
welches Ger&auml;t sie geschickt hat.</p>
<p><font size="2" color="#9fb8bc">OSI-Agenten &middot; Operation Lohnzettel</font></p>
</center>
</body>
</html>
```
Gegenüber E4 fehlen das Bild (eine Datei = ein Aufruf, siehe unten) und die Zeile „Server“, damit die Seite nicht verrät, wer sie geschickt hat.

Danach im Realtime-Modus speichern.

### Eigenheiten von Packet Tracer 9.0 (getestet 09.10.2026)
- Der Browser baut für **jede Datei** eine eigene TCP-Verbindung auf (wie HTTP/1.0) und fragt dafür jedes Mal neu per DNS. Mit Bild auf der Seite käme nach der Seite eine zweite Runde DNS + Handshake + Bild. Deshalb haben die E5-Seiten kein Bild.
- DNS-Antworten werden **nicht zwischengespeichert**; nach dem Umstellen des DNS-Servers fragt der PC sofort den neuen. Ein echter PC hält Antworten eine Weile im Cache (`ipconfig /flushdns`); das steht im Laborhinweis, abgefragt wird es nicht.
- `nslookup` zeigt in der Zeile „Server:“ keinen Namen, nur die IP-Adresse in eckigen Klammern (ein echter PC nennt dort den Namen, vgl. LEON-NB im Spiel). Keine Aufgabe fragt danach. Ausgabe:
```
C:\>nslookup lohn.fo-logistik.intern 192.168.50.10

Server: [192.168.50.10]
Address:  192.168.50.10

Non-authoritative answer:
Name:   lohn.fo-logistik.intern
Address:   192.168.50.20
```
