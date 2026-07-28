export class StoryDataError extends Error {}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefinition(schema, stateName) {
  const definition = schema.states[stateName];
  if (!definition) {
    throw new StoryDataError(`Unknown state: ${stateName}`);
  }
  return definition;
}

export function createInitialState(schema) {
  return Object.fromEntries(
    Object.entries(schema.states).map(([name, definition]) => [
      name,
      clone(definition.default),
    ]),
  );
}

export function conditionMatches(condition, state) {
  const actual = state[condition.state];
  const expected = condition.value;

  switch (condition.operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
    default:
      throw new StoryDataError(`Unknown condition operator: ${condition.operator}`);
  }
}

export function requirementsMatch(requirements = [], state) {
  return requirements.every((condition) => conditionMatches(condition, state));
}

export function applyEffects(effects = [], state, schema) {
  for (const effect of effects) {
    const definition = getDefinition(schema, effect.state);

    if (effect.operation === "set") {
      state[effect.state] = clone(effect.value);
      continue;
    }

    if (effect.operation !== "add") {
      throw new StoryDataError(`Unknown effect operation: ${effect.operation}`);
    }

    let value = state[effect.state] + effect.value;
    if (definition.minimum !== undefined) {
      value = Math.max(definition.minimum, value);
    }
    if (definition.maximum !== undefined) {
      value = Math.min(definition.maximum, value);
    }
    state[effect.state] = value;
  }
}

function renderMessages(node, state) {
  let messages = clone(node.messages ?? []);

  for (const variant of node.variants ?? []) {
    if (!requirementsMatch(variant.requires ?? [], state)) continue;
    if (variant.replaceMessages) {
      messages = clone(variant.replaceMessages);
    }
    if (variant.prependMessages) {
      messages = [...clone(variant.prependMessages), ...messages];
    }
    if (variant.appendMessages) {
      messages = [...messages, ...clone(variant.appendMessages)];
    }
  }

  return messages;
}

export class StorySession {
  constructor({ schema, chapter, snapshot = null }) {
    this.schema = clone(schema);
    this.chapter = clone(chapter);
    this.nodes = new Map(chapter.nodes.map((node) => [node.id, clone(node)]));

    if (snapshot) {
      this.state = clone(snapshot.state);
      this.currentNodeId = snapshot.currentNodeId;
      this.nodeEntered = Boolean(snapshot.nodeEntered);
      this.history = clone(snapshot.history ?? []);
    } else {
      this.state = createInitialState(schema);
      this.currentNodeId = chapter.chapter.startNode;
      this.nodeEntered = false;
      this.history = [];
    }

    if (!this.nodes.has(this.currentNodeId)) {
      throw new StoryDataError(`Unknown current node: ${this.currentNodeId}`);
    }
  }

  get currentNode() {
    return this.nodes.get(this.currentNodeId);
  }

  enter() {
    const node = this.currentNode;

    if (!this.nodeEntered) {
      applyEffects(node.effects ?? [], this.state, this.schema);
      this.nodeEntered = true;
      this.history.push({ type: "enter", nodeId: node.id });
    }

    return this.view();
  }

  view() {
    if (!this.nodeEntered) {
      throw new StoryDataError("Call enter() before reading the current node.");
    }

    const node = this.currentNode;
    const choices = (node.choices ?? [])
      .filter((choice) => requirementsMatch(choice.requires ?? [], this.state))
      .map(({ id, label }) => ({ id, label }));

    return {
      id: node.id,
      chapter: node.chapter,
      delaySeconds: node.delaySeconds ?? 0,
      messages: renderMessages(node, this.state),
      choices,
      canAdvance: Boolean(node.next),
      nextDelaySeconds: node.nextDelaySeconds ?? 0,
      handoff: node.handoff ?? null,
      ending: node.ending ?? null,
    };
  }

  choose(choiceId) {
    if (!this.nodeEntered) {
      throw new StoryDataError("Call enter() before choosing.");
    }

    const node = this.currentNode;
    const choice = (node.choices ?? []).find(({ id }) => id === choiceId);
    if (!choice) {
      throw new StoryDataError(`Unknown choice '${choiceId}' at '${node.id}'.`);
    }
    if (!requirementsMatch(choice.requires ?? [], this.state)) {
      throw new StoryDataError(`Choice '${choiceId}' is not available.`);
    }

    applyEffects(choice.effects ?? [], this.state, this.schema);
    this.history.push({ type: "choice", nodeId: node.id, choiceId });
    this.moveTo(choice.next);
    return this.enter();
  }

  advance() {
    if (!this.nodeEntered) {
      throw new StoryDataError("Call enter() before advancing.");
    }
    if (!this.currentNode.next) {
      throw new StoryDataError(`Node '${this.currentNodeId}' has no automatic next node.`);
    }

    this.history.push({
      type: "advance",
      nodeId: this.currentNodeId,
      nextNodeId: this.currentNode.next,
    });
    this.moveTo(this.currentNode.next);
    return this.enter();
  }

  moveTo(nodeId) {
    if (!this.nodes.has(nodeId)) {
      throw new StoryDataError(`Unknown target node: ${nodeId}`);
    }
    this.currentNodeId = nodeId;
    this.nodeEntered = false;
  }

  serialize() {
    return clone({
      version: 1,
      chapterId: this.chapter.chapter.id,
      currentNodeId: this.currentNodeId,
      nodeEntered: this.nodeEntered,
      state: this.state,
      history: this.history,
    });
  }
}

