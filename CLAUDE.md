# OSI-Agenten · Operation Lohnzettel – Hinweise für Claude Code

Serverloses HTML-Lernspiel (Agenten-Krimi), in dem Lernende sich das OSI-Modell **erarbeiten**. Es wird im Unterricht gespielt, und das öffentliche Repo ist zugleich die Online-Version (GitHub Pages).

Alle Regeln, der Aufbau und der Arbeitsablauf stehen in CONTRIBUTING.md und gelten vollständig:

@CONTRIBUTING.md

**Vor inhaltlicher Arbeit immer `DESIGN.md` lesen.**

## Zusätzlich für Claude
- Über Inhalte entscheidet die Lehrkraft (Maintainer). Vor neuen Konzepten mit unklarem Vorwissen sie fragen.
- Was im Gespräch über den Unterricht erzählt wird, ist Kontext. In Dateien, Commits und Issues fließt nur das Fachliche, anonym formuliert (siehe Grundregeln).
- Erst `npm run release`, dann committen und **pushen**. Pages veröffentlicht `main` sofort für die spielenden Klassen, deshalb nur fertige, getestete Stände. Keine weiteren Remotes anlegen.
- Vor jedem Push mit Änderungen in `spiel/` oder `lehrkraft/` die Version in `meta.js` erhöhen (Patch, Minor oder Major laut ADR 0006, im Zweifel die Lehrkraft fragen), den Changelog-Abschnitt anlegen und nach dem Push das GitHub-Release erstellen.

## Agent skills
Die Dateien in `docs/agents/` konfigurieren die Agent-Skills aus [mattpocock/skills](https://github.com/mattpocock/skills), einer Skill-Sammlung für Claude Code. Wer diese Skills nicht nutzt, kann sie ignorieren.

### Issue tracker
Issues liegen als GitHub Issues im Repo `GlasiDe/osi-agenten` (`gh`-CLI). See `docs/agents/issue-tracker.md`.

### Triage labels
Standard-Vokabular: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs
Single-context (`DESIGN.md` im Root, dazu bei Bedarf `CONTEXT.md` und `docs/adr/`). See `docs/agents/domain.md`.
