// Run the ported RDF4J Rio cases of the named port modules (all when none)
// and print each failure. Original to echochamber, Apache-2.0.
// Usage (from conformance/moonforge): node ../../tools/moonforge-study/rio-run.mjs [ntriples nquads ...]
import { loadPorts, build } from './rio-lib.mjs';
import { runCase } from '../../conformance/moonforge/rio/rio-case.mjs';
const { cases, perFile, problems } = build(await loadPorts(process.argv.slice(2)));
for (const p of problems) console.log('PROBLEM', p);
let pass = 0, fail = 0;
for (const c of cases) {
  let r; try { r = await runCase(c); } catch (e) { r = { pass: false, detail: 'runner error ' + e.message }; }
  if (r.pass) pass++; else { fail++; console.log(`FAIL ${c.id} [${c.format}${c.lenient ? ' lenient' : ''}] expect=${c.expect.kind}${c.expect.n !== undefined ? ' ' + c.expect.n : ''}: ${r.detail}`); }
}
console.table(perFile);
console.log(`pass ${pass} fail ${fail} of ${cases.length}`);
