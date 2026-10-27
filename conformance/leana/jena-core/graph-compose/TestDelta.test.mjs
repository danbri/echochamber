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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestDelta.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. GraphTestLib.graphWith and newGraph make a same-term
// GraphMem. The methods TestDelta inherits from BaseTestGraph run in
// BaseTestGraph.test.mjs over a GraphMem, not over a Delta.

import assert from 'node:assert/strict';
import { Delta } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, newGraph, triple, assertIsomorphic } from '../../lib/testlib.mjs';

const DEFAULT_TRIPLES = 'x R y; p S q';

describeJena('TestDelta', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestDelta.java', (t) => {
  t('testDeltaMirrorsBase', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    assertIsomorphic(base, delta);
  });

  t('testAddGoesToAdditions', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.add(triple('x R z'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith('x R z'), delta.getAdditions());
    assertIsomorphic(graphWith(''), delta.getDeletions());
    assertIsomorphic(graphWith(DEFAULT_TRIPLES + '; x R z'), delta);
  });

  t('testDeleteGoesToDeletions', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.delete(triple('x R y'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith('x R y'), delta.getDeletions());
    assertIsomorphic(graphWith('p S q'), delta);
  });

  t('testRedundantAddNoOp', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.add(triple('x R y'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith(''), delta.getAdditions());
    assertIsomorphic(graphWith(''), delta.getDeletions());
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), delta);
  });

  t('testRedundantDeleteNoOp', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.delete(triple('a T b'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith(''), delta.getAdditions());
    assertIsomorphic(graphWith(''), delta.getDeletions());
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), delta);
  });

  t('testAddThenDelete', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.add(triple('a T b'));
    delta.delete(triple('a T b'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith(''), delta.getAdditions());
    assertIsomorphic(graphWith(''), delta.getDeletions());
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), delta);
  });

  t('testDeleteThenAdd', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.delete(triple('p S q'));
    delta.add(triple('p S q'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith(''), delta.getAdditions());
    assertIsomorphic(graphWith(''), delta.getDeletions());
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), delta);
  });

  t('testAddAndDelete', () => {
    const base = graphWith(DEFAULT_TRIPLES);
    const delta = new Delta(base);
    delta.delete(triple('a T b'));
    delta.add(triple('x R z'));
    delta.delete(triple('p S q'));
    delta.add(triple('a T b'));
    assertIsomorphic(graphWith(DEFAULT_TRIPLES), base);
    assertIsomorphic(graphWith('a T b; x R z'), delta.getAdditions());
    assertIsomorphic(graphWith('p S q'), delta.getDeletions());
    assertIsomorphic(graphWith('x R y; x R z; a T b'), delta);
  });

  t('testTerms1', () => {
    const t1 = triple('s p 1');
    const t01 = triple('s p 01');
    const base = newGraph();
    base.add(t1);
    const delta = new Delta(base);
    delta.add(t01);
    assert.ok(delta.getAdditions().contains(triple('s p 01')));
    assert.ok(!delta.getAdditions().contains(triple('s p 1')));
    assert.ok(delta.contains(t1));
    assert.ok(delta.contains(t01));
  });

  t('testTerms2', () => {
    const t1 = triple('s p 1');
    const t01 = triple('s p 01');
    const base = newGraph();
    base.add(t1);
    const delta = new Delta(base);
    delta.delete(t01);
    assert.ok(!delta.getDeletions().contains(triple('s p 01')));
    assert.ok(!delta.getAdditions().contains(triple('s p 1')));
  });

  t('testTerms3', () => {
    const t1 = triple('s p 1');
    const t01 = triple('s p 01');
    const base = newGraph();
    base.add(t1);
    const delta = new Delta(base);
    delta.add(t01);
    delta.delete(t01);
    delta.delete(t1);
    assert.ok(!delta.getDeletions().contains(t01));
    assert.ok(delta.getDeletions().contains(t1));
    assert.ok(!delta.getDeletions().contains(t01));
    assert.ok(!delta.getAdditions().contains(t01));
  });

  t('testTerms4', () => {
    const t1 = triple('s p 1');
    const t01 = triple('s p 01');
    const base = newGraph();
    const delta = new Delta(base);
    delta.add(t1);
    delta.delete(t01);
    assert.ok(!delta.getDeletions().contains(triple('s p 01')));
    assert.ok(delta.getDeletions().isEmpty());
    assert.ok(delta.getAdditions().contains(triple('s p 1')));
    assert.ok(!delta.getAdditions().isEmpty());
  });
});
