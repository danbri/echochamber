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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphLink.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphTests.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. It carries the abstract class
// AbstractDatasetGraphTests (AbstractDatasetGraphTests.mjs), run over
// DatasetGraphFactory.createGeneral(), with its own methods; it overrides
// emptyGraph_1 and emptyGraph_2 with empty methods (empty graphs stay visible
// in a linked dataset).

import { describeJena } from '../../lib/harness.mjs';
import { runAbstractDatasetGraphTests } from './AbstractDatasetGraphTests.mjs';
import assert from 'node:assert/strict';
import { DatasetGraphFactory, NodeFactory } from '@factoidal/leana';
import { parseGraph, parseNode, parseQuad } from './sse.mjs';

const emptyDataset = () => DatasetGraphFactory.createGeneral();

describeJena('TestDatasetGraphLink', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphLink.java', (t) => {
  runAbstractDatasetGraphTests(t, emptyDataset, { emptyGraph_1: () => {}, emptyGraph_2: () => {} });

  t('linkAdd_01', () => {
    const graph = parseGraph('(graph (:s :p :o))');
    const g = parseNode(':g');
    const dsg = emptyDataset();
    dsg.addGraph(g, graph);
    graph.clear();
    assert.ok(graph.isEmpty());
    assert.ok(dsg.getGraph(g).isEmpty());
  });
  t('emptyGraph_1_link', () => {
    const dsg = emptyDataset();
    const q = parseQuad('(:g :s :p :o)');
    dsg.add(q);
    assert.equal(dsg.listGraphNodes().toList().length, 1);
    dsg.delete(q);
    assert.equal(dsg.listGraphNodes().toList().length, 1);
  });
  t('emptyGraph_2_link', () => {
    const dsg = emptyDataset();
    const gn = NodeFactory.createURI('http://example/g');
    const q = parseQuad('(:g :s :p :o)');
    dsg.add(q);
    assert.ok(dsg.containsGraph(gn));
    dsg.delete(q);
    assert.ok(dsg.containsGraph(gn));
  });
});
