// RDF4J's own Rio parser tests (core/rio/*/src/test/java: TurtleParserTest,
// CustomTurtleParserTest, the N-Triples, N-Quads, TriG, RDF/XML and JSON-LD
// parser tests, AbstractParserHandlingTest, BaseURIHandlingTest,
// ResolveUriTest; not the W3C test-suite copies), hand-ported and run on
// @factoidal/core. Cases: cases.json, derived from Eclipse RDF4J, Eclipse
// Distribution License 1.0 (BSD-3-Clause); see its _notice and the repository NOTICE.
// Verdicts: verdicts.json. This file is original to echochamber (Apache-2.0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coreVersion, loadJson, checkVerdicts, judge } from '../lib/harness.mjs';
import { runCase } from './rio-case.mjs';

const data = loadJson(new URL('./cases.json', import.meta.url));
const { cases, notPorted, perFile, counts } = data;
const verdicts = loadJson(new URL('./verdicts.json', import.meta.url));
const ids = new Set(cases.map((c) => c.id));

test(`RDF4J Rio parser tests: ${cases.length} cases, ${notPorted.length} methods not ported, @factoidal/core ${coreVersion}`, () => {
  checkVerdicts(verdicts, ids);
  assert.equal(ids.size, cases.length, 'case ids are unique');
  for (const x of notPorted) assert.ok(x.reason && x.file && x.id, `${x.id}: a method not ported needs a reason`);
  for (const x of data.filesNotTaken) assert.ok(x.reason, `${x.file}: a file not taken needs a reason`);
  // Every test method of every file taken is ported or listed.
  for (const f of perFile) assert.equal(f.ported + f.notPorted, f.methods, `${f.class}: methods ported + not ported`);
  assert.equal(counts.cases, cases.length);
  assert.equal(counts.notPorted, notPorted.length);
  assert.equal(counts.parserMethods, counts.ported + counts.notPorted);
  for (const c of cases) {
    assert.ok(['reject', 'graph', 'count'].includes(c.expect.kind), `${c.id}: expect kind`);
    assert.equal(typeof c.input, 'string', `${c.id}: input`);
  }
});

for (const c of cases) {
  test(c.id + (verdicts.cases[c.id] ? ` [${verdicts.cases[c.id].verdict}]` : ''), async () => {
    judge(c.id, await runCase(c), verdicts);
  });
}
