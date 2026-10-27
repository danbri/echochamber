/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 *   SPDX-License-Identifier: Apache-2.0
 */
// Derived from Apache Jena (Apache License 2.0) at commit
// a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98:
//   jena-core/src/test/java/org/apache/jena/junit/NodeCreateUtils.java
//   jena-core/src/test/java/org/apache/jena/graph/GraphTestLib.java
//   jena-core/src/test/java/org/apache/jena/rdf/model/ModelTestLib.java
//   jena-core/src/test/java/org/apache/jena/test/JenaTestLib.java
//   jena-core/src/main/java/org/apache/jena/shared/PrefixMapping.java (the
//     Standard and Extended tables, as test data)
// Changed for echochamber: translated from Java to JavaScript over
// @factoidal/leana; the Standard and Extended prefix tables are test data
// here (leana itself does not hold vocabulary IRIs: GAPS.md 'vocabulary');
// Java Sets become JenaSet; `as(Class)` becomes leana's typed wrappers.

import assert from 'node:assert/strict';
import {
  Node, NodeFactory, Triple, PrefixMapping, GraphMemFactory, ModelFactory, Property, JenaException,
  JenaSet, LeanaUnsupportedError,
} from '@factoidal/leana';

// --- PrefixMapping.Standard and PrefixMapping.Extended, as test data.
export const NS = Object.freeze({
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dc: 'http://purl.org/dc/elements/1.1/',
  owl: 'http://www.w3.org/2002/07/owl#',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  rss: 'http://purl.org/rss/1.0/',
  vcard: 'http://www.w3.org/2001/vcard-rdf/3.0#',
  ja: 'http://jena.hpl.hp.com/2005/11/Assembler#',
  eg: 'http://www.example.org/',
});

function makePM(keys) {
  const pm = PrefixMapping.Factory.create();
  for (const k of keys) pm.setNsPrefix(k, NS[k]);
  return pm.lock();
}
export const Standard = makePM(['rdfs', 'rdf', 'dc', 'owl', 'xsd']);
export const Extended = makePM(['rdfs', 'rdf', 'dc', 'owl', 'xsd', 'rss', 'vcard', 'ja', 'eg']);

/** XSD datatype IRIs used by the tests (test data). */
export const XSD = new Proxy({}, { get: (_, k) => NS.xsd + String(k) });

// --- NodeCreateUtils

function unEscapeChar(ch) {
  switch (ch) {
    case '\\': case '"': case '\'': return ch;
    case 'n': return '\n';
    case 's': return ' ';
    case 't': return '\t';
    default: return 'Z';
  }
}
function unEscape(spelling) {
  if (spelling.indexOf('\\') < 0) return spelling;
  let out = '', start = 0;
  for (;;) {
    const b = spelling.indexOf('\\', start);
    if (b < 0) break;
    out += spelling.substring(start, b) + unEscapeChar(spelling.charAt(b + 1));
    start = b + 2;
  }
  return out + spelling.substring(start);
}

export function literal(pm, spelling, langOrType) {
  const content = unEscape(spelling);
  const colon = langOrType.indexOf(':');
  return colon < 0
    ? NodeFactory.createLiteralLang(content, langOrType)
    : NodeFactory.createLiteralDT(content, NodeFactory.getType(pm.expandPrefix(langOrType)));
}

function newStringNode(pm, quote, s) {
  const close = s.lastIndexOf(quote);
  return literal(pm, s.substring(1, close), s.substring(close + 1));
}

/** NodeCreateUtils.create([pm,] x). */
export function create(pm, x) {
  if (x === undefined) { x = pm; pm = Extended; }
  if (x === null || x === undefined) throw new TypeError('null');
  if (x === '') throw new JenaException('Node.create does not accept an empty string as argument');
  const first = x.charAt(0);
  if (first === '\'' || first === '"') return newStringNode(pm, first, x);
  if (first >= '0' && first <= '9') return NodeFactory.createLiteralDT(x, NS.xsd + 'integer');
  if (first === '_') return NodeFactory.createBlankNode(x);
  if (x === '??') return Node.ANY;
  if (first === '?') return NodeFactory.createVariable(x.substring(1));
  if (first === '&') return NodeFactory.createURI('q:' + x.substring(1));
  const colon = x.indexOf(':');
  const d = pm.getNsPrefixURI('');
  return colon < 0 ? NodeFactory.createURI((d === null ? 'eh:/' : d) + x) : NodeFactory.createURI(pm.expandPrefix(x));
}

/** NodeCreateUtils.createTriple([pm,] fact); default mapping Standard. */
export function createTriple(pm, fact) {
  if (fact === undefined) { fact = pm; pm = Standard; }
  const [s, p, o] = fact.trim().split(/\s+/);
  return Triple.create(create(pm, s), create(pm, p), create(pm, o));
}

// --- GraphTestLib

export const node = (x) => create(x);
export const nodeSet = (s) => new JenaSet(s.trim().split(/\s+/).filter(Boolean).map(node));
export const nodeList = (s) => s.trim().split(/\s+/).filter(Boolean).map(node);
export const nodeArray = nodeList;
export const triple = (pm, fact) => (fact === undefined ? createTriple(pm) : createTriple(pm, fact));
const semis = (s) => s.split(';').filter((x) => x.trim() !== '');
export const tripleArray = (facts) => semis(facts).map((f) => createTriple(Extended, f));
export const tripleSet = (facts) => new JenaSet(semis(facts).map((f) => createTriple(f)));
export function graphAdd(g, s) {
  for (const f of semis(s)) g.add(createTriple(Extended, f));
  return g;
}
/** GraphTestLib.newGraph(): Jena uses createDefaultGraphSameValue(); leana's graphs are same-term. */
export function newGraph() {
  const g = GraphMemFactory.createGraphMem();
  g.getPrefixMapping().setNsPrefixes(Extended);
  return g;
}
export const graphWith = (s) => graphAdd(newGraph(), s);
export function assertIsomorphic(title, expected, got) {
  if (got === undefined) { got = expected; expected = title; title = 'graphs must be isomorphic'; }
  if (!expected.isIsomorphicWith(got)) assert.fail(`${title}: wanted ${expected} but got ${got}`);
}
export const assertEqualsTemplate = (title, g, template) => assertIsomorphic(title, graphWith(template), g);
export const assertContains = (name, s, g) => assert.ok(g.contains(triple(s)), `${name} must contain ${s}`);
export const assertContainsAll = (name, g, s) => { for (const f of semis(s)) assertContains(name, f, g); };
export const assertOmits = (name, g, s) => assert.ok(!g.contains(triple(s)), `${name} must not contain ${s}`);
export const assertOmitsAll = (name, g, s) => { for (const f of semis(s)) assertOmits(name, g, f); };

// --- JenaTestLib

/** Java assertEquals: equals() when the expected value has it, else ===. */
export function assertEquals(expected, actual, msg) {
  if (expected && typeof expected.equals === 'function') {
    assert.ok(expected.equals(actual), msg || `expected ${expected} but was ${actual}`);
  } else {
    assert.equal(actual, expected, msg);
  }
}
export function assertDiffer(title, x, y) {
  if (y === undefined) { y = x; x = title; title = 'objects should be different'; }
  assert.ok(!(x && typeof x.equals === 'function' ? x.equals(y) : x === y), `${title}: ${x} and ${y}`);
}
/** Assert that fn throws an instance of Cls (and not a leana gap, unless Cls is the gap class). */
export function assertThrows(Cls, fn, msg) {
  let err = null;
  try { fn(); } catch (e) { err = e; }
  if (err === null) assert.fail(msg || `expected ${Cls.name}`);
  if (err instanceof LeanaUnsupportedError && Cls !== LeanaUnsupportedError) throw err;
  if (!(err instanceof Cls)) throw err;
  return err;
}

// --- ModelTestLib

export function createModel() {
  const m = ModelFactory.createDefaultModel();
  m.setNsPrefixes(Extended);
  return m;
}
export const createMemModel = () => ModelFactory.createDefaultModel();
const aModel = createModel();
export const rdfNode = (m, s) => m.asRDFNode(create(m, s));
export const resource = (m, s) => (s === undefined ? rdfNode(aModel, m) : rdfNode(m, s));
export const property = (m, s) => (s === undefined ? new Property(create(aModel, m), aModel) : new Property(create(m, s), m));
export const literalOf = (m, s) => rdfNode(m, s).asLiteral();
export const resources = (m, items) => items.trim().split(/\s+/).map((x) => resource(m, x));
export const resourceSet = (items) => new JenaSet(items.trim().split(/\s+/).map((x) => resource(x)));
export function statement(m, fact) {
  if (fact === undefined) { fact = m; m = aModel; }
  const [s, p, o] = fact.trim().split(/\s+/);
  return m.createStatement(resource(m, s), property(m, p), rdfNode(m, o));
}
export const statements = (m, facts) => semis(facts).map((f) => statement(m, f));
export function modelAdd(m, facts) {
  for (const f of semis(facts)) m.add(statement(m, f));
  return m;
}
export const modelWithStatements = (facts) => modelAdd(createModel(), facts);
export function assertIsoModels(title, wanted, got) {
  if (got === undefined) { got = wanted; wanted = title; title = 'models must be isomorphic'; }
  if (!wanted.isIsomorphicWith(got)) assert.fail(`${title}: expected ${wanted} but had ${got}`);
}

// --- Vocabulary constants used by the tests (test data; Jena org.apache.jena.vocabulary.RDF).
// RDF.x is the Property (a Resource) with IRI rdf:x.
export const RDF = new Proxy({}, { get: (_, k) => new Property(NodeFactory.createURI(NS.rdf + String(k)), null) });

// --- AbstractModelTestBase (jena-core/src/test/java/org/apache/jena/rdf/model/AbstractModelTestBase.java)
// Java typed test values. A JS number cannot carry byte/short/int/float/double, nor a
// char apart from a string; long is a BigInt. leana must refuse to guess a datatype.
export class LitTestObj {
  constructor(l) { this.content = typeof l === 'string' ? BigInt(l.substring(1, l.length - 1)) : BigInt(l); }
  equals(o) { return o instanceof LitTestObj && this.content === o.content; }
  toString() { return '[' + this.content + ']'; }
}
export const tv = Object.freeze({
  tvBoolean: true, tvByte: 1, tvShort: 2, tvInt: -1, tvLong: -2n, tvChar: '!', tvFloat: 123.456,
  tvDouble: -123.456, tvString: 'test 12 string', tvLitObj: new LitTestObj(1234), tvObject: new LitTestObj(12345),
  dDelta: 0.000000005, fDelta: 0.000005,
});
/** AbstractModelTestBase.createExtendedModel / modelWithStatements over createModel(). */
export const createExtendedModel = createModel;

// --- Jena XSDDatatype constants (test data): XSDDatatype.XSDint is the datatype object
// of xsd:int; XSDDatatype.XSD is the namespace without '#'.
export const XSDDatatype = new Proxy({}, {
  get: (_, k) => (k === 'XSD' ? NS.xsd.slice(0, -1) : NodeFactory.getType(NS.xsd + String(k).replace(/^XSD/, ''))),
});
/** Jena RDF.dtLangString, RDF.dtDirLangString (test data). */
export const dtLangString = NodeFactory.getType(NS.rdf + 'langString');
export const dtDirLangString = NodeFactory.getType(NS.rdf + 'dirLangString');

// --- GraphTestLib.testContains / testOmits (fork A1)
function triplesOf(x) {
  if (x && typeof x.find === 'function' && typeof x.size === 'function') return x.find().toList();
  if (x && typeof x.toList === 'function') return x.toList();
  return [...x];
}
/** testContains(g, Triple[] | List | Iterator | Graph). */
export function testContains(g, triples) {
  for (const t of triplesOf(triples)) assert.ok(g.contains(t), 'contains ' + t);
}
/** testOmits(g, Triple[] | List | Iterator | Graph). */
export function testOmits(g, triples) {
  for (const t of triplesOf(triples)) assert.ok(!g.contains(t), 'omits ' + t);
}
