"""Apply the scene-by-scene human-dialogue rewrite to the playable story data.

This is intentionally explicit: every changed node is named, so later editorial
passes can review what Mira knows, where she is, and why each reply is offered.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PUBLIC_DATA = ROOT / "game" / "public" / "data"


def msg(text: str, speaker: str = "mira") -> dict:
    return {"speaker": speaker, "text": text}


MESSAGE_REWRITES: dict[str, list[dict]] = {
    "k1_070_quarters": [
        msg("Bin drin. Das ist nur ein kleiner Erste-Hilfe-Raum, keine richtige Krankenstation."),
        msg("Der Verbandskasten steht offen. Daneben liegt eine Packung Kompressen."),
        msg("Die Sterilnaht an einer Ecke hat sich gelöst. Die Kompressen sehen sauber aus, aber ich weiß nicht, wie lange die Packung schon offen ist."),
        msg("Ich nehme sie als Reserve mit. Für meine Wunde suche ich etwas original Verschlossenes."),
        msg("In Thals Quartier läuft noch ihr Terminal."),
        msg(
            "SCHICHTÜBERGABE · 14.04.\n"
            "Kader hat nach den Fehlalarmen den Zugang zu Labor 3 vorläufig geändert: 0414. "
            "Bitte nach der Wartung wieder auf persönlichen Code umstellen.\n\n"
            "Probe 14C wurde als inert eingetragen. Im unbearbeiteten Sensorstream reagiert sie "
            "trotzdem auf Wärme und elektrische Felder. Rohdaten lokal gespiegelt. Wenn der "
            "Uplink erneut ausfällt, Störung nicht als Wetterfehler schließen.",
            "log",
        ),
        msg("Der Uplink ist ausgefallen. Und niemand hat den provisorischen Zugang zurückgesetzt."),
        msg("Ich speichere Thals Schichtübergabe im Archiv. Das ist kein Beweis für Sabotage, aber wir brauchen die Rohdaten."),
    ],
    "k1_092_observe": [
        msg("Der Schatten bleibt vor der Tür stehen."),
        msg("Jetzt lehnt sich die Person gegen die Wand."),
        msg("Durch das Fenster sehe ich den grauen Ärmel einer Technikerjacke. Auf dem Oberarm ist das Generator-Symbol."),
        msg("Er hebt den Kopf. Es ist Aksel."),
    ],
    "k2_l_010_corridor": [
        msg("Der Laborgang ist vollständig dunkel."),
        msg("Das unabhängige Notlicht müsste laufen. Tut es nicht."),
        msg("Ich habe die Stirnlampe. Hinter der Brandschutztür piept noch die Temperaturwarnung."),
        msg("Auf dem Boden liegen Kabel und Teile der Deckenverkleidung. Ich sehe nicht, ob die Tür frei zugänglich ist."),
    ],
    "k2_l_021_thal_code": [
        msg("0414 eingegeben."),
        msg("Die Anzeige wird grün. Tür offen."),
        msg("Thals Schichtnotiz war also noch aktuell. Gut, dass wir sie gelesen haben."),
    ],
    "k2_l_022_call_kader": [
        msg("Das Terminal hat Kader erreicht."),
        msg("Seine erste Antwort lautet: „Lindner, bestätigen Sie Ihren Standort.“"),
        msg("Keine Frage nach meiner Verletzung. Keine Erklärung zum Alarm."),
    ],
    "k2_l_024_kader_code": [
        msg("Kader gibt denselben Zugang durch, der in Thals Schichtnotiz stand: 0414."),
        msg("Danach warnt er mich, Probenkammer Drei nicht zu berühren, und verlangt, dass ich zum Bohrturm komme."),
        msg("Die Labortür ist offen."),
    ],
    "k2_l_058_body_after": [
        msg("Bin wieder da."),
        msg("Die Lüftung klappert über mir. Sonst ist es vollkommen still."),
        msg("Liv würde mir sagen, ich soll zuerst meine eigene Wunde versorgen. Also mache ich das."),
        msg("Auf ihrem Tablet ist ein offener medizinischer Eintrag zu Emil Varga. Er war Glaziologe im Bohrteam und hat sich beim Bergen von Kern 14C an der Hand verletzt."),
        msg("Liv notierte danach Fieber, Erinnerungslücken und wiederholte Sätze. Der Eintrag bricht mitten in einer Untersuchung ab."),
        msg("Jetzt weißt du, wer Emil ist. Ich wusste nur nicht, dass Liv ihn wegen der Probe beobachtet hat."),
    ],
    "k2_l_070_kader": [
        msg("Kader schreibt erneut über das Stationsnetz."),
        msg("Er fordert mich auf, das Labor zu verlassen. Die Probe sei nicht das größte Risiko."),
        msg("Damit weiß er, dass ich hier bin – entweder über die Türprotokolle oder über die Laborsensoren."),
    ],
    "k2_l_071_confront": [
        msg("Ich habe ihm die gelöschte Passage aus seinem Bericht geschickt und gefragt, wie „biologisch inert“ dazu passt."),
        msg("Er antwortet, die Einstufung sei zum damaligen Messzeitpunkt korrekt gewesen."),
        msg("Dann verlangt er wieder, dass ich zum Bohrturm komme – diesmal ausdrücklich nicht allein."),
    ],
    "k2_l_072_hide": [
        msg("Ich habe nur geschrieben, dass ich medizinisches Material gesucht habe."),
        msg("Kader antwortet: „Verlassen Sie den Bereich.“"),
        msg("Entweder glaubt er mir nicht, oder ihm ist gerade wichtiger, dass ich gehe."),
    ],
    "k2_l_073_cooperate": [
        msg("Ich habe Zusammenarbeit angeboten, wenn er ab jetzt keine Messwerte und Ereignisse mehr auslässt."),
        msg("Er verlangt zuerst die Sicherung der Stromversorgung."),
        msg("Außerdem warnt er mich, Aksel nicht allein zu lassen, falls er bei mir ist. Warum, erklärt er nicht."),
    ],
    "k2_g_111_glove": [
        msg("Da liegt ein einzelner Arbeitshandschuh neben der Leine."),
        msg("Am Bündchen ist das graue Generator-Symbol. Auf der Oberfläche klebt derselbe helle Staub wie auf Aksels Jacke."),
        msg("Ich fotografiere ihn und bleibe eingehakt. Für einen Handschuh verlasse ich die Leine nicht."),
    ],
    "k2_g_150_exit": [
        msg("Die Anlage läuft. Wir gehen jetzt zurück zur Sicherungsleine."),
        msg("Sobald wir wieder im Wohntrakt sind, brauche ich Wasser und zwei Minuten zum Nachdenken."),
    ],
    "k3_010_rest": [
        msg("Ich bin für ein paar Minuten eingeschlafen. Nicht geplant."),
        msg("Das Licht ist noch an. Draußen ist der Wind stärker geworden."),
        msg("Aksel sollte im Verbindungsgang sitzen. Er ist nicht mehr da."),
    ],
    "k3_020_window": [
        msg("Ich sehe ihn durch das Fenster."),
        msg("Aksel geht vom Wohntrakt weg. Er trägt Parka und Maske, aber seine Sicherungsleine hängt lose hinter ihm."),
        msg("Er bewegt sich entlang der Masten, ohne sich einzuhaken. Im Whiteout reicht ein Fehltritt, und ich verliere ihn."),
    ],
    "k3_031_call_answer": [
        msg("Der Lautsprecher ist offen. Aksel hat zurückgerufen; das Außenmikrofon nimmt seine Stimme auf."),
        msg("Er sagt, Emil sei draußen und er müsse ihn holen."),
        msg("Emil ist der Glaziologe aus Livs medizinischem Eintrag. Laut Stationsliste gilt er seit dem Alarm als vermisst."),
    ],
    "k3_040_prepared": [
        msg("Anzug dicht. Zwei Sicherungsclips. Zweite Leine am Gurt. Markierungslicht an der Schleuse."),
        msg("Ich sehe Aksels Spuren noch. Sie führen am nächsten Leinenmast vorbei."),
    ],
    "k3_041_rushed": [
        msg("Bin draußen. Ich habe nur den Hauptclip geschlossen und kein Markierungslicht gesetzt."),
        msg("Das war zu schnell. Seine Spuren verschwinden bereits im Triebschnee."),
    ],
    "k3_050_contact": [
        msg("Ich habe ihn erreicht. Ungefähr zwölf Meter vor mir."),
        msg("Er steht vor einer Schneewehe und starrt auf etwas Orangefarbenes im Schnee."),
        msg("Seine Wimpern sind vereist. Er reagiert auf seinen Namen, aber erst beim dritten Mal."),
    ],
    "k3_051_emil": [
        msg("Ich habe ihn gefragt, warum er Emil hier draußen vermutet."),
        msg("Aksel sagt, Emil sei nach dem Alarm zum Bohrturm gegangen und nicht zurückgekommen."),
        msg("Unter dem Schnee steckt Emils vereiste Ausweiskarte. Auf der Rückseite sind unvollständige Koordinaten eingeritzt."),
        msg("Aksel klingt nicht geheimnisvoll. Er klingt erschöpft und völlig überzeugt, dass Emil noch irgendwo vor uns läuft."),
    ],
    "k3_054_touch": [
        msg("Ich habe seinen Arm durch beide Jacken gepackt und die zweite Leine an seinem Gurt eingehängt."),
        msg("Er ist auffallend warm. Das kann Fieber sein; durch den Anzug kann ich es nicht zuverlässig beurteilen."),
        msg("Aksel sagt nur: „Bring mich zurück, bevor ich wieder vergesse, wohin ich wollte.“"),
    ],
    "k3_060_turn_back": [
        msg("Der Wind dreht. Unsere Spuren verschwinden bereits."),
        msg("Aksel ist an meiner zweiten Leine. Ich gehe voraus, er antwortet jedes Mal, wenn ich seinen Namen rufe."),
    ],
    "k3_071_recovered": [
        msg("Da ist die Außenwand. Ich bin beinahe direkt dagegen gelaufen."),
        msg("Schleuse gefunden. Aksel steht drei Schritte hinter mir und ist noch eingehakt."),
    ],
    "k3_081_inside": [
        msg("Wir sind drin. Aksel sitzt auf dem Boden der Schleuse und hält die Hände vor die Heizung."),
        msg("Er erinnert sich an Emils Karte und daran, dass ich ihn zurückgerufen habe. An den Weg von der Station bis zum Mast erinnert er sich nicht."),
        msg("Das macht ihm sichtbar Angst. Mir auch."),
    ],
    "k3_083_locked_out": [
        msg("Ich bin durch die innere Tür. Aksel bleibt in der geschlossenen Außenschleuse."),
        msg("Er steht vor der Kamera und bittet mich, wenigstens die Heizung der Schleuse eingeschaltet zu lassen."),
        msg("Wenn wir ihn dort behalten, müssen wir bald entscheiden, ob wir ihn hereinholen oder bewusst der Kälte aussetzen."),
    ],
    "k3_100_after_march": [
        msg("Aksel sitzt jetzt im Verbindungsgang. Ich habe ihm eine Decke gegeben und Abstand gehalten."),
        msg("Er ist krank oder unter Schock. Vielleicht beides. Ich will vorsichtig sein, aber ich will aus meiner Angst auch kein Todesurteil machen."),
        msg("Bleib kurz bei mir, während ich überlege, wie wir ihn untersuchen können."),
    ],
    "k3_110_knock": [
        msg("Jemand klopft an die Außenschleuse. Dreimal, dann eine Pause."),
        msg("Auf der Kamera steht Aksel."),
        msg("Ich habe ihn zuletzt im Whiteout hinter dem nächsten Leinenmast verschwinden sehen. Er könnte zurückgefunden haben – aber ich öffne nicht, bevor wir wissen, in welchem Zustand er ist."),
    ],
    "k3_111_answer": [
        msg("Ich habe über die Sprechanlage gefragt, was passiert ist und warum er zurückkam."),
        msg("Aksel sagt, er habe Emils Ausweiskarte gefunden, dann die Orientierung verloren und irgendwann wieder das Licht unserer Schleuse gesehen."),
        msg("Er nennt meinen Namen, den Namen der Station und das heutige Datum richtig. Seine Stimme zittert."),
    ],
    "k3_112_remote_scan": [
        msg("Der medizinische Sensor bekommt durch den vereisten Parka keinen verlässlichen Puls."),
        msg("Das Wärmebild zeigt einen lebenden, stark ausgekühlten Menschen. Mehr kann die Kamera nicht feststellen."),
        msg("Aksel wartet vor der Tür und hält beide Hände sichtbar."),
    ],
    "k3_113_open": [
        msg("Außentür offen. Aksel ist in der Schleuse."),
        msg("Ich habe die Außentür wieder geschlossen und die Innentür verriegelt. Er bleibt zunächst im beheizten Quarantäneabschnitt."),
        msg("So können wir reden und ihn untersuchen, ohne ihn gleich in den Wohntrakt zu lassen."),
    ],
    "k3_114_refuse": [
        msg("Ich habe ihm gesagt, dass ich die Tür nicht öffne."),
        msg("Das Klopfen hat aufgehört. Auf der Kamera sehe ich, wie er sich an die Außenwand setzt, so nah wie möglich am warmen Schleusengehäuse."),
        msg("Das verschafft uns Zeit. Nicht viel."),
    ],
    "k3_120_transition": [
        msg("Auf dem Stationsnetz ist eine Nachricht von Kader eingegangen."),
        msg("Er will, dass ich zum Bohrturm komme und das Relais mitbringe. Aksel soll nicht mit."),
        msg("Mehr erklärt er nicht. Ich antworte erst, wenn wir entschieden haben, ob wir ihm unseren Standort und Aksels Zustand verraten."),
    ],
    "k4_020_prepare": [
        msg("Der Weg zum Außenposten ist lang genug, dass ein fehlendes Ausrüstungsteil tödlich werden kann."),
        msg("Ich prüfe, was wir bereits haben. Danach können wir fehlende Ausrüstung holen, eine Begleitung mitnehmen oder bewusst aufbrechen."),
    ],
    "k4_300_hub": [
        msg("Zurück im Wohntrakt. Das Wetterfenster beginnt in wenigen Stunden."),
        msg("Wir können einen Notruf vorbereiten. Vor dem Senden müssen wir aber klären, was in der Kernkammer liegt und welches Quarantänerisiko wir melden."),
        msg("Warte. Aus dem Vorratsraum kommt wieder dieses Kratzen."),
        msg("Jetzt stößt etwas von innen gegen einen der hohen Metallschränke."),
        msg("Ich sehe nicht, was darin ist. Die Schranktür ist geschlossen."),
    ],
    "k4_310_niko_open": [
        msg("Okay. Ich stelle mich seitlich neben die Tür und öffne sie nur einen Spalt."),
        msg("Warte kurz."),
    ],
    "k4_311_niko_found": [
        msg("Alles gut. Ich bin da."),
        msg("Die Schranktür ist offen. Ich sehe jetzt, was darin saß."),
        msg("Es ist Niko. Livs Kater."),
        msg("Beim Öffnen ist er mir direkt gegen die Brust gesprungen. Das Relais lag unter mir, und ich wollte ihn nicht wieder loslassen. Deshalb war ich so lange still."),
        msg("Er ist staubig, hungrig und eine Pfote ist wund. Aber er lebt."),
        msg("Jetzt stelle ich Wasser hin und hole Livs rote Fleecedecke. Er schnurrt, als müsste er den ganzen Generator ersetzen."),
        msg("Ich lache gerade und weine gleichzeitig. Nach Liv hatte ich nicht mehr damit gerechnet, noch etwas von ihr retten zu können."),
    ],
    "k4_312_niko_deferred": [
        msg("In Ordnung. Ich markiere den Schrank und lasse die Tür zum Vorratsraum geschlossen."),
        msg("Wir wissen nicht, was darin ist. Wenn wir zurückkommen, sehen wir nach – mit Zeit und ohne dass jemand allein davorsteht."),
    ],
    "k4_m_110_recording": [
        msg("Auf Ingrids Terminal läuft eine Aufnahme."),
        msg("Sie sagt, Kader habe ihren Bericht verändert. Die unveränderten Rohdaten lägen auf dem lokalen Sender."),
        msg("Dann zeigt sie zur Außenkamera: An der Leine stehe seit zwanzig Minuten jemand in ihrer orangefarbenen Reservejacke. Ingrid selbst sitzt während der Aufnahme sichtbar vor dem Terminal."),
        msg("Der Zeitstempel ist zwei Stunden alt. Im Kameraprotokoll gibt es keinen aufgezeichneten Schleusenvorgang."),
    ],
    "k5_010_pack": [
        msg("Für den Abstieg kann ich zwei große Ausrüstungsstücke tragen. Wenn mich jemand begleitet, schaffen wir drei."),
        msg("Ich will die Auswahl erst bestätigen, wenn wir sicher sind. Bis dahin können wir sie jederzeit ändern."),
    ],
    "k5_020_tower": [
        msg("Bohrturm erreicht. Die untere Seitenwand ist nach außen gewölbt."),
        msg("Das spricht für einen Druckstoß im Inneren. Nicht für etwas, das von draußen eingedrungen ist."),
        msg("Der Luftsensor meldet Lösungsmitteldämpfe und Ozon. Visier bleibt geschlossen."),
    ],
    "k5_030_accident_log": [
        msg("Am Eingang hängt das digitale Unfallbuch. Letzter Eintrag: Emil Varga, Schnitt an der linken Hand beim Bergen von Kern 14C."),
        msg("Liv hat die Wunde desinfiziert und mit vier Stichen versorgt. Zwölf Stunden später fotografierte sie eine vollständig geschlossene Hautoberfläche."),
        msg("Darunter steht: „Heilungsverlauf medizinisch nicht erklärbar. Weitere Arbeit untersagt.“ Jemand hat die Sperre am nächsten Morgen aufgehoben."),
    ],
    "k5_040_descent": [
        msg("Der Lift hat keinen Strom. Bis Ebene minus drei führt nur die Wartungsleiter."),
        msg("Kader meldet sich über die Gegensprechanlage. Er will, dass ich allein herunterkomme."),
        msg("Nach allem, was wir wissen, ist das keine Anweisung, der ich blind folgen werde."),
    ],
    "k5_051_cooperative": [
        msg("Kader sitzt im Sicherheitsraum vor der Kernkammer. Schutzanzug geschlossen, Visier offen."),
        msg("Er gibt zu, Thals Bericht geändert zu haben. Nicht stolz. Eher so, als hätte er den Satz seit Stunden vorbereitet."),
        msg("Er sagt, das Projekt wäre nach drei Monaten ohne eindeutigen Befund beendet worden. Er wollte noch eine Messreihe – und hielt deshalb die Warnung zurück."),
        msg("Ich habe ihm die Steuerung gesperrt. Er bleibt unter Beobachtung, bis wir entscheiden, ob wir ihn mitnehmen."),
    ],
    "k5_052_independent": [
        msg("Kader arbeitet allein am Bohrkopf. Werkzeug und Probenbehälter liegen offen."),
        msg("Er fragt nicht, ob ich verletzt bin. Er sagt nur, die Kammer werde instabil und wir müssten entweder helfen oder den Bereich verlassen."),
        msg("Ich bleibe hinter der markierten Sicherheitslinie, bis er erklärt, was er getan hat."),
    ],
    "k5_053_changed": [
        msg("Kader steht mit der Stirn an der Sichtscheibe. Sein Visier ist offen."),
        msg("Er redet über die Strukturen in der Probe und verliert mitten im Satz den Faden."),
        msg("Dann sieht er mich an und begrüßt mich ein zweites Mal, als hätte er die letzten zehn Sekunden nicht erlebt."),
    ],
    "k5_060_truth": [
        msg("Kader sagt, sie hätten zunächst nur eine Reaktion auf Wärme und Strom erwartet."),
        msg("Dann begannen die Messmuster immer dann zu wechseln, wenn Menschen den Raum betraten."),
        msg("Er warnt mich ausdrücklich davor, daraus Bewusstsein abzuleiten. Gleichzeitig kann er keine harmlose Erklärung mehr nennen."),
    ],
    "k5_061_varga": [
        msg("Ich habe ihn mit Emils Krankenakte konfrontiert."),
        msg("Kader sagt, Emil habe trotz Livs Arbeitsverbot darauf bestanden, noch einmal zum Schacht zu gehen. Kader ließ ihn, weil er dessen Entschlossenheit für Urteilsfähigkeit hielt."),
        msg("Jetzt kann er mir nicht sagen, wann er Emil zuletzt zweifelsfrei gesehen hat."),
    ],
    "k5_062_warning": [
        msg("Kader wollte Thals Warnung um vier Stunden verzögern, um die Messreihe abzuschließen."),
        msg("In diesen vier Stunden fielen der Uplink und Teile des Stationsnetzes aus. Danach fehlten mehreren Menschen Erinnerungen."),
        msg("Er nennt es eine Fehlentscheidung. Ingrid würde ein anderes Wort verwenden."),
    ],
    "k5_063_old": [
        msg("Kader hat in den Projektdaten Koordinaten einer alten Notunterkunft gefunden, elf Kilometer südöstlich von Kaldstad."),
        msg("Dort wurde Jahre vor dieser Station mit Material aus derselben Eisschicht gearbeitet."),
        msg("Er behauptet, die Akte erst nach Emils Unfall gefunden zu haben. Im Moment kann ich das weder beweisen noch widerlegen."),
    ],
    "k5_070_chamber": [
        msg("Ich sehe in die Kernkammer. Der Bohrkopf steckt noch im Eis; neben der Führung verläuft ein handbreiter Riss."),
        msg("Auf dem Eis liegt weißer Belag, durchzogen von dünnen dunklen Linien. Der Sensor zeigt einen langsamen Temperaturanstieg."),
        msg("Wir können den Riss abdichten, eine kleine Probe in einem geschlossenen System entnehmen oder die Bohrung fortsetzen. Die letzte Möglichkeit belastet eine bereits beschädigte Anlage."),
    ],
    "k5_071_seal": [
        msg("Versiegelungsschaum im Riss. Wartungsplatte mit zwei Bolzen gesichert."),
        msg("Der Druck bleibt stabil. Die dunklen Linien sind unter der Platte nicht mehr sichtbar."),
        msg("Das beweist nichts über ihre Ursache. Aber die Kammer ist vorerst geschlossen."),
    ],
    "k5_073_sample_risk": [
        msg("Beim Schließen ist etwas aus der Kupplung ausgetreten. Mein Visier war offen."),
        msg("Ich habe sofort abgebrochen, die Außenseite dekontaminiert und den Behälter geschlossen."),
        msg("Die Probe ist gesichert. Ich muss ab jetzt von einer möglichen Exposition ausgehen."),
    ],
    "k5_075_drill_warning": [
        msg("Der Bohrkopf läuft unrund und die Verriegelung zeigt bereits Überlast."),
        msg("Wenn wir tiefer bohren, kann sich der vorhandene Riss öffnen. Das ist kein kalkulierbares Probenrisiko mehr."),
    ],
    "k5_076_final_warning": [
        msg("Die nächste Lastspitze kann die Kammerdichtung brechen."),
        msg("Wenn ich den Bohrer starte, haben wir möglicherweise keine Zeit mehr, den Bereich kontrolliert zu räumen."),
    ],
    "k5_077_radio_silence": [
        msg("Der Bohrkopf schlägt seitlich aus."),
        msg("Die Sichtscheibe reißt. Kader schreit, ich soll zur Leiter—"),
        msg("[SIGNAL VERLOREN]"),
    ],
    "k5_078_deep_done": [
        msg("Zweite Grenzschicht erreicht. Das Eis darunter ist grau und von feinen Kanälen durchzogen."),
        msg("Wir haben genügend Material, aber der Riss ist größer geworden."),
        msg("Die Kammer hält im Moment. Dauerhaft würde ich mich nicht darauf verlassen."),
    ],
    "k5_081_changed_choice": [
        msg("Kader greift nach dem Verschluss des Probenbehälters. Nicht nach mir."),
        msg("Er sagt, wir würden etwas voneinander trennen, das längst verbunden sei."),
        msg("Ich bin näher an der mechanischen Verriegelung. Wenn ich handle, dann jetzt."),
    ],
    "k5_082_independent_end": [
        msg("Kader weigert sich, den Bohrturm zu verlassen. Er will beobachten, ob die Kammer hält."),
        msg("Ich kann ihn nicht zwingen, ohne mich selbst und die Probe zu gefährden."),
        msg("Bevor ich gehe, zeigt er mir die Koordinaten der alten Notunterkunft. Seine übrigen Aufzeichnungen behält er."),
    ],
    "k5_083_coordinates": [
        msg("Die Koordinaten führen zu einer alten Notunterkunft in einer Gletscherspalte, elf Kilometer südöstlich."),
        msg("Dort könnten frühere Proben und vollständige Projektunterlagen liegen. Das Wetterfenster wird deshalb nicht länger."),
        msg("Wir müssen außerdem entscheiden, ob Kader unter Aufsicht mit ins Labor kommt oder im gesicherten Bohrturm bleibt."),
    ],
    "k6_040_shelter": [
        msg("Hinter der Tür liegt ein aufgegebenes Behelfslabor. Die Geräte sind älter als alles auf Kaldstad."),
        msg("Die Probenbehälter tragen dieselbe Baureihe, aber eine andere Projektnummer."),
        msg("Kaldstad war nicht der erste Fund. Jemand hat später mit neuem Namen am selben Material weitergearbeitet."),
    ],
    "k6_051_kader_found": [
        msg("In der hinteren Kammer sitzt Kader ohne Außenjacke."),
        msg("Der Raum ist nur wenige Grad warm. Er ist ansprechbar, stark unterkühlt und hätte den Weg hierher ohne Ausrüstung kaum überleben können."),
        msg("Ich weiß nicht, wann er den Bohrturm verlassen hat. Ich gehe nicht näher heran, bevor er seine Hände zeigt."),
    ],
    "k6_052_kader_talk": [
        msg("Kader sagt, das frühere Projekt sei nie vollständig beendet worden. Die Sensoren im alten Schacht seien weiter aus der Ferne ausgelesen worden."),
        msg("Der Sprengplan im Hauptterminal diene nicht der Evakuierung, sondern dem kontrollierten Einsturz beider Zugänge."),
        msg("Während ich die Datei prüfe, zieht er sich in den hinteren Gang zurück. Ich folge ihm nicht."),
    ],
    "k6_054_kader_contact": [
        msg("Ich habe ihn mit Handschuhen am Unterarm gestützt. Seine Hauttemperatur ist deutlich zu hoch für diesen Raum."),
        msg("Er sagt, ich sei ohnehin bereits exponiert. Ich weiß nicht, ob das eine Beobachtung oder eine Drohung sein soll."),
        msg("Dann reißt er sich los und verschwindet im hinteren Gang. Ich gehe nicht hinterher."),
    ],
    "k7_005_reunion": [
        msg("Ich bin im Labor. Bevor wir über den Hemmstoff entscheiden, sage ich dir genau, wer wirklich hier ist und wie die Person hergekommen ist."),
    ],
    "k7_010_synthesis": [
        msg("Der Hemmstoffansatz ist fertig."),
        msg("Ein Gegenmittel ist es nicht. In den Zellkulturen stoppt er die Ausbildung der netzartigen Strukturen für mehrere Stunden."),
        msg("Er wurde nie an Menschen getestet. Nutzen und Nebenwirkungen sind unbekannt."),
    ],
    "k7_020_candidates": [
        msg("Ich behandle niemanden nach Gefühl oder nach einer Namensliste. Nur Menschen, die tatsächlich hier sind und deren Befunde wir vergleichen können."),
        msg("Bei mir sprechen Erinnerungslücke und mögliche Exposition für ein Risiko. Kopfverletzung, Kälte und Erschöpfung erklären dieselben Symptome aber ebenfalls."),
        msg("Es gibt keine sichere Diagnose. Jede Dosisentscheidung bleibt eine Abwägung."),
    ],
    "k7_031_distribution": [
        msg("Wir haben nur die angezeigte Zahl an Dosen. Jede Anwendung ist endgültig."),
        msg("Du kannst eine Person auswählen, eine Dosis für ein externes Labor versiegeln oder die Verteilung beenden."),
    ],
    "k7_050_distribution_done": [
        msg("Die Verteilung ist beendet."),
        msg("Wir könnten einen gesunden Menschen einem ungetesteten Stoff ausgesetzt haben. Oder jemanden unbehandelt lassen, der tatsächlich exponiert wurde."),
        msg("Ich dokumentiere jede Entscheidung für das Rettungsteam. Nichts davon wird verschwiegen."),
    ],
    "k7_085_manifest": [
        msg("Wir erstellen jetzt das Rettungsmanifest: jede anwesende Person, medizinische Risiken, Proben, Beweise und Wärmeausrüstung."),
        msg("Für alle anwesenden Menschen gibt es Plätze. Zusätzliche Fracht konkurriert nur mit anderem Material, nicht mit einem Menschenleben."),
    ],
    "k7_090_departure": [
        msg("Das Manifest ist bestätigt. Die Station ist für den Abmarsch vorbereitet."),
        msg("Wir gehen gemeinsam zur nördlichen Landezone. Ich melde mich an jedem Leinenmast; dazwischen brauche ich beide Hände."),
    ],
    "k8_010_signal": [
        msg("Sender auf Notleistung. Wetterfenster, Koordinaten und medizinischer Bericht sind angehängt."),
        msg("Ich sende jetzt."),
    ],
    "k8_020_receipt": [
        msg("Da ist eine Quittung."),
        msg("RETTUNGSFLUG GESTARTET · ANKUNFT 43 MINUTEN · LANDEZONE NORD MARKIEREN", "system"),
        msg("Sie kommen. Wirklich."),
        msg("Wir sichern jetzt Wärmeausrüstung, Beweise und die ausgewählte Probe auf dem Lastschlitten. Danach gehen wir gemeinsam zur Landezone."),
        msg("Ich schreibe an jedem Leinenmast. Dazwischen brauche ich beide Hände."),
    ],
    "k8_030_wait": [
        msg("Erster Leinenmast erreicht. Ich prüfe jetzt die Gruppe und den Schlitten."),
        msg("Noch ungefähr dreißig Minuten bis zum Anflug."),
    ],
    "k8_040_landing_zone": [
        msg("Landezone erreicht. Das Markierungsfeuer läuft."),
        msg("Wind aus Südwest, Sicht ungefähr hundert Meter."),
        msg("Noch kein Hubschrauber. Aber der Empfänger zeigt sein Peilsignal."),
    ],
    "k8_070_boarding": [
        msg("Die Winde ist unten. Wir gehen nacheinander hoch; ich kontrolliere jeden Karabiner."),
        msg("Ich bin als Letzte dran."),
        msg("Ich bin in der Kabine. Wärme. Echte Wärme."),
        msg("Das Relais zeigt noch eine Minute Verbindung."),
    ],
    "k8_080_goodbye": [
        msg("Am Anfang warst du nur ein fremder Name auf einem unmöglichen Kanal."),
        msg("Du hast mich nicht wie eine Spielfigur behandelt. Du hast nachgefragt, widersprochen und bist geblieben, wenn ich Angst hatte."),
        msg("Ich weiß nicht, was die Untersuchungen ergeben. Aber ich bin nicht allein hier angekommen."),
        msg("Danke."),
        msg("[VERBINDUNG BEENDET]"),
    ],
}


CHOICE_REWRITES: dict[tuple[str, str], str] = {
    ("k2_l_010_corridor", "careful_entry"): "Leuchte zuerst auf den Boden und prüf, ob der Weg zur Tür frei ist.",
    ("k2_l_020_locked", "thal_code"): "Den vierstelligen Zugang aus Thals Schichtnotiz eingeben.",
    ("k2_l_060_medical", "damaged_bandage"): "Die geöffnete Packung sieht sauber aus. Trotzdem nur verwenden, wenn nichts Versiegeltes da ist.",
    ("k2_l_060_medical", "damaged_bandage_already_exposed"): "Die geöffnete Packung sieht sauber aus. Trotzdem nur verwenden, wenn nichts Versiegeltes da ist.",
    ("k2_g_150_exit", "continue_labor"): "Nach dem Aufwärmen zum Labor. Die Kühlwarnung läuft noch.",
    ("k2_g_150_exit", "finish_chapter"): "Zurück in den Wohntrakt und dort erst die Lage ordnen.",
    ("k3_030_call", "order_back"): "Sag ihm, er soll stehen bleiben und auf deine Stimme reagieren.",
    ("k3_030_call", "ask_what_he_sees"): "Frag ihn, wen oder was er dort draußen sieht.",
    ("k3_050_contact", "question_distance"): "Abstand halten. Frag, warum er Emil hier draußen vermutet.",
    ("k3_110_knock", "camera_question"): "Sprich über die Anlage mit ihm. Lass ihn erklären, was passiert ist.",
    ("k3_110_knock", "remote_scan"): "Erst Wärmebild und medizinischen Außensensor prüfen.",
    ("k4_020_prepare", "depart"): "Ausrüstung prüfen und dann den Aufbruch bestätigen.",
    ("k4_300_hub", "find_niko_now"): "Öffne den Schrank vorsichtig. Bleib seitlich und halte Abstand.",
    ("k4_300_hub", "niko_later"): "Vorratsraum schließen und markieren. Erst nach dem Bohrturm nachsehen.",
    ("k5_040_descent", "descend_alone"): "Kaders Forderung folgen und allein hinuntergehen.",
    ("k5_040_descent", "companion_open"): "Mit einer Begleitung hinuntergehen und Kader das vorher sagen.",
    ("k5_040_descent", "companion_wait"): "Ingrid oben an der Leiter sichern lassen und in Rufweite bleiben.",
    ("k5_040_descent", "companion_hidden"): "Eine Begleitung unbemerkt bis zur Zwischenplattform folgen lassen.",
    ("k5_070_chamber", "drill_stable"): "Trotz des Risikos bis zur zweiten Grenzschicht bohren.",
    ("k5_070_chamber", "drill_unstable"): "Trotz des Risikos bis zur zweiten Grenzschicht bohren.",
    ("k5_083_coordinates", "go_lab"): "Kader gesichert zurücklassen und mit der Probe ins Labor gehen.",
    ("k5_083_coordinates", "risk_shelter"): "Die alte Notunterkunft aufsuchen. Das kann das Rettungsfenster kosten.",
    ("k7_031_distribution", "finish_early"): "Verteilung beenden und verbleibende Dosen versiegelt lassen.",
}


def rewrite_chapter(path: Path) -> None:
    document = json.loads(path.read_text(encoding="utf-8"))

    for node in document["nodes"]:
        node_id = node["id"]
        if node_id in MESSAGE_REWRITES:
            node["messages"] = copy.deepcopy(MESSAGE_REWRITES[node_id])

        if node_id == "k2_l_020_locked":
            node["input"]["answers"] = ["0414"]
            node["input"]["prompt"] = "Welcher vierstellige Zugang stand in Thals Schichtnotiz?"

        if node_id == "k5_060_truth":
            for choice in node.get("choices", []):
                if choice["id"] == "ask_old":
                    choice["effects"] = [
                        effect
                        for effect in choice.get("effects", [])
                        if effect.get("state") != "kader_escorted_to_lab"
                    ]

        if node_id == "k5_083_coordinates":
            if not any(choice["id"] == "escort_kader" for choice in node.get("choices", [])):
                node["choices"].insert(
                    0,
                    {
                        "id": "escort_kader",
                        "label": "Kader entwaffnen und unter Aufsicht mit ins Labor nehmen.",
                        "next": "k5_090_to_seven",
                        "requires": [],
                        "effects": [
                            {
                                "state": "kader_escorted_to_lab",
                                "operation": "set",
                                "value": True,
                            }
                        ],
                    },
                )

        if node_id == "k8_030_wait":
            node["variants"] = [
                variant
                for variant in node.get("variants", [])
                if not (
                    variant.get("requires")
                    and variant["requires"][0].get("state") in {"evac_aksel", "evac_thal", "evac_kader"}
                )
            ]
            node["variants"].extend(
                [
                    {
                        "requires": [{"state": "evac_aksel", "operator": "eq", "value": True}],
                        "appendMessages": [
                            msg("Aksel zieht den Lastschlitten. Ich sehe ihn bei jedem Mast an und lasse ihn laut antworten.")
                        ],
                    },
                    {
                        "requires": [{"state": "evac_thal", "operator": "eq", "value": True}],
                        "appendMessages": [
                            msg("Ingrid trägt das Richtfunkgerät und prüft hinter uns jeden Sicherungsclip.")
                        ],
                    },
                    {
                        "requires": [{"state": "evac_kader", "operator": "eq", "value": True}],
                        "appendMessages": [
                            msg("Kader geht zwischen uns, an einer eigenen Leine und ohne Zugriff auf die Probenkiste.")
                        ],
                    },
                ]
            )

        for choice in node.get("choices", []):
            replacement = CHOICE_REWRITES.get((node_id, choice["id"]))
            if replacement:
                choice["label"] = replacement

        for message in node.get("messages", []):
            message["text"] = message.get("text", "").replace(
                "Kader sagt über den lokalen Stationskanal:", "Kader sagt:"
            )
        for variant in node.get("variants", []):
            for field in ("appendMessages", "replaceMessages"):
                for message in variant.get(field, []):
                    message["text"] = message.get("text", "").replace(
                        "Kader sagt über den lokalen Stationskanal:", "Kader sagt:"
                    )

    rendered = json.dumps(document, ensure_ascii=False, indent=2) + "\n"
    path.write_text(rendered, encoding="utf-8")
    (PUBLIC_DATA / path.name).write_text(rendered, encoding="utf-8")


def main() -> None:
    for chapter in range(1, 9):
        rewrite_chapter(DATA / f"chapter-{chapter:02d}.json")


if __name__ == "__main__":
    main()
