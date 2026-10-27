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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestDifference.java
//   (with the methods of its abstract base TestDyadic, from dyadic.mjs)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. GraphTestLib.graphWith makes a same-term GraphMem.

import { Difference } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, triple, assertIsomorphic } from '../../lib/testlib.mjs';
import { dyadicTests } from './dyadic.mjs';

const differenceOf = (s1, s2) => new Difference(graphWith(s1), graphWith(s2));

describeJena('TestDifference', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestDifference.java', (t) => {
  dyadicTests(t);

  t('testStaticDifference', () => {
    assertIsomorphic(graphWith(''), differenceOf('', ''));
    assertIsomorphic(graphWith('x R y'), differenceOf('x R y', ''));
    assertIsomorphic(graphWith(''), differenceOf('', 'x R y'));
    assertIsomorphic(graphWith(''), differenceOf('x R y', 'x R y'));
    assertIsomorphic(graphWith('p R q'), differenceOf('x R y; p R q', 'r A s; x R y'));
  });

  t('testDifferenceReflectsChangesToOperands', () => {
    const l = graphWith('x R y');
    const r = graphWith('x R y');
    const diff = new Difference(l, r);
    assertIsomorphic(graphWith(''), diff);
    r.delete(triple('x R y'));
    assertIsomorphic(graphWith('x R y'), diff);
    l.add(triple('x R z'));
    assertIsomorphic(graphWith('x R y; x R z'), diff);
    r.add(triple('x R z'));
    assertIsomorphic(graphWith('x R y'), diff);
  });

  t('testAdd', () => {
    const l = graphWith('x R y');
    const r = graphWith('x R y; x R z');
    const diff = new Difference(l, r);
    assertIsomorphic(graphWith(''), diff);
    diff.add(triple('p S q'));
    assertIsomorphic(graphWith('p S q'), diff);
    assertIsomorphic(graphWith('x R y; p S q'), l);
    assertIsomorphic(graphWith('x R y; x R z'), r);
    diff.add(triple('x R z'));
    assertIsomorphic(graphWith('x R z; p S q'), diff);
    assertIsomorphic(graphWith('x R y; x R z; p S q'), l);
    assertIsomorphic(graphWith('x R y'), r);
    diff.add(triple('x R y'));
    assertIsomorphic(graphWith('x R y; x R z; p S q'), diff);
    assertIsomorphic(graphWith('x R y; x R z; p S q'), l);
    assertIsomorphic(graphWith(''), r);
  });

  t('testDelete', () => {
    const l = graphWith('x R y; x R z');
    const r = graphWith('x R y');
    const diff = new Difference(l, r);
    assertIsomorphic(graphWith('x R z'), diff);
    diff.delete(triple('p S q'));
    assertIsomorphic(graphWith('x R z'), diff);
    assertIsomorphic(graphWith('x R y; x R z'), l);
    assertIsomorphic(graphWith('x R y'), r);
    diff.delete(triple('x R y'));
    assertIsomorphic(graphWith('x R z'), diff);
    assertIsomorphic(graphWith('x R z'), l);
    assertIsomorphic(graphWith('x R y'), r);
    diff.delete(triple('x R z'));
    assertIsomorphic(graphWith(''), diff);
    assertIsomorphic(graphWith(''), l);
    assertIsomorphic(graphWith('x R y'), r);
  });
});
