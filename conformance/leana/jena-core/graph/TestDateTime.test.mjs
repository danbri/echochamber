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
//   jena-core/src/test/java/org/apache/jena/graph/TestDateTime.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The static XSDDateTime fields are made inside each test (XSDDatatype.XSDdateTime.parse is a leana gap and would fail the import); Calendar is a JS Date; AbstractDateTime.LESS_THAN/EQUAL/GREATER_THAN are -1/0/1 as in Jena; XSDDatatype is test data.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory, StringWriter, StringReader } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, XSDDatatype } from '../../lib/testlib.mjs';

const LESS_THAN = -1, EQUAL = 0, GREATER_THAN = 1; // AbstractDateTime
const makeDateTime = (time) => XSDDatatype.XSDdateTime.parse(time);
const times = () => ['2009-08-13T17:54:40.348Z', '2009-08-13T18:54:39Z', '2009-08-13T18:54:40Z', '2009-08-13T18:54:40.348Z',
  '2009-08-13T18:54:40.505Z', '2009-08-13T18:54:40.77Z', '2009-08-13T18:54:40.88Z', '2009-08-13T18:54:40.989Z',
  '2009-08-13T19:54:40.989Z', '2009-08-13T18:54:40.077Z', '2009-08-13T18:54:40.770Z'].map(makeDateTime);

function testCalendarRT(value) {
  const cal = new Date(value);
  const lit1 = ResourceFactory.createTypedLiteral(cal);
  const lit2 = ResourceFactory.createTypedLiteral(lit1.getLexicalForm(), lit1.getDatatype());
  assertEquals(lit1, lit2, 'equals: ');
  assert.equal(lit1.hashCode(), lit2.hashCode(), 'hash code: ');
}

describeJena('TestDateTime', 'jena-core/src/test/java/org/apache/jena/graph/TestDateTime.java', (t) => {
  t('testXSDOrder', () => {
    const [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10] = times();
    assert.equal(t0.compare(t1), LESS_THAN);
    assert.equal(t1.compare(t2), LESS_THAN);
    assert.equal(t2.compare(t3), LESS_THAN);
    assert.equal(t3.compare(t4), LESS_THAN);
    assert.equal(t4.compare(t5), LESS_THAN);
    assert.equal(t5.compare(t6), LESS_THAN);
    assert.equal(t6.compare(t7), LESS_THAN);
    assert.equal(t7.compare(t8), LESS_THAN);
    assert.equal(t9.compare(t5), LESS_THAN);
    assert.equal(t9.compare(t3), LESS_THAN);
    assert.equal(t9.compare(t2), GREATER_THAN);
    assert.equal(t5.compare(t10), EQUAL);
  });
  t('testJavaOrder', () => {
    const [t0, t1, t2, t3, t4, t5, t6, t7, t8] = times();
    assert.equal(t0.compareTo(t1), LESS_THAN);
    assert.equal(t1.compareTo(t2), LESS_THAN);
    assert.equal(t2.compareTo(t3), LESS_THAN);
    assert.equal(t3.compareTo(t4), LESS_THAN);
    assert.equal(t4.compareTo(t5), LESS_THAN);
    assert.equal(t5.compareTo(t6), LESS_THAN);
    assert.equal(t6.compareTo(t7), LESS_THAN);
    assert.equal(t7.compareTo(t8), LESS_THAN);
  });
  t('testRoundTripping1', async () => {
    const m = ModelFactory.createDefaultModel();
    const startTime = m.createProperty('http://jena.hpl.hp.com/test#startTime');
    const cal = new Date(); cal.setMilliseconds(0);
    const xsdlit0 = m.createTypedLiteral(cal);
    const event = m.createResource();
    event.addProperty(startTime, xsdlit0);
    const sw = new StringWriter();
    m.write(sw, 'RDF/XML');
    const m1 = ModelFactory.createDefaultModel();
    await m1.read(new StringReader(sw.toString()), 'RDF/XML');
    assert.ok(m.isIsomorphicWith(m1));
    const xsdlit1 = m1.listStatements().next().getObject().asLiteral();
    assertEquals(xsdlit0, xsdlit1);
  });
  t('testRoundTripping2', () => testCalendarRT(1366126807300));
  t('testRoundTripping3', () => testCalendarRT(1366126807310));
  t('testRoundTripping4', () => testCalendarRT(1366126807301));
});
