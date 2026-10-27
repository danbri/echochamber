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
//   jena-core/src/test/java/org/apache/jena/datatypes/TestDatatypeValues.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. XSDDatatype.XSDduration is the datatype object of the
// xsd:duration IRI (test data, lib/testlib.mjs); Java's (XSDDuration) cast is dropped.

import assert from 'node:assert/strict';
import { NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { XSDDatatype } from '../../lib/testlib.mjs';

function durationCompareTest(expected, lex1, lex2) {
  const d1 = NodeFactory.createLiteral(lex1, null, XSDDatatype.XSDduration);
  const d2 = NodeFactory.createLiteral(lex2, null, XSDDatatype.XSDduration);
  const dur1 = d1.getLiteralValue();
  const dur2 = d2.getLiteralValue();
  const cmp = dur1.compare(dur2);
  assert.equal(cmp, expected, 'Compare: ' + lex1 + ' and ' + lex2);
  if (cmp === 0) {
    assert.equal(d1.getLiteral().getValueHashCode(), d2.getLiteral().getValueHashCode(), 'Not hash compatible: ' + lex1 + ' and ' + lex2);
    assert.ok(d1.sameValueAs(d2), 'Not equal: ' + lex1 + ' and ' + lex2);
  } else {
    assert.ok(!d1.sameValueAs(d2), 'Equal: ' + lex1 + ' and ' + lex2);
  }
}

describeJena('TestDatatypeValues', 'jena-core/src/test/java/org/apache/jena/datatypes/TestDatatypeValues.java', (t) => {
  t('duration_01', () => durationCompareTest(0, 'PT1M', 'PT1M'));
  t('duration_02', () => durationCompareTest(0, 'PT1M', 'P0YT1M0S'));
  t('duration_03', () => durationCompareTest(0, 'P1Y', 'P1Y0M'));
  t('duration_04', () => durationCompareTest(1, 'P2Y', 'P1Y'));
  t('duration_05', () => durationCompareTest(0, '-P2Y', '-P2Y'));
  t('duration_06', () => durationCompareTest(-1, '-P2Y', '-P1Y'));
  t('duration_07', () => durationCompareTest(-1, 'P2Y', 'P4Y'));
  t('duration_10', () => durationCompareTest(0, 'P1Y', 'P12M'));
  t('duration_11', () => durationCompareTest(0, 'P2Y', 'P24M'));
  t('duration_12', () => durationCompareTest(0, 'P1D', 'PT24H'));
  t('duration_13', () => durationCompareTest(0, 'P1D', 'PT1440M'));
  t('duration_14', () => durationCompareTest(0, 'P1D', 'PT86400S'));
  t('duration_20', () => durationCompareTest(0, '-P1D', '-PT86400S'));
});
