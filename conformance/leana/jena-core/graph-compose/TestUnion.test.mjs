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
//   jena-core/src/test/java/org/apache/jena/graph/compose/TestUnion.java
//   (with the methods of its abstract base TestDyadic, from dyadic.mjs)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. GraphTestLib.graphWith makes a same-term GraphMem.

import { Union } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, triple, assertIsomorphic } from '../../lib/testlib.mjs';
import { dyadicTests } from './dyadic.mjs';

const unionOf = (s1, s2) => new Union(graphWith(s1), graphWith(s2));

describeJena('TestUnion', 'jena-core/src/test/java/org/apache/jena/graph/compose/TestUnion.java', (t) => {
  dyadicTests(t);

  t('testStaticUnion', () => {
    assertIsomorphic(graphWith(''), unionOf('', ''));
    assertIsomorphic(graphWith('x R y'), unionOf('x R y', ''));
    assertIsomorphic(graphWith('x R y'), unionOf('', 'x R y'));
    assertIsomorphic(graphWith('x R y; x R z'), unionOf('x R y', 'x R z'));
    assertIsomorphic(graphWith('x R y'), unionOf('x R y', 'x R y'));
  });

  t('testUnionReflectsChangesToOperands', () => {
    const l = graphWith('x R y');
    const r = graphWith('x R y');
    const u = new Union(l, r);
    assertIsomorphic(graphWith('x R y'), u);
    l.add(triple('x R z'));
    assertIsomorphic(graphWith('x R y; x R z'), u);
    l.delete(triple('x R y'));
    assertIsomorphic(graphWith('x R y; x R z'), u);
    r.add(triple('p S q'));
    assertIsomorphic(graphWith('x R y; x R z; p S q'), u);
    r.delete(triple('x R y'));
    assertIsomorphic(graphWith('x R z; p S q'), u);
  });

  t('testAdd', () => {
    const l = graphWith('x R y');
    const r = graphWith('x R y; p S q');
    const u = new Union(l, r);
    u.add(triple('x R y'));
    assertIsomorphic(graphWith('x R y'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
    u.add(triple('p S q'));
    assertIsomorphic(graphWith('x R y; p S q'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
    u.add(triple('r A s'));
    assertIsomorphic(graphWith('x R y; p S q; r A s'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
  });

  t('testDelete', () => {
    const l = graphWith('x R y; x R z');
    const r = graphWith('x R y; p S q');
    const u = new Union(l, r);
    u.delete(triple('r A s'));
    assertIsomorphic(graphWith('x R y; x R z'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
    u.delete(triple('x R z'));
    assertIsomorphic(graphWith('x R y'), l);
    assertIsomorphic(graphWith('x R y; p S q'), r);
    u.delete(triple('p S q'));
    assertIsomorphic(graphWith('x R y'), l);
    assertIsomorphic(graphWith('x R y'), r);
    u.delete(triple('x R y'));
    assertIsomorphic(graphWith(''), l);
    assertIsomorphic(graphWith(''), r);
  });
});
