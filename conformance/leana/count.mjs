// Run the leana conformance suite and count the outcome of every ported Jena
// test method: pass, defect, divergence, gap. Usage (from the repository root):
//   node conformance/leana/count.mjs [--json]
// Apache License 2.0. Written for echochamber.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const out = join(mkdtempSync(join(tmpdir(), 'leana-')), 'results.jsonl');
const r = spawnSync(process.execPath, ['--test', 'conformance/leana/**/*.test.mjs'], {
  env: { ...process.env, LEANA_RESULTS: out }, encoding: 'utf8',
});
const rows = existsSync(out) ? readFileSync(out, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const core = createRequire(import.meta.url)('@factoidal/core/package.json').version;
const tally = (xs) => xs.reduce((a, x) => ((a[x.result] = (a[x.result] || 0) + 1), a), {});
const byClass = {};
for (const x of rows) (byClass[x.cls] ||= []).push(x);
const byGap = {};
for (const x of rows) if (x.result === 'gap') byGap[x.gap] = (byGap[x.gap] || 0) + 1;
// Methods of ported classes that are not ported (JVM-only), with the reason: not-ported/<Class>.json.
const npDir = join('conformance', 'leana', 'not-ported');
let notPorted = 0;
for (const f of existsSync(npDir) ? readdirSync(npDir).filter((f) => f.endsWith('.json')) : []) {
  notPorted += Object.keys(JSON.parse(readFileSync(join(npDir, f), 'utf8'))).length;
}
const failed = /# fail (\d+)/.exec(r.stdout);
const summary = {
  core, node: process.version, ported: rows.length, ...{ pass: 0, defect: 0, divergence: 0, gap: 0, ...tally(rows) },
  gapsByFamily: byGap, notPorted, suiteFailures: failed ? Number(failed[1]) : null,
  classes: Object.fromEntries(Object.entries(byClass).sort().map(([k, v]) => [k, { ported: v.length, ...tally(v) }])),
};
if (process.argv.includes('--json')) console.log(JSON.stringify(summary, null, 2));
else {
  console.log(`@factoidal/core ${core}, Node ${process.version}`);
  console.log(`ported ${summary.ported}: pass ${summary.pass}, defect ${summary.defect}, divergence ${summary.divergence}, gap ${summary.gap}`);
  console.log('gap by family:', JSON.stringify(byGap));
  console.log('not ported (JVM-only, reasons in not-ported/):', notPorted);
  console.log('node:test failures:', summary.suiteFailures);
  for (const [k, v] of Object.entries(summary.classes)) console.log(`  ${k}: ${JSON.stringify(v)}`);
}
process.exit(r.status === 0 ? 0 : 1);
