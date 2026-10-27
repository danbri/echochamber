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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestDisjointUnion.java
//   (with the methods of its abstract base TestDyadic, from dyadic.mjs)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Graph.emptyGraph is testlib's (a leana GraphBase with
// no triples, as Jena defines it).

import assert from 'node:assert/strict';
import { DisjointUnion } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, graphAdd, triple, assertIsomorphic, Graph } from '../../lib/testlib.mjs';
import { dyadicTests } from './dyadic.mjs';

function testSingleComponent(g, du) {
  graphAdd(g, 'x R y; a P b; x Q b');
  assertIsomorphic(g, du);
  graphAdd(g, 'roses growOn you');
  assertIsomorphic(g, du);
  g.delete(triple('a P b'));
  assertIsomorphic(g, du);
}

describeJena('TestDisjointUnion', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestDisjointUnion.java', (t) => {
  dyadicTests(t);

  t('testEmptyUnion', () => {
    const du = new DisjointUnion(Graph.emptyGraph, Graph.emptyGraph);
    assert.equal(du.isEmpty(), true);
  });

  t('testLeftUnion', () => {
    const g = graphWith('');
    testSingleComponent(g, new DisjointUnion(g, Graph.emptyGraph));
  });

  t('testRightUnion', () => {
    const g = graphWith('');
    testSingleComponent(g, new DisjointUnion(Graph.emptyGraph, g));
  });

  t('testBothComponents', () => {
    const L = graphWith(''), R = graphWith('');
    const du = new DisjointUnion(L, R);
    assertIsomorphic(Graph.emptyGraph, du);
    L.add(triple('x P y'));
    assertIsomorphic(graphWith('x P y'), du);
    R.add(triple('A rdf:type Route'));
    assertIsomorphic(graphWith('x P y; A rdf:type Route'), du);
  });

  t('testRemoveBoth', () => {
    const L = graphWith('x R y; a P b'), R = graphWith('x R y; p Q r');
    const du = new DisjointUnion(L, R);
    du.delete(triple('x R y'));
    assertIsomorphic(graphWith('a P b'), L);
    assertIsomorphic(graphWith('p Q r'), R);
  });

  t('testAddLeftOnlyIfNecessary', () => {
    const L = graphWith(''), R = graphWith('x R y');
    const du = new DisjointUnion(L, R);
    graphAdd(du, 'x R y');
    assert.equal(L.isEmpty(), true);
    graphAdd(du, ' a P b');
    assertIsomorphic(graphWith('a P b'), L);
    assertIsomorphic(graphWith('x R y'), R);
  });
});
