// leana conformance harness: runs one ported Jena test method under its
// verdict (echochamber CLAUDE.md rule 2). Apache License 2.0. Written for
// echochamber; no Jena code.
//
// A method with no verdict must pass. A method with a verdict must FAIL, and
// a test that starts passing fails loudly so that its verdict is removed:
//   defect     Factoidal is wrong: `issue` (danbri/factoidal URL) required
//   divergence Jena extends or differs from the specification: `spec` required
//   gap        leana does not do it: `gap` (a key of GAPS) required; the failure
//              must be a LeanaUnsupportedError of that gap, or, with
//              "noThrow": true, an assertion failure (the gap gives a different answer)
// Verdicts live in conformance/leana/verdicts/<Class>.json as
//   { "<method>": { "verdict": "...", "issue"|"spec"|"gap": "...", "note": "..." } }
// No skips.

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { LeanaUnsupportedError, GAPS } from '@factoidal/leana';

const VERDICT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'verdicts');

export function loadVerdicts(cls) {
  const f = join(VERDICT_DIR, cls + '.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
}

function checkVerdictShape(cls, name, v) {
  const where = `${cls}.${name}`;
  assert.ok(['defect', 'divergence', 'gap'].includes(v.verdict), `${where}: verdict must be defect, divergence or gap`);
  if (v.verdict === 'defect') assert.match(v.issue || '', /^https:\/\/github\.com\/danbri\/factoidal\/issues\/\d+$/, `${where}: a defect needs an issue URL`);
  if (v.verdict === 'divergence') assert.ok(typeof v.spec === 'string' && v.spec.length > 0, `${where}: a divergence needs a spec section`);
  if (v.verdict === 'gap') assert.ok(v.gap in GAPS, `${where}: a gap needs a GAPS key, got ${v.gap}`);
}

/**
 * describeJena('TestNode', 'jena-core/.../TestNode.java', (t) => { t('testBlanks', () => {...}); })
 * Each t(name, fn) is one ported Jena test method.
 */
export function describeJena(cls, source, body) {
  const verdicts = loadVerdicts(cls);
  const used = new Set();
  describe(`${cls} (${source})`, () => {
    const t = (name, fn) => {
      const v = verdicts[name];
      if (v) used.add(name);
      const record = () => {
        if (process.env.LEANA_RESULTS) {
          appendFileSync(process.env.LEANA_RESULTS, JSON.stringify({ cls, source, method: name, result: v ? v.verdict : 'pass', gap: v && v.gap, noThrow: !!(v && v.noThrow), issue: v && v.issue }) + '\n');
        }
      };
      test(name, async () => {
        if (!v) { await fn(); record(); return; }
        checkVerdictShape(cls, name, v);
        let err = null;
        try { await fn(); } catch (e) { err = e; }
        if (err === null) {
          assert.fail(`${cls}.${name} now passes: remove its ${v.verdict} verdict from verdicts/${cls}.json`);
        }
        if (v.verdict === 'gap') {
          // noThrow: the gap shows as a different answer (an assertion failure), not as a
          // LeanaUnsupportedError; for example a term-matching Model answering false where
          // Jena's value-matching Model answers true.
          const ok = (err instanceof LeanaUnsupportedError && err.gap === v.gap) ||
            (v.noThrow === true && err instanceof assert.AssertionError);
          assert.ok(ok,
            `${cls}.${name}: gap verdict '${v.gap}' but the failure is: ${err && err.stack}`);
        }
        record();
      });
    };
    body(t);
    after(() => {
      const stale = Object.keys(verdicts).filter((k) => !used.has(k));
      assert.deepEqual(stale, [], `${cls}: verdicts with no ported test`);
    });
  });
}
