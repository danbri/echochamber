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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceMethods.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// The @BeforeEach setUp (which adds Java typed literals) runs at the start of each test.

import assert from 'node:assert/strict';
import { ModelFactory, PropertyNotFoundException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, RDF, tv } from '../../lib/testlib.mjs';

const lang = 'en';

function setUp() {
  const model = ModelFactory.createDefaultModel();
  const tvLiteral = model.createLiteral('test 12 string 2');
  const tvResource = model.createResource();
  const r = model.createResource().addLiteral(RDF.value, tv.tvBoolean)
    .addLiteral(RDF.value, tv.tvByte).addLiteral(RDF.value, tv.tvShort)
    .addLiteral(RDF.value, tv.tvInt).addLiteral(RDF.value, tv.tvLong)
    .addLiteral(RDF.value, tv.tvChar).addLiteral(RDF.value, tv.tvFloat)
    .addLiteral(RDF.value, tv.tvDouble).addProperty(RDF.value, tv.tvString)
    .addProperty(RDF.value, tv.tvString, lang).addLiteral(RDF.value, tv.tvObject)
    .addProperty(RDF.value, tvLiteral).addProperty(RDF.value, tvResource);
  return { model, r, tvLiteral, tvResource };
}

describeJena('TestResourceMethods', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceMethods.java', (t) => {
  const testHasSubjectR = (r, it) => { while (it.hasNext()) assertEquals(r, it.nextStatement().getSubject()); };

  t('testAllSubjectsCorrect', () => {
    const { model, r } = setUp();
    testHasSubjectR(r, model.listStatements());
    testHasSubjectR(r, r.listProperties());
  });
  t('testBoolean', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvBoolean)); });
  t('testByte', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvByte)); });
  t('testChar', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvChar)); });
  t('testCorrectSubject', () => { const { r } = setUp(); assertEquals(r, r.getRequiredProperty(RDF.value).getSubject()); });
  t('testCountsCorrect', () => {
    const { model, r } = setUp();
    assert.equal(model.listStatements().toList().length, 13);
    assert.equal(r.listProperties(RDF.value).toList().length, 13);
    assert.equal(r.listProperties(RDF.type).toList().length, 0);
  });
  t('testDouble', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvDouble)); });
  t('testFloat', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvFloat)); });
  t('testInt', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvInt)); });
  t('testLiteral', () => { const { r, tvLiteral } = setUp(); assert.ok(r.hasProperty(RDF.value, tvLiteral)); });
  t('testLong', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvLong)); });
  t('testNoSuchPropertyException', () => {
    const { r } = setUp();
    assertThrows(PropertyNotFoundException, () => r.getRequiredProperty(RDF.type), 'missing property should throw exception');
  });
  t('testNoSuchPropertyNull', () => { const { r } = setUp(); assert.equal(r.getProperty(RDF.type), null); });
  t('testObject', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvObject)); });
  t('testRemoveProperties', () => {
    const { model, r } = setUp();
    r.removeProperties();
    assert.equal(model.listStatements(r, null, null).hasNext(), false);
  });
  t('testResource', () => { const { r, tvResource } = setUp(); assert.ok(r.hasProperty(RDF.value, tvResource)); });
  t('testShort', () => { const { r } = setUp(); assert.ok(r.hasLiteral(RDF.value, tv.tvShort)); });
  t('testString', () => { const { r } = setUp(); assert.ok(r.hasProperty(RDF.value, tv.tvString)); });
  t('testStringWithLanguage', () => { const { r } = setUp(); assert.ok(r.hasProperty(RDF.value, tv.tvString, lang)); });
});
