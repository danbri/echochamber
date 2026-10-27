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
//   jena-core/src/test/java/org/apache/jena/graph/TestGraphBaseToString.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. LittleGraphBase is a JavaScript subclass of
// leana's GraphBase; Java String.contains is String.includes (the Java test
// looks for the literal text \.\.\. and so does this port).

import assert from 'node:assert/strict';
import { GraphBase, WrappedIterator, JenaSet } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { createTriple } from '../../lib/testlib.mjs';

const { TOSTRING_TRIPLE_BASE, TOSTRING_TRIPLE_LIMIT } = GraphBase;

class LittleGraphBase extends GraphBase {
  constructor() { super(); this.triples = new JenaSet(); }
  performAdd(tr) { this.triples.add(tr); }
  graphBaseFind(m) { return WrappedIterator.create(this.triples[Symbol.iterator]()); }
}

const countTriples = (s) => s.replace(/[^;]+/g, '').length + 1;
function addTriples(g, from, to) {
  for (let i = from; i <= to; i += 1) g.add(createTriple('s p ' + i));
}

describeJena('TestGraphBaseToString', 'jena-core/src/test/java/org/apache/jena/graph/TestGraphBaseToString.java', (t) => {
  t('testToStringBaseAndLimit', () => {
    assert.ok(0 < TOSTRING_TRIPLE_BASE, 'triple base count must be greater than 0');
    assert.ok(TOSTRING_TRIPLE_BASE < TOSTRING_TRIPLE_LIMIT, 'triple base count must be less than limit');
    assert.ok(TOSTRING_TRIPLE_LIMIT < 20, 'triple count limit must be less than 20');
  });
  t('testEllipsisAbsentForSmallModels', () => {
    const g = new LittleGraphBase();
    addTriples(g, 1, TOSTRING_TRIPLE_BASE);
    assert.ok(!g.toString().includes('\\.\\.\\.'), 'small model must not contain ellipsis cut-off');
  });
  t('testEllipsisPresentForLargeModels', () => {
    const g = new LittleGraphBase();
    addTriples(g, 1, TOSTRING_TRIPLE_LIMIT + 1);
    assert.ok(!g.toString().includes('\\.\\.\\.'), 'large model must contain ellipsis cut-off');
  });
  t('testStringTripleCount', () => {
    const g = new LittleGraphBase();
    const baseCount = TOSTRING_TRIPLE_BASE;
    addTriples(g, 1, baseCount);
    assert.equal(countTriples(g.toString()), baseCount);
    addTriples(g, baseCount + 1, 20);
    assert.equal(countTriples(g.toString()), TOSTRING_TRIPLE_LIMIT);
  });
});
