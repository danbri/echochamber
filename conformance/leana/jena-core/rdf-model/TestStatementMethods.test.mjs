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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementMethods.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java's assertEquals(expected, actual, delta) is a tolerance check.

import assert from 'node:assert/strict';
import { ModelFactory, LiteralRequiredException, ResourceRequiredException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, RDF, tv } from '../../lib/testlib.mjs';

const near = (expected, actual, delta) => assert.ok(Math.abs(expected - actual) <= delta, `${actual} not within ${delta} of ${expected}`);

describeJena('TestStatementMethods', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementMethods.java', (t0) => {
  let model, r;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    r = model.createResource();
    try { return fn(); } finally { model.close(); }
  });
  const checkChangedStatementSP = (changed) => {
    assertEquals(r, changed.getSubject());
    assertEquals(RDF.value, changed.getPredicate());
  };
  const checkCorrectStatements = (sTrue, changed) => {
    assert.ok(!model.contains(sTrue));
    assert.ok(!model.containsLiteral(r, RDF.value, true));
    assert.ok(model.contains(changed));
  };
  const loadInitialStatement = () => {
    const sTrue = model.createLiteralStatement(r, RDF.value, true);
    model.add(sTrue);
    return sTrue;
  };

  t('testAlt', () => {
    const tvAlt = model.createAlt();
    assertEquals(tvAlt, model.createStatement(r, RDF.value, tvAlt).getAlt());
  });

  t('testBag', () => {
    const tvBag = model.createBag();
    assertEquals(tvBag, model.createStatement(r, RDF.value, tvBag).getBag());
  });

  t('testBoolean', () => {
    const s = model.createLiteralStatement(r, RDF.value, true);
    assertEquals(model.createTypedLiteral(true), s.getObject());
    assert.equal(s.getBoolean(), true);
  });

  t('testByte', () => {
    const s = model.createLiteralStatement(r, RDF.value, tv.tvByte);
    assertEquals(model.createTypedLiteral(tv.tvByte), s.getObject());
    assert.equal(s.getLong(), tv.tvByte);
  });

  t('testChangeObjectBoolean', () => {
    const sTrue = loadInitialStatement();
    const sFalse = sTrue.changeLiteralObject(false);
    checkChangedStatementSP(sFalse);
    assertEquals(model.createTypedLiteral(false), sFalse.getObject());
    assert.equal(sFalse.getBoolean(), false);
    checkCorrectStatements(sTrue, sFalse);
    assert.ok(model.containsLiteral(r, RDF.value, false));
  });

  const changeObject = (value, get, delta) => () => {
    const sTrue = loadInitialStatement();
    const changed = sTrue.changeLiteralObject(value);
    checkChangedStatementSP(changed);
    assertEquals(model.createTypedLiteral(value), changed.getObject());
    if (delta === undefined) assert.equal(changed[get](), value); else near(value, changed[get](), delta);
    checkCorrectStatements(sTrue, changed);
    assert.ok(model.containsLiteral(r, RDF.value, value));
  };

  t('testChangeObjectByte', changeObject(tv.tvByte, 'getByte'));

  t('testChangeObjectChar', () => {
    const sTrue = loadInitialStatement();
    const changed = sTrue.changeLiteralObject(tv.tvChar);
    checkChangedStatementSP(changed);
    assert.equal(changed.getChar(), tv.tvChar);
    assertEquals(model.createTypedLiteral(tv.tvChar), changed.getObject());
    checkCorrectStatements(sTrue, changed);
    assert.ok(model.containsLiteral(r, RDF.value, tv.tvChar));
  });

  t('testChangeObjectDouble', changeObject(tv.tvDouble, 'getDouble', tv.dDelta));
  t('testChangeObjectFloat', changeObject(tv.tvFloat, 'getFloat', tv.fDelta));
  t('testChangeObjectInt', changeObject(tv.tvInt, 'getInt'));

  t('testChangeObjectLiteral', () => {
    const sTrue = loadInitialStatement();
    model.remove(sTrue);
    assert.ok(!model.contains(sTrue));
    assert.ok(!model.containsLiteral(r, RDF.value, true));
  });

  t('testChangeObjectLong', changeObject(tv.tvLong, 'getLong'));
  t('testChangeObjectShort', changeObject(tv.tvShort, 'getShort'));

  t('testChangeObjectString', () => {
    const sTrue = loadInitialStatement();
    const changed = sTrue.changeObject(tv.tvString);
    checkChangedStatementSP(changed);
    assert.equal(changed.getString(), tv.tvString);
    checkCorrectStatements(sTrue, changed);
    assert.ok(model.contains(r, RDF.value, tv.tvString));
  });

  t('testChangeObjectStringWithLanguage', () => {
    const lang = 'en';
    const sTrue = loadInitialStatement();
    const changed = sTrue.changeObject(tv.tvString, lang);
    checkChangedStatementSP(changed);
    assert.equal(changed.getString(), tv.tvString);
    assert.equal(changed.getLanguage(), lang);
    checkCorrectStatements(sTrue, changed);
    assert.ok(model.contains(r, RDF.value, tv.tvString, lang));
  });

  t('testChangeObjectYByte', () => {
    const sTrue = loadInitialStatement();
    const changed = sTrue.changeLiteralObject(tv.tvByte);
    checkChangedStatementSP(changed);
    assert.equal(changed.getByte(), tv.tvByte);
    checkCorrectStatements(sTrue, changed);
    assert.ok(model.containsLiteral(r, RDF.value, tv.tvByte));
  });

  const literalStatement = (value, get, delta) => () => {
    const s = model.createLiteralStatement(r, RDF.value, value);
    assertEquals(model.createTypedLiteral(value), s.getObject());
    if (delta === undefined) assert.equal(s[get](), value); else near(value, s[get](), delta);
  };

  t('testChar', literalStatement(tv.tvChar, 'getChar'));
  t('testDouble', literalStatement(tv.tvDouble, 'getDouble', tv.dDelta));
  t('testFloat', literalStatement(tv.tvFloat, 'getFloat', tv.fDelta));

  t('testGetLiteralFailure', () => {
    assertThrows(LiteralRequiredException, () => model.createStatement(r, RDF.value, r).getLiteral(), 'should trap non-literal object');
  });

  t('testGetResource', () => {
    assertEquals(r, model.createStatement(r, RDF.value, r).getResource());
  });

  t('testGetResourceFailure', () => {
    assertThrows(ResourceRequiredException, () => model.createLiteralStatement(r, RDF.value, false).getResource(), 'should trap non-resource object');
  });

  t('testGetTrueBoolean', () => {
    assert.equal(model.createLiteralStatement(r, RDF.value, true).getLiteral().getBoolean(), true);
  });

  t('testInt', literalStatement(tv.tvInt, 'getInt'));
  t('testLong', literalStatement(tv.tvLong, 'getLong'));

  t('testSeq', () => {
    const tvSeq = model.createSeq();
    assertEquals(tvSeq, model.createStatement(r, RDF.value, tvSeq).getSeq());
  });

  t('testShort', literalStatement(tv.tvShort, 'getShort'));

  t('testString', () => {
    assert.equal(model.createStatement(r, RDF.value, tv.tvString).getString(), tv.tvString);
  });

  t('testStringWithLanguage', () => {
    const lang = 'fr';
    assert.equal(model.createStatement(r, RDF.value, tv.tvString, lang).getString(), tv.tvString);
    assert.equal(model.createStatement(r, RDF.value, tv.tvString, lang).getLanguage(), lang);
  });
});
