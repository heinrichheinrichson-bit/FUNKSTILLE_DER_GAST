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
  acknowledgement?: string;
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
  kind: "code" | "text";
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
  location?: {
    area: string;
    room: string;
    stationLeft: number;
    stationTop: number;
    interiorLeft: number;
    interiorTop: number;
    activity?: string;
  };
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
  | { kind: "message"; id: string; speaker: string; text: string; time?: number }
  | { kind: "reply"; id: string; text: string; time?: number; status?: "sent" | "delivered" | "read"; waitCheckIn?: boolean };
type DecisionSnapshot = {
  id: string;
  chapterId: string;
  nodeId: string;
  choiceId: string;
  choiceLabel: string;
  gameState: GameState;
  timeline: TimelineItem[];
};
type MapView = "station" | "quarters" | "labor" | "generator";

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
  { id: "quarters", label: "WOHNTRAKT", x: 9, y: 35, w: 27, h: 14, state: null, shape: "wing" },
  { id: "labor", label: "LABOR", x: 39, y: 18, w: 20, h: 17, state: "lab_visited", shape: "cluster" },
  { id: "generator", label: "GENERATOR", x: 42, y: 57, w: 16, h: 12, state: "generator_visited", shape: "industrial" },
  { id: "outpost", label: "AUSSENPOSTEN", x: 73, y: 12, w: 15, h: 10, state: "weather_window_known", shape: "capsule" },
  { id: "tower", label: "BOHRTURM", x: 75, y: 52, w: 12, h: 12, state: "bohrturm_access", shape: "octagon" },
  { id: "shelter", label: "NOTUNTERKUNFT", x: 65, y: 79, w: 19, h: 9, state: "old_project_log", shape: "bunker" },
];
const BUILDING_ROOMS: Record<Exclude<MapView, "station">, Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>> = {
  quarters: [
    { id: "airlock", label: "SCHLEUSE", x: 3, y: 38, w: 17, h: 25 },
    { id: "corridor", label: "HAUPTGANG", x: 20, y: 43, w: 57, h: 15 },
    { id: "radio", label: "FUNK / BÜRO", x: 25, y: 8, w: 22, h: 35 },
    { id: "mess", label: "KANTINE", x: 50, y: 8, w: 27, h: 35 },
    { id: "bunks", label: "KABINEN", x: 25, y: 58, w: 27, h: 31 },
    { id: "storage", label: "VORRATSRAUM", x: 55, y: 58, w: 22, h: 31 },
  ],
  labor: [
    { id: "airlock", label: "DEKON-SCHLEUSE", x: 3, y: 35, w: 20, h: 28 },
    { id: "hall", label: "VERTEILER", x: 23, y: 42, w: 22, h: 16 },
    { id: "analysis", label: "ANALYSE", x: 45, y: 8, w: 28, h: 34 },
    { id: "cold", label: "KÜHLLAGER", x: 73, y: 8, w: 23, h: 34 },
    { id: "chamber", label: "KAMMER 3", x: 45, y: 58, w: 29, h: 32 },
    { id: "office", label: "KADER", x: 74, y: 58, w: 22, h: 32 },
  ],
  generator: [
    { id: "airlock", label: "SERVICE-SCHLEUSE", x: 3, y: 38, w: 22, h: 24 },
    { id: "control", label: "STEUERUNG", x: 25, y: 12, w: 25, h: 38 },
    { id: "plant", label: "AGGREGATE", x: 50, y: 12, w: 46, h: 56 },
    { id: "workshop", label: "WERKBANK", x: 25, y: 50, w: 25, h: 38 },
    { id: "fuel", label: "TANKS", x: 50, y: 68, w: 46, h: 20 },
  ],
};

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

function transitionDelay(current: StoryNode, target: StoryNode | undefined) {
  const targetWaitsForPlayer =
    (target?.messages?.length ?? 0) === 0 &&
    Boolean(target?.input || target?.choices?.length);
  if (targetWaitsForPlayer) return 0;
  return current.nextDelaySeconds ?? target?.delaySeconds ?? 0;
}

function makeInitialState(schema: StateSchema) {
  return Object.fromEntries(
    Object.entries(schema.states).map(([key, definition]) => [
      key,
      definition.default,
    ]),
  );
}

function formatMessageTime(time: number) {
  return new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(time);
}

function waitingActivity(node: StoryNode | undefined, chapterId: string, disconnected: boolean) {
  if (disconnected) return "Keine Verbindung zu Mira";
  if (node?.location?.activity) return node.location.activity;
  const id = (node?.id ?? "").toLowerCase();
  if (id.includes("generator") || id.includes("_g_")) return "Mira arbeitet am Generator";
  if (id.includes("lab")) return "Mira untersucht das Labor";
  if (id.includes("tower") || id.includes("bohr") || chapterId === "chapter_05") return "Mira ist unterwegs";
  if (id.includes("shelter") || chapterId === "chapter_06") return "Mira ist unter dem Eis unterwegs";
  if (chapterId === "chapter_08") return "Mira wartet auf das Rettungsteam";
  return "Mira ist beschäftigt";
}

function currentMapLocation(chapterId: string, node: StoryNode | undefined) {
  if (node?.location) {
    return {
      area: node.location.area,
      room: node.location.room,
      left: node.location.stationLeft,
      top: node.location.stationTop,
      interiorLeft: node.location.interiorLeft,
      interiorTop: node.location.interiorTop,
    };
  }
  const nodeId = node?.id ?? "";
  const text = nodeId.toLowerCase();
  if (text.includes("lab")) return { area: "labor", room: "hall", left: 46, top: 27, interiorLeft: 34, interiorTop: 50 };
  if (text.includes("generator") || text.includes("_g_")) return { area: "generator", room: "control", left: 47, top: 63, interiorLeft: 36, interiorTop: 30 };
  if (text.includes("tower") || text.includes("bohr")) return { area: "tower", room: "platform", left: 78, top: 57, interiorLeft: 50, interiorTop: 50 };
  if (text.includes("shelter") || text.includes("unter")) return { area: "shelter", room: "shelter", left: 70, top: 83, interiorLeft: 50, interiorTop: 50 };
  const fallback: Record<string, { area: string; left: number; top: number }> = {
    chapter_01: { area: "quarters", left: 20, top: 42 },
    chapter_02: { area: "labor", left: 48, top: 27 },
    chapter_03: { area: "outpost", left: 67, top: 36 },
    chapter_04: { area: "outpost", left: 78, top: 18 },
    chapter_05: { area: "tower", left: 80, top: 58 },
    chapter_06: { area: "shelter", left: 72, top: 83 },
    chapter_07: { area: "quarters", left: 20, top: 42 },
    chapter_08: { area: "quarters", left: 19, top: 74 },
  };
  const result = fallback[chapterId] ?? fallback.chapter_01;
  return { ...result, room: "unknown", interiorLeft: 35, interiorTop: 50 };
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
  const [waitUntil, setWaitUntil] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [waitStartedAt, setWaitStartedAt] = useState<number | null>(null);
  const [waitDurationSeconds, setWaitDurationSeconds] = useState(0);
  const [waitMessageSent, setWaitMessageSent] = useState(false);
  const [deferredWaitSeconds, setDeferredWaitSeconds] = useState<number | null>(null);
  const [deliveryQueue, setDeliveryQueue] = useState<Array<Extract<TimelineItem, { kind: "message" }>>>([]);
  const [deliveryPhase, setDeliveryPhase] = useState<"idle" | "typing" | "reading" | "interrupted">("idle");
  const [interruptedMessageId, setInterruptedMessageId] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [restored, setRestored] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [overlay, setOverlay] = useState<"archive" | "map" | "test" | "settings" | null>(null);
  const [archiveItem, setArchiveItem] = useState<(typeof ARCHIVE_ITEMS)[number] | null>(null);
  const [textInput, setTextInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [gearDraft, setGearDraft] = useState<string[]>([]);
  const [testMode, setTestMode] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState<DecisionSnapshot[]>([]);
  const [mapView, setMapView] = useState<MapView>("station");
  const [saveTransfer, setSaveTransfer] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLElement>(null);
  const nearBottomRef = useRef(true);

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
  const currentLocation = currentMapLocation(currentChapterId, currentNode);

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
          time: Date.now() + index,
        }),
      );
      setGameState(nextState);
      setTimeline(baseTimeline);
      setDeliveryQueue(additions as Array<Extract<TimelineItem, { kind: "message" }>>);
      setDeliveryPhase("idle");
      setCurrentNodeId(node.id);
      setWaiting(false);
      setPendingNode(null);
      setWaitUntil(null);
      setRemainingSeconds(0);
      setWaitStartedAt(null);
      setWaitDurationSeconds(0);
      setWaitMessageSent(false);
      setDeferredWaitSeconds(null);
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
        setDecisionHistory(snapshot.decisionHistory ?? []);
        setDeliveryQueue(snapshot.deliveryQueue ?? []);
        setDeferredWaitSeconds(snapshot.deferredWaitSeconds ?? null);
        if (snapshot.pendingNode && snapshot.waitUntil) {
          setPendingNode(snapshot.pendingNode);
          setWaitUntil(Math.max(snapshot.waitUntil, Date.now()));
          setRemainingSeconds(Math.max(0, Math.ceil((snapshot.waitUntil - Date.now()) / 1000)));
          setWaitStartedAt(snapshot.waitStartedAt ?? snapshot.waitUntil - (snapshot.waitDurationSeconds ?? 0) * 1000);
          setWaitDurationSeconds(snapshot.waitDurationSeconds ?? 0);
          setWaiting(true);
          setWaitMessageSent(snapshot.waitMessageSent ?? false);
        }
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
    setProfileReady(true);
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
        decisionHistory,
        pendingNode,
        waitUntil,
        waitMessageSent,
        waitStartedAt,
        waitDurationSeconds,
        deliveryQueue,
        deferredWaitSeconds,
      }),
    );
  }, [currentChapterId, currentNodeId, decisionHistory, deferredWaitSeconds, deliveryQueue, gameState, pendingNode, playerName, restored, timeline, waitDurationSeconds, waitMessageSent, waitStartedAt, waitUntil]);

  useEffect(() => {
    setSoundEnabled(localStorage.getItem("funkstille-sound") === "1");
    setVibrationEnabled(localStorage.getItem("funkstille-vibration") === "1");
  }, []);

  useEffect(() => {
    if (!waiting || !pendingNode || !waitUntil) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((waitUntil - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining === 0) enterNode(pendingNode, gameState, timeline);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [enterNode, gameState, pendingNode, timeline, waitUntil, waiting]);

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
    if (nearBottomRef.current || deliveryPhase !== "idle") {
      window.requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
      setUnreadCount(0);
    } else if (timeline.length) {
      setUnreadCount((count) => count + 1);
    }
  }, [timeline, deliveryPhase]);

  useEffect(() => {
    const sent = timeline.filter(
      (item): item is Extract<TimelineItem, { kind: "reply" }> =>
        item.kind === "reply" && item.status === "sent",
    );
    if (!sent.length) return;
    const disconnected =
      gameState.relay_confiscated === true && gameState.relay_recovered !== true;
    if (disconnected) return;
    const weak = gameState.relay_damaged === true;
    const deliveredTimer = window.setTimeout(() => {
      setTimeline((current) =>
        current.map((item) =>
          item.kind === "reply" && item.status === "sent"
            ? { ...item, status: "delivered" }
            : item,
        ),
      );
    }, weak ? 2600 : 650);
    return () => window.clearTimeout(deliveredTimer);
  }, [gameState.relay_confiscated, gameState.relay_damaged, gameState.relay_recovered, timeline]);

  useEffect(() => {
    const delivered = timeline.some(
      (item) =>
        item.kind === "reply" &&
        item.status === "delivered" &&
        !item.waitCheckIn,
    );
    if (!delivered) return;
    const timer = window.setTimeout(() => {
      setTimeline((current) =>
        current.map((item) =>
          item.kind === "reply" && item.status === "delivered" && !item.waitCheckIn
            ? { ...item, status: "read" }
            : item,
        ),
      );
    }, gameState.relay_damaged === true ? 1600 : 550);
    return () => window.clearTimeout(timer);
  }, [gameState.relay_damaged, timeline]);

  useEffect(() => {
    if (deliveryPhase !== "typing") return;
    setTimeline((current) =>
      current.map((item) =>
        item.kind === "reply" && item.status === "delivered"
          ? { ...item, status: "read" }
          : item,
      ),
    );
  }, [deliveryPhase]);

  const availableChoices = useMemo(
    () =>
      (currentNode?.choices ?? []).filter((choice) =>
        requirementsMatch(choice.requires, gameState),
      ),
    [currentNode, gameState],
  );
  const delivering = deliveryQueue.length > 0 || deliveryPhase !== "idle";

  useEffect(() => {
    if (!deferredWaitSeconds || delivering || !pendingNode || waiting) return;
    setWaiting(true);
    setWaitUntil(Date.now() + deferredWaitSeconds * 1000);
    setWaitStartedAt(Date.now());
    setWaitDurationSeconds(deferredWaitSeconds);
    setRemainingSeconds(deferredWaitSeconds);
    setDeferredWaitSeconds(null);
  }, [deferredWaitSeconds, delivering, pendingNode, waiting]);

  useEffect(() => {
    if (waiting) return;
    if (!deliveryQueue.length) {
      if (deliveryPhase === "reading") {
        const timer = window.setTimeout(() => setDeliveryPhase("idle"), testMode ? 70 : 650);
        return () => window.clearTimeout(timer);
      }
      return;
    }
    const message = deliveryQueue[0];
    const interruption =
      !testMode &&
      interruptedMessageId !== message.id &&
      [...message.id].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 19 === 0;

    if (deliveryPhase === "idle") {
      const timer = window.setTimeout(() => setDeliveryPhase("typing"), testMode ? 40 : 240);
      return () => window.clearTimeout(timer);
    }
    if (deliveryPhase === "typing") {
      const typingTime = testMode ? 90 : Math.min(4600, Math.max(700, 420 + message.text.length * 31));
      const timer = window.setTimeout(() => {
        if (interruption) {
          setInterruptedMessageId(message.id);
          setDeliveryPhase("interrupted");
          return;
        }
        setTimeline((current) => [...current, { ...message, time: Date.now() }]);
        setDeliveryQueue((current) => current.slice(1));
        setDeliveryPhase("reading");
        if (soundEnabled) {
          const AudioContextClass = window.AudioContext;
          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.frequency.value = 620;
          gain.gain.value = 0.025;
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.06);
        }
        if (vibrationEnabled && navigator.vibrate) navigator.vibrate(25);
      }, typingTime);
      return () => window.clearTimeout(timer);
    }
    if (deliveryPhase === "interrupted") {
      const timer = window.setTimeout(() => setDeliveryPhase("typing"), testMode ? 60 : 1400);
      return () => window.clearTimeout(timer);
    }
    if (deliveryPhase === "reading") {
      const pause = testMode ? 70 : Math.min(1800, Math.max(480, message.text.length * 13));
      const timer = window.setTimeout(() => setDeliveryPhase("idle"), pause);
      return () => window.clearTimeout(timer);
    }
  }, [deliveryPhase, deliveryQueue, interruptedMessageId, soundEnabled, testMode, vibrationEnabled, waiting]);

  useEffect(() => {
    if (
      waiting ||
      delivering ||
      deferredWaitSeconds !== null ||
      !currentNode?.next ||
      currentNode.input ||
      currentNode.ending ||
      currentNode.handoff ||
      availableChoices.length
    ) return;
    const timer = window.setTimeout(() => advance(), testMode ? 80 : 520);
    return () => window.clearTimeout(timer);
  }, [availableChoices.length, currentNode, deferredWaitSeconds, delivering, testMode, waiting]);

  function selectChoice(choice: Choice) {
    if (sendingReply || delivering) return;
    setSendingReply(true);
    window.setTimeout(() => {
      setSendingReply(false);
      commitChoice(choice);
    }, testMode ? 60 : 360);
  }

  function commitChoice(choice: Choice) {
    if (!schema || !currentNode) return;
    setDecisionHistory((history) => [
      ...history,
      {
        id: `${currentChapterId}-${currentNode.id}-${choice.id}-${Date.now()}`,
        chapterId: currentChapterId,
        nodeId: currentNode.id,
        choiceId: choice.id,
        choiceLabel: choice.label,
        gameState: structuredClone(gameState),
        timeline: structuredClone(timeline),
      },
    ]);
    const nextState = applyEffects(gameState, choice.effects, schema);
    const nextTimeline: TimelineItem[] = [
      ...timeline,
      {
        kind: "reply",
        id: `reply-${currentNode.id}-${choice.id}-${timeline.length}`,
        text: choice.label,
        time: Date.now(),
        status: "sent",
      },
    ];
    const target = nodeMap.get(choice.next);
    const delay = target?.delaySeconds ?? 0;
    setGameState(nextState);
    const waitingTimeline = nextTimeline;
    setTimeline(waitingTimeline);
    if (delay > 0) {
      setPendingNode(choice.next);
      setWaitMessageSent(false);
      const recent = waitingTimeline
        .slice(-8)
        .filter((item) => item.kind === "message" && item.speaker === "mira")
        .slice(-3)
        .map((item) => item.text)
        .join(" ")
        .toLowerCase();
      const needsNotice = delay >= 120 && !/melde|schreib|dauern|zurück|verbindung unterbrochen/.test(recent);
      if (needsNotice) {
        setDeferredWaitSeconds(delay);
        setDeliveryQueue([{
          kind: "message",
          id: `absence-${currentNode.id}-${Date.now()}`,
          speaker: "mira",
          text: choice.acknowledgement ?? (
            delay >= 1800
              ? "Okay. Ich mache mich auf den Weg. Ich werde eine ganze Weile nicht schreiben können, aber ich melde mich, sobald ich wieder kann."
              : delay >= 600
                ? "Okay. Ich kümmere mich darum. Das kann eine Weile dauern – ich melde mich zwischendurch, wenn ich kann."
                : "Okay. Ich mache das jetzt. Gib mir ein paar Minuten, dann melde ich mich wieder."
          ),
          time: Date.now(),
        }]);
        setDeliveryPhase("idle");
      } else {
        setWaiting(true);
        setWaitUntil(Date.now() + delay * 1000);
        setWaitStartedAt(Date.now());
        setWaitDurationSeconds(delay);
        setRemainingSeconds(delay);
      }
    } else {
      enterNode(choice.next, nextState, waitingTimeline);
    }
  }

  function advance() {
    if (!currentNode?.next) return;
    const target = nodeMap.get(currentNode.next);
    const delay = transitionDelay(currentNode, target);
    const waitingTimeline = timeline;
    setTimeline(waitingTimeline);
    if (delay > 0) {
      setPendingNode(currentNode.next);
      setWaitMessageSent(false);
      const recent = waitingTimeline.slice(-3).map((item) => item.text).join(" ").toLowerCase();
      const needsNotice = delay >= 600 && !/melde|schreib|dauern|zurück|verbindung unterbrochen/.test(recent);
      if (needsNotice) {
        setDeferredWaitSeconds(delay);
        setDeliveryQueue([{
          kind: "message",
          id: `absence-${currentNode.id}-${Date.now()}`,
          speaker: "mira",
          text: delay >= 1800
            ? "Ich werde mich eine ganze Weile nicht melden können. Ich schreibe, sobald ich wieder kann."
            : "Das kann eine Weile dauern. Ich melde mich, sobald ich fertig bin.",
          time: Date.now(),
        }]);
        setDeliveryPhase("idle");
      } else {
        setWaiting(true);
        setWaitUntil(Date.now() + delay * 1000);
        setWaitStartedAt(Date.now());
        setWaitDurationSeconds(delay);
        setRemainingSeconds(delay);
      }
    } else {
      enterNode(currentNode.next, gameState, waitingTimeline);
    }
  }

  function skipWait() {
    if (!pendingNode) return;
    enterNode(pendingNode, gameState, timeline);
  }

  function rewindToDecision(snapshot: DecisionSnapshot) {
    setCurrentChapterId(snapshot.chapterId);
    setCurrentNodeId(snapshot.nodeId);
    setGameState(structuredClone(snapshot.gameState));
    setTimeline(structuredClone(snapshot.timeline));
    setDecisionHistory((history) =>
      history.slice(0, history.findIndex(({ id }) => id === snapshot.id)),
    );
    setWaiting(false);
    setPendingNode(null);
    setWaitUntil(null);
    setRemainingSeconds(0);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
    setDeferredWaitSeconds(null);
    setOverlay(null);
  }

  function sendWaitMessage(text: string) {
    if (!waiting || waitMessageSent) return;
    setTimeline((current) => [
      ...current,
      {
        kind: "reply",
        id: `wait-message-${Date.now()}`,
        text,
        time: Date.now(),
        status: "sent",
        waitCheckIn: true,
      },
    ]);
    setWaitMessageSent(true);
  }

  function flushDelivery() {
    if (!deliveryQueue.length) return;
    const now = Date.now();
    setTimeline((current) => [
      ...current,
      ...deliveryQueue.map((message, index) => ({ ...message, time: now + index })),
    ]);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
  }

  function updatePreference(kind: "sound" | "vibration", enabled: boolean) {
    localStorage.setItem(`funkstille-${kind}`, enabled ? "1" : "0");
    if (kind === "sound") setSoundEnabled(enabled);
    else setVibrationEnabled(enabled);
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
    if (currentNode.input.kind === "text") {
      const name = textInput.trim().slice(0, 24);
      if (!name) {
        setInputError("Bitte gib einen Namen oder ein Rufzeichen ein.");
        return;
      }
      setPlayerName(name);
      setGameState((state) => ({ ...state, player_name_known: true }));
    } else {
      const valid = currentNode.input.answers.some(
        (answer) => normalizeCode(answer) === normalizeCode(textInput),
      );
      if (!valid) {
        setInputError(currentNode.input.errorText ?? "Code abgelehnt.");
        return;
      }
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
    selectChoice(
      currentNode.input.kind === "text"
        ? {
            ...choice,
            label: textInput.trim(),
            effects: [
              ...(choice.effects ?? []),
              { state: "player_name_known", operation: "set", value: true },
            ],
          }
        : choice,
    );
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
    setDecisionHistory((history) => [
      ...history,
      {
        id: `${currentChapterId}-${currentNodeId}-gear-${Date.now()}`,
        chapterId: currentChapterId,
        nodeId: currentNodeId,
        choiceId: "gear",
        choiceLabel: `Ausrüstung: ${gearDraft.join(", ")}`,
        gameState: structuredClone(gameState),
        timeline: structuredClone(timeline),
      },
    ]);
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
        time: Date.now(),
        status: "sent",
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
    setWaitUntil(null);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
    setDeferredWaitSeconds(null);
    setCurrentChapterId(chapterId);
    setCurrentNodeId("");
    setTimeline([]);
    setOverlay(null);
  }

  function jumpToNode(nodeId: string) {
    setWaiting(false);
    setPendingNode(null);
    setWaitUntil(null);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
    setDeferredWaitSeconds(null);
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
      setDecisionHistory(snapshot.decisionHistory ?? []);
      setDeliveryQueue(snapshot.deliveryQueue ?? []);
      setDeliveryPhase("idle");
      setDeferredWaitSeconds(snapshot.deferredWaitSeconds ?? null);
      setWaiting(false);
      setPendingNode(null);
      setWaitUntil(null);
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
    setWaitUntil(null);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
    setDeferredWaitSeconds(null);
    setCurrentChapterId(storyIndex.startChapter);
    setCurrentNodeId("");
    setPlayerName("");
    setDecisionHistory([]);
    setProfileReady(true);
  }

  function continueChapter() {
    if (!currentNode?.handoff || !chapters[currentNode.handoff]) return;
    setWaiting(false);
    setPendingNode(null);
    setWaitUntil(null);
    setDeliveryQueue([]);
    setDeliveryPhase("idle");
    setDeferredWaitSeconds(null);
    setCurrentChapterId(currentNode.handoff);
    setCurrentNodeId("");
  }

  useEffect(() => {
    if (testMode || delivering || !currentNode?.handoff) return;
    const timer = window.setTimeout(() => continueChapter(), 900);
    return () => window.clearTimeout(timer);
  }, [currentNode?.handoff, delivering, testMode]);

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
  const signalLabel =
    gameState.relay_confiscated === true && gameState.relay_recovered !== true
      ? "VERBINDUNG VERLOREN"
      : gameState.relay_damaged === true
        ? "SCHWACHES SIGNAL"
        : "VERBUNDEN";
  const disconnected =
    gameState.relay_confiscated === true && gameState.relay_recovered !== true;
  const canSendCheckIn =
    waiting &&
    waitStartedAt !== null &&
    Date.now() - waitStartedAt >= 600000;

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
              {signalLabel}
            </div>
            <nav className="utility-nav" aria-label="Relaiswerkzeuge">
              <button type="button" onClick={() => setOverlay("archive")}>LOGS</button>
              <button type="button" onClick={() => setOverlay("map")}>KARTE</button>
              <button type="button" onClick={() => setOverlay("settings")}>OPTIONEN</button>
              {testMode && <button type="button" onClick={() => setOverlay("test")}>TEST</button>}
            </nav>
          </div>
        </header>

        {testMode && <div className="chapter-strip">
          <span>KAPITEL {String(story.chapter.number).padStart(2, "0")}</span>
          <strong>{story.chapter.title}</strong>
          <button type="button" onClick={restart} aria-label="Spiel neu starten">
            Neustart
          </button>
        </div>}

        <section
          className="transcript"
          aria-live="polite"
          ref={transcriptRef}
          onScroll={(event) => {
            const element = event.currentTarget;
            nearBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 90;
            if (nearBottomRef.current) setUnreadCount(0);
          }}
        >
          <div className="encryption-note">
            Zufällige Kopplung · Identität nicht verifiziert
          </div>

          {timeline.map((item, index) => (
            <div className="message-entry" key={item.id}>
              {item.time &&
                index > 0 &&
                timeline[index - 1].time &&
                item.time - (timeline[index - 1].time ?? 0) > 300000 && (
                  <time className="time-separator">{formatMessageTime(item.time)}</time>
                )}
              {item.kind === "reply" ? (
              <div className="row row-player">
                <div className="bubble bubble-player">
                  {item.text}
                  {item.status && (
                    <small className={`receipt receipt-${item.status}`} aria-label={
                      item.status === "read" ? "Gelesen" : item.status === "delivered" ? "Zugestellt" : "Gesendet"
                    }>
                      {item.status === "sent" ? "✓" : "✓✓"}
                    </small>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`row ${item.speaker === "system" ? "row-system" : ""}`}
              >
                {item.speaker !== "system" && (
                  <span className="speaker">
                    {item.speaker === "log" ? "DOKUMENT" : "MIRA"}
                  </span>
                )}
                <div
                  className={`bubble ${
                    item.speaker === "system"
                      ? "bubble-system"
                      : item.speaker === "log"
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
            )}
            </div>
          ))}

          {deliveryPhase === "typing" && (
            <div className="typing-presence">
              <div className="typing">
                <span />
                <span />
                <span />
              </div>
              <span>Mira schreibt …</span>
            </div>
          )}
          {sendingReply && <div className="sending-indicator">Nachricht wird gesendet …</div>}

          <div ref={bottomRef} />
          {unreadCount > 0 && (
            <button
              className="unread-button"
              type="button"
              onClick={() => {
                nearBottomRef.current = true;
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                setUnreadCount(0);
              }}
            >
              {unreadCount} neue Nachricht{unreadCount > 1 ? "en" : ""}
            </button>
          )}
        </section>

        <footer className="response-panel">
          {waiting && (
            <div className="wait-composer">
              {waitDurationSeconds >= 120 && (
                <div className="activity-status">
                  <span className="activity-pulse" />
                  {waitingActivity(nodeMap.get(pendingNode ?? ""), currentChapterId, disconnected)}
                </div>
              )}
              {canSendCheckIn && (
                <span>{waitMessageSent ? "Nachricht gesendet" : "Du kannst eine Nachricht hinterlassen."}</span>
              )}
              {canSendCheckIn && !waitMessageSent && (
                <div>
                  {["Geht es dir gut?", "Melde dich, wenn du kannst.", "Bitte antworte."].map((text) => (
                    <button type="button" key={text} onClick={() => sendWaitMessage(text)}>{text}</button>
                  ))}
                </div>
              )}
              {testMode && <button className="test-skip" type="button" onClick={skipWait}>TEST · WARTEZEIT ÜBERSPRINGEN</button>}
            </div>
          )}
          {!waiting && !delivering && deferredWaitSeconds === null && !sendingReply && currentNode?.input && (
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

          {!waiting && !delivering && deferredWaitSeconds === null && !sendingReply && currentNodeId === "k5_010_pack" && (
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

          {!waiting && !delivering && deferredWaitSeconds === null && !sendingReply &&
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

          {connectionEnded && !delivering && (currentNode?.ending || testMode) && (
            <div className="handoff">
              <span>
                {currentNode?.ending ? "Dein Ende" : "Testnavigation"}
              </span>
              {currentNode?.handoff && chapters[currentNode.handoff] ? (
                <button type="button" onClick={continueChapter}>
                  Nächste Szene
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
                <h2>{overlay === "archive" ? "Archiv" : overlay === "map" ? "Stationskarte" : overlay === "settings" ? "Optionen" : "Testmodus"}</h2>
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
                <nav className="map-tabs" aria-label="Kartenebene">
                  <button className={mapView === "station" ? "active" : ""} onClick={() => setMapView("station")}>GESAMT</button>
                  <button className={mapView === "quarters" ? "active" : ""} onClick={() => setMapView("quarters")}>WOHNTRAKT</button>
                  {gameState.lab_visited === true && <button className={mapView === "labor" ? "active" : ""} onClick={() => setMapView("labor")}>LABOR</button>}
                  {gameState.generator_visited === true && <button className={mapView === "generator" ? "active" : ""} onClick={() => setMapView("generator")}>GENERATOR</button>}
                </nav>
                {mapView === "station" ? (
                  <div className="map-grid station-map">
                    <div className="mountain">HÖHENZUG 812 M</div>
                    <div className="helipad"><span>H</span>LANDEPLATZ</div>
                    <div className="route route-main" />
                    <div className="route route-east" />
                    <div className="route route-south" />
                    <div className="safety-line">SICHERUNGSLEINE</div>
                    {MAP_AREAS.map((area) => {
                      const known = area.state === null || gameState[area.state] === true;
                      return (
                        <button
                          type="button"
                          className={`${known ? "map-room known" : "map-room"} shape-${area.shape}`}
                          key={area.id}
                          style={{ left: `${area.x}%`, top: `${area.y}%`, width: `${area.w}%`, height: `${area.h}%` }}
                          onClick={() => known && ["quarters", "labor", "generator"].includes(area.id) && setMapView(area.id as MapView)}
                        >
                          <span>{known ? area.label : "?"}</span>
                          {known && mapNotes(area.id, gameState).map((note) => <i key={note}>{note}</i>)}
                        </button>
                      );
                    })}
                    <div className="map-pin current" style={{ left: `${currentLocation.left}%`, top: `${currentLocation.top}%` }} aria-label="Miras aktueller Standort"><span /></div>
                  </div>
                ) : (
                  <div className="map-grid interior-map">
                    <div className="north">N ↑</div>
                    {BUILDING_ROOMS[mapView].map((room) => (
                      <div className={`interior-room room-${room.id}`} key={room.id} style={{ left: `${room.x}%`, top: `${room.y}%`, width: `${room.w}%`, height: `${room.h}%` }}>
                        <span>{room.label}</span>
                      </div>
                    ))}
                    <div className="door door-entry">EINGANG</div>
                    {currentLocation.area === mapView && (
                      <div className="map-pin current" style={{ left: `${currentLocation.interiorLeft}%`, top: `${currentLocation.interiorTop}%` }} aria-label={`Miras aktueller Standort: ${currentLocation.room}`}>
                        <span />
                      </div>
                    )}
                    {mapNotes(mapView, gameState).map((note, index) => <div className="map-marker note" key={note} style={{ top: `${68 + index * 7}%` }}>{note}</div>)}
                  </div>
                )}
                <p>Gestrichelte Bereiche sind nur aus Protokollen rekonstruiert. Personenmarkierungen zeigen den letzten bekannten Ort.</p>
              </div>
            )}

            {overlay === "settings" && (
              <div className="settings-panel">
                <label>
                  <span>Nachrichtenton</span>
                  <input type="checkbox" checked={soundEnabled} onChange={(event) => updatePreference("sound", event.target.checked)} />
                </label>
                <label>
                  <span>Vibration</span>
                  <input type="checkbox" checked={vibrationEnabled} onChange={(event) => updatePreference("vibration", event.target.checked)} />
                </label>
                <p>Beide Signale sind standardmäßig ausgeschaltet und gelten nur für dieses Gerät.</p>
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
                  <button type="button" onClick={flushDelivery} disabled={!deliveryQueue.length}>Nachrichten sofort anzeigen</button>
                  <button type="button" onClick={() => setSaveTransfer(localStorage.getItem(SAVE_KEY) ?? "")}>Spielstand exportieren</button>
                </div>
                <label>Entscheidungsverlauf · Auswahl zurücknehmen</label>
                <div className="decision-history">
                  {decisionHistory.length === 0 && <p>Noch keine Entscheidung in diesem Testlauf.</p>}
                  {[...decisionHistory].reverse().map((snapshot, reverseIndex) => (
                    <button type="button" key={snapshot.id} onClick={() => rewindToDecision(snapshot)}>
                      <span>{snapshot.choiceLabel}</span>
                      <b>{reverseIndex === 0 ? "LETZTE WAHL ÄNDERN" : "HIERHIN ZURÜCK"}</b>
                    </button>
                  ))}
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
