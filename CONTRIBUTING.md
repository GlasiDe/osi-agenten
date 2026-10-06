# Mitmachen

Schön, dass du das Spiel verbessern oder anpassen möchtest! Für kleine Korrekturen genügt ein Issue. Bei größeren Änderungen bitte erst ein Issue mit der Idee eröffnen, dann einen Pull Request.

Diese Datei ist die verbindliche Grundlage für alle Beiträge, von Menschen wie von KI-Assistenten. Die inhaltlichen und didaktischen Vorgaben (Fall, Figuren, Netzdaten, Spielmechanik) stehen in [`DESIGN.md`](DESIGN.md). Vor inhaltlicher Arbeit bitte lesen.

## Grundregeln
**Spielstände**
- **IDs von Schritten und Aufgaben nie ändern oder wiederverwenden.** Sie stecken in den Spielständen der Lernenden. Texte dürfen geändert, Aufgaben zwischen Schritten verschoben und neue IDs ergänzt werden. Gestrichene IDs kommen in `OSI.ausgemustert` (`spiel/content/meta.js`).
- Jede Änderung muss bestehende Spielstände weiter laden können.

**Technik**
- Das Spiel muss offline per Doppelklick (`file://`) in jedem Browser laufen: kein `fetch`, keine CDNs, keine Frameworks. Inhalte werden per `<script src>` geladen.

**Sprache**
- Keine Gendersternchen (`*in`), stattdessen neutrale Form oder Paarform („Agentinnen und Agenten“, „Lernende“).
- Schichtnummern (L1–L7) vor Schichtnamen. „Frame“ wird nicht übersetzt. L2 immer mit Header **und** Trailer.

**Aufgaben**
- Fragen nur zu Inhalten, die vorher im Spiel vermittelt wurden oder laut Mindestanforderungen (`lehrkraft/quellen/mindestanforderungen.html`) vorausgesetzt sind. Dort als „nur angeteasert“ geführte Themen werden nicht abgefragt.
- Ist unklar, ob ein neues Konzept als Vorwissen vorausgesetzt werden kann: erst im Issue klären.
- Aufgaben nicht nach Schichten sortiert anordnen. Lösungen nie optisch hervorheben.
- Angriffe nur aus Ermittlersicht (erkennen, belegen, abwehren), nie als Anleitung. Bei Forensik-Themen auf die IT-Sicherheitsvorgaben des Betriebs hinweisen.

**Personen und Daten**
- Figuren bekommen keine echten Namen aus dem Schulumfeld.
- Keine Spielstände, Klassenbezeichnungen oder andere Angaben zu Lerngruppen und Personen ins Repo, auch nicht in Issues oder Commits. Rückmeldungen aus dem Unterricht nur fachlich und anonym („Rückmeldung aus dem Unterricht: Aufgabe X wurde oft missverstanden“).
- Bilder nur selbst erstellt oder mit geklärter freier Lizenz. Fachliches (Diagramme, Terminal, Wireshark) als HTML/SVG, nie als KI-Bild.

**Material**
- Druckmaterial immer als fertige A4-PDF. Quellen in `lehrkraft/quellen/*.html`, erzeugt mit `npm run pdf`.

## Aufbau
- `spiel/` – das Spiel selbst.
  - `content/meta.js`: Version, Figuren, Ränge, Abzeichen, Challenge, Einsatzliste
  - `content/eN.js`: ein Einsatz je Datei
  - `js/engine.js`: Zustand, Punkte, Navigation, Übungsmodus, Lehrkraft-Modus
  - `js/steps.js`: Schritt-Typen story, lesson, quiz (mc/layer/pick/multi/eingabe/meldung, optional mit simuliertem `terminal` und `wireshark`-Ansicht), sort, kapsel, sealed, anklage, verhoer, urkunde, ende, dazu die Zeit-Challenge
  - `js/storage.js`: Spielstand-Kodierung mit Prüfsumme, auch von der Einsatzzentrale genutzt
- `lehrkraft/einsatzzentrale.html` – Auswertung der `.osiagent`-Dateien (Beamer, Spielstände, Aufgaben-Analyse, CSV).
- `lehrkraft/quellen/*.html` – Quellen der PDFs in `lehrkraft/`. `loesungen.html` erzeugt die Lösungen **automatisch aus den Spielinhalten**.
- `werkzeuge/` – Tests, PDF- und ZIP-Erzeugung, optionales Bildskript.
- `quellbilder/` – Original-PNGs. `spiel/img/` – verkleinerte JPGs (640 px, Qualität 82).
- `index.html` – Startseite der Online-Version (GitHub Pages veröffentlicht `main` ab Root, `.nojekyll` daneben).

## Arbeitsablauf
Voraussetzungen:
- Node.js
- ein Chromium-Browser (Edge oder Chrome). Er wird automatisch gesucht, sonst den Pfad in `CHROME_PATH` angeben.
- für die ZIP zusätzlich PowerShell 7 (`pwsh`)

```
cd werkzeuge
npm install          # nur beim ersten Mal
npm run release      # Tests + PDFs + ZIP – vor jedem Commit
```

- `npm test` spielt alle freigegebenen Einsätze durch und prüft:
  - die Werkzeuge (Terminal-Befehle, Wireshark-Filter)
  - die Antwortlängen (die richtige Antwort darf nicht auffällig länger sein)
  - Übungsmodus, Zeit-Challenge und Einsatzzentrale

  Screenshots landen in `werkzeuge/shots/`. Bei Änderungen an der Oberfläche bitte ansehen.
- `npm run pdf` erzeugt die PDFs neu. Das ist nach jeder Inhaltsänderung nötig, weil das Lösungs-PDF aus den Spielinhalten entsteht.
- `npm run zip` baut `verteilen/OSI-Agenten_v<version>.zip` (Spiel + Kurzanleitung) zum Verteilen.
- Optional: Eigene `.osiagent`-Dateien in einen Ordner `test/` im Projekt legen. Er wird von Git ignoriert. `npm test` prüft dann, ob diese Spielstände noch laden.
- Die Version in `meta.js` nur erhöhen, wenn eine neue Fassung verteilt wird.
- Commit-Nachrichten auf Deutsch, kurz: was und warum.

## Neuen Einsatz ergänzen
1. `spiel/content/eN.js` anlegen (Muster: `e1.js`) und in `meta.js` mit `status: 'offen'` eintragen.
2. Script-Tag in `spiel/index.html`, `lehrkraft/einsatzzentrale.html` und `lehrkraft/quellen/loesungen.html` ergänzen.
3. Neuer Schritt-Typ? Renderer in `spiel/js/steps.js` **und** Behandlung in `werkzeuge/test-durchlauf.js` ergänzen.
4. Debriefing-Impulse in `lehrkraft/quellen/loesungen.html` ergänzen.

## Bilder (optional)
Die fertigen Bilder liegen im Repo. Neue Bilder im selben Stil erzeugt `werkzeuge/bild.ps1` über ein lokales ComfyUI mit FLUX.2 [klein] 9B (nur das unveränderte Basismodell). Der Stil-Prompt steht im Skript, die Server-Adresse kommt aus `$env:COMFYUI_URL`. Danach mit Pillow als JPG nach `spiel/img/` verkleinern. Lichtquellen und Bildlogik prüfen.

## Lizenz deiner Beiträge
Mit einem Pull Request stellst du deinen Beitrag unter dieselben Lizenzen wie das Projekt: MIT für Code, CC BY-SA 4.0 für Inhalte (siehe [LICENSE.md](LICENSE.md)).
