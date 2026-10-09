# OSI-Agenten · Operation Lohnzettel – Design

Verbindliche inhaltliche und didaktische Vorgaben des Spiels. Allgemeine Regeln für Beiträge (IDs, Sprache, Datenschutz, Arbeitsablauf) stehen in [`CONTRIBUTING.md`](CONTRIBUTING.md) und werden hier nicht wiederholt.

## Rahmen
- Das Spiel dient der **Erarbeitung** des OSI-Modells, nicht nur seiner Anwendung. Kleine Häppchen, die Lehrkraft bleibt ansprechbar.
- **Grundsätzlich allein gespielt.** Fehlen Geräte oder spricht etwas Pädagogisches oder Didaktisches dafür, geht es auch zu zweit an einem Gerät. Ein Spielstand trägt 1–2 Agenten-Kürzel (im Spiel heißt er „Duo“).
- Etwa 6–7 Doppelstunden bei **freiem Tempo**. Gespeichert wird nach jedem Schritt, nicht pro Einsatz.
- Serverlos und offline. `localStorage` ist nur Komfort, die exportierte `.osiagent`-Datei ist die echte Sicherung. Verteilung als ZIP oder über die Online-Version.
- Keine Benotung. Das Abschlussverhör dient nur der Diagnose.

## Vorwissen
Maßgeblich ist [`lehrkraft/quellen/mindestanforderungen.html`](lehrkraft/quellen/mindestanforderungen.html) (PDF: `lehrkraft/Mindestanforderungen_Vorwissen.pdf`) mit drei Stufen:
1. **Minimum:** Das Spiel knüpft daran an.
2. **Hilfreich, aber im Spiel erklärt:** z. B. Befehle wie `tracert` und `nslookup`, DORA, Wireshark.
3. **Nur angeteasert:** wird nicht abgefragt.

Neue Inhalte werden dort eingeordnet.

## Lehrplanbezug
Das Spiel erarbeitet das OSI-Modell an einem durchgehenden Fall. Es deckt keine Anforderungssituation und kein Lernfeld vollständig ab, sondern liefert Bezüge. Wo es im Bildungsgang hingehört, legt jede Schule in ihrer **Didaktischen Jahresplanung (DJP)** fest. Vorher mit den Mindestanforderungen abgleichen.

**ITA NRW:** Bildungsplan „Staatlich geprüfte informationstechnische Assistentin / Staatlich geprüfter informationstechnischer Assistent, Profilfach Betriebssysteme/Netzwerke“ (Berufsfachschule Anlage C 1 APO-BK, MSB NRW 2024, veröffentlicht auf www.berufsbildung.nrw.de). Bezüge:
- AS 1.1: Fehlermeldungen erfassen und bewerten (Ticket-Triage in E0)
- AS 3.1: Übertragungsmedien und Netzkoppelelemente auswählen, Informationssicherheit bewerten (E0–E2)
- AS 4.3 Z 5: sicherheitstechnische Aspekte von DNS- und DHCP-Diensten (E3, E5, E6)
- AS 5.2 Z 5/Z 8: Zusammenhang zwischen Teilnetzen, beteiligten Protokollen und Routing (E2, E3)
- AS 5.3: Datensicherheit im Netzwerk beurteilen (Fall insgesamt, Debriefing)

**Fachinformatik** (KMK-Rahmenlehrplan): Lernfeld 3 „Clients in Netzwerke einbinden“ und/oder Lernfeld 9 „Netzwerke und Dienste bereitstellen“. Ein Teil des Minimums (IPv4, DHCP, ARP) wird erst in LF 3 erarbeitet, DNS und Dienste teils in LF 9. Das Spiel passt daher eher ans Ende von LF 3 oder in LF 9, gegebenenfalls angepasst.

## Didaktik und Sprache
- OSI ist das Hauptmodell, TCP/IP kommt nur als Zuordnung vor. Jargon wie „L2-Switch“ und „L1-Problem“ ist erwünscht.
- Die Spedition dient als Analogie für die Kapselung: Karton = Port, Palette = IP, LKW je Etappe = MAC.
- Vertiefendes Zusatzwissen (z. B. Promiscuous Mode) steht als 🕵️ **Profi-Tipp** (`<div class="profi">`): freiwillig, keine Aufgaben dazu, nicht prüfungsrelevant. Themen, die die Lehrkraft später selbst einführt und prüft (z. B. TCP-Sequenznummern), kommen auch nicht als Profi-Tipp vor.
- **Auswahlfragen:**
  - Die richtige Antwort ist nie länger oder erklärender als die falschen (`werkzeuge/test-werkzeuge.js` prüft die Länge).
  - Die Begründung steht in der Erklärung nach dem Lösen.
  - Die Frage enthält keine offensichtlichen Hinweise auf die richtige Lösung.
- **Belegt vs. vermutet:** Fragen trennen klar, was ein Dokument belegt und was nur Indiz oder Möglichkeit ist. Dokumente zeigen Rohdaten ohne fertige Auswertung. Keine trivialen Rechen- oder Zeitvergleichsaufgaben. Zeugenaussagen sind realistisch ungenau („gegen halb drei“), exakte Zeiten stehen nur in Dokumenten.
- Die Beweiskette läuft über Erkennungsmerkmale, Zeitspuren, Protokolle und Zuordnung, nie über die Funktionsweise eines Angriffs.
- TLS gilt im Spiel als L6 **oder** L5, weil die Literatur uneinheitlich ist (Hinweis in der HTTP-Lektion). Sortierer und Schichtfragen erlauben dafür mehrere richtige Schichten (`ziel`/`richtig` als Liste).
- Generisches Maskulinum ist erlaubt, z. B. in Kalles Sprüchen. Verboten sind nur Gendersternchen.

## Fall
- Fiktive Firma **Falkenrath & Oltmanns Logistik GmbH** (F&O), gefälschte Lohnportal-Seite, `lohn.fo-logistik.intern`.
- Zeitachse: E0 beginnt Di 22.09. früh (Notruf in der Nacht, Mitschnitt im Paket-Röntgen vom Mo 21.09.).
- Netz: 192.168.50.0/24, Gateway .1, DNS/DHCP SRV-DC01 .10, Lohnportal .20, offizieller DHCP-Bereich ab .100. Fremdgerät (Raspberry Pi, MAC `dc:a6:32:5e:19:7a`) an **SW-SERVER-01 Port 23**, 100 Mbit/s, IP .66.
- Weitere Netzdaten (zentral in `meta.js` → `OSI.netz`):
  - Router .1 `00:a0:57:2b:7c:01` (LANCOM)
  - SRV-DC01 `00:15:5d:0a:32:10`, SRV-LOHN .20 `00:15:5d:0a:32:14` (beide Hyper-V)
  - PC-BUCH-01 .121, PC-BUCH-03 .123 (Frau Yilmaz)
  - PC-VERSAND-01 .131 (alte, korrekte Lease), PC-VERSAND-02 .140 (Frau Lindner, Lease vom Pi)
  - PC-DISPO-01 .141 (Port 8)
- Mitschnitte entstehen per **Port-Spiegelung** am SW-SERVER-01 und enthalten nur Frames, die dort sichtbar wären. Jedes Gerät braucht einen Port im Patchplan.
- Spur: L1 Gerät am Switch → L2 ARP-Spoofing/OUI → L3 Rogue-DHCP (falsches Gateway/DNS, Extra-Hop in `tracert`) → L4 offene Ports und Fernwartung → L7 DNS-Fälschung, Seite ohne Schloss, Hostname im Log.
- Verdächtige:
  - Leon Berger (Azubi, wird reingelegt, Hostname LEON-NB gefälscht)
  - Sabine Krüger (Buchhaltung, in E1 vorerst entlastet)
  - **Marco Seidel (Drucker-Techniker, Täter)**
  - Yusuf Demir (Hausmeister, ließ Seidel Fr 14:10 in den Serverraum)
- Figuren:
  - Direktorin Albers (siezt)
  - Kalle (Technik, duzt, Humor-Ventil)
  - T. Brandt (IT-Leiter F&O; Porträt: dunkles Haar, dunkle Jacke, hellblaues Hemd ohne Krawatte)
- Auflösung: Seidel schloss den Pi am Fr 14:10 an und legte den DHCP-Dienst per Zeitsteuerung auf Mo ~08:05. Von Demir wusste er, dass der Azubi montags um 8 die Bandsicherung macht. So wollte er den Verdacht auf Berger lenken. Motiv ist die Lohnumleitung: Mit abgegriffenen Zugängen änderte er ab Mo 21.09. die Bankverbindung mehrerer Beschäftigter, alle auf dasselbe Konto. Der Lohnlauf wird rechtzeitig gestoppt.

## Einsätze
- **E0 (Grundausbildung):**
  - Warum Schichten (Spedition), L1–L7 mit Sortierer, Kapselung als Puzzle (Senden und Empfangen), Fachsprache der PDUs (Bits, Frame, Paket, Segment/Datagramm, Daten).
  - Geräte-Verhör (Hub, Repeater, Switch, Router, L3-Switch), Paket-Röntgen an einem einzelnen DNS-Frame im Wireshark-Stil.
  - Fehler-Triage: Tickets von F&O je einer Schicht zuordnen, darunter schon ein falsches Standardgateway.
  - Am Ende die Akte „Lohnzettel“: richtige Adresse, falsche Seite, kein Schloss → jemand hat im Netz selbst manipuliert. Vier Verdächtige ans Board, Vorgehen Bottom-up ab L1.
- **E1 (L1):**
  - Übertragungsmedien (Twisted Pair, LWL, Funk) mit Einsatzplanung bei F&O, L1-Geräte (Hub, Repeater, Medienkonverter, Patchfeld), Autonegotiation und LEDs.
  - Serverraum: Frontansicht von SW-SERVER-01 gegen den Patchplan → Port 23 belegt, LED orange = 100 Mbit/s; Port 7 (alter Drucker) ist die Falle.
  - Der Fund: kleines Gerät ohne Beschriftung, Cat-5e-Patchkabel. L1 verrät Ort, Medium und Geschwindigkeit, aber keine Identität. Bonus-Akte: Portstatus über die Verwaltungsoberfläche statt Kabeltester (Kabel bleibt stecken).
  - Zutrittsprotokoll mit Besucherbuch: Fr 14:10 Generalschlüssel (Demir mit Seidel), Mo 08:03 Karte IT-07 (Berger). Krüger war nicht im Serverraum → „VORERST ENTLASTET“.
- **E2 (L2):**
  - Der Pi gibt sich per ARP-Spoofing als Lohnportal .20 aus (Replies alle 2 s, „duplicate use“). Ein `ping` an .20 liefert TTL 64 (Linux) statt 128 (Bonus).
  - Die OUI-Spur macht Berger verdächtig (er zeigte in der Pause einen Raspberry Pi). Das ist bewusst ein Indiz, kein Beweis.
  - Werkzeuge:
    - **Simuliertes Terminal:** freies Tippen, Tab, ↑-Verlauf, Spickzettel, geheimes `color 0a`.
    - **Wireshark-Ansicht:** eigener Filter-Parser für Protokolle, Felder `eth./ip./udp./tcp./arp./dhcp.`, die Operatoren `== != && || !` und Klammern.
  - Freitext-Eingaben (IP, MAC, Filter): Filter werden über die Treffermenge verglichen, jeder gleichwertige Filter zählt.
- **E3 (L3):**
  - Der Pi ist Rogue-DHCP (Gateway .66, DNS .66, Lease 1 h) und leitet wie ein Router weiter (`tracert`: Extra-Hop .66).
  - Die Versand-PCs erwischt es nach dem Update-Neustart Mi 06:12.
  - Zeitspur Mo: letzte echte Lease 07:58, erste falsche 08:14. Das passt zu Berger (Mo 08:03).
  - DNS .66 ist schon sichtbar, wird aber erst in E5 ausgewertet.
  - 8-Tage-Leases zeigen bewusst keine Verlängerung nach halber Laufzeit, weil T1 nicht vermittelt wird.
- **E4 (L4):**
  - Portbereiche well-known/registered/dynamic, mit dem Hinweis, dass das keine starre Konvention ist (Linux nutzt 32768–60999).
  - 3-Wege-Handshake (SYN/SYN-ACK/ACK, FIN nur kurz), **ohne** Sequenznummern und Fenster.
  - Portscan nur mit Auftrag (TCP im Mitschnitt, UDP per Anfrage/ICMP), `netstat`.
  - Reverse-SSH-Tunnel Pi → 198.51.100.23:22 seit Fr 18.09. 14:12 (Router-Verbindungsprotokoll). Danach sind Demir und Seidel „verdächtig“.
- **E5 (L5–L7):**
  - DNS/`nslookup`: Der Pi lügt nur bei `lohn` und nennt sich LEON-NB. Der offizielle DNS kennt den Namen nicht.
  - HTTP/HTTPS/Zertifikat, L6 Kodierung, L5 Sitzung, Synthese „Drei Fälschungen, ein Mittelsmann“.
  - Der Mitschnitt zeigt nur den Seitenaufruf (DNS-Lüge, lesbares HTTP, unlesbares TLS), **keinen** Anmeldevorgang mit Zugangsdaten oder Sitzungs-ID.
  - Fachlich gilt: ARP-Spoofing (L2) und DNS-Lüge (L7) lenken jeweils auf den Pi. Der Rogue-DHCP (L3) lenkt allein nicht aufs Lohnportal, er trägt den Pi nur als DNS-Server und Gateway ein. Im Spiel ist das knapp gehalten und wird im Debriefing aufgegriffen.
  - Am Ende stellt Brandt den Pi sicher und setzt DNS/DHCP, Passwörter und Sitzungen zurück.
- **E6 (Finale):** etwa eine Doppelstunde, reine Synthese ohne neuen OSI-Stoff. Neue Fundstücke sind HTML-Dokumente (keine Konfiguration oder Befehle des Pi).
  - Schritte: intro → leon → wartezeit → forensik → demir → krueger → server → anklage → aufloesung → massnahmen → epilog → ende.
  - **Berger:** Die Leasetabelle von SRV-DC01 zeigt sein echtes Notebook `NB-IT-07` (`18:66:da:4c:3e:07`, .117) gleichzeitig mit dem Pi. Das Klassenbuch der Berufsschule allein entlastet nicht. Entlastet wird er durch den Forensik-Befund (erster Start Fr 14:11, Auftrag „DHCP-Dienst starten Mo 08:05“ angelegt Fr 14:24, Anmeldungen am Gerät nur Fr 14:18–14:25). Ein Merkkasten weist darauf hin, dass Beweisstücke nur die Forensik untersucht (IT-Sicherheitsvorgaben).
  - **Wartezeit:** Das DHCP-Protokoll Fr–Mo mit Server-IDs lässt offen, ob der Dienst aus oder nur langsamer war. Die Lernenden schließen zuerst selbst.
  - **Demir:** Seine Aussage („gegen halb drei“) wird durch die Warenannahme 14:13/14:27 belegt. Er erzählte Seidel arglos von der Bandsicherung und ließ ihn etwa 15 Minuten allein im Serverraum (Begleitpflicht verletzt). Danach ist er entlastet.
  - **Krüger:** Sie fand die Bankänderungen im Änderungsprotokoll (6 Änderungen von .66, Nordbank Direkt …4711 06) und meldete sie. Danach ist sie endgültig entlastet.
  - **198.51.100.23:** Laut Anbieter-Auskunft (NordHost) gemietet auf „L. Berger“ mit Wegwerf-Mail. Die Handynummer (0157 •••• 48 261) steht aber auf einem PrintPoint-Serviceauftrag von Seidel, bezahlt vom Konto der Bankänderungen.
  - **Anklage** (Schritt-Typ `anklage`): beschuldigte Person wählen, dann je eine Beweiskarte für Gelegenheit, Tatmittel, Motiv und falsche Fährte (plus Ablenker). Karten tragen Schicht-Etiketten, schon verwendete sind gesperrt. Wertung wie üblich, kein Game Over.
  - **Board-Stempel:** `entlastet` („VORERST ENTLASTET“), `frei` („ENTLASTET“), `ueberfuehrt`. Story-Schritte setzen Stempel per `setzt`.
  - **Epilog:** Brandts Maßnahmenplan mit fünf versiegelten Akten (Port-Security/802.1X, VLAN, Firewall, TLS, WLAN), nur als Teaser. Danach Kaffeeküche mit Leon, Demir und Krüger.
- **Abschlussverhör** (Akte `verhoer`, `content/verhoer.js`):
  - Freigeschaltet nach E6 oder per Lehrkraft-Dialog (`unlocked.verhoer`). `diagnose: true` heißt: zählt nicht zum Fall-Fortschritt.
  - Einzeln pro Kürzel, 12 neue Transferfragen (je 2 zu Modell, L1, L2, L3, L4, L5–7).
  - Bekannte Formate ohne Terminal, keine Punkte, keine Tipps, ein Versuch. Die Optionen sind pro Person stabil gemischt (Hash aus Kürzel und Frage).
  - „Weiß ich nicht“ ist möglich: gespeichert als `{ v: '?', ok: false, wn: true }`, zeigt die Lösung, neutrales Feedback.
  - Antworten in `save.verhoer[kürzel] = { start, ende, a: { id: { v, ok } } }`, nicht in `items`. Sie geben also keine Punkte und beeinflussen weder Rang noch „alle Aufgaben gelöst“.
  - Keine Absicherung gegen Wiederholung, nur Startzeit und Dauer werden gespeichert.
  - Danach ein persönlicher, immer wertschätzender Dank der Direktorin, abgestuft nach Ergebnis. Dann Schritt `v-ende` (Typ `urkunde`): Schlussworte, druckbare **Ernennungsurkunde** als eigenes A4-Blatt, Konfetti (aus bei `prefers-reduced-motion`).
  - Einsatzzentrale: Reiter „Abschlussverhör“ mit Kürzel × Bereich, Fragen nach Quote, 🤷 getrennt von falschen Antworten, eigene CSV.

## Außeneinsätze
Begriffe in [`CONTEXT.md`](CONTEXT.md), Begründung in [ADR 0004](docs/adr/0004-ausseneinsaetze-im-spiel.md), Topologie und Adressen der Simulationsnetze in [`docs/simulationsnetze.md`](docs/simulationsnetze.md).
- Je Einsatz ein Außeneinsatz am Ende (Schritt-Typ `aussen`, `bonus: true` = blockiert nicht), immer offen. Ein neuer Außeneinsatz kommt erst ins Spiel, wenn er fertig ist.
- Kennzeichnung „★ AUSSENEINSATZ“ mit dem Satz, dass er den Fortschritt nicht blockiert und später nachgeholt werden kann.
- Packet Tracer ist technische Voraussetzung, kein Vorwissen. Bedienung und Cisco-CLI erschließen sich die Lernenden selbst; Aufträge nennen das Ziel, die Befehle stehen in der Befehlsreferenz ([ADR 0005](docs/adr/0005-befehle-in-der-befehlsreferenz.md)).
- So nah an der Praxis wie möglich: richtiger `ping` statt „Add Simple PDU“, Switch-CLI über Konsolenkabel und Terminal statt Lupe.
- **E1 „Wer hört mit?“:** Ping PC-1 → PC-2 und PC-5 → PC-6 gleichzeitig, Filter nur ICMP (blendet ARP aus). Hub verteilt an alle, Switch nur ans Ziel; zum Switch wird nur vermutet, erklärt wird er auf L2.
- **E2 „Der lernende Switch“:** MAC-Adressen per `ipconfig /all` erfassen, Konsolenkabel von PC-4, `show mac address-table` vor dem Ping und dreimal währenddessen (Request am Switch, nach dem Fluten, Reply am Switch). Ziel: Der Switch lernt beim Empfangen aus der Absender-MAC; Fluten trägt nichts ein. Löst auf, warum in E1 schon der erste ICMP-Frame gezielt ankam.
- **E3 „Zwei Server, ein Discover“:** Nachbildung des F&O-Netzes („Kalles Labor“), Fremdgerät als gesperrter Cisco-Router. Ablauf: Pi aus, alle PCs von .10 → Pi einschalten (Mo 08:05) → VERSAND-02 `/release` + `/renew` im Simulationsmodus bis zu den zwei Offers, dann im Echtzeitmodus wiederholen, bis das Gateway .66 ist, `tracert` .66 → .1 → 1.1.1.1, Vergleich mit VERSAND-01 (wird nicht erneuert) → Pi aus, `tracert` scheitert, erst `/release` + `/renew` heilt. Ziel: zwei Offers als Erkennungsmerkmal, „wer zuerst kommt“, Entfernen des Geräts allein reicht nicht. Packet Tracer mischt bei zwei Servern die Angebote; der Auftrag sagt das offen (Kalles Laborhinweis), Aufgaben fragen nur nach Gateway, DNS und `tracert`, nie nach PC-Adressen oder der Zeile „DHCP Servers“.
- **E4 „Wer hebt ab?“:** Nachbildung im Kleinen: Laptop Kalle (.99) und ein Nachbau von SRV-LOHN (.20) im Auslieferungszustand mit HTTP und HTTPS. Ablauf: `http://` im Simulationsmodus (Filter TCP, HTTP, HTTPS), Handshake Segment für Segment → HTTP am Server abschalten, erneut `http://` → RST, ACK („Server Reset Connection“) → `https://` mit Handshake auf 443 → Browser schließen, `netstat` (Remote-Socket). Ziel: Handshake am Gerät, offener und geschlossener Port als Erkennungsmerkmal, Transfer: Antwortet `http://lohn…` trotzdem, hat ein anderes Gerät abgehoben. PT zeigt Flags nur als Bitfeld, deshalb eine Flag-Tafel im Auftrag, der Reiter „OSI Model“ dient als Gegenprobe. Fragen nie nach Quell-Port, TCP-Zustand oder Sequenznummern (Laborhinweis).
- **E5 „Name gegen Adresse“:** Nachbildung im Kleinen ohne Router und DHCP: PC-VERSAND-02 (DNS fest auf .66), SRV-DC01 (DNS `lohn… → .20`), SRV-LOHN (nur HTTPS, Endzustand von E4), Fremdgerät als Server-PT (DNS `lohn… → .66`, nur HTTP). Beide Webseiten sind gleich und ohne Anmeldefelder. Ablauf: `http://lohn…` im Simulationsmodus (Filter DNS, TCP, HTTP, HTTPS): erst DNS an .66, Antwort .66, dann SYN an .66:80 → `https://lohn…` → RST, ACK vom Pi → DNS am PC auf .10 umstellen: `http://` → RST, ACK von SRV-LOHN, `https://` → Seite → `nslookup` als Gegenprobe. Ziel: Vor jeder Verbindung steht die Namensauflösung, der Browser vertraut der DNS-Antwort blind, und der Seite sieht man die Fälschung nicht an, nur am fehlenden HTTPS. Wiederholt nicht die `nslookup`-Fragen aus `e5-terminal`. Der Pi ist nicht gesperrt; der Laborhinweis sagt, dass es Kalles Nachbau ist und von außen ermittelt wird, keine Frage stützt sich auf seine Konfiguration. Profi-Tipp: Wer den DNS-Server stellt, sieht alle aufgelösten Namen; öffentliche DNS-Server, Proxys und VPNs verlagern das nur zu einem anderen Anbieter.

## Gamification
- Punkte: 1. Versuch voll, dann 50/30/20 %, je Tipp −20 %, nie 0. Kein Game Over, kein Zeitdruck außer in der freiwilligen Zeit-Challenge.
- Zeit-Challenge: Nach einem Fehler steht die Uhr 2,5 s. Es läuft nur ein Durchgang gleichzeitig. Angezeigt wird „Richtige“. Begriffe aus späteren Einsätzen sind als Vorgeschmack erlaubt.
- „Nochmal üben“ für erledigte Fragen-, Sortier- und Puzzle-Schritte:
  - Der erste Durchgang bleibt maßgeblich, Übung gibt und kostet keine Punkte.
  - Fehlerfrei und ohne Tipp = ⭐ „gemeistert“, 5× ⭐ = Abzeichen „Trainingsfleißig“.
  - Gespeichert in `save.uebung`.
- Ränge als neutrale „Freigabestufen“, Abzeichen (auch geheime), Verdächtigen-Board mit Stempeln, Codenamen.
- Einsatzzentrale: Beamer (Klassenbalken, Top 3, Kategorien) und Lehrkraft-Ansicht (Spielstände, Fehlerquote je Aufgabe, häufigste falsche Antwort, CSV).
- Lehrkraft-Modus: Strg+Alt+L oder Link „Lehrkraft“ (Passwort siehe README).
- Ton: nur Web-Audio-Effekte, standardmäßig aus.
- Bildstil: Graphic-Novel-Noir in Petrol und Orange (Orange = Hinweis). Besetzung normal gemischt, nicht überkompensiert.

## Ausbau (offen)
Aufgaben an einem echten Labornetz, `.pcapng`-Boni, Agenten-Handbuch und Lehrkraft-Handbuch als PDF. Vorschläge in `lehrkraft/Offene_Aufgaben_Lehrkraft.pdf`, alles Weitere in den GitHub Issues.
