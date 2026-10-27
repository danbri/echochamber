// Verdict-aware test registration for the N3.js-style echo (CLAUDE.md rule 2).
//
// Every ported case has an id. A case with no entry in verdicts.json must
// meet the upstream expectation. A case with an entry (defect, divergence or
// gap) is an expected failure: the test passes while the case still fails,
// and fails loudly when the case starts passing, so the verdict is updated.
//
// ENTHIE_RECORD=<file> writes every case's raw outcome (pass/fail and the
// failure message) to <file> as JSON, for tools/enthie-study/triage.mjs.

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { test } from 'node:test';

const verdictsUrl = new URL('./verdicts.json', import.meta.url);
export const verdicts = JSON.parse(readFileSync(verdictsUrl, 'utf8')).cases;

const KINDS = new Set(['defect', 'divergence', 'gap']);
for (const [id, v] of Object.entries(verdicts)) {
  if (!KINDS.has(v.verdict)) throw new Error(`verdicts.json ${id}: unknown verdict ${v.verdict}`);
  if (v.verdict === 'defect' && !/^https:\/\/github\.com\/danbri\/factoidal\/issues\/\d+$/.test(v.issue || '')) {
    throw new Error(`verdicts.json ${id}: a defect needs an issue URL`);
  }
  if (v.verdict === 'divergence' && !v.spec) throw new Error(`verdicts.json ${id}: a divergence cites a section`);
  if (v.verdict === 'gap' && !v.gap) throw new Error(`verdicts.json ${id}: a gap names its gap-list entry`);
}

const record = process.env.ENTHIE_RECORD || null;

/** Run `body` (sync or async; throws on failure) under the verdict for `id`. */
export async function checkCase(id, body) {
  let failure = null;
  try {
    await body();
  } catch (e) {
    failure = e;
  }
  if (record) {
    appendFileSync(record, JSON.stringify({ id, pass: !failure,
      message: failure ? String(failure && failure.message || failure).slice(0, 400) : null }) + '\n');
  }
  const v = verdicts[id];
  if (!v) {
    if (failure) throw failure;
    return;
  }
  if (!failure) {
    throw new Error(`${id} now meets the upstream expectation, but verdicts.json records ` +
      `'${v.verdict}'${v.issue ? ` (${v.issue})` : ''}. Remove the verdict (and close or update the issue).`);
  }
}

/** A node:test test for case `id`. */
export function vtest(id, body) {
  const v = verdicts[id];
  const label = v ? `${id} [expected failure: ${v.verdict}${v.issue ? ' ' + v.issue : ''}${v.gap ? ' ' + v.gap : ''}]` : id;
  return test(label, () => checkCase(id, body));
}

/**
 * A mocha-shaped {describe, it} for suites written as runTests({factory, mocha}):
 * `it` registers a vtest whose id is prefix + the describe path + the name.
 */
export function mochaShim(prefix) {
  const path = [];
  return {
    describe(name, fn) { path.push(name); try { fn(); } finally { path.pop(); } },
    it(name, fn) { vtest([prefix, ...path, name].join(' > '), fn); },
  };
}

export function _writeJson(file, data) { writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); }
