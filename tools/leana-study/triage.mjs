// Run the leana conformance suite in triage mode (every ported method runs
// with no verdict) and compare each outcome with its verdict. Prints the
// methods whose verdict no longer fits; with --write, updates
// conformance/leana/verdicts/<Class>.json for the mechanical cases:
//   - the method passes: its verdict is removed;
//   - it fails with LeanaUnsupportedError: a gap verdict with that gap key.
// Every other failure is printed for a person to decide (defect, divergence,
// or a gap with "noThrow"). Usage, from the repository root:
//   node tools/leana-study/triage.mjs [--write] [glob ...]
// Apache License 2.0. Written for echochamber.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const write = args.includes('--write');
const globs = args.filter((a) => !a.startsWith('--'));
const out = join(mkdtempSync(join(tmpdir(), 'leana-triage-')), 'triage.jsonl');
spawnSync(process.execPath, ['--test', ...(globs.length ? globs : ['conformance/leana/**/*.test.mjs'])], {
  env: { ...process.env, LEANA_TRIAGE: out }, encoding: 'utf8', stdio: ['ignore', 'ignore', 'inherit'],
});
const rows = existsSync(out) ? readFileSync(out, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const dir = join('conformance', 'leana', 'verdicts');
const byCls = {};
for (const r of rows) (byCls[r.cls] ||= []).push(r);
let changed = 0, review = 0;
for (const [cls, rs] of Object.entries(byCls)) {
  const f = join(dir, cls + '.json');
  const verdicts = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : {};
  let dirty = false;
  for (const r of rs) {
    const v = verdicts[r.method];
    if (r.ok) {
      if (v) { console.log(`PASS   ${cls}.${r.method} (remove ${v.verdict})`); delete verdicts[r.method]; dirty = true; }
      continue;
    }
    if (r.gap) {
      if (v && v.verdict === 'gap' && v.gap === r.gap && !v.noThrow) continue;
      if (v && v.verdict !== 'gap') { console.log(`REVIEW ${cls}.${r.method}: ${v.verdict} verdict, but gap ${r.gap} (${r.what})`); review++; continue; }
      console.log(`GAP    ${cls}.${r.method}: ${v ? v.gap + ' -> ' : ''}${r.gap} (${r.what})`);
      verdicts[r.method] = { verdict: 'gap', gap: r.gap, note: v && v.gap === r.gap && v.note ? v.note : `${r.what}.` };
      dirty = true;
      continue;
    }
    if (v && (v.verdict !== 'gap' || (v.noThrow && r.assertion))) continue;
    console.log(`REVIEW ${cls}.${r.method}: ${v ? v.verdict + '/' + v.gap : 'no verdict'}: ${r.err}`);
    review++;
  }
  if (dirty) {
    changed++;
    if (write) {
      const sorted = Object.fromEntries(Object.keys(verdicts).sort().map((k) => [k, verdicts[k]]));
      if (Object.keys(sorted).length === 0 && existsSync(f)) writeFileSync(f, '{}\n');
      else writeFileSync(f, JSON.stringify(sorted, null, 2) + '\n');
    }
  }
}
console.log(`${rows.length} methods; ${changed} verdict files ${write ? 'updated' : 'would change'}; ${review} to review`);
