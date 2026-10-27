// Derived from RDFLib (https://github.com/RDFLib/rdflib, commit
// 58c3700e5e21b5b833d0e31072f930c665059db2), test/test_roundtrip.py and
// test/test_graph/test_variants.py. RDFLib: Copyright (c) 2002-2026, RDFLib
// Team. BSD 3-Clause License (see data/LICENSE-RDFLib).
// Changes: rewritten as node:test over the public API of @factoidal/core
// (parse, Dataset.serialize, Dataset.query, fromQuads, isomorphic); pytest
// xfail marks are replaced by verdicts.json (CLAUDE.md rule 2).
//
// Each case has an outcome: 'pass' or a failure tag. A case with no verdict
// must pass. A case with a verdict must fail: when it starts passing the
// test fails and says to remove the verdict.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as core from '@factoidal/core';
import { DATA, CORE_FORMAT, TRIPLE_ONLY, roundtripCases, invalidNtCases, variantGroups } from './cases.mjs';
import { PYTHON_VARIANTS } from './python-variants.mjs';

const VERDICTS = JSON.parse(readFileSync(new URL('./verdicts.json', import.meta.url), 'utf8')).cases;
const BASE = 'file:///rdflib/test/data/';
const read = (p) => readFileSync(join(DATA, p), 'utf8');

class Refused extends Error { constructor(tag, msg) { super(msg); this.tag = tag; } }

async function load(path, fmt, baseIRI) {
  const cf = CORE_FORMAT[fmt];
  if (!cf) throw new Refused('no-reader', `@factoidal/core has no ${fmt} reader`);
  try { return await core.parse(read(path), { format: cf, baseIRI }); }
  catch (e) { throw new Refused('parse-error', `${e.code ?? ''} ${e.message}`.slice(0, 300)); }
}

// RDFLib's triple-only serializers write the union of a ConjunctiveGraph's
// contexts. The union is asked of the engine (SPARQL), not built in JS.
const UNION = 'CONSTRUCT { ?s ?p ?o } WHERE { { ?s ?p ?o } UNION { GRAPH ?g { ?s ?p ?o } } }';

async function roundtrip(c) {
  const g1 = await load(c.path, c.infmt, BASE + c.path);
  const wf = CORE_FORMAT[c.testfmt];
  if (!wf) throw new Refused('no-writer', `@factoidal/core has no ${c.testfmt} writer`);
  const src = TRIPLE_ONLY.has(c.testfmt) ? await g1.query(UNION) : g1;
  let s;
  try { s = await src.serialize({ format: wf }); }
  catch (e) { throw new Refused('serialize-error', `${e.code ?? ''} ${e.message}`.slice(0, 300)); }
  let g2;
  try { g2 = await core.parse(s, { format: wf }); }
  catch (e) { throw new Refused('reparse-error', `${e.code ?? ''} ${e.message}`.slice(0, 300)); }
  if (!(await core.isomorphic(src, g2))) throw new Refused('not-isomorphic', `${src.size} vs ${g2.size} quads`);
}

async function negative(c) {
  try { await load(c.path, c.infmt, BASE + c.path); }
  catch (e) { if (e.tag === 'parse-error') return; throw e; }
  throw new Refused('accepted', 'invalid N-Triples accepted');
}

async function variantGraph(g, v) {
  if (v.fmt === 'python') return core.fromQuads(PYTHON_VARIANTS[g.key]());
  return load(v.path, v.fmt, g.meta.public_id ?? `example:rdflib:test:data:variant:${g.key}`);
}

function cases() {
  const out = [...roundtripCases(), ...invalidNtCases()];
  for (const g of variantGroups()) {
    if (g.metaFile) g.meta = JSON.parse(read(g.metaFile));
    const [ref, ...rest] = g.variants;
    out.push({ id: `variants/${g.key}/asserts${ref.vkey}`, kind: 'asserts', g, v: ref });
    for (const v of rest) out.push({ id: `variants/${g.key}/${ref.vkey}~${v.vkey}`, kind: 'variant', g, ref, v });
  }
  return out;
}

async function variantAsserts(c) {
  const ds = await variantGraph(c.g, c.v);
  const m = c.g.meta;
  if (m.quad_count != null && ds.size !== m.quad_count) throw new Refused('asserts', `quad_count ${ds.size} != ${m.quad_count}`);
  if (m.has_subject_iris) {
    const rows = await ds.query('SELECT DISTINCT ?s WHERE { { ?s ?p ?o } UNION { GRAPH ?g { ?s ?p ?o } } FILTER(isIRI(?s)) }');
    const got = rows.map((r) => r.get('s').value).sort();
    if (JSON.stringify(got) !== JSON.stringify([...m.has_subject_iris].sort())) throw new Refused('asserts', `subjects ${got}`);
  }
}

async function variant(c) {
  const a = await variantGraph(c.g, c.ref);
  const b = await variantGraph(c.g, c.v);
  if (!(await core.isomorphic(a, b))) throw new Refused('not-isomorphic', `${a.size} vs ${b.size} quads`);
}

const RUN = { roundtrip, negative, asserts: variantAsserts, variant };
const ALL = cases();
const outcomes = {};

test(`@factoidal/core version is pinned (${core.version})`, () => {
  const want = JSON.parse(readFileSync(new URL('./verdicts.json', import.meta.url), 'utf8')).factoidalCore;
  assert.equal(core.version, want);
});

for (const c of ALL) {
  test(c.id, async () => {
    let outcome = 'pass', detail = '';
    try { await RUN[c.kind](c); } catch (e) { if (!(e instanceof Refused)) throw e; outcome = e.tag; detail = e.message; }
    outcomes[c.id] = { outcome, detail };
    const v = VERDICTS[c.id];
    if (!v) assert.equal(outcome, 'pass', `${outcome}: ${detail}`);
    else {
      assert.notEqual(outcome, 'pass', `now passes: remove its ${v.verdict} verdict from verdicts.json`);
      if (v.outcome) assert.equal(outcome, v.outcome, `outcome changed (${detail})`);
    }
  });
}

test('every verdict names a case', () => {
  const ids = new Set(ALL.map((c) => c.id));
  for (const k of Object.keys(VERDICTS)) assert.ok(ids.has(k), `stale verdict ${k}`);
});

if (process.env.HARDYLIB_REPORT) test.after(() => writeFileSync(process.env.HARDYLIB_REPORT, JSON.stringify(outcomes, null, 1)));
