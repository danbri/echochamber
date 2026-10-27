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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestQuad.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. SSE.parseNode(":g1") is read by ./sse.mjs (SSE's
// default prefix ':' is <http://example/>). assertEquals on Nodes is equals().

import assert from 'node:assert/strict';
import { Quad, Node, UnsupportedOperationException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertThrows } from '../../lib/testlib.mjs';
import { parseNode } from './sse.mjs';

const g1 = parseNode(':g1'), s1 = parseNode(':s1'), p1 = parseNode(':p1'), o1 = parseNode(':o1');
const g2 = parseNode(':g2'), s2 = parseNode(':s2'), p2 = parseNode(':p2'), o2 = parseNode(':o2');

describeJena('TestQuad', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestQuad.java', (t) => {
  t('quad_01', () => {
    const quad = Quad.create(g1, s1, p1, o1);
    assert.ok(g1.equals(quad.getGraph()));
    assert.ok(s1.equals(quad.getSubject()));
    assert.ok(p1.equals(quad.getPredicate()));
    assert.ok(o1.equals(quad.getObject()));
  });
  t('quad_02', () => {
    const quad = Quad.create(null, s1, p1, o1);
    assert.equal(quad.getGraph(), null);
    assertThrows(UnsupportedOperationException, () => Quad.create(g1, null, p1, o1));
    assertThrows(UnsupportedOperationException, () => Quad.create(g1, s1, null, o1));
    assertThrows(UnsupportedOperationException, () => Quad.create(g1, s1, p1, null));
  });
  t('quad_03', () => {
    const quad = Quad.createMatch(null, null, null, null);
    assert.equal(quad.getGraph(), null);
    assert.ok(Node.ANY.equals(quad.getSubject()));
    assert.ok(Node.ANY.equals(quad.getPredicate()));
    assert.ok(Node.ANY.equals(quad.getObject()));
  });
  const both = (a, b, want) => {
    assert.equal(b.matches(a), want);
    assert.equal(a.matches(b), want);
  };
  t('quad_match_01', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g1, s1, p1, o1), true));
  t('quad_match_02', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g2, s2, p2, o2), false));
  t('quad_match_10', () => both(Quad.create(g1, s1, p1, o1), Quad.create(Node.ANY, s1, p1, o1), true));
  t('quad_match_11', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g1, Node.ANY, p1, o1), true));
  t('quad_match_12', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g1, s1, Node.ANY, o1), true));
  t('quad_match_13', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g1, s1, p1, Node.ANY), true));
  t('quad_match_20', () => both(Quad.create(g1, s1, p1, o1), Quad.create(Node.ANY, s2, p1, o1), false));
  t('quad_match_21', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g2, Node.ANY, p1, o1), false));
  t('quad_match_22', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g1, s1, Node.ANY, o2), false));
  t('quad_match_23', () => both(Quad.create(g1, s1, p1, o1), Quad.create(g2, s1, p1, Node.ANY), false));
});
