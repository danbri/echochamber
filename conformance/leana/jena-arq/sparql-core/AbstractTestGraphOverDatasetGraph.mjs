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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractTestGraphOverDatasetGraph.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphViewGraphs.java
//     (its own four methods, which TestDatasetGraphInMemoryViews inherits)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its createBaseDSG(), makeNamedGraph() and makeDefaultGraph();
// @BeforeEach before() loads a fresh baseDSG per method. Graph.stream() is a
// JavaScript iterator: count() is the length of [...stream], findFirst() its
// first item, collect(toSet()) a JenaSet. SSE test data is read by ./sse.mjs
// (relative IRIs made absolute against eh:/).

import assert from 'node:assert/strict';
import { Quad, GraphView, JenaSet } from '@factoidal/leana';
import { parseQuad, parseNode, parseTriple } from './sse.mjs';

const q0 = parseQuad('(_ <s> <p> 0)');
const q1 = parseQuad('(<g1> <s> <p> 1)');
const q2 = parseQuad('(<g2> <s> <p> 2)');
const q3 = parseQuad('(<g3> <s> <p> 2)');
const gn1 = parseNode('<g1>');
const gn3 = parseNode('<g3>');
const gnNotSuchGraph = parseNode('<NoSuchGraph>');

function before(createBaseDSG) {
  const baseDSG = createBaseDSG();
  baseDSG.add(q0);
  baseDSG.add(q1);
  baseDSG.add(q2);
  baseDSG.add(q3);
  return baseDSG;
}

export function runAbstractTestGraphOverDatasetGraph(t, { createBaseDSG, makeNamedGraph, makeDefaultGraph }) {
  const T = (name, fn) => t(name, () => fn(before(createBaseDSG)));

  T('graphDSG_view_1', (baseDSG) => {
    const tr = makeDefaultGraph(baseDSG).find(null, null, null).next();
    assert.ok(parseTriple('(<s> <p> 0)').equals(tr));
  });
  T('graphDSG_view_2', (baseDSG) => {
    const tr = makeNamedGraph(baseDSG, gn1).find(null, null, null).next();
    assert.ok(parseTriple('(<s> <p> 1)').equals(tr));
  });
  T('graphDSG_view_3', (baseDSG) => {
    const g = makeDefaultGraph(baseDSG);
    g.add(parseTriple('(<s> <p> 99)'));
    const x = baseDSG.find(Quad.defaultGraphNodeGenerated, null, null, null).toList().length;
    assert.equal(x, 2);
    assert.equal(g.size(), 2);
  });
  T('graphDSG_view_4', (baseDSG) => {
    const g = makeNamedGraph(baseDSG, gnNotSuchGraph);
    assert.equal(baseDSG.find(gnNotSuchGraph, null, null, null).toList().length, 0);
    assert.equal(g.size(), 0);
  });
  T('graphDSG_view_union_1', (baseDSG) => {
    const g = makeNamedGraph(baseDSG, Quad.unionGraph);
    const iter = g.find(null, null, null);
    while (iter.hasNext()) iter.next();
    assert.equal(g.size(), 2);
  });
  T('graphDSG_stream_dft', (baseDSG) => {
    const g = makeDefaultGraph(baseDSG);
    assert.equal([...g.stream(null, null, null)].length, 1);
    const first = [...g.stream()][0] ?? null;
    assert.ok(parseTriple('(<s> <p> 0)').equals(first));
    assert.ok(g.find(null, null, null).toSet().equals(new JenaSet([...g.stream(null, null, null)])));
  });
  T('graphDSG_stream_named', (baseDSG) => {
    const g = makeNamedGraph(baseDSG, gn1);
    assert.equal([...g.stream(null, null, null)].length, 1);
    assert.ok(g.find(null, null, null).toSet().equals(new JenaSet([...g.stream(null, null, null)])));
  });
  T('graphDSG_stream_union', (baseDSG) => {
    const g = makeNamedGraph(baseDSG, Quad.unionGraph);
    assert.equal([...g.stream(null, null, null)].length, 2);
    assert.ok(g.find(null, null, null).toSet().equals(new JenaSet([...g.stream(null, null, null)])));
  });
  T('graphDSG_prefixes_1', (baseDSG) => {
    assert.ok(makeNamedGraph(baseDSG, gn1).getPrefixMapping());
  });
  T('graphDSG_prefixes_2', (baseDSG) => {
    assert.ok(makeNamedGraph(baseDSG, Quad.unionGraph).getPrefixMapping());
  });
  T('graphDSG_prefixes_3', (baseDSG) => {
    assert.ok(makeDefaultGraph(baseDSG).getPrefixMapping());
  });
  T('graphDSG_prefixes_4', (baseDSG) => {
    assert.ok(makeNamedGraph(baseDSG, gnNotSuchGraph).getPrefixMapping());
  });
  T('graphDGS_update_1', (baseDSG) => {
    const q9 = parseQuad('(<g3> <s> <p> 9)');
    const g = makeNamedGraph(baseDSG, gn3);
    baseDSG.add(q9);
    assert.ok(g.contains(parseTriple('(<s> <p> 9)')));
  });
  T('graphDGS_update_2', (baseDSG) => {
    const tr = parseTriple('(<s> <p> 9)');
    const g = makeNamedGraph(baseDSG, gn3);
    g.add(tr);
    assert.ok(baseDSG.contains(parseQuad('(<g3> <s> <p> 9)')));
  });
}

/** TestDatasetGraphViewGraphs: the view mechanism called directly, and its own methods. */
export function runTestDatasetGraphViewGraphs(t, createBaseDSG) {
  const makeDefaultGraph = (dsg) => GraphView.createDefaultGraph(dsg);
  const makeNamedGraph = (dsg, gn) => GraphView.createNamedGraph(dsg, gn);
  runAbstractTestGraphOverDatasetGraph(t, { createBaseDSG, makeNamedGraph, makeDefaultGraph });
  const T = (name, fn) => t(name, () => fn(before(createBaseDSG)));
  T('graphDSG_basic_1', (baseDSG) => {
    const g = makeDefaultGraph(baseDSG);
    assert.ok(g instanceof GraphView);
    assert.equal(g.getDataset(), baseDSG);
    assert.equal(g.getGraphName(), null);
  });
  T('graphDSG_basic_2', (baseDSG) => {
    const gn = parseNode('<g1>');
    const g = makeNamedGraph(baseDSG, gn);
    assert.ok(g instanceof GraphView);
    assert.equal(g.getDataset(), baseDSG);
    assert.ok(gn.equals(g.getGraphName()));
  });
  T('graphDSG_view_union_2', (baseDSG) => {
    const g = GraphView.createUnionGraph(baseDSG);
    assert.ok(g instanceof GraphView);
    assert.equal(g.find(null, null, null).toList().length, 2);
  });
  T('graphDSG_view_union_3', (baseDSG) => {
    const g = GraphView.createUnionGraph(baseDSG);
    assert.equal(g.size(), 2);
  });
}
