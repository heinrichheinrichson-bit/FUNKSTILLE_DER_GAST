# Kapitel 2 – Licht oder Wahrheit

Produktionsfassung 0.1

## Funktion

Kapitel 2 enthält zwei Routen, die nacheinander gespielt werden. Die zuerst gewählte Route ist leichter; währenddessen verschärft sich die andere Krise. Am Ende wurden Labor und Generator besucht, aber nie ohne Kosten.

## Neue Zustände

| Zustand | Werte |
|---|---|
| `generator_state` | `stable`, `unstable`, `failed` |
| `lab_sample_state` | `sealed`, `analyzed`, `degraded` |
| `lab_protection` | `none`, `filter`, `full` |
| `infection_source` | `null` oder erste Infektionsquelle |
| `kader_relation` | −2 bis +2 |
| `relay_backup` | `true` / `false` |
| `item_generator_tool` | `true` / `false` |
| `item_sample_data` | `true` / `false` |
| `log_kader_07` | `true` / `false` |
| `log_freight_complete` | `true` / `false` |
| `chapter_02_complete` | `true` / `false` |

## Routenlogik

```text
first_route = labor
    Labor in Normalzustand
    → Generator in verschärftem Zustand

first_route = generator
    Generator in Normalzustand
    → Labor mit beschädigter Aufnahme

Beide Wege
    → Rückkehr Wohntrakt
    → Kapitel 3
```

# Route Labor

## `k2_l_001_corridor`

**Mira:**

> Der Laborgang ist vollständig dunkel.

> Notlicht müsste hier unabhängig laufen.

> Tut es nicht.

> Ich habe nur die Stirnlampe und dein Display am Relais.

Falls Labor zuerst:

> Hinter der Brandschutztür läuft noch die Kühlwarnung. Regelmäßig. Fast beruhigend.

Falls Generator zuerst:

> Die Warnung hat aufgehört.

> Entweder ist die Temperatur wieder normal oder der Sensor ist tot.

**Antworten:**

1. **„Prüf zuerst die Tür und den Boden. Langsam.“**  
   → `k2_l_010_careful_entry`, `trust_mira +1`

2. **„Geh direkt zur Probenkammer.“**  
   → `k2_l_011_fast_entry`

---

## `k2_l_010_careful_entry`

**Delay:** 2 Minuten

**Mira:**

> Kabel im Gang. Eins davon frisch durchtrennt.

> Kein Bruch. Glatte Schnittkante.

> Daneben liegt ein Atemfilter. Verpackt.

> Nehm ich mit.

**Effekte:**

- `lab_protection = filter`

**Weiter:** `k2_l_020_locked`

---

## `k2_l_011_fast_entry`

**Mira:**

> Tür ist verriegelt.

> Natürlich.

> Das Bedienfeld nimmt meinen Code nicht.

**Weiter:** `k2_l_020_locked`

---

## `k2_l_020_locked`

**Mira:**

> Drei Möglichkeiten.

> Thal könnte ihren Zugang irgendwo notiert haben. Kader hat Stationsleiterrechte. Oder Aksel kann die Verriegelung überbrücken.

**Bedingte Antworten:**

1. **„Thals Log: Versuch das Datum ihres Warnberichts.“**  
   Voraussetzung: `log_thal_07`  
   → `k2_l_021_thal_code`

2. **„Kontaktiere Kader über das interne Terminal.“**  
   → `k2_l_022_call_kader`

3. **„Aksel soll die Tür öffnen.“**  
   Voraussetzung: Aksel frei oder per Relais erreichbar  
   → `k2_l_023_aksel_door`

---

## `k2_l_021_thal_code`

**Mira:**

> Datum eingegeben.

> Tür offen.

> Entweder Thal ist erschreckend vorhersehbar oder sie wollte, dass jemand ihre Spuren findet.

**Effekte:**

- `kader_knows_lab = false`

**Weiter:** `k2_l_030_terminal`

---

## `k2_l_022_call_kader`

**Delay:** 1 Minute

**Kader, Textterminal:**

> LINDNER? BESTÄTIGEN SIE IHREN STANDORT.

**Mira:**

> Keine Begrüßung.

> Keine Frage, ob ich verletzt bin.

**Antworten:**

1. **„Sag ihm die Wahrheit und bitte um den Code.“**  
   `kader_relation +1`, `kader_knows_lab = true`

2. **„Sag nur, du brauchst medizinisches Material.“**  
   `kader_relation -1`, `kader_knows_lab = true`

**Kader:**

> ZUGANG 0414. BERÜHREN SIE PROBENKAMMER DREI NICHT. KOMMEN SIE DANACH ZUM BOHRTURM.

**Weiter:** `k2_l_030_terminal`

---

## `k2_l_023_aksel_door`

Falls Aksel anwesend:

> Aksel hat die Abdeckung abgenommen. Zwei Kabel getauscht. Tür offen.

> Er wusste genau, welche.

Falls Aksel nur über Stationsfunk hilft:

> Aksel erklärt mir die Überbrückung. Er klingt außer Atem.

> Auf meine Frage, wo er ist, antwortet er nicht.

**Effekte:**

- bei positivem Vertrauen: `trust_aksel +1`
- `kader_knows_lab = false`

**Weiter:** `k2_l_030_terminal`

---

## `k2_l_030_terminal`

**Mira:**

> Hauptterminal läuft.

> Offizieller Bericht, Kader, vor sieben Tagen:

> „Probe 14C biologisch inert. Keine Replikation. Keine erkennbare Gefahr.“

> Darunter eine verworfene Passage:

> „Strukturbildung nach Erwärmung. Reaktion auf—“

> Der Rest wurde überschrieben.

**Effekte:**

- `log_kader_07 = true`

Falls Labor zuerst:

> Zeitrafferaufnahme ist noch vollständig.

Falls Generator zuerst:

> Die letzten vier Stunden fehlen. Stromunterbrechung.

**Weiter:** `k2_l_040_sample`

---

## `k2_l_040_sample`

**Delay:** 1 Minute

**Mira:**

> Ich sehe die Probe durch das Sichtfenster.

> Auf den ersten Blick nur graues Material im Schmelzwasser.

> Im Zeitraffer entstehen Linien. Sehr fein. Sie verbinden einzelne dunkle Punkte miteinander.

> Kein Wachstum im üblichen Sinn.

> Eher ein Netz.

> Jedes Mal, wenn jemand vor der Kammer stand, hat es sich zur Scheibe orientiert.

> Das kann Wärme sein.

> Muss Wärme sein.

**Antworten:**

1. **„Schnellanalyse. Wir brauchen jetzt Antworten.“**  
   → `k2_l_050_fast_analysis`

2. **„Nur mit vollständigem Schutz und Protokoll.“**  
   → `k2_l_051_safe_analysis`

3. **„Versiegle die Kammer. Nichts weiter anfassen.“**  
   → `k2_l_052_seal`

---

## `k2_l_050_fast_analysis`

**Mira:**

> Ich ziehe eine minimale Menge über die Außenschleuse.

Falls `lab_protection = filter`:

> Filter sitzt. Nicht ideal, aber besser als nichts.

Falls kein Filter:

> Schutzmaske ist nicht da, wo sie sein sollte.

> Ich halte Abstand.

**Delay:** 4 Minuten

> Unter größerer Vergrößerung sind die Linien hohl.

> Wie Kapillaren. Oder Nerven.

> Nein. Zu früh für Vergleiche.

> Mir ist schwindlig. Wahrscheinlich die Kopfverletzung.

**Effekte:**

- `lab_sample_state = analyzed`
- `item_sample_data = true`
- ohne Filter und falls erste Infektion: `infection_source = lab_aerosol`
- `clarity -1`

**Weiter:** `k2_l_060_medical`

---

## `k2_l_051_safe_analysis`

Falls Generator stabil oder Labor zuerst:

**Mira:**

> Vollständiger Schutz braucht Zeit. Schleuse, Filtertest, Negativdruck.

> Aber sauber.

> Die Struktur reagiert auf elektrische Impulse. Nicht nur Wärme.

> Das ist der erste belastbare Befund.

**Effekte:**

- `lab_sample_state = analyzed`
- `item_sample_data = true`
- keine Infektion
- globale Zeit +2

Falls Generator instabil/ausgefallen und Generator zuerst:

> Der Negativdruck hält nicht.

> Ich kann die Analyse abbrechen oder mit dem Atemfilter weitermachen.

**Zusatzwahl:**

- abbrechen → `lab_sample_state = sealed`
- fortsetzen → wie Schnellanalyse, Filter verhindert Infektion, `clarity -1`

**Weiter:** `k2_l_060_medical`

---

## `k2_l_052_seal`

**Mira:**

> Kammer mechanisch verriegelt. Zweite Dichtung gesetzt.

> Keine Probe.

> Keine Antworten.

> Im Moment kann ich damit leben.

**Effekte:**

- `lab_sample_state = sealed`
- `item_sample_data = false`

**Weiter:** `k2_l_060_medical`

---

## `k2_l_060_medical`

**Mira:**

> Bevor ich gehe: die Wunde.

> Ich habe die eingerissene Packung aus dem Wohntrakt und hier liegt eine versiegelte, aber das Etikett ist halb abgelöst.

Falls `item_freight_manifest_a`:

> Gleiche Chargennummer wie eine der umgebuchten Medikamentenkisten.

**Antworten:**

1. **„Nimm die versiegelte Packung aus dem Labor.“**  
   → sicher, `mira_wound_treated = true`

2. **„Die eingerissene Packung war nur heruntergefallen. Benutz sie.“**  
   → `mira_wound_treated = true`; Infektion nur, wenn später das vollständige Manifest Manipulation bestätigt

3. **„Noch nicht behandeln.“**  
   → Wunde bleibt offen, Außenrisiko steigt

**Weiter:** `k2_l_070_kader`

---

## `k2_l_070_kader`

Kader meldet sich unabhängig davon, ob er zuvor kontaktiert wurde.

**Kader:**

> LINDNER. VERLASSEN SIE DAS LABOR. DIE PROBE IST NICHT DAS PRIMÄRE RISIKO.

**Mira:**

> Dann weiß er, dass ich hier bin.

> Auch wenn ich seinen Code nicht benutzt habe.

**Antworten:**

1. **„Konfrontiere ihn mit dem gelöschten Bericht.“**  
   → `k2_l_071_confront`

2. **„Verschweige, was du gefunden hast.“**  
   → `k2_l_072_hide`

3. **„Biete Zusammenarbeit an, wenn er alles offenlegt.“**  
   → `k2_l_073_cooperate`

---

## `k2_l_071_confront`

**Mira an Kader:**

> „Biologisch inert?“

**Kader:**

> DER BERICHT WAR ZU DIESEM ZEITPUNKT KORREKT.

> KOMMEN SIE ZUM BOHRTURM. NICHT ALLEIN.

**Mira:**

> Eine wissenschaftlich elegante Art zu lügen.

**Effekte:**

- `kader_relation -1`
- `kader_confronted = true`

---

## `k2_l_072_hide`

**Mira an Kader:**

> Hab nur medizinisches Material gesucht.

**Kader:**

> GUT. VERLASSEN SIE DEN BEREICH.

**Mira:**

> Er glaubt mir nicht.

> Oder er glaubt mir zu schnell.

**Effekte:**

- `kader_relation = kader_relation`
- `kader_thinks_data_hidden = true`

---

## `k2_l_073_cooperate`

**Mira an Kader:**

> Ich helfe Ihnen. Dafür keine ausgelassenen Passagen mehr.

**Kader:**

> DANN SICHERN SIE DIE STROMVERSORGUNG. DANACH BOHRTURM.

> UND LINDNER: FALLS BERG BEI IHNEN IST, LASSEN SIE IHN NICHT ALLEIN.

**Effekte:**

- `kader_relation +1`
- `kader_warned_about_aksel = true`

---

## `k2_l_080_exit`

**Mira:**

> Genug Labor.

Falls Generator noch nicht besucht:

> Jetzt zum Generator. Die Temperatur im Wohntrakt sinkt.

Falls Generator bereits besucht:

> Zurück zum Wohntrakt.

**Übergang:** Generatorroute oder Kapitelzusammenführung.

# Route Generator

## `k2_g_001_airlock`

**Mira:**

> Außenschleuse.

> Wind liegt bei neunzig Stundenkilometern. Sicht vielleicht acht Meter.

> Der Generator ist über eine rote Sicherungsleine verbunden.

> Ich prüfe den Anzug.

Falls Wunde unbehandelt:

> Blutung hat aufgehört. Unter der Mütze drückt es trotzdem.

**Antworten:**

1. **„Prüf Anzug, Clip und Ersatzlicht vollständig.“**  
   → `k2_g_010_prepared`, Zeit +1

2. **„Die Leine reicht. Geh, bevor es schlimmer wird.“**  
   → `k2_g_011_fast`

---

## `k2_g_010_prepared`

**Mira:**

> Clip war nicht vollständig geschlossen.

> Jetzt ist er es.

> Ersatzlicht funktioniert.

> Raus.

**Effekte:**

- `outside_prepared = true`

---

## `k2_g_011_fast`

**Mira:**

> Bin an der Leine.

> Raus.

**Effekte:**

- `cold_exposure +1`

---

## `k2_g_020_crossing`

**Delay:** 6 Minuten

**Mira:**

> Hälfte geschafft.

> Man sieht das Gebäude erst, wenn man fast dagegenläuft.

> Da sind Fußspuren neben der Leine.

> Hin und zurück.

> Eine Spur endet auf halbem Weg.

**Antworten:**

1. **„Nicht untersuchen. Bleib an der Leine.“**  
   → sichere Ankunft

2. **„Leuchte kurz hin, ohne die Leine loszulassen.“**  
   → Mira erkennt Bohrstaub und einen einzelnen Handschuh, `clue_outside_glove = true`, zusätzliche Kälte

---

## `k2_g_030_entry`

**Mira:**

> Generatorhaus offen.

> Das sollte es nicht sein.

> Drinnen läuft der Hauptdiesel unregelmäßig. Einer der Wechselrichter ist tot.

Falls Aksel begleitet:

> Aksel geht sofort zum Schaltschrank. Keine Diskussion.

Falls Aksel nicht begleitet:

> Ich kenne das System aus den Stationsübungen. Theorie und Wirklichkeit haben leider unterschiedliche Geräusche.

---

## `k2_g_040_manifest`

**Mira:**

> In der Werkstatt liegt eine geöffnete Frachtkiste.

> Medikamente und Atemfilter laut Aufschrift.

> Leer.

> Auf dem Scanner ist die zweite Hälfte des Manifests.

> Die Kisten wurden von Kader ins Labor umgebucht. Sechs Stunden später zurückgebucht. Empfänger: A. Berg.

Falls Aksel anwesend:

> Aksel sagt, seine Kennung sei dafür benutzt worden. Er habe die Kisten nie gesehen.

> Er wirkt wütend.

> Nicht überrascht.

**Effekte:**

- `log_freight_complete = true`
- die beschädigte Verbandspackung wird intern als kontaminiert markiert
- `item_generator_tool = true`

---

## `k2_g_050_repair`

**Mira:**

> Der Wechselrichter kann ersetzt werden.

> Langsam mit vollständiger Abschaltung. Oder als Überbrückung unter Last.

> Eine dritte Möglichkeit: Im Relais steckt ein kompatibler Spannungsregler.

**Antworten:**

1. **„Vollständig abschalten und sauber reparieren.“**  
   → `k2_g_051_safe`

2. **„Überbrücken. Wir brauchen sofort Strom.“**  
   → `k2_g_052_bypass`

3. **„Nimm das Ersatzteil aus dem Relais.“**  
   → `k2_g_053_relay_part`

---

## `k2_g_051_safe`

**Delay:** 12 Minuten

**Mira:**

> Hauptschalter aus.

> Vollkommene Dunkelheit.

> Nur das Relais leuchtet.

> Fertig.

> Generator läuft stabil.

Falls Aksel hilft:

> Aksel hat kaum gesprochen. Aber ohne ihn hätte es doppelt so lange gedauert.

**Effekte:**

- `generator_state = stable`
- globale Zeit +2

---

## `k2_g_052_bypass`

Bei Aksel anwesend oder vollständigem Werkzeug:

**Mira:**

> Überbrückung sitzt.

> Nicht schön. Hält fürs Erste.

> Das Licht im Wohntrakt ist wieder da.

**Effekte:**

- `generator_state = unstable`

Ohne Aksel und bei unbehandelter Wunde:

> Funke.

> Bin zurückgestürzt. Relais gegen die Werkbank.

> Display gesprungen, Verbindung hält.

**Effekte zusätzlich:**

- `relay_damaged = true`
- `clarity -1`

---

## `k2_g_053_relay_part`

**Mira:**

> Regler passt.

> Generator stabil.

> Das Relais läuft jetzt ohne Reserve. Wenn der zweite Regler ausfällt, ist unsere Verbindung weg.

> Endgültig.

**Effekte:**

- `generator_state = stable`
- `relay_backup = false`

---

## `k2_g_060_aksel_question`

Nur wenn Aksel anwesend:

**Mira:**

> Hab ihn wegen des Bohrstaubs gefragt.

> Er sagt, er war heute nicht im Turm.

> Dann hat er auf seine Jacke gesehen und gesagt:

> „Zumindest erinnere ich mich nicht daran.“

**Antworten:**

1. **„Frag weiter. Was ist seine letzte klare Erinnerung?“**  
   → Er erinnert sich an einen Alarm und Kaders Stimme, `clue_aksel_memory = true`

2. **„Lass es vorerst. Beobachte ihn.“**  
   → `trust_aksel +1`

3. **„Nimm ihm sein Werkzeug ab.“**  
   → `trust_aksel -1`, `item_generator_tool = true`

---

## `k2_g_070_exit`

**Mira:**

> Zurück an die Leine.

Falls Labor noch nicht besucht:

> Danach ins Labor.

Falls Labor bereits besucht:

> Danach Wohntrakt. Ich brauche fünf Minuten ohne Alarm.

**Übergang:** Laborroute oder Kapitelzusammenführung.

# Zusammenführung

## `k2_x_001_return`

**Delay:** 5 Minuten

**Mira:**

> Wieder im Wohntrakt.

Falls Generator stabil:

> Heizung kommt zurück. Rohre knacken, als würde das Gebäude auftauen.

Falls Generator instabil:

> Licht ist da, flackert aber alle paar Sekunden.

> Aksel sagt, die Überbrückung hält. Er sagt nicht, wie lange.

Falls Labor analysiert:

> Auf dem Relais ist eine Kopie der Zeitrafferaufnahme.

> Ich habe sie dreimal angesehen.

> Beim dritten Mal war ich sicher, dass das Netz ein anderes Muster bildet.

> Dateien ändern sich nicht beim Ansehen.

Falls Labor versiegelt:

> Die Probe ist eingeschlossen. Noch.

**Mira:**

> Ich brauche Wasser.

> Dann entscheiden wir, wie es weitergeht.

**Effekte:**

- `chapter_02_complete = true`

**AutoNext:** Kapitel 3 – Der Marsch.

## Anschlussprüfung

Kapitel 2 garantiert:

- Labor und Generator wurden besucht.
- Kader wurde eingeführt.
- mindestens ein Indiz gegen die offizielle Version wurde gefunden.
- der Generator besitzt einen eindeutigen Zustand.
- Miras Infektionsstatus kann erstmals verändert worden sein.
- Aksel bleibt verdächtig, ist aber weder bestätigt schuldig noch bestätigt infiziert.

