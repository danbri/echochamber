// Write conformance/enthie/verdicts.json from recorded outcomes.
//
// 1. Record: rm -f rec.jsonl; ENTHIE_RECORD=$PWD/rec.jsonl \
//      node --test 'conformance/enthie/**/*.test.mjs'
//    (with an empty verdicts.json "cases" the run records every outcome).
// 2. node tools/enthie-study/triage.mjs rec.jsonl
//
// Each failing case gets the verdict of the first rule below that matches
// it. The rules were written by reading every failure (2026-10-27); a
// failure no rule matches is printed and the script exits 1, so a new
// failure is never classified by default. The rules carry the specification
// section (divergence), the issue (defect) or the gap-list entry (gap,
// docs/enthie/feasibility.md section 7).

import { readFileSync, writeFileSync } from 'node:fs';

const I = (n) => `https://github.com/danbri/factoidal/issues/${n}`;
const CONCEPTS_IRI = 'RDF 1.2 Concepts section 3.2 (an IRI is absolute; RFC 3987)';
const CONCEPTS_TT = 'RDF 1.2 Concepts section 3.1 (a triple term is only an object; the subject is an IRI or a blank node)';

const rules = [
  // RDF/JS suites
  [/^rdfjs-spec\/core > Literal\.language is lowercase \(factory/, { verdict: 'defect', issue: I(1054) }],
  [/^rdfjs-data-model\/\w+ > \.from(Term|Quad) > should return null if null is given$/, { verdict: 'divergence',
    spec: 'RDF/JS Data Model, DataFactory: fromTerm(Term original) and fromQuad(Quad original) take a term (IDL: not nullable); rdfjs-base answers null for null' }],
  [/^rdfjs-dataset\/\w+ > DatasetCore > add > should support Quads having a Quad as subject$/, { verdict: 'divergence', spec: CONCEPTS_TT }],

  // N3.js parser
  [(c) => c.id.startsWith('n3js-parser') && c.case && c.case.options && /n3/i.test(String(c.case.options.format || '')), { verdict: 'gap', gap: 'G1', issue: I(1059) }],
  [(c) => c.id.startsWith('n3js-parser') && c.case && c.case.kind === 'comments', { verdict: 'gap', gap: 'G3' }],
  [(c) => c.id.startsWith('n3js-parser') && /JSON-LD/.test(c.message), { verdict: 'defect', issue: I(1058) }],
  [/ for the N-(Triples|Quads) format > should parse a version directive/, { verdict: 'defect', issue: I(1055) }],
  [/ for the N-Triples format > should parse a single triple starting with Bom$/, { verdict: 'divergence',
    spec: 'RDF 1.2 N-Triples section 5.3: the grammar has no byte order mark (N3.js skips U+FEFF)' }],
  [/ should not allow relative URIs with a colon in the first path segment/, { verdict: 'defect', issue: I(1057) }],
  [/ should not parse a reified triple using an incomplete annotation syntax after a semicolon$/, { verdict: 'defect', issue: I(1056) }],
  [/ should not allow unsupported VERSIONs$/, { verdict: 'divergence',
    spec: 'RDF 1.2 N-Triples section 6.1: "The version announcement is only a hint; this specification does not mandate any parser behavior" (N3.js refuses an unknown version by default)' }],
  [/ should still read a language tag after whitespace$/, { verdict: 'divergence',
    spec: 'RDF 1.2 Turtle section 6.5 production 22 RDFLiteral ::= String (LANG_DIR | ...): no white space between String and LANG_DIR is shown; open question (docs/enthie/feasibility.md section 8)' }],
  [/ should not resolve prefixed names$/, { verdict: 'divergence',
    spec: 'RDF 1.2 Turtle section 6.3 and RFC 3986 section 5.2.2: a reference with a scheme gets T.path = remove_dot_segments(R.path), so PREFIX ex: <http://ex.org/a/bb/ccc/../> is http://ex.org/a/bb/' }],
  [/ An Parser instance without document IRI > /, { verdict: 'divergence',
    spec: `RDF 1.2 Turtle section 6.3 (relative IRI references are resolved against a base) and ${CONCEPTS_IRI}; N3.js keeps relative IRIs when it has no base` }],
  [(c) => c.id.startsWith('n3js-parser') && c.case && c.case.kind === 'resolve' && /no base to resolve against/.test(c.message), { verdict: 'divergence',
    spec: 'RFC 3986 section 5.1: the base URI is absolute; N3.js resolves against a relative base IRI (./, //host/...)' }],
  [(c) => c.id.startsWith('n3js-parser') && c.case && c.case.kind === 'parse' && !(c.case.options || {}).format && /expected '\.' after triple/.test(c.message), { verdict: 'divergence',
    spec: 'RDF 1.2 Turtle section 6.5 and RDF 1.2 TriG section 5: a statement has three terms; N3.js\'s default format also reads four-term N-Quads statements mixed with Turtle syntax (prefixed names, relative IRIs), which no one W3C grammar accepts' }],

  // N3.js writer
  [(c) => c.id.startsWith('n3js-writer') && c.message.startsWith('[relative-iri]'), { verdict: 'divergence',
    spec: `${CONCEPTS_IRI}; N3.js writes names such as <a> and <> that are not IRIs` }],
  [(c) => c.id.startsWith('n3js-writer') && c.message.startsWith('[unsupported]'), { verdict: 'gap', gap: 'G1', issue: I(1059) }],
  [(c) => c.id.startsWith('n3js-writer') && c.message.startsWith('[layout]'), { verdict: 'divergence',
    spec: 'RDF 1.2 Turtle sections 2 and 6: any text the grammar accepts is a serialization; N3.js asserts its own layout. The engine\'s text parses to a dataset isomorphic to the expected one' }],
  [/ should apply prefixes whose IRIs contain regular expression metacharacters$/, { verdict: 'defect', issue: I(1057) }],
  [/n3js-writer > .* > should (only treat IRIs with an exact prefix name as prefixed names|expand prefixes when possible|only expand prefixes when the rest is a valid local name|keep IRIs that look like prefixed names with any valid local name as prefixed names)$/, { verdict: 'divergence',
    spec: 'RDF 1.2 Turtle section 2.4: a prefixed name denotes the prefix IRI followed by the local name; N3.js writes the IRI <a:bc> as the prefixed name a:bc, which denotes http://a.org/bc' }],
  [/n3js-writer > .* > should not use escape sequences in blank nodes$/, { verdict: 'divergence',
    spec: 'RDF 1.2 Concepts section 3.1: the predicate of a triple is an IRI (N3.js writes a blank node predicate)' }],

  // N3.js store
  [(c) => c.id.startsWith('n3js-store') && /\(G2\)|gap G2/.test(c.message), { verdict: 'gap', gap: 'G2', issue: I(884) }],
  [(c) => c.id.startsWith('n3js-store') && /\(G6\)/.test(c.message), { verdict: 'gap', gap: 'G6' }],
  [(c) => c.id.startsWith('n3js-store') && /\(G4\)/.test(c.message), { verdict: 'gap', gap: 'G4', issue: I(1051) }],
  [(c) => c.id.startsWith('n3js-store') && (/quad as subject/.test(c.id) || /not a quad pattern/.test(c.message) ||
      /(initialized with 5 elements|with 7 elements) > /.test(c.id) && /Expected values to be strictly equal/.test(c.message)), { verdict: 'divergence',
    spec: `${CONCEPTS_TT}; the N3.js fixture has a quad with a triple term as subject, which the engine refuses, so counts and sizes are one lower` }],
];

const [recFile] = process.argv.slice(2);
const recs = readFileSync(recFile, 'utf8').trim().split('\n').map((l) => JSON.parse(l));

// Case data, to let rules see options and kinds.
const { cases: parserCases } = await import('../../conformance/enthie/n3js/parser-cases.mjs');
const byId = new Map();
{
  const seen = new Map();
  for (const c of parserCases) {
    if (c.kind.startsWith('code')) continue;
    let id = `n3js-parser > ${[...c.path, c.name].join(' > ')}`;
    const n = (seen.get(id) || 0) + 1; seen.set(id, n); if (n > 1) id += ` (${n})`;
    byId.set(id, c);
  }
}

const out = {};
const unclassified = [];
const counts = {};
for (const r of recs) {
  const prefix = r.id.split(' > ')[0];
  counts[prefix] = counts[prefix] || { total: 0, pass: 0, defect: 0, divergence: 0, gap: 0 };
  counts[prefix].total++;
  if (r.pass) { counts[prefix].pass++; continue; }
  const c = { id: r.id, message: r.message || '', case: byId.get(r.id) };
  let v;
  for (const [m, verdict] of rules) {
    if (typeof m === 'function' ? m(c) : m.test(c.id)) { v = verdict; break; }
  }
  if (!v) { unclassified.push(c); continue; }
  out[r.id] = v;
  counts[prefix][v.verdict]++;
}
const file = new URL('../../conformance/enthie/verdicts.json', import.meta.url);
const doc = JSON.parse(readFileSync(file, 'utf8'));
doc.cases = Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)));
writeFileSync(file, JSON.stringify(doc, null, 1) + '\n');
console.log(JSON.stringify(counts, null, 1));
if (unclassified.length) {
  console.log(`\n${unclassified.length} unclassified failures:`);
  for (const c of unclassified) console.log('-', c.id, '\n   ', c.message.slice(0, 200));
  process.exit(1);
}
