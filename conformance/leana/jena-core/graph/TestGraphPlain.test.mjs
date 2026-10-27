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
//   jena-core/src/test/java/org/apache/jena/graph/TestGraphPlain.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Jena's fixture graph is GraphMemValue (value-based
// indexing); the port builds the Jena 5 equivalent,
// GraphMemFactory.createDefaultGraphSameValue() (gap 'value-matching'), in
// each test instead of in @BeforeAll.

import assert from 'node:assert/strict';
import { GraphMemFactory, GraphPlain } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { node, triple, graphAdd } from '../../lib/testlib.mjs';

function setUp() {
  const graph = GraphMemFactory.createDefaultGraphSameValue();
  graphAdd(graph, 's p o; s p 1; s p 01');
  return graph;
}
function findTest(testGraph, n) {
  const iter = testGraph.find(triple('?? p 1'));
  assert.equal(iter.toList().length, n);
}

describeJena('TestGraphPlain', 'jena-core/src/test/java/org/apache/jena/graph/TestGraphPlain.java', (t) => {
  t('contains1', () => {
    const graph = setUp();
    const tr = triple('s p 001');
    assert.ok(graph.contains(tr));
    assert.ok(!GraphPlain.plain(graph).contains(tr));
  });
  t('contains2', () => {
    const graph = setUp();
    const tr = triple('s p 1');
    assert.ok(graph.contains(tr));
    assert.ok(GraphPlain.plain(graph).contains(tr));
  });
  t('contains3', () => {
    const graph = setUp();
    const tr = triple('s1 p 1');
    assert.ok(!graph.contains(tr));
    assert.ok(!GraphPlain.plain(graph).contains(tr));
  });
  t('contains4', () => {
    const graph = setUp();
    const s = node('s'), p = node('p'), x = node('001');
    assert.ok(graph.contains(s, p, x));
    assert.ok(!GraphPlain.plain(graph).contains(s, p, x));
  });
  t('find1', () => {
    const graph = setUp();
    findTest(graph, 2);
    findTest(GraphPlain.plain(graph), 1);
  });
  t('find2', () => {
    const plain = GraphPlain.plain(setUp());
    assert.equal(plain.find(node('s'), node('p'), node('001')).toList().length, 0);
  });
  t('find3', () => {
    const plain = GraphPlain.plain(setUp());
    assert.equal(plain.find(node('s'), node('p'), node('??')).toList().length, 3);
  });
});
