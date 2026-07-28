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
type StoryNode = {
  id: string;
  chapter: number;
  delaySeconds?: number;
  nextDelaySeconds?: number;
  messages?: Message[];
  effects?: Effect[];
  choices?: Choice[];
  variants?: Variant[];
  next?: string;
  handoff?: string;
  ending?: string;
};
type StoryDocument = {
  chapter: { id: string; number: number; title: string; startNode: string };
  nodes: StoryNode[];
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
  if (seconds < 60) return `${seconds Sek.`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} Min.`;
}

export default function Home() {
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [schema, setSchema] = useState<StateSchema | null>(null);
  const [gameState, setGameState] = useState<GameState>({});
  const [currentNodeId, setCurrentNodeId] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [pendingNode, setPendingNode] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const nodeMap = useMemo(
    () => new Map(story?.nodes.map((node) => [node.id, node]) ?? []),
    [story],
  );
  const currentNode = nodeMap.get(currentNodeId);

  const enterNode = useCallback(
    (nodeId: string, baseState: GameState, baseTimeline: TimelineItem[]) => {
      if (!schema) return;
      const node = nodeMap.get(nodeId);
      if (!node) return;
      const nextState = applyEffects(baseState, node.effects, schema);
      const additions: TimelineItem[] = resolveMessages(node, nextState).map(
        (message, index) => ({
          kind: "message",
          id: `${node.id}-${index}-${baseTimeline.length}`,
          speaker: message.speaker,
          text: message.text,
        }),
      );
      setGameState(nextState);
      setTimeline([...baseTimeline, ...additions]);
      setCurrentNodeId(nodeId);
      setWaiting(false);
      setPendingNode(null);
    },
    [nodeMap, schema],
  );

  useEffect(() => {
    Promise.all([
      fetch("/data/chapter-01.json").then((response) => response.json()),
      fetch("/data/state-schema.json").then((response) => response.json()),
    ]).then(([storyData, schemaData]: [StoryDocument, StateSchema]) => {
      setStory(storyData);
      setSchema(schemaData);
    });
  }, []);

  useEffect(() => {
    if (!story || !schema || restored) return;
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const snapshot = JSON.parse(saved);
        setGameState(snapshot.gameState);
        setCurrentNodeId(snapshot.currentNodeId);
        setTimeline(snapshot.timeline);
        setRestored(true);
        return;
      } catch {
        localStorage.removeItem(SAVE_KEY);
      }
    }
    const initialState = makeInitialState(schema);
    setRestored(true);
    enterNode(story.chapter.startNode, initialState, []);
  }, [enterNode, restored, schema, story]);

  useEffect(() => {
    if (!restored || !currentNodeId) return;
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ gameState, currentNodeId, timeline }),
    );
  }, [currentNodeId, gameState, restored, timeline]);

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

  function restart() {
    if (!story || !schema) return;
    localStorage.removeItem(SAVE_KEY);
    const initialState = makeInitialState(schema);
    setTimeline([]);
    setGameState(initialState);
    setWaiting(false);
    setPendingNode(null);
    enterNode(story.chapter.startNode, initialState, []);
  }

  if (!story || !schema || !restored) {
    return (
      <main className="loading-screen">
        <div className="signal-mark" />
        <p>Suche offene Frequenz …</p>
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
          <div className="connection">
            <span className="connection-dot" />
            VERBUNDEN
          </div>
        </header>

        <div className="chapter-strip">
          <span>KAPITEL 01</span>
          <strong>Die Verbindung</strong>
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
                      : item.speaker.toUpperCase()}
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
          {!waiting &&
            availableChoices.map((choice) => (
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
              <span>Kapitel abgeschlossen</span>
              <strong>
                {currentNode?.handoff === "chapter_02_labor"
                  ? "Weiter: Laborflügel"
                  : "Weiter: Generatorhaus"}
              </strong>
            </div>
          )}
        </footer>
      </section>
    </main>
  );
}
