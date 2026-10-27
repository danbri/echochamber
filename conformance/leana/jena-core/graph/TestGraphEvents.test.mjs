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
//   jena-core/src/test/java/org/apache/jena/graph/TestGraphEvents.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; Boolean.TRUE is the JS true.

import assert from 'node:assert/strict';
import { GraphEvents } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { createTriple, node, assertEquals } from '../../lib/testlib.mjs';

function testGraphEventsRemove(S, P, O) {
  const expected = createTriple(S + ' ' + P + ' ' + O);
  const e = GraphEvents.remove(node(S), node(P), node(O));
  assertEquals(expected, e.getContent());
  assert.equal(e.getTitle(), 'remove');
}

function testGraphEventContents(title, expected) {
  const e = new GraphEvents(title, expected);
  assert.equal(e.getTitle(), title);
  assertEquals(expected, e.getContent());
}

describeJena('TestGraphEvents', 'jena-core/src/test/java/org/apache/jena/graph/TestGraphEvents.java', (t) => {
  t('testGraphEventContent', () => {
    testGraphEventContents('testing', 'an example');
    testGraphEventContents('toasting', true);
    testGraphEventContents('tasting', createTriple('we are here'));
  });

  t('testGraphEventsRemove', () => {
    testGraphEventsRemove('s', 'p', 'o');
    testGraphEventsRemove('s', 'p', '17');
    testGraphEventsRemove('_s', 'p', "'object'");
    testGraphEventsRemove('not:known', 'p', "'chat'fr");
  });
});
