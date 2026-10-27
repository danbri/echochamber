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
//   jena-core/src/test/java/org/apache/jena/graph/TestNodeExtras.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. assertNotSame is !==; Java hashCode is leana's hashCode() key; RDF.dtDirLangString is test data.

import assert from 'node:assert/strict';
import { NodeFactory, Node_Graph, Triple, GraphMemFactory, TextDirection, UnsupportedOperationException, Util } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { create, assertEquals, assertDiffer, assertThrows, dtDirLangString } from '../../lib/testlib.mjs';

const s = NodeFactory.createBlankNode();
const p = create('eg:p');
const o = create("'abc'");
const triple1 = Triple.create(s, p, o);
const triple2 = Triple.create(s, p, o);
const triple9 = Triple.create(NodeFactory.createBlankNode(), p, o);
const newTripleTerm = (a, b, c) => (b === undefined ? NodeFactory.createTripleTerm(a) : NodeFactory.createTripleTerm(a, b, c));
const newGraphTerm = () => new Node_Graph(GraphMemFactory.empty());

describeJena('TestNodeExtras', 'jena-core/src/test/java/org/apache/jena/graph/TestNodeExtras.java', (t) => {
  t('term_triple_1', () => {
    const nt = newTripleTerm(s, p, o);
    assert.ok(nt.isTripleTerm());
    assert.ok(nt.getTriple() != null);
    assertEquals(triple1, nt.getTriple());
    assertEquals(nt, nt);
    assert.notEqual(nt.getTriple().hashCode(), nt.hashCode());
    assert.ok(nt.sameValueAs(nt));
  });
  t('term_triple_2', () => {
    const nt1 = newTripleTerm(s, p, o), nt2 = newTripleTerm(s, p, o);
    assertEquals(nt1, nt2);
    assert.equal(nt1.hashCode(), nt2.hashCode());
    assert.ok(nt1.sameValueAs(nt2));
  });
  t('term_triple_3', () => {
    const nt1 = newTripleTerm(triple1), nt2 = newTripleTerm(triple2);
    assert.ok(nt1.getTriple() !== nt2.getTriple());
    assert.ok(nt1 !== nt2);
    assertEquals(nt1, nt2);
    assert.equal(nt1.hashCode(), nt2.hashCode());
  });
  t('term_triple_4', () => {
    const nt1 = newTripleTerm(triple1), nt9 = newTripleTerm(triple9);
    assert.ok(nt1.getTriple() !== nt9.getTriple());
    assert.ok(nt1 !== nt9);
    assertDiffer(nt1, nt9);
    assert.ok(!nt1.sameValueAs(nt9));
  });
  t('term_triple_bad_1', () => {
    assertThrows(UnsupportedOperationException, () => NodeFactory.createLiteralString('abc').getTriple());
  });
  t('term_triple_bad_2', () => {
    assertThrows(UnsupportedOperationException, () => NodeFactory.createURI('http://example/abc').getTriple());
  });
  t('term_graph_1', () => {
    const nGraph = newGraphTerm();
    assert.ok(nGraph.isNodeGraph());
    assert.ok(nGraph.getGraph() != null);
    assertEquals(nGraph, nGraph);
    assert.notEqual(nGraph.getGraph().hashCode(), nGraph.hashCode());
    assert.ok(nGraph.sameValueAs(nGraph));
  });
  t('term_dirLangString_1', () => {
    const n = NodeFactory.createLiteralDirLang('abc', 'EN', TextDirection.LTR);
    assert.ok(n.isLiteral());
    assert.ok(Util.hasLang(n));
    assert.ok(Util.hasDirection(n));
    assertEquals(dtDirLangString, n.getLiteralDatatype());
    assert.equal(n.getLiteralLanguage(), 'en');
    assertEquals(TextDirection.LTR, n.getLiteralBaseDirection());
  });
  t('term_dirLangString_2', () => {
    const n = NodeFactory.createLiteralLang('abc', 'en--ltr');
    assert.ok(n.isLiteral());
    assert.ok(Util.hasLang(n));
    assert.ok(Util.hasDirection(n));
    assertEquals(dtDirLangString, n.getLiteralDatatype());
    assert.equal(n.getLiteralLanguage(), 'en');
    assertEquals(TextDirection.LTR, n.getLiteralBaseDirection());
  });
});
