# Änderungen

Was sich für Lernende und Lehrkräfte ändert. Jede Version ist online sofort live und steht als ZIP unter den GitHub-Releases; der Abschnitt einer Version ist zugleich ihre Release-Notiz ([ADR 0006](docs/adr/0006-jeder-push-eine-version.md)). Ältere Spielstände laden weiter.

## v1.2.0 – 09.10.2026

### Für Lernende
- **Außeneinsätze in Packet Tracer** am Ende von Einsatz 1 bis 5, ab jetzt immer offen (vorher versiegelt). Auftrag, Download des Simulationsnetzes und Fragen stehen direkt im Spiel. Sie blockieren den Fortschritt nicht und lassen sich später nachholen.
  - E1 „Wer hört mit?“: Switch gegen Hub
  - E2 „Der lernende Switch“: MAC-Adresstabelle und ARP
  - E3 „Zwei Server, ein Discover“: zwei DHCP-Server, falsches Gateway, `tracert`
  - E4 „Wer hebt ab?“: 3-Wege-Handshake, offener und geschlossener Port
  - E5 „Name gegen Adresse“: Namensauflösung vor dem Seitenaufruf, gefälschter DNS-Eintrag
- Befehlsreferenz im Agenten-Handbuch mit allen Befehlen für Spiel und Außeneinsätze (Windows-Eingabeaufforderung, Cisco IOS).
- Filteraufgaben im Wireshark-Stil präziser formuliert: Sie nennen jetzt, in welcher Schicht das gesuchte Feld steckt. Die Wireshark-Lektion erklärt, dass der Filter alle eingepackten Schichten eines Frames prüft.
- Profi-Tipps nach den Fragen stehen jetzt unter der Fragenliste, damit sie nicht übersehen werden.

### Für Lehrkräfte
- Der Knopf „Außeneinsätze freischalten“ im Lehrkraft-Modus entfällt, weil alle Außeneinsätze offen sind.
- Lösungen und Debriefing enthalten die Fragen der Außeneinsätze und Impulse zur Nachbesprechung.
- Bauanleitungen der Simulationsnetze in `docs/simulationsnetze.md`, Begriffe in `CONTEXT.md`, Grundsatzentscheidungen in `docs/adr/`.

## v1.1.0 – 06.10.2026
Erste öffentliche Fassung.
- Einsätze E0–E6 (L1–L7) und Abschlussverhör
- simuliertes Terminal und Wireshark-Ansicht
- Zeit-Challenge und Übungsmodus
- Einsatzzentrale, Lösungen und Debriefing, Mindestanforderungen und Inhaltsübersicht für Lehrkräfte
