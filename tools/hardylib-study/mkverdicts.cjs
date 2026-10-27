// Writes conformance/hardylib/verdicts.json from a run of the hardylib parser
// and serializer suite: HARDYLIB_REPORT=report.json node --test conformance/hardylib/
// then: node tools/hardylib-study/mkverdicts.cjs report.json > conformance/hardylib/verdicts.json
// Every failing case must match a rule below (CLAUDE.md rule 2), or this stops.
const o = require(process.argv[2]);
const R = {
  n3: { verdict: 'divergence', ref: 'https://github.com/danbri/factoidal/issues/883', section: 'Notation3 is a W3C Community Group report (https://w3c.github.io/N3/spec/), not part of the RDF 1.1/1.2 Recommendations; @factoidal/core has no N3 reader or writer' },
  trix: { verdict: 'divergence', section: 'TriX (HP Labs report HPL-2004-56) is not a W3C syntax; @factoidal/core has no TriX writer' },
  hext: { verdict: 'divergence', section: 'HexTuples (https://github.com/ontola/hextuples) is not a W3C syntax; @factoidal/core has no HexTuples reader or writer' },
  patch: { verdict: 'divergence', section: 'RDF Patch (https://afs.github.io/rdf-patch/) is not a W3C syntax; @factoidal/core has no RDF Patch writer' },
};
const cases = {};
for (const [id, { outcome }] of Object.entries(o)) {
  if (outcome === 'pass') continue;
  const p = id.split('/'); const file = p[2], fmt = p[3];
  let v;
  if (outcome === 'no-reader' || outcome === 'no-writer') {
    const which = outcome === 'no-reader' ? (id.startsWith('variants') ? (id.endsWith('.hext') ? 'hext' : 'n3') : 'n3') : fmt;
    v = { ...R[which] };
  } else if (file === 'even_more_literals.nt') {
    v = { verdict: 'divergence', section: 'RDF 1.1 N-Triples section 7, production [153s] ECHAR: "\\/" (line 24) is not an escape; RDFLib reads it as "/"' };
  } else if (['literals-02.nt', 'literals-05.nt', 'rdflibtest05.nt', 'test.nt'].includes(file)) {
    v = { verdict: 'defect', ref: 'https://github.com/danbri/factoidal/issues/1047', note: 'RDF/XML writer writes CR raw; XML 1.0 section 2.11 turns it into LF' };
  } else if (['qname-02.nt', 'rdflibtest-pnamebrackets.nt'].includes(file)) {
    v = { verdict: 'divergence', section: 'RDF 1.1 XML Syntax section 8: a graph whose property IRI ends in no XML NCName cannot be written in RDF/XML; the writer refuses (RDFLib marks this pair xfail too)' };
  } else if (['special_chars.nt', 'diverse_triples.nt', 'diverse_quads.nq', 'diverse_quads.trig'].includes(file)) {
    v = { verdict: 'defect', ref: 'https://github.com/danbri/factoidal/issues/1048', note: 'RDF/XML writer refuses <example:predicate>, which splits into namespace example: and NCName predicate' };
  } else if (id === 'variants/schema_only_base/.nt~.ttl') {
    v = { verdict: 'divergence', section: 'RFC 3986 section 5.2.3 (merge): base <example:> has no authority and no "/" in its path, so <class_to_class> resolves to <example:class_to_class>; the upstream .nt variant has <example:/class_to_class> (RDFLib marks the .ttl variant xfail too)' };
  } else if (id === 'variants/xml_literal/.nt~.rdf') {
    v = { verdict: 'divergence', section: 'RDF 1.1 XML Syntax section 7.2.17: rdf:parseType="Literal" content is exclusive-canonical XML, so <p .../> is read as <p ...></p>; a different lexical form is a different term (RDF 1.1 Concepts section 3.3). RDFLib normalises rdf:XMLLiteral lexical forms when it makes a Literal' };
  } else if (id === 'variants/rdf11trig_eg2/.nq~.jsonld') {
    v = { verdict: 'divergence', section: 'JSON-LD 1.1 Processing Algorithms: the top-level-only @graph unwrapping is Expansion step 19.1; the inner { "@graph": [...] } with no @id is a graph object, which Node Map Generation names with a fresh blank node, so its two triples are in a named graph, not the default graph (Claude-inferred reading)' };
  } else throw new Error('no rule for ' + id + ' ' + outcome);
  v.outcome = outcome;
  cases[id] = v;
}
console.log(JSON.stringify({ factoidalCore: '0.18.0', rdflibCommit: '58c3700e5e21b5b833d0e31072f930c665059db2', cases }, null, 1));
