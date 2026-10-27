// Eclipse RDF4J's hand-written SPARQL compliance tests (testsuites/sparql,
// the Java classes under org.eclipse.rdf4j.testsuite.sparql.tests and
// SPARQLUpdateTest), ported as data and run on @factoidal/core.
// Data: cases.json, derived from Eclipse RDF4J, Eclipse Distribution License
// 1.0 (BSD-3-Clause); see its _notice and the repository NOTICE. Verdicts: verdicts.json.
// This file is original to echochamber (Apache-2.0).
//
// Run: cd conformance/moonforge && node --test compliance/compliance.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coreVersion, loadJson, checkVerdicts, judge } from '../lib/harness.mjs';
import { runCase } from './run.mjs';

const doc = loadJson(new URL('./cases.json', import.meta.url));
const { cases, notPorted } = doc;
const verdicts = loadJson(new URL('./verdicts.json', import.meta.url));
const ids = new Set(cases.map((c) => c.id));

test(`RDF4J compliance tests: ${cases.length} cases, ${notPorted.length} not ported, @factoidal/core ${coreVersion}`, () => {
  checkVerdicts(verdicts, ids);
  assert.equal(ids.size, cases.length, 'case ids are unique');
  const methods = new Set([...cases.map((c) => c.id.split('#').slice(0, 2).join('#')), ...notPorted.map((x) => x.id)]);
  assert.equal(methods.size, doc.methodCount, 'every upstream test method is ported or listed in notPorted');
  for (const x of notPorted) assert.ok(x.reason && x.file, `${x.id}: notPorted needs a file and a reason`);
  for (const c of cases) assert.ok(c.file && Number.isInteger(c.line) && c.expect && (c.query || c.update), `${c.id}: incomplete case`);
});

for (const c of cases) {
  test(c.id + (verdicts.cases[c.id] ? ` [${verdicts.cases[c.id].verdict}]` : ''), async () => {
    judge(c.id, await runCase(c), verdicts);
  });
}
