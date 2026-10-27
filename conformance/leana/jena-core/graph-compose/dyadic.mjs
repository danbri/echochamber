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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestDyadic.java
//   (abstract; its methods run in each concrete subclass's file:
//   TestUnion, TestIntersection, TestDifference, TestDisjointUnion)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. things() is a NiceIterator subclass over the words of
// a string; the anonymous Dyadic subclass is a JS class. The methods TestDyadic
// inherits from BaseTestGraph run in BaseTestGraph.test.mjs over a GraphMem,
// not over each composition (see the report of this port).

import assert from 'node:assert/strict';
import { NiceIterator, CompositionBase, Dyadic, GraphMemFactory } from '@factoidal/leana';

function things(x) {
  const tokens = x.split(/\s+/).filter(Boolean);
  return new (class extends NiceIterator {
    hasNext() { return tokens.length > 0; }
    next() { return tokens.shift(); }
  })([]);
}

/** The @Test methods of TestDyadic, registered with `t`. */
export function dyadicTests(t) {
  t('testThings', () => {
    const it1 = things('now is the time');
    const it2 = things('now is the time');
    const mt1 = things('');
    const mt2 = things('');
    assert.equal(mt1.hasNext(), false, 'mt1.hasNext()');
    assert.equal(mt2.hasNext(), false, 'mt2.hasNext()');
    assert.equal(mt1.andThen(mt2).hasNext(), false, 'andThen(mt1,mt2).hasNext()');
    assert.equal(CompositionBase.butNot(it1, it2).hasNext(), false, 'butNot(it1,it2).hasNext()');
    assert.equal(CompositionBase.butNot(things('x y z'), things('z')).hasNext(), true, 'x y z @butNot z');
    assert.equal(CompositionBase.butNot(things('x y z'), things('z')).hasNext(), true, 'x y z @butNot a');
  });

  t('testDyadicOperands', () => {
    const g = GraphMemFactory.createDefaultGraph();
    const h = GraphMemFactory.createDefaultGraph();
    const d = new (class extends Dyadic { _graphBaseFind() { return null; } })(g, h);
    assert.ok(d.getL() === g);
    assert.ok(d.getR() === h);
  });
}
