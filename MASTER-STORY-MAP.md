# FUNKSTILLE: DER GAST – Master-Story-Map

Version 1.0 · 28.07.2026

Diese Map beschreibt den verbindlichen Gesamtfluss der ersten vollständigen Fassung. Sie ist noch kein Dialogskript. Ein Eintrag entspricht einem Story-Beat, der beim Schreiben aus mehreren Chat-Nodes bestehen kann.

## 1. Gesamtstruktur

```text
K1 Verbindung
    ↓
K2 Licht oder Wahrheit
    ├── Labor zuerst ─────┐
    └── Generator zuerst ─┤
                          ↓
K3 Der Marsch
                          ↓
K4 Das Wetterfenster / Außenposten
                          ↓
K5 Der Ursprung / Bohrturm
                          ↓
                  Koordinaten gefunden?
                    ├── nein ───────────┐
                    └── ja → K6 optional│
                                       ↓
K7 Gegenmittel und letzte Vorbereitung
                          ↓
K8 Rettung und Ending-Resolver
```

Der Wohntrakt ist zwischen den Kapiteln 2–7 der wiederkehrende Hub. Er bietet nur Entscheidungen an, deren Voraussetzungen erfüllt sind.

## 2. Kapitel 1 – Die Verbindung

**Ziel:** Mira etablieren, Relais erklären, Aksel einführen und das erste Misstrauen säen.

### K1.1 – Unbekannter Kontakt

Mira meldet sich nach einer Bewusstlosigkeit. Notbeleuchtung, Kälte und ein metallischer Geruch. Sie weiß nicht, wie lange sie weg war.

Antwort:

- **Nach Verletzungen sehen:** `mira_wound_known`, Klarheit stabil.
- **Sofort Umgebung prüfen:** früher Fund des beschädigten Korridors, leichte Belastung.

Beide Wege führen zu K1.2.

### K1.2 – Das Relais

Mira erkennt, dass ihr Notrelais nicht mit dem Basislager, sondern mit einem fremden Gerät gekoppelt ist. Der Spieler kann seine Identität nicht verifizieren; Mira muss entscheiden, ob sie der Verbindung vertraut.

Frühe Tonentscheidung:

- ruhig und ehrlich → `trust_mira +1`
- bestimmend → kein direkter Verlust, spätere Widerstände wahrscheinlicher
- scherzhaft / ausweichend → `trust_mira -1`

### K1.3 – Wohntrakt durchsuchen

Zwei kurze Unterräume, beide später erneut erreichbar:

- **Kantine:** Wasser, versiegelte Ration, Frachtmanifest.
- **Schlafquartiere:** Thals Log Tag −7, Verbandskasten.

Die Ration und das Verbandsmaterial werden noch nicht benutzt. Sie werden als mögliche spätere Infektionsquellen etabliert.

### K1.4 – Begegnung mit Aksel

Aksel kommt aus einem dunklen Korridor. Er behauptet, am Generator gearbeitet zu haben. An seiner Jacke befindet sich Bohrstaub.

Entscheidung:

- bei Mira bleiben lassen → `trust_aksel +1`, Aksel hilft später
- Abstand verlangen → neutral
- in einem Raum einschließen → `trust_aksel -2`, Werkzeug zunächst nicht verfügbar

Keine Variante bestätigt seinen Zustand.

### K1.5 – Erste Krise

Der Strom fällt auf Notbetrieb. Gleichzeitig entdeckt Mira, dass im Labor noch eine Probe erwärmt wird.

Wahl:

- **Labor zuerst** → K2-L
- **Generator zuerst** → K2-G

Die nicht gewählte Krise verschärft sich, bleibt aber lösbar.

## 3. Kapitel 2 – Licht oder Wahrheit

**Ziel:** Erste echte Opportunitätskosten und erster möglicher Infektionspunkt.

## Route K2-L – Labor zuerst

### K2-L1 – Zugang

Mira benötigt den Code. Möglichkeiten:

- Thals Log korrekt deuten → geräuschloser Zugang
- Kader über internes Terminal kontaktieren → Kader erfährt von Miras Standort
- Tür mit Aksels Hilfe öffnen → nur bei ausreichendem Vertrauen

### K2-L2 – Probe Θ

Die Probe wirkt zunächst unbeweglich. Im Zeitraffer bildet sie ein feines Netzwerk, das sich in Richtung einer Wärmequelle orientiert.

Wahl:

- **Schnellanalyse:** Erkenntnisgewinn, `infection_source = lab_aerosol`, falls kein Schutz vorhanden.
- **Vollständiges Protokoll:** keine Infektion, aber Zeitverlust; der Generator fällt vollständig aus.
- **Probe versiegeln:** sicher, aber weniger Wissen und zunächst keine Basis für Gegenmittel.

### K2-L3 – Krankenstation

Die Tür wird von **Liv Sørensens** Leiche blockiert. Die Stationsärztin liegt blutend zwischen Untersuchungsliege und Medikamentenschrank. Mira kann ihr Gesicht bedecken und trauern oder trotz ihrer Erschütterung die Todesumstände untersuchen. Beide Varianten machen deutlich, dass Mira die Tote persönlich kannte.

Mira kann ihre Wunde versorgen:

- versiegeltes Material → sicher
- beschädigte Packung → `infection_source = contaminated_dressing`
- nicht behandeln → Verletzungszustand bleibt und erschwert Außenwege

Die beschädigte Packung ist nur dann infektiös, wenn das Frachtmanifest zuvor eine Manipulation belegt; andernfalls bleibt sie ein roter Hering.

### K2-L4 – Kaders Nachricht

Kader meldet sich über das interne System. Er fordert Mira auf, nichts anzufassen und zum Bohrturm zu kommen.

Wahl:

- mit dem vertuschten Bericht konfrontieren → `trust_kader -1`, aber spätere Ehrlichkeit möglich
- Erkenntnisse verschweigen → Kader vertraut Mira oberflächlich
- Zusammenarbeit anbieten → `trust_kader +1`, Kader erhält Handlungsspielraum

Danach muss Mira zum Generator: K2-G in verschärfter Variante.

## Route K2-G – Generator zuerst

### K2-G1 – Außenweg

Erster echter Temperaturtest.

Vorbereitung:

- Jacke und Sicherungsclip prüfen → sicherer
- sofort aufbrechen → Zeitgewinn, aber `cold_exposure +1`

### K2-G2 – Werkstatt und Generator

Aksel hilft nur, wenn er frei ist und sein Vertrauen nicht zu niedrig ist.

Reparatur:

- **langsam und vollständig:** `generator = stable`, großer Zeitverlust
- **provisorisch:** `generator = unstable`, schneller
- **Relais-Ersatzteil verwenden:** Generator stabil, aber `relay_backup = false`

Kein Zufall: Ein Unfall tritt nur ein, wenn Mira verletzt, allein und zu einer schnellen Reparatur gedrängt wird. Er beschädigt das Relais und führt noch nicht sofort zum Ending.

### K2-G3 – Frachtabweichung

In der Werkstatt findet Mira die zweite Hälfte des Frachtmanifests. Medikamente und eine Werkzeugkiste wurden nach der Ankunft umgebucht, aber niemand hat unterschrieben.

Fund:

- `log_freight_manifest`
- möglicher Hinweis auf kontaminiertes Verbandsmaterial
- Ersatzfilter für Laborschutz, sofern gründlich gesucht

Danach geht Mira zum Labor: K2-L in verschärfter Variante. Bei instabilem Generator ist ein Teil der Zeitrafferaufnahme verloren.

## Zusammenführung K2-X

Nach beiden Bereichen besitzt Mira:

- einen Zustand des Generators,
- einen Stand der Laborerkenntnis,
- eine Beziehung zu Kader,
- möglicherweise ihre erste Infektionsquelle.

Sie kehrt zum Wohntrakt zurück.

## 4. Kapitel 3 – Der Marsch

**Ziel:** Aksels Schlüsselszene; Vertrauen, Klarheit und Kälte erstmals miteinander verschränken.

### K3.1 – Aksel an der Leine

Mira sieht Aksel draußen. Er antwortet nicht und löst sich von der Sicherungsleine. Falls Aksel eingeschlossen wurde, ist seine Tür offen – ohne sichtbare Beschädigung.

Wahl:

- im Wohntrakt bleiben und rufen → K3.2A
- mit Sicherungsleine folgen → K3.2B
- ohne Vorbereitung hinterher → K3.2C

### K3.2A – Nicht folgen

Aksel verschwindet im Whiteout.

Folgen:

- `aksel_march = lost`
- Temperatur bleibt stabil
- Aksels Werkzeug fehlt später
- Mira zweifelt an der Entscheidung; bei geringem Vertrauen zum Spieler sinkt ihre Klarheit

### K3.2B – Kontrolliert folgen

Mira erreicht Aksel. Er blickt auf eine Stelle im Schnee, an der nichts zu sehen ist.

Wahl:

- Abstand halten und zurückrufen
- ihn am Arm packen
- untersuchen, worauf er blickt

Mögliche zustandsbasierte Folgen:

- **Zurückrufen:** Bei hohem `trust_aksel` reagiert er und kehrt mit; sonst läuft er weiter.
- **Anfassen:** Wenn `aksel_infected = true`, wird dies zu `infection_source = aksel_contact`.
- **Stelle untersuchen:** Fund eines Ausweises von Patient Null und Koordinatenfragment; zusätzliche Kältebelastung.

### K3.2C – Unvorbereitet folgen

Mira verliert die Leine. Nur hohe Klarheit, stabile Beleuchtung oder das vorher gefundene Koordinatenfragment ermöglichen die Rückkehr.

Andernfalls endet der Weg in `ending_whiteout`.

### K3.3 – Die Rückkehr

Diese Szene tritt später während einer Ruhephase auf, falls Aksel draußen blieb oder verschwand.

Jemand klopft am Wohntrakt und behauptet, Aksel zu sein.

Prüfmöglichkeiten:

- Schleusenkamera – nur bei stabilem Generator
- private Kontrollfrage – nur bei gefundenem Aksel-Log
- medizinischer Scan – nur mit Laborzugang
- direkt öffnen
- nicht öffnen

Die Wahrheit hängt vom gespeicherten Aksel-Zustand ab, nicht von Zufall. Selbst ein nicht infizierter Aksel kann verwirrt und unterkühlt wirken.

Öffnen kann:

- einen Verbündeten retten,
- Mira über Körperkontakt infizieren,
- einen späteren Angriff ermöglichen.

Nicht öffnen kann:

- einen Infizierten aussperren,
- einen unschuldigen Aksel töten,
- das gemeinsame Rettungsende verhindern.

## 5. Kapitel 4 – Das Wetterfenster

**Ziel:** Ingrid Thal finden, Rettungsbedingungen etablieren und Beweise sichern.

### K4.1 – Zielentscheidung

Das Labor kennt eine mögliche Hemmstoffformel, aber es fehlen Wetterdaten und Thals Aufzeichnungen. Der Außenposten wird freigeschaltet.

Gate:

- ausreichender Kälteschutz,
- oder stabiler Generator plus beheizbarer Notanzug,
- oder Aksels Begleitung.

Wer ohne eine dieser Bedingungen aufbricht, wird von Mira gewarnt. Beharrt der Spieler dennoch, führt der Weg nachvollziehbar zu `ending_whiteout`.

### K4.2 – Langer Weg

Echte Wartephase. Währenddessen:

- kurze Statusmeldung,
- mögliches Geräusch neben der Leine,
- bei niedriger Klarheit widersprüchliche Entfernungsangaben.

Abseits der gelben Sicherungsleine entdeckt Mira **Tomas Nyberg**, einen tiefgefrorenen Bohrhelfer. Er kniet festgefroren im Schnee, Reif bedeckt sein Gesicht und Eiszapfen hängen aus seinem Bart. Der Spieler entscheidet, ob Mira ihn nur von der Leine aus beleuchtet oder gesichert näher herangeht. Der Fund belastet sie sichtbar und macht die tödliche Bedeutung des Whiteouts konkret.

Der Spieler kann zum Umkehren raten. Das kostet Zeit, verhindert aber keinen späteren zweiten Versuch, sofern das Wetterfenster reicht.

### K4.3 – Außenposten

Thals Zustand wird aus früheren Zeitkosten und Kaders Handlungsspielraum bestimmt:

- `thal_state = alive`
- `thal_state = missing`
- `thal_state = dead`

#### Thal lebt

Sie misstraut Mira und hält sie zunächst außerhalb der inneren Schleuse. Der Spieler muss sich zwischen Offenheit und Verschweigen möglicher Symptome entscheiden.

#### Thal fehlt

Mira findet frischen Kaffee, eine laufende Aufnahme und Spuren in Richtung Whiteout.

#### Thal ist tot

Die Todesursache bleibt mehrdeutig. Ihre Hand liegt auf dem manuellen Sendeschalter.

### K4.4 – Funde

Verbindliche Funde:

- `weather_window_known`
- `rescue_coordinates`
- Thals vollständiger Warnbericht

Optionale Funde:

- Medikamentenkiste
- Kaders gelöschte Antwort
- Nachweis, dass die Anomalie schon Jahre früher gefunden wurde
- Bohrturm-Zugangscode

### K4.5 – Bleiben oder sofort zurück

- Sturm abwarten → Temperatur erholt sich, Wetterfenster wird kürzer
- sofort zurück → zusätzliche Kälte und Verletzungsrisiko
- bei lebender Thal gemeinsam zurück → nur bei genügend Vertrauen

## 6. Kapitel 5 – Der Ursprung

**Ziel:** Ursprung rekonstruieren, Eindämmungsrichtung wählen und zweite große Infektionsentscheidung erzeugen.

### K5.1 – Vorbereitung im Hub

Vor dem Bohrturm wählt Mira begrenzte Ausrüstung:

- Schutzanzug
- Spreng-/Versiegelungsmaterial
- großer Probenbehälter
- zusätzliche Wärmequelle
- Relais-Ersatzakku

Sie kann nicht alles tragen. Aksel oder Thal erhöhen bei Begleitung die Kapazität.

### K5.2 – Bohrturm

Funde:

- Unfallbericht von Patient Null
- beschädigtes Werkzeug
- Kaders privater Log
- Nachweis der ersten Vertuschung

Damit wird der Ausbruch rekonstruierbar, aber Patient Null bleibt je nach Logkombination unsicher.

### K5.3 – Kader

Kaders Zustand hängt von Zeit und Beziehung ab:

- kooperativ
- verzweifelt und eigenmächtig
- verschwunden
- erkennbar verändert, aber nicht eindeutig infiziert

Er erklärt die Hemmstoffidee. Seine Angaben können mit Labor-Logs geprüft werden.

### K5.4 – Kernkammer

Drei Hauptentscheidungen:

#### A. Versiegeln

Benötigt Versiegelungsmaterial oder Kaders Hilfe.

- `containment = partial`
- geringe Probenmenge
- niedrigeres Infektionsrisiko
- blockiert das beste Gegenmittel ohne alten Gletscherfund

#### B. Kontrollierte Probe

Benötigt Schutzanzug und Behälter.

- `cure_material +1`
- keine Infektion bei korrekter Vorbereitung
- ohne Schutz: `infection_source = drill_sample`

#### C. Tiefer bohren

Benötigt Kaders Wissen oder vollständige Logs.

- `cure_material +2`
- Koordinaten zur alten Notunterkunft
- `containment = unstable`
- ohne vollständigen Schutz: `infection_source = deep_core`

Ein sofortiger Tod tritt nur ein, wenn der Spieler trotz zweier ausdrücklicher Warnungen ohne Schutz und bei instabiler Anlage weiterbohren lässt. Dies löst `ending_radio_silence` aus.

### K5.5 – Koordinaten

Die Gletscherspalten werden freigeschaltet, wenn mindestens eines gilt:

- Kaders vollständige Notizen gefunden
- Stelle aus dem Marsch untersucht
- Kader kooperiert

Andernfalls geht es direkt zu Kapitel 7.

## 7. Kapitel 6 – Unter dem Eis (optional)

**Ziel:** Größte Belohnung gegen Zeit-, Kälte- und Infektionsrisiko anbieten.

### K6.1 – Entscheidung

Mira kennt das Rettungsfenster. Der Abstecher kann:

- weitere Menschen rettbar machen,
- das beste Eindämmungsende ermöglichen,
- das Rettungsfenster gefährden.

Der Spieler erhält eine klare Abschätzung, aber keine garantierte Zeit.

### K6.2 – Abstieg

Erfolg hängt ab von:

- Sicherungsseil oder Aksels Werkzeug,
- Verletzungszustand,
- Temperatur,
- Begleitung.

Unzureichende Vorbereitung führt zunächst zu einem Umkehrpunkt. Nur bewusstes Weitergehen trotz Warnung kann `ending_whiteout` auslösen.

### K6.3 – Notunterkunft

Mira findet:

- eine Jahre alte Probe,
- Belege einer externen Vertuschung,
- Material für weitere Hemmstoffdosen,
- eine vorbereitete Möglichkeit zur Versiegelung oder Zerstörung des Schachts.

Kader kann hier erscheinen, wenn er zuvor verschwunden ist.

### K6.4 – Wahrheit oder Zeit

Wahl:

- nur Probe nehmen → schnell, `cure_material +2`
- vollständige Beweise sichern → `evidence +2`, Zeitverlust
- Eindämmungsplan vorbereiten → `containment = ready`, großer Zeitverlust

Danach Rückkehr zum Labor.

## 8. Kapitel 7 – Eine Dosis

**Ziel:** Alle früheren Unsicherheiten in eine moralische Entscheidung überführen.

### K7.1 – Hemmstoff herstellen

Verfügbare Dosen:

- keine geeignete Probe → 0
- Labor- oder Bohrprobe → 1
- kontrollierte Bohrprobe plus alte Probe → 2
- tiefer Kern plus alte Probe und stabiler Strom → bis zu 3

### K7.2 – Kandidaten

Mögliche Empfänger:

- Mira
- Aksel
- Thal
- Kader
- eine Dosis ungeöffnet zur externen Analyse

Der Spieler sieht Symptome und Indizien, keine Infektionsanzeige.

### K7.3 – Verteilung

Die Entscheidung wird ausdrücklich bestätigt. Mira kann bei niedrigem Vertrauen widersprechen, aber der Spieler weiß vorher, ob sie den Rat befolgen wird.

Wichtige Flags:

- `mira_treated`
- `aksel_treated`
- `thal_treated`
- `kader_treated`
- `sample_preserved`
- `dose_hoarded`

### K7.4 – Letzte Vorbereitung

Vor dem Rettungsweg:

- Überlebende auswählen/überzeugen
- vollständigen oder gekürzten Bericht senden
- Station versiegeln, verlassen oder aktiv zerstören
- Relais-Ersatzakku einsetzen oder für den Notsender verwenden

## 9. Kapitel 8 – Rettung

**Ziel:** Ergebnis der gesamten Zustandslage auflösen, ohne die Schlussentscheidung auf einen einzelnen Knopf zu reduzieren.

### K8.1 – Notruf

`rescue_quality` entsteht aus:

- Wetterdaten
- korrekten Koordinaten
- funktionierendem Sender
- Beweisen
- verbleibender Zeit

Unzureichende Rettungsqualität führt nicht automatisch zum Tod. Das Relais kann abbrechen, während offen bleibt, ob später Hilfe kam: `ending_radio_silence`.

### K8.2 – Weg zur Landezone

Letzter Temperatur- und Vertrauenscheck.

- vertrauensvolle Überlebende folgen Mira
- misstrauische oder instabile NPCs können zurückbleiben
- ein unbehandelter infizierter NPC kann die Gruppe gefährden
- ein fälschlich behandelter gesunder NPC kann zusammenbrechen

### K8.3 – Eindämmungsentscheidung

Falls `containment = ready`:

- mitfliegen und Station nur versiegeln
- Zerstörung auslösen und Risiko des eigenen Entkommens eingehen
- vor Ort bleiben, um die Zerstörung sicherzustellen

### K8.4 – Abschied

Mira bedankt sich. Die Verbindung endet vor der medizinischen Endauswertung. Der sichtbare Abschiedstext darf bei mehreren Enden identisch sein.

Danach löst der Ending-Resolver das Ergebnis auf.

## 10. Hub-Logik

Der Wohntrakt-Hub besitzt folgende Prioritäten:

1. unmittelbare Krise
2. verpflichtendes Storyereignis
3. neue erreichbare Hauptbereiche
4. optionale Untersuchung
5. Ruhe / Versorgung

### Freischaltungen

| Ziel | Voraussetzung |
|---|---|
| Labor | ab Kapitel 1 |
| Generator | ab Kapitel 1 |
| Marsch | Labor und Generator erstmals besucht |
| Außenposten | Marsch abgeschlossen, Kälteschutz verfügbar |
| Bohrturm | Laborbefund und Zugangscode/Kaders Hilfe |
| Gletscherspalten | Koordinaten gefunden |
| Gegenmittel | Bohrturm abgeschlossen |
| Rettung | Wetterdaten und Koordinaten gesendet oder alternatives Notsignal |

Ein erledigter Bereich kann für optionale Funde erneut besucht werden, erzeugt aber keine vollständige Wiederholung seines Hauptplots.

## 11. Log-Verteilung

| ID | Tag | Autor | Fundort | Kernfunktion |
|---|---:|---|---|---|
| `log_thal_09` | −9 | Thal | Bohrturm | Bohrkern zu früh geborgen |
| `log_berg_09` | −9 | Aksel | Generator | Spannung und Geruch |
| `log_kader_07` | −7 | Kader | Labor | Probe offiziell „inert“ |
| `log_thal_07` | −7 | Thal | Wohntrakt | Misstrauen gegen Bericht |
| `log_medical_06` | −6 | unbekannt | Krankenstation | Arbeitsverletzung |
| `log_berg_05` | −5 | Aksel | Werkstatt | auffälliger Geruch bei Patient Null |
| `log_fragment_05` | −5 | unbekannt | Bohrturm | „nicht derselbe“ |
| `log_kader_03` | −3 | Kader | Labor | Verhaltensauffälligkeit |
| `log_thal_03` | −3 | Thal | Außenposten | Versuch einer Warnung |
| `log_berg_01` | −1 | Aksel | Wohntrakt | veränderter Tonfall |
| `log_kader_01` | −1 | Kader | Bohrturm | Plan zum tieferen Bohren |
| `log_freight` | −1 | System | Generator | fehlende Medikamente |
| `log_thal_00` | 0 | Thal | Außenposten | letzte Echtzeitaufnahme |
| `log_old_project` | Jahre zuvor | unbekannt | Gletscherspalte | frühere Entdeckung |

Kein einzelner Log erklärt die Wahrheit. Bestimmte Kombinationen schalten präzisere Antwortoptionen frei.

## 12. Infektionslogik

`mira_infected` ist ein boolescher interner Zustand. `infection_source` speichert genau die erste echte Quelle.

Mögliche Quellen:

| Quelle | Bedingung |
|---|---|
| `lab_aerosol` | Schnellanalyse ohne funktionierenden Schutz |
| `contaminated_dressing` | beschädigtes Material benutzen, falls Manifest Manipulation bestätigt |
| `aksel_contact` | infizierten Aksel nach dem Marsch direkt anfassen |
| `drill_sample` | kontrollierte Probe ohne Schutz |
| `deep_core` | tiefer bohren ohne vollständige Abschirmung |
| `kader_contact` | veränderten Kader in der Notunterkunft körperlich stützen |

Einige scheinbare Risiken bleiben bewusst ungefährlich. Der komplett saubere Pfad muss logisch, aber nicht offensichtlich sein.

Die Behandlung setzt nicht einfach `mira_infected = false`. Sie erzeugt `mira_treated`. Erst der Ending-Resolver bestimmt abhängig von Probenqualität und Herstellung, ob sie wirksam war.

## 13. NPC-Zustände

### Aksel

`aksel_state`:

- `stable`
- `exposed`
- `infected`
- `lost`
- `dead`

Seine Infektion entsteht aus Vorgeschichte plus Miras Handlungen; sie wird nicht ausgewürfelt.

### Thal

`thal_state`:

- `alive`
- `missing`
- `dead`

Bestimmt durch globale Zeitkosten, Generatorzustand und Kaders Handlungsspielraum.

### Kader

`kader_state`:

- `cooperative`
- `independent`
- `changed`
- `missing`
- `dead`

Bestimmt durch Konfrontation, Beweise, Zeit und Zugang zur Probe.

Jeder NPC besitzt zusätzlich `trust_npc` von −2 bis +2. Der Zahlenwert bleibt unsichtbar.

## 14. Ending-Resolver

Die Reihenfolge ist wichtig; die erste erfüllte Bedingung gewinnt.

### E1 – `ending_whiteout`

Wenn Mira nach ausdrücklicher Warnung ohne ausreichende Rückkehrmöglichkeit im Whiteout oder in der Gletscherspalte weitergeht.

### E2 – `ending_radio_silence`

Wenn das Relais oder der Sender endgültig ausfällt, keine ausreichende Rettungsqualität erreicht wird oder Mira bei einer Anlagenkatastrophe verschwindet.

Das Schicksal bleibt bewusst offen.

### E3 – `ending_contained`

Wenn:

- `containment = ready`,
- die Zerstörung/Eindämmung erfolgreich ausgelöst wird,
- keine unkontrollierte infizierte Person evakuiert wird.

Mira kann dabei sterben oder zurückbleiben. Der Kern des Endes ist die erfolgreiche Eindämmung.

### E4 – `ending_one_dose`

Wenn:

- Mira die einzige wirksame Dosis für sich verwendet,
- mindestens ein erreichbarer anderer Kandidat dadurch unbehandelt zurückbleibt oder stirbt,
- Mira gerettet wird.

### E5 – `ending_the_lie`

Wenn:

- Mira infiziert ist,
- sie es aus genügend Hinweisen selbst erkannt hat,
- der Bericht absichtlich gekürzt wird,
- sie gerettet wird.

### E6 – `ending_hidden_guest`

Wenn:

- Mira bei Rettung noch infiziert ist,
- sie ihren Zustand nicht sicher erkannt hat,
- keine wirksame Behandlung erfolgte,
- sie gerettet wird.

### E7 – `ending_all_rescued`

Wenn:

- Mira wirksam behandelt oder sauber ist,
- alle noch lebenden erreichbaren NPCs evakuiert werden,
- kein evakuierter NPC infektiös bleibt,
- genügend Beweise und Proben gesichert sind.

### E8 – `ending_clean_rescue`

Wenn:

- Mira sauber oder wirksam behandelt ist,
- Rettung gelingt,
- keine höherrangige Ending-Bedingung greift.

Dieses Ende kann einsam oder mit einzelnen Überlebenden ausfallen, bleibt aber grundsätzlich positiv.

## 15. Schreibregeln pro Node

- Eine Nachrichtengruppe erfüllt nur eine Hauptfunktion: Information, Stimmung, Entscheidung oder Folge.
- In Stresssituationen kurze Nachrichten; in sicheren Räumen längere Beobachtungen.
- Mira beschreibt zuerst, interpretiert danach.
- Antwortoptionen sollen unterschiedliche Haltungen ausdrücken, nicht „gut“ gegen „dumm“.
- Vor einem harten Ending erfolgen mindestens zwei erkennbare Warnungen.
- Verzögerungen werden für Weg, Arbeit, Untersuchung und bewusste Funkstille genutzt, nicht nach jeder Auswahl.
- Fotos und Audiofragmente müssen eine erzählerische Funktion besitzen.
- Kein Text nennt die Anomalie abschließend Parasit, Alien oder Monster.

## 16. Umsetzung in Storydaten

Empfohlenes einheitliches Node-Schema:

```js
{
  id: "k3_march_contact",
  chapter: 3,
  delay: 4,
  messages: [],
  requires: [],
  effects: [],
  choices: [
    {
      label: "Ruf ihn zurück. Geh nicht näher ran.",
      next: "k3_march_call",
      requires: [],
      effects: []
    }
  ]
}
```

Keine freien Textbedingungen wie `"relay_stable AND rescue_quality_sufficient"`. Bedingungen und Effekte werden als strukturierte Daten gespeichert und von einer zentralen Engine ausgewertet.

## 17. Nächster Produktionsschritt

Als nächstes wird Kapitel 1 vollständig in einzelne Nodes zerlegt und als Dialogfassung geschrieben. Parallel entsteht ein verbindliches State-Schema für die Engine. Erst wenn Kapitel 1 im Prototyp spielbar ist, werden die folgenden Kapitel dialogisch ausformuliert.
