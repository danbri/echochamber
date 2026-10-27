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
//   jena-core/src/test/java/org/apache/jena/graph/TestReifier.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on GraphMemFactory.createDefaultGraph() (Jena
// runs it per GraphCreators kind). RDF.Nodes.x are test data (the IRIs of
// lib/testlib.mjs NS.rdf); leana's ReifierStd is a gap ('vocabulary'). Java Sets
// are JenaSet; Iter.toSet is ExtendedIterator.toSet().

import assert from 'node:assert/strict';
import {
  NodeFactory, Triple, GraphMemFactory, ReifierStd, AlreadyReifiedException, CannotReifyException,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  createTriple, node, nodeSet, triple, tripleSet, graphAdd, graphWith, assertIsomorphic, assertEquals, assertDiffer, NS,
} from '../../lib/testlib.mjs';

const RDFNodes = new Proxy({}, { get: (_, k) => NodeFactory.createURI(NS.rdf + String(k)) });

describeJena('TestReifier', 'jena-core/src/test/java/org/apache/jena/graph/TestReifier.java', (t) => {
  const getGraph = () => GraphMemFactory.createDefaultGraph();

  t('testGetGraphNotNull', () => {
    assert.notEqual(getGraph(), null);
  });

  t('testStandard', () => {
    const g = getGraph();
    assert.ok(!ReifierStd.hasTriple(g, triple('s p o')));
    g.add(createTriple('x rdf:subject s'));
    assert.equal(g.size(), 1);
    g.add(createTriple('x rdf:predicate p'));
    assert.equal(g.size(), 2);
    g.add(createTriple('x rdf:object o'));
    assert.equal(g.size(), 3);
    g.add(createTriple('x rdf:type rdf:Statement'));
    assert.equal(g.size(), 4);
    assert.ok(ReifierStd.hasTriple(g, triple('s p o')));
  });

  t('testStandardExplode', () => {
    const g = getGraph();
    ReifierStd.reifyAs(g, node('a'), triple('p Q r'));
    const r = GraphMemFactory.createDefaultGraph();
    graphAdd(r, 'a rdf:type rdf:Statement; a rdf:subject p; a rdf:predicate Q; a rdf:object r');
    assert.equal(g.size(), 4);
    assertIsomorphic(r, g);
  });

  t('testOverspecificationSuppressesReification', () => {
    const g = getGraph();
    graphAdd(g, 'x rdf:subject A; x rdf:predicate P; x rdf:object O; x rdf:type rdf:Statement');
    assertEquals(triple('A P O'), ReifierStd.getTriple(g, node('x')));
    graphAdd(g, 'x rdf:subject BOOM');
    assert.equal(ReifierStd.getTriple(g, node('x')), null);
  });

  const testReificationClash = (clashingStatement) => {
    const g = getGraph();
    const SPO = createTriple('S P O');
    ReifierStd.reifyAs(g, node('x'), SPO);
    assert.ok(ReifierStd.hasTriple(g, SPO));
    graphAdd(g, clashingStatement);
    assert.equal(ReifierStd.getTriple(g, node('x')), null);
    assert.ok(!ReifierStd.hasTriple(g, SPO));
  };
  t('testReificationSubjectClash', () => testReificationClash('x rdf:subject SS'));
  t('testReificationPredicateClash', () => testReificationClash('x rdf:predicate PP'));
  t('testReificationObjectClash', () => testReificationClash('x rdf:object OO'));

  t('testManifestQuads', () => {
    const g = getGraph();
    ReifierStd.reifyAs(g, node('A'), triple('S P O'));
    const reified = 'A rdf:type rdf:Statement; A rdf:subject S; A rdf:predicate P; A rdf:object O';
    assertIsomorphic(graphWith(reified), g);
  });

  t('testHiddenVsReification', () => {
    const g = getGraph();
    ReifierStd.reifyAs(g, node('A'), triple('S P O'));
    assert.ok(ReifierStd.findEither(g, Triple.ANY, false).hasNext());
  });

  t('testRetrieveTriplesByNode', () => {
    const G = getGraph();
    const N = NodeFactory.createBlankNode(), M = NodeFactory.createBlankNode();
    ReifierStd.reifyAs(G, N, triple('x R y'));
    assertEquals(triple('x R y'), ReifierStd.getTriple(G, N), 'gets correct triple');
    ReifierStd.reifyAs(G, M, triple('p S q'));
    assertDiffer('the anon nodes must be distinct', N, M);
    assertEquals(triple('p S q'), ReifierStd.getTriple(G, M), 'gets correct triple');
    assert.ok(ReifierStd.hasTriple(G, M), 'node is known bound');
    assert.ok(ReifierStd.hasTriple(G, N), 'node is known bound');
    assert.ok(!ReifierStd.hasTriple(G, NodeFactory.createURI('any:thing')), 'node is known unbound');
  });

  t('testRetrieveTriplesByTriple', () => {
    const G = getGraph();
    const T = triple('x R y'), T2 = triple('y R x');
    const N = node('someNode');
    ReifierStd.reifyAs(G, N, T);
    assert.ok(ReifierStd.hasTriple(G, T), 'R must have T');
    assert.ok(!ReifierStd.hasTriple(G, T2), 'R must not have T2');
  });

  t('testReifyAs', () => {
    const G = getGraph();
    const X = NodeFactory.createURI('some:uri');
    assertEquals(X, ReifierStd.reifyAs(G, X, triple('x R y')), 'node used');
    assertEquals(triple('x R y'), ReifierStd.getTriple(G, X), 'retrieves correctly');
  });

  t('testAllNodes', () => {
    const G = getGraph();
    ReifierStd.reifyAs(G, node('x'), triple('cows eat grass'));
    ReifierStd.reifyAs(G, node('y'), triple('pigs can fly'));
    ReifierStd.reifyAs(G, node('z'), triple('dogs may bark'));
    assertEquals(nodeSet('z y x'), ReifierStd.allNodes(G).toSet(), '');
  });

  t('testRemoveByNode', () => {
    const G = getGraph();
    const X = node('x'), Y = node('y');
    ReifierStd.reifyAs(G, X, triple('x R a'));
    ReifierStd.reifyAs(G, Y, triple('y R a'));
    ReifierStd.remove(G, X, triple('x R a'));
    assert.ok(!ReifierStd.hasTriple(G, X), 'triple X has gone');
    assertEquals(triple('y R a'), ReifierStd.getTriple(G, Y), 'triple Y still there');
  });

  t('testRemoveFromNothing', () => {
    const G = getGraph();
    G.delete(triple('quint rdf:subject S'));
  });

  t('testException', () => {
    const G = getGraph();
    const X = node('x');
    ReifierStd.reifyAs(G, X, triple('x R y'));
    ReifierStd.reifyAs(G, X, triple('x R y'));
    try {
      ReifierStd.reifyAs(G, X, triple('x R z'));
      assert.fail('did not detect already reified node');
    } catch (e) {
      if (!(e instanceof AlreadyReifiedException)) throw e;
    }
  });

  t('testKevinCaseA', () => {
    const G = getGraph();
    const X = node('x'), a = node('a'), b = node('b'), c = node('c');
    G.add(Triple.create(X, RDFNodes.type, RDFNodes.Statement));
    ReifierStd.reifyAs(G, X, Triple.create(a, b, c));
  });

  t('testKevinCaseB', () => {
    const G = getGraph();
    const X = node('x'), Y = node('y');
    const a = node('a'), b = node('b'), c = node('c');
    G.add(Triple.create(X, RDFNodes.subject, Y));
    try {
      ReifierStd.reifyAs(G, X, Triple.create(a, b, c));
      assert.fail('X already has subject Y: cannot make it a');
    } catch (e) {
      if (!(e instanceof CannotReifyException)) throw e;
    }
  });

  t('testQuadRemove', () => {
    const g = getGraph();
    assert.equal(g.size(), 0);
    const s = createTriple('x rdf:subject s');
    const p = createTriple('x rdf:predicate p');
    const o = createTriple('x rdf:object o');
    const tt = createTriple('x rdf:type rdf:Statement');
    g.add(s);
    g.add(p);
    g.add(o);
    g.add(tt);
    assert.equal(g.size(), 4);
    g.delete(s);
    g.delete(p);
    g.delete(o);
    g.delete(tt);
    assert.equal(g.size(), 0);
  });

  t('testEmpty', () => {
    const g = getGraph();
    assert.ok(g.isEmpty());
    graphAdd(g, 'x rdf:type rdf:Statement');
    assert.ok(!g.isEmpty());
    graphAdd(g, 'x rdf:subject Deconstruction');
    assert.ok(!g.isEmpty());
    graphAdd(g, 'x rdf:predicate rdfs:subTypeOf');
    assert.ok(!g.isEmpty());
    graphAdd(g, 'x rdf:object LiteraryCriticism');
    assert.ok(!g.isEmpty());
  });

  t('testReifierEmptyFind', () => {
    const g = getGraph();
    assertEquals(tripleSet(''), ReifierStd.findExposed(g, Triple.ANY).toSet());
  });

  const testReifierFind = (triples, pattern = '?? ?? ??') => {
    const g = getGraph();
    graphAdd(g, triples);
    assertEquals(tripleSet(triples), ReifierStd.findExposed(g, triple(pattern)).toSet());
  };
  t('testReifierFindSubject', () => testReifierFind('x rdf:subject S'));
  t('testReifierFindObject', () => testReifierFind('x rdf:object O'));
  t('testReifierFindPredicate', () => testReifierFind('x rdf:predicate P'));
  t('testReifierFindComplete', () => testReifierFind('x rdf:predicate P; x rdf:subject S; x rdf:object O; x rdf:type rdf:Statement'));

  t('testReifierFindFilter', () => {
    const g = getGraph();
    graphAdd(g, 's rdf:subject S');
    assertEquals(tripleSet(''), ReifierStd.findExposed(g, triple('s otherPredicate S')).toSet());
  });
});
