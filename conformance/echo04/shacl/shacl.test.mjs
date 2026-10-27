// Eclipse RDF4J's own data-driven SHACL test cases (the ShaclSail
// test-cases tree under core/sail/shacl/src/test/resources/test-cases, not
// RDF4J's copy of the W3C SHACL suite), run on @factoidal/core.
// Data: cases.json, derived from Eclipse RDF4J, Eclipse Distribution License
// 1.0 (BSD-3-Clause); see its _notice and the repository NOTICE. Verdicts: verdicts.json.
// This file is original to echochamber (Apache-2.0).
//
// The check is RDF4J's ShaclValidator runner (AbstractShaclTest
// runWithShaclValidator): sh:conforms equals the case's valid/invalid
// directory. RDF4J's report.ttl comparison is not asserted: its reports
// carry RDF4J-only triples (rsx:shapesGraph, rdf4j:truncated, copied shape
// descriptions); tools/echo04-study/shacl-report-iso.mjs measures it.
//
// Run: cd conformance/echo04 && node --test shacl/shacl.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coreVersion, loadJson, checkVerdicts, judge } from '../lib/harness.mjs';
import { runCase } from './run.mjs';

const doc = loadJson(new URL('./cases.json', import.meta.url));
const { cases, shapes, notPorted } = doc;
const verdicts = loadJson(new URL('./verdicts.json', import.meta.url));
const ids = new Set(cases.map((c) => c.id));

test(`RDF4J ShaclSail test cases: ${cases.length} cases, ${notPorted.length} not ported, @factoidal/core ${coreVersion}`, () => {
  checkVerdicts(verdicts, ids);
  assert.equal(ids.size, cases.length, 'case ids are unique');
  // 1,326 case directories at the pinned commit: every one is ported or listed.
  assert.equal(cases.length + notPorted.length, 1326, 'every case directory is ported or in notPorted');
  for (const x of notPorted) assert.ok(x.id && x.reason, 'notPorted entry needs an id and a reason');
  for (const c of cases) {
    assert.ok(Number.isInteger(c.shapes) && shapes[c.shapes], `${c.id}: shapes index`);
    assert.ok(c.updates.length > 0 && (c.expect === 'valid' || c.expect === 'invalid'), `${c.id}: incomplete case`);
  }
  for (const s of shapes) assert.ok(s.plans.length > 0, `${s.path}: no shapes-graph / data-graph plan`);
  for (const [id, v] of Object.entries(verdicts.cases)) assert.ok(verdicts.groups[v.group], `${id}: unknown group ${v.group}`);
});

for (const c of cases) {
  test(c.id + (verdicts.cases[c.id] ? ` [${verdicts.cases[c.id].verdict}]` : ''), async () => {
    judge(c.id, await runCase(c, shapes), verdicts);
  });
}
