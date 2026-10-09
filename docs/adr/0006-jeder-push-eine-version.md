# Jeder Push, der Spiel oder Material ändert, ist eine Version mit ZIP

Weil `main` sofort live ist (ADR 0003), ist jeder Push eine Veröffentlichung. Damit Online-Version, Versionsnummer im Spiel und ZIP nie auseinanderlaufen, bekommt jeder Push mit Änderungen in `spiel/` oder `lehrkraft/` eine neue Version und ein GitHub-Release mit ZIP. Ob eine Lehrkraft die neue ZIP an ihre Lerngruppe verteilt, entscheidet sie davon unabhängig. Reine Änderungen an Doku und Werkzeugen sieht niemand im Spiel, sie bekommen keine Version.

Die ZIP bleibt neben der Online-Version nötig: Den Spielordner allein bietet GitHub nicht zum Download an (nur das ganze Repo samt Lösungen), und die ZIP ist der Weg ohne Internet und ohne Anfragen an GitHub.

## Versionsnummer
- **Patch:** Korrekturen an Texten, Fragen und kleinen Fehlern.
- **Minor:** neuer Inhalt oder neue Funktion.
- **Major:** wesentliche Veränderung am Spiel, z. B. ein neuer Fall oder ein grundlegender Umbau. Ob alte Spielstände dann noch laden, wird beim Planen entschieden. Bis dahin gilt die Grundregel, dass sie weiter laden.

## Considered Options
- **ZIP nur ab und zu, Version nur dafür:** verworfen. Online stünde eine alte Versionsnummer neben neuem Inhalt, und ob eine Änderung eine ZIP wert ist, stünde jedes Mal neu zur Entscheidung.
- **Nur Online-Version, keine ZIP:** verworfen, siehe oben (kein Download nur des Spiels, kein Weg ohne Internet).
