import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Funkstille shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>FUNKSTILLE: DER GAST<\/title>/i);
  assert.match(html, /Suche offene Frequenz/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("ships chapter data and production metadata", async () => {
  const [chapter, chapterTwo, chapterThree, chapterFour, chapterFive, index, schema, page, layout] = await Promise.all([
    readFile(new URL("../public/data/chapter-01.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/chapter-02.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/chapter-03.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/chapter-04.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/chapter-05.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/story-index.json", import.meta.url), "utf8"),
    readFile(new URL("../public/data/state-schema.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  const chapterData = JSON.parse(chapter);
  const chapterTwoData = JSON.parse(chapterTwo);
  const chapterThreeData = JSON.parse(chapterThree);
  const chapterFourData = JSON.parse(chapterFour);
  const chapterFiveData = JSON.parse(chapterFive);
  const indexData = JSON.parse(index);
  const schemaData = JSON.parse(schema);

  assert.equal(chapterData.chapter.startNode, "k1_001_signal");
  assert.equal(chapterData.nodes.length, 27);
  assert.equal(chapterTwoData.nodes.length, 36);
  assert.equal(chapterThreeData.nodes.length, 31);
  assert.equal(chapterFourData.nodes.length, 38);
  assert.equal(chapterFiveData.nodes.length, 30);
  assert.deepEqual(
    indexData.chapters.map(({ id }) => id),
    ["chapter_01", "chapter_02", "chapter_03", "chapter_04", "chapter_05"],
  );
  assert.equal(schemaData.states.infection_source.visibility, "secret");
  assert.match(page, /Station Kaldstad/);
  assert.match(page, /localStorage/);
  assert.match(layout, /lang="de"/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
});
