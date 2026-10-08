# Spielstand als exportierte Datei mit Prüfsumme statt Server und Login

Ohne Server gibt es keine zentrale Speicherung, und personenbezogene Daten sollen ohnehin nicht online liegen. Der Spielstand wird deshalb als `.osiagent`-Datei exportiert und bei der Lehrkraft abgegeben; statt Namen stehen darin nur selbst gewählte Agenten-Kürzel. Die Prüfsumme erkennt beschädigte oder von Hand veränderte Dateien, ist aber bewusst kein Schummelschutz: Punkte dienen der Motivation, nicht der Benotung.

## Consequences

Spielstände leben unbegrenzt in fremden Händen weiter. IDs von Schritten und Aufgaben dürfen deshalb nie geändert oder wiederverwendet werden, gestrichene IDs kommen in `OSI.ausgemustert`, und jede Version muss alte Spielstände laden.
