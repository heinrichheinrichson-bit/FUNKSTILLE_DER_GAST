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
  const bottomRef = useRef<HTMLDivElement>(null);

  const story = chapters[currentChapterId] ?? null;
  const nodeMap = useMemo(
    () => new Map(story?.nodes.map((node) => [node.id, node]) ?? []),
    [story],
  );
  const currentNode = nodeMap.get(currentNodeId);

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
          text: message.text,
        }),
      );
      setGameState(nextState);
      setTimeline([...baseTimeline, ...additions]);
      setCurrentNodeId(node.id);
      setWaiting(false);
      setPendingNode(null);
    },
    [nodeMap, schema],
  );

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
  }, [restored, schema, storyIndex]);

  useEffect(() => {
    if (!restored || !story || !schema || currentNodeId) return;
    enterNode(story.chapter.startNode, gameState, timeline);
  }, [
    currentNodeId,
    enterNode,
    gameState,
    restored,
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
      }),
    );
  }, [currentChapterId, currentNodeId, gameState, restored, timeline]);

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
    if (!storyIndex || !schema) return;
    localStorage.removeItem(SAVE_KEY);
    const initialState = makeInitialState(schema);
    setTimeline([]);
    setGameState(initialState);
    setWaiting(false);
    setPendingNode(null);
    setCurrentChapterId(storyIndex.startChapter);
    setCurrentNodeId("");
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
              {currentNode?.handoff && chapters[currentNode.handoff] ? (
                <button type="button" onClick={continueChapter}>
                  Weiter: {chapters[currentNode.handoff].chapter.title}
                </button>
              ) : (
                <strong>Fortsetzung folgt</strong>
              )}
            </div>
          )}
        </footer>
      </section>
    </main>
  );
}
