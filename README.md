# FUNKSTILLE: DER GAST

Chatbasiertes Antarktis-Horrorspiel über Dr. Mira Lindner und eine zufällige Verbindung zur isolierten Station Kaldstad.

## Projektstruktur

| Ordner / Datei | Inhalt |
|---|---|
| `KANON-ENTSCHEIDUNGEN.md` | verbindlicher Kanon |
| `MASTER-STORY-MAP.md` | Gesamtfluss, Zustände und Enden |
| `story/` | lesbare Produktionsfassungen aller acht Kapitel |
| `data/state-schema.json` | zentrale Definition aller Spielzustände |
| `data/chapter-01.json` | Beginn der drei vollständig strukturierten Kapitel |
| `docs/STORY-DATENFORMAT.md` | technisches Storyformat |
| `src/story-engine.mjs` | UI-unabhängige Story-Engine |
| `tools/validate-story.ps1` | statische Datenprüfung |
| `tools/audit-paths.ps1` | Simulation aller erreichbaren Zustandswege |
| `tests/` | automatisierte Engine-Tests |
| `game/` | spielbarer Smartphone-Webprototyp |

## Aktueller Stand

- Vollständige Story-Erstfassung für acht Kapitel
- acht definierte Enden
- Kapitel 1 bis 6 als maschinenlesbare Storydaten
- 191 strukturierte Nodes in Kapitel 1 bis 6
- alle Nodes erreichbar
- Kapitel 6 in vier Ausrüstungslagen mit insgesamt 159 Node-/State-Konfigurationen geprüft
- keine ungültigen Übergänge oder Deadlocks
- Story-Engine mit Zuständen, Bedingungen, verdeckten Weiterleitungen, Textvarianten und Save/Restore
- automatische GitHub-Prüfung bei jedem Push
- responsiver Sechs-Kapitel-Prototyp mit lokalem Spielstand und Demo-Zeitsprüngen
- nahtlose, gespeicherte Übergänge zwischen allen spielbaren Kapiteln

## Prüfkommandos

Da Windows die lokale Skriptausführung standardmäßig blockieren kann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\validate-story.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\audit-paths.ps1
npm test
```

Die Ausführungsrichtlinie wird dabei nur für den gestarteten Prüfprozess umgangen und nicht dauerhaft geändert.

## Nächste technische Schritte

1. Kapitel 7 und 8 in dasselbe Datenformat überführen.
2. Globale `endings.json` und Kapitelübergänge registrieren.
3. Kapitel 7 „Eine Dosis“ mit Hemmstoffherstellung und Verteilung integrieren.
