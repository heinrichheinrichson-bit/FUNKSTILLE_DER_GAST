# Kapitel 7 und 8 – Eine Dosis / Rettung

Produktionsfassung 0.1

# Kapitel 7 – Eine Dosis

## Funktion

Alle Informationen und Beziehungen werden in konkrete Opferentscheidungen überführt. Das Spiel zeigt Symptome und Indizien, aber niemals einen bestätigten Infektionswert.

## `k7_001_synthesis`

**Delay:** 12 Minuten

**Mira:**

> Der Hemmstoff ist fertig.

> „Gegenmittel“ wäre zu viel gesagt.

> Er blockiert die Bildung der Netzstruktur in Zellkulturen. Ob das in einem Menschen dasselbe tut, weiß niemand.

Je nach Material:

- 0 Dosen: nur Eindämmung/Rettung möglich
- 1 Dosis: Grundprobe
- 2 Dosen: Grundprobe plus alte Probe
- 3 Dosen: tiefer Kern, alte Probe und stabiler Generator

> Wir haben nicht genug für alle.

---

## `k7_010_candidates`

Mira fasst die Indizien ohne Wertung zusammen.

### Mira

- mögliche Expositionen
- Erinnerungslücken
- veränderte Wahrnehmung
- zugleich Kopfverletzung, Kälte und Erschöpfung als Alternativerklärungen

### Aksel

- Bohrstaub
- Marsch
- Erinnerungslücke
- ungewöhnliche Körpertemperatur
- möglicherweise vollständig normale medizinische Werte

### Thal

- eigene Erinnerungslücken
- Zeit allein am Außenposten
- keine bestätigte Probenexposition

### Kader

- direkter Kontakt zur Kernkammer
- verändertes Verhalten
- größtes Wissen über Hemmstoff und Eindämmung

---

## `k7_020_distribution`

Der Spieler verteilt jede verfügbare Dosis einzeln:

- Mira behandeln
- Aksel behandeln
- Thal behandeln
- Kader behandeln
- ungeöffnet für Analyse aufbewahren

Vor Abschluss zeigt Mira die Entscheidung noch einmal an.

**Mira:**

> Wenn wir falschliegen, behandeln wir einen Gesunden mit etwas, das nie an Menschen getestet wurde.

> Wenn wir gar nichts tun, nehmen wir vielleicht etwas Lebendes mit in den Hubschrauber.

> Bestätigen?

---

## `k7_030_reactions`

### Mira behandelt

> Injektion gesetzt.

> Brennt entlang des Arms.

> Für einen Moment war das Relais vollkommen still.

> Wahrscheinlich Zufall.

Setzt `mira_treated = true`.

### Aksel behandelt

Bei hohem Vertrauen akzeptiert er. Bei niedrigem Vertrauen muss Mira ihn überzeugen oder zwingen.

> Er fragt, ob Mira ihm danach glauben wird.

> Sie kann nicht antworten.

Setzt `aksel_treated = true`.

### Thal behandelt

> Thal liest die gesamte Formel, bevor sie zustimmt.

> „Falls ich danach nicht mehr ich bin, woran merken Sie den Unterschied?“

Setzt `thal_treated = true`.

### Kader behandelt

> Kader lacht einmal.

> „Sie geben dem Verantwortlichen die Dosis.“

> Dann hält er den Arm hin.

Setzt `kader_treated = true`.

### Probe bewahrt

> Behälter versiegelt.

> Genug für ein externes Labor.

> Oder für die nächste Katastrophe.

Setzt `sample_preserved = true`.

---

## `k7_040_last_report`

Mira bereitet den Notruf vor.

**Antworten:**

1. **Vollständiger Bericht einschließlich eigener möglicher Symptome**  
   `report_honesty = full`, Rettungsteam kommt mit Quarantäne

2. **Bedrohung und Beweise melden, persönliche Symptome auslassen**  
   `report_honesty = partial`

3. **Nur Unfall und Koordinaten melden**  
   `report_honesty = false`, höhere Rettungschance bei schwachen Beweisen, hohes Kontaminationsrisiko

Bei hoher `trust_mira` folgt Mira dem Rat. Bei sehr niedrigem Vertrauen kündigt sie offen an, welche Version sie tatsächlich sendet.

---

## `k7_050_station_choice`

**Mira:**

> Letzte Entscheidung vor der Landezone.

> Station verriegeln und verlassen.

> Den vorbereiteten Einsturz auslösen.

> Oder alles offenlassen, damit ein Team Proben sichern kann.

**Optionen:**

- verriegeln → `containment = partial`
- zerstören → nur bei `containment = ready`
- offenlassen → `containment = failed`, mehr wissenschaftliche Daten möglich

---

## `k7_060_departure_group`

Mögliche Überlebende entscheiden aufgrund von Vertrauen, Behandlung und Zustand, ob sie folgen.

Der Spieler kann eine zurückbleibende Person einmal überzeugen. Zwang ist nur möglich, wenn Mira Hilfe hat, und verschlechtert die Landezonensituation.

**Effekte:**

- Liste `evacuation_group`
- `dose_hoarded = true`, wenn Mira die einzige Dosis für sich verwendete und einen erreichbaren anderen Kandidaten zurücklässt

# Kapitel 8 – Rettung

## `k8_001_signal`

**Mira:**

> Sender auf Notleistung.

> Wetterdaten angehängt.

> Koordinaten angehängt.

> Bericht angehängt.

> Senden.

**Delay:** abhängig vom Beweisumfang

> Quittung.

> Versorgungsstation hat empfangen.

> „Rettungsflug gestartet. Ankunft in 43 Minuten. Landezone Nord markieren.“

Falls Rettungsqualität unzureichend:

> Keine Quittung.

> Sender versucht es erneut.

---

## `k8_010_wait`

**Delay:** längste Echtzeitpause des Spiels

Zwischenmeldungen hängen von Gruppe und Anlagenzustand ab:

- Generator fällt endgültig aus.
- Aksel beginnt zu zittern oder hört plötzlich auf.
- Thal überprüft Miras Bericht.
- Kader versucht, zur Station zurückzugehen.
- Das Relais verliert einzelne Nachrichten.

Der Spieler trifft höchstens eine letzte Vertrauensentscheidung, keine neue technische Rätselentscheidung.

---

## `k8_020_landing_zone`

**Mira:**

> Landezone erreicht.

> Markierungsfeuer steht.

> Wind steigt wieder.

> Ich sehe noch nichts.

Bei instabilem NPC:

> Jemand in der Gruppe will zurück zur Station.

Der Spieler kann reden, körperlich stoppen oder gehen lassen. Frühere Vertrauenswerte entscheiden über Erfolg.

---

## `k8_030_helicopter`

Bei ausreichender Rettungsqualität:

> Licht.

> Norden.

> Hubschrauber.

> Sie haben uns.

Bei unzureichender Qualität:

> Nichts.

> Wetterfenster schließt.

> Relaisakku vier Prozent.

→ `ending_radio_silence`

---

## `k8_040_containment`

Falls Zerstörung vorbereitet:

**Mira:**

> Auslöser zeigt bereit.

> Wenn ich jetzt drücke, fällt Ebene minus drei in den Schacht.

> Die Verzögerung reicht vielleicht, um einzusteigen.

> Vielleicht.

**Optionen:**

- sofort auslösen und zur Winde laufen
- erst alle anderen einsteigen lassen
- nicht auslösen

Eine vorbereitete, korrekt ausgeführte Zerstörung ohne unkontrollierte Evakuierte priorisiert `ending_contained`.

---

## `k8_050_boarding`

**Mira:**

> Seil ist unten.

> Einer nach dem anderen.

Variantentexte nennen alle geretteten oder zurückgelassenen Figuren.

> Ich bin als Letzte dran.

> Kabine.

> Wärme.

> Echte Wärme.

> Das Relais zeigt noch eine Minute.

---

## `k8_060_goodbye`

**Mira:**

> Ich weiß nicht einmal, wie du heißt.

Falls Spieler Standort/Identität teilte:

> Ich weiß nur, wo du ungefähr bist.

> Das reicht vielleicht, damit ich irgendwann Danke sagen kann, ohne eine kaputte Station dazwischen.

Bei hohem Vertrauen:

> Du hast nicht immer richtiggelegen.

> Ich auch nicht.

> Aber du bist geblieben.

Bei niedrigem Vertrauen:

> Wir waren uns oft nicht einig.

> Ohne die Verbindung wäre ich trotzdem nicht hier.

> Danke.

> [VERBINDUNG BEENDET]

Der Abschied bleibt für mehrere Enden absichtlich nahezu identisch.

# Ending-Szenen

## `ending_clean_rescue`

> Kaldstad wird zwölf Stunden später unter Quarantäne gestellt.

> Bei Mira werden keine netzartigen Strukturen nachgewiesen.

> Ob sie nie infiziert war oder der Hemmstoff wirkte, lässt sich nicht bestimmen.

> Drei Wochen später erreicht dein Gerät eine gewöhnliche Nachricht:

> „Diesmal habe ich die Verbindung selbst gewählt. – Mira“

---

## `ending_all_rescued`

> Alle Personen, die Kaldstad lebend verlassen konnten, erreichen die Versorgungsstation.

> Keine Probe reagiert außerhalb der versiegelten Behälter.

> Die Untersuchung wird unterbrochen, nachdem zwei unabhängige Teams dieselben Sicherheitsbedenken melden.

> Miras letzte Nachricht kommt Monate später:

> „Wir sind noch wir. Soweit jemand das von sich sagen kann.“

---

## `ending_contained`

> Ebene minus drei stürzt um 04:17 Uhr Ortszeit in den Bohrschacht.

> Die Temperatur im Kernbereich fällt innerhalb einer Stunde unter den messbaren Bereich.

> Von Mira kommt keine weitere Nachricht.

> Auf Satellitenbildern ist Kaldstad nur noch eine dunkle Stelle im Eis.

> Sie hat verhindert, dass der Gast abreist.

---

## `ending_hidden_guest`

> Die Verbindung endet, bevor das Rettungsteam die erste Blutprobe auswertet.

> Ein Messwert erscheint außerhalb des erwarteten Rasters.

> Er wird als Gerätefehler markiert.

> Mira schläft bereits.

> Unter der Haut ihres Arms bildet sich für einen Moment eine feine dunkle Linie.

> Der Hubschrauber fliegt nach Norden.

---

## `ending_the_lie`

> Mira sieht den auffälligen Messwert.

> Der Sanitäter fragt, ob sie Kontakt mit der Probe hatte.

> Sie sagt Nein.

> Ruhig. Ohne zu zögern.

> In ihrer Tasche blinkt das Relais ein letztes Mal, obwohl die Verbindung längst beendet ist.

---

## `ending_one_dose`

> Der Hemmstoff wirkt.

> Mira erreicht die Versorgungsstation ohne nachweisbare Veränderung.

> Im Abschlussbericht steht, für die anderen habe keine Behandlungsmöglichkeit bestanden.

> Das ist technisch korrekt.

> Sie schreibt dir nie wieder.

---

## `ending_whiteout`

Der Text variiert nach Ort, endet aber immer mit einer unvollständigen Nachricht.

> Wind übersteuert jedes Mikrofon.

> Miras Standort bewegt sich noch einige Minuten weiter von Kaldstad fort.

> Dann bleibt er stehen.

> Die Verbindung bleibt aktiv, bis der Akku leer ist.

> Es kommt keine weitere Nachricht.

---

## `ending_radio_silence`

> [SIGNAL UNTERBROCHEN]

> Das Relais versucht elfmal, die Verbindung neu aufzubauen.

> Kein Versuch erreicht Kaldstad.

> Ob der Rettungsflug die Station gefunden hat, erfährst du nicht.

> Funkstille.

# Ending-Priorität

1. `ending_whiteout`
2. `ending_radio_silence`
3. `ending_contained`
4. `ending_one_dose`
5. `ending_the_lie`
6. `ending_hidden_guest`
7. `ending_all_rescued`
8. `ending_clean_rescue`

Die Priorität verhindert widersprüchliche Doppelenden.

