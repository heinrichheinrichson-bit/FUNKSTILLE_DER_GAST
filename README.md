# FUNKSTILLE: DER GAST

Chatbasiertes Antarktis-Horrorspiel über Dr. Mira Lindner und eine zufällige Verbindung zur isolierten Station Kaldstad.

## Projektstruktur

| Ordner / Datei | Inhalt |
|---|---|
| `KANON-ENTSCHEIDUNGEN.md` | verbindlicher Kanon |
| `MASTER-STORY-MAP.md` | Gesamtfluss, Zustände und Enden |
| `story/` | lesbare Produktionsfassungen aller acht Kapitel |
| `data/state-schema.json` | zentrale Definition aller Spielzustände |
| `data/chapter-01.json` | erstes vollständig strukturiertes Kapitel |
| `docs/STORY-DATENFORMAT.md` | technisches Storyformat |
| `tools/validate-story.ps1` | statische Datenprüfung |
| `tools/audit-paths.ps1` | Simulation aller erreichbaren Zustandswege |

## Aktueller Stand

- Vollständige Story-Erstfassung für acht Kapitel
- acht definierte Enden
- Kapitel 1 als maschinenlesbare Storydaten
- 27 strukturierte Nodes in Kapitel 1
- alle Nodes erreichbar
- 932 simulierte Node-/State-Konfigurationen
- keine ungültigen Übergänge oder Deadlocks

## Prüfkommandos

Da Windows die lokale Skriptausführung standardmäßig blockieren kann:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\validate-story.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\audit-paths.ps1
```

Die Ausführungsrichtlinie wird dabei nur für den gestarteten Prüfprozess umgangen und nicht dauerhaft geändert.

## Nächste technische Schritte

1. Kapitel 2–8 schrittweise in dasselbe Datenformat überführen.
2. Globale `endings.json` und Kapitelübergänge registrieren.
3. Eine minimale Story-Engine mit Speichern/Laden implementieren.
4. Kapitel 1 als interaktiven Prototyp spielbar machen.

