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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestSimpleListStatements.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// listStatements(s, p, (RDFNode) null) and (String) null are both listStatements(s, p, null) in JS.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, RDF, resource, property, modelAdd, modelWithStatements } from '../../lib/testlib.mjs';

const booleanValue = true;
const charValue = 'c';
const longValue = 456n;
const floatValue = 5.67;
const doubleValue = 6.78;
const stringValue = 'stringValue';
const langValue = 'en';

function setUp() {
  const model = ModelFactory.createDefaultModel();
  model.createResource('http://example.org/boolean').addLiteral(RDF.value, booleanValue);
  model.createResource('http://example.org/char').addLiteral(RDF.value, charValue);
  model.createResource('http://example.org/long').addLiteral(RDF.value, longValue);
  model.createResource('http://example.org/float').addLiteral(RDF.value, floatValue);
  model.createResource('http://example.org/double').addLiteral(RDF.value, doubleValue);
  model.createResource('http://example.org/string').addProperty(RDF.value, stringValue);
  model.createResource('http://example.org/langString').addProperty(RDF.value, stringValue, langValue);
  return model;
}

function modelWithStatementsIt(it) {
  const m = ModelFactory.createDefaultModel();
  while (it.hasNext()) m.add(it.nextStatement());
  return m;
}
function checkReturns(things, it) {
  const wanted = modelWithStatements(things);
  const got = modelWithStatementsIt(it);
  if (wanted.isIsomorphicWith(got) === false) assert.fail(`wanted ${wanted} got ${got}`);
}

describeJena('TestSimpleListStatements', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestSimpleListStatements.java', (t) => {
  const count = (iter) => { let i = 0; while (iter.hasNext()) { i++; iter.next(); } return i; };

  t('testAll', () => { const model = setUp(); assert.equal(count(model.listStatements(null, null, null)), 7); });
  t('testAllString', () => { const model = setUp(); assert.equal(count(model.listStatements(null, null, null)), 7); });

  const literalCase = (v, uri) => () => {
    const model = setUp();
    const got = model.listLiteralStatements(null, null, v).toList();
    assert.equal(got.length, 1);
    const it = got[0];
    assertEquals(resource(uri), it.getSubject());
    assertEquals(model.createTypedLiteral(v), it.getObject());
  };
  t('testBoolean', literalCase(booleanValue, 'http://example.org/boolean'));
  t('testChar', literalCase(charValue, 'http://example.org/char'));
  t('testDouble', literalCase(doubleValue, 'http://example.org/double'));
  t('testFloat', literalCase(floatValue, 'http://example.org/float'));

  t('testLangString', () => {
    const model = setUp();
    const iter = model.listStatements(null, null, stringValue, langValue);
    let i = 0;
    while (iter.hasNext()) { i++; assert.equal(iter.nextStatement().getSubject().getURI(), 'http://example.org/langString'); }
    assert.equal(i, 1);
  });

  t('testListStatementsSPO', () => {
    const model = setUp();
    const A = resource(model, 'A'), X = resource(model, 'X');
    const P = property(model, 'P'), P1 = property(model, 'P1');
    const O = resource(model, 'O'), Y = resource(model, 'Y');
    const S1 = 'S P O; S1 P O; S2 P O';
    const S2 = 'A P1 B; A P1 B; A P1 C';
    const S3 = 'X P1 Y; X P2 Y; X P3 Y';
    modelAdd(model, S1);
    modelAdd(model, S2);
    modelAdd(model, S3);
    checkReturns(S1, model.listStatements(null, P, O));
    checkReturns(S2, model.listStatements(A, P1, null));
    checkReturns(S3, model.listStatements(X, null, Y));
  });

  t('testLong', literalCase(longValue, 'http://example.org/long'));

  t('testString', () => {
    const model = setUp();
    const iter = model.listStatements(null, null, stringValue);
    let i = 0;
    while (iter.hasNext()) { i++; assert.equal(iter.nextStatement().getSubject().getURI(), 'http://example.org/string'); }
    assert.equal(i, 1);
  });
});
