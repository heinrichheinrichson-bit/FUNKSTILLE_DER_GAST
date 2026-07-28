import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
PUBLIC = ROOT / "game" / "public" / "data"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


schema = load(DATA / "state-schema.json")
known_states = set(schema["states"])
index = load(DATA / "story-index.json")
all_nodes = {}
chapter_docs = {}
errors = []

for chapter in index["chapters"]:
    data_path = DATA / chapter["file"]
    public_path = PUBLIC / chapter["file"]
    if data_path.read_bytes() != public_path.read_bytes():
        errors.append(f"Storykopie abweichend: {chapter['file']}")
    doc = load(data_path)
    chapter_docs[chapter["id"]] = doc
    for node in doc["nodes"]:
        node_id = node["id"]
        if node_id in all_nodes:
            errors.append(f"Doppelte Node-ID: {node_id}")
        all_nodes[node_id] = node
        location = node.get("location")
        if not location:
            errors.append(f"Ort fehlt: {node_id}")
        else:
            for key in ("area", "room", "stationLeft", "stationTop", "interiorLeft", "interiorTop", "activity"):
                if key not in location:
                    errors.append(f"Ortsfeld {key} fehlt: {node_id}")

if (DATA / "state-schema.json").read_bytes() != (PUBLIC / "state-schema.json").read_bytes():
    errors.append("State-Schema-Kopie abweichend")

foreign_speakers = []
reference_count = 0
for node_id, node in all_nodes.items():
    message_groups = [node.get("messages", [])]
    for variant in node.get("variants", []):
        message_groups.extend(
            variant.get(key, [])
            for key in ("replaceMessages", "prependMessages", "appendMessages")
        )
    for messages in message_groups:
        for message in messages:
            if message.get("speaker") not in {"mira", "system", "log"}:
                foreign_speakers.append((node_id, message.get("speaker")))

    targets = []
    if node.get("next"):
        targets.append(node["next"])
    for choice in node.get("choices", []):
        targets.append(choice["next"])
    for redirect in node.get("redirects", []):
        targets.append(redirect["next"])
    for target in targets:
        reference_count += 1
        if target not in all_nodes:
            errors.append(f"Unbekanntes Ziel {target} in {node_id}")

    containers = [node]
    containers.extend(node.get("choices", []))
    containers.extend(node.get("redirects", []))
    containers.extend(node.get("variants", []))
    for container in containers:
        for requirement in container.get("requires", []):
            if requirement["state"] not in known_states:
                errors.append(f"Unbekannter State {requirement['state']} in {node_id}")
        for state_effect in container.get("effects", []):
            if state_effect["state"] not in known_states:
                errors.append(f"Unbekannter State {state_effect['state']} in {node_id}")

if foreign_speakers:
    errors.append(f"Fremdsprecher verblieben: {foreign_speakers[:10]}")

# Structural reachability, intentionally ignoring state requirements.
reachable = set()
queue = [chapter_docs[index["startChapter"]]["chapter"]["startNode"]]
while queue:
    node_id = queue.pop()
    if node_id in reachable or node_id not in all_nodes:
        continue
    reachable.add(node_id)
    node = all_nodes[node_id]
    if node.get("next"):
        queue.append(node["next"])
    queue.extend(choice["next"] for choice in node.get("choices", []))
    queue.extend(redirect["next"] for redirect in node.get("redirects", []))
    if node.get("handoff"):
        queue.append(chapter_docs[node["handoff"]]["chapter"]["startNode"])

unreachable = sorted(set(all_nodes) - reachable)
if unreachable:
    errors.append(f"Strukturell unerreichbare Nodes ({len(unreachable)}): {unreachable[:20]}")

required_niko_nodes = {
    "k4_310_niko_open",
    "k4_311_niko_found",
    "k7_085_manifest",
    "k8_065_niko_gate",
    "k8_067_niko_arrives",
    "k8_068_niko_capacity",
    "k8_069_niko_boarded",
}
missing_niko = required_niko_nodes - set(all_nodes)
if missing_niko:
    errors.append(f"Niko-Pflichtnodes fehlen: {sorted(missing_niko)}")

# The reveal is sacred: neither Niko nor a cat may be named before Mira
# actually sees him in k4_311_niko_found (or in the finale-only reveal).
reveal_words = ("niko", "katze", "kater", "miauen", "miaut", "schnurr", "pfote")
pre_reveal_nodes = {
    node_id
    for node_id, node in all_nodes.items()
    if node.get("chapter") in {1, 2, 3}
}
pre_reveal_nodes.update({"k4_300_hub", "k4_310_niko_open", "k4_312_niko_deferred"})
for node_id in sorted(pre_reveal_nodes):
    node = all_nodes[node_id]
    visible_texts = [message.get("text", "") for message in node.get("messages", [])]
    visible_texts.extend(choice.get("label", "") for choice in node.get("choices", []))
    joined = " ".join(visible_texts).lower()
    found_words = [word for word in reveal_words if word in joined]
    if found_words:
        errors.append(f"Vorzeitige Niko-Enthüllung in {node_id}: {found_words}")

first_reveal = all_nodes.get("k4_311_niko_found", {}).get("messages", [])
first_niko_index = next(
    (index for index, message in enumerate(first_reveal) if "niko" in message.get("text", "").lower()),
    None,
)
seen_before_name = (
    first_niko_index is not None
    and any(
        "schranktür ist offen" in message.get("text", "").lower()
        and "ich sehe" in message.get("text", "").lower()
        for message in first_reveal[:first_niko_index]
    )
)
if not seen_before_name:
    errors.append("Nikos Name erscheint nicht erst nach Miras tatsächlicher Sichtung")

forbidden_phrases = {
    "generator-team": "unverständliche Funktionsbezeichnung",
    "danach ins labor": "abgehackte Übergangsantwort",
    "prüf zuerst tür und boden": "unklare Handlungsanweisung",
    "du kennst ihn bereits": "unbegründetes Rätselwissen",
    "kilometerweit draußen verloren": "falsche Wegkontinuität",
    "ich glaube, es bin ich": "unklare Thal-Aufnahme",
    "bereite wasser und eine decke vor. dann öffne": "Niko wird vor der Sichtung verraten",
    "das gerät protokolliert nur sensordaten": "unglaubwürdige Relais-Ausrede",
    "niemand ist einfach irgendwann in der gruppe aufgetaucht": "Meta-Kommentar statt Dialog",
}
for node_id, node in sorted(all_nodes.items()):
    visible_texts = [message.get("text", "") for message in node.get("messages", [])]
    visible_texts.extend(choice.get("label", "") for choice in node.get("choices", []))
    for variant in node.get("variants", []):
        for field in ("appendMessages", "replaceMessages"):
            visible_texts.extend(message.get("text", "") for message in variant.get(field, []))
    joined = " ".join(visible_texts).lower()
    for phrase, reason in forbidden_phrases.items():
        if phrase in joined:
            errors.append(f"Verbotene Formulierung in {node_id}: {reason}")

code_node = all_nodes.get("k2_l_020_locked", {})
if code_node.get("input", {}).get("answers") != ["0414"]:
    errors.append("Laborcode akzeptiert weiterhin Datumsvarianten statt nur 0414")
thal_note = " ".join(
    message.get("text", "") for message in all_nodes.get("k1_070_quarters", {}).get("messages", [])
)
if "0414" not in thal_note or len(thal_note) < 300:
    errors.append("Laborcode ist nicht in einer ausführlichen, realistischen Schichtnotiz eingebettet")

niko_open = all_nodes.get("k4_310_niko_open", {})
if niko_open.get("nextDelaySeconds", 0) < 60:
    errors.append("Niko-Enthüllung besitzt keine glaubhafte Sorgepause")

departure_base = " ".join(
    message.get("text", "") for message in all_nodes.get("k8_030_wait", {}).get("messages", [])
).lower()
if any(name in departure_base for name in ("aksel", "ingrid", "kader")):
    errors.append("Rettungsweg nennt NPCs im Basistext unabhängig von ihrer Anwesenheit")

kader_escort_sources = []
for node_id, node in all_nodes.items():
    for choice in node.get("choices", []):
        if any(
            effect.get("state") == "kader_escorted_to_lab" and effect.get("value") is True
            for effect in choice.get("effects", [])
        ):
            kader_escort_sources.append((node_id, choice.get("id")))
if kader_escort_sources != [("k5_083_coordinates", "escort_kader")]:
    errors.append(f"Kaders Ortswechsel ins Labor ist nicht exklusiv an die Eskorte gebunden: {kader_escort_sources}")

if errors:
    print("WRITER-REBUILD-AUDIT: FEHLGESCHLAGEN")
    for error in errors:
        print("-", error)
    raise SystemExit(1)

print("WRITER-REBUILD-AUDIT: OK")
print(f"Nodes: {len(all_nodes)}")
print(f"Erreichbar: {len(reachable)}")
print(f"Referenzen: {reference_count}")
print("Fremdsprecher: 0")
print("Niko-Pflichtpfad: vorhanden")
print("Niko vor Sichtung: nicht erwähnt")
print("Ortsmetadaten: vollständig")
