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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestIntersection.java
//   (with the methods of its abstract base TestDyadic, from dyadic.mjs)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. GraphTestLib.graphWith makes a same-term GraphMem.

import { Intersection } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, triple, assertIsomorphic } from '../../lib/testlib.mjs';
import { dyadicTests } from './dyadic.mjs';

const intersectionOf = (s1, s2) => new Intersection(graphWith(s1), graphWith(s2));

describeJena('TestIntersection', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestIntersection.java', (t) => {
  dyadicTests(t);

  t('testStaticIntersection', () => {
    assertIsomorphic(graphWith(''), intersectionOf('', ''));
    assertIsomorphic(graphWith(''), intersectionOf('x R y', ''));
    assertIsomorphic(graphWith(''), intersectionOf('', 'x R y'));
    assertIsomorphic(graphWith('x R y'), intersectionOf('x R y', 'x R y'));
    assertIsomorphic(graphWith('x R y'), intersectionOf('x R y; p R q', 'r A s; x R y'));
  });

  t('testIntersectionReflectsChangesToOperands', () => {
    const l = graphWith('x R y');
    const r = graphWith('p S q');
    const isec = new Intersection(l, r);
    assertIsomorphic(graphWith(''), isec);
    l.add(triple('p S q'));
    assertIsomorphic(graphWith('p S q'), isec);
    r.add(triple('x R y'));
    assertIsomorphic(graphWith('p S q; x R y'), isec);
    l.add(triple('p S o'));
    r.add(triple('x R z'));
    assertIsomorphic(graphWith('p S q; x R y'), isec);
    l.delete(triple('x R y'));
    assertIsomorphic(graphWith('p S q'), isec);
    r.delete(triple('p S q'));
    assertIsomorphic(graphWith(''), isec);
  });

  t('testAdd', () => {
    const l = graphWith('x R y');
    const r = graphWith('p S q');
    const isec = new Intersection(l, r);
    assertIsomorphic(graphWith(''), isec);
    isec.add(triple('r A s'));
    assertIsomorphic(graphWith('r A s'), isec);
    assertIsomorphic(graphWith('x R y; r A s'), l);
    assertIsomorphic(graphWith('p S q; r A s'), r);
    isec.add(triple('x R y'));
    assertIsomorphic(graphWith('r A s; x R y'), isec);
    assertIsomorphic(graphWith('x R y; r A s'), l);
    assertIsomorphic(graphWith('p S q; r A s; x R y'), r);
    isec.add(triple('p S q'));
    assertIsomorphic(graphWith('p S q; r A s; x R y'), isec);
    assertIsomorphic(graphWith('p S q; r A s; x R y'), l);
    assertIsomorphic(graphWith('p S q; r A s; x R y'), r);
  });

  t('testDelete', () => {
    const l = graphWith('r A s; x R y');
    const r = graphWith('x R y; p S q');
    const isec = new Intersection(l, r);
    assertIsomorphic(graphWith('x R y'), isec);
    isec.delete(triple('r A s'));
    assertIsomorphic(graphWith('r A s; x R y'), l);
    isec.delete(triple('p S q'));
    assertIsomorphic(graphWith('x R y; p S q'), r);
    isec.delete(triple('x R y'));
    assertIsomorphic(graphWith(''), isec);
    assertIsomorphic(graphWith('r A s'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
  });
});
