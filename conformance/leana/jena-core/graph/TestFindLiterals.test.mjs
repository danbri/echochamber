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
//   jena-core/src/test/java/org/apache/jena/graph/TestFindLiterals.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Jena's GraphTestLib.graphWith uses a same-VALUE
// graph; lib/testlib's graphWith is same-term. Where the expected answer
// depends on value matching (test20, test21), the port builds Jena's graph,
// GraphMemFactory.createDefaultGraphSameValue() (gap 'value-matching'), as
// Jena does. Iter.toSet is ExtendedIterator.toSet.

import assert from 'node:assert/strict';
import { Node, NodeFactory, Triple, GraphMemFactory, LiteralLabelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { create, nodeSet, graphWith, graphAdd, Extended, assertEquals } from '../../lib/testlib.mjs';

function sameValueGraphWith(s) {
  const g = GraphMemFactory.createDefaultGraphSameValue();
  g.getPrefixMapping().setNsPrefixes(Extended);
  return graphAdd(g, s);
}

function runTest(graph, size, search, results, make = graphWith) {
  const g = make(graph);
  const literal = create(search);
  assert.equal(g.size(), size, 'graph has wrong size');
  const got = g.find(Node.ANY, Node.ANY, literal).mapWith((x) => x.getObject()).toSet();
  assertEquals(nodeSet(results), got);
}

describeJena('TestFindLiterals', 'jena-core/src/test/java/org/apache/jena/graph/TestFindLiterals.java', (t) => {
  const expected = 1; // 2 for RDF 1.0
  t('test01', () => runTest("a P 'simple'", 1, "'simple'", "'simple'"));
  t('test02', () => runTest("a P 'simple'xsd:string", 1, "'simple'", "'simple'xsd:string"));
  t('test03', () => runTest("a P 'simple'", 1, "'simple'xsd:string", "'simple'"));
  t('test04', () => runTest("a P 'simple'xsd:string", 1, "'simple'xsd:string", "'simple'xsd:string"));
  t('test05', () => runTest("a P 'simple'; a P 'simple'xsd:string", expected, "'simple'", "'simple' 'simple'xsd:string"));
  t('test06', () => runTest("a P 'simple'; a P 'simple'xsd:string", expected, "'simple'xsd:string", "'simple' 'simple'xsd:string"));
  t('test07', () => runTest('a P 1', 1, '1', '1'));
  t('test08', () => runTest("a P '1'xsd:float", 1, "'1'xsd:float", "'1'xsd:float"));
  t('test09', () => runTest("a P '1'xsd:double", 1, "'1'xsd:double", "'1'xsd:double"));
  t('test10', () => runTest("a P '1'xsd:float", 1, "'1'xsd:float", "'1'xsd:float"));
  t('test11', () => runTest("a P '1.1'xsd:float", 1, "'1'xsd:float", ''));
  t('test12', () => runTest("a P '1'xsd:double", 1, "'1'xsd:int", ''));
  t('test13', () => runTest("a P 'abc'rdf:XMLLiteral", 1, "'abc'", ''));
  t('test14', () => runTest("a P 'abc'", 1, "'abc'rdf:XMLLiteral", ''));
  t('test15', () => runTest("a P '1'xsd:float", 1, "'1'xsd:double", ''));
  t('test16', () => runTest("a P '1'xsd:double", 1, "'1'xsd:float", ''));
  t('test17', () => runTest('a P 1', 1, "'1'", ''));
  t('test18', () => runTest('a P 1', 1, "'1'xsd:integer", "'1'xsd:integer"));
  t('test19', () => runTest('a P 1', 1, "'1'", ''));
  t('test20', () => runTest("a P '1'xsd:short", 1, "'1'xsd:integer", "'1'xsd:short", sameValueGraphWith));
  t('test21', () => runTest("a P '1'xsd:int", 1, "'1'xsd:integer", "'1'xsd:int", sameValueGraphWith));

  t('testFloatVsDouble', () => {
    const A = create("'1'xsd:float");
    const B = create("'1'xsd:double");
    assert.ok(!A.equals(B));
    assert.ok(!A.sameValueAs(B));
    assert.ok(!B.sameValueAs(A));
  });

  t('testProgrammaticValues', () => {
    // Java (byte)42, (short)42, 42, (long)42: one JavaScript number cannot carry the four types.
    const ab = NodeFactory.createLiteral(LiteralLabelFactory.createTypedLiteral(42));
    const as = NodeFactory.createLiteral(LiteralLabelFactory.createTypedLiteral(42));
    const ai = NodeFactory.createLiteral(LiteralLabelFactory.createTypedLiteral(42));
    const al = NodeFactory.createLiteral(LiteralLabelFactory.createTypedLiteral(42n));
    const g = graphWith('');
    const SB = create('SB'), SS = create('SS'), SI = create('SI'), SL = create('SL'), P = create('P');
    g.add(Triple.create(SB, P, ab));
    g.add(Triple.create(SS, P, as));
    g.add(Triple.create(SI, P, ai));
    g.add(Triple.create(SL, P, al));
    assert.equal(g.find(Node.ANY, P, create('42')).toSet().size(), 4);
  });
});
