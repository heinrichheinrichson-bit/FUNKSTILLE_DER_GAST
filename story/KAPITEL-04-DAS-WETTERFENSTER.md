# Kapitel 4 – Das Wetterfenster

Produktionsfassung 0.1

## Funktion

- Ingrid Thal als dritte Hauptfigur einführen oder ihr Schicksal auflösen
- die Voraussetzungen für eine glaubwürdige Rettung etablieren
- Kälte und Zeit erstmals zu einer strategischen Ressource machen
- Kaders Vertuschung beweisbar, aber seine Motive weiterhin mehrdeutig machen
- den Bohrturm als nächstes zwingendes Ziel freischalten

## Neue Zustände

| Zustand | Werte |
|---|---|
| `thal_state` | `alive`, `missing`, `dead` |
| `trust_thal` | −2 bis +2 |
| `weather_window_known` | `true` / `false` |
| `rescue_coordinates` | `true` / `false` |
| `evidence_level` | 0–4 |
| `cold_gear` | 0–2 |
| `thal_returning` | `true` / `false` |
| `bohrturm_access` | `true` / `false` |
| `global_time` | abstrakter Belastungswert |

## Thals Zustand

Vor Kapitelbeginn wird ihr Zustand festgelegt:

- **alive:** geringe/mittlere Zeitkosten und Kader hatte keinen freien Zugriff auf das Kommunikationsnetz
- **missing:** mittlere Zeitkosten oder Kader handelte unabhängig
- **dead:** sehr hohe Zeitkosten plus ausgefallene Heizung am Außenposten

Ihr Tod wird nicht automatisch Kader oder der Anomalie zugeschrieben.

## `k4_001_briefing`

**Mira:**

> Der Außenposten ist 1,8 Kilometer entfernt.

> Wetterstation, Funkanlage, Notlager.

> Thal hat von dort die letzten lokalen Messwerte gespiegelt.

> Wenn wir ein Flugfenster finden wollen, dann dort.

> Der Weg ist fast dreimal so lang wie zum Generator.

Falls `cold_gear = 0`:

> Mein Standardanzug reicht dafür nicht.

**Vorbereitungsoptionen:**

1. Generator-Werkstatt nach Überanzug durchsuchen
2. Labor-Notanzug verwenden
3. Aksel als Begleitung bitten
4. trotzdem allein aufbrechen

Mindestens `cold_gear = 1` oder eine geeignete Begleitung ist für einen verantwortbaren Versuch nötig.

---

## `k4_010_underprepared_warning`

Nur bei unzureichender Ausrüstung.

**Mira:**

> Mit dem, was ich trage, habe ich vielleicht zwanzig Minuten, bevor die Feinmotorik nachlässt.

> Der Hinweg dauert länger.

> Das ist keine mutige Entscheidung. Das ist Mathematik.

**Antworten:**

1. **„Zurück. Erst Ausrüstung beschaffen.“**  
   → Vorbereitungsschleife

2. **„Wir haben keine Zeit. Geh.“**  
   → zweite Warnung

**Mira:**

> Wenn ich jetzt gehe, komme ich sehr wahrscheinlich nicht zurück.

Erneutes Beharren führt später zu `ending_whiteout`; das Spiel kennzeichnet die Entscheidung nicht als zufälliges Scheitern.

---

## `k4_020_departure`

**Mira:**

> Überanzug geschlossen. Zwei Karabiner. Reserveakku innen an der Brust.

Falls Begleitung Aksel:

> Aksel kommt mit. Er hat nicht gefragt, ob ich ihm vertraue.

Falls keine Begleitung:

> Allein.

> Vielleicht ist das gerade besser.

> Rote Leine bis zum Generator. Danach gelbe Leine nach Osten.

> Ich melde mich am Abzweig.

---

## `k4_030_long_walk`

**Delay:** 12 Minuten

**Mira:**

> Gelbe Leine erreicht.

> Sicht unter fünf Meter.

> Wind drückt von links. Ich muss mich schräg dagegenstellen.

> Im Schnee neben mir läuft etwas mit.

> Ich höre Schritte, wenn ich stehen bleibe.

Falls Begleitung:

> Aksel sagt, das seien unsere eigenen Schritte, vom Gebäude zurückgeworfen.

> Es gibt hier nichts, das Geräusche zurückwerfen könnte.

**Antworten:**

1. **„Nicht von der Leine lösen. Weiter.“**  
   → sicherer Hauptweg

2. **„Licht aus und hören.“**  
   → optionale Beobachtung, Klarheitsprüfung

3. **„Umkehren.“**  
   → sichere Rückkehr; ein zweiter Versuch bleibt bei ausreichender Zeit möglich

---

## `k4_031_listen`

**Mira:**

> Licht aus.

> Nur Wind.

> Nein.

> Jemand atmet.

Falls allein:

> Direkt an meinem rechten Ohr.

Falls begleitet:

> Aksel steht links von mir.

> Das Atmen kommt von rechts.

> Licht wieder an.

> Nichts.

**Effekte:**

- `clarity -1`, falls bereits niedrig
- kein Infektionsereignis

**Weiter:** `k4_040_station`

---

## `k4_040_station`

**Delay:** 8 Minuten

**Mira:**

> Gebäude.

> Fast dagegen gelaufen.

> Außenlicht aus. Innere Schleuse verriegelt.

Je nach Thal-Zustand:

- Bei `alive`: Licht bewegt sich hinter einem schmalen Fenster.
- Bei `missing`: keine Antwort, aber Wärmebild zeigt Restwärme.
- Bei `dead`: Notlicht blinkt im Inneren.

**Weiter:** zustandsabhängig.

# Thal lebt

## `k4_a_001_contact`

**Thal über Gegensprechanlage:**

> „Name.“

**Mira:**

> Sie weiß, wer ich bin.

> Ich sage es trotzdem.

**Thal:**

> „Hände an die Scheibe. Drehen. Nacken zeigen.“

> „Jetzt sagen Sie mir, warum Berg bei Ihnen ist.“

Falls Aksel nicht dabei ist:

> „Jetzt sagen Sie mir, wo Berg ist.“

**Antworten:**

1. **Vollständig erzählen, einschließlich Marsch und möglicher eigener Symptome**  
   → `trust_thal +2`

2. **Nur technische Fakten nennen**  
   → neutral

3. **Miras mögliche Symptome verschweigen**  
   → `mira_hid_symptoms_from_thal = true`; späterer Vertrauensverlust möglich

---

## `k4_a_010_entry`

Bei genügend Vertrauen:

**Thal:**

> „Innere Schleuse bleibt zu, bis ich Ihre Temperatur habe.“

> „Nicht persönlich nehmen.“

**Mira:**

> Tue ich nicht.

Bei niedrigem Vertrauen:

> Thal lässt nur Mira ein. Aksel bleibt in der Außenschleuse oder draußen.

> Er sagt, das sei in Ordnung.

> Sein Gesicht sagt etwas anderes.

---

## `k4_a_020_conversation`

**Mira:**

> Thal sieht aus, als hätte sie seit Tagen nicht geschlafen.

> Sie hat die Funkanlage zerlegt und mit drei verschiedenen Stromquellen verbunden.

**Thal:**

> „Kader hat meinen ersten Warnruf blockiert. Dann hat jemand die Antenne von innen gedreht, während der Sturm lief.“

> „Ich bin raus, bevor sie mich auch noch zum technischen Fehler erklären.“

**Antworten:**

1. **„Frag, wen sie mit ‚sie‘ meint.“**
2. **„Frag nach dem Rettungsfenster.“**
3. **„Frag, warum sie niemanden mitnahm.“**

Alle Fragen sind möglich; Reihenfolge beeinflusst nur Ton.

### „Sie“

> „Kader. Vielleicht Berg. Vielleicht ich.“

> „Ich habe Aufnahmen, auf denen ich Dinge tue, an die ich mich nicht erinnere.“

### Rettungsfenster

> „In ungefähr sechs Stunden öffnet sich ein Korridor nach Norden. Siebzehn Minuten, vielleicht weniger.“

### Niemand mitgenommen

> „Ich habe es versucht. Niemand glaubte mir.“

> „Später habe ich aufgehört, sicher zu sein, ob ich mir selbst glauben sollte.“

---

## `k4_a_030_thal_choice`

Thal übergibt Wetterdaten und Beweise, weigert sich aber zunächst zurückzukehren.

**Antworten:**

1. **„Komm mit uns. Allein bist du hier nicht sicher.“**  
   Erfolg bei `trust_thal >= 1`

2. **„Bleib hier und halte die Funkanlage bereit.“**  
   Thal bleibt; verbessert Rettung, ist aber später schwerer zu evakuieren

3. **„Wir brauchen dich im Labor.“**  
   Erfolg nur mit offengelegten Laborbefunden

**Effekte:**

- `thal_returning` entsprechend Entscheidung

# Thal fehlt

## `k4_m_001_empty`

**Mira:**

> Schleuse manuell geöffnet.

> Drinnen ist es warm.

> Tasse auf dem Tisch. Kaffee noch flüssig.

> Thals Außenanzug fehlt.

> Ihre Stiefel stehen hier.

> Beide.

**Funde:**

- laufende Aufnahme
- Wetterdaten
- Blutspur oder verschüttete rote Kalibrierflüssigkeit

---

## `k4_m_010_recording`

**Thals Aufnahme:**

> „Wenn das jemand findet: Kader hat den Bericht geändert.“

> „Ich habe die Rohdaten auf den lokalen Sender gelegt.“

> „Da draußen steht seit zwanzig Minuten jemand an der Leine.“

> „Ich glaube, es bin ich.“

> [Aufnahme endet]

**Mira:**

> Zeitstempel vor zwei Stunden.

> Kamera zeigt die Außenschleuse.

> Niemand geht hinaus.

**Effekte:**

- `evidence_level +1`
- `thal_state = missing`

Der Spieler kann draußen suchen. Mira warnt, dass Wetterfenster und Temperatur dagegen sprechen. Eine kurze Suche findet nur sockenlose Fußabdrücke, die nach wenigen Metern enden.

# Thal ist tot

## `k4_d_001_found`

**Mira:**

> Thal sitzt vor dem Sender.

> Handschuh auf dem manuellen Schalter.

> Kein sichtbarer Kampf.

> Hauttemperatur Umgebung.

> Ich fasse nichts an.

Falls Klarheit niedrig:

> Ihre Augen sind offen.

> Nein. Geschlossen.

> Entschuldige. Das Licht flackert.

**Effekte:**

- `thal_state = dead`

---

## `k4_d_010_last_action`

Der Senderpuffer zeigt, dass Thal einen großen Datenblock übertragen wollte. Die Verbindung wurde lokal getrennt.

Mögliche Ursachen bleiben:

- Stromausfall
- Kaders Fernzugriff
- Thal selbst
- eine unbekannte Person im Raum

**Funde:**

- Wetterdaten
- Beweisdatei
- Thals persönlicher Schlüssel

# Gemeinsame Funde

## `k4_x_001_weather`

**Mira:**

> Wettermodell ist eindeutig.

> Ein Korridor öffnet sich nach Norden.

> Wenn die Versorgungsstation unseren Notruf erhält, haben sie genau einen Versuch.

> Wir brauchen einen Sender, Koordinaten und einen Grund, warum sie das Risiko eingehen sollen.

**Effekte:**

- `weather_window_known = true`
- `rescue_coordinates = true`

---

## `k4_x_010_evidence`

Mira findet drei mögliche Datenpakete:

1. Rohaufnahme der sich strukturierenden Probe
2. Kaders geänderten Bericht mit Metadaten
3. Thals blockierten Warnruf

Je nach Gründlichkeit und Thal-Vertrauen werden ein bis drei Beweise gesichert.

**Effekte:**

- `evidence_level +1..3`

---

## `k4_x_020_kader_reply`

Im Kommunikationspuffer liegt Kaders gelöschte Antwort:

> THAL, SIE INTERPRETIEREN ARTEFAKTE ALS BIOLOGISCHE AKTIVITÄT.

> BEENDEN SIE DIE ÜBERTRAGUNG.

Darunter, 43 Sekunden später:

> INGRID. BITTE. NOCH NICHT.

**Mira:**

> Er hat sie nicht nur zum Schweigen bringen wollen.

> Er hatte Angst vor dem Zeitpunkt.

> Wovor genau?

**Effekte:**

- `kader_motive_clue = true`

---

## `k4_x_030_access`

Thals Schlüssel oder Datenpuffer enthält den Bohrturm-Zugang.

> Ebene minus drei.

> Kernkammer.

> Kader hat dort nach dem Ausfall einen manuellen Lock gesetzt.

**Effekte:**

- `bohrturm_access = true`

---

## `k4_x_040_return_choice`

**Mira:**

> Sturm wird für ungefähr vierzig Minuten schwächer.

> Wir können warten und sicherer zurückgehen.

> Oder sofort los. Jede Minute fehlt später beim Flugfenster.

**Antworten:**

1. **„Warte auf die Abschwächung.“**  
   Temperatur stabilisiert sich, `global_time +2`

2. **„Sofort zurück.“**  
   `cold_exposure +1`; bei Verletzung zusätzliche Einschränkung

3. **„Nutze die Zeit für eine vollständige Suche.“**  
   optionaler Beweis/Medikamente, `global_time +3`

---

## `k4_x_050_return`

**Delay:** 14 Minuten

**Mira:**

> Gelbe Leine.

> Rote Leine.

> Wohntrakt in Sicht.

Falls Thal mitkommt:

> Thal läuft hinter mir. Sie hält so viel Abstand, dass die Leine zwischen uns gespannt bleibt.

Falls Aksel und Thal beide mitkommen:

> Keiner von beiden spricht mit dem anderen.

Falls Mira allein:

> Hinter mir sind wieder Schritte.

> Ich drehe mich nicht um.

---

## `k4_100_hub`

**Mira:**

> Zurück.

> Das Wetterfenster beginnt in wenigen Stunden.

> Wir können jetzt einen Notruf senden.

> Aber ohne zu wissen, was in der Kernkammer ist, holen wir vielleicht nicht Rettung hierher.

> Vielleicht liefern wir nur etwas aus.

> Kader wartet im Bohrturm.

**Effekte:**

- `chapter_04_complete = true`
- Bohrturm freigeschaltet

**Übergang:** Kapitel 5 – Der Ursprung.

## Kapitelabschlussprüfung

Kapitel 4 garantiert:

- Wetterfenster und Rettungskoordinaten sind bekannt.
- mindestens ein belastbarer Beweis wurde gefunden.
- Thals Zustand ist festgelegt.
- Zugang zum Bohrturm ist möglich.
- die Rettung ist nun ein reales Ziel, aber moralisch noch nicht verantwortbar.

