// Read RDF4J's own (non-W3C) SPARQL manifests and write them as one JSON
// file of cases for conformance/echo04/sparql/.
//
// usage (from conformance/echo04, so that @factoidal/core resolves):
//   node ../../tools/echo04-study/extract-sparql.mjs <rdf4j root> <out.json>
//
// Manifests read: testsuites/sparql/src/main/resources/testcases-sparql-1.1
// (manifest-evaluation.ttl) and testcases-sparql-1.2 (manifest-all.ttl).
// The W3C copies (testcases-sparql-1.0-w3c, -1.1-w3c, -1.2-w3c) are not read:
// Factoidal runs the W3C suites directly.
//
// The manifests are read with @factoidal/core (Turtle parse plus SPARQL).
// SPARQL Results XML files are read by the small reader below (tool time
// only; the suite compares results with the engine's isomorphism op).
//
// Derived from Eclipse RDF4J test data, Eclipse Distribution License 1.0
// (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others.
import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import * as f from '@factoidal/core';

const [root, out] = process.argv.slice(2);
if (!root || !out) { console.error('usage: extract-sparql.mjs <rdf4j root> <out.json>'); process.exit(2); }
const res = join(root, 'testsuites/sparql/src/main/resources');
const commit = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD']).toString().trim();
const TOP = ['testcases-sparql-1.1/manifest-evaluation.ttl', 'testcases-sparql-1.2/manifest-all.ttl'];
// Not ported: bsbm-100.ttl is 3.8 MB of data made by the BSBM generator.
const EXCLUDE = { 'testcases-sparql-1.1/bsbm/manifest.ttl': 'data file is 3.8 MB of BSBM-generator output; not copied' };

const base = (rel) => 'file:///rdf4j/' + rel; // stable stand-in for the classpath URL
const rel = (iri) => iri.replace('file:///rdf4j/', '');

async function q(text, rp, sparql) {
  const ds = await f.openDataset(text, { format: 'turtle', baseIRI: base(rp) });
  const r = await ds.query(sparql);
  return r.map((m) => Object.fromEntries([...m].map(([k, v]) => [k, v.value])));
}

function unxml(s) {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|lt|gt|amp|quot|apos);/g, (_, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10))
      : { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[e]);
}
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name.replace(':', '\\:')}\\s*=\\s*("([^"]*)"|'([^']*)')`));
  return m ? unxml(m[2] ?? m[3]) : undefined;
}
function readSrx(xml) {
  const vars = [...xml.matchAll(/<variable\b[^>]*>/g)].map((m) => attr(m[0], 'name'));
  const b = xml.match(/<boolean>\s*(true|false)\s*<\/boolean>/);
  if (b) return { kind: 'boolean', value: b[1] === 'true' };
  const rows = [];
  for (const r of xml.matchAll(/<result>([\s\S]*?)<\/result>|<result\s*\/>/g)) {
    const row = {};
    for (const bm of (r[1] || '').matchAll(/<binding\b([^>]*)>([\s\S]*?)<\/binding>/g)) {
      const name = attr(bm[1], 'name');
      const body = bm[2].trim();
      let m;
      if ((m = body.match(/^<uri>([\s\S]*?)<\/uri>$/))) row[name] = { type: 'uri', value: unxml(m[1]) };
      else if ((m = body.match(/^<bnode>([\s\S]*?)<\/bnode>$/))) row[name] = { type: 'bnode', value: unxml(m[1]) };
      else if ((m = body.match(/^<bnode\s*\/>$/))) row[name] = { type: 'bnode', value: '' };
      else if ((m = body.match(/^<literal\b([^>]*)>([\s\S]*?)<\/literal>$/)) || (m = body.match(/^<literal\b([^>]*?)\/>$/))) {
        const t = { type: 'literal', value: unxml(m[2] || '') };
        const dt = attr(m[1], 'datatype'); const lang = attr(m[1], 'xml:lang');
        if (dt) t.datatype = dt; if (lang) t['xml:lang'] = lang;
        row[name] = t;
      } else throw new Error('SRX binding not read: ' + body.slice(0, 80));
    }
    rows.push(row);
  }
  return { kind: 'bindings', vars, bindings: rows };
}

const cases = []; const excluded = [];
const MF = 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#';
async function manifest(rp) {
  if (EXCLUDE[rp]) { excluded.push({ manifest: rp, reason: EXCLUDE[rp] }); return; }
  const text = readFileSync(join(res, rp), 'utf8');
  const inc = await q(text, rp, `PREFIX mf: <${MF}> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?m WHERE { ?x mf:include/rdf:rest*/rdf:first ?m }`);
  for (const { m } of inc) await manifest(rel(m));
  // entries in list order: count the list cells before each one
  const ents = await q(text, rp, `PREFIX mf: <${MF}> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX qt: <http://www.w3.org/2001/sw/DataAccess/tests/test-query#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?e ?type ?name ?comment ?query ?data ?result ?order (COUNT(?mid) AS ?pos) WHERE {
      ?x mf:entries/rdf:rest* ?mid . ?mid rdf:rest* ?cell . ?cell rdf:first ?e .
      ?e rdf:type ?type ; mf:action ?a ; mf:result ?result . ?a qt:query ?query .
      OPTIONAL { ?a qt:data ?data } OPTIONAL { ?e mf:name ?name } OPTIONAL { ?e rdfs:comment ?comment }
      OPTIONAL { ?e mf:checkOrder ?order } }
    GROUP BY ?e ?type ?name ?comment ?query ?data ?result ?order ORDER BY ?pos`);
  for (const e of ents) {
    if (e.type !== MF + 'QueryEvaluationTest') throw new Error('unexpected test type ' + e.type);
    const qp = rel(e.query); const resp = rel(e.result);
    const c = {
      id: rel(e.e).replace(/^.*\//, dirname(rp) + '/').replace('manifest.ttl#', ''),
      manifest: rp, name: e.name, comment: e.comment,
      sparql12: rp.startsWith('testcases-sparql-1.2'),
      query: { path: qp, base: base(qp), text: readFileSync(join(res, qp), 'utf8') },
      data: e.data ? { path: rel(e.data), base: base(rel(e.data)), format: 'turtle', text: readFileSync(join(res, rel(e.data)), 'utf8') } : null,
      checkOrder: e.order === 'true',
      resultPath: resp,
    };
    const rt = readFileSync(join(res, resp), 'utf8');
    if (resp.endsWith('.srx')) c.result = readSrx(rt);
    else if (resp.endsWith('.srj')) {
      const j = JSON.parse(rt);
      c.result = 'boolean' in j ? { kind: 'boolean', value: j.boolean } : { kind: 'bindings', vars: j.head.vars || [], bindings: j.results.bindings };
    } else throw new Error('result format ' + resp);
    cases.push(c);
  }
}
for (const m of TOP) await manifest(m);
// entry IRIs: keep the manifest-relative fragment as the case id
for (const c of cases) c.id = dirname(c.manifest) + '#' + c.id.replace(/^.*#/, '').replace(/^.*\//, '');
const ids = new Set(cases.map((c) => c.id));
if (ids.size !== cases.length) throw new Error('duplicate ids');
writeFileSync(out, JSON.stringify({
  _notice: 'Derived from Eclipse RDF4J (https://github.com/eclipse-rdf4j/rdf4j), testsuites/sparql/src/main/resources, ' +
    'Eclipse Distribution License 1.0 (BSD-3-Clause). Copyright (c) Eclipse RDF4J contributors, Aduna, and others. ' +
    'Changed: manifests, queries, data and expected results gathered into one JSON file by tools/echo04-study/extract-sparql.mjs; ' +
    'base IRIs replaced by file:///rdf4j/<path>; SPARQL Results XML converted to the SPARQL Results JSON term shape.',
  source: { repository: 'https://github.com/eclipse-rdf4j/rdf4j', commit, manifests: TOP },
  excluded, cases,
}, null, 1) + '\n');
console.log(`cases ${cases.length}, excluded manifests ${excluded.length}`);
