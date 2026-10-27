// Run ported RDF4J compliance cases (a cases.json or a part file) and print
// each outcome, for triage. Original to echochamber (Apache-2.0).
// Usage: node tools/echo04-study/compliance-run.mjs <file.json> [idSubstring] [-v]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const { runCase } = await import(resolve(new URL('.', import.meta.url).pathname, '../../conformance/echo04/compliance/run.mjs'));
const [file, filt] = process.argv.slice(2).filter((a) => a !== '-v');
const verbose = process.argv.includes('-v');
const { cases } = JSON.parse(readFileSync(file, 'utf8'));
let pass = 0; let fail = 0;
for (const c of cases) {
  if (filt && !c.id.includes(filt)) continue;
  let o;
  try { o = await runCase(c); } catch (e) { o = { pass: false, detail: 'THROW ' + (e.code || '') + ' ' + e.message }; }
  if (o.pass) pass++; else fail++;
  if (!o.pass || verbose) console.log((o.pass ? 'PASS ' : 'FAIL ') + c.id + (o.pass ? '' : '  ' + o.detail));
}
console.log(`pass ${pass} fail ${fail}`);
