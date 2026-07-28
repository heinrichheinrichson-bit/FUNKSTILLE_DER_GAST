# Kapitel 1 – Die Verbindung

Produktionsfassung 0.1

## Funktion des Kapitels

- Mira und die ungewöhnliche Verbindung etablieren
- den Spieler ohne lange Erklärung in die Krise werfen
- Miras sachliche Stimme zeigen
- Wohntrakt, Relais und Grundzustände einführen
- Aksel als mehrdeutigen ersten Überlebenden etablieren
- mit der Entscheidung „Labor oder Generator“ enden

Geplante Spielzeit ohne Echtzeitverkürzung: etwa 20–30 Minuten.

## Verwendete Zustände

| Zustand | Startwert | Bedeutung |
|---|---:|---|
| `trust_mira` | 0 | Bereitschaft, dem Spieler auch unter Druck zu folgen |
| `trust_aksel` | 0 | Aksels Verhältnis zu Mira |
| `clarity` | 3 | 3 = stabil, 0 = stark beeinträchtigt |
| `temperature` | 3 | 3 = stabil, 0 = akute Unterkühlung |
| `mira_wound_known` | false | Mira hat ihre Kopfverletzung bemerkt |
| `mira_wound_treated` | false | Verletzung wurde sicher versorgt |
| `player_location_shared` | false | Spieler hat eine grobe Standortangabe gemacht |
| `player_tone` | null | `supportive`, `commanding` oder `distant` |
| `quarters_searched` | false | Quartiere und Krankenstation untersucht |
| `canteen_searched` | false | Kantine und Vorrat untersucht |
| `log_thal_07` | false | Thals persönlicher Eintrag gefunden |
| `item_sealed_ration` | false | ungeöffnete Notration |
| `item_damaged_bandage` | false | beschädigte Verbandspackung |
| `item_freight_manifest_a` | false | erste Hälfte des Frachtmanifests |
| `aksel_restrained` | false | Aksel wurde eingeschlossen |
| `first_route` | null | `labor` oder `generator` |

## Node-Übersicht

```text
k1_001_signal
    ├── k1_010_check_self
    └── k1_020_check_room
             ↓
k1_030_identity
             ↓
k1_040_relay
    ├── k1_050_tone_honest
    ├── k1_051_tone_commanding
    └── k1_052_tone_evasive
             ↓
k1_060_hub_first
    ├── k1_070_quarters ─┐
    └── k1_080_canteen ──┤
                         ↓
k1_090_noise
             ↓
k1_100_aksel
    ├── k1_110_aksel_close
    ├── k1_111_aksel_distance
    └── k1_112_aksel_lock
             ↓
k1_120_double_crisis
    ├── k1_130_exit_labor
    └── k1_131_exit_generator
```

---

## `k1_001_signal`

**Delay:** 0

**Mira:**

> Hallo?

> Das zeigt verbunden an.

> Bitte schreib irgendwas, wenn du das lesen kannst.

**Antworten:**

1. **„Ich kann dich lesen. Bist du verletzt?“**  
   → `k1_010_check_self`

2. **„Ich bin da. Wo bist du und was ist passiert?“**  
   → `k1_020_check_room`

3. **„Wer bist du?“**  
   → `k1_020_check_room`  
   Tonvariante: Mira reagiert etwas knapper.

---

## `k1_010_check_self`

**Delay:** 1 Minute

**Mira:**

> Vermutlich.

> Blut an der Schläfe. Nicht viel. Pupillen reagieren gleich, soweit ich das mit der Frontkamera beurteilen kann.

> Mir fehlen ein paar Minuten. Vielleicht mehr.

> Ich sitze auf dem Boden im Wohntrakt. Notbeleuchtung läuft.

> Es riecht nach heißem Metall.

**Effekte:**

- `mira_wound_known = true`
- `trust_mira +1`

**Weiter:** automatisch zu `k1_030_identity`

---

## `k1_020_check_room`

**Delay:** 1 Minute

**Mira:**

> Station Kaldstad. Antarktis.

> Ich sitze im Verbindungsgang vom Wohntrakt. Ein Teil der Deckenverkleidung ist runtergekommen.

> Notbeleuchtung. Kein Alarm. Das ist seltsamer als ein Alarm.

> Da ist Blut auf meinem Ärmel.

> Meins, denke ich.

Falls die erste Antwort „Wer bist du?“ war:

> Dr. Mira Lindner. Glaziologie. Und du bist offenbar nicht die Person, die ich erreichen wollte.

**Effekte:**

- `mira_wound_known = true`

**Weiter:** automatisch zu `k1_030_identity`

---

## `k1_030_identity`

**Delay:** 20 Sekunden

**Mira:**

> Das Relais sollte sich mit dem Notkanal der Versorgungsstation koppeln.

> Stattdessen zeigt es nur eine Gerätekennung. Keine Rufnummer. Keinen Standort.

> Wo bist du?

**Antworten:**

1. **Ehrliche Standortangabe des Spielers**  
   → `k1_040_relay`, setzt `player_location_shared = true`

2. **„Weit weg. Ich glaube nicht, dass der genaue Ort gerade hilft.“**  
   → `k1_040_relay`

3. **„Ist das wichtig? Erzähl mir lieber, was passiert ist.“**  
   → `k1_040_relay`, `trust_mira -1`

**Mira – Variante bei ehrlicher Antwort:**

> Dann hat es wirklich irgendein Gerät erwischt.

> Großartig.

> Entschuldigung. Nicht deine Schuld.

**Mira – Variante bei Ausweichen:**

> Verständlich. Ich kann schließlich auch nicht beweisen, wer ich bin.

---

## `k1_040_relay`

**Delay:** 1 Minute

**Mira:**

> Kurzfassung: Wir benutzen ein ELF-Relais für Sensordaten aus dem Eis. Sehr niedrige Frequenz, große Reichweite, absurd kleine Datenrate.

> Die Hauptantenne ist weg. Oder ausgefallen. Das Relais sucht deshalb offenbar selbst nach einem offenen Empfänger.

> Es hat dich gefunden.

> Ich kann diese Verbindung nicht neu wählen. Wenn ich sie trenne, finde ich dich wahrscheinlich nicht wieder.

> Ich brauche jemanden, der mitdenkt. Im Moment bist du alles, was ich habe.

**Antworten:**

1. **„Ich bleibe bei dir. Wir gehen ruhig und Schritt für Schritt vor.“**  
   → `k1_050_tone_honest`

2. **„Dann hör genau auf mich. Wir verschwenden keine Zeit.“**  
   → `k1_051_tone_commanding`

3. **„Mal sehen. Zuerst musst du mir mehr erzählen.“**  
   → `k1_052_tone_evasive`

---

## `k1_050_tone_honest`

**Mira:**

> Gut.

> Schritt für Schritt kann ich.

**Effekte:**

- `trust_mira +1`
- `player_tone = supportive`

**Weiter:** `k1_060_hub_first`

---

## `k1_051_tone_commanding`

**Mira:**

> Ich höre mir deinen Rat an.

> Verwechsel das bitte nicht mit einem Kommandoverhältnis.

**Effekte:**

- `player_tone = commanding`

**Weiter:** `k1_060_hub_first`

---

## `k1_052_tone_evasive`

**Mira:**

> Mehr weiß ich selbst noch nicht.

> Falls du gehen willst, sag es lieber jetzt.

**Antwort:**

- **„Ich gehe nicht. Sieh dich um.“**

**Effekte:**

- `trust_mira -1`
- `player_tone = distant`

**Weiter:** `k1_060_hub_first`

---

## `k1_060_hub_first`

**Delay:** 30 Sekunden

**Mira:**

> Der Wohntrakt hängt noch am Notstrom.

> Links sind die Schlafquartiere und die kleine Krankenstation. Rechts Kantine und Vorratsraum.

> Der Hauptgang zum Labor ist dunkel. Die Außenschleuse zeigt Grün, obwohl draußen Whiteout ist.

> Ich sollte erst etwas Brauchbares suchen.

**Antworten:**

1. **„Schlafquartiere und Krankenstation. Kümmere dich zuerst um die Verletzung.“**  
   → `k1_070_quarters`

2. **„Kantine und Vorräte. Wir müssen wissen, was dir zur Verfügung steht.“**  
   → `k1_080_canteen`

Beide Bereiche können untersucht werden. Die Wahl bestimmt nur die Reihenfolge und eine kleine spätere Textvariante.

---

## `k1_070_quarters`

**Delay:** 3 Minuten

**Mira:**

> Bin in der Krankenstation. Eher ein Behandlungsraum als eine Station.

> Verbandskasten ist offen. Eine Packung Kompressen liegt daneben.

> Die Folie ist an einer Ecke eingerissen.

> Könnte beim Sturz aus dem Schrank passiert sein.

> Ich benutze die lieber noch nicht.

**Effekte:**

- `quarters_searched = true`
- `item_damaged_bandage = true`

**Mira:**

> In Thals Quartier läuft noch ihr Terminal.

> Letzter Eintrag vor drei Tagen:

> „Kader nennt die Probe inert. Im unbearbeiteten Sensorstream bewegt sie sich trotzdem. Habe Kopien gemacht. Wenn der Uplink morgen wieder ausfällt, ist das kein Wetter.“

> Der Uplink ist ausgefallen.

**Effekte:**

- `log_thal_07 = true`

Falls Kantine noch nicht untersucht:

**Antwort:**

- **„Sieh noch in der Kantine nach.“** → `k1_080_canteen`

Andernfalls:

→ `k1_090_noise`

---

## `k1_080_canteen`

**Delay:** 3 Minuten

**Mira:**

> Kantine ist leer. Zwei Tassen auf dem Tisch. Eine davon umgestoßen.

> Der Kaffee darin ist gefroren.

> Das sollte hier drinnen nicht möglich sein.

> Im Vorratsschrank liegt eine versiegelte Notration. Nehm ich mit.

**Effekte:**

- `canteen_searched = true`
- `item_sealed_ration = true`

**Mira:**

> Außerdem ein Frachtmanifest von der letzten Lieferung.

> Medikamente, Filter, Ersatzteile. Zwei Kisten wurden nach dem Entladen umgebucht.

> Kein Empfänger eingetragen.

> Vielleicht nur schlampige Buchführung.

**Effekte:**

- `item_freight_manifest_a = true`

Falls Quartiere noch nicht untersucht:

**Antwort:**

- **„Prüf jetzt die Quartiere und deine Verletzung.“** → `k1_070_quarters`

Andernfalls:

→ `k1_090_noise`

---

## `k1_090_noise`

**Delay:** 40 Sekunden

**Mira:**

> Warte.

> Schritte im Hauptgang.

> Langsam.

> Jemand bleibt immer wieder stehen.

> Ich sehe einen Schatten unter der Brandschutztür.

**Antworten:**

1. **„Sprich die Person an, aber bleib hinter der Tür.“**  
   → `k1_091_call_out`

2. **„Versteck dich und beobachte erst.“**  
   → `k1_092_observe`

3. **„Nimm etwas als Waffe und öffne die Tür.“**  
   → `k1_093_confront`

---

## `k1_091_call_out`

**Mira:**

> Hab gefragt, wer da ist.

> Keine Antwort.

> Jetzt doch.

> „Aksel.“

> Nur der Name. Sonst nichts.

**Effekte:**

- `aksel_intro_context = called`

**Weiter:** `k1_100_aksel`

---

## `k1_092_observe`

**Delay:** 1 Minute

**Mira:**

> Der Schatten steht einfach da.

> Jetzt lehnt er sich gegen die Tür.

> Ich sehe einen Ärmel durch das Fenster. Stationsjacke. Generator-Team.

> Er hat mich bemerkt.

> Es ist Aksel.

**Effekte:**

- `aksel_intro_context = observed`
- Mira bemerkt früh den Bohrstaub.

**Weiter:** `k1_100_aksel`

---

## `k1_093_confront`

**Mira:**

> Hab den Feuerlöscher.

> Tür auf.

> Es ist Aksel. Er hat genauso erschrocken ausgesehen wie ich.

> Vielleicht sogar mehr wegen des Feuerlöschers.

**Effekte:**

- `aksel_intro_context = confronted`
- `trust_aksel -1`

**Weiter:** `k1_100_aksel`

---

## `k1_100_aksel`

**Delay:** 1 Minute

**Mira:**

> Aksel Berg. Stationstechniker.

> Blut an seiner Hand, aber keine sichtbare Wunde. Er sagt, es sei nicht seins.

> Er war angeblich im Generatorhaus, als der Strom ausfiel. Weiß nicht, was danach passiert ist.

> An seiner Jacke klebt grauer Staub.

Falls Aksel zuvor beobachtet wurde:

> Nicht Ruß. Bohrstaub, würde ich sagen.

Andernfalls:

> Könnte Ruß sein. Könnte auch Bohrstaub sein.

**Aksel, von Mira wiedergegeben:**

> „Wir müssen zum Generator. Wenn die Hauptheizung aussteigt, friert uns die ganze Station ein.“

**Mira:**

> Er hat recht.

> Trotzdem beantwortet das nicht, warum er aus Richtung Labor gekommen ist.

**Antworten:**

1. **„Bleib bei ihm. Zu zweit seid ihr sicherer.“**  
   → `k1_110_aksel_close`

2. **„Lass ihn mitkommen, aber halte Abstand.“**  
   → `k1_111_aksel_distance`

3. **„Schließ ihn ein, bis du weißt, was passiert ist.“**  
   → `k1_112_aksel_lock`

---

## `k1_110_aksel_close`

**Mira:**

> Ich sag ihm, dass wir zusammenbleiben.

> Er nickt. Sieht ehrlich erleichtert aus.

> Oder erschöpft.

**Effekte:**

- `trust_aksel +1`
- `aksel_restrained = false`

**Weiter:** `k1_120_double_crisis`

---

## `k1_111_aksel_distance`

**Mira:**

> Er bleibt auf der anderen Seite des Gangs.

> Findet er übertrieben. Macht es aber.

**Effekte:**

- `aksel_restrained = false`

**Weiter:** `k1_120_double_crisis`

---

## `k1_112_aksel_lock`

**Mira:**

> Hab ihn in den kleinen Bereitschaftsraum geschickt.

> Er hat erst gelacht. Dann gemerkt, dass ich es ernst meine.

> „Wenn der Generator stoppt, brauchst du mich“, hat er gesagt.

> Tür ist zu. Mechanisch verriegelt.

**Effekte:**

- `trust_aksel -2`
- `aksel_restrained = true`

**Weiter:** `k1_120_double_crisis`

---

## `k1_120_double_crisis`

**Delay:** 30 Sekunden

**Systemmeldung:**

> [NETZSPANNUNG UNTER 18 %]

> [HAUPTHEIZUNG NICHT VERFÜGBAR]

**Mira:**

> Da ist noch etwas.

> Das Labor meldet Temperaturanstieg in Probenkammer Drei.

> Das ist die Kammer mit dem Kernmaterial.

> Wenn die Kühlung ausfällt, verändert sich die Probe.

> Wenn der Generator ausfällt, verändert sich hier alles.

Falls Aksel eingeschlossen ist:

> Aksel hämmert gegen die Tür. Er sagt, ich soll ihn rauslassen und zum Generator kommen.

**Mira:**

> Beides ist dringend. Beides liegt in entgegengesetzter Richtung.

> Was zuerst?

**Antworten:**

1. **„Ins Labor. Wir müssen wissen, womit wir es zu tun haben.“**  
   → `k1_130_exit_labor`

2. **„Zum Generator. Ohne Strom verlieren wir die ganze Station.“**  
   → `k1_131_exit_generator`

---

## `k1_130_exit_labor`

**Mira:**

> Labor zuerst.

> Ich nehme das Relais und die beschädigte Verbandspackung mit.

Falls Aksel frei und sein Vertrauen positiv ist:

> Aksel will zum Generator. Wir trennen uns.

> Gefällt mir nicht. Ist trotzdem vernünftig.

Falls Aksel frei und sein Vertrauen neutral oder negativ ist:

> Aksel sagt, er geht allein zum Generator.

> Er wartet meine Antwort nicht ab.

Falls Aksel eingeschlossen ist:

> Aksel bleibt im Bereitschaftsraum.

> Er flucht nicht mehr. Das ist irgendwie schlimmer.

**Effekte:**

- `first_route = labor`
- `chapter_01_complete = true`

**Übergang:** Kapitel 2, Route Labor.

---

## `k1_131_exit_generator`

**Mira:**

> Generator.

> Ohne Wärme bringt uns das Labor auch nichts.

Falls Aksel frei und sein Vertrauen positiv ist:

> Aksel kennt die Anlage besser als ich. Er kommt mit.

Falls Aksel frei und sein Vertrauen neutral oder negativ ist:

> Aksel geht voraus. Weiter voraus, als mir lieb ist.

Falls Aksel eingeschlossen ist:

> Ich muss entscheiden, ob ich Aksel dafür wieder rauslasse.

Zusatzentscheidung bei eingeschlossenem Aksel:

1. **„Lass ihn raus. Du brauchst seine Kenntnisse.“**  
   `aksel_released_for_generator = true`, `trust_aksel +1`

2. **„Nein. Nimm sein Werkzeug und geh allein.“**  
   `aksel_released_for_generator = false`, Werkzeug fehlt teilweise

**Effekte:**

- `first_route = generator`
- `chapter_01_complete = true`

**Übergang:** Kapitel 2, Route Generator.

---

## Kapitelabschluss

Nach der letzten Nachricht folgt die erste längere Echtzeitpause. Mira packt Ausrüstung, prüft die Außentür beziehungsweise durchquert den dunklen Laborgang.

Mögliche Abschlussmeldung:

> Bin unterwegs.

> Wenn die Verbindung kurz weg ist: nicht trennen.

> Ich komme zurück.

Die Formulierung „Ich komme zurück“ wird später in Aksels Rückkehrszene gespiegelt.

## Offene Punkte vor der Codefassung

- Festlegen, ob der Spieler seinen realen Standort als freie Eingabe oder vorgegebene Antwort übermittelt.
- Bestimmen, ob beide Wohntrakt-Unterräume verpflichtend besucht werden oder einer zunächst optional bleiben darf.
- Konkrete Dauer der ersten Echtzeitpause festlegen.
- Audio- und Bildanhänge erst nach Festlegung des UI-Formats ergänzen.
