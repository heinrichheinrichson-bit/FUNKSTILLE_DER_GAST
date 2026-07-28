from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PUBLIC_DATA = ROOT / "game" / "public" / "data"


def load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def save(name: str, value):
    text = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    (DATA / name).write_text(text, encoding="utf-8")
    (PUBLIC_DATA / name).write_text(text, encoding="utf-8")


def node_map(doc):
    return {node["id"]: node for node in doc["nodes"]}


def msg(text, speaker="mira"):
    return {"speaker": speaker, "text": text}


def req(state, operator, value):
    return {"state": state, "operator": operator, "value": value}


def effect(state, value, operation="set"):
    return {"state": state, "operation": operation, "value": value}


def rewrite_foreign_messages(doc):
    def convert(messages):
        if not messages:
            return
        for item in messages:
            speaker = item.get("speaker")
            if speaker == "aksel":
                item["speaker"] = "mira"
                item["text"] = f'Aksel sagt: „{item["text"]}“'
            elif speaker == "thal":
                item["speaker"] = "mira"
                item["text"] = f'Ingrid sagt: „{item["text"]}“'
            elif speaker == "kader":
                item["speaker"] = "mira"
                item["text"] = f'Kader sagt über den lokalen Stationskanal: „{item["text"]}“'

    for node in doc["nodes"]:
        convert(node.get("messages"))
        for variant in node.get("variants", []):
            for key in ("replaceMessages", "prependMessages", "appendMessages"):
                convert(variant.get(key))


AREA_COORDS = {
    "quarters": (22, 42),
    "labor": (49, 27),
    "generator": (49, 63),
    "outpost": (80, 17),
    "tower": (81, 58),
    "shelter": (73, 83),
    "outside": (61, 42),
    "landing": (91, 39),
}


def location_for(chapter: int, node_id: str):
    n = node_id.lower()
    area, room, interior = "quarters", "corridor", (46, 50)
    activity = "Mira orientiert sich im Wohntrakt"

    if chapter == 1:
        if "quarters" in n or n in {"k1_060_hub_first", "k1_070_quarters"}:
            room, interior, activity = "bunks", (38, 72), "Mira versorgt ihre Verletzung"
        elif "canteen" in n or n in {"k1_080_canteen"}:
            room, interior, activity = "mess", (63, 27), "Mira durchsucht die Kantine"
        elif "noise" in n or "aksel" in n or "relay" in n or "double" in n:
            room, interior = "corridor", (48, 50)
    elif chapter == 2:
        if "_g_" in n or "generator" in n:
            area, room, activity = "generator", "control", "Mira und Aksel arbeiten am Generator"
            interior = (36, 30)
            if any(x in n for x in ("crossing", "airlock")):
                area, room, activity, interior = "outside", "generator_line", "Mira folgt der roten Sicherungsleine", (50, 50)
            elif any(x in n for x in ("repair", "safe", "bypass", "relay_part")):
                room, activity, interior = "plant", "Mira und Aksel reparieren den Wechselrichter", (70, 39)
            elif "entry" in n:
                room, interior = "airlock", (13, 50)
        else:
            area, room, activity, interior = "labor", "hall", "Mira untersucht den Laborflügel", (34, 50)
            if any(x in n for x in ("sample", "fast", "analysis", "seal")):
                room, activity, interior = "chamber", "Mira sichert Probenkammer 3", (59, 73)
            elif any(x in n for x in ("body", "medical")):
                room, activity, interior = "medical", "Mira ist in der Krankenstation", (83, 72)
            elif "locked" in n or "corridor" in n:
                room, interior = "airlock", (13, 50)
    elif chapter == 3:
        if any(x in n for x in ("march", "contact", "snow", "whiteout", "turn_back", "recovered")):
            area, room, activity, interior = "outside", "mast_w2", "Mira ist draußen an der Sicherungsleine", (50, 50)
        elif "airlock" in n or "knock" in n or "scan" in n:
            area, room, activity, interior = "quarters", "airlock", "Mira prüft die Außenschleuse", (11, 51)
        else:
            area, room, activity, interior = "quarters", "corridor", "Mira ist im Wohntrakt", (48, 50)
    elif chapter == 4:
        if any(x in n for x in ("station", "_a_", "_m_", "_d_", "weather", "evidence", "access", "return_choice")):
            area, room, activity, interior = "outpost", "radio", "Mira ist am Außenposten", (50, 50)
        elif any(x in n for x in ("departure", "long_walk", "frozen", "return")):
            area, room, activity, interior = "outside", "yellow_line", "Mira folgt der gelben Sicherungsleine", (50, 50)
        else:
            area, room, activity, interior = "quarters", "corridor", "Mira bereitet den Außenweg vor", (48, 50)
    elif chapter == 5:
        area, room, activity, interior = "tower", "platform", "Mira ist im Bohrturm", (50, 50)
        if any(x in n for x in ("chamber", "sample", "drill", "seal")):
            room, activity = "core_chamber", "Mira arbeitet an der Kernkammer"
    elif chapter == 6:
        area, room, activity, interior = "shelter", "shelter", "Mira ist in der Gletscherspalte", (50, 50)
        if any(x in n for x in ("approach", "return", "navigation", "lights")):
            area, room, activity = "outside", "crevasse_route", "Mira ist auf dem Außenweg"
    elif chapter == 7:
        area, room, activity, interior = "labor", "analysis", "Mira arbeitet im Labor", (59, 25)
        if any(x in n for x in ("report", "station", "group", "departure", "manifest")):
            area, room, activity, interior = "quarters", "radio", "Mira bereitet die Evakuierung vor", (36, 25)
    elif chapter == 8:
        if any(x in n for x in ("landing", "helicopter", "containment", "boarding", "goodbye", "niko")):
            area, room, activity, interior = "landing", "landing_zone", "Mira ist an der Landezone", (50, 50)
        elif any(x in n for x in ("wait", "signal", "receipt")):
            area, room, activity, interior = "quarters", "radio", "Mira bereitet den Abmarsch vor", (36, 25)

    left, top = AREA_COORDS[area]
    return {
        "area": area,
        "room": room,
        "stationLeft": left,
        "stationTop": top,
        "interiorLeft": interior[0],
        "interiorTop": interior[1],
        "activity": activity,
    }


def add_locations(doc):
    chapter = doc["chapter"]["number"]
    for node in doc["nodes"]:
        node["location"] = location_for(chapter, node["id"])


def rebuild_chapter_1(doc):
    nodes = node_map(doc)
    # The date needed for the laboratory code must exist in the actual found log.
    q = nodes["k1_070_quarters"]
    q["messages"].extend(
        [
            msg("Unter Thals Datenpad steckt ein ungesendeter Bericht."),
            msg("Titel: WARNBERICHT · 14.04. Darin widerspricht sie Kaders Einstufung von Probe 14C als inert."),
            msg("Ich speichere ihn im Archiv. Das Datum könnte wichtig sein."),
        ]
    )

    # The player hides the successful outside connection, not the known purpose of the relay.
    for choice in nodes["k1_115_relay_question"]["choices"]:
        if choice["id"] == "hide_relay":
            choice["label"] = "Sag, das Relais startet, findet aber keinen externen Empfänger."
            choice["acknowledgement"] = "Sag ihm, das Empfangsteil sei wahrscheinlich beschädigt."

    nodes["k1_080_canteen"]["messages"].extend(
        [
            msg("Im Vorratsraum ist gerade etwas Metallisches umgefallen."),
            msg("Die Tür ist zu. Dahinter kratzt etwas, dann ist es wieder still."),
            msg("Ich kann nicht erkennen, was dort drin ist. Für eine lockere Dose klang es zu schwer."),
        ]
    )


def rebuild_chapter_2(doc):
    nodes = node_map(doc)
    # Establish who does what during the generator route.
    nodes["k2_g_100_airlock"]["variants"] = [
        {
            "requires": [req("aksel_restrained", "eq", False)],
            "appendMessages": [
                msg("Aksel steht bereits im Überanzug hinter mir. Er hält vier Meter Abstand, wie versprochen."),
                msg("Er übernimmt Diagnose und Arbeiten am offenen Wechselrichter. Ich kann Anzeigen prüfen, abschalten und Module nach Anleitung tauschen – mehr nicht."),
            ],
        },
        {
            "requires": [req("aksel_released_for_generator", "eq", True)],
            "appendMessages": [
                msg("Ich habe Aksel für den Generatorweg aus dem Bereitschaftsraum geholt."),
                msg("Er geht hinter mir an einer eigenen Sicherung. Begeistert ist keiner von uns."),
            ],
        },
    ]
    nodes["k2_g_110_crossing"]["variants"] = [
        {
            "requires": [req("aksel_restrained", "eq", False)],
            "appendMessages": [
                msg("Aksel stapft hinter mir. Immer derselbe Abstand. Wenn ich stehen bleibe, bleibt er ebenfalls stehen."),
                msg("Er ist sonst nie so still. Das macht mir mehr Angst als der Wind."),
            ],
        },
        {
            "requires": [req("aksel_released_for_generator", "eq", True)],
            "appendMessages": [
                msg("Aksel folgt an der zweiten Leine. Er spricht nur, wenn ich ihn direkt etwas frage."),
            ],
        },
    ]
    nodes["k2_g_120_entry"]["messages"].extend(
        [
            msg("Aksel prüft die Lastanzeige und sagt, der Wechselrichter sei nicht einfach ausgefallen. Jemand hat die Schutzabschaltung überbrückt."),
            msg("Ich halte Licht und Diagnosegerät. An die offenen Leitungen geht nur er."),
        ]
    )
    nodes["k2_g_130_repair"]["messages"] = [
        msg("Aksel kann den verschmorten Lasttrenner ersetzen und den Wechselrichter anschließend sauber neu starten."),
        msg("Allein könnte ich nur die Anlage abschalten, das gekennzeichnete Modul nach Handbuch tauschen und hoffen. Für einen Live-Bypass bin ich nicht ausgebildet."),
        msg("Der Regler im Relais wäre kompatibel, aber dann verlieren wir unsere Reserve."),
    ]
    nodes["k2_g_131_safe"]["messages"] = [
        msg("Aksel legt den Hauptschalter um. Vollkommene Dunkelheit. Nur das Relais leuchtet."),
        msg("Ich lese die Diagnosewerte vor, während er den Lasttrenner ersetzt."),
        msg("Neustart. Der Generator läuft stabil."),
        msg("Aksel lehnt an der Werkbank und zittert. Jetzt, wo die Arbeit vorbei ist, wirkt er wieder wie ein verängstigter Mensch."),
    ]

    # Add a relationship beat before leaving the chapter.
    return_node = nodes["k2_x_200_return"]
    return_effects = return_node.get("effects", [])
    return_handoff = return_node.get("handoff")
    return_node.pop("handoff", None)
    return_node["next"] = "k2_x_210_breath"
    doc["nodes"].extend(
        [
            {
                "id": "k2_x_210_breath",
                "chapter": 2,
                "delaySeconds": 8,
                "messages": [
                    msg("Ich sitze mit dem Rücken an der warmen Wand. Aksel ist am anderen Ende des Gangs."),
                    msg("Für fünf Minuten brennt nichts, fällt nichts aus und niemand verlangt eine Entscheidung."),
                    msg("Frag mich etwas, das nichts mit Proben oder Generatoren zu tun hat. Bitte."),
                ],
                "choices": [
                    {"id": "ask_home", "label": "Wo ist für dich Zuhause?", "next": "k2_x_211_home", "requires": [], "effects": [effect("trust_mira", 1, "add")]},
                    {"id": "ask_why_ice", "label": "Warum bist du Glaziologin geworden?", "next": "k2_x_212_ice", "requires": [], "effects": [effect("trust_mira", 1, "add")]},
                    {"id": "let_rest", "label": "Du musst nichts erzählen. Ruh dich kurz aus.", "next": "k2_x_213_rest", "requires": [], "effects": [effect("trust_mira", 1, "add")]},
                ],
            },
            {
                "id": "k2_x_211_home",
                "chapter": 2,
                "delaySeconds": 4,
                "messages": [
                    msg("Freiburg. Zumindest sage ich das immer."),
                    msg("Meine Mutter würde behaupten, Zuhause sei dort, wo ich endlich länger als drei Monate bleibe."),
                    msg("Gerade wäre Zuhause ein Raum, in dem die Heizung nicht um ihr Leben kämpft."),
                ],
                "next": "k2_x_220_transition",
                "nextDelaySeconds": 5,
            },
            {
                "id": "k2_x_212_ice",
                "chapter": 2,
                "delaySeconds": 4,
                "messages": [
                    msg("Weil Eis Erinnerungen bewahrt. Luft, Staub, Feuer, ganze Sommer – alles bleibt eingeschlossen."),
                    msg("Ich mochte die Vorstellung, dass man nur genau genug hinsehen muss und die Vergangenheit irgendwann ehrlich wird."),
                    msg("Das war vor Kaldstad."),
                ],
                "next": "k2_x_220_transition",
                "nextDelaySeconds": 5,
            },
            {
                "id": "k2_x_213_rest",
                "chapter": 2,
                "delaySeconds": 8,
                "messages": [
                    msg("Danke."),
                    msg("Bleib trotzdem da. Du musst nichts schreiben."),
                    msg("Es hilft, zu wissen, dass am anderen Ende jemand wartet."),
                ],
                "next": "k2_x_220_transition",
                "nextDelaySeconds": 5,
            },
            {
                "id": "k2_x_220_transition",
                "chapter": 2,
                "delaySeconds": 0,
                "messages": [],
                "effects": return_effects,
                "handoff": return_handoff,
            },
        ]
    )


def rebuild_chapter_3(doc):
    nodes = node_map(doc)
    nodes["k3_100_after_march"]["messages"].extend(
        [
            msg("Aksel sitzt jetzt im Verbindungsgang, falls er es wirklich ist. Ich kann jeden seiner Atemzüge hören."),
            msg("Ich möchte nicht nur wissen, was ich mit ihm tun soll. Sag mir bitte, dass Angst nicht automatisch bedeutet, dass ich ihm etwas Schreckliches antun muss."),
        ]
    )
    nodes["k3_120_transition"]["messages"] = [
        msg("Auf dem lokalen Terminal ist eine Nachricht von Kader eingegangen."),
        msg("Er verlangt, dass ich zum Bohrturm komme und das Relais mitbringe. Aksel soll ausdrücklich nicht mit."),
        msg("Im Hintergrund seiner kurzen Audioübertragung hört man dreimaliges Klopfen – dasselbe Muster wie an unserer Schleuse."),
        msg("Er kann nicht mit dir sprechen. Dieses Relais erreicht weiterhin nur dich. Alles von Kader kommt über das interne Stationsnetz zu mir."),
    ]


def rebuild_chapter_4(doc):
    nodes = node_map(doc)
    hub = nodes["k4_300_hub"]
    effects = hub.get("effects", [])
    handoff = hub.get("handoff")
    hub.pop("handoff", None)
    hub["messages"].extend(
        [
            msg("Aus dem Vorratsraum kommt wieder dieses Kratzen."),
            msg("Diesmal folgt ein kurzer, gepresster Laut. Dann stößt von innen etwas gegen die Schranktür."),
            msg("Ich kann nicht sagen, ob dort ein verletzter Mensch, ein Tier oder nur lose Fracht eingeschlossen ist."),
        ]
    )
    hub["choices"] = [
        {
            "id": "find_niko_now",
            "label": "Bereite Wasser und eine Decke vor. Dann öffne den Schrank vorsichtig.",
            "next": "k4_310_niko_open",
            "requires": [],
            "effects": [effect("niko_state", "suspected")],
        },
        {
            "id": "niko_later",
            "label": "Markiere den Raum. Sichert zuerst das Wetterfenster und den Bohrturm.",
            "next": "k4_312_niko_deferred",
            "requires": [],
            "effects": [effect("niko_state", "roaming")],
        },
    ]
    doc["nodes"].extend(
        [
            {
                "id": "k4_310_niko_open",
                "chapter": 4,
                "delaySeconds": 3,
                "messages": [msg("Na gut. Warte kurz.")],
                "next": "k4_311_niko_found",
                "nextDelaySeconds": 65,
            },
            {
                "id": "k4_311_niko_found",
                "chapter": 4,
                "delaySeconds": 0,
                "messages": [
                    msg("Ich sehe ihn. Es ist Niko."),
                    msg("Livs Kater. Ich dachte, er wäre bei ihr gewesen."),
                    msg("Der kleine Idiot ist mir beim Öffnen auf die Schulter gesprungen. Deshalb hat es so lange gedauert."),
                    msg("Er ist staubig und eine Pfote ist wund, aber er lebt. Er schnurrt so laut, dass du es durch das Relais hören müsstest."),
                    msg("Liv hat ihm diese rote Decke gekauft. Ich wickle ihn darin ein."),
                    msg("Ich habe gerade gleichzeitig gelacht und geweint. Das fühlt sich fast unanständig gut an."),
                ],
                "effects": [
                    effect("niko_state", "secured"),
                    effect("niko_found", True),
                    effect("niko_secured", True),
                    effect("trust_mira", 1, "add"),
                ],
                "next": "k4_320_transition",
                "nextDelaySeconds": 10,
            },
            {
                "id": "k4_312_niko_deferred",
                "chapter": 4,
                "delaySeconds": 3,
                "messages": [
                    msg("Du hast recht. Wenn ich jetzt alles aufreiße, verlieren wir Zeit."),
                    msg("Ich stelle Wasser vor die Tür und markiere den Vorratsraum. Was immer dort drin ist, muss noch warten."),
                ],
                "next": "k4_320_transition",
                "nextDelaySeconds": 5,
            },
            {
                "id": "k4_320_transition",
                "chapter": 4,
                "delaySeconds": 0,
                "messages": [],
                "effects": effects,
                "handoff": handoff,
            },
        ]
    )


def rebuild_chapter_5(doc):
    nodes = node_map(doc)
    nodes["k5_051_cooperative"]["messages"].extend(
        [
            msg("Kader bleibt im Sicherheitsraum, bis Aksel ihm die Steuerung sperrt."),
            msg("Wenn wir ihn später untersuchen oder mitnehmen wollen, müssen wir ihn ausdrücklich vom Bohrturm ins Labor eskortieren. Von selbst geht er nirgends hin."),
        ]
    )
    # Cooperative Kader is physically escorted on the return route.
    nodes["k5_090_to_seven"].setdefault("variants", []).append(
        {
            "requires": [req("kader_state", "eq", "cooperative")],
            "appendMessages": [
                msg("Aksel geht hinter Kader, ich vor ihm. Wir bringen ihn gemeinsam zum Labor."),
                msg("Er ist nicht plötzlich Teil unserer Gruppe. Er ist ein Gefangener, ein Zeuge und vielleicht ein Patient."),
            ],
        }
    )
    cooperative = next(
        redirect
        for redirect in nodes["k5_080_kader_resolution"]["redirects"]
        if redirect.get("requires") == [req("kader_state", "eq", "cooperative")]
    )
    cooperative.setdefault("effects", []).append(effect("kader_escorted_to_lab", True))


def rebuild_chapter_7(doc):
    nodes = node_map(doc)
    # Every dose resolver now passes through a physical reunion.
    for redirect in nodes["k7_001_resolve_doses"]["redirects"]:
        redirect["next"] = "k7_005_reunion"
    doc["nodes"].insert(
        1,
        {
            "id": "k7_005_reunion",
            "chapter": 7,
            "delaySeconds": 30,
            "messages": [
                msg("Ich bin im Labor. Bevor wir über Dosen reden: Ich sage dir genau, wer tatsächlich hier ist."),
            ],
            "variants": [
                {
                    "requires": [req("aksel_inside_after_return", "eq", True)],
                    "appendMessages": [msg("Aksel sitzt an der Wand neben der Dekonschleuse. Ich habe ihn selbst aus dem Wohntrakt hergebracht.")],
                },
                {
                    "requires": [req("thal_returning", "eq", True)],
                    "appendMessages": [msg("Ingrid ist langsam vom Wohntrakt herübergekommen. Sie ruht im Laborvorraum.")],
                },
                {
                    "requires": [req("kader_escorted_to_lab", "eq", True)],
                    "appendMessages": [msg("Kader wurde von Aksel und mir vom Bohrturm eskortiert. Er bleibt von der Steuerung getrennt.")],
                },
                {
                    "requires": [req("niko_found", "eq", True)],
                    "appendMessages": [msg("Niko ist in seiner Transportbox im warmen Vorraum. Er bekommt selbstverständlich keinen menschlichen Hemmstoff.")],
                },
            ],
            "next": "k7_010_synthesis",
            "nextDelaySeconds": 20,
        },
    )
    nodes["k7_020_candidates"]["messages"] = [
        msg("Jetzt zu den tatsächlich anwesenden Personen. Ich untersuche nur Menschen, die vor mir stehen – keine Namen auf einer Liste."),
        msg("Bei mir: mögliche Exposition, Erinnerungslücken, Kopfverletzung, Kälte und Erschöpfung."),
        msg("Die Befunde sind Indizien. Keine sichere Diagnose."),
    ]
    nodes["k7_020_candidates"]["variants"] = [
        {
            "requires": [req("aksel_inside_after_return", "eq", True)],
            "appendMessages": [msg("Aksel: Bohrstaub, Marsch, Erinnerungslücke und ungewöhnliche Körpertemperatur.")],
        },
        {
            "requires": [req("thal_returning", "eq", True)],
            "appendMessages": [msg("Ingrid: Unterkühlung und Erschöpfung, aber keine bestätigte Probenexposition.")],
        },
        {
            "requires": [req("kader_escorted_to_lab", "eq", True)],
            "appendMessages": [msg("Kader: direkter Kontakt zur Kernkammer und deutliche Verhaltensänderungen.")],
        },
    ]
    for choice in nodes["k7_031_distribution"]["choices"]:
        if choice["id"] == "treat_kader":
            choice["requires"] = [
                req("kader_escorted_to_lab", "eq", True),
                req("kader_treated", "eq", False),
            ]
    # Kader can evacuate only if physically escorted.
    nodes["k7_082_group_resolve_kader"]["redirects"][0]["requires"] = [
        req("kader_escorted_to_lab", "eq", True)
    ]
    # The manifest is an explicit decision and includes Niko.
    for redirect in nodes["k7_083_hoard_resolve"]["redirects"]:
        redirect["next"] = "k7_085_manifest"
    doc["nodes"].insert(
        -1,
        {
            "id": "k7_085_manifest",
            "chapter": 7,
            "delaySeconds": 15,
            "messages": [
                msg("Thal erstellt das Rettungsmanifest: Menschen, biologische Proben, Beweiskisten und ein Tiertransport."),
                msg("Der Helikopter kann die Menschen aufnehmen. Bei zusätzlicher Fracht müssen wir an der Landezone möglicherweise Material zurücklassen."),
            ],
            "variants": [
                {
                    "requires": [req("niko_found", "eq", True)],
                    "appendMessages": [msg("Niko braucht eine gesicherte Transportposition. Dafür können wir jetzt einen Frachtplatz reservieren.")],
                }
            ],
            "choices": [
                {
                    "id": "reserve_niko_slot",
                    "label": "Transportplatz für Niko reservieren.",
                    "next": "k7_090_departure",
                    "requires": [req("niko_found", "eq", True)],
                    "effects": [effect("niko_transport_slot", True)],
                },
                {
                    "id": "keep_all_material",
                    "label": "Material vorerst vollständig mitnehmen. An der Landezone entscheiden.",
                    "next": "k7_090_departure",
                    "requires": [],
                    "effects": [effect("niko_transport_slot", False)],
                },
            ],
        },
    )
    nodes["k7_090_departure"]["messages"] = [
        msg("Das Manifest steht. Die Station ist vorbereitet."),
        msg("Wir brechen jetzt zur Landezone auf. Ich kann unterwegs nur an den Leinenmasten schreiben."),
    ]
    nodes["k7_090_departure"].setdefault("variants", []).extend(
        [
            {
                "requires": [req("niko_found", "eq", True)],
                "appendMessages": [msg("Niko ist in der gepolsterten Box auf dem Lastschlitten. Er beschwert sich ohne Pause.")],
            },
            {
                "requires": [req("niko_found", "eq", False)],
                "appendMessages": [msg("Im Vorratsraum ist es wieder still. Wir können das Wetterfenster nicht länger halten.")],
            },
        ]
    )


def rebuild_chapter_8(doc):
    nodes = node_map(doc)
    nodes["k8_020_receipt"]["messages"] = [
        msg("Quittung."),
        msg("RETTUNGSFLUG GESTARTET. ANKUNFT 43 MINUTEN. LANDEZONE NORD MARKIEREN.", "system"),
        msg("Sie kommen. Wirklich."),
        msg("Wir packen jetzt Probe, Beweise und Wärmezeug auf den Lastschlitten. Danach gehen wir gemeinsam zur Landezone."),
        msg("Ich schreibe an jedem Leinenmast. Dazwischen brauche ich beide Hände."),
    ]
    nodes["k8_020_receipt"]["variants"] = [
        {
            "requires": [req("niko_found", "eq", True)],
            "appendMessages": [msg("Nikos Box wird warm eingepackt und auf dem Schlitten festgezurrt.")],
        }
    ]
    nodes["k8_020_receipt"]["nextDelaySeconds"] = 600
    nodes["k8_030_wait"]["delaySeconds"] = 600
    nodes["k8_030_wait"]["messages"] = [
        msg("Erster Mast. Alle noch da."),
        msg("Aksel trägt die Probenkiste. Ingrid hat das Richtfunkgerät. Kader geht zwischen uns."),
        msg("Noch etwa dreißig Minuten bis zum Anflug."),
    ]
    nodes["k8_030_wait"]["nextDelaySeconds"] = 480
    nodes["k8_040_landing_zone"]["delaySeconds"] = 480
    # Any foreign voice at the landing zone is relayed by Mira.
    nodes["k8_041_group_check"]["variants"] = [
        {
            "requires": [
                req("evac_aksel", "eq", True),
                req("aksel_treated", "eq", False),
            ],
            "replaceMessages": [
                msg("Aksel bewegt sich zurück in Richtung Station."),
                msg("Er sagt, da sei noch jemand und er könne ihn hören."),
            ],
        },
        {
            "requires": [
                req("evac_kader", "eq", True),
                req("kader_treated", "eq", False),
            ],
            "replaceMessages": [
                msg("Kader bewegt sich zurück in Richtung Station."),
                msg("Er sagt, die Kammer dürfe jetzt nicht allein bleiben."),
            ],
        },
    ]
    # Route every successful boarding path through Niko's mandatory resolution.
    for node_id in ("k8_060_containment_gate", "k8_062_triggered", "k8_063_others_first"):
        node = nodes[node_id]
        if node_id == "k8_060_containment_gate":
            for redirect in node["redirects"]:
                if redirect["next"] == "k8_070_boarding":
                    redirect["next"] = "k8_065_niko_gate"
        elif node.get("next") == "k8_070_boarding":
            node["next"] = "k8_065_niko_gate"
    for choice in nodes["k8_061_containment"]["choices"]:
        if choice["next"] == "k8_070_boarding":
            choice["next"] = "k8_065_niko_gate"

    insert_at = next(i for i, n in enumerate(doc["nodes"]) if n["id"] == "k8_070_boarding")
    niko_nodes = [
        {
            "id": "k8_065_niko_gate",
            "chapter": 8,
            "delaySeconds": 0,
            "messages": [],
            "redirects": [
                {
                    "requires": [req("niko_found", "eq", True), req("niko_secured", "eq", True)],
                    "effects": [],
                    "next": "k8_066_niko_with_group",
                },
                {"requires": [], "effects": [], "next": "k8_067_niko_arrives"},
            ],
        },
        {
            "id": "k8_066_niko_with_group",
            "chapter": 8,
            "delaySeconds": 5,
            "messages": [
                msg("Nikos Box steht neben mir. Er presst die Nase gegen das Gitter, als der Rotorwind den Schnee aufreißt."),
                msg("Liv hätte mich umgebracht, wenn ich ihn hier zurückließe."),
            ],
            "next": "k8_068_niko_capacity",
            "nextDelaySeconds": 5,
        },
        {
            "id": "k8_067_niko_arrives",
            "chapter": 8,
            "delaySeconds": 15,
            "messages": [
                msg("Warte. Da bewegt sich etwas im Nebel."),
                msg("Klein. Direkt unter der Leine."),
                msg("Niko."),
                msg("Er rennt durch den Schnee, als hätte er die ganze Station nach uns abgesucht. Jetzt hängt er mit den Krallen an meinem Parka."),
                msg("Ich wusste nicht, dass er noch lebt."),
            ],
            "effects": [effect("niko_state", "at_landing_zone"), effect("niko_found", True)],
            "next": "k8_068_niko_capacity",
            "nextDelaySeconds": 5,
        },
        {
            "id": "k8_068_niko_capacity",
            "chapter": 8,
            "delaySeconds": 0,
            "messages": [msg("Der Sanitäter zeigt auf die Fracht. Niko braucht eine gesicherte Position. Wenn wir keinen Platz reserviert haben, muss eine Kiste hierbleiben.")],
            "redirects": [
                {
                    "requires": [req("niko_transport_slot", "eq", True)],
                    "effects": [effect("niko_evacuated", True), effect("niko_state", "evacuated")],
                    "next": "k8_069_niko_boarded",
                }
            ],
            "choices": [
                {
                    "id": "leave_material_for_niko",
                    "label": "Die nicht lebenswichtige Materialkiste zurücklassen. Niko kommt mit.",
                    "next": "k8_069_niko_boarded",
                    "requires": [],
                    "effects": [
                        effect("niko_evacuated", True),
                        effect("niko_state", "evacuated"),
                        effect("sample_preserved", False),
                    ],
                },
                {
                    "id": "leave_niko",
                    "label": "Die Fracht behalten und ohne Niko abheben.",
                    "next": "k8_069_niko_left",
                    "requires": [],
                    "effects": [effect("niko_evacuated", False)],
                },
            ],
        },
        {
            "id": "k8_069_niko_boarded",
            "chapter": 8,
            "delaySeconds": 10,
            "messages": [
                msg("Niko kommt mit."),
                msg("Seine Box wird außen am Sitz festgezurrt. Er streckt eine Pfote durchs Gitter und hält meinen Ärmel fest."),
            ],
            "next": "k8_070_boarding",
            "nextDelaySeconds": 5,
        },
        {
            "id": "k8_069_niko_left",
            "chapter": 8,
            "delaySeconds": 10,
            "messages": [
                msg("Ich setze Niko in den Windschatten der Markierungsbox."),
                msg("Er läuft sofort wieder zur offenen Tür."),
                msg("Ich werde dir nicht sagen, dass das nur eine Katze ist. Liv hätte das auch nicht getan."),
            ],
            "effects": [effect("trust_mira", -2, "add")],
            "next": "k8_070_boarding",
            "nextDelaySeconds": 5,
        },
    ]
    doc["nodes"][insert_at:insert_at] = niko_nodes

    nodes["k8_070_boarding"]["messages"].extend(
        [msg("Ich zähle jeden Namen laut, bevor die Tür schließt. Niemand ist einfach irgendwann in der Gruppe aufgetaucht.")]
    )
    # The player name is always used when known.
    nodes["k8_080_goodbye"]["messages"] = [
        msg("Du hast mich zuerst gefragt, ob ich verletzt bin. Nicht, ob meine Geschichte glaubwürdig ist."),
        msg("Du bist geblieben."),
        msg("Danke."),
        msg("[VERBINDUNG BEENDET]", "system"),
    ]
    nodes["k8_080_goodbye"]["variants"].append(
        {
            "requires": [req("player_name_known", "eq", True), req("trust_mira", "gte", 0)],
            "replaceMessages": [
                msg("{{player_name}}, du hast mich zuerst gefragt, ob ich verletzt bin."),
                msg("Du hast dafür gesorgt, dass ich wieder aufstehe. Ich werde deinen Namen nicht vergessen."),
                msg("Niko sitzt neben mir. Wir sind drin."),
                msg("Leb wohl. Oder hoffentlich nur: bis irgendwann."),
                msg("[VERBINDUNG BEENDET]", "system"),
            ],
        }
    )
    # Niko is part of the definition of everyone rescued.
    all_rescued = next(r for r in nodes["k8_100_ending_resolver"]["redirects"] if r["next"] == "k8_e_all_rescued")
    all_rescued["requires"].append(req("niko_evacuated", "eq", True))
    for ending_id in ("k8_e_radio", "k8_e_contained", "k8_e_one_dose", "k8_e_lie", "k8_e_hidden_guest", "k8_e_all_rescued", "k8_e_clean"):
        ending = nodes[ending_id]
        ending.setdefault("variants", []).extend(
            [
                {
                    "requires": [req("niko_evacuated", "eq", True)],
                    "appendMessages": [msg("Niko befindet sich an Bord und erreicht die Quarantänestation.", "system")],
                },
                {
                    "requires": [req("niko_found", "eq", True), req("niko_evacuated", "eq", False)],
                    "appendMessages": [msg("Niko blieb an der Landezone zurück. Mira erwähnt seinen Namen im letzten Bericht.", "system")],
                },
            ]
        )


def update_schema():
    schema = load("state-schema.json")
    states = schema["states"]
    additions = {
        "kader_escorted_to_lab": {"type": "boolean", "default": False, "visibility": "hidden"},
        "niko_state": {
            "type": "enum",
            "default": "unseen",
            "values": ["unseen", "suspected", "secured", "roaming", "at_landing_zone", "evacuated"],
            "visibility": "narrative",
        },
        "niko_found": {"type": "boolean", "default": False, "visibility": "visible"},
        "niko_secured": {"type": "boolean", "default": False, "visibility": "hidden"},
        "niko_transport_slot": {"type": "boolean", "default": False, "visibility": "hidden"},
        "niko_evacuated": {"type": "boolean", "default": False, "visibility": "visible"},
        "evac_mira": {"type": "boolean", "default": True, "visibility": "hidden"},
    }
    states.update(additions)
    save("state-schema.json", schema)


def main():
    # The structural migration appends nodes and is intentionally a one-time
    # operation. On an already migrated story, only reapply the idempotent
    # editorial pass; otherwise duplicate nodes would be created.
    current_chapter_four = load("chapter-04.json")
    if any(node.get("id") == "k4_310_niko_open" for node in current_chapter_four["nodes"]):
        from apply_editorial_rewrite import main as apply_editorial_rewrite

        apply_editorial_rewrite()
        print("structural migration already present; reapplied editorial rewrite")
        return

    update_schema()
    rebuilders = {
        1: rebuild_chapter_1,
        2: rebuild_chapter_2,
        3: rebuild_chapter_3,
        4: rebuild_chapter_4,
        5: rebuild_chapter_5,
        7: rebuild_chapter_7,
        8: rebuild_chapter_8,
    }
    for number in range(1, 9):
        name = f"chapter-{number:02}.json"
        doc = load(name)
        rebuild = rebuilders.get(number)
        if rebuild:
            rebuild(doc)
        rewrite_foreign_messages(doc)
        add_locations(doc)
        save(name, doc)
        print(f"rebuilt {name}: {len(doc['nodes'])} nodes")

    # The structural rebuild is always followed by the reviewed dialogue pass.
    # This prevents older scaffold wording from reappearing in generated data.
    from apply_editorial_rewrite import main as apply_editorial_rewrite

    apply_editorial_rewrite()


if __name__ == "__main__":
    main()
