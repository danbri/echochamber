// Generates compliance-part-D.json: hand ports of Eclipse RDF4J's
// NamedGraphScopeTest and BlankNodeReferenceConformanceTest (BNR-1 vectors).
// The expectations below restate the Java assertions (and, for BNR, the
// vector file's oracle in assertOutcome) as data. Upstream: Eclipse RDF4J,
// Eclipse Distribution License 1.0 (BSD-3-Clause), commit
// fe7a441aa3f80f09993178b35f9f1e7a252932cc. This script is original to
// echochamber (Apache-2.0).
// Usage: node tools/moonforge-study/compliance-part-D-gen.mjs <rdf4j checkout>
import { readFileSync, writeFileSync } from 'node:fs';

const UP = process.argv[2] || `${process.env.HOME}/working/sandbox/october/echo-upstream/rdf4j`;
const T = 'testsuites/sparql/src/main/java/org/eclipse/rdf4j/testsuite/sparql/tests/';
const NGS = T + 'NamedGraphScopeTest.java';
const BNR = T + 'BlankNodeReferenceConformanceTest.java';
const XSD = 'http://www.w3.org/2001/XMLSchema#';

const u = (v) => ({ type: 'uri', value: v });
const ex = (n) => u('http://example/' + n);
const s = (v) => ({ type: 'literal', value: v });
const int = (n) => ({ type: 'literal', value: String(n), datatype: XSD + 'integer' });
const bool = (b) => ({ type: 'literal', value: String(b), datatype: XSD + 'boolean' });
const bn = (l) => ({ type: 'bnode', value: l });
const tt = (sub, p, o) => ({ type: 'triple', value: { subject: sub, predicate: p, object: o } });
const rows = (r, extra = {}) => ({ kind: 'bindings', rows: r, ...extra });
const count = (n) => ({ kind: 'count', n });
const trig = (text) => ({ format: 'trig', text });

const cases = []; const notPorted = []; const methods = [];

// ---------------------------------------------------------------- NamedGraphScopeTest
const P = 'PREFIX : <http://example/> ';
const PFX = '@prefix : <http://example/> .\n';
const RNIL = 'http://rdf4j.org/schema/rdf4j#nil';
const SNIL = 'http://www.openrdf.org/schema/sesame#nil';
const seed = trig(PFX + ':g1 { :a :p :o }\n:g2 { :b :q :o }\n:default :p :o .');

function ngs(name, line, list) {
  methods.push('NamedGraphScopeTest#' + name);
  list.forEach((c, i) => cases.push({ id: 'NamedGraphScopeTest#' + name + (i ? '#' + (i + 1) : ''), file: NGS, line, sparql12: false, ...c }));
}

ngs('emptyBody', 105, [{
  data: trig(PFX + ':north-shelf { :record-one :title "first" . :record-two :title "second" }\n:south-shelf { :record-three :title "third" }\n:default-record :title "outside" .'),
  query: P + 'SELECT ?shelf { VALUES ?request { "inventory" } GRAPH ?shelf { } }',
  expect: rows([{ shelf: ex('north-shelf') }, { shelf: ex('south-shelf') }]),
}]);
ngs('absentGraph', 124, [{
  data: trig(PFX + ':existing-shelf { :existing-entry :title "present" }'),
  query: P + 'SELECT ?request { VALUES ?request { "inventory" } GRAPH :shelf-not-loaded { } }',
  expect: count(0),
}]);
ngs('hiddenGraphVariable', 132, [{
  data: trig(PFX + ':west-gallery { :west-artist :caption "West" }\n:east-gallery { :east-artist :caption "East" }'),
  query: P + 'SELECT ?gallery ?artist { GRAPH ?gallery { { SELECT ?artist WHERE { ?artist :caption ?gallery } } } }',
  expect: rows([{ gallery: ex('west-gallery'), artist: ex('west-artist') }, { gallery: ex('east-gallery'), artist: ex('east-artist') }]),
}]);
ngs('optionalCompatibility', 147, [{
  data: trig(PFX + ':north-archive { :aligned-entry :caption "aligned" ; :filed-in :north-archive . :plain-entry :caption "plain" ; :filed-in :stale-archive }\n:south-archive { :redirected-entry :caption "redirected" ; :filed-in :other-archive }'),
  query: P + 'SELECT ?archive ?entry ?marker { GRAPH ?archive { ?entry :caption ?caption OPTIONAL { ?entry :filed-in ?archive BIND("matched" AS ?marker) } } }',
  expect: rows([{ archive: ex('north-archive'), entry: ex('aligned-entry'), marker: s('matched') }]),
}]);
ngs('valuesCompatibility', 171, [{
  data: trig(PFX + ':amber-shelf { :volume-a :serial "A" }\n:teal-shelf { :volume-b :serial "B" }'),
  query: P + 'SELECT ?shelf ?label { GRAPH ?shelf { VALUES (?shelf ?edition ?rank) { (UNDEF "any" 3) (:teal-shelf "selected" 8) } BIND(CONCAT(?edition, "-", STR(?rank + 1)) AS ?label) } }',
  expect: rows([{ shelf: ex('amber-shelf'), label: s('any-4') }, { shelf: ex('teal-shelf'), label: s('any-4') }, { shelf: ex('teal-shelf'), label: s('selected-9') }]),
}]);
ngs('minusDisjoint', 192, [{
  data: trig(PFX + ':reading-room { :field-guide :caption "Field Guide" . :contributor :occupation "editor" }'),
  query: P + 'SELECT ?shelf ?book { VALUES ?shelf { :reading-room } GRAPH ?shelf { ?book :caption ?caption MINUS { ?contributor :occupation ?job } FILTER(CONTAINS(?caption, "Guide")) } }',
  expect: rows([{ shelf: ex('reading-room'), book: ex('field-guide') }]),
}]);
ngs('arbitraryBodies', 207, ['{} UNION {}', 'OPTIONAL { ?s :absent ?o }', 'BIND(1 AS ?v)', 'FILTER(!BOUND(?g))', '{ SELECT (COUNT(*) AS ?n) WHERE {} }', 'FILTER NOT EXISTS { ?s :absent ?o }'].map((body) => ({
  data: seed,
  query: P + `SELECT ?g { GRAPH ?g { ${body} } }`,
  expect: rows((body.includes('UNION') ? ['g1', 'g1', 'g2', 'g2'] : ['g1', 'g2']).map((g) => ({ g: ex(g) }))),
  note: 'One case per body of the Java loop.',
})));
ngs('nestedGraph', 220, [{
  data: seed,
  query: P + 'SELECT ?g ?h ?s { GRAPH ?g { GRAPH ?h { ?s ?p ?o } } }',
  expect: rows([['g1', 'g1', 'a'], ['g1', 'g2', 'b'], ['g2', 'g1', 'a'], ['g2', 'g2', 'b']].map(([g, h, x]) => ({ g: ex(g), h: ex(h), s: ex(x) }))),
}, {
  data: seed,
  query: P + 'SELECT ?g ?s { GRAPH ?g { GRAPH :g2 { ?s ?p ?o } } }',
  expect: rows([{ g: ex('g1'), s: ex('b') }, { g: ex('g2'), s: ex('b') }]),
}]);
ngs('siblingBindings', 245, [{
  data: seed, query: P + 'SELECT ?v { VALUES ?v { 1 } GRAPH ?g { FILTER(!BOUND(?v)) } }', expect: rows([{ v: int(1) }, { v: int(1) }]),
}, {
  data: seed, query: P + 'SELECT ?g { VALUES ?v { 1 } OPTIONAL { GRAPH ?g { FILTER(!BOUND(?v)) } } }', expect: rows([{ g: ex('g1') }, { g: ex('g2') }]),
}, {
  data: seed, query: P + 'SELECT ?g { VALUES ?g { :g1 } GRAPH ?g { FILTER(!BOUND(?g)) } }', expect: rows([{ g: ex('g1') }]),
}]);
methods.push('NamedGraphScopeTest#invocationBindings');
notPorted.push({ id: 'NamedGraphScopeTest#invocationBindings', file: NGS, reason: 'TupleQuery.setBinding("v", 1) and setBinding("g", :g1): RDF4J pre-binds ?v throughout the query, so FILTER(?v = 1) inside GRAPH sees it. A VALUES block (top level or trailing) is joined bottom-up and does not reach that FILTER (SPARQL 1.1 Query 18.2.4, 18.6), so no SPARQL text is equivalent.' });
ngs('existsInvocation', 272, [{
  data: seed, query: P + 'SELECT ?v { VALUES ?v { 1 2 } FILTER EXISTS { GRAPH ?g { FILTER(?v = 1) } } }', expect: rows([{ v: int(1) }]),
}, {
  data: seed, query: P + 'SELECT ?v { VALUES ?v { 1 } FILTER EXISTS { VALUES ?local { 2 } GRAPH ?g { FILTER(!BOUND(?local)) } } }', expect: rows([{ v: int(1) }]),
}]);
ngs('activeGraphInExistsAndSubselect', 289, [{
  data: seed, query: P + 'SELECT ?g { GRAPH ?g { FILTER EXISTS { ?s :p :o } } }', expect: rows([{ g: ex('g1') }]),
}, {
  data: seed, query: P + 'SELECT ?g { GRAPH ?g { { SELECT ?s { ?s :p :o } } } }', expect: rows([{ g: ex('g1') }]),
}]);
ngs('explicitEmptyDataset', 299, [{
  data: seed, query: 'SELECT ?g FROM NAMED <http://example/empty> { GRAPH ?g {} }', expect: rows([{ g: ex('empty') }]),
  note: 'setDataset(named graph :empty) written as FROM NAMED <http://example/empty>; the query text changed. :empty has no statements in the store.',
}, {
  data: seed, query: P + 'SELECT * FROM NAMED <http://example/empty> { GRAPH :g1 {} }', expect: count(0),
  note: 'setDataset(named graph :empty) written as FROM NAMED; the query text changed.',
}]);
ngs('blankNodeGraph', 312, [{
  data: trig(PFX + '_:graph { :a :p :o }'), query: P + 'SELECT ?g { GRAPH ?g {} }', expect: rows([{ g: bn('graph') }]),
  note: 'Ports the first assertion. The second binds ?g to the stored blank node with setBinding; a blank node cannot be written in VALUES, so it is not ported.',
}]);
ngs('defaultAliases', 324, [RNIL, SNIL].flatMap((alias) => [{
  data: null, query: P + `SELECT * { GRAPH <${alias}> {} }`, expect: count(1),
  note: `RDF4J reads GRAPH <${alias}> as the default graph (an alias); the store is empty.`,
}, {
  data: null, query: P + 'SELECT ?g { GRAPH ?g {} }', expect: count(0),
}, {
  data: trig(PFX + ':a :p :o .'), query: P + `SELECT ?s { GRAPH <${alias}> { ?s :p :o } }`, expect: rows([{ s: ex('a') }]),
  note: `RDF4J reads GRAPH <${alias}> as the default graph (an alias).`,
}]));
ngs('duplicates', 336, [{
  data: seed, query: P + 'SELECT ?g { GRAPH ?g { VALUES ?v { 1 1 UNDEF } } }', expect: rows(['g1', 'g1', 'g1', 'g2', 'g2', 'g2'].map((g) => ({ g: ex(g) }))),
}]);

const nil = (n) => ({ type: 'uri', value: n });
const aliasData1 = PFX + `:default-subject :p :default-object .\n<${RNIL}> { :alias-q-subject :q :alias-q-object . :rdf4j-alias-subject :p :rdf4j-alias-object }\n<${SNIL}> { :alias-decoy-subject :p :alias-decoy-object . :sesame-alias-subject :p :sesame-alias-object }\n`;
const aliasData2 = aliasData1 + ':ordinary-graph { :ordinary-subject :p :ordinary-object }\n';
const physical = {
  [RNIL]: [{ s: ex('rdf4j-alias-subject'), o: ex('rdf4j-alias-object') }],
  [SNIL]: [{ s: ex('sesame-alias-subject'), o: ex('sesame-alias-object') }, { s: ex('alias-decoy-subject'), o: ex('alias-decoy-object') }],
};
const withG = (alias) => physical[alias].map((r) => ({ g: nil(alias), ...r }));
ngs('variableGraphAliasesAndDatasets', 451, [
  ...[RNIL, SNIL].map((alias) => ({
    data: trig(aliasData1), query: P + `SELECT ?g ?s ?o { VALUES ?g { <${alias}> } GRAPH ?g { ?s :p ?o } }`, expect: rows(withG(alias)),
    note: 'VALUES-joined variable GRAPH enumerates the physical graph named by the alias IRI.',
  })),
  {
    data: trig(aliasData1), query: P + 'SELECT ?g ?s ?o { GRAPH ?g { ?s :p ?o } }', expect: rows([...withG(RNIL), ...withG(SNIL)]),
    note: 'Also stands for the Java assertion with setDataset(new SimpleDataset()) (an empty dataset means the store default; no FROM clause).',
  },
  {
    data: trig(aliasData1), query: P + `SELECT ?g ?s ?o FROM <${RNIL}> { GRAPH ?g { ?s :p ?o } }`, expect: count(0),
    note: 'setDataset(default graph rdf4j:nil, no named graphs) written as FROM <rdf4j:nil>; the query text changed.',
  },
  {
    data: trig(aliasData2), query: P + 'SELECT ?g ?s ?o FROM NAMED <http://example/ordinary-graph> { GRAPH ?g { ?s :p ?o } }',
    expect: rows([{ g: ex('ordinary-graph'), s: ex('ordinary-subject'), o: ex('ordinary-object') }]),
    note: 'setDataset(named graph :ordinary-graph) written as FROM NAMED; the query text changed.',
  },
  ...[RNIL, SNIL].flatMap((alias) => [{
    data: trig(aliasData2), query: P + `SELECT ?g ?s ?o FROM NAMED <${alias}> { GRAPH ?g { ?s :p ?o } }`,
    expect: rows([{ g: nil(alias), s: ex('default-subject'), o: ex('default-object') }]),
    note: `setDataset(named graph <${alias}>) written as FROM NAMED; RDF4J then reads the named graph <${alias}> as the default graph.`,
  }, {
    data: trig(aliasData2), query: P + `SELECT ?s ?o FROM NAMED <${alias}> { VALUES ?g { <${alias}> } GRAPH ?g { ?s :p ?o } }`,
    expect: rows([{ s: ex('default-subject'), o: ex('default-object') }]),
    note: `setDataset(named graph <${alias}>) written as FROM NAMED; the query text changed.`,
  }, {
    data: trig(aliasData2), query: P + `SELECT ?s ?o FROM NAMED <${alias}> { GRAPH <${alias}> { ?s :p ?o } }`,
    expect: rows(physical[alias]),
    note: `setDataset(named graph <${alias}>) written as FROM NAMED; a fixed GRAPH <${alias}> selects the physical graph. The Java assertions that bind ?g with setBinding (with and without a dataset) are not ported: RDF4J gives setBinding of an alias different semantics from VALUES (default graph vs physical graph), so no SPARQL text is equivalent.`,
  }]),
]);
const bodyData = trig(PFX + `:shared-graph { :shared-graph :p :subject-value . :predicate-subject :shared-graph :predicate-object . :object-subject :object-predicate :shared-graph . :join-subject :left :join-object ; :right :join-value-one , :join-value-two . :alias-value-subject :alias-value-predicate <${RNIL}> }\n_:positive-pattern-graph { :blank-subject :blank-predicate :blank-object }`);
const sg = ex('shared-graph');
ngs('variableGraphBodyBindingsAndJoinBags', 560, [
  { query: 'SELECT ?g ?o { GRAPH ?g { ?g :p ?o } }', expect: rows([{ g: sg, o: ex('subject-value') }]) },
  { query: 'SELECT ?g ?s ?o { GRAPH ?g { ?s ?g ?o } }', expect: rows([{ g: sg, s: ex('predicate-subject'), o: ex('predicate-object') }]) },
  { query: 'SELECT ?g ?s { GRAPH ?g { ?s :object-predicate ?g } }', expect: rows([{ g: sg, s: ex('object-subject') }]) },
  { query: 'SELECT ?g ?s ?o { GRAPH ?g { ?s :blank-predicate ?o } }', expect: rows([{ g: bn('pg'), s: ex('blank-subject'), o: ex('blank-object') }]) },
  { query: 'SELECT ?g ?s ?o { GRAPH ?g { ?s :left ?o . ?s :right ?x } }', expect: rows([{ g: sg, s: ex('join-subject'), o: ex('join-object') }, { g: sg, s: ex('join-subject'), o: ex('join-object') }]) },
  { query: 'SELECT ?g ?s ?o { GRAPH ?g { ?s :alias-value-predicate ?o } }', expect: rows([{ g: sg, s: ex('alias-value-subject'), o: nil(RNIL) }]) },
  { query: 'SELECT ?o { GRAPH ?g { ?g :p ?o } } VALUES ?g { :shared-graph }', expect: rows([{ o: ex('subject-value') }]), note: 'setBinding("g", :shared-graph) written as a trailing VALUES; the query text changed (for an ordinary IRI the two agree).' },
  { query: 'SELECT ?g ?o { VALUES ?g { :shared-graph } GRAPH ?g { ?g :p ?o } }', expect: rows([{ g: sg, o: ex('subject-value') }]) },
].map((c) => ({ data: bodyData, ...c, query: P + c.query })));
const compData = trig(PFX + ':composition-graph-one { :composition-subject-one :p :composition-object-one ; :q :q-one , :q-two }\n:composition-graph-two { :composition-subject-two :p :composition-object-two }');
const s1 = ex('composition-subject-one'); const np = ex('not-present');
ngs('variableGraphPositivePatternComposition', 615, [
  { query: 'SELECT ?s ?g ?o { VALUES ?s { :composition-subject-one :not-present } OPTIONAL { GRAPH ?g { ?s :p ?o } } }', expect: rows([{ s: s1, g: ex('composition-graph-one'), o: ex('composition-object-one') }, { s: np }]) },
  { query: 'SELECT ?s { VALUES ?s { :composition-subject-one :not-present } MINUS { GRAPH ?g { ?s :p ?o } } }', expect: rows([{ s: np }]) },
  { query: 'SELECT ?g ?s ?o { { GRAPH ?g { ?s :p ?o } } UNION { VALUES (?g ?s ?o) { (:union-graph :union-subject :union-object) } } }', expect: rows([{ g: ex('composition-graph-one'), s: s1, o: ex('composition-object-one') }, { g: ex('composition-graph-two'), s: ex('composition-subject-two'), o: ex('composition-object-two') }, { g: ex('union-graph'), s: ex('union-subject'), o: ex('union-object') }]) },
  { query: 'SELECT ?s { VALUES ?s { :composition-subject-one :not-present } FILTER EXISTS { GRAPH ?g { ?s :p ?o } } }', expect: rows([{ s: s1 }]) },
  { query: 'SELECT ?s { VALUES ?s { :composition-subject-one :not-present } FILTER NOT EXISTS { GRAPH ?g { ?s :p ?o } } }', expect: rows([{ s: np }]) },
  { query: 'SELECT ?g ?s ?o { { SELECT ?g ?s ?o { GRAPH ?g { ?s :p ?o } } } }', expect: rows([{ g: ex('composition-graph-one'), s: s1, o: ex('composition-object-one') }, { g: ex('composition-graph-two'), s: ex('composition-subject-two'), o: ex('composition-object-two') }]) },
].map((c) => ({ data: compData, ...c, query: P + c.query })));

const zlData = trig(PFX + ':sender :channel "signal" .\n:receiver :channel "alternate" .\n:first-graph { :named-sender :channel "named-node" }\n:second-graph { :other-sender :channel "other-node" }');
for (const path of [':p?', ':p*', '^:p?', '(:p?/:p?)']) {
  const sig = s('signal');
  ngs('zeroLengthMembership ' + path, 345, [
    { data: null, query: `SELECT ?endpoint { VALUES ?endpoint { "signal" } ?endpoint ${path} ?endpoint }`, expect: count(0), note: 'Empty store, before node insertion.' },
    { data: null, query: `SELECT ?endpoint { VALUES ?endpoint { "signal" } BIND(?endpoint AS ?peer) ?endpoint ${path} ?peer }`, expect: count(0), note: 'Empty store, before node insertion.' },
    { data: zlData, query: `SELECT ?endpoint { VALUES ?endpoint { "signal" } ?endpoint ${path} ?endpoint }`, expect: rows([{ endpoint: sig }]) },
    { data: zlData, query: `SELECT ?endpoint ?peer { VALUES ?endpoint { "signal" } BIND(?endpoint AS ?peer) ?endpoint ${path} ?peer }`, expect: rows([{ endpoint: sig, peer: sig }]) },
    { data: zlData, query: `SELECT ?s ?o { VALUES ?s { "signal" } ?s ${path} ?o }`, expect: rows([{ s: sig, o: sig }]) },
    { data: zlData, query: `SELECT ?s ?o { ?s ${path} ?o VALUES ?o { "signal" } }`, expect: rows([{ s: sig, o: sig }]) },
    { data: zlData, query: `SELECT ?s ?o { VALUES (?s ?o) { ("signal" "signal") } ?s ${path} ?o }`, expect: rows([{ s: sig, o: sig }]) },
    { data: zlData, query: `SELECT ?s ?o { VALUES (?s ?o) { ("signal" "alternate") } ?s ${path} ?o }`, expect: count(0) },
    { data: zlData, query: `SELECT ?endpoint { ?endpoint ${path} ?endpoint } VALUES ?endpoint { "signal" }`, expect: rows([{ endpoint: sig }]), note: 'setBinding("endpoint", "signal") written as a trailing VALUES; the query text changed.' },
    { data: zlData, query: `SELECT ?node { VALUES ?node { :channel } BIND(?node AS ?same) ?node ${path} ?same }`, expect: count(0) },
    { data: zlData, query: `SELECT ?node { VALUES ?node { :unlisted } ?node ${path} ?node }`, expect: count(0) },
    { data: zlData, query: 'SELECT ?check { VALUES ?check { "outside" } :unlisted :channel? :unlisted }', expect: rows([{ check: s('outside') }]) },
    { data: zlData, query: `SELECT ?g ?node { GRAPH ?g { VALUES ?node { "named-node" } ?node ${path} ?node } }`, expect: rows([{ g: ex('first-graph'), node: s('named-node') }]) },
    { data: zlData, query: `SELECT ?g ?node { GRAPH ?g { VALUES ?node { "signal" } ?node ${path} ?node } }`, expect: count(0) },
  ].map((c) => ({ ...c, query: P + c.query })));
}
for (const path of [':p?', ':p*', '^:p*']) {
  ngs('pathGraphIsolation ' + path, 443, [{ data: seed, query: P + `SELECT ?g { GRAPH ?g { VALUES ?v { :a } ?v ${path} ?v } }`, expect: rows([{ g: ex('g1') }]) }]);
}

// ---------------------------------------------------------------- BNR-1 vectors
const vec = JSON.parse(readFileSync(`${UP}/testsuites/sparql/src/main/resources/testdata-bnr/conformance-vectors.json`, 'utf8'));
const BASE = '_:bnode1 <urn:p> "v" .\n_:bnode2 <urn:p> "v" .\n<urn:iriSubject> <urn:p> "v" .\n_:bnode1 <urn:link> _:bnode2 .\n_:bnode1 <urn:blocked> true .\n_:g { _:bnode1 <urn:n> "named" }\n';
const FIX = { empty: null, base: trig(BASE), sole: trig('_:sole <urn:p> 1 .\n') };
const RDFNS = '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n';
const STATIC = new Set(['BNR-002', 'BNR-003', 'BNR-012', 'BNR-013', 'BNR-018', 'BNR-019', 'BNR-020', 'BNR-021', 'BNR-022', 'BNR-023', 'BNR-024', 'BNR-025', 'BNR-026', 'BNR-027', 'BNR-028', 'BNR-029', 'BNR-030', 'BNR-031', 'BNR-032', 'BNR-033', 'BNR-034', 'BNR-079', 'BNR-080', 'BNR-081', 'BNR-082', 'BNR-083', 'BNR-084', 'BNR-085', 'BNR-086', 'BNR-087', 'BNR-088', 'BNR-089', 'BNR-090', 'BNR-091', 'BNR-099', 'BNR-100', 'BNR-101', 'BNR-103', 'BNR-105', 'BNR-123']);
const store = (text) => ({ kind: 'store', format: 'trig', text });
const b1 = bn('bnode1'); const b2 = bn('bnode2');
const minusTriple = (t) => BASE.replace(t + '\n', '');
// Expectations restating assertOutcome (BlankNodeReferenceConformanceTest.java lines 360-563).
const E = {
  'BNR-001': rows([{ blank: bool(true), same: bool(true) }]),
  'BNR-010': rows([{ b: bn('x') }]), 'BNR-011': rows([{ b: bn('x') }]),
  'BNR-016': rows([{ literal: bool(true) }]), 'BNR-017': rows([{ iri: bool(true) }]),
  'BNR-035': rows([{ o: s('v') }]),
  'BNR-036': rows([{ o: s('v') }, { o: s('v') }, { o: s('v') }]),
  'BNR-037': rows([{ s: b1 }]),
  'BNR-038': { kind: 'boolean', value: true }, 'BNR-045': { kind: 'boolean', value: true }, 'BNR-049': { kind: 'boolean', value: true },
  'BNR-044': { kind: 'boolean', value: false }, 'BNR-046': { kind: 'boolean', value: false }, 'BNR-048': { kind: 'boolean', value: false },
  'BNR-039': rows([{ b: b1 }, { b: b1 }]),
  'BNR-040': rows([{ b: b1 }]),
  'BNR-041': rows([{ b: b1, v: int(1) }, { b: b2 }]),
  'BNR-042': rows([{ b: b1, o: s('v') }]),
  'BNR-043': { kind: 'all', of: [rows([{ b: bn('missing') }]), store('')] },
  'BNR-047': rows([{ o: bn('missing') }]),
  'BNR-050': rows([{ b: bn('missing') }]),
  'BNR-051': rows([{ s: b1, o: s('v') }, { s: b2, o: s('v') }, { s: u('urn:iriSubject'), o: s('v') }]),
  'BNR-052': count(0),
  'BNR-053': rows([{ b: b1, n: int(2) }, { b: b2, n: int(1) }]),
  'BNR-055': { kind: 'all', of: [{ kind: 'graph', format: 'turtle', text: '_:fixed <urn:seen> 1, 2 .\n_:f1 <urn:owner> _:fixed ; <urn:value> 1 .\n_:f2 <urn:owner> _:fixed ; <urn:value> 2 .' }, store('')] },
  'BNR-056': { kind: 'graph', format: 'turtle', text: '_:bnode1 <urn:p> "v" .' },
  'BNR-057': { kind: 'graph', format: 'turtle', text: '_:f1 <urn:p> "v" .\n_:f2 <urn:p> "v" .\n_:f3 <urn:p> "v" .' },
  'BNR-058': { kind: 'graph', format: 'turtle', text: '_:f1 <urn:p> _:fixed .\n_:f2 <urn:p> _:fixed .' },
  'BNR-059': rows([{ i: bool(false), l: bool(false), d: bool(false), t: bool(false) }]),
  'BNR-060': rows([{}]), 'BNR-065': rows([{}]),
  'BNR-061': count(0),
  'BNR-062': rows([{ x: s('fallback') }]),
  'BNR-066': count(1),
  'BNR-067': store(BASE + '_:bnode1 <urn:added> 1 .\n'),
  'BNR-068': store('_:f <urn:pointsTo> _:x .'),
  'BNR-069': store('_:f1 <urn:pointsTo> _:fixed .\n_:f2 <urn:pointsTo> _:fixed .'),
  'BNR-070': store('_:x <urn:p> 1 .'),
  'BNR-071': store(minusTriple('_:bnode1 <urn:p> "v" .')),
  'BNR-072': store(BASE),
  'BNR-073': store(minusTriple('_:bnode1 <urn:p> "v" .') + '_:bnode1 <urn:replacement> "v" .\n'),
  'BNR-074': store('_:new <urn:p> 1 .'),
  'BNR-075': store('_:bnode2 <urn:p> "v" .\n<urn:iriSubject> <urn:p> "v" .\n_:g { _:bnode1 <urn:n> "named" }\n'),
  'BNR-076': store(minusTriple('_:bnode1 <urn:p> "v" .')),
  'BNR-077': store('_:x <urn:p> 2 .'),
  'BNR-078': store(''), 'BNR-094': store(''), 'BNR-097': store(''),
  'BNR-092': rows([{ same: bool(true) }]),
  'BNR-093': store('<urn:h> <urn:t> <<( _:s <urn:p> _:o )>> .'),
  'BNR-095': store(RDFNS + '_:r rdf:reifies <<( _:s <urn:p> _:o )>> ; <urn:source> <urn:src> .'),
  'BNR-096': store(RDFNS + '_:s <urn:p> _:o .\n_:r rdf:reifies <<( _:s <urn:p> _:o )>> ; <urn:source> <urn:src> .'),
  'BNR-098': store('_:s <urn:p> _:o .'),
  'BNR-102': store(RDFNS + '<urn:s> <urn:p> <urn:o> .\n_:r rdf:reifies <<( <urn:s> <urn:p> <urn:o> )>> ; <urn:a> 1 ; <urn:b> 2 .'),
  'BNR-104': store('<urn:s> <urn:p> <urn:o> .'),
  'BNR-106': store(RDFNS + '<urn:s> <urn:p> 1, 2 .\n_:r rdf:reifies <<( <urn:s> <urn:p> 1 )>>, <<( <urn:s> <urn:p> 2 )>> .'),
  'BNR-107': rows([{ o: s('named') }]), 'BNR-108': rows([{ o: s('named') }]),
  'BNR-110': store(BASE.replace('_:bnode1 <urn:n> "named"', '_:bnode1 <urn:n2> "named"')),
  'BNR-111': store(BASE + '<urn:source> { <urn:s> <urn:value> 7 }\n_:g { _:bnode1 <urn:copied> 7 }\n'),
  'BNR-118': { kind: 'asks', asks: [{ query: 'ASK { ?s ?p ?o }', value: false }, { query: 'ASK { GRAPH ?g { ?s ?p ?o } }', value: false }] },
  'BNR-121': store('_:sole <urn:q> 2 .'),
};
for (const id of ['BNR-004', 'BNR-005', 'BNR-009', 'BNR-015', 'BNR-064']) E[id] = rows([{ same: bool(true) }]);
for (const id of ['BNR-006', 'BNR-007', 'BNR-008', 'BNR-014', 'BNR-063']) E[id] = rows([{ same: bool(false) }]);
const transfer = {
  'BNR-109': '_:g { _:g <urn:self> _:g }\n',
  'BNR-112': BASE + '_:copy { _:bnode1 <urn:n> "named" }\n',
  'BNR-113': BASE.replace('_:g {', '_:moved {'),
  'BNR-114': BASE + '_:added { _:bnode1 <urn:n> "named" }\n',
  'BNR-115': BASE,
};
const notes = {
  'BNR-010': 'RDF4J pins the blank node ID -123; the result-set comparison is up to blank-node isomorphism, so only the term kind is checked.',
  'BNR-011': 'RDF4J pins the blank node ID "a b>"; only the term kind is checked.',
  'BNR-037': 'RDF4J pins the stored node bnode1; result sets are compared up to blank-node isomorphism.',
  'BNR-055': 'Graph compared up to isomorphism: the fixed node and the two fresh nodes are distinguished by structure.',
  'BNR-066': 'Expectation "never returns a blank node" has no runner kind; the closest check is the single row (RDF4J also accepts an evaluation error here).',
  'BNR-075': 'The Java oracle checks bnode1 has no default-graph statements and the named and bnode2 statements remain; the whole store is compared here (the other statements are untouched by DELETE WHERE).',
  'BNR-111': 'The Java test adds <urn:s> <urn:value> 7 in context <urn:source> (no resolver): that is data here.',
  'BNR-118': 'The Java oracle accepts no contexts or the empty graph emptyGraph; only the absence of statements in the default and named graphs is checked.',
};
const MOCK = 'Needs a mocked federated SERVICE (RDF4J MockFederatedService registered for https://example.invalid/service) that answers or rejects with configured blank-node identity behaviour; not observable through the core API.';
const NP = {
  'BNR-054': 'The oracle is relative: DESCRIBE <_:bnode1> must equal the same implementation\'s DESCRIBE ?s WHERE { VALUES ?s { <_:bnode1> } }, a policy (not a fixed graph); there is no fixed expected graph to port.',
  'BNR-119': 'Needs a controlled document resolver for LOAD <https://example.invalid/input.ttl> (the Java test serves a local temporary file); the core API has no LOAD source resolver.',
  'BNR-124': MOCK, 'BNR-125': MOCK,
};
const QUERY = (r) => /^\s*((BASE|PREFIX)\s+<[^>]*>\s*|VERSION\s+"[^"]*"\s*)*(SELECT|ASK|CONSTRUCT|DESCRIBE)/i.test(r);
for (const v of vec.cases) {
  const id = 'BlankNodeReferenceConformanceTest#' + v.id;
  methods.push(id);
  if (NP[v.id]) { notPorted.push({ id, file: BNR, reason: NP[v.id] }); continue; }
  const base = { file: BNR, line: 122, sparql12: true, data: FIX[v.fixture] };
  const vnote = `BNR-1 vector ${v.id} (${v.group}, mode ${v.mode}): ${v.title}. Vector oracle: ${v.expected}`;
  const reqs = v.requests;
  let c;
  if (STATIC.has(v.id)) {
    c = QUERY(reqs[0]) ? { query: reqs[0] } : { update: reqs[0] };
    c.expect = { kind: 'error' };
    c.note = vnote + ' The Java test asserts MalformedQueryException at prepare time and an unchanged store; only the refusal is checked.';
  } else if (v.id === 'BNR-120') {
    cases.push({ id, ...base, query: reqs[0], expect: { kind: 'boolean', value: false }, note: vnote + ' First evaluation of the prepared ASK, on the empty store.' });
    c = { update: reqs[1], expect: { kind: 'asks', asks: [{ query: reqs[2], value: true }] }, note: 'Second evaluation after the INSERT DATA; reuse of one prepared query object is not observable through the core API.' };
    cases.push({ id: id + '#2', ...base, ...c });
    continue;
  } else if (v.id === 'BNR-122') {
    cases.push({ id, ...base, query: reqs[0], expect: rows([{ s: b1 }]), note: vnote + ' The SPARQL/JSON round trip of the returned blank node ID is Java API; not ported.' });
    cases.push({ id: id + '#2', ...base, query: reqs[1], expect: { kind: 'boolean', value: true } });
    continue;
  } else if (v.id === 'BNR-126') {
    c = { query: reqs[0], expect: rows([{ x: int(1) }]), note: vnote + ' The Java test registers a mock endpoint that rejects the request; here https://example.invalid/service is unregistered (the .invalid TLD never resolves), so SERVICE SILENT must still keep x=1.' };
  } else if (transfer[v.id]) {
    c = { update: reqs[0], expect: { kind: 'all', of: [{ kind: 'asks', asks: [{ query: reqs[1], value: true }] }, store(transfer[v.id])] } };
  } else if (v.id === 'BNR-116' || v.id === 'BNR-117') {
    c = { update: reqs[0], expect: { kind: 'all', of: [{ kind: 'asks', asks: [{ query: reqs[1], value: true }] }, store(BASE.replace('_:g { _:bnode1 <urn:n> "named" }\n', ''))] }, note: 'The Java oracle checks the ASK, the bnode1 p v statement, and no statement in context g; the whole store is compared here.' };
  } else if (QUERY(reqs[0])) {
    c = { query: reqs[0], expect: E[v.id] };
  } else {
    c = { update: reqs.length === 1 ? reqs[0] : reqs, expect: E[v.id] };
  }
  if (!c.expect) throw new Error('no expectation for ' + v.id);
  if (v.id === 'BNR-111') base.data = FIX.base && trig(BASE + '<urn:source> { <urn:s> <urn:value> 7 }\n');
  c.note = [vnote, c.note, notes[v.id]].filter(Boolean).join(' ');
  if (!c.note.startsWith('BNR-1')) c.note = vnote + ' ' + c.note;
  cases.push({ id, ...base, ...c });
}
// Generated nested reference closure tests (lines 131-161).
for (let depth = 1; depth <= 8; depth++) {
  let sp = '<<( <_:bnode1> <urn:p> <_:bnode2> )>>';
  let val = tt(b1, u('urn:p'), b2);
  for (let level = 2; level <= depth; level++) {
    sp = `<<( <urn:outer${level}> <urn:contains> ${sp} )>>`;
    val = tt(u('urn:outer' + level), u('urn:contains'), val);
  }
  const query = 'SELECT ?term ?graph ?equal ?present WHERE { '
    + `VALUES (?term ?graph) { (${sp} <_:g>) } `
    + `BIND(sameTerm(?term, ${sp}) AS ?equal) `
    + 'OPTIONAL { VALUES ?present { <_:bnode1> } } '
    + 'FILTER(BOUND(?present)) '
    + '{ VALUES ?branch { true } } UNION { VALUES ?branch { false } } '
    + 'FILTER(?branch = ?equal) '
    + 'MINUS { VALUES ?term { <urn:not-a-triple-term> } } }';
  const id = 'BlankNodeReferenceConformanceTest#nested-depth-' + depth;
  methods.push(id);
  cases.push({
    id, file: BNR, line: 131, sparql12: true, data: FIX.base, query,
    expect: rows([{ term: val, graph: bn('g'), equal: bool(true), present: b1 }]),
    note: `Generated test "BNR generated nested reference closure depth ${depth}". RDF4J pins ?graph to blank node g and ?present to bnode1 (the same node as inside ?term); compared up to blank-node isomorphism.`,
  });
}

const out = { classes: ['NamedGraphScopeTest', 'BlankNodeReferenceConformanceTest'], methods, cases, notPorted };
const ported = new Set(cases.map((c) => c.id.split('#').slice(0, 2).join('#')));
for (const m of methods) if (!ported.has(m) && !notPorted.some((x) => x.id === m)) throw new Error('unaccounted ' + m);
writeFileSync(new URL('./compliance-part-D.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
console.log(`methods ${methods.length}, cases ${cases.length}, notPorted ${notPorted.length}`);
