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
//   jena-core/src/test/java/org/apache/jena/graph/TestGraphPrefixMapping.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana.
// Also derived: AbstractTestPrefixMapping.testUseEasyPrefix / testShortForm
// (jena-core/src/test/java/org/apache/jena/graph/compose/AbstractTestPrefixMapping.java),
// inlined; its crispURI, butterURI, ropeURI constants are copied.

import assert from 'node:assert/strict';
import { GraphMemFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

const crispURI = 'http://crisp.nosuch.net/';
const ropeURI = 'scheme:rope/string#';
const butterURI = 'ftp://ftp.nowhere.at.all/cream#';

function testShortForm(title, ns) {
  ns.setNsPrefix('crisp', crispURI);
  ns.setNsPrefix('butter', butterURI);
  assert.equal(ns.shortForm(''), '', title);
  assert.equal(ns.shortForm(ropeURI), ropeURI, title);
  assert.equal(ns.shortForm(crispURI + 'tail'), 'crisp:tail', title);
  assert.equal(ns.shortForm(butterURI + 'here:we:are'), 'butter:here:we:are', title);
}
const testUseEasyPrefix = (title, ns) => testShortForm(title, ns);

describeJena('TestGraphPrefixMapping', 'jena-core/src/test/java/org/apache/jena/graph/TestGraphPrefixMapping.java', (t) => {
  t('testGraphPrefixMapping', () => {
    const g = GraphMemFactory.createDefaultGraph();
    testUseEasyPrefix('from Graph', g.getPrefixMapping());
    const pm = g.getPrefixMapping(); // testSameMapping(g)
    assert.ok(pm === g.getPrefixMapping());
  });
});
