# `main` ist sofort live, kein eigener Live-Branch

GitHub Pages veröffentlicht `main` direkt für die spielenden Klassen. Ein getrennter Live-Branch hätte unfertige Stände abgeschirmt, wurde aber als dauerhafter Mehraufwand verworfen. Stattdessen wird nur gepusht, was mit `npm run release` getestet und fertig ist; Unfertiges bleibt lokal. Jeder Push, der Spiel oder Material ändert, ist zugleich eine neue Version (ADR 0006).
