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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestMultiUnion.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. new Graph[] {...} is a JS array; iterateOver answers a
// JS iterator; IllegalArgumentException is a JS TypeError; ontology/list0.rdf
// is the fixture copy in conformance/leana/fixtures/jena-core/ and Model.read
// answers a Promise. The methods TestMultiUnion inherits from BaseTestGraph run
// in BaseTestGraph.test.mjs over a GraphMem, not over a MultiUnion.

import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { MultiUnion, ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, triple } from '../../lib/testlib.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core');
const getFileName = (fn) => pathToFileURL(join(FIX, fn)).href;
const iterateOver = (...xs) => xs.values();

function checkDeleteSizes(s0, s1, m0, g0, g1, m) {
  assert.equal(g0.size(), s0, 'Delete check: g0 size');
  assert.equal(g1.size(), s1, 'Delete check: g1 size');
  assert.equal(m.size(), m0, 'Delete check: m size');
}

function checkSizes(mk) {
  const g0 = graphWith('x p y');
  const g1 = graphWith('x p z; z p zz');
  const g2 = graphWith('x p y; z p a');
  const m01 = mk(g0, g1), m10 = mk(g1, g0), m12 = mk(g1, g2), m21 = mk(g2, g1);
  const m02 = mk(g0, g2), m20 = mk(g2, g0), m00 = mk(g0, g0);
  const s0 = g0.size(), s1 = g1.size(), s2 = g2.size();
  assert.equal(m01.size(), s0 + s1, 'Size of union of g0 and g1 not correct');
  assert.equal(m10.size(), s0 + s1, 'Size of union of g1 and g0 not correct');
  assert.equal(m12.size(), s1 + s2, 'Size of union of g1 and g2 not correct');
  assert.equal(m21.size(), s1 + s2, 'Size of union of g2 and g1 not correct');
  assert.equal(m02.size(), s0 + s2 - 1, 'Size of union of g0 and g2 not correct');
  assert.equal(m20.size(), s0 + s2 - 1, 'Size of union of g2 and g0 not correct');
  assert.equal(m00.size(), s0, 'Size of union of g0 with itself not correct');
}

describeJena('TestMultiUnion', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestMultiUnion.java', (t) => {
  t('testEmptyGraph', () => {
    const m = new MultiUnion();
    assert.equal(m.size(), 0, 'Empty model should have size zero');
  });

  t('testGraphSize1', () => checkSizes((a, b) => new MultiUnion([a, b])));

  t('testGraphSize2', () => checkSizes((a, b) => new MultiUnion(iterateOver(a, b))));

  t('testGraphAddSize', () => {
    const g0 = graphWith('x p y');
    const g1 = graphWith('x p z; z p zz');
    const g2 = graphWith('x p y; z p a');
    const s0 = g0.size(), s1 = g1.size(), s2 = g2.size();
    const m0 = new MultiUnion([g0]);
    assert.equal(m0.size(), s0, 'Size of union of g0 not correct');
    m0.addGraph(g1);
    assert.equal(m0.size(), s0 + s1, 'Size of union of g1 and g0 not correct');
    m0.addGraph(g2);
    assert.equal(m0.size(), s0 + s1 + s2 - 1, 'Size of union of g0, g1 and g2 not correct');
    m0.removeGraph(g1);
    assert.equal(m0.size(), s0 + s2 - 1, 'Size of union of g0 and g2 not correct');
    m0.removeGraph(g0);
    assert.equal(m0.size(), s2, 'Size of union of g2 not correct');
    m0.removeGraph(g0);
    assert.equal(m0.size(), s2, 'Size of union of g2 not correct');
    m0.removeGraph(g2);
    assert.equal(m0.size(), 0, 'Size of empty union not correct');
  });

  t('testAdd', () => {
    const g0 = graphWith('x p y');
    const g1 = graphWith('x p z; z p zz');
    const g2 = graphWith('x p y; z p a');
    const m = new MultiUnion([g0, g1]);
    let s0 = g0.size(), s1 = g1.size(), m0 = m.size();
    m.add(triple('a q b'));
    assert.equal(m.size(), m0 + 1, 'm.size should have increased by one');
    assert.equal(g0.size(), s0 + 1, 'g0.size should have increased by one');
    assert.equal(g1.size(), s1, 'g1 size should be constant');
    m.setBaseGraph(g1);
    s0 = g0.size(); s1 = g1.size(); m0 = m.size();
    m.add(triple('a1 q b1'));
    assert.equal(m.size(), m0 + 1, 'm.size should have increased by one');
    assert.equal(g0.size(), s0, 'g0 size should be constant');
    assert.equal(g1.size(), s1 + 1, 'g1.size should have increased by one');
    let expected = false;
    try { m.setBaseGraph(g2); } catch (e) { if (e instanceof TypeError) expected = true; else throw e; }
    assert.ok(expected, 'Should not have been able to make g2 the updater');
  });

  t('testDelete', () => {
    const g0 = graphWith('x p y');
    const g1 = graphWith('x p z; z p zz');
    const m = new MultiUnion([g0, g1]);
    checkDeleteSizes(1, 2, 3, g0, g1, m);
    m.delete(triple('x p y'));
    checkDeleteSizes(0, 2, 2, g0, g1, m);
    m.delete(triple('x p y'));
    checkDeleteSizes(0, 2, 2, g0, g1, m);
    m.setBaseGraph(g1);
    m.delete(triple('x p z'));
    checkDeleteSizes(0, 1, 1, g0, g1, m);
    m.delete(triple('z p zz'));
    checkDeleteSizes(0, 0, 0, g0, g1, m);
  });

  t('testContains', () => {
    const g0 = graphWith('x p y');
    const g1 = graphWith('x p z; z p zz');
    const m = new MultiUnion([g0, g1]);
    assert.ok(m.contains(triple('x p y ')), 'm should contain triple');
    assert.ok(m.contains(triple('x p z ')), 'm should contain triple');
    assert.ok(m.contains(triple('z p zz ')), 'm should contain triple');
    assert.ok(!m.contains(triple('zz p z ')), 'm should not contain triple');
  });

  t('testModel', async () => {
    const g0 = graphWith('x p y');
    const u = new MultiUnion([g0]);
    const m = ModelFactory.createModelForGraph(u);
    assert.equal(m.size(), 1, 'Model size not correct');
    const g1 = graphWith('x p z; z p zz');
    u.addGraph(g1);
    assert.equal(m.size(), 3, 'Model size not correct');
    await m.read(getFileName('ontology/list0.rdf'));
    assert.equal(m.size(), 4, 'Model size not correct');
  });
});
