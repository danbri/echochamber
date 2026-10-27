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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphTests.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its emptyDataset(); `overrides` holds the methods a subclass
// overrides. SSE test data is read by ./sse.mjs; a relative IRI (<g>,
// NodeFactory.createURI("g")) is made absolute against eh:/ (see sse.mjs).
// Java Iterator / List / Set become arrays (toList()) compared with equals().

import assert from 'node:assert/strict';
import {
  Node, NodeFactory, Triple, Quad, GraphFactory, Txn, AddDeniedException, DeleteDeniedException,
} from '@factoidal/leana';
import { assertThrows } from '../../lib/testlib.mjs';
import { parseQuad, parseNode, parseTriple, parseGraph, rel, equalsUnordered } from './sse.mjs';

export function runAbstractDatasetGraphTests(t, emptyDataset, overrides = {}) {
  const T = (name, fn) => t(name, overrides[name] ?? fn);

  T('create_1', () => {
    const dsg = emptyDataset();
    assert.ok(dsg);
    assert.ok(dsg.getDefaultGraph());
    assert.ok(dsg.getDefaultGraph().isEmpty());
  });

  T('quad_01', () => {
    const dsg = emptyDataset();
    const quad = parseQuad('(quad <g> <s> <p> <o>)');
    dsg.add(quad);
    assert.ok(dsg.contains(quad));
    const iter = dsg.find(quad);
    assert.ok(iter.hasNext());
    const quad2 = iter.next();
    assert.ok(!iter.hasNext());
    assert.ok(quad.equals(quad2));
    assert.ok(dsg.getDefaultGraph().isEmpty());
    assert.ok(!dsg.getGraph(rel('g')).isEmpty());
  });

  T('quad_02', () => {
    const dsg = emptyDataset();
    const quad = parseQuad('(quad <g> <s> <p> <o>)');
    dsg.add(quad);
    dsg.containsGraph(rel('g'));
    dsg.delete(quad);
    assert.ok(dsg.isEmpty());
    assert.ok(dsg.getDefaultGraph().isEmpty());
    assert.ok(dsg.getGraph(rel('g')).isEmpty());
  });

  T('quad_03', () => {
    const dsg = emptyDataset();
    const quad1 = parseQuad('(quad <g> <s> <p> <o1>)');
    const quad2 = parseQuad('(quad <g> <s> <p> <o2>)');
    dsg.add(quad1);
    dsg.add(quad2);
    dsg.deleteAny(rel('g'), rel('s'), null, null);
    assert.ok(!dsg.contains(quad1));
    assert.ok(!dsg.contains(quad2));
  });

  T('quad_04', () => {
    const dsg = emptyDataset();
    const quad1 = parseQuad('(quad <g> <s> <p> <o1>)');
    const quad2 = parseQuad('(quad <g> <s> <p> <o2>)');
    dsg.add(quad1);
    dsg.add(quad2);
    const iter = dsg.find(rel('g'), rel('s'), null, null);
    assert.ok(iter.hasNext());
    const x = iter.toSet();
    assert.equal(x.size(), 2);
    assert.ok(x.contains(quad1));
    assert.ok(x.contains(quad2));
  });

  T('quad_05', () => {
    const dsg = emptyDataset();
    const quad1 = parseQuad('(quad <g> <s> <p> <o1>)');
    const g = parseNode('<g>'), s = parseNode('<s>'), p = parseNode('<p>');
    const o1 = parseNode('<o1>'), o2 = parseNode('<o2>');
    dsg.add(g, s, p, o1);
    assert.ok(dsg.contains(quad1));
    assert.ok(dsg.contains(g, s, p, o1));
    assert.ok(!dsg.contains(g, s, p, o2));
  });

  const s = parseNode('<s>'), p = parseNode('<p>'), o = parseNode('<o>');
  const testDftGraphTerms = (graphName) => {
    const dsg = emptyDataset();
    dsg.add(graphName, s, p, o);
    assert.ok(!dsg.getDefaultGraph().isEmpty());
    dsg.delete(graphName, s, p, o);
    assert.ok(dsg.getDefaultGraph().isEmpty());
  };
  const testDftGraphQuad = (graphName) => {
    const dsg = emptyDataset();
    const quad = Quad.create(graphName, s, p, o);
    dsg.add(quad);
    assert.ok(!dsg.getDefaultGraph().isEmpty());
    dsg.delete(quad);
    assert.ok(dsg.getDefaultGraph().isEmpty());
  };
  T('quadDftTerm1', () => testDftGraphTerms(null));
  T('quadDftTerm2', () => testDftGraphTerms(Quad.defaultGraphIRI));
  T('quadDftTerm3', () => testDftGraphTerms(Quad.defaultGraphNodeGenerated));
  T('quadDftQuad1', () => testDftGraphQuad(null));
  T('quadDftQuad2', () => testDftGraphQuad(Quad.defaultGraphIRI));
  T('quadDftQuad3', () => testDftGraphQuad(Quad.defaultGraphNodeGenerated));

  T('graph_00', () => {
    const dsg = emptyDataset();
    const gn = rel('g');
    const g = GraphFactory.createDefaultGraph();
    g.add(parseTriple('(<s> <p> <o>)'));
    dsg.addGraph(gn, g);
    assert.ok(dsg.containsGraph(gn));
  });

  T('graph_01', () => {
    const dsg = emptyDataset();
    const g = rel('g');
    const tr = parseTriple('(<s> <p> <o>)');
    dsg.getGraph(g).add(tr);
    assert.ok(dsg.getGraph(g).contains(tr));
    const quad = parseQuad('(quad <g> <s> <p> <o>)');
    const iter = dsg.find(null, null, null, null);
    assert.ok(iter.hasNext());
    const quad2 = iter.next();
    assert.ok(!iter.hasNext());
    assert.ok(quad.equals(quad2));
    assert.ok(dsg.getDefaultGraph().isEmpty());
    assert.ok(!dsg.getGraph(rel('g')).isEmpty());
  });

  T('graph_02', () => {
    const g = rel('g');
    const dsg = emptyDataset();
    dsg.add(parseQuad('(quad <g> <s> <p> <o>)'));
    dsg.getGraph(g).delete(parseTriple('(<s> <p> <o>)'));
    assert.ok(dsg.getDefaultGraph().isEmpty());
    assert.ok(dsg.getGraph(rel('g')).isEmpty());
    assert.ok(!dsg.find(Node.ANY, Node.ANY, Node.ANY, Node.ANY).hasNext());
  });

  T('graph_03', () => {
    const g = rel('g');
    const dsg = emptyDataset();
    dsg.addGraph(g, parseGraph('(graph (<s> <p> <o>))'));
    assert.ok(dsg.contains(parseQuad('(quad <g> <s> <p> <o>)')));
  });

  T('find_01', () => {
    const g1 = rel('g1');
    const dsg = emptyDataset();
    const quad1 = parseQuad('(quad <g1> <s1> <p1> <o1>)');
    const quad2 = parseQuad('(quad <g2> <s2> <p2> <o2>)');
    dsg.add(quad1);
    dsg.add(quad2);
    const quads = dsg.find(g1, null, null, null).toList();
    assert.equal(quads.length, 1);
    assert.ok(quad1.equals(quads[0]));
  });

  const S = NodeFactory.createURI('http://example/s');
  const P = NodeFactory.createURI('http://example/p');
  const G = NodeFactory.createURI('http://example/g');

  T('deleteAny_01', () => {
    const dsg = emptyDataset();
    dsg.add(Quad.create(Quad.defaultGraphIRI, S, P, NodeFactory.createBlankNode()));
    dsg.deleteAny(Node.ANY, S, null, null);
  });

  T('deleteAny_02', () => {
    const dsg = emptyDataset();
    dsg.add(G, S, P, NodeFactory.createBlankNode());
    dsg.add(G, S, P, NodeFactory.createBlankNode());
    dsg.deleteAny(Quad.defaultGraphIRI, null, null, null);
    assert.equal(dsg.find(G, null, null, null).toList().length, 2);
    dsg.deleteAny(G, null, null, null);
    assert.equal(dsg.find(G, null, null, null).toList().length, 0);
  });

  T('deleteAny_03', () => {
    const dsg = emptyDataset();
    dsg.getDefaultGraph().add(Triple.create(S, P, NodeFactory.createBlankNode()));
    dsg.getGraph(G).add(Triple.create(S, P, NodeFactory.createBlankNode()));
    dsg.deleteAny(Quad.defaultGraphIRI, null, null, null);
    assert.equal(dsg.find(Quad.defaultGraphIRI, null, null, null).toList().length, 0);
    dsg.deleteAny(G, null, null, null);
    assert.equal(dsg.find(G, null, null, null).toList().length, 0);
  });

  T('deleteAny_04', () => {
    const dsg = emptyDataset();
    const graph2 = NodeFactory.createURI('http://example/abc');
    dsg.add(G, S, P, NodeFactory.createBlankNode());
    dsg.add(G, S, P, NodeFactory.createBlankNode());
    dsg.deleteAny(graph2, null, null, null);
    assert.equal(dsg.find(G, null, null, null).toList().length, 2);
    dsg.deleteAny(G, null, null, null);
    assert.equal(dsg.find(G, null, null, null).toList().length, 0);
  });

  T('clear_01', () => {
    const dsg = emptyDataset();
    const quad = parseQuad('(quad <g> <s> <p> <o>)');
    const gn = parseNode('<g>');
    assert.ok(dsg.isEmpty());
    dsg.add(quad);
    assert.ok(!dsg.isEmpty());
    assert.ok(dsg.containsGraph(gn));
    dsg.clear();
    assert.ok(dsg.isEmpty());
    assert.ok(!dsg.containsGraph(gn));
  });

  T('clear_02', () => {
    const dsg = emptyDataset();
    dsg.add(parseQuad('(quad _ <a0> <b0> <b0>)'));
    dsg.add(parseQuad('(quad <g1> <a1> <b1> <b1>)'));
    dsg.add(parseQuad('(quad <g2> <a2> <b2> <b2>)'));
    assert.equal(dsg.size(), 2);
    assert.equal(dsg.getDefaultGraph().size(), 1);
    assert.ok(!dsg.isEmpty());
    dsg.clear();
    assert.equal(dsg.size(), 0);
    assert.equal(dsg.getDefaultGraph().size(), 0);
    assert.ok(dsg.isEmpty());
  });

  T('graph_clear_1', () => {
    const dsg = emptyDataset();
    if (!dsg.supportsTransactions()) return;
    const quad = parseQuad('(<g> <s> <p> 0)');
    const gn = quad.getGraph();
    Txn.executeWrite(dsg, () => {
      dsg.add(quad);
      dsg.getGraph(gn).clear();
      assert.ok(dsg.isEmpty());
    });
  });

  T('graph_clear_2', () => {
    const dsg = emptyDataset();
    if (!dsg.supportsTransactions()) return;
    const quad = parseQuad('(<g> <s> <p> 0)');
    const gn = quad.getGraph();
    const gnx = rel('xyz');
    Txn.executeWrite(dsg, () => {
      dsg.add(quad);
      dsg.getGraph(gnx).clear();
      assert.ok(!dsg.isEmpty());
      assert.ok(!dsg.getGraph(gn).isEmpty());
    });
  });

  T('emptyGraph_1', () => {
    const dsg = emptyDataset();
    const q = parseQuad('(:g :s :p :o)');
    dsg.add(q);
    assert.equal(dsg.listGraphNodes().toList().length, 1);
    dsg.delete(q);
    assert.equal(dsg.listGraphNodes().toList().length, 0);
  });

  T('emptyGraph_2', () => {
    const dsg = emptyDataset();
    const gn = NodeFactory.createURI('http://example/g');
    const q = parseQuad('(:g :s :p :o)');
    dsg.add(q);
    assert.ok(dsg.containsGraph(gn));
    dsg.delete(q);
    assert.ok(!dsg.containsGraph(gn));
  });

  T('listGraphNodes_1', () => {
    const dsg = emptyDataset();
    dsg.add(parseQuad('(quad <g> <s> <p> <o>)'));
    const x = dsg.listGraphNodes().toList();
    assert.equal(x.length, 1);
    assert.ok(parseNode('<g>').equals(x[0]));
  });

  T('listGraphNodes_2', () => {
    const dsg = emptyDataset();
    dsg.add(parseQuad('(quad <g1> <s> <p> <o>)'));
    dsg.add(parseQuad('(quad <g2> <s> <p> <o>)'));
    const x = dsg.listGraphNodes().toList();
    assert.equal(x.length, 2);
    assert.ok(equalsUnordered([parseNode('<g1>'), parseNode('<g2>')], x));
  });

  T('listGraphNodes_3', () => {
    const dsg = emptyDataset();
    dsg.add(parseQuad('(quad _ <s> <p> <o>)'));
    dsg.add(parseQuad('(quad <g> <s> <p> <o>)'));
    const x = dsg.listGraphNodes().toList();
    assert.ok(equalsUnordered([parseNode('<g>')], x));
  });

  T('updateUnionGraph_1', () => {
    const dsg = emptyDataset();
    const quad = parseQuad('(quad :g :s :p :o)');
    assertThrows(AddDeniedException, () => dsg.add(Quad.unionGraph, quad.getSubject(), quad.getPredicate(), quad.getObject()));
  });

  T('updateUnionGraph_2', () => {
    const dsg = emptyDataset();
    const quad = parseQuad('(quad :g :s :p :o)');
    assertThrows(DeleteDeniedException, () => dsg.delete(Quad.unionGraph, quad.getSubject(), quad.getPredicate(), quad.getObject()));
  });
}
