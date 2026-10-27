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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModelBulkUpdate.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java Statement[] and List<Statement> are both JS arrays here.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { modelWithStatements, statements, assertIsoModels } from '../../lib/testlib.mjs';

describeJena('TestModelBulkUpdate', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModelBulkUpdate.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); }
  });
  const testContains = (m, sts) => { for (const st of sts) assert.ok(m.contains(st), 'it should be here'); };
  const testOmits = (m, sts) => { for (const st of sts) assert.ok(!m.contains(st), 'it should not be here'); };

  t('testBulkByModel', () => {
    assert.equal(model.size(), 0, 'precondition: model must be empty');
    const A = modelWithStatements('clouds offer rain; trees offer shelter');
    const B = modelWithStatements('x R y; y Q z; z P x');
    model.add(A);
    assertIsoModels(A, model);
    model.add(B);
    model.remove(A);
    assertIsoModels(B, model);
    model.remove(B);
    assert.equal(model.size(), 0, '');
  });

  t('testBulkRemoveSelf', () => {
    const m = modelWithStatements('they sing together; he sings alone');
    m.remove(m);
    assert.equal(m.size(), 0, '');
  });

  t('testMBU', () => {
    const sArray = statements(model, 'moon orbits earth; earth orbits sun');
    const sList = statements(model, 'I drink tea; you drink coffee');
    model.add(sArray);
    testContains(model, sArray);
    model.add(sList);
    testContains(model, sList);
    testContains(model, sArray);
    model.remove(sArray);
    testOmits(model, sArray);
    testContains(model, sList);
    model.remove(sList);
    testOmits(model, sArray);
    testOmits(model, sList);
  });
});
