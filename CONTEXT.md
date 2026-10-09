# OSI-Agenten · Operation Lohnzettel

Lernspiel als Agenten-Krimi, in dem Lernende sich das OSI-Modell erarbeiten. Fall, Figuren, Netzdaten und Didaktik stehen in `DESIGN.md`; hier stehen nur die Begriffe.

## Aufbau des Spiels

**Einsatz**:
Ein in sich geschlossener Abschnitt des Falls, meist zu einer Schicht (Einsatz 0 bis 5, dazu das Finale). Im Spiel erscheint jeder Einsatz als Akte in den Einsatzakten.
_Avoid_: Level, Kapitel, Mission, Etappe

**Akte**:
Die Bezeichnung im Spiel für einen Einsatz oder das Abschlussverhör in der Übersicht „Einsatzakten“, außerdem für einzelne freiwillige Schritte (Bonus-Akte).
_Avoid_: Ordner, Datei

**Abschlussverhör**:
Die Akte nach dem Finale, die jede Person einzeln ohne Punkte, Tipps und zweiten Versuch beantwortet. Sie dient nur der Diagnose und zählt nicht zum Fall-Fortschritt.
_Avoid_: Test, Klausur, Abschlussprüfung

**Verhörfrage**:
Eine Frage im Abschlussverhör, ohne Punkte, Tipp und zweiten Versuch, von jeder Person einzeln beantwortet. Sie ist keine Aufgabe, ihre ID ist aber genauso fest.
_Avoid_: Prüfungsfrage, Testfrage

**Schritt**:
Eine Station innerhalb eines Einsatzes, z. B. Story, Lektion, Quiz oder Außeneinsatz. Jeder Schritt hat eine feste ID, die nie geändert wird.
_Avoid_: Seite, Station, Level

**Aufgabe**:
Eine einzelne bewertete Frage oder Zuordnung innerhalb eines Schritts. Jede Aufgabe hat eine feste ID und bringt Punkte.
_Avoid_: Item, Übung

**Lektion**:
Ein Schritt, der neuen Stoff vermittelt. Abgefragt wird nur, was vorher in einer Lektion stand oder als Vorwissen vorausgesetzt ist.
_Avoid_: Lerneinheit, Theorie

**Bonus-Akte**:
Ein freiwilliger Schritt mit Aufgaben, der Zusatzpunkte bringt und den Fortschritt nicht blockiert.
_Avoid_: Zusatzaufgabe, Außeneinsatz

**Außeneinsatz**:
Praktische Aufgabe an einem Netz, die zu einem Einsatz gehört und im Spiel mit Auftrag und Fragen steht. Bisher sind das immer Simulationsnetze, künftig können auch Labornetze dazukommen. Sie blockiert den Fortschritt nicht und kann später nachgeholt werden; ihr Inhalt ist trotzdem regulärer Lernstoff.
_Avoid_: Bonus, Bonusaufgabe, Pflichtaufgabe, Zusatzaufgabe

**Simulationsnetz**:
Das vorbereitete Packet-Tracer-Netz, das die Lernenden zu einem Außeneinsatz herunterladen. Mehrere Außeneinsätze können dasselbe Simulationsnetz nutzen.
_Avoid_: Labornetz, Übungsdatei, Vorlage

**Nachbildung**:
Ein Simulationsnetz, das einen Ausschnitt des Falls mit dessen Netzdaten (Adressen, Geräte, Ports) nachbildet; im Spiel ist das „Kalles Labor“. Gegenstück ist ein neutrales Simulationsnetz ohne Bezug zum Fall wie in den Außeneinsätzen von E1 und E2.
_Avoid_: Nachstellung, Rekonstruktion

**Laborhinweis**:
Ein Merkkasten im Auftrag eines Außeneinsatzes („Kalles Laborhinweis“), der offen sagt, wo das Simulationsnetz von der Wirklichkeit abweicht und worauf sich die Lernenden stattdessen verlassen sollen. Fragen setzen nie bei diesen Abweichungen an.
_Avoid_: Fehlerhinweis, Disclaimer

**Labornetz**:
Ein echtes Netz aus Hardware (Switches, Router, Kabel), das die Lernenden im Klassenraum aufbauen. Bisher nicht im Spiel; der Begriff ist dafür reserviert.
_Avoid_: Simulationsnetz, Testnetz

## Spielstand und Fortschritt

**Spielstand**:
Der gesamte Fortschritt eines Duos: gelöste Aufgaben, Punkte, Abzeichen, Position im Spiel. Der Browser hält ihn nur zur Bequemlichkeit, die Sicherung ist die Export-Datei (`.osiagent`).
_Avoid_: Savegame, Speicherstand, Account

**Duo**:
Die Bezeichnung im Spiel für den Inhaber eines Spielstands, mit Codename und ein bis zwei Agenten-Kürzeln. Sie gilt auch, wenn jemand allein spielt.
_Avoid_: Team, Gruppe, Spieler

**Agenten-Kürzel**:
Das selbst gewählte Kürzel einer Person im Duo. Es ersetzt den Namen, damit kein Klarname im Spielstand steht.
_Avoid_: Name, Benutzername

**Freigabestufe**:
Der Rang eines Duos, der mit den Punkten steigt.
_Avoid_: Rang, Level, Dienstgrad

**Abzeichen**:
Eine Auszeichnung für ein bestimmtes Ergebnis, z. B. einen Einsatz ohne Tipp. Manche sind geheim.
_Avoid_: Badge, Achievement, Orden

**Übungsmodus**:
Das Wiederholen erledigter Schritte über „Nochmal üben“. Es gibt und kostet keine Punkte; der erste Durchgang bleibt maßgeblich. Fehlerfrei und ohne Tipp gilt ein Schritt als gemeistert.
_Avoid_: Wiederholung, Trainingsmodus

**Zeit-Challenge**:
Freiwilliges Schichten-Zuordnen gegen die Uhr, das einzige Element mit Zeitdruck.
_Avoid_: Quiz, Wettbewerb

## Hilfen und Zusatzwissen

**Tipp**:
Ein Hinweis von Kalle zu einer Aufgabe, den die Lernenden anfordern. Er kostet Punkte.
_Avoid_: Hilfe, Lösungshinweis

**Profi-Tipp**:
Vertiefendes Zusatzwissen im Spieltext. Er ist freiwillig, hat keine Aufgaben und ist nicht prüfungsrelevant.
_Avoid_: Exkurs, Bonus, Zusatzinfo

**Agenten-Handbuch**:
Das jederzeit aufrufbare Nachschlagewerk im Spiel. Es enthält die Schichten L1–L7 und die Befehlsreferenz und ist immer vollständig, unabhängig vom Spielfortschritt.
_Avoid_: Hilfe, Glossar

**Befehlsreferenz**:
Teil des Agenten-Handbuchs mit den Befehlen, die im Spiel und in den Außeneinsätzen gebraucht werden, gegliedert nach Umgebung (Windows-Eingabeaufforderung, Cisco IOS) und bei Cisco nach Gerät und Modus (`Switch>`, `Switch#`, …).
_Avoid_: Spickzettel

**Spickzettel**:
Die Befehlsliste im simulierten Terminal eines einzelnen Schritts.
_Avoid_: Befehlsreferenz, Hilfe

**Verdächtigen-Board**:
Die Übersicht der Verdächtigen mit Stempeln wie „VORERST ENTLASTET“ oder „ENTLASTET“, die sich im Lauf des Falls ändern.
_Avoid_: Pinnwand, Tatverdächtigenliste

## Lehrkraft

**Lehrkraft-Modus**:
Ein mit Passwort geschützter Modus im Spiel, in dem die Lehrkraft frei springen und das Abschlussverhör für einen Spielstand freigeben kann.
_Avoid_: Admin-Modus, Debug-Modus

**Einsatzzentrale**:
Die Auswertungsseite der Lehrkraft für eingesammelte Spielstände: Beamer-Ansicht für die Klasse und Lehrkraft-Ansicht mit Fehlerquoten je Aufgabe.
_Avoid_: Dashboard, Lehrerkonsole

**Debriefing**:
Die Nachbesprechung eines Einsatzes im Unterricht, gestützt auf das Lösungs-PDF.
_Avoid_: Besprechung, Auswertung
