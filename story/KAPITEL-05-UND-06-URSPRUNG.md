# Kapitel 5 und 6 – Der Ursprung / Unter dem Eis

Produktionsfassung 0.1

# Kapitel 5 – Der Ursprung

## Funktion

- Patient Null und Kaders Vertuschung rekonstruieren
- Kader persönlich auflösen, ohne ihn zum einfachen Bösewicht zu machen
- Versiegeln, Probenentnahme oder tieferes Bohren als tragende Entscheidung
- Gletscherspalten als optionalen Hochrisikoweg freischalten

## `k5_001_pack`

Mira kann zwei große Ausrüstungsstücke tragen, mit Begleitung drei:

- Schutzanzug
- Versiegelungsschaum und Bolzen
- großer Probenbehälter
- Wärmeakku
- Relais-Ersatzakku

**Mira:**

> Was wir nicht mitnehmen, fehlt uns unten.

> Und was wir mitnehmen, macht den Abstieg langsamer.

Die Auswahl wird sichtbar bestätigt und später nicht durch Zufall entwertet.

---

## `k5_010_tower`

**Delay:** 9 Minuten

**Mira:**

> Bohrturm erreicht.

> Eine Seitenwand ist nach außen gebogen.

> Nicht nach innen.

> Als hätte der Druck im Gebäude gesessen.

> Luft riecht süßlich. Ozon und etwas Organisches.

> Schutz bleibt zu.

---

## `k5_020_accident_log`

Im Kontrollraum liegen Unfallbericht, beschädigtes Werkzeug und ein unvollständiger medizinischer Eintrag.

**Mira:**

> Emil Varga. Schnittverletzung an der linken Hand beim Bergen von Kern 14C.

> Desinfiziert. Vier Stiche. Zur Arbeit zurückgekehrt.

> Am Folgetag hat er gemeldet, die Wunde sei vollständig geschlossen.

> Dafür gibt es sogar ein Foto.

> Nach zwölf Stunden.

Falls Patient-Zero-Ausweis gefunden:

> Sein Ausweis lag dort draußen im Schnee.

> Vier Tage nach diesem Eintrag.

**Effekte:**

- `patient_zero_confirmed = true`
- `evidence_level +1`

---

## `k5_030_descent`

**Mira:**

> Lift ohne Strom. Wartungsleiter bis Ebene minus drei.

> Kader antwortet auf Funk.

**Kader:**

> „Kommen Sie allein.“

Je nach Begleitung und Vertrauen entscheidet der Spieler:

- Begleitung offen mitnehmen
- Begleitung oben warten lassen
- Begleitung heimlich nachkommen lassen

Dies beeinflusst Kaders Kooperation und mögliche Rettung bei einem Unfall.

---

## `k5_040_kader`

Kaders Zustand wird aus Beziehung und Zeit bestimmt.

### Kooperativer Kader

> Er sitzt vor der Kernkammer. Schutzanzug, Visier offen.

> „Ich habe den Bericht geändert. Wenn Sie dafür eine Erklärung brauchen, bekommen Sie keine gute.“

> „Wir hatten drei Monate, bevor das Projekt gestrichen worden wäre. Ich wollte Gewissheit.“

### Eigenmächtiger Kader

> Er arbeitet am Bohrkopf.

> „Sie hätten nicht kommen sollen. Jetzt helfen Sie oder gehen wieder.“

### Veränderter Kader

> Er steht mit der Stirn an der Sichtscheibe.

> Spricht weiter, bevor Mira ihn anspricht:

> „Es bildet keine Kolonie. Kolonie ist das falsche Wort.“

> Dann dreht er sich um und begrüßt sie.

---

## `k5_050_truth`

Der Spieler kann drei Themen ansprechen:

- Varga / Patient Null
- blockierter Warnruf
- alte Entdeckung

**Kaders Kernaussage:**

> „Ich dachte, wir beobachten Reaktion. In Wahrheit beobachtete es uns.“

> „Das ist eine Metapher, Lindner. Schreiben Sie nicht, ich hätte Bewusstsein behauptet.“

Kader hat nicht den Ausbruch geplant. Er hat Beweise zurückgehalten und damit eine rechtzeitige Quarantäne verhindert.

---

## `k5_060_chamber`

**Mira:**

> Kernkammer.

> Bohrkopf steckt noch im Eis.

> Daneben ein Riss, etwa handbreit.

> Auf der Oberfläche liegt etwas wie Reif.

> Es bildet Linien gegen die Schwerkraft.

**Kader:**

> „Wir können schließen, nehmen, was wir brauchen, oder tiefer gehen.“

### Wahl A – Versiegeln

Benötigt Material oder kooperativen Kader.

**Mira:**

> Schaum in den Riss. Bolzen durch die Wartungsplatte.

> Die Linien ziehen sich zurück, bevor der Schaum sie berührt.

> Wahrscheinlich Wärmegradient.

**Effekte:**

- `containment = partial`
- `cure_material +0`
- keine Infektion

### Wahl B – Kontrollierte Probe

Mit vollständigem Schutz und Behälter:

> Probe isoliert. Doppelte Wandung. Kein Druckverlust.

> Genug für einen Hemmstoffansatz.

**Effekte:**

- `cure_material +1`
- keine Infektion

Ohne Schutz:

> Beim Schließen des Behälters beschlägt mein Visier von innen.

> Ich trage kein Visier.

> Entschuldige. Für einen Moment dachte ich—

**Effekte:**

- `infection_source = drill_sample`, falls noch null
- `clarity -1`

### Wahl C – Tiefer bohren

Nur mit Kaders Wissen oder vollständiger Logkombination.

**Kader:**

> „Darunter liegt eine zweite Grenzschicht. Wenn wir sie erreichen, haben wir genug Material, um zu verstehen, was der Hemmstoff blockieren muss.“

Mit Schutz und stabiler Anlage:

- `cure_material +2`
- `ice_coordinates_found = true`
- `containment = unstable`

Ohne vollständigen Schutz:

- zusätzlich `infection_source = deep_core`

Ohne stabile Anlage warnt Mira zweimal. Beharrt der Spieler:

> Der Bohrkopf springt.

> Etwas trifft die Sichtscheibe von innen.

> Kader sagt meinen Namen.

> Dann sagt er ihn noch einmal aus dem Funkgerät auf dem Boden.

> [SIGNAL VERLOREN]

→ `ending_radio_silence`

---

## `k5_070_kader_resolution`

Abhängig von Zustand:

- Kader begleitet Mira zurück.
- Kader bleibt zur Überwachung der Versiegelung.
- Kader verschwindet während eines kurzen Relaisausfalls.
- Ein veränderter Kader versucht nicht anzugreifen, sondern die Probe zu öffnen.

Bei letzter Variante entscheidet der Spieler:

- körperlich stoppen → möglicher `kader_contact`
- Kammer verriegeln → Kader bleibt eingeschlossen
- mit Fakten überzeugen → nur bei hoher Beziehung und vollständigem Bericht

---

## `k5_080_coordinates`

Koordinaten entstehen durch eine Kombination aus:

- Vargas Ausweis,
- Kaders Notizen,
- tiefer Bohrung,
- Kaders freiwilliger Aussage.

**Mira:**

> Gletscherspalte elf Kilometer südöstlich.

> Alte Notunterkunft. In keinem aktuellen Stationsplan.

> Kader hat dort Material versteckt.

> Das Rettungsfenster wartet nicht.

**Entscheidung:**

- direkt zum Labor → Kapitel 7
- Notunterkunft riskieren → Kapitel 6

# Kapitel 6 – Unter dem Eis

## Funktion

Optionaler Hochrisikobereich. Er ermöglicht zusätzliche Dosen, vollständige Beweise und das Eindämmungsende, kostet aber Zeit und kann ein Whiteout-Ende auslösen.

## `k6_001_commit`

**Mira:**

> Wenn wir gehen, gibt es keinen zweiten Versuch.

> Wir können genug finden, um mehr als eine Person zu behandeln.

> Oder wir verpassen den Hubschrauber für eine Probe, die vielleicht nichts wert ist.

Die Entscheidung wird bestätigt.

---

## `k6_010_approach`

**Delay:** 18 Minuten

> Koordinaten erreicht.

> Keine Hütte.

> Nur eine Markierung im Eis und ein Stahlring unter Schnee.

> Die Unterkunft liegt in der Spalte.

---

## `k6_020_descent`

Der Abstieg prüft:

- Sicherungsseil/Aksels Werkzeug
- Verletzungszustand
- Wärmeakku
- Begleitung

Bei schlechter Vorbereitung bietet Mira Umkehr an.

Erstes Beharren:

> Der Anker bewegt sich.

> Noch trägt er.

Zweites Beharren:

> Seil rutscht.

> Ich sehe oben nur einen schmalen weißen Streifen.

> Sag nicht, ich soll weiter.

Erneutes Weitergehen → `ending_whiteout`.

Bei ausreichender Vorbereitung:

> Unten ist eine Tür im Eis.

> Von außen verriegelt.

---

## `k6_030_shelter`

**Mira:**

> Provisorisches Labor. Alt. Mindestens mehrere Jahre.

> Dieselben Probenbehälter wie auf Kaldstad, aber andere Projektnummer.

> Sie wussten es.

> Nicht Kader. Jemand vor ihm.

**Funde:**

- alte, stabilisierte Probe
- Projektunterlagen
- Sprengplan des Bohrschachts
- persönliche Aufnahme eines früheren Forschers

**Aufnahme:**

> „Es übernimmt nichts. Das ist die falsche Vorstellung.“

> „Es verbindet.“

> „Nach einer Weile weiß keiner mehr, welcher Gedanke zuerst da war.“

---

## `k6_040_kader_optional`

Falls Kader im Bohrturm verschwand:

> Er sitzt in der hinteren Kammer.

> Keine Außenkleidung.

> Er müsste tot sein.

> Als Mira Licht auf ihn richtet, sagt er:

> „Sie haben lange gebraucht.“

Entscheidung:

- Abstand und Tür schließen
- mit ihm sprechen
- körperlich helfen

Nur körperliche Hilfe kann `infection_source = kader_contact` setzen. Gespräch kann die Eindämmungssequenz freischalten.

---

## `k6_050_priority`

Mira kann wegen des Wetterfensters nur eine gründliche Aufgabe erledigen:

1. **Probe sichern**  
   `cure_material +2`

2. **Alle Beweise übertragen**  
   `evidence_level +2`

3. **Eindämmungsplan vorbereiten**  
   `containment = ready`

Mit lebender, vertrauensvoller Begleitung können zwei Aufgaben erledigt werden.

---

## `k6_060_return`

**Delay:** 20 Minuten

**Mira:**

> Wieder oben.

> Wind hat gedreht.

> Unsere Spuren sind weg.

Bei vollständigen Koordinaten und Klarheit:

> Kurs auf Kaldstad. Nicht den Spuren folgen, die nicht da sind.

Bei niedriger Klarheit:

> Ich sehe Lichter.

> Zwei Stationen.

> Eine links, eine rechts.

> Kaldstad hat nur einen Lichtmast.

Der Spieler nutzt:

- Kompassdaten,
- Funkpeilung bei stabilem Relais,
- Generatorbrummen,
- Begleitung.

Eine begründete Wahl führt zurück. Blindes Folgen des falschen Lichtes nach Warnung führt zu `ending_whiteout`.

---

## `k6_070_hub`

**Mira:**

> Wohntrakt.

> Labor läuft noch.

> Das Wetterfenster beginnt bald.

> Jetzt müssen wir entscheiden, wem wir glauben.

> Und wem wir eine Dosis geben.

**Effekte:**

- `chapter_05_complete = true`
- `chapter_06_complete = true`, falls besucht

**Übergang:** Kapitel 7.

