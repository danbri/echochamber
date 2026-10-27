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
//   jena-core/src/test/java/org/apache/jena/util/iterator/TestWrappedIterator.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Arrays.asList(...).iterator() and Set.iterator() are
// testlib's javaIterator (a java.util.Iterator with remove()).

import assert from 'node:assert/strict';
import { Triple, WrappedIterator, UnsupportedOperationException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { graphWith, nodeSet, javaIterator, assertThrows } from '../../lib/testlib.mjs';

describeJena('TestWrappedIterator', 'jena-core/src/test/java/org/apache/jena/util/iterator/TestWrappedIterator.java', (t) => {
  t('testWrappedIterator', () => {
    const i = javaIterator(['bill', 'and', 'ben']);
    const e = WrappedIterator.create(i);
    assert.ok(e.hasNext(), 'wrapper has at least one element');
    assert.equal(e.next(), 'bill');
    assert.ok(e.hasNext(), 'wrapper has at least two elements');
    assert.equal(e.next(), 'and');
    assert.ok(e.hasNext(), 'wrapper has at least three elements');
    assert.equal(e.next(), 'ben');
    assert.ok(!e.hasNext(), 'wrapper is now empty');
  });

  t('testUnwrapExtendedIterator', () => {
    const i = graphWith('a R b').find(Triple.ANY);
    assert.ok(i === WrappedIterator.create(i));
  });

  t('testWrappedNoRemove', () => {
    const base = javaIterator(nodeSet('a b c'));
    base.next();
    base.remove();
    const wrapped = WrappedIterator.createNoRemove(base);
    wrapped.next();
    assertThrows(UnsupportedOperationException, () => wrapped.remove(), 'wrapped-no-remove iterator should deny .remove()');
  });
});
