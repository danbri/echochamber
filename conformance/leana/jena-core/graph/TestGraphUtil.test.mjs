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
//   jena-core/src/test/java/org/apache/jena/graph/TestGraphUtil.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. GraphUtil.compareSizeTo is package-private in Jena;
// leana exports it.

import assert from 'node:assert/strict';
import { GraphMemFactory, GraphUtil } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { triple } from '../../lib/testlib.mjs';

function make(N) {
  const graph = GraphMemFactory.createDefaultGraph();
  for (let i = 0; i < N; i++) graph.add(triple("a P 'x" + i + "'"));
  return graph;
}
const graph0 = make(0), graph1 = make(1), graph2 = make(2);

describeJena('TestGraphUtil', 'jena-core/src/test/java/org/apache/jena/graph/TestGraphUtil.java', (t) => {
  t('compareSizeTo_1', () => {
    assert.equal(GraphUtil.compareSizeTo(graph2, 0), 1);
    assert.equal(GraphUtil.compareSizeTo(graph2, 1), 1);
    assert.equal(GraphUtil.compareSizeTo(graph2, 2), 0);
    assert.equal(GraphUtil.compareSizeTo(graph2, 3), -1);
    assert.equal(GraphUtil.compareSizeTo(graph2, 4), -1);
  });
  t('compareSizeTo_2', () => {
    assert.equal(GraphUtil.compareSizeTo(graph1, 0), 1);
    assert.equal(GraphUtil.compareSizeTo(graph1, 1), 0);
    assert.equal(GraphUtil.compareSizeTo(graph1, 2), -1);
  });
  t('compareSizeTo_3', () => {
    assert.equal(GraphUtil.compareSizeTo(graph0, 0), 0);
    assert.equal(GraphUtil.compareSizeTo(graph0, 1), -1);
  });
});
