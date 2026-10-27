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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphCopyAdd.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphTests.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. It carries the abstract class
// AbstractDatasetGraphTests (AbstractDatasetGraphTests.mjs), run over
// DatasetGraphFactory.create(), with its own method copyAdd_01.

import { describeJena } from '../../lib/harness.mjs';
import { runAbstractDatasetGraphTests } from './AbstractDatasetGraphTests.mjs';
import assert from 'node:assert/strict';
import { DatasetGraphFactory, DatasetFactory, DatasetGraphMap } from '@factoidal/leana';
import { parseGraph, parseNode } from './sse.mjs';

const emptyDataset = () => DatasetGraphFactory.create();

describeJena('TestDatasetGraphCopyAdd', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphCopyAdd.java', (t) => {
  runAbstractDatasetGraphTests(t, emptyDataset);

  t('copyAdd_01', () => {
    const graph = parseGraph('(graph (:s :p :o))');
    const g = parseNode(':g');
    const dsg = emptyDataset();
    dsg.addGraph(g, graph);
    graph.clear();
    assert.ok(graph.isEmpty());
    assert.ok(!dsg.getGraph(g).isEmpty());
  });
});
