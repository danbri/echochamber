// Compare RDF4J testsuites/rio/src/main/resources/testcases/** with a W3C
// rdf-tests checkout: each upstream file is classified as a byte-identical
// W3C copy, a same-name W3C file with changed content, or not in W3C.
// Original to echochamber, Apache-2.0. Read only on both trees.
// Usage: node extract-rio-w3c-compare.mjs <rdf4j-root> <rdf-tests-root>
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
const [rdf4j, w3c] = process.argv.slice(2);
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const base = join(rdf4j, 'testsuites/rio/src/main/resources/testcases');
// mapping upstream dir -> W3C dir
const map = [
  ['nquads/rdf11', 'rdf/rdf11/rdf-n-quads'], ['nquads/rdf12', 'rdf/rdf12/rdf-n-quads'],
  ['ntriples/rdf11', 'rdf/rdf11/rdf-n-triples'], ['ntriples/rdf12', 'rdf/rdf12/rdf-n-triples'],
  ['trig/rdf11', 'rdf/rdf11/rdf-trig'], ['trig/rdf12', 'rdf/rdf12/rdf-trig'],
  ['turtle/rdf11', 'rdf/rdf11/rdf-turtle'], ['turtle/rdf12', 'rdf/rdf12/rdf-turtle'],
  ['turtle/tests-nt', 'rdf/rdf11/rdf-n-triples'],
  ['rdfxml/w3c-approved', 'rdf/rdf11/rdf-xml'], ['rdfxml/rdf12', 'rdf/rdf12/rdf-xml'],
];
const norm = (b) => b.toString('utf8').replace(/\r\n/g, '\n');
const w3cIndex = new Map();
for (const f of walk(join(w3c, 'rdf'))) { const k = basename(f); if (!w3cIndex.has(k)) w3cIndex.set(k, []); w3cIndex.get(k).push(f); }
const totals = {};
for (const f of walk(base)) {
  const rel = relative(base, f);
  const m = map.find(([u]) => rel.startsWith(u + '/'));
  const key = m ? m[0] : rel.split('/')[0];
  totals[key] ??= { files: 0, identical: 0, sameNameDiffers: 0, notInW3C: 0, notInW3CList: [] };
  const t = totals[key]; t.files++;
  let cls = 'notInW3C';
  const cands = m ? [join(w3c, m[1], relative(join(base, m[0]), f))] : [];
  cands.push(...(w3cIndex.get(basename(f)) || []));
  const mine = norm(readFileSync(f));
  for (const c of cands) {
    try { const theirs = norm(readFileSync(c)); if (theirs === mine) { cls = 'identical'; break; } cls = 'sameNameDiffers'; } catch {}
  }
  t[cls]++; if (cls !== "identical") t.notInW3CList.push(cls[0] + ":" + rel);
}
for (const [k, t] of Object.entries(totals)) { console.log(k, JSON.stringify({ ...t, notInW3CList: t.notInW3CList.length > 70 ? t.notInW3CList.slice(0, 12).concat(['...']) : t.notInW3CList })); }
