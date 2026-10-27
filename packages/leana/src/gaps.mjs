// leana: the gap table. Each key is one family of Jena semantics that
// @factoidal/core does not provide, with the danbri/factoidal issue that asks
// for it. packages/leana/GAPS.md lists the methods of each family; the
// conformance suite (conformance/leana) checks that the two agree.
//
// Apache License 2.0. Written for leana; the method names are Apache Jena's.

export const GAPS = Object.freeze({
  'value-matching': {
    summary: 'value-based term matching (same-value graphs, sameValueAs) needs an engine op',
    issue: 'https://github.com/danbri/factoidal/issues/1052',
  },
  'js-value-literal': {
    summary: 'the datatype of a literal made from a JavaScript value must come from an engine table',
    issue: 'https://github.com/danbri/factoidal/issues/1051',
  },
  'literal-value': {
    summary: 'the value of a literal (lexical-to-value mapping, datatype objects) needs an engine op',
    issue: 'https://github.com/danbri/factoidal/issues/1051',
  },
  'syntax-from-name': {
    summary: 'choosing an RDF syntax from a file name or media type needs an engine op',
    issue: 'https://github.com/danbri/factoidal/issues/1053',
  },
  'iri-split': {
    summary: 'splitting an IRI into namespace and local name, qnames and prefix-name legality need an engine op',
    issue: 'https://github.com/danbri/factoidal/issues/1051',
  },
  'vocabulary': {
    summary: 'vocabulary IRIs (rdf:, rdfs:, xsd:, owl: and the standard prefix tables) must come from an engine table',
    issue: 'https://github.com/danbri/factoidal/issues/1051',
  },
  'collections': {
    summary: 'RDF collections and containers (rdf:List, rdf:Seq, rdf:Bag, rdf:Alt) need engine ops',
    issue: 'https://github.com/danbri/factoidal/issues/1051',
  },
  'isomorphism-rdf12': {
    summary: 'isomorphism of graphs with blank nodes and RDF 1.2 triple terms (RDFC-1.0 has no rule for triple terms)',
    issue: 'https://github.com/danbri/factoidal/issues/957',
  },
  'inference': {
    summary: 'the Jena rule language and a synchronous (live) inference graph need engine ops',
    issue: 'https://github.com/danbri/factoidal/issues/1087',
  },
  // Echo gaps: leana has not done it yet. No engine semantics are missing.
  'echo': {
    summary: 'not implemented in leana stage 1 (no engine semantics missing)',
    issue: null,
  },
});
