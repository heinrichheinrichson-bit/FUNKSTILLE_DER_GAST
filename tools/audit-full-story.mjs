import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const schema = JSON.parse(await readFile(new URL("data/state-schema.json", root), "utf8"));
const index = JSON.parse(await readFile(new URL("data/story-index.json", root), "utf8"));
const chapters = new Map();

for (const entry of index.chapters) {
  const chapter = JSON.parse(await readFile(new URL(`data/${entry.file}`, root), "utf8"));
  const nodes = new Map(chapter.nodes.map((node) => [node.id, node]));
  chapters.set(entry.id, { ...chapter, nodes });
}

const defaults = Object.fromEntries(
  Object.entries(schema.states).map(([name, definition]) => [name, definition.default]),
);

function matches(requirements = [], state) {
  return requirements.every(({ state: name, operator, value }) => {
    const actual = state[name];
    if (operator === "eq") return actual === value;
    if (operator === "neq") return actual !== value;
    if (operator === "gt") return actual > value;
    if (operator === "gte") return actual >= value;
    if (operator === "lt") return actual < value;
    if (operator === "lte") return actual <= value;
    throw new Error(`Unknown operator ${operator}`);
  });
}

function apply(effects = [], state) {
  const next = structuredClone(state);
  for (const effect of effects) {
    const definition = schema.states[effect.state];
    if (effect.operation === "set") next[effect.state] = effect.value;
    else {
      let value = Number(next[effect.state]) + Number(effect.value);
      if (definition.minimum !== undefined) value = Math.max(value, definition.minimum);
      if (definition.maximum !== undefined) value = Math.min(value, definition.maximum);
      next[effect.state] = value;
    }
  }
  return next;
}

const usedByNode = new Map();
const successorsByNode = new Map();
for (const [chapterId, chapter] of chapters) {
  for (const node of chapter.nodes.values()) {
    const used = new Set();
    for (const requirement of [
      ...(node.redirects ?? []).flatMap((redirect) => redirect.requires ?? []),
      ...(node.choices ?? []).flatMap((choice) => choice.requires ?? []),
      ...(node.variants ?? []).flatMap((variant) => variant.requires ?? []),
    ]) used.add(requirement.state);
    const successors = [];
    if (node.next) successors.push(`${chapterId}:${node.next}`);
    for (const choice of node.choices ?? []) successors.push(`${chapterId}:${choice.next}`);
    for (const redirect of node.redirects ?? []) successors.push(`${chapterId}:${redirect.next}`);
    if (node.handoff) {
      const nextChapter = chapters.get(node.handoff);
      successors.push(`${node.handoff}:${nextChapter.chapter.startNode}`);
    }
    usedByNode.set(`${chapterId}:${node.id}`, used);
    successorsByNode.set(`${chapterId}:${node.id}`, successors);
  }
}
const liveByNode = new Map([...usedByNode].map(([id, used]) => [id, new Set(used)]));
let changed = true;
while (changed) {
  changed = false;
  for (const [id, successors] of successorsByNode) {
    const live = liveByNode.get(id);
    for (const successor of successors) {
      for (const stateName of liveByNode.get(successor) ?? []) {
        if (!live.has(stateName)) {
          live.add(stateName);
          changed = true;
        }
      }
    }
  }
}
function key(chapterId, nodeId, state) {
  const id = `${chapterId}:${nodeId}`;
  return `${id}|${[...(liveByNode.get(id) ?? [])].sort().map((name) => `${name}=${state[name]}`).join(";")}`;
}

const queue = [{
  chapterId: index.startChapter,
  nodeId: chapters.get(index.startChapter).chapter.startNode,
  state: defaults,
  length: 1,
}];
const visited = new Set();
const configurationsPerNode = new Map();
const endings = new Map();
const deadlocks = [];
let longest = 0;
const limit = 500000;
const perNodeLimit = 2500;
let cursor = 0;

while (cursor < queue.length) {
  if (visited.size > limit) throw new Error(`Configuration limit exceeded (${limit})`);
  const current = queue[cursor++];
  const chapter = chapters.get(current.chapterId);
  let node = chapter.nodes.get(current.nodeId);
  let state = apply(node.effects, current.state);
  let redirectDepth = 0;

  while (node.redirects?.length) {
    const redirect = node.redirects.find((candidate) => matches(candidate.requires, state));
    if (!redirect) {
      deadlocks.push(`${current.chapterId}:${node.id} has no matching redirect`);
      node = null;
      break;
    }
    state = apply(redirect.effects, state);
    node = chapter.nodes.get(redirect.next);
    state = apply(node.effects, state);
    if (++redirectDepth > 30) throw new Error(`Redirect loop at ${current.chapterId}:${current.nodeId}`);
  }
  if (!node) continue;

  const stateKey = key(current.chapterId, node.id, state);
  if (visited.has(stateKey)) continue;
  const nodeKey = `${current.chapterId}:${node.id}`;
  const nodeCount = configurationsPerNode.get(nodeKey) ?? 0;
  if (nodeCount >= perNodeLimit) continue;
  configurationsPerNode.set(nodeKey, nodeCount + 1);
  visited.add(stateKey);
  longest = Math.max(longest, current.length);

  if (node.ending) {
    endings.set(node.ending, (endings.get(node.ending) ?? 0) + 1);
    continue;
  }
  if (node.handoff) {
    const nextChapter = chapters.get(node.handoff);
    queue.push({
      chapterId: node.handoff,
      nodeId: nextChapter.chapter.startNode,
      state,
      length: current.length + 1,
    });
    continue;
  }
  if (node.next) {
    queue.push({ ...current, nodeId: node.next, state, length: current.length + 1 });
    continue;
  }
  const choices = (node.choices ?? []).filter((choice) => matches(choice.requires, state));
  if (!choices.length) {
    deadlocks.push(`${current.chapterId}:${node.id} has no available choice`);
    continue;
  }
  for (const choice of choices) {
    queue.push({
      ...current,
      nodeId: choice.next,
      state: apply(choice.effects, state),
      length: current.length + 1,
    });
  }
}

console.log(`Bounded full-story configurations: ${visited.size}`);
console.log(`Longest full path: ${longest} nodes`);
for (const [ending, count] of [...endings].sort()) console.log(`  ${ending}: ${count}`);

if (deadlocks.length || endings.size === 0) {
  if (deadlocks.length) console.error(`Deadlocks: ${deadlocks.join(", ")}`);
  if (endings.size === 0) console.error("No ending reached.");
  process.exitCode = 1;
} else {
  console.log("No deadlock found in bounded cross-chapter exploration.");
}
