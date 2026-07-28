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
const chapterSeven = JSON.parse(
  await readFile(new URL("data/chapter-07.json", projectRoot), "utf8"),
);
const chapterEight = JSON.parse(
  await readFile(new URL("data/chapter-08.json", projectRoot), "utf8"),
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
  assert.equal(view.id, "k1_009_check_notice");

  view = session.advance();
  assert.equal(view.id, "k1_010_check_self");
  assert.equal(session.state.mira_wound_known, true);
  assert.equal(session.state.trust_mira, 1);

  view = session.advance();
  assert.equal(view.id, "k1_022_questions");
  assert.deepEqual(
    view.choices.map(({ id }) => id),
    ["ask_missing_identity", "ask_missing_location", "continue_intro"],
    "unanswered essential opening questions must remain available",
  );

  view = session.choose("ask_missing_identity");
  assert.equal(view.id, "k1_022_identity_answer");
  view = session.advance();
  assert.ok(
    !view.choices.some(({ id }) => id === "ask_missing_identity"),
    "answered opening questions must disappear",
  );

  view = session.choose("continue_intro");
  assert.equal(view.id, "k1_023_why_contact");

  view = session.choose("offer_support");
  assert.equal(view.id, "k1_024_support");
  assert.equal(session.state.trust_mira, 2);

  view = session.advance();
  assert.equal(view.id, "k1_025_name");

  view = session.choose("withhold_name");
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
  const state = createInitialState(schema);
  state.cure_material = 4;
  state.generator_state = "stable";
  const session = new StorySession({
    schema,
    chapter: chapterSeven,
    snapshot: {
      currentNodeId: chapterSeven.chapter.startNode,
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(view.id, "k7_010_synthesis");
  assert.equal(session.state.doses_available, 3);
  assert.equal(
    session.state.doses_remaining,
    3,
    "deep and old material with stable power must produce three doses",
  );
}

{
  const state = createInitialState(schema);
  state.weather_window_known = true;
  state.rescue_coordinates = true;
  state.evidence_level = 4;
  state.report_honesty = "full";
  state.evac_aksel = true;
  state.evac_thal = true;
  state.sample_preserved = true;
  const session = new StorySession({
    schema,
    chapter: chapterEight,
    snapshot: {
      currentNodeId: "k8_100_ending_resolver",
      nodeEntered: false,
      state,
      history: [],
    },
  });

  const view = session.enter();
  assert.equal(view.id, "k8_e_all_rescued");
  assert.equal(view.ending, "ending_all_rescued");
}

{
  const resolverCases = [
    ["ending_contained", { destruction_triggered: true, uncontrolled_evacuee: false }],
    ["ending_one_dose", { dose_hoarded: true, mira_treated: true }],
    ["ending_the_lie", { infection_source: "lab_aerosol", mira_treated: false, report_honesty: "false" }],
    ["ending_hidden_guest", { uncontrolled_evacuee: true }],
    ["ending_all_rescued", { evac_aksel: true, evac_thal: true, sample_preserved: true, evidence_level: 4 }],
    ["ending_clean_rescue", {}],
  ];

  for (const [expectedEnding, overrides] of resolverCases) {
    const state = Object.assign(createInitialState(schema), overrides);
    const session = new StorySession({
      schema,
      chapter: chapterEight,
      snapshot: {
        currentNodeId: "k8_100_ending_resolver",
        nodeEntered: false,
        state,
        history: [],
      },
    });
    assert.equal(session.enter().ending, expectedEnding);
  }

  for (const [chapterData, nodeId, expectedEnding] of [
    [chapterThree, "k3_073_whiteout_ending", "ending_whiteout"],
    [chapterFive, "k5_077_radio_silence", "ending_radio_silence"],
  ]) {
    const session = new StorySession({
      schema,
      chapter: chapterData,
      snapshot: {
        currentNodeId: nodeId,
        nodeEntered: false,
        state: createInitialState(schema),
        history: [],
      },
    });
    assert.equal(session.enter().ending, expectedEnding);
  }
}

{
  const session = makeSession();
  session.enter();
  session.choose("check_room");
  session.advance();
  session.choose("continue_intro");
  session.choose("offer_support");
  session.advance();
  session.choose("withhold_name");
  session.choose("location_not_helpful");
  session.advance();
  session.choose("supportive");
  session.advance();
  session.choose("hide_relay");
  session.choose("quarters_first");
  session.advance();
  session.choose("focus_quarters");
  session.advance();

  let view = session.view();
  assert.deepEqual(
    view.choices.map(({ id }) => id),
    ["search_canteen"],
  );

  view = session.choose("search_canteen");
  view = session.advance();
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
  session.choose("continue_intro");
  session.choose("offer_support");
  session.advance();
  session.choose("withhold_name");
  session.choose("location_not_helpful");
  session.advance();
  session.choose("supportive");
  session.advance();
  session.choose("hide_relay");
  session.choose("canteen_first");
  session.advance();
  session.advance();
  session.choose("search_quarters");
  session.advance();
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
