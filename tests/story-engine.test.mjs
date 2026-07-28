import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  StoryDataError,
  StorySession,
  applyEffects,
  createInitialState,
} from "../src/story-engine.mjs";

const projectRoot = new URL("../", import.meta.url);
const schema = JSON.parse(
  await readFile(new URL("data/state-schema.json", projectRoot), "utf8"),
);
const chapter = JSON.parse(
  await readFile(new URL("data/chapter-01.json", projectRoot), "utf8"),
);
const chapterTwo = JSON.parse(
  await readFile(new URL("data/chapter-02.json", projectRoot), "utf8"),
);
const chapterThree = JSON.parse(
  await readFile(new URL("data/chapter-03.json", projectRoot), "utf8"),
);
const chapterFour = JSON.parse(
  await readFile(new URL("data/chapter-04.json", projectRoot), "utf8"),
);
const chapterFive = JSON.parse(
  await readFile(new URL("data/chapter-05.json", projectRoot), "utf8"),
);
const chapterSix = JSON.parse(
  await readFile(new URL("data/chapter-06.json", projectRoot), "utf8"),
);

function makeSession() {
  return new StorySession({ schema, chapter });
}

{
  const state = createInitialState(schema);
  assert.equal(state.trust_mira, 0);
  assert.equal(state.infection_source, "none");

  applyEffects(
    [{ state: "trust_mira", operation: "add", value: 99 }],
    state,
    schema,
  );
  assert.equal(state.trust_mira, 2, "integer effects must clamp to schema limits");
}

{
  const session = makeSession();
  let view = session.enter();
  assert.equal(view.id, "k1_001_signal");
  assert.equal(view.choices.length, 3);

  view = session.choose("check_self");
  assert.equal(view.id, "k1_010_check_self");
  assert.equal(session.state.mira_wound_known, true);
  assert.equal(session.state.trust_mira, 1);

  view = session.advance();
  assert.equal(view.id, "k1_030_identity");
}

{
  const state = createInitialState(schema);
  state.first_route = "generator";
  const session = new StorySession({
    schema,
    chapter: chapterTwo,
    snapshot: {
      currentNodeId: chapterTwo.chapter.startNode,
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.deepEqual(
    view.choices.map(({ id }) => id),
    ["begin_generator"],
    "chapter two must resume the route selected in chapter one",
  );
}

{
  const state = createInitialState(schema);
  state.first_route = "labor";
  state.aksel_restrained = false;
  const session = new StorySession({
    schema,
    chapter: chapterThree,
    snapshot: {
      currentNodeId: chapterThree.chapter.startNode,
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(view.id, "k3_010_rest");
  assert.equal(
    session.state.aksel_state,
    "infected",
    "the unaccompanied generator route must resolve Aksel's hidden exposure",
  );
  assert.ok(
    session.history.some(({ type }) => type === "redirect"),
    "hidden redirects must be recorded without becoming visible nodes",
  );
}

{
  const state = createInitialState(schema);
  state.global_time = 4;
  state.generator_state = "unstable";
  const session = new StorySession({
    schema,
    chapter: chapterFour,
    snapshot: {
      currentNodeId: chapterFour.chapter.startNode,
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(view.id, "k4_010_briefing");
  assert.equal(
    session.state.thal_state,
    "dead",
    "high time cost plus unstable heating must resolve Thal's fate",
  );
}

{
  const state = createInitialState(schema);
  state.global_time = 8;
  const session = new StorySession({
    schema,
    chapter: chapterFive,
    snapshot: {
      currentNodeId: chapterFive.chapter.startNode,
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(view.id, "k5_010_pack");
  assert.equal(
    session.state.kader_state,
    "changed",
    "late arrival must resolve Kader's changed state",
  );
}

{
  const state = createInitialState(schema);
  state.pack_heat = true;
  state.item_generator_tool = true;
  const session = new StorySession({
    schema,
    chapter: chapterSix,
    snapshot: {
      currentNodeId: "k6_020_descent_gate",
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(
    view.id,
    "k6_030_descent_safe",
    "heat and anchoring equipment must unlock the controlled descent",
  );
}

{
  const session = makeSession();
  session.enter();
  session.choose("check_room");
  session.advance();
  session.choose("location_not_helpful");
  session.advance();
  session.choose("supportive");
  session.advance();
  session.choose("quarters_first");

  let view = session.view();
  assert.deepEqual(
    view.choices.map(({ id }) => id),
    ["search_canteen"],
  );

  view = session.choose("search_canteen");
  assert.deepEqual(
    view.choices.map(({ id }) => id),
    ["continue_after_both"],
  );
}

{
  const session = makeSession();
  session.enter();
  session.choose("check_room");
  session.advance();
  session.choose("location_not_helpful");
  session.advance();
  session.choose("supportive");
  session.advance();
  session.choose("canteen_first");
  session.choose("search_quarters");
  session.choose("continue_after_both");
  session.choose("observe");
  session.advance();

  const view = session.view();
  assert.equal(view.id, "k1_100_aksel");
  assert.ok(
    view.messages.some(({ text }) => text.includes("Nicht Ruß. Bohrstaub")),
    "observing Aksel must select the specific text variant",
  );
}

{
  const session = makeSession();
  session.enter();
  session.choose("check_self");
  const snapshot = session.serialize();
  const restored = new StorySession({ schema, chapter, snapshot });

  assert.equal(restored.currentNodeId, session.currentNodeId);
  assert.deepEqual(restored.state, session.state);
  assert.deepEqual(restored.view(), session.view());
}

{
  const session = makeSession();
  assert.throws(
    () => session.choose("missing"),
    StoryDataError,
    "choosing before entering must fail",
  );
}

console.log("story-engine tests passed");
