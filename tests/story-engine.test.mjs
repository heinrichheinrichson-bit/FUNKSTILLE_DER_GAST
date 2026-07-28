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

