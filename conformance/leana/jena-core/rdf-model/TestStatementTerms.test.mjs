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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementTerms.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, property, RDF } from '../../lib/testlib.mjs';

describeJena('TestStatementTerms', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementTerms.java', (t0) => {
  const t = (name, fn) => t0(name, () => {
    const model = ModelFactory.createDefaultModel();
    try { return fn(model); } finally { model.close(); }
  });

  t('testStatementTerms', (model) => {
    const fakeURI = 'fake:URI';
    const S = model.createResource();
    const P = property(model, 'PP');
    const O = model.createTypedLiteral('42', fakeURI);
    const stmt = model.createStatement(S, P, O);
    assert.ok(model.isEmpty());
    const stmtTerm = model.createStatementTerm(stmt);
    assert.ok(model.isEmpty());
    assertEquals(S, stmtTerm.getStatement().getSubject());
    assertEquals(P, stmtTerm.getStatement().getPredicate());
    assertEquals(O, stmtTerm.getStatement().getObject());
  });

  t('testStatementReifierAnon', (model) => {
    const fakeURI = 'fake:URI';
    const S = model.createResource();
    const P = property(model, 'PP');
    const O = model.createTypedLiteral('42', fakeURI);
    const stmt = model.createStatement(S, P, O);
    model.createReifier(stmt);
    assert.ok(!model.isEmpty());
    assert.equal(model.size(), 1);
    const s = model.listStatements().next();
    assert.ok(s.getSubject().isAnon());
    assert.ok(s.getPredicate().equals(RDF.reifies));
    assert.ok(s.getObject().isStatementTerm());
    const st = s.getObject().asStatementTerm();
    assert.ok(st != null);
    assertEquals(st.getStatement(), stmt);
  });

  t('testStatementReifierResource', (model) => {
    const fakeURI = 'fake:URI';
    const reifURI = 'reifier:URI';
    const reifier = model.createResource(reifURI);
    const S = model.createResource();
    const P = property(model, 'PP');
    const O = model.createTypedLiteral('42', fakeURI);
    const stmt = model.createStatement(S, P, O);
    const r = model.createReifier(reifier, stmt);
    assert.equal(r.getURI(), reifURI);
    assert.ok(!model.isEmpty());
    assert.equal(model.size(), 1);
    const st = r.getProperty(RDF.reifies).getObject().asStatementTerm();
    assert.ok(st != null);
    assertEquals(st.getStatement(), stmt);
  });
});
