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
//   jena-core/src/test/java/org/apache/jena/graph/TestTriple.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. LiteralLabelFactory.createLang(id, "") is a string
// literal; BlankNodeId.createFreshId() is a fresh engine label; Java Function
// fields are JavaScript arrow functions.

import assert from 'node:assert/strict';
import { Node, NodeFactory, Triple, PrefixMapping, LiteralLabelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { create, createTriple, node, assertEquals, assertDiffer } from '../../lib/testlib.mjs';

const U = 'http://some.domain.name/magic/spells.incant';
const N = 'Alice';
const L = LiteralLabelFactory.createLang('ashes are burning', 'en');

describeJena('TestTriple', 'jena-core/src/test/java/org/apache/jena/graph/TestTriple.java', (t) => {
  t('testTripleEquals', () => {
    const id = NodeFactory.createBlankNode().getBlankNodeLabel();
    const L2 = LiteralLabelFactory.createLang(id, '');
    const U2 = id, N2 = id;
    const nodes = [Node.ANY, NodeFactory.createBlankNode(id), NodeFactory.createBlankNode(), NodeFactory.createLiteral(L),
      NodeFactory.createLiteral(L2), NodeFactory.createURI(U), NodeFactory.createURI(U2), NodeFactory.createVariable(N),
      NodeFactory.createVariable(N2)];
    const n = nodes.length;
    const triples = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) triples[i * n * n + j * n + k] = Triple.create(nodes[i], nodes[j], nodes[k]);
    const expected = (a, b) => {
      const [i1, j1, k1] = [Math.floor(a / (n * n)), Math.floor(a / n) % n, a % n];
      const [i2, j2, k2] = [Math.floor(b / (n * n)), Math.floor(b / n) % n, b % n];
      return nodes[i1].equals(nodes[i2]) && nodes[j1].equals(nodes[j2]) && nodes[k1].equals(nodes[k2]);
    };
    assert.equal(triples[0].equals(null), false, 'triple, null');
    assertDiffer('triple, string', triples[0], 'string');
    for (let i = 0; i < triples.length; i++) {
      for (let j = 0; j < triples.length; j++) {
        if (expected(i, j)) assertEquals(triples[i], triples[j], `triples ${i}, ${j}`);
        else assertDiffer(`triples ${i}, ${j}`, triples[i], triples[j]);
      }
    }
  });

  t('testTripleCreate', () => {
    const S = create('s'), P = create('p'), O = create('o');
    assertEquals(Triple.create(S, P, O), Triple.create(S, P, O));
  });

  t('testTripleCreateFromString', () => {
    const S = create('a'), P = create('_P'), O = create('?c');
    assertEquals(Triple.create(S, P, O), createTriple('a _P ?c'));
  });

  t('testTriplePrefixes', () => {
    const S = create('rdf:alpha'), P = create('dc:creator');
    const O = create('spoo:notmapped');
    const tr = createTriple('rdf:alpha dc:creator spoo:notmapped');
    assertEquals(Triple.create(S, P, O), tr);
  });

  t('testTripleCreationMapped', () => {
    const pm = PrefixMapping.Factory.create().setNsPrefix('a', 'ftp://foo/').setNsPrefix('b', 'http://spoo/');
    const wanted = createTriple('ftp://foo/x http://spoo/y c:z');
    const got = createTriple(pm, 'a:x b:y c:z');
    assertEquals(wanted, got);
  });

  const testMatches = (pattern, tr = pattern) => assert.ok(createTriple(pattern).matches(createTriple(tr)), `${pattern} / ${tr}`);
  const testMatchFails = (pattern, tr) => assert.ok(!createTriple(pattern).matches(createTriple(tr)), `${pattern} / ${tr}`);

  t('testPlainTripleMatches', () => {
    testMatches('S P O');
    testMatches('_S _P _O');
    testMatches('1 2 3');
  });

  t('testAnyTripleMatches', () => {
    testMatches('?? P O', 'Z P O');
    testMatches('S ?? O', 'S Q O');
    testMatches('S P ??', 'S P oh');
    testMatches('?? ?? ??', 'X Y Z');
    testMatches('?? ?? ??', 'X Y 1');
    testMatches('?? ?? ??', '_X Y Z');
    testMatches('?? ?? ??', 'X _Y Z');
  });

  t('testPlainTripleDoesntMatch', () => {
    testMatchFails('S P O', 'Z P O');
    testMatchFails('S P O', 'S Q O');
    testMatchFails('S P O', 'S P oh');
  });

  t('testAnyTripleDoesntMatch', () => {
    testMatchFails('?? P O', 'S P oh');
    testMatchFails('S ?? O', 'Z R O');
    testMatchFails('S P ??', 'Z P oh');
  });

  t('testMatchesNodes', () => {
    assert.ok(createTriple('S P O').matches(node('S'), node('P'), node('O')));
    assert.ok(createTriple('?? P O').matches(node('Z'), node('P'), node('O')));
    assert.ok(createTriple('S ?? O').matches(node('S'), node('Q'), node('O')));
    assert.ok(createTriple('S P ??').matches(node('S'), node('P'), node('I')));
    assert.ok(!createTriple('S P O').matches(node('Z'), node('P'), node('O')));
    assert.ok(!createTriple('S P O').matches(node('S'), node('Q'), node('O')));
    assert.ok(!createTriple('S P O').matches(node('Z'), node('P'), node('I')));
  });

  t('testConcrete', () => {
    for (const s of ['S P O', 'S P 11', 'S P _X', 'S _P 11', '_S _P _O', '10 11 12', 'S P 11']) assert.ok(createTriple(s).isConcrete(), s);
    for (const s of ['?? P 11', 'S ?? 11', 'S P ??', '?S P 11', 'S ?P 11', 'S P ?O']) assert.ok(!createTriple(s).isConcrete(), s);
  });

  t('testTripleToStringOrdering', () => {
    const t1 = createTriple('subject predicate object');
    assert.ok(t1.toString().includes('subject'), 'subject must be present');
    assert.ok(t1.toString().indexOf('subject') < t1.toString().indexOf('predicate'), 'subject must preceed predicate');
    assert.ok(t1.toString().indexOf('predicate') < t1.toString().indexOf('object'), 'predicate must preceed object');
  });

  t('testTripleToStringQuoting', () => {
    const t1 = createTriple("subject predicate 'object'");
    assert.ok(t1.toString().indexOf('object') > 0);
  });

  t('testTripleToStringWithPrefixing', () => {
    const pm = PrefixMapping.Factory.create();
    pm.setNsPrefix('spoo', 'eg://domain.dom/spoo#');
    const t1 = createTriple('eg://domain.dom/spoo#a b c');
    assert.equal(t1.toString(pm), 'spoo:a eh:/b eh:/c');
  });

  t('testTripleMaps', () => {
    const getSubject = (x) => x.getSubject(), getPredicate = (x) => x.getPredicate(), getObject = (x) => x.getObject();
    assertEquals(node('x'), getSubject(createTriple('x P z')));
    assertEquals(node('P'), getPredicate(createTriple('x P z')));
    assertEquals(node('z'), getObject(createTriple('x P z')));
  });
});
