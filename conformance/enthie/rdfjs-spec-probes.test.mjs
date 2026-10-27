// Checks written for this repository from the text of the RDF/JS Data Model
// specification (https://rdf.js.org/data-model-spec/, W3C Community Group
// report) and the RDF/JS Dataset specification
// (https://rdf.js.org/dataset-spec/), for clauses the rdfjs-base suites do
// not test. Not derived from any test suite. Each case cites its clause.
import { strictEqual, ok } from 'node:assert';
import * as core from '@factoidal/core';
import { vtest } from './harness.mjs';

const f = core.dataFactory;
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

// Data model, Literal: "language the language as lowercase [BCP47] string".
vtest('rdfjs-spec/core > Literal.language is lowercase (factory)', () => {
  strictEqual(f.literal('x', 'EN-GB').language, 'en-gb');
});
vtest('rdfjs-spec/core > Literal.language is lowercase (factory, DirectionalLanguage)', () => {
  strictEqual(f.literal('x', { language: 'AR', direction: 'rtl' }).language, 'ar');
});
vtest('rdfjs-spec/core > Literal.language is lowercase (parse)', async () => {
  const ds = await core.parse('<http://a> <http://b> "x"@EN-GB .', 'turtle');
  strictEqual(ds.toArray()[0].object.language, 'en-gb');
});
vtest('rdfjs-spec/core > Literal.language is lowercase (query)', async () => {
  const rows = await core.query('<http://a> <http://b> "x"@EN-GB .', 'SELECT ?o { ?s ?p ?o }', 'turtle');
  strictEqual(rows[0].get('o').language, 'en-gb');
});
// Data model, Literal: direction "MUST be either ltr or rtl"; dirLangString datatype.
vtest('rdfjs-spec/core > query() answers a directional literal with direction and rdf:dirLangString', async () => {
  const rows = await core.query('<http://a> <http://b> "x"@en--rtl .', 'SELECT ?o { ?s ?p ?o }', { format: 'turtle12', version: '1.2' });
  const o = rows[0].get('o');
  strictEqual(o.direction, 'rtl');
  strictEqual(o.datatype.value, RDF + 'dirLangString');
  ok(o.equals(f.literal('x', { language: 'en', direction: 'rtl' })));
});
// Data model, Term.equals: terms from query() are equal to factory terms.
vtest('rdfjs-spec/core > query() terms equal factory terms (termType, value, equals)', async () => {
  const rows = await core.query('<http://a> <http://b> "1"^^<http://www.w3.org/2001/XMLSchema#integer>, _:x .',
    'SELECT ?s ?o { ?s ?p ?o } ORDER BY ?o', 'turtle');
  strictEqual(rows.length, 2);
  for (const r of rows) {
    ok(r.get('s').equals(f.namedNode('http://a')));
    ok(['Literal', 'BlankNode'].includes(r.get('o').termType));
  }
  const lit = rows.map((r) => r.get('o')).find((t) => t.termType === 'Literal');
  ok(lit.equals(f.literal('1', f.namedNode('http://www.w3.org/2001/XMLSchema#integer'))));
  ok(!lit.equals(f.literal('01', f.namedNode('http://www.w3.org/2001/XMLSchema#integer'))));
});
// Data model, Quad: "termType contains the constant 'Quad'", "value contains an empty string".
vtest('rdfjs-spec/core > parsed quads are Quad terms (termType Quad, value empty)', async () => {
  const q = (await core.parse('<http://a> <http://b> <http://c> .', 'turtle')).toArray()[0];
  strictEqual(q.termType, 'Quad');
  strictEqual(q.value, '');
  strictEqual(q.graph.termType, 'DefaultGraph');
});
// Data model, DataFactory.literal: "If languageOrDatatype is a NamedNode, then it is used for the value of datatype."
vtest('rdfjs-spec/core > literal(value, NamedNode) keeps the datatype', () => {
  strictEqual(f.literal('x', f.namedNode('http://example.org/dt')).datatype.value, 'http://example.org/dt');
});
// Dataset spec, DatasetCore.match: "Returns a new dataset that is comprised of all quads in the current instance matching the given arguments."
vtest('rdfjs-spec/core > Dataset.match answers a new dataset; the source is unchanged', async () => {
  const ds = await core.parse('<http://a> <http://b> <http://c> . <http://a> <http://d> <http://c> .', 'turtle');
  const m = ds.match(null, f.namedNode('http://b'));
  strictEqual(m.size, 1);
  strictEqual(ds.size, 2);
  m.add(f.quad(f.namedNode('http://x'), f.namedNode('http://y'), f.namedNode('http://z')));
  strictEqual(ds.size, 2);
});
