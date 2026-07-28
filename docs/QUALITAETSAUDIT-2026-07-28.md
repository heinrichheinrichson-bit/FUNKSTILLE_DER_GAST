# Qualitätsaudit – 28.07.2026

## Kurzfazit

Die aktuelle Fassung ist technisch konsistent und vollständig vom ersten bis
zum achten Kapitel strukturiert. Alle 242 Nodes sind erreichbar. In den
geprüften Zustandsmatrizen wurden keine Sackgassen gefunden, und alle acht
Ending-IDs werden durch gezielte Tests erreicht.

Der größte verbleibende Arbeitsblock ist nicht die Engine, sondern die
redaktionelle Vertiefung: 562 Storymeldungen enthalten zusammen ungefähr 4.500
Wörter. Für die geplanten 4–6 Stunden entsteht daher noch ein großer Teil der
Spieldauer durch Wartezeiten. Besonders Kapitel 5–8 benötigen mehr
Beziehungsdialoge, Konsequenzreaktionen und zustandsabhängige Varianten.

## Automatisch geprüft

- 242 eindeutige und erreichbare Story-Nodes
- 196 Choices
- 562 einzelne Storymeldungen
- alle referenzierten Nodes, States, Operatoren, Effekte, Handoffs und Endings
- 25 repräsentative Kapitelmatrizen für unterschiedliche Eingangsbedingungen
- 132.390 begrenzte kapitelübergreifende Zustandskonfigurationen
- gezielte Resolver-Tests für alle acht Hauptenden
- Save/Restore der Story-Engine
- versteckte Redirects und Textvarianten
- Zustandsgrenzen bei additiven Effekten
- Codeeingabe und freie Namenseingabe
- Produktions-Build und serverseitig gerenderte Anwendung
- Übereinstimmung zwischen `data/` und `game/public/data/`

## Ergebnis

- keine ungültigen Übergänge
- keine gefundenen Deadlocks
- keine unerreichbaren Nodes
- keine unbekannten States
- keine überlangen Storyblasen über 220 Zeichen
- keine überlangen Choice-Texte über 105 Zeichen
- nur ein bewusst dichter Node mit acht Nachrichten (`k1_120_double_crisis`)
- alle acht Enden besitzen getestete Auflösungswege

## Direkt behobene Kleinigkeiten

- plattformunabhängige Build-, Start- und Entwicklungsbefehle
- zusätzlicher kapitelübergreifender Audit
- gezielte Tests für sämtliche Ending-Resolver
- Abschiedsvariante für bekannten Spielernamen bei niedrigem Mira-Vertrauen
- veraltete Statusangaben in README und Story-README korrigiert
- Storykopien für die Webfassung synchronisiert

## Festgestellte Risiken und Empfehlungen

### 1. Dialogumfang und emotionale Entwicklung – hohe Priorität

Die technische Story ist vollständig, aber mit ungefähr 4.500 gesprochenen
Wörtern noch knapp. Die Erweiterung sollte nicht durch längere Infoblöcke
erfolgen, sondern durch:

- Reaktionen auf frühere Entscheidungen
- ruhigere Gespräche zwischen Krisen
- unterschiedliche Mira-Töne abhängig von Vertrauen und Klarheit
- stärkere Beziehungen zu Aksel, Thal und Kader
- kurze Rückbezüge auf zurückgelassene Personen und Gegenstände
- individuellere Vor- und Nachbereitung der Enden

### 2. Logs und Dokumente – hohe Priorität

Die Story-Bible plant 12–15 Logs. Das spielbare Archiv zeigt derzeit fünf
Einträge; das State-Schema besitzt nur drei ausdrücklich mit `log_` benannte
States. Empfohlen werden zusätzliche persönliche, technische, medizinische und
meteorologische Dokumente. Sie sollten nicht nur Hintergrund erzählen, sondern
Codes, Widersprüche und Entscheidungshilfen liefern.

### 3. Reale Gesamtdurchläufe – hohe Priorität

Der vollständige Zustandsraum wächst auf mehrere hunderttausend bis Millionen
Kombinationen. Die lokale Kapitelprüfung ist vollständig; der
kapitelübergreifende Test ist deshalb bewusst begrenzt. Zusätzlich sollten
kuratierte Gesamtrouten für jedes Ende entstehen, die konkrete Choices vom
ersten Signal bis zum Ending festhalten.

### 4. Save-Migration – hohe Priorität vor öffentlicher Beta

Der lokale Spielstand verwendet weiterhin den Schlüssel
`funkstille-der-gast-save-v1`. Vor weiteren Änderungen am Datenformat sollte
eine Versions- und Migrationslogik eingeführt werden. Andernfalls können ältere
Spielstände nach größeren Storyumbauten an einem entfernten Node stehen.

### 5. Smartphone-Hintergrundbetrieb – hohe Priorität vor Beta

Wartezeiten werden nach erneutem Öffnen korrekt fortgesetzt. Noch nicht
vorhanden sind echte Push-Benachrichtigungen, wenn Mira zurückkehrt. Außerdem
müssen Hintergrundtimer, Ton und Vibration auf realen iOS- und Android-Geräten
getestet werden.

### 6. Wartezeiten – mittlere Priorität

Die Storydaten enthalten insgesamt viele lange Verzögerungen; diese Summe
entspricht keinem einzelnen Durchgang, zeigt aber den Schwerpunkt des Systems.
Jeder kuratierte Gesamtdurchlauf sollte deshalb auf folgende Fragen geprüft
werden:

- Ist vor jeder langen Pause klar, was Mira tut?
- Rechtfertigt die Handlung die Dauer?
- Kommt die erste längere Pause erst nach ausreichender Bindung?
- Häufen sich mehrere lange Pausen ohne neue Entscheidung?
- Ist der Aktivitätsstatus konkret genug?

### 7. Zustandsbereinigung – mittlere Priorität

Von 104 definierten States werden 101 durch die Story gesetzt und 65 in
Bedingungen ausgewertet. 39 dienen aktuell nur als Fortschritts-, Karten-,
Archiv- oder Buchhaltungszustände. Das ist nicht automatisch ein Fehler, sollte
vor der Beta aber dokumentiert werden, damit tote Zustände nicht dauerhaft
mitgeschleppt werden.

### 8. Lesbare Produktionsfassungen – mittlere Priorität

Die JSON-Storydaten sind inzwischen aktueller als mehrere Markdown-Fassungen.
Insbesondere Kapitel 1 beschreibt teilweise noch alte Nodes und Wartezeiten.
Nach der nächsten Dialogrunde sollten die lesbaren Fassungen automatisch aus
den Storydaten erzeugt oder verbindlich synchronisiert werden.

### 9. Karte – mittlere Priorität

Die Karte besitzt inzwischen unterschiedliche Gebäudeformen und progressive
Innenansichten. Noch offen:

- präzise Türen und Schleusen
- Position der Sicherungsleinen
- beschädigte oder unpassierbare Wege
- letzter verlässlich bekannter NPC-Standort
- Unterscheidung zwischen selbst gesehen, aus Plänen bekannt und nur vermutet
- Innenkarten für Außenposten, Bohrturm und Notunterkunft

### 10. Visuelle und barrierefreie Prüfung – mittlere Priorität

Build und Server-Rendering sind geprüft. Eine vollständige Geräteprüfung bleibt
notwendig:

- kleine und sehr große Smartphone-Displays
- Bildschirmtastatur bei Name und Code
- Zoom und größere Systemschrift
- Kontrast und Farbenblindheit
- reine Tastaturbedienung
- Screenreader-Beschriftungen
- Scrollverhalten bei eingehenden Nachrichten

## Empfohlene Reihenfolge

1. Kuratierte Komplettläufe für alle acht Enden automatisieren.
2. Kapitel 1 und 2 redaktionell auf Demoqualität bringen.
3. Archiv auf mindestens 12 relevante Dokumente ausbauen.
4. Save-Versionierung und Migration ergänzen.
5. Karte vervollständigen.
6. Kapitel 3–8 redaktionell vertiefen.
7. PWA, Push-Benachrichtigungen und reale Gerätetests.
8. Externe Testspieler und anschließender Balancing-Durchgang.
