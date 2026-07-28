# Kapitel 3 – Der Marsch

Produktionsfassung 0.1

## Funktion

Dieses Kapitel ist Aksels zentraler Figurenmoment. Es darf nicht eindeutig beweisen, ob er infiziert ist. Der Marsch entsteht aus seinem tatsächlichen Zustand, Erschöpfung und möglichen Erinnerungslücken; die Folgen entstehen ausschließlich aus Vorbereitung und früheren Entscheidungen.

## Neue Zustände

| Zustand | Werte |
|---|---|
| `aksel_state` | `stable`, `exposed`, `infected`, `lost`, `dead` |
| `aksel_march` | `returned`, `lost`, `locked_out`, `not_triggered` |
| `patient_zero_clue` | `true` / `false` |
| `mira_lost_time` | `true` / `false` |
| `aksel_inside_after_return` | `true` / `false` |
| `aksel_medical_scan` | `normal`, `abnormal`, `unknown` |

## Interne Aksel-Regel

Aksel ist infiziert, wenn mindestens eine kanonische Exposition in seiner Vorgeschichte aktiviert wurde. Die Story setzt dies vor Kapitelbeginn anhand gefundener und verpasster Ereignisse fest; kein Zufall entscheidet.

Sein Marsch kann auch als nicht infizierter Mann auftreten: Schlafmangel, Kohlenmonoxid, Kopfverletzung oder ein dissoziativer Zustand bleiben plausible Erklärungen.

## `k3_001_rest`

**Delay:** 8 Minuten

**Mira:**

> Wasser. Zwei Schlucke.

> Heizung läuft zumindest teilweise.

> Ich sehe mir Thals Eintrag noch einmal an.

> „Wenn der Uplink morgen wieder ausfällt, ist das kein Wetter.“

> Was ist es dann?

Falls Aksel frei im Wohntrakt war:

> Aksel war eben noch im Gang.

Falls Aksel eingeschlossen war:

> Der Bereitschaftsraum ist offen.

> Verriegelung steht noch auf geschlossen.

**Weiter:** `k3_010_window`

---

## `k3_010_window`

**Mira:**

> Draußen bewegt sich jemand an der roten Leine.

> Aksel.

> Keine Kapuze. Keine Handschuhe.

> Er läuft am Generatorabzweig vorbei.

> Weg von allen Gebäuden.

**Antworten:**

1. **„Ruf ihn über Außenlautsprecher und Funk.“**  
   → `k3_020_call`

2. **„Zieh den Kälteschutz an und folge an der Leine.“**  
   → `k3_030_follow_prepared`

3. **„Sofort hinterher. Er erfriert.“**  
   → `k3_031_follow_fast`

---

## `k3_020_call`

**Mira:**

> Außenlautsprecher an.

> „Aksel. Stehen bleiben.“

> Keine Reaktion.

> Funkgerät an seiner Jacke leuchtet. Er muss mich hören.

> Er geht weiter.

**Antworten:**

1. **„Bleib drinnen. Du kannst nicht beide retten.“**  
   → `k3_021_let_go`

2. **„Jetzt ausrüsten und kontrolliert folgen.“**  
   → `k3_030_follow_prepared`

---

## `k3_021_let_go`

**Mira:**

> Er ist hinter dem Schnee verschwunden.

> Einfach geradeaus.

> Ich habe die Hand am Türhebel.

> Ich mache nicht auf.

**Effekte:**

- `aksel_march = lost`
- zunächst `aksel_state = lost`
- `trust_mira` beeinflusst, ob Mira dem Spieler später die Schuld gibt

**Mira:**

> Sag mir bitte, dass das richtig war.

**Antworten:**

1. **„Es war die einzige Entscheidung, bei der nicht auch du stirbst.“**  
   `trust_mira +1`

2. **„Ich weiß es nicht.“**  
   keine Änderung; Mira respektiert die Ehrlichkeit

3. **„Wir hätten ihm folgen sollen.“**  
   `trust_mira -1`, `clarity -1`

**Weiter:** `k3_100_after_march`

---

## `k3_030_follow_prepared`

**Delay:** 4 Minuten

**Mira:**

> Anzug zu. Clip an der Hauptleine.

> Ich sehe seine Spuren.

> Er läuft parallel zur Leine, berührt sie aber nicht.

> Aksel!

> Nichts.

**Effekte:**

- `cold_exposure +1`

**Weiter:** `k3_040_contact_distance`

---

## `k3_031_follow_fast`

**Mira:**

> Bin draußen.

> Keine Zeit für den Überanzug. Nur Jacke und Leine.

**Effekte:**

- `cold_exposure +2`
- ohne vorher geprüften Clip: `return_security = weak`

**Delay:** 3 Minuten

> Sehe ihn.

> Finger werden schon steif.

**Weiter:** `k3_040_contact_distance`

---

## `k3_040_contact_distance`

**Mira:**

> Vielleicht zehn Meter vor mir.

> Er steht jetzt still.

> Blickt auf den Schnee.

> Da ist nichts.

> Ich rufe seinen Namen.

> Er sagt: „Es ist noch unten.“

> Dann wiederholt er es.

> Genau gleich. Gleiche Betonung.

**Antworten:**

1. **„Bleib auf Abstand. Frag, was unten ist.“**  
   → `k3_050_question`

2. **„Pack ihn und zieh ihn zur Leine.“**  
   → `k3_051_touch`

3. **„Untersuche die Stelle, auf die er sieht.“**  
   → `k3_052_snow`

---

## `k3_050_question`

**Mira:**

> „Was ist noch unten?“

> Er sieht mich an.

> Als hätte er erst jetzt gemerkt, dass ich hier bin.

> „Mira? Warum bist du draußen?“

Bei `aksel_state = stable`:

> Er zittert. Fragt, wo seine Handschuhe sind.

Bei `aksel_state = infected`:

> Er zittert nicht.

> Seine Hände sind rot vor Kälte. Er scheint es nicht zu merken.

**Antworten:**

1. **„Bring ihn zurück. Kein Körperkontakt, wenn möglich.“**  
   → `k3_060_return_together`

2. **„Lass ihn vorausgehen und beobachte ihn.“**  
   → `k3_061_return_follow`

3. **„Frag nach seiner letzten Erinnerung.“**  
   → `k3_053_memory`

---

## `k3_051_touch`

**Mira:**

> Hab seinen Arm.

> Er ist warm.

> Durch zwei Jacken und Handschuh.

> Das ergibt keinen Sinn.

> Er wehrt sich nicht. Sagt nur: „Nicht näher.“

**Effekte:**

- bei infiziertem Aksel und beschädigtem Miras Handschuh: `infection_source = aksel_contact`, sofern noch null
- `trust_aksel -1`

**Weiter:** `k3_060_return_together`

---

## `k3_052_snow`

**Mira:**

> Ich bleibe an der Leine und leuchte hin.

> Etwas steckt im Eis. Plastikkarte.

> Stationsausweis. Emil Varga, Bohrteam.

> Varga ist seit vier Tagen als vermisst eingetragen.

> Auf der Rückseite stehen Koordinaten. Von Hand.

> Nicht weit genug lesbar. Ich müsste näher ran.

**Antworten:**

1. **„Nimm den Ausweis und geh sofort zurück.“**  
   → `patient_zero_clue = true`, `k3_060_return_together`

2. **„Versuch die Koordinaten vollständig zu lesen.“**  
   → zusätzliche Kälte, `ice_coordinates_fragment = true`

3. **„Lass alles liegen. Das ist zu riskant.“**  
   → `k3_061_return_follow`

Bei unvorbereiteter Mira und zusätzlicher Untersuchung:

> Meine Hand—

> Moment.

> Ich bin an der Leine.

> Ich weiß nicht, wann ich zurückgegangen bin.

**Effekte:**

- `mira_lost_time = true`
- `clarity -1`

---

## `k3_053_memory`

**Mira:**

> Er erinnert sich an den Generator.

> Dann an Kaders Stimme aus einem Lautsprecher.

> Dann daran, wie jemand mit seiner Hand an die Außenscheibe geklopft hat.

> „Von draußen“, sagt er.

> Die Scheibe im Generatorhaus hat keine Außentreppe.

**Effekte:**

- `clue_aksel_memory = true`

**Weiter:** `k3_060_return_together`

---

## `k3_060_return_together`

**Delay:** 5 Minuten

**Mira:**

> Wir sind an der Leine.

> Er läuft.

> Ich halte Abstand.

Je nach Zustand:

- Stabiler Aksel stolpert und benötigt Hilfe.
- Infizierter Aksel läuft gleichmäßig und scheinbar ohne Kältegefühl.
- Exponierter Aksel wechselt zwischen beiden Verhalten.

**Weiter:** `k3_070_airlock`

---

## `k3_061_return_follow`

**Mira:**

> Er geht vor mir.

> Exakt meine Schrittgeschwindigkeit.

> Wenn ich langsamer werde, wird er langsamer.

> Ohne sich umzudrehen.

**Effekte:**

- `clarity -1`, falls Mira bereits beeinträchtigt

**Weiter:** `k3_070_airlock`

---

## `k3_070_airlock`

**Mira:**

> Außenschleuse erreicht.

> Ich kann ihn direkt hineinlassen, erst in der Schleuse untersuchen oder draußen halten.

**Antworten:**

1. **„Direkt rein. Er braucht Wärme.“**  
   → `k3_071_open`

2. **„Nur äußere Schleuse. Medizinischer Scan zuerst.“**  
   → `k3_072_scan`

3. **„Nicht öffnen. Er soll zum Generatorhaus zurück.“**  
   → `k3_073_lock_out`

---

## `k3_071_open`

**Mira:**

> Innere Tür offen.

> Er ist drin.

> Setzt sich auf den Boden, als wären die Beine plötzlich weg.

**Effekte:**

- `aksel_inside_after_return = true`
- bei direkter Hilfe und infiziertem Aksel möglicher Kontaktpfad
- `trust_aksel +1`

**Weiter:** `k3_100_after_march`

---

## `k3_072_scan`

**Delay:** 2 Minuten

Bei vorhandener Laboranalyse und Strom:

**Mira:**

> Temperatur zu hoch für die Zeit draußen.

> Puls niedrig.

> Blutbild kann ich durch die Schleuse nicht machen.

> Der Scanner markiert nichts Infektiöses. Er kennt aber auch nicht, wonach er suchen soll.

**Effekte:**

- infizierter/exponierter Aksel: `aksel_medical_scan = abnormal`
- stabiler Aksel: je nach Unterkühlung ebenfalls leicht abnormal

**Antworten:**

1. **„Reinlassen und isolieren.“**  
   → `aksel_inside_after_return = true`, neutral

2. **„Draußen lassen.“**  
   → `k3_073_lock_out`

Ohne Strom oder Labordaten:

> Scanner startet nicht.

> Aksel sitzt hinter der Scheibe und sieht mich an.

> Wartet.

---

## `k3_073_lock_out`

**Mira:**

> Ich öffne die innere Tür nicht.

> Er fragt einmal warum.

> Dann steht er auf und geht.

> Nicht zum Generator.

> Wieder in Richtung Whiteout.

**Effekte:**

- `aksel_march = locked_out`
- stabiler Aksel kann später tot gefunden werden
- infizierter Aksel kann später zurückkehren
- `trust_aksel -2`

**Weiter:** `k3_100_after_march`

---

## `k3_080_lost_return`

Dieser Node gilt nur, wenn Mira unvorbereitet folgte und die Leine verlor.

**Mira:**

> Ich sehe die rote Leine nicht mehr.

> Meine Spuren sind schon weg.

> Vier Richtungen sehen gleich aus.

**Antwortoptionen nach verfügbaren Hinweisen:**

- Generatorbrummen folgen, falls Generator stabil → sichere Rückkehr
- Ersatzlicht auf Bodenhöhe richten, falls geprüft → Leine finden
- Koordinaten und Windrichtung vergleichen, falls Klarheit ausreichend → Rückkehr mit starker Unterkühlung
- „Einfach geradeaus“ → zweite ausdrückliche Warnung von Mira

Beharrt der Spieler auf „geradeaus“:

> Ich laufe.

> Sag etwas.

> Egal was.

> Nur damit ich weiß, dass die Verbindung noch—

→ `ending_whiteout`

---

## `k3_100_after_march`

**Delay:** 10 Minuten

**Mira:**

> Wieder im Wohntrakt.

> Ich schreibe auf, was passiert ist, bevor meine Erinnerung daraus etwas Vernünftigeres macht.

> Aksel ging ohne Schutz hinaus.

> Er reagierte nicht.

> Er sagte: „Es ist noch unten.“

Falls Patient-Zero-Ausweis:

> Er stand über dem Ausweis eines vermissten Bohrarbeiters.

Falls verlorene Zeit:

> Für einen Teil des Rückwegs fehlen mir Minuten.

> Das ist die Kopfverletzung.

> Oder Kälte.

> Es gibt genügend normale Erklärungen.

**Effekte:**

- `chapter_03_main_complete = true`

**Weiter:** Ruhephase, dann Rückkehrszene falls ausgelöst.

# Die Rückkehr

## `k3_r_001_knock`

Nur wenn Aksel nicht sicher im Wohntrakt ist.

**Delay:** 12 Minuten

**Mira:**

> Jemand klopft an die Außenschleuse.

> Dreimal.

> Pause.

> Dreimal.

> Aksel sagt über die Gegensprechanlage, ich soll öffnen.

> Er sagt, er sei nur kurz draußen gewesen.

**Antworten:**

1. **„Kamera prüfen.“** – nur bei funktionsfähigem Generator
2. **„Stell ihm eine Kontrollfrage.“** – nur bei persönlichem Log/Hinweis
3. **„Medizinischer Scan.“** – nur bei Laborstrom
4. **„Sofort öffnen.“**
5. **„Nicht antworten.“**

---

## `k3_r_010_camera`

Bei stabilem Generator:

> Kamera zeigt Aksel.

> Bild springt alle paar Sekunden.

> In einem Frame steht er mit dem Rücken zur Tür.

> Seine Stimme spricht trotzdem weiter.

Bei instabilem Generator:

> Ein Standbild von Aksel.

> Zeitstempel vor sieben Minuten.

Die Kamera liefert bewusst keinen Beweis.

---

## `k3_r_020_question`

**Mira:**

> Ich frage nach der Delle in seinem Werkzeugkoffer. Etwas, worüber er sich beim Generator beschwert hat.

Bei echtem/stabilem Aksel:

> „Die war schon vor Kaldstad drin. Flughafen Tromsø. Frag nicht.“

Bei verändertem Aksel:

> Lange Pause.

> Dann dieselbe korrekte Antwort.

> Wort für Wort, als hätte er sie gelesen.

Auch die richtige Antwort ist kein Beweis.

---

## `k3_r_030_scan`

Der Scan wiederholt oder verschärft die mehrdeutigen Werte aus `k3_072_scan`.

**Mira:**

> Der Scanner sagt, er lebt.

> Mehr sagt er nicht.

---

## `k3_r_040_decision`

**Antworten:**

1. **„Öffne. Isoliere ihn danach im Behandlungsraum.“**  
   → `aksel_inside_after_return = true`; Zustand bleibt verborgen

2. **„Lass ihn draußen und schick ihn zum Generatorhaus.“**  
   → Aksel kann später helfen, verschwinden oder sterben

3. **„Öffne nicht.“**  
   → `aksel_march = locked_out`

**Mira bei Öffnen:**

> Innere Tür bleibt zu, bis die äußere verriegelt ist.

> Er tritt ein.

> Im Schnee hinter ihm sind nur seine Spuren.

> Sie beginnen drei Meter vor der Tür.

**Mira bei Nichtöffnen:**

> Er klopft nicht noch einmal.

> Als ich wieder zur Kamera sehe, ist er weg.

---

## `k3_110_transition`

**Mira:**

> Auf Thals Terminal liegen Koordinaten des Außenpostens und ein Hinweis auf lokale Wetterdaten.

> Wenn irgendein Rettungsflug möglich ist, wusste sie wann.

> Wir müssen zur Funkstation.

**Effekte:**

- `chapter_03_complete = true`
- Außenposten freigeschaltet

**Übergang:** Kapitel 4.

