// RDF4J's own SPARQL query evaluation manifests (testcases-sparql-1.1 and
// testcases-sparql-1.2, not the W3C copies), run on @factoidal/core.
// Data: cases.json, derived from Eclipse RDF4J, Eclipse Distribution License
// 1.0 (BSD-3-Clause); see its _notice and the repository NOTICE. Verdicts: verdicts.json.
// This file is original to echochamber (Apache-2.0).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { core, coreVersion, loadJson, checkVerdicts, judge, srjTerm, resultSetQuads } from '../lib/harness.mjs';

const { cases, excluded } = loadJson(new URL('./cases.json', import.meta.url));
const verdicts = loadJson(new URL('./verdicts.json', import.meta.url));
const ids = new Set(cases.map((c) => c.id));

const prefixTerm = (t, p) => (t.termType === 'BlankNode' ? core.dataFactory.blankNode(p + t.value) : t);

export async function runCase(c) {
  const ds = await core.openDataset(c.data ? { text: c.data.text, format: c.data.format, baseIRI: c.data.base } : '', c.data ? undefined : { format: 'turtle' });
  let actual;
  try {
    actual = await ds.query(`BASE <${c.query.base}>\n` + c.query.text, { version: c.sparql12 ? '1.2' : '1.1' });
  } catch (e) {
    return { pass: false, detail: `${e.code}: ${e.message}` };
  } finally { /* ds kept for GC */ }
  const exp = c.result;
  if (exp.kind === 'boolean') return { pass: actual === exp.value, detail: `got ${actual}` };
  if (!Array.isArray(actual)) return { pass: false, detail: 'not a SELECT result' };
  const expRows = exp.bindings.map((r) => new Map(Object.entries(r).map(([k, t]) => [k, srjTerm(t, 'e_')])));
  const actRows = actual.map((m) => new Map([...m].map(([k, t]) => [k, prefixTerm(t, 'a_')])));
  if (expRows.length !== actRows.length) return { pass: false, detail: `rows: expected ${expRows.length}, got ${actRows.length}` };
  const a = await core.fromQuads(resultSetQuads(actRows, c.checkOrder));
  const b = await core.fromQuads(resultSetQuads(expRows, c.checkOrder));
  const same = await core.isomorphic(a, b);
  return { pass: same, detail: same ? '' : 'result sets differ: got ' + JSON.stringify(actual.map((m) => Object.fromEntries([...m].map(([k, t]) => [k, t.value])))).slice(0, 400) };
}

test(`RDF4J SPARQL manifests: ${cases.length} cases, @factoidal/core ${coreVersion}`, () => {
  checkVerdicts(verdicts, ids);
  for (const x of excluded) assert.ok(x.reason, 'excluded manifest needs a reason');
});

for (const c of cases) {
  test(c.id + (verdicts.cases[c.id] ? ` [${verdicts.cases[c.id].verdict}]` : ''), async () => {
    judge(c.id, await runCase(c), verdicts);
  });
}
