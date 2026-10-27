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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryBasic.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphTests.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. It carries the abstract class
// AbstractDatasetGraphTests (AbstractDatasetGraphTests.mjs), run over
// DatasetGraphFactory.createTxnMem(), with its own methods (Iter.print to
// stderr is left out).

import { describeJena } from '../../lib/harness.mjs';
import { runAbstractDatasetGraphTests } from './AbstractDatasetGraphTests.mjs';
import assert from 'node:assert/strict';
import { DatasetGraphFactory, DatasetFactory, NodeFactory, Node, Quad, Triple, GraphFactory } from '@factoidal/leana';
import { parseNode, parseQuad, parseTriple } from './sse.mjs';

const emptyDataset = () => DatasetGraphFactory.createTxnMem();
const { createURI, createBlankNode } = NodeFactory;

describeJena('TestDatasetGraphInMemoryBasic', 'jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryBasic.java', (t) => {
  runAbstractDatasetGraphTests(t, emptyDataset);

  t('orderingOfNodesFromFindIsCorrect', () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    const p = parseNode(':p');
    const triple = parseTriple('(:s :p :o)');
    dsg.getDefaultGraph().add(triple);
    const iter = dsg.getDefaultGraph().find(null, p, null);
    assert.ok(iter.toList().some((x) => triple.equals(x)));
    const quad = parseQuad('(:g1 :s1 :p1 :o1)');
    dsg.add(quad);
    const iter2 = dsg.find(null, null, parseNode(':p1'), null);
    assert.ok(iter2.toList().some((x) => quad.equals(x)));
  });
  t('prefixesAreManaged', () => {
    const graphName = createURI('http://example/g');
    const dsg = emptyDataset();
    dsg.addGraph(graphName, GraphFactory.createGraphMem());
    const dataset = DatasetFactory.wrap(dsg);
    let model = dataset.getNamedModel(graphName.getURI());
    const testPrefix = 'example';
    const testURI = 'http://example/';
    model.setNsPrefix(testPrefix, testURI);
    assert.equal(model.getNsPrefixURI(testPrefix), testURI);
    model.close();
    model = dataset.getNamedModel(graphName.getURI());
    const nsURI = dataset.getNamedModel(graphName.getURI()).getNsPrefixURI(testPrefix);
    assert.ok(nsURI !== null && nsURI !== undefined);
    assert.equal(nsURI, testURI);
  });
  t('unionGraphWorksProperly', () => {
    const dsg = emptyDataset();
    const q = Quad.create(createBlankNode(), createBlankNode(), createBlankNode(), createBlankNode());
    dsg.add(q);
    const q2 = Quad.create(Quad.unionGraph, q.asTriple());
    assert.ok(dsg.find(Quad.unionGraph, Node.ANY, Node.ANY, Node.ANY).toList().some((x) => q2.equals(x)));
    const tr = Triple.create(createBlankNode(), createBlankNode(), createBlankNode());
    dsg.getDefaultGraph().add(tr);
    assert.ok(!dsg.find(Quad.unionGraph, Node.ANY, Node.ANY, Node.ANY).toList().some((x) => x.isDefaultGraph()));
  });
  t('listGraphNodesHasNoPhantomEmptyGraphs', () => {
    const dsg = emptyDataset();
    const g = createURI('http://example/g'), s = createURI('http://example/s');
    const p = createURI('http://example/p'), o = createURI('http://example/o');
    dsg.add(g, s, p, o);
    let graphNodes = dsg.listGraphNodes();
    assert.ok(graphNodes.hasNext(), 'Missing named graph!');
    assert.ok(g.equals(graphNodes.next()), 'Wrong graph name!');
    assert.ok(!graphNodes.hasNext(), 'Too many named graphs!');
    dsg.delete(g, s, p, o);
    graphNodes = dsg.listGraphNodes();
    assert.ok(!graphNodes.hasNext(), 'Too many named graphs!');
  });
  t('datasetSize', () => {
    const dsg = emptyDataset();
    const qDft = parseQuad('(_ :s :p 0)');
    const q1 = parseQuad('(:g :s :p 1)');
    const q2 = parseQuad('(:g :s :p 1)');
    assert.equal(dsg.size(), 0);
    dsg.add(qDft);
    assert.equal(dsg.size(), 0);
    dsg.add(q1);
    dsg.add(q2);
    assert.equal(dsg.size(), 1);
    dsg.delete(q1);
    dsg.delete(q2);
    assert.equal(dsg.size(), 0);
  });
});
