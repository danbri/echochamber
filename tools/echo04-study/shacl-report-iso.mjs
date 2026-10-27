// Measure how often @factoidal/core's SHACL validation report is
// isomorphic to RDF4J's expected report.ttl, for the ported ShaclSail cases.
// A study measurement, not a suite assertion.
//
// usage (from conformance/echo04):
//   node ../../tools/echo04-study/shacl-report-iso.mjs [--roundTrip]
//   (SHOW=1 prints, for each normalized mismatch, the predicate counts that differ)
//
// Counted: cases whose sh:conforms already meets the RDF4J expectation and
// whose shapes have a single validation plan (one report on each side).
// Two numbers:
//  raw         core.isomorphic(core report, report.ttl) as they are;
//  normalized  both sides cut down the way RDF4J's own cross-check against
//              the TopBraid engine does (AbstractShaclTest
//              referenceImplementationTestCaseValidation): keep what is
//              reachable from the sh:ValidationReport without following
//              sh:sourceShape; drop rdf4j:truncated, rsx:dataGraph,
//              rsx:shapesGraph, rsx:actualPairwisePath and sh:resultMessage;
//              drop the description of sh:SPARQLConstraint nodes; unfold
//              shared blank nodes into a tree (ValidationReportBnodeDuplicator).
// A comparison whose blank-node search exceeds the engine's budget counts
// as not isomorphic and is reported in isomorphismBudgetExceeded.
// Isomorphism is decided by the engine (core.isomorphic). The walk below is
// measurement plumbing in the study tool, not echo behaviour.
//
// Original to echochamber, Apache-2.0.
import { readFileSync } from 'node:fs';
import { core } from '../../conformance/echo04/lib/harness.mjs';
import { validateCase } from '../../conformance/echo04/shacl/run.mjs';

const roundTrip = process.argv.includes('--roundTrip');
const doc = JSON.parse(readFileSync(new URL('../../conformance/echo04/shacl/cases.json', import.meta.url), 'utf8'));
const df = core.dataFactory;
const SH = 'http://www.w3.org/ns/shacl#';
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const DROP = new Set(['http://rdf4j.org/schema/rdf4j#truncated', 'http://rdf4j.org/shacl-extensions#dataGraph',
  'http://rdf4j.org/shacl-extensions#shapesGraph', 'http://rdf4j.org/shacl-extensions#actualPairwisePath', SH + 'resultMessage']);
const key = (t) => t.termType + ' ' + t.value;

function normalize(quads) {
  const bySubj = new Map();
  for (const q of quads) { const k = key(q.subject); if (!bySubj.has(k)) bySubj.set(k, []); bySubj.get(k).push(q); }
  const sparqlC = new Set(quads.filter((q) => q.predicate.value === RDF_TYPE && q.object.value === SH + 'SPARQLConstraint').map((q) => key(q.subject)));
  const root = quads.find((q) => q.predicate.value === RDF_TYPE && q.object.value === SH + 'ValidationReport');
  if (!root) return null;
  const out = []; let n = 0;
  const walk = (subj, as, depth) => {
    if (depth > 50 || sparqlC.has(key(subj))) return;
    for (const q of bySubj.get(key(subj)) || []) {
      if (DROP.has(q.predicate.value)) continue;
      let o = q.object;
      if (o.termType === 'BlankNode') o = df.blankNode('u' + (n++));
      out.push(df.quad(as, q.predicate, o));
      if (q.object.termType !== 'Literal' && q.predicate.value !== SH + 'sourceShape') walk(q.object, o, depth + 1);
    }
  };
  walk(root.subject, df.blankNode('report'), 0);
  return out;
}

let measured = 0, raw = 0, norm = 0, skipped = 0, budget = 0;
const iso = async (a, b) => { try { return await core.isomorphic(a, b); } catch (e) { if (e.code !== 'canon.failed') throw e; budget++; return false; } };
const fails = {};
for (const c of doc.cases) {
  const shapes = doc.shapes[c.shapes];
  if (shapes.plans.length !== 1 || !c.report) { skipped++; continue; }
  let r;
  try { r = await validateCase(c, shapes, { roundTrip }); } catch { skipped++; continue; }
  if (r.conforms !== (c.expect === 'valid')) { r.reports.forEach((x) => x.dispose()); skipped++; continue; }
  measured++;
  const exp = await core.openDataset({ text: c.report, format: 'trig' });
  if (await iso(r.reports[0], exp)) raw++;
  const a = normalize([...r.reports[0]]); const b = normalize([...exp]);
  const same = a && b && await iso(await core.fromQuads(a), await core.fromQuads(b));
  if (same) norm++; else { const f = c.id.split('/')[0]; fails[f] = (fails[f] || 0) + 1; if (process.env.SHOW) { const pc = (qs) => { const m = {}; for (const q of qs) { const k = q.predicate.value.replace(/.*[#/]/, '') + (q.predicate.value === RDF_TYPE || q.predicate.value.endsWith('ConstraintComponent') || q.predicate.value.endsWith('sourceConstraintComponent') ? '=' + q.object.value.replace(/.*[#/]/, '') : ''); m[k] = (m[k] || 0) + 1; } return m; }; const pa = pc(a || []), pb = pc(b || []); const d = [...new Set([...Object.keys(pa), ...Object.keys(pb)])].filter((k) => pa[k] !== pb[k]).map((k) => `${k} core ${pa[k] || 0} rdf4j ${pb[k] || 0}`); console.error(c.id, d.join('; ')); }}
  r.reports.forEach((x) => x.dispose()); exp.dispose();
}
console.log(JSON.stringify({ roundTrip, measured, rawIsomorphic: raw, normalizedIsomorphic: norm, notMeasured: skipped, isomorphismBudgetExceeded: budget, normalizedMismatchByFamily: fails }, null, 1));
