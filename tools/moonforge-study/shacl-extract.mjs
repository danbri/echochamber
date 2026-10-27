// Read Eclipse RDF4J's own data-driven SHACL test cases (the ShaclSail
// test-cases tree, not the W3C SHACL suite copy in .../resources/w3c) and
// write them as one JSON file for conformance/moonforge/shacl/.
//
// usage (from conformance/moonforge, so that @factoidal/core resolves):
//   node ../../tools/moonforge-study/shacl-extract.mjs <rdf4j root> <out.json> [--no-reports]
//
// Layout read: core/sail/shacl/src/test/resources/test-cases/<constraint>/
// <variant>/{shacl.trig, valid/caseN/, invalid/caseN/}; a case directory
// holds queryN.rq (SPARQL updates, applied in file-name order), an optional
// initialData.trig and report.ttl (the expected validation report). The
// variants in AbstractShaclTest.ignoredTestCases are listed as notPorted.
//
// Each shapes entry also carries `plans`: which shapes graphs validate which
// data graphs, computed here with @factoidal/core SPARQL over shacl.trig,
// following RDF4J's ShapeSource rules (shapes read from the configured
// graphs rdf4j:SHACLShapeGraph, rdf4j:nil = the default graph, and
// ex:shapesGraph1; shapes in rdf4j:SHACLShapeGraph validate the union of all
// data graphs; `D sh:shapesGraph S` in a configured graph makes S validate
// D; rsx:DataAndShapesGraphLink lists data and shapes graphs; rdf4j:nil
// names the default graph).
//
// This file is original to echochamber (Apache-2.0). Its output is derived
// from Eclipse RDF4J test data, Eclipse Distribution License 1.0
// (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others.
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as f from '@factoidal/core';

const args = process.argv.slice(2);
const noReports = args.includes('--no-reports');
const [root, out] = args.filter((a) => !a.startsWith('--'));
if (!root || !out) { console.error('usage: shacl-extract.mjs <rdf4j root> <out.json> [--no-reports]'); process.exit(2); }
const REL = 'core/sail/shacl/src/test/resources/test-cases';
const base = join(root, REL);
const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD']).toString().trim();

// AbstractShaclTest.ignoredTestCases at the pinned commit.
const IGNORED = new Set([
  'path/oneOrMorePath', 'nodeKind/oneOrMorePathComplex', 'nodeKind/zeroOrMorePathComplex',
  'nodeKind/oneOrMorePathSimple', 'minCount/oneOrMorePath', 'path/zeroOrMorePath',
  'minCount/zeroOrMorePath', 'path/zeroOrOnePath',
]);

const RDF4J = 'http://rdf4j.org/schema/rdf4j#';
const SHACL_SHAPE_GRAPH = RDF4J + 'SHACLShapeGraph';
const NIL = new Set([RDF4J + 'nil', 'http://www.openrdf.org/schema/sesame#nil']);
const CONFIGURED = [SHACL_SHAPE_GRAPH, RDF4J + 'nil', 'http://example.com/ns#shapesGraph1'];
const g = (iri) => (NIL.has(iri) ? 'default' : iri);

const ls = (d) => readdirSync(d).filter((n) => !n.startsWith('.')).sort();
const isDir = (p) => statSync(p).isDirectory();

async function sel(ds, q) {
  const r = await ds.query(q);
  return r.map((m) => Object.fromEntries([...m].map(([k, v]) => [k, v])));
}

// Graph patterns over the configured shapes graphs (the default graph for rdf4j:nil).
const inConfigured = (pat) => `{ ${pat} } UNION { GRAPH ?cg { ${pat} } VALUES ?cg { ${CONFIGURED.filter((x) => !NIL.has(x)).map((x) => `<${x}>`).join(' ')} } }`;

async function plans(text) {
  const ds = await f.openDataset({ text, format: 'trig' });
  const plans = [];
  const ssg = await ds.query(`ASK { GRAPH <${SHACL_SHAPE_GRAPH}> { ?s ?p ?o } }`);
  // rsx:DataAndShapesGraphLink first, then rdf4j:SHACLShapeGraph, then sh:shapesGraph (RDF4J's order).
  const links = await sel(ds, `PREFIX rsx: <http://rdf4j.org/shacl-extensions#>
    SELECT ?l ?d ?s WHERE { ${inConfigured('?l a rsx:DataAndShapesGraphLink ; rsx:dataGraph ?d ; rsx:shapesGraph ?s')} }`);
  const byLink = new Map();
  for (const r of links) {
    const k = r.l.termType + ':' + r.l.value;
    if (!byLink.has(k)) byLink.set(k, { data: new Set(), shapes: new Set() });
    byLink.get(k).data.add(g(r.d.value)); byLink.get(k).shapes.add(g(r.s.value));
  }
  for (const v of byLink.values()) plans.push({ data: [...v.data].sort(), shapes: [...v.shapes].sort() });
  if (ssg) plans.push({ data: 'all', shapes: [SHACL_SHAPE_GRAPH] });
  const sg = await sel(ds, `PREFIX sh: <http://www.w3.org/ns/shacl#> SELECT DISTINCT ?d ?s WHERE { ${inConfigured('?d sh:shapesGraph ?s')} }`);
  const byData = new Map();
  for (const r of sg) {
    const d = g(r.d.value);
    if (!byData.has(d)) byData.set(d, new Set());
    byData.get(d).add(g(r.s.value));
  }
  for (const [d, s] of [...byData].sort()) plans.push({ data: [d], shapes: [...s].sort() });
  return plans;
}

const shapes = []; const cases = []; const notPorted = []; const perFamily = {};
for (const constraint of ls(base)) {
  for (const variant of ls(join(base, constraint))) {
    const vdir = join(base, constraint, variant);
    if (!isDir(vdir)) continue;
    const vid = `${constraint}/${variant}`;
    const caseDirs = [];
    for (const kind of ['valid', 'invalid']) {
      if (!existsSync(join(vdir, kind))) continue;
      for (const c of ls(join(vdir, kind))) if (isDir(join(vdir, kind, c))) caseDirs.push([kind, c]);
    }
    if (IGNORED.has(vid)) {
      for (const [kind, c] of caseDirs) notPorted.push({ id: `${vid}/${kind}/${c}`, reason: 'listed in AbstractShaclTest.ignoredTestCases (RDF4J does not run it)' });
      continue;
    }
    const text = readFileSync(join(vdir, 'shacl.trig'), 'utf8');
    const si = shapes.length;
    shapes.push({ path: `${REL}/${vid}/shacl.trig`, text, plans: await plans(text) });
    for (const [kind, c] of caseDirs) {
      const cdir = join(vdir, kind, c);
      const files = ls(cdir);
      const queries = files.filter((n) => n.endsWith('.rq')); // File::getName order, as RDF4J sorts
      const id = `${vid}/${kind}/${c}`;
      if (queries.length === 0) {
        // RDF4J's runners only assert when at least one query ran ("ran").
        notPorted.push({ id, reason: 'no queryN.rq: RDF4J asserts nothing for it (the "ran" flag stays false)' });
        continue;
      }
      const entry = { id, shapes: si };
      if (files.includes('initialData.trig')) entry.initialData = readFileSync(join(cdir, 'initialData.trig'), 'utf8');
      entry.updates = queries.map((q) => readFileSync(join(cdir, q), 'utf8'));
      entry.expect = kind;
      if (!noReports && files.includes('report.ttl')) entry.report = readFileSync(join(cdir, 'report.ttl'), 'utf8');
      cases.push(entry);
      perFamily[constraint] = (perFamily[constraint] || 0) + 1;
    }
  }
}

writeFileSync(out, JSON.stringify({
  _notice: 'Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), ' + REL + ', ' +
    'Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others. ' +
    'Changed: the files of each case directory (shacl.trig, initialData.trig, queryN.rq, report.ttl) are copied unchanged as JSON strings; ' +
    'shacl.trig is stored once per variant in the shapes table; the ignored variants of AbstractShaclTest are listed in notPorted; ' +
    'plans (which shapes graphs validate which data graphs) are added by echochamber from RDF4J\'s shapes-graph rules' +
    (noReports ? '; report.ttl texts are not copied' : '') + '.',
  source: { repository: 'https://github.com/eclipse-rdf4j/rdf4j', commit, paths: [REL, 'core/sail/shacl/src/test/java/org/eclipse/rdf4j/sail/shacl/AbstractShaclTest.java'] },
  cases, shapes, notPorted,
}));
console.error(JSON.stringify({ cases: cases.length, shapes: shapes.length, notPorted: notPorted.length, perFamily }));
