// Derived from RDFLib (https://github.com/RDFLib/rdflib, commit
// 58c3700e5e21b5b833d0e31072f930c665059db2), test/test_roundtrip.py and
// test/test_graph/test_variants.py. RDFLib: Copyright (c) 2002-2026, RDFLib
// Team. BSD 3-Clause License (see data/LICENSE-RDFLib).
// Changes: rewritten in JavaScript; the case lists (INVALID_NT_FILES,
// EXTRA_FILES, the variant grouping rule) are kept, the pytest xfail marks
// are replaced by verdicts.json, the formats are the six that
// @factoidal/core reads and writes plus the four RDFLib formats it does not;
// the exact_match label comparison of test_variants is replaced by
// isomorphism (blank node identifiers are local to a document, RDF 1.1
// Concepts section 3.5).
import { readdirSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DATA = join(dirname(fileURLToPath(import.meta.url)), 'data');

// RDFLib's rdflib.util.SUFFIX_FORMAT_MAP, restricted to the suffixes used here.
export const SUFFIX_FORMAT = {
  '.nt': 'nt', '.n3': 'n3', '.ttl': 'turtle', '.trig': 'trig', '.nq': 'nquads',
  '.rdf': 'xml', '.xml': 'xml', '.jsonld': 'json-ld', '.json': 'json-ld',
  '.hext': 'hext', '.py': 'python',
};

// RDFLib format name -> @factoidal/core format name (null: core has none).
// This is a table of names, not of syntax: the engine decides what each reads.
export const CORE_FORMAT = {
  nt: 'ntriples', ntriples: 'ntriples', turtle: 'turtle', ttl: 'turtle',
  trig: 'trig', nquads: 'nquads', xml: 'rdfxml', 'json-ld': 'jsonld',
  n3: null, hext: null, trix: null, patch: null, python: null,
};

// RDFLib's get_formats() (parsers ∩ serializers, no media types) at the
// pinned commit: xml n3 turtle ttl ntriples nt nt11 json-ld nquads trix trig
// hext patch. Aliases (ttl, ntriples, nt11) give the same writer; one name each.
export const ROUNDTRIP_FORMATS = ['xml', 'n3', 'turtle', 'nt', 'json-ld', 'nquads', 'trix', 'trig', 'hext', 'patch'];
export const TRIPLE_ONLY = new Set(['xml', 'turtle', 'nt']);

// test_roundtrip.py INVALID_NT_FILES: not N-Triples (literal or variable
// subject, blank node predicate). RDFLib leaves them out; here each is a
// negative N-Triples syntax case (RDF 1.1 N-Triples section 7, grammar).
export const INVALID_NT_FILES = new Set([
  'literals-01.nt', 'keywords-08.nt', 'paths-04.nt', 'numeric-01.nt', 'numeric-02.nt',
  'numeric-03.nt', 'numeric-04.nt', 'numeric-05.nt', 'formulae-01.nt', 'formulae-02.nt',
  'formulae-03.nt', 'formulae-05.nt', 'formulae-06.nt', 'formulae-10.nt', 'paths-06.nt',
  'anons-02.nt', 'anons-03.nt', 'qname-01.nt', 'lists-06.nt',
]);

// test_roundtrip.py EXTRA_FILES (paths relative to data/).
export const EXTRA_FILES = [
  'variants/special_chars.nt', 'variants/xml_literal.rdf', 'variants/rdf_prefix.jsonld',
  'variants/simple_quad.trig', 'variants/rdf11trig_eg2.trig', 'variants/diverse_triples.nt',
  'variants/diverse_quads.nq', 'variants/diverse_quads.trig', 'roundtrip/bnode_refs.trig',
  'roundtrip/iri_with_escaped_percent.ttl', 'misc/example-lots_of_graphs.n3', 'misc/issue156.n3',
];
// Not in test_roundtrip.py: other RDFLib data files in the six core syntaxes
// that RDFLib's own tests parse (test_trig.py, test_serializer_longturtle.py,
// test_parsers/test_nquads.py, contrived/README.md); run through the same
// round trip here.
export const MORE_FILES = [
  'misc/sportquads.trig', 'misc/multiple-comments.ttl', 'misc/longturtle-target.ttl', 'misc/test6.nq',
];
// test_roundtrip.py CONSTRAINED_FORMAT_MAP
const CONSTRAINED = { 'example-lots_of_graphs.n3': ['n3'] };

const files = (d) => readdirSync(join(DATA, d)).filter((f) => !f.startsWith('.') && !f.startsWith('LICENSE')).sort();
const fmtOf = (f) => SUFFIX_FORMAT[extname(f)];

export function roundtripCases() {
  const inputs = [];
  for (const f of files('nt_misc')) if (!INVALID_NT_FILES.has(f)) inputs.push(['nt', `nt_misc/${f}`]);
  for (const f of files('n3roundtrip')) inputs.push(['n3', `n3roundtrip/${f}`]);
  for (const f of EXTRA_FILES) inputs.push(['extra', f]);
  for (const f of MORE_FILES) inputs.push(['more', f]);
  const out = [];
  for (const [group, path] of inputs) {
    const only = CONSTRAINED[basename(path)];
    for (const testfmt of ROUNDTRIP_FORMATS) {
      if (only && !only.includes(testfmt)) continue;
      out.push({ id: `roundtrip/${group}/${basename(path)}/${testfmt}`, kind: 'roundtrip', path, infmt: fmtOf(path), testfmt });
    }
  }
  return out;
}

export function invalidNtCases() {
  return [...INVALID_NT_FILES].sort().map((f) => ({ id: `nt-negative/${f}`, kind: 'negative', path: `nt_misc/${f}`, infmt: 'nt' }));
}

// test_variants.py: files that differ only in suffix, or in a -variant-*
// part, are variants of one graph; -meta.json holds asserts.
export function variantGroups() {
  const groups = new Map();
  for (const f of files('variants')) {
    const ext = extname(f); const stem = f.slice(0, -ext.length);
    const m = /^(.*?)(|-variant-[^/]+|-asserts|-meta)$/.exec(stem);
    const key = m[1]; const g = groups.get(key) ?? { key, variants: [], meta: {} };
    if (m[2] === '-meta' && ext === '.json') g.metaFile = `variants/${f}`;
    else g.variants.push({ vkey: `${m[2]}${ext}`, path: `variants/${f}`, fmt: SUFFIX_FORMAT[ext] });
    groups.set(key, g);
  }
  // _VARIANT_PREFERENCE: the first of these formats is the reference.
  const pref = ['python', 'nquads', 'nt', 'ntriples', 'turtle', 'ttl', 'trig', 'xml', 'hext'];
  const rank = (v) => { const i = pref.indexOf(v.fmt); return i < 0 ? 1000 : i; };
  for (const g of groups.values()) g.variants.sort((a, b) => rank(a) - rank(b));
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key));
}
