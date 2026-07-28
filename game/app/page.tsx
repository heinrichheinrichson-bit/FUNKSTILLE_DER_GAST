"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Message = { speaker: string; text: string };
type Requirement = {
  state: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: unknown;
};
type Effect = {
  state: string;
  operation: "set" | "add";
  value: unknown;
};
type Choice = {
  id: string;
  label: string;
  next: string;
  requires?: Requirement[];
  effects?: Effect[];
};
type Variant = {
  requires?: Requirement[];
  replaceMessages?: Message[];
  prependMessages?: Message[];
  appendMessages?: Message[];
};
type Redirect = {
  requires?: Requirement[];
  effects?: Effect[];
  next: string;
};
type InputSpec = {
  kind: "code";
  prompt: string;
  placeholder?: string;
  answers: string[];
  choiceId: string;
  errorText?: string;
};
type StoryNode = {
  id: string;
  chapter: number;
  delaySeconds?: number;
  nextDelaySeconds?: number;
  messages?: Message[];
  effects?: Effect[];
  choices?: Choice[];
  variants?: Variant[];
  redirects?: Redirect[];
  next?: string;
  handoff?: string;
  ending?: string;
  input?: InputSpec;
};
type StoryDocument = {
  chapter: { id: string; number: number; title: string; startNode: string };
  nodes: StoryNode[];
};
type StoryIndex = {
  startChapter: string;
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    file: string;
  }>;
};
type StateDefinition = {
  type: "boolean" | "integer" | "enum";
  default: unknown;
  minimum?: number;
  maximum?: number;
};
type StateSchema = { states: Record<string, StateDefinition> };
type GameState = Record<string, unknown>;
type TimelineItem =
  | { kind: "message"; id: string; speaker: string; text: string }
  | { kind: "reply"; id: string; text: string };

const SAVE_KEY = "funkstille-der-gast-save-v1";
const ENDING_TITLES: Record<string, string> = {
  ending_whiteout: "Im Whiteout",
  ending_radio_silence: "Funkstille",
  ending_contained: "Der Gast bleibt",
  ending_one_dose: "Eine Dosis",
  ending_the_lie: "Die Lüge",
  ending_hidden_guest: "Der verborgene Gast",
  ending_all_rescued: "Alle gerettet",
  ending_clean_rescue: "Saubere Rettung",
};
const ARCHIVE_ITEMS = [
  { id: "thal07", title: "THAL · TAG −7", state: "log_thal_07", text: "Kader nennt die Probe inert. Im unbearbeiteten Sensorstream bewegt sie sich trotzdem. Warnbericht: 14.04." },
  { id: "freight", title: "FRACHTMANIFEST", state: "log_freight_complete", text: "Medikamente und Atemfilter wurden zwischen Labor und Generator umgebucht. Empfänger: A. Berg." },
  { id: "kader07", title: "KADER · PROBE 14C", state: "log_kader_07", text: "Probe 14C biologisch inert. Verworfene Passage: Strukturbildung nach Erwärmung." },
  { id: "varga", title: "AUSWEIS · EMIL VARGA", state: "patient_zero_clue", text: "Dr. Emil Varga, Glaziologie. Auf der Rückseite befindet sich ein unvollständiges Koordinatenfragment." },
  { id: "old", title: "ALTES PROJEKT", state: "old_project_log", text: "Es übernimmt nichts. Es verbindet. Nach einer Weile weiß keiner mehr, welcher Gedanke zuerst da war." },
];
const MAP_AREAS = [
  { id: "quarters", label: "WOHNTRAKT", x: 8, y: 35, state: null },
  { id: "labor", label: "LABOR", x: 36, y: 14, state: "lab_visited" },
  { id: "generator", label: "GENERATOR", x: 37, y: 60, state: "generator_visited" },
  { id: "outpost", label: "AUSSENPOSTEN", x: 68, y: 12, state: "weather_window_known" },
  { id: "tower", label: "BOHRTURM", x: 67, y: 57, state: "bohrturm_access" },
  { id: "shelter", label: "NOTUNTERKUNFT", x: 67, y: 82, state: "old_project_log" },
];

function normalizeCode(value: string) {
  return value.toLowerCase().replace(/[\s._-]/g, "");
}

function mapNotes(areaId: string, state: GameState) {
  const notes: string[] = [];
  if (areaId === "quarters") {
    if (state.aksel_restrained === true) notes.push("AKSEL · EINGESPERRT");
    if (state.relay_confiscated === true && state.relay_recovered !== true)
      notes.push("RELAIS · ENTWENDET");
  }
  if (areaId === "labor") {
    if (state.item_sample_data === true) notes.push("PROBENDATEN GESICHERT");
    if (state.lab_sample_state === "sealed") notes.push("KAMMER 3 · VERSIEGELT");
  }
  if (areaId === "generator") {
    if (state.generator_state === "unstable") notes.push("! BESCHÄDIGT");
    if (state.item_generator_tool === true) notes.push("WERKZEUG GEFUNDEN");
  }
  if (areaId === "outpost" && state.thal_state)
    notes.push(`THAL · ${String(state.thal_state).toUpperCase()}`);
  if (areaId === "tower" && state.kader_state)
    notes.push(`KADER · ${String(state.kader_state).toUpperCase()}`);
  if (areaId === "shelter") {
    if (state.old_sample_secured === true) notes.push("ALTPROBE GESICHERT");
    if (state.old_evidence_secured === true) notes.push("ARCHIV ÜBERTRAGEN");
  }
  return notes;
}

function requirementMatches(requirement: Requirement, state: GameState) {
  const actual = state[requirement.state];
  const expected = requirement.value;
  switch (requirement.operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gt":
      return Number(actual) > Number(expected);
    case "gte":
      return Number(actual) >= Number(expected);
    case "lt":
      return Number(actual) < Number(expected);
    case "lte":
      return Number(actual) <= Number(expected);
  }
}

function requirementsMatch(requirements: Requirement[] = [], state: GameState) {
  return requirements.every((requirement) =>
    requirementMatches(requirement, state),
  );
}

function applyEffects(
  state: GameState,
  effects: Effect[] = [],
  schema: StateSchema,
) {
  const next = { ...state };
  for (const effect of effects) {
    const definition = schema.states[effect.state];
    if (!definition) continue;
    if (effect.operation === "set") {
      next[effect.state] = effect.value;
      continue;
    }
    let value = Number(next[effect.state]) + Number(effect.value);
    if (definition.minimum !== undefined)
      value = Math.max(definition.minimum, value);
    if (definition.maximum !== undefined)
      value = Math.min(definition.maximum, value);
    next[effect.state] = value;
  }
  return next;
}

function resolveMessages(node: StoryNode, state: GameState) {
  let messages = [...(node.messages ?? [])];
  for (const variant of node.variants ?? []) {
    if (!requirementsMatch(variant.requires, state)) continue;
    if (variant.replaceMessages) messages = [...variant.replaceMessages];
    if (variant.prependMessages)
      messages = [...variant.prependMessages, ...messages];
    if (variant.appendMessages)
      messages = [...messages, ...variant.appendMessages];
  }
  return messages;
}

function makeInitialState(schema: StateSchema) {
  return Object.fromEntries(
    Object.entries(schema.states).map(([key, definition]) => [
      key,
      definition.default,
    ]),
  );
}

function formatDelay(seconds: number) {
  if (seconds < 60) return `${seconds} Sek.`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} Min.`;
}

export default function Home() {
  const [storyIndex, setStoryIndex] = useState<StoryIndex | null>(null);
  const [chapters, setChapters] = useState<Record<string, StoryDocument>>({});
  const [currentChapterId, setCurrentChapterId] = useState("");
  const [schema, setSchema] = useState<StateSchema | null>(null);
  const [gameState, setGameState] = useState<GameState>({});
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [pendingNode, setPendingNode] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [overlay, setOverlay] = useState<"archive" | "map" | "test" | null>(null);
  const [archiveItem, setArchiveItem] = useState<(typeof ARCHIVE_ITEMS)[number] | null>(null);
  const [textInput, setTextInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [gearDraft, setGearDraft] = useState<string[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [saveTransfer, setSaveTransfer] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const story = chapters[currentChapterId] ?? null;
  const nodeMap = useMemo(
    () => new Map(story?.nodes.map((node) => [node.id, node]) ?? []),
    [story],
  );
  const currentNode = nodeMap.get(currentNodeId);
  const gearCapacity =
    gameState.thal_returning === true ||
    gameState.expedition_companion === "aksel"
      ? 3
      : 2;

  const enterNode = useCallback(
    (nodeId: string, baseState: GameState, baseTimeline: TimelineItem[]) => {
      if (!schema) return;
      let node = nodeMap.get(nodeId);
      if (!node) return;
      let nextState = applyEffects(baseState, node.effects, schema);
      let redirectDepth = 0;

      while (node.redirects?.length) {
        const redirect = node.redirects.find(({ requires = [] }) =>
          requirementsMatch(requires, nextState),
        );
        if (!redirect) return;
        nextState = applyEffects(nextState, redirect.effects, schema);
        const redirectedNode = nodeMap.get(redirect.next);
        if (!redirectedNode) return;
        node = redirectedNode;
        nextState = applyEffects(nextState, node.effects, schema);
        redirectDepth += 1;
        if (redirectDepth > 20) return;
      }

      const additions: TimelineItem[] = resolveMessages(node, nextState).map(
        (message, index) => ({
          kind: "message",
          id: `${node.id}-${index}-${baseTimeline.length}`,
          speaker: message.speaker,
          text: message.text.replaceAll("{{player_name}}", playerName || "du"),
        }),
      );
      setGameState(nextState);
      setTimeline([...baseTimeline, ...additions]);
      setCurrentNodeId(node.id);
      setWaiting(false);
      setPendingNode(null);
    },
    [nodeMap, playerName, schema],
  );

  useEffect(() => {
    setTestMode(new URLSearchParams(window.location.search).has("test"));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/data/story-index.json").then((response) => response.json()),
      fetch("/data/state-schema.json").then((response) => response.json()),
    ]).then(async ([indexData, schemaData]: [StoryIndex, StateSchema]) => {
      const documents = await Promise.all(
        indexData.chapters.map(({ file }) =>
          fetch(`/data/${file}`).then((response) => response.json()),
        ),
      );
      setStoryIndex(indexData);
      setChapters(
        Object.fromEntries(
          documents.map((document: StoryDocument) => [
            document.chapter.id,
            document,
          ]),
        ),
      );
      setSchema(schemaData);
    });
  }, []);

  useEffect(() => {
    if (!storyIndex || !schema || restored) return;
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const snapshot = JSON.parse(saved);
        setGameState(snapshot.gameState);
        setCurrentChapterId(snapshot.currentChapterId ?? storyIndex.startChapter);
        setCurrentNodeId(snapshot.currentNodeId);
        setTimeline(snapshot.timeline);
        setPlayerName(snapshot.playerName ?? "");
        setProfileReady(true);
        setRestored(true);
        return;
      } catch {
        localStorage.removeItem(SAVE_KEY);
      }
    }
    const initialState = makeInitialState(schema);
    setCurrentChapterId(storyIndex.startChapter);
    setCurrentNodeId("");
    setRestored(true);
    setGameState(initialState);
    setTimeline([]);
    setProfileReady(false);
  }, [restored, schema, storyIndex]);

  useEffect(() => {
    if (!restored || !profileReady || !story || !schema || currentNodeId) return;
    enterNode(story.chapter.startNode, gameState, timeline);
  }, [
    currentNodeId,
    enterNode,
    gameState,
    restored,
    profileReady,
    schema,
    story,
    timeline,
  ]);

  useEffect(() => {
    if (!restored || !currentNodeId) return;
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        gameState,
        currentChapterId,
        currentNodeId,
        timeline,
        playerName,
      }),
    );
  }, [currentChapterId, currentNodeId, gameState, playerName, restored, timeline]);

  useEffect(() => {
    if (currentNodeId !== "k5_010_pack") return;
    const selected = [
      ["protection", "pack_protection"],
      ["sealant", "pack_sealant"],
      ["container", "pack_container"],
      ["heat", "pack_heat"],
      ["battery", "pack_relay_battery"],
    ]
      .filter(([, state]) => gameState[state] === true)
      .map(([id]) => id);
    setGearDraft(selected);
  }, [currentNodeId, gameState]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [timeline, waiting]);

  const availableChoices = useMemo(
    () =>
      (currentNode?.choices ?? []).filter((choice) =>
        requirementsMatch(choice.requires, gameState),
      ),
    [currentNode, gameState],
  );

  function selectChoice(choice: Choice) {
    if (!schema || !currentNode) return;
    const nextState = applyEffects(gameState, choice.effects, schema);
    const nextTimeline: TimelineItem[] = [
      ...timeline,
      {
        kind: "reply",
        id: `reply-${currentNode.id}-${choice.id}-${timeline.length}`,
        text: choice.label,
      },
    ];
    const target = nodeMap.get(choice.next);
    const delay = target?.delaySeconds ?? 0;
    setGameState(nextState);
    setTimeline(nextTimeline);
    if (delay > 0) {
      setWaiting(true);
      setPendingNode(choice.next);
    } else {
      enterNode(choice.next, nextState, nextTimeline);
    }
  }

  function advance() {
    if (!currentNode?.next) return;
    const target = nodeMap.get(currentNode.next);
    const delay = currentNode.nextDelaySeconds ?? target?.delaySeconds ?? 0;
    if (delay > 0) {
      setWaiting(true);
      setPendingNode(currentNode.next);
    } else {
      enterNode(currentNode.next, gameState, timeline);
    }
  }

  function skipWait() {
    if (!pendingNode) return;
    enterNode(pendingNode, gameState, timeline);
  }

  function finishProfile() {
    if (!schema) return;
    const name = playerName.trim().slice(0, 24);
    setPlayerName(name);
    setGameState((state) => ({
      ...state,
      player_name_known: Boolean(name),
    }));
    setProfileReady(true);
  }

  function submitNodeInput() {
    if (!currentNode?.input) return;
    const valid = currentNode.input.answers.some(
      (answer) => normalizeCode(answer) === normalizeCode(textInput),
    );
    if (!valid) {
      setInputError(currentNode.input.errorText ?? "Code abgelehnt.");
      return;
    }
    const choice = availableChoices.find(
      ({ id }) => id === currentNode.input?.choiceId,
    );
    if (!choice) {
      setInputError("Diese Eingabe ist mit den bisherigen Funden nicht belegbar.");
      return;
    }
    setTextInput("");
    setInputError("");
    selectChoice(choice);
  }

  function toggleGear(id: string) {
    setGearDraft((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < gearCapacity
          ? [...current, id]
          : current,
    );
  }

  function confirmGear() {
    if (!schema || gearDraft.length < 2) return;
    const nextState = {
      ...gameState,
      pack_protection: gearDraft.includes("protection"),
      pack_sealant: gearDraft.includes("sealant"),
      pack_container: gearDraft.includes("container"),
      pack_heat: gearDraft.includes("heat"),
      pack_relay_battery: gearDraft.includes("battery"),
      pack_count: gearDraft.length,
    };
    const nextTimeline: TimelineItem[] = [
      ...timeline,
      {
        kind: "reply",
        id: `gear-${timeline.length}`,
        text: `Ausrüstung bestätigen (${gearDraft.length} Gegenstände).`,
      },
    ];
    setGameState(nextState);
    setTimeline(nextTimeline);
    enterNode("k5_020_tower", nextState, nextTimeline);
  }

  function jumpToChapter(chapterId: string) {
    const target = chapters[chapterId];
    if (!target) return;
    setWaiting(false);
    setPendingNode(null);
    setCurrentChapterId(chapterId);
    setCurrentNodeId("");
    setTimeline([]);
    setOverlay(null);
  }

  function jumpToNode(nodeId: string) {
    setWaiting(false);
    setPendingNode(null);
    setTimeline([]);
    enterNode(nodeId, gameState, []);
    setOverlay(null);
  }

  function applyTestPreset(kind: "max" | "infected" | "finale") {
    const next = { ...gameState };
    if (kind === "max" || kind === "finale") {
      Object.assign(next, {
        lab_visited: true,
        generator_visited: true,
        generator_state: "stable",
        item_sample_data: true,
        evidence_level: 6,
        weather_window_known: true,
        rescue_coordinates: true,
        bohrturm_access: true,
        old_project_log: true,
        cure_material: 4,
        containment: "ready",
        aksel_inside_after_return: true,
        thal_returning: true,
        kader_state: "cooperative",
      });
    }
    if (kind === "infected") {
      Object.assign(next, {
        infection_source: "lab_aerosol",
        clarity: 1,
        aksel_state: "infected",
      });
    }
    setGameState(next);
    if (kind === "finale") jumpToChapter("chapter_07");
  }

  function importSave() {
    try {
      const snapshot = JSON.parse(saveTransfer);
      setGameState(snapshot.gameState);
      setCurrentChapterId(snapshot.currentChapterId);
      setCurrentNodeId(snapshot.currentNodeId);
      setTimeline(snapshot.timeline ?? []);
      setPlayerName(snapshot.playerName ?? playerName);
      setWaiting(false);
      setPendingNode(null);
      setOverlay(null);
    } catch {
      setSaveTransfer("UNGÜLTIGER SPIELSTAND");
    }
  }

  function restart() {
    if (!storyIndex || !schema) return;
    localStorage.removeItem(SAVE_KEY);
    const initialState = makeInitialState(schema);
    setTimeline([]);
    setGameState(initialState);
    setWaiting(false);
    setPendingNode(null);
    setCurrentChapterId(storyIndex.startChapter);
    setCurrentNodeId("");
    setPlayerName("");
    setProfileReady(false);
  }

  function continueChapter() {
    if (!currentNode?.handoff || !chapters[currentNode.handoff]) return;
    setWaiting(false);
    setPendingNode(null);
    setCurrentChapterId(currentNode.handoff);
    setCurrentNodeId("");
  }

  if (!storyIndex || !story || !schema || !restored) {
    return (
      <main className="loading-screen">
        <div className="signal-mark" />
        <p>Suche offene Frequenz …</p>
      </main>
    );
  }

  if (!profileReady) {
    return (
      <main className="loading-screen profile-screen">
        <div className="profile-card">
          <span className="eyebrow">UNBEKANNTER KONTAKT</span>
          <h1>MIRA: Wie soll ich dich nennen?</h1>
          <p>Der Name ist optional und bleibt ausschließlich Teil dieses lokalen Spielstands.</p>
          <input
            autoFocus
            maxLength={24}
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && finishProfile()}
            placeholder="Name oder Rufzeichen"
          />
          <button type="button" onClick={finishProfile}>
            {playerName.trim() ? "Verbindung herstellen" : "Anonym bleiben"}
          </button>
        </div>
      </main>
    );
  }

  const connectionEnded = Boolean(currentNode?.handoff || currentNode?.ending);

  return (
    <main className="app-shell">
      <section className="phone">
        <header className="topbar">
          <div>
            <span className="eyebrow">ELF-NOTRELAIS</span>
            <h1>Station Kaldstad</h1>
          </div>
          <div className="top-actions">
            <div className="connection">
              <span className="connection-dot" />
              VERBUNDEN
            </div>
            <nav className="utility-nav" aria-label="Relaiswerkzeuge">
              <button type="button" onClick={() => setOverlay("archive")}>LOGS</button>
              <button type="button" onClick={() => setOverlay("map")}>KARTE</button>
              {testMode && <button type="button" onClick={() => setOverlay("test")}>TEST</button>}
            </nav>
          </div>
        </header>

        <div className="chapter-strip">
          <span>KAPITEL {String(story.chapter.number).padStart(2, "0")}</span>
          <strong>{story.chapter.title}</strong>
          <button type="button" onClick={restart} aria-label="Spiel neu starten">
            Neustart
          </button>
        </div>

        <section className="transcript" aria-live="polite">
          <div className="encryption-note">
            Zufällige Kopplung · Identität nicht verifiziert
          </div>

          {timeline.map((item) =>
            item.kind === "reply" ? (
              <div className="row row-player" key={item.id}>
                <div className="bubble bubble-player">{item.text}</div>
              </div>
            ) : (
              <div
                className={`row ${item.speaker === "system" ? "row-system" : ""}`}
                key={item.id}
              >
                {item.speaker !== "system" && (
                  <span className="speaker">
                    {item.speaker === "mira"
                      ? "MIRA"
                      : item.speaker === "log"
                        ? "DOKUMENT"
                        : `MIRA · WÖRTLICH: ${item.speaker.toUpperCase()}`}
                  </span>
                )}
                <div
                  className={`bubble ${
                    item.speaker === "system"
                      ? "bubble-system"
                      : item.speaker === "log" || item.speaker !== "mira"
                        ? "bubble-log"
                        : "bubble-mira"
                  }`}
                >
                  {item.text}
                  {item.speaker === "log" && (
                    <button className="inline-archive" type="button" onClick={() => setOverlay("archive")}>
                      Im Archiv öffnen
                    </button>
                  )}
                </div>
              </div>
            ),
          )}

          {waiting && (
            <div className="waiting-card">
              <div className="typing">
                <span />
                <span />
                <span />
              </div>
              <div>
                <strong>Mira ist unterwegs</strong>
                <small>
                  In der finalen Fassung:{" "}
                  {formatDelay(
                    nodeMap.get(pendingNode ?? "")?.delaySeconds ??
                      currentNode?.nextDelaySeconds ??
                      0,
                  )}
                </small>
              </div>
              <button type="button" onClick={skipWait}>
                Demo: Zeit überspringen
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </section>

        <footer className="response-panel">
          {!waiting && currentNode?.input && (
            <form className="code-entry" onSubmit={(event) => { event.preventDefault(); submitNodeInput(); }}>
              <label htmlFor="story-code">{currentNode.input.prompt}</label>
              <div>
                <input
                  id="story-code"
                  inputMode="text"
                  autoComplete="off"
                  value={textInput}
                  placeholder={currentNode.input.placeholder ?? "Code"}
                  onChange={(event) => { setTextInput(event.target.value); setInputError(""); }}
                />
                <button type="submit">Senden</button>
              </div>
              {inputError && <small>{inputError}</small>}
            </form>
          )}

          {!waiting && currentNodeId === "k5_010_pack" && (
            <div className="gear-picker">
              <div className="gear-heading">
                <strong>Ausrüstung wählen</strong>
                <span>{gearDraft.length}/{gearCapacity}</span>
              </div>
              {[
                ["protection", "Schutzanzug"],
                ["sealant", "Versiegelungsschaum und Bolzen"],
                ["container", "Großer Probenbehälter"],
                ["heat", "Wärmeakku"],
                ["battery", "Relais-Ersatzakku"],
              ].map(([id, label]) => (
                <button
                  className={gearDraft.includes(id) ? "gear selected" : "gear"}
                  key={id}
                  type="button"
                  onClick={() => toggleGear(id)}
                >
                  <span>{label}</span><b>{gearDraft.includes(id) ? "✓" : "+"}</b>
                </button>
              ))}
              <button className="gear-confirm" disabled={gearDraft.length < 2} type="button" onClick={confirmGear}>
                Auswahl bestätigen und aufbrechen
              </button>
            </div>
          )}

          {!waiting &&
            currentNodeId !== "k5_010_pack" &&
            availableChoices
              .filter((choice) => choice.id !== currentNode?.input?.choiceId)
              .map((choice) => (
              <button
                className="choice"
                key={choice.id}
                type="button"
                onClick={() => selectChoice(choice)}
              >
                <span>{choice.label}</span>
                <b>›</b>
              </button>
            ))}

          {!waiting && currentNode?.next && (
            <button className="choice choice-continue" type="button" onClick={advance}>
              <span>Weiter</span>
              <b>›</b>
            </button>
          )}

          {connectionEnded && (
            <div className="handoff">
              <span>
                {currentNode?.ending ? "Dein Ende" : "Kapitel abgeschlossen"}
              </span>
              {currentNode?.handoff && chapters[currentNode.handoff] ? (
                <button type="button" onClick={continueChapter}>
                  Weiter: {chapters[currentNode.handoff].chapter.title}
                </button>
              ) : currentNode?.ending ? (
                <strong>
                  {ENDING_TITLES[currentNode.ending] ?? currentNode.ending}
                </strong>
              ) : (
                <strong>Fortsetzung folgt</strong>
              )}
            </div>
          )}
        </footer>
      </section>

      {overlay && (
        <div className="overlay" role="dialog" aria-modal="true">
          <section className="overlay-card">
            <header>
              <div>
                <span className="eyebrow">ELF-NOTRELAIS</span>
                <h2>{overlay === "archive" ? "Archiv" : overlay === "map" ? "Stationskarte" : "Testmodus"}</h2>
              </div>
              <button type="button" onClick={() => { setOverlay(null); setArchiveItem(null); }}>×</button>
            </header>

            {overlay === "archive" && (
              archiveItem ? (
                <article className="archive-detail">
                  <button type="button" onClick={() => setArchiveItem(null)}>‹ Zurück</button>
                  <h3>{archiveItem.title}</h3>
                  <p>{archiveItem.text}</p>
                </article>
              ) : (
                <div className="archive-list">
                  {ARCHIVE_ITEMS.map((item) => {
                    const unlocked = gameState[item.state] === true;
                    return (
                      <button disabled={!unlocked} key={item.id} type="button" onClick={() => setArchiveItem(item)}>
                        <span>{unlocked ? item.title : "VERSCHLÜSSELTER EINTRAG"}</span>
                        <b>{unlocked ? "ÖFFNEN" : "GESPERRT"}</b>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {overlay === "map" && (
              <div className="map-panel">
                <div className="map-grid">
                  {MAP_AREAS.map((area) => {
                    const known = area.state === null || gameState[area.state] === true;
                    return (
                      <div className={known ? "map-room known" : "map-room"} key={area.id} style={{ left: `${area.x}%`, top: `${area.y}%` }}>
                        <span>{known ? area.label : "?"}</span>
                        {known && mapNotes(area.id, gameState).map((note) => <i key={note}>{note}</i>)}
                      </div>
                    );
                  })}
                </div>
                <p>Gestrichelte Bereiche sind nur aus Protokollen rekonstruiert. Personenmarkierungen zeigen den letzten bekannten Ort.</p>
              </div>
            )}

            {overlay === "test" && (
              <div className="test-panel">
                <label>Kapitel direkt öffnen</label>
                <select value={currentChapterId} onChange={(event) => jumpToChapter(event.target.value)}>
                  {storyIndex.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.number}. {chapter.title}</option>)}
                </select>
                <label>Node im aktuellen Kapitel</label>
                <select value={currentNodeId} onChange={(event) => jumpToNode(event.target.value)}>
                  {story.nodes.map((node) => <option key={node.id} value={node.id}>{node.id}</option>)}
                </select>
                <label>Testzustände</label>
                <div className="test-actions">
                  <button type="button" onClick={() => applyTestPreset("max")}>Maximale Funde</button>
                  <button type="button" onClick={() => applyTestPreset("infected")}>Infiziert</button>
                  <button type="button" onClick={() => applyTestPreset("finale")}>Finale vorbereiten</button>
                </div>
                <div className="test-actions">
                  <button type="button" onClick={skipWait} disabled={!waiting}>Wartezeit überspringen</button>
                  <button type="button" onClick={() => setSaveTransfer(localStorage.getItem(SAVE_KEY) ?? "")}>Spielstand exportieren</button>
                </div>
                <textarea value={saveTransfer} onChange={(event) => setSaveTransfer(event.target.value)} placeholder="Spielstand JSON" />
                <button type="button" onClick={importSave}>Spielstand importieren</button>
                <details>
                  <summary>Verborgene Zustände</summary>
                  <pre>{JSON.stringify(gameState, null, 2)}</pre>
                </details>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
