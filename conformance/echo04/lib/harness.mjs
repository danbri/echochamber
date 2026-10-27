// Shared harness for the RDF4J-style echo's ported suites (echochamber
// CLAUDE.md rule 2). Original to echochamber, Apache-2.0.
//
// A case passes when the engine meets the RDF4J expectation. A case with no
// verdict must pass. A case with a verdict (defect, divergence, gap) must
// not pass: when it starts to pass the test fails, so the verdict is read
// again. There are no skips.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as core from '@factoidal/core';

export { core };
export const coreVersion = JSON.parse(readFileSync(new URL('../node_modules/@factoidal/core/package.json', import.meta.url))).version;

export const KINDS = new Set(['defect', 'divergence', 'gap']);

export function loadJson(url) { return JSON.parse(readFileSync(url, 'utf8')); }

/** Check a verdict file: every entry names a known case, a kind, and its evidence. */
export function checkVerdicts(verdicts, ids) {
  for (const [id, v] of Object.entries(verdicts.cases)) {
    assert.ok(ids.has(id), `verdict for unknown case ${id}`);
    assert.ok(KINDS.has(v.verdict), `${id}: verdict must be one of ${[...KINDS]}`);
    if (v.verdict === 'defect') assert.match(v.issue || '', /^https:\/\/github\.com\/danbri\/factoidal(-core)?\/issues\/\d+$/, `${id}: defect needs an issue URL`);
    if (v.verdict === 'divergence') assert.ok(v.spec, `${id}: divergence needs a specification section`);
    if (v.verdict === 'gap') assert.ok(v.reason, `${id}: gap needs a reason`);
  }
}

/** Assert the outcome of one case against its verdict. */
export function judge(id, outcome, verdicts) {
  const v = verdicts.cases[id];
  if (!v) {
    assert.ok(outcome.pass, `${id}: RDF4J expectation not met: ${outcome.detail || ''}`);
  } else {
    assert.ok(!outcome.pass, `${id}: now meets the RDF4J expectation; its ${v.verdict} verdict must be removed or revised` + (v.issue ? ` (${v.issue})` : ''));
  }
}

const XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';
const RDF_LANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';
const RS = 'http://www.w3.org/2001/sw/DataAccess/tests/result-set#';

/** A SPARQL Results JSON term as an RDF/JS term. */
export function srjTerm(t, bnodePrefix) {
  const df = core.dataFactory;
  if (t.type === 'uri') return df.namedNode(t.value);
  if (t.type === 'bnode') return df.blankNode(bnodePrefix + (t.value || 'empty'));
  if (t.type === 'literal' || t.type === 'typed-literal') {
    if (t['xml:lang']) return df.literal(t.value, t['xml:lang']);
    if (t.datatype && t.datatype !== XSD_STRING && t.datatype !== RDF_LANGSTRING) return df.literal(t.value, df.namedNode(t.datatype));
    return df.literal(t.value);
  }
  if (t.type === 'triple') {
    return df.quad(srjTerm(t.value.subject, bnodePrefix), srjTerm(t.value.predicate, bnodePrefix), srjTerm(t.value.object, bnodePrefix));
  }
  throw new Error('SRJ term type ' + t.type);
}

/**
 * A result set as an RDF graph in the DAWG result-set vocabulary, so that the
 * engine's isomorphism op decides result equality (blank nodes included).
 * rows: array of Map(var -> RDF/JS term), blank node labels already
 * prefixed by the caller so that they cannot meet the labels made here.
 * ordered: add rs:index.
 */
export function resultSetQuads(rows, ordered) {
  const df = core.dataFactory;
  const n = (l) => df.namedNode(RS + l);
  const rs = df.blankNode('rs'); const qs = [];
  qs.push(df.quad(rs, df.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), n('ResultSet')));
  // rs:resultVariable is not compared: RDF4J compares bindings only.
  rows.forEach((row, i) => {
    const s = df.blankNode('row' + i);
    qs.push(df.quad(rs, n('solution'), s));
    if (ordered) qs.push(df.quad(s, n('index'), df.literal(String(i + 1), df.namedNode('http://www.w3.org/2001/XMLSchema#integer'))));
    for (const [k, t] of row) {
      const b = df.blankNode(`row${i}b${k}`);
      qs.push(df.quad(s, n('binding'), b), df.quad(b, n('variable'), df.literal(k)), df.quad(b, n('value'), t));
    }
  });
  return qs;
}
