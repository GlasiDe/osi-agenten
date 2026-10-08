# Simulationsnetze der Außeneinsätze

Technische Beschreibung der Packet-Tracer-Dateien in `spiel/aussen/`, damit Aufträge und Fragen ohne Öffnen der `.pkt` geschrieben und geprüft werden können. Didaktische Ziele der Außeneinsätze stehen in `DESIGN.md`. Ändert sich eine `.pkt`, wird diese Datei mit angepasst.

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
