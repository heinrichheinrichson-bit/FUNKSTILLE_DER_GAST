# FUNKSTILLE / DER GAST – Bestandsaufnahme

Stand: 28.07.2026

## Kurzfazit

Das Projekt besteht derzeit aus zwei Entwicklungsstufen:

1. **„Funkstille“** – ein kleiner, bereits spielbarer Web-Prototyp über den verunglückten Gleitschirmflieger Jonas.
2. **„Der Gast“** – das wesentlich größere Antarktis-Horror-Konzept um Dr. Mira Lindner auf Station Kaldstad.

„Der Gast“ besitzt bereits ein tragfähiges Grundkonzept und rund 70 Story-Nodes. Es ist aber noch **kein durchgehend spielbarer Storybaum** und noch nicht bis zu 16 Enden ausformuliert. Die vorhandenen Storymodule sind ein Szenengerüst mit mehreren technischen und erzählerischen Platzhaltern.

## Kanonische Dateien

Diese Dateien bilden den aktuellen Kern:

| Inhalt | Datei / Quelle | Status |
|---|---|---|
| Prämisse, Figuren, Regeln | `story-bible.md` | Referenzdokument |
| Karte und 16 Ending-IDs | `world-structure.md` | Referenzdokument |
| Vorgeschichte | `log-liste.md` aus `files.zip` | 10 geplante Logs |
| Wohntrakt-Flow | `flowchart-wohntrakt.md` aus `files2.zip` | vorhanden |
| Labor-Flow | `flowchart-laborfluegel.md` aus `files2.zip` | vorhanden |
| Generator-Flow | `flowchart-generatorhaus.md` aus `files2.zip` | vorhanden |
| Gletscherspalten-Flow | `flowchart-gletscherspalten.md` | vorhanden |
| Rettungs-Flow | `flowchart-rettungssequenz.md` aus `files 3.zip` | vorhanden |
| Storydaten Teil 1–2 | lose `.js`-Dateien | vorhanden |
| Storydaten Teil 3–7 | `files 4.zip` | vorhanden |
| Früher Web-Prototyp | `lifelineclon.zip` | separate Vorstufe |

`story-bible.md` und `story-bible_1.md` sind bytegleich. Dasselbe gilt für `world-structure.md` und `world-structure_1.md`. Die `_1`-Dateien enthalten daher keinen zusätzlichen Stand.

## Aktueller Storyablauf

1. **Wohntrakt:** Kontaktaufnahme, erste Orientierung, Thal-Log, Begegnung mit Aksel.
2. **Erste Richtungswahl:** Labor oder Generatorhaus.
3. **Labor:** Untersuchung der Probe, möglicher Infektionspfad, Kontakt mit Kader.
4. **Generatorhaus:** Außenweg, mögliche Hilfe durch Aksel, Reparaturentscheidung.
5. **Außenposten:** langer Kälteweg, Begegnung mit Reyes oder leerer Station.
6. **Bohrturm:** Kader-Spur, Kernkammer, Versiegeln / Probe / tiefer bohren.
7. **Gletscherspalten:** versteckter Unterschlupf, Kader oder Notizen, alte Probe.
8. **Rettung:** Notruf, Hubschrauber, Abschied, sauberes oder infiziertes Grundfinale.

Die geplante Karte ist hubbasiert, die Storydaten bilden aktuell aber überwiegend eine lineare Reihenfolge mit lokalen Entscheidungen ab.

## Was schon gut funktioniert

- Starke, klar unterscheidbare Prämisse mit eigenem Schauplatz.
- Mira hat eine brauchbare Stimme: sachlich, beobachtend, nicht actionheldenhaft.
- Kälte, Klarheit, Vertrauen und Infektion können erzählerisch und mechanisch ineinandergreifen.
- Die verzögerte Chat-Kommunikation passt organisch zu Wegen im Whiteout.
- Der stärkste Kern ist die Unsicherheit, ob Mira selbst infiziert ist.
- Die bittersüßen Rettungsenden besitzen eine klare emotionale Identität.
- Kurze lokale Verzweigungen führen wieder zusammen und halten den Produktionsumfang grundsätzlich kontrollierbar.

## Kritische Widersprüche

### 1. Mira ist vor Spielbeginn möglicherweise schon infiziert

Die Story-Bible legt fest, dass Mira **nicht am Spielanfang** infiziert sein soll und die Infektion an einem später rekonstruierbaren Punkt erfolgt. Das Berg-Log von Tag −5 sagt jedoch: „Mira riecht komisch“ und bezeichnet dies sogar als Schlüsselhinweis auf ihre spätere Infektion. Beides kann nicht gleichzeitig kanonisch sein.

**Empfehlung:** Das Log auf eine andere Figur beziehen oder als harmlosen roten Hering behandeln. Miras echte Infektionspunkte sollten ausschließlich aus Spielerentscheidungen während des Spiels entstehen.

### 2. Ingrid Thal und Reyes konkurrieren um dieselbe Funktion

Die Story-Bible nennt Ingrid Thal als Kommunikationsoffizierin. Am Außenposten erscheint plötzlich eine Funktechnikerin namens Reyes, die in der Bible nicht vorkommt. Gleichzeitig entscheidet das gefundene Thal-Log, ob Reyes dort lebt.

**Empfehlung:** Entweder Reyes streichen und Thal zur möglichen Überlebenden machen oder Reyes als vierte Hauptfigur vollständig in Bible, Logs und Ending-System aufnehmen.

### 3. Hubs existieren im Konzept, aber nicht im Storybaum

Mehrere Bereiche führen zu `wohntrakt_hub`, doch ein solcher Node ist nicht definiert. Ebenso fehlt die Logik, die nach abgeschlossenen Bereichen neue Ziele freischaltet.

**Empfehlung:** Einen echten zentralen Hub mit Prioritäten und Gates bauen. Er muss verhindern, dass Bereiche doppelt oder in unmöglicher Reihenfolge betreten werden.

### 4. „Alle 16 Enden durchgeschrieben“ trifft noch nicht zu

Die Rettungssequenz endet in `PENDING_good`, `PENDING_bittersweet` oder `PENDING_no_rescue`. Weitere Game-Overs besitzen ebenfalls `PENDING`-IDs. Die konkreten Bedingungen und Texte für den Großteil der 16 Enden fehlen.

## Fehlende Bausteine

### Story und Entscheidungen

- Flowcharts für **Außenposten** und **Bohrturm**
- echter Wohntrakt-Hub nach der ersten Rückkehr
- Freischaltlogik für Außenposten, Bohrturm, Gletscherspalten und Rettung
- konkrete Szenen für Temperatur-, Gesundheits- und Klarheitsänderungen
- sichtbare Folgen niedriger Klarheit; bislang existieren hauptsächlich Hint-Flags
- Heilmittel-Herstellung und das angekündigte Verteilungsdilemma
- Entscheidung über Aksel, Kader, Thal/Reyes und mögliche Evakuierung
- mehrere unabhängige, klar rekonstruierbare Infektionspfade
- sauberer, seltener Null-Infektionspfad
- vollständige Texte und Bedingungen für alle Hauptenden

### Logs

Geplant sind zehn Logs, in den Storydaten werden aber nur wenige tatsächlich vergeben. Für jeden Log fehlen noch:

- finaler Wortlaut,
- Fund-Node,
- UI-Typ (Text, Audio, beschädigtes Fragment),
- Flag-Name,
- spätere Auswirkung.

### Technik

- zentrale State-/Flag-Definition mit Standardwerten
- Bedingungsauswertung für `branch_condition`
- Wahrscheinlichkeits- oder besser zustandsbasierte Auflösung der Risk-Nodes
- Ressourcenmodell für Temperatur, Gesundheit, Klarheit und Relais
- Inventar und Zugangsvoraussetzungen
- NPC-Vertrauenswerte
- Ending-Resolver
- Zusammenführung der sieben Storyobjekte
- Prüfung auf unerreichbare Nodes und ungültige Übergänge
- Speichern/Laden und Behandlung echter Wartezeiten

## Empfohlene Produktionsreihenfolge

1. **Kanon festziehen:** Titel, Besetzung, Infektionsregel und tatsächliche Reihenfolge entscheiden.
2. **Master-State-Liste erstellen:** Jede Ressource, jedes Item und jedes Flag mit Typ, Startwert und Wirkung.
3. **Hub und Gates schließen:** Einen vollständigen Weg vom Start bis zur Rettung ohne Platzhalter herstellen.
4. **NPC-Bögen ergänzen:** Aksel, Kader und Thal oder Reyes jeweils mit Begegnung, Vertrauensfolge und Ending-Auswirkung.
5. **Heilmittel-Dilemma bauen:** Fund, Herstellung, Menge, Verteilung und Konsequenzen.
6. **Enden reduzieren und konkretisieren:** Zunächst 6–8 deutlich verschiedene Enden statt 16 nomineller Varianten.
7. **Logs ausformulieren und verteilen.**
8. **Erst danach Dialogmenge und Echtzeit-Wartezeiten ausbauen.**

## Sinnvoller MVP

Für eine erste vollständige spielbare Fassung:

- Wohntrakt → Labor oder Generator → Bohrturm → Rettung
- Aksel und Kader als aktive NPCs
- Temperatur, Klarheit und ein Vertrauenswert
- drei Infektionspfade plus ein sauberer Pfad
- sechs Enden:
  - sauber gerettet,
  - infiziert und unwissend gerettet,
  - wissentlich infiziert gerettet,
  - Station eingedämmt / Selbstopfer,
  - Tod durch Kälte,
  - Verbindung endgültig verloren.

Außenposten, Gletscherspalten, Reyes/Thal-Zusatzbogen und weitere Ending-Varianten können danach als zweite Ausbaustufe folgen.

## Verbindliche Arbeitsdateien

Die nächsten beiden Grundlagen wurden inzwischen erstellt:

1. `KANON-ENTSCHEIDUNGEN.md` – offene Widersprüche mit finaler Entscheidung.
2. `MASTER-STORY-MAP.md` – Kapitel, Gates, Zustände, NPC-Verläufe und Enden in einer gemeinsamen Übersicht.

Bei der weiteren Entwicklung haben diese beiden Dokumente Vorrang vor den älteren Flowcharts und Storymodulen.

## Ergänzende Ideensammlung

Die parallele Datei `Antarktis-Horror_Ideensammlung_v0.1.md` wurde ebenfalls ausgewertet. Die konkrete Übertragung geeigneter Ideen ist in `IDEENTRANSFER_ANTARKTIS_HORROR.md` dokumentiert.
