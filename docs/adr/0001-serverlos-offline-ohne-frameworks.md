# Serverlos und offline: nur lokale Dateien, nichts aus dem Netz nachladen

Das Spiel wird als ZIP verteilt und muss per Doppelklick (`file://`) in jedem Browser auf den Geräten der Lernenden laufen, ohne Internet, Installation oder Administratorrechte. Deshalb gibt es keinen Server und keine Bibliotheken von fremden Servern (CDNs), die ohne Internet fehlen und bei jedem Aufruf Daten an Dritte senden würden. Inhalte werden per `<script src>` eingebunden, nicht per `fetch` nachgeladen, weil Browser das Nachladen von Dateien unter `file://` blockieren. Die Online-Version (GitHub Pages) ist nur ein zweiter Weg zu denselben Dateien, etwa für Tablets, die `file://` nicht öffnen können.

## Consequences

Inhalte sind JavaScript-Dateien statt JSON. Frameworks mit Build-Schritt scheiden aus; alles, was im Browser läuft, liegt genau so im Repo.
