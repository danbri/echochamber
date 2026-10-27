// Tests of the RDFLib-style prototype. The cases marked "RDFLib:" are
// derived from RDFLib (https://github.com/RDFLib/rdflib, commit
// 58c3700e5e21b5b833d0e31072f930c665059db2), test/test_graph/test_graph.py,
// test/test_graph/test_graph_operator.py, test/test_namespace/test_namespace.py
// and the doctests of rdflib/term.py. RDFLib: Copyright (c) 2002-2026,
// RDFLib Team. BSD 3-Clause License.
// Changes: rewritten as node:test in JavaScript; Python operators are the
// method names of docs/echo02/feasibility.md section 5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Graph, URIRef, BNode, Literal, Namespace, NotSupported, n3, valueEquals, toValue } from '../index.mjs';

const EX = Namespace('http://example.org/');
const RDF_TYPE = URIRef('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
const XSD = Namespace('http://www.w3.org/2001/XMLSchema#');

async function people() {
  // RDFLib: test_graph.py fixture (tarek, bob, michel likes cheese/pizza)
  const g = await Graph.create();
  const [tarek, bob, michel, likes, hates, pizza, cheese] =
    ['tarek', 'bob', 'michel', 'likes', 'hates', 'pizza', 'cheese'].map((n) => EX[n]);
  g.add([tarek, likes, pizza]).add([tarek, likes, cheese]).add([michel, likes, pizza])
    .add([michel, likes, cheese]).add([bob, likes, cheese]).add([bob, hates, pizza])
    .add([bob, hates, michel]);
  return { g, tarek, bob, michel, likes, hates, pizza, cheese };
}

test('Namespace: attribute, item and term() give the same IRI', () => {
  assert.ok(EX.foo.equals(URIRef('http://example.org/foo')));
  assert.ok(EX['foo'].equals(EX.term('foo')));
  assert.equal(`${EX}`, 'http://example.org/');
  assert.ok(EX.term('then').equals(URIRef('http://example.org/then')));
  assert.equal(EX.then, undefined); // not a thenable
});

test('RDFLib: add, len, contains with wildcards, remove with a pattern', async () => {
  const { g, tarek, bob, likes, pizza, cheese, hates } = await people();
  assert.equal(g.length, 7);
  assert.ok(g.contains([tarek, likes, pizza]));
  assert.ok(g.contains([bob, null, null]));
  assert.ok(!g.contains([tarek, hates, null]));
  g.remove([null, hates, null]);
  assert.equal(g.length, 5);
  g.remove([tarek, null, null]);
  assert.equal(g.length, 3);
  assert.ok(!g.contains([tarek, likes, cheese]));
});

test('RDFLib: triples, subjects, objects, value', async () => {
  const { g, tarek, bob, michel, likes, cheese, pizza } = await people();
  assert.equal([...g.triples([null, likes, null])].length, 5);
  assert.equal([...g.subjects(likes, cheese)].length, 3);
  assert.equal([...g.objects(bob, null, { unique: true })].length, 3);
  assert.ok(g.value(bob, URIRef('http://example.org/hates'), null, { any: true }));
  assert.equal(g.value(tarek, URIRef('http://example.org/nothing')), null);
  assert.throws(() => g.value(tarek, likes, null, { any: false }), /more than one/);
  assert.deepEqual(new Set([...g.subjects(likes, pizza)].map(n3)), new Set([n3(tarek), n3(michel)]));
});

test('RDFLib: graph operators (+, -, *, ^) as methods', async () => {
  // RDFLib: test_graph_operator.py and test_graph.py test_graph_arithmetic
  const g1 = await Graph.create(); const g2 = await Graph.create();
  g1.add([EX.a, EX.p, EX.b]).add([EX.a, EX.p, EX.c]);
  g2.add([EX.a, EX.p, EX.c]).add([EX.a, EX.p, EX.d]);
  assert.equal((await g1.union(g2)).length, 3);
  assert.equal((await g1.difference(g2)).length, 1);
  assert.equal((await g1.intersection(g2)).length, 1);
  assert.equal((await g1.symmetricDifference(g2)).length, 2);
  g1.addAll(g2);
  assert.equal(g1.length, 3);
});

test('parse, serialize, isomorphic: the engine reads, writes and compares', async () => {
  const g = await Graph.create();
  await g.parse({ data: '@prefix ex: <http://example.org/> . ex:a ex:p [ ex:q "x"@en ] .', format: 'turtle' });
  assert.equal(g.length, 2);
  const ttl = await g.serialize({ format: 'turtle' });
  assert.match(ttl, /ex:/);
  const h = await Graph.create();
  await h.parse({ data: await g.serialize({ format: 'nt' }), format: 'nt' });
  assert.equal(await g.isomorphic(h), true);
  await assert.rejects(() => (async () => { const k = await Graph.create(); await k.parse({ data: '<http://a> <http://b> .', format: 'turtle' }); })(), (e) => e.code === 'parse.syntax');
});

test('query and update go to the engine', async () => {
  const { g, likes } = await people();
  const rows = await g.query('SELECT ?s WHERE { ?s <http://example.org/likes> <http://example.org/pizza> }');
  assert.equal(rows.length, 2);
  assert.equal(await g.query('ASK { ?s <http://example.org/hates> ?o }'), true);
  const c = await g.query('CONSTRUCT { ?o <http://example.org/likedBy> ?s } WHERE { ?s <http://example.org/likes> ?o }');
  assert.ok(c instanceof Graph);
  assert.equal(c.length, 5);
  await g.update('DELETE WHERE { ?s <http://example.org/likes> ?o }');
  assert.equal([...g.triples([null, likes, null])].length, 0);
});

test('terms: equality is RDF term equality (RDF 1.1 Concepts section 3.3)', async () => {
  // RDFLib: Literal("01", datatype=XSD.integer) == Literal("1", datatype=XSD.integer)
  // because RDFLib normalises; RDF term equality says they differ.
  const a = Literal('01', { datatype: XSD.integer }); const b = Literal('1', { datatype: XSD.integer });
  assert.equal(a.equals(b), false);
  assert.equal(await valueEquals(a, b), true);                 // SPARQL '=' (RDFLib Literal.eq)
  assert.equal(await valueEquals(Literal('a'), Literal('1', { datatype: XSD.integer })), null); // type error
  // RDF 1.1: a simple literal is an xsd:string literal (RDFLib keeps datatype None apart).
  assert.ok(Literal('x').equals(Literal('x', { datatype: XSD.string })));
  assert.equal(n3(Literal('x', { lang: 'en' })), '"x"@en');
  assert.ok(!URIRef('foo').equals(BNode('foo')));
  const g = await Graph.create();
  g.add([EX.s, EX.p, a]);
  assert.equal(g.contains([EX.s, EX.p, b]), false);            // term-based, as SPARQL 1.1 section 18.3
});

test('gaps throw NotSupported with the issue', async () => {
  assert.throws(() => Literal(12), NotSupported);
  assert.throws(() => toValue(Literal('1', { datatype: XSD.integer })), (e) => e instanceof NotSupported && /issues\/1051/.test(e.issue));
  const g = await Graph.create();
  assert.throws(() => g.qname(EX.foo), NotSupported);
});
