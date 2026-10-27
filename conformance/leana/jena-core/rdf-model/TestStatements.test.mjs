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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestStatements.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// assertInstanceOf(FrontsTriple.class, s) is: s has asTriple() (the JS form of
// the FrontsTriple interface).

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, statement, resource, property, RDF } from '../../lib/testlib.mjs';

const createModel = () => ModelFactory.createDefaultModel();

describeJena('TestStatements', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestStatements.java', (t0) => {
  const t = (name, fn) => t0(name, () => {
    const model = createModel();
    try { return fn(model); } finally { model.close(); }
  });

  t('testOtherStuff', () => {
    const A = createModel();
    const B = createModel();
    const S = A.createResource('jena:S');
    const R = A.createResource('jena:R');
    const P = A.createProperty('jena:P');
    const O = A.createResource('jena:O');
    A.add(S, P, O);
    B.add(S, P, O);
    assert.ok(A.isIsomorphicWith(B), 'X1');
    A.add(R, RDF.subject, S);
    B.add(R, RDF.predicate, P);
    assert.ok(!A.isIsomorphicWith(B), 'X2');
    A.add(R, RDF.predicate, P);
    B.add(R, RDF.subject, S);
    assert.ok(A.isIsomorphicWith(B), 'X3');
    A.add(R, RDF.object, O);
    B.add(R, RDF.type, RDF.Statement);
    assert.ok(!A.isIsomorphicWith(B), 'X4');
    A.add(R, RDF.type, RDF.Statement);
    B.add(R, RDF.object, O);
    assert.ok(A.isIsomorphicWith(B), 'X5');
  });

  t('testPortingBlankNodes', (model) => {
    const B = createModel();
    const anon = model.createResource();
    const bAnon = anon.inModel(B);
    assert.ok(bAnon.isAnon(), 'moved resource should still be blank');
    assertEquals(anon, bAnon, 'move resource should equal original');
  });

  t('testSet', () => {
    const A = createModel();
    createModel();
    const S = A.createResource('jena:S');
    A.createResource('jena:R');
    const P = A.createProperty('jena:P');
    const O = A.createResource('jena:O');
    const spo = A.createStatement(S, P, O);
    A.add(spo);
    const sps = A.createStatement(S, P, S);
    assertEquals(sps, spo.changeObject(S));
    assert.ok(!A.contains(spo));
    assert.ok(A.contains(sps));
  });

  t('testStatementPrintsType', (model) => {
    const fakeURI = 'fake:URI';
    const S = model.createResource();
    const P = property(model, 'PP');
    const O = model.createTypedLiteral('42', fakeURI);
    const st = model.createStatement(S, P, O);
    assert.ok(st.toString().indexOf(fakeURI) > 0);
  });

  t('testStatmentMap1Selectors', () => {
    const stmt = statement('sub pred obj');
    assertEquals(resource('sub'), stmt.getSubject());
    assertEquals(resource('pred'), stmt.getPredicate());
    assertEquals(resource('obj'), stmt.getObject());
  });

  t('testStuff', () => {
    const red = createModel();
    const blue = createModel();
    const r = red.createResource();
    const p = red.createProperty('');
    const s = blue.createStatement(r, p, r);
    assertEquals(r, s.getSubject(), 'subject preserved');
    assertEquals(r, s.getObject(), 'object preserved');
  });

  t('testTripleWrapper', (model) => {
    assert.equal(typeof statement(model, 's p o').asTriple, 'function');
  });
});
