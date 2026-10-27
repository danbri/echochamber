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
//   jena-core/src/test/java/org/apache/jena/util/iterator/TestAndThen.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. A Java List is a JS array (testlib listOfStrings, an
// ArrayList) and List.iterator() is testlib's javaIterator, whose remove()
// deletes from the array; Iter.toList is ExtendedIterator.toList; assertSame is ===.

import assert from 'node:assert/strict';
import { NiceIterator, WrappedIterator } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  iteratorOfStrings, listOfStrings, javaIterator, LoggingClosableIterator, assertEquals,
} from '../../lib/testlib.mjs';

const concatAsString = (strings) => strings.join('');

function removeWhen(target) {
  const L = listOfStrings('a b c');
  const R = listOfStrings('d e f');
  const Lit = WrappedIterator.create(javaIterator(L));
  const Rit = WrappedIterator.create(javaIterator(R));
  const LR = Lit.andThen(Rit);
  while (LR.hasNext()) {
    const s = LR.next();
    if (s === target) {
      LR.hasNext(); // test for JENA-60
      LR.remove();
    }
  }
  return [L, R];
}

describeJena('TestAndThen', 'jena-core/src/test/java/org/apache/jena/util/iterator/TestAndThen.java', (t) => {
  t('testAndThen', () => {
    const L = iteratorOfStrings('a b c');
    const R = iteratorOfStrings('d e f');
    assert.ok(L instanceof NiceIterator, 'expected instance of NiceIterator');
    assert.ok(R instanceof NiceIterator, 'expected instance of NiceIterator');
    assertEquals(listOfStrings('a b c d e f'), L.andThen(R).toList());
  });

  t('testAndThenExtension', () => {
    const L = iteratorOfStrings('a b c');
    const R = iteratorOfStrings('d e f');
    const X = iteratorOfStrings('g h i');
    const LR = L.andThen(R);
    const LRX = LR.andThen(X);
    assert.ok(LR === LRX);
    assertEquals(listOfStrings('a b c d e f g h i'), LRX.toList());
  });

  t('testClosingConcatenationClosesRemainingIterators', () => {
    const L = new LoggingClosableIterator(iteratorOfStrings('only'));
    const M = new LoggingClosableIterator(iteratorOfStrings('single'));
    const R = new LoggingClosableIterator(iteratorOfStrings('it'));
    const cat = L.andThen(M).andThen(R);
    cat.next();
    cat.close();
    assert.ok(M.isClosed(), 'middle iterator should have been closed');
    assert.ok(R.isClosed(), 'final iterator should have been closed');
  });

  t('testRemove1', () => {
    const [L, R] = removeWhen('c');
    assert.equal(concatAsString(L), 'ab');
    assert.equal(concatAsString(R), 'def');
  });

  t('testRemove2', () => {
    const [L, R] = removeWhen('d');
    assert.equal(concatAsString(L), 'abc');
    assert.equal(concatAsString(R), 'ef');
  });

  t('testRemove3', () => {
    const L = listOfStrings('a b c');
    const R = listOfStrings('d e f');
    const LR = WrappedIterator.create(javaIterator(L)).andThen(WrappedIterator.create(javaIterator(R)));
    while (LR.hasNext()) LR.next();
    LR.remove();
    assert.equal(concatAsString(L), 'abc');
    assert.equal(concatAsString(R), 'de');
  });
});
