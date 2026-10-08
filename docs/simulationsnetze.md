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
