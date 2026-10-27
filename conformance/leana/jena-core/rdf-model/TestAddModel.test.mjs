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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestAddModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { modelAdd, RDF } from '../../lib/testlib.mjs';

describeJena('TestAddModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestAddModel.java', (t0) => {
  let model, model2;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    model2 = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); model2.close(); }
  });
  const assertContainsAll = (m, m2) => {
    for (const s = m2.listStatements(); s.hasNext();) assert.ok(m.contains(s.nextStatement()));
  };
  const assertSameStatements = (m, m2) => { assertContainsAll(m, m2); assertContainsAll(m2, m); };

  t('testAddByIterator', () => {
    modelAdd(model, 'a P b; c P d; x Q 1; y Q 2');
    model2.add(model.listStatements());
    assert.equal(model2.size(), model.size());
    assertSameStatements(model, model2);
    model.add(model.createResource(), RDF.value, model.createResource());
    model.add(model.createResource(), RDF.value, model.createResource());
    model.add(model.createResource(), RDF.value, model.createResource());
    const s = model.listStatements();
    model2.remove(s.nextStatement()).remove(s);
    assert.equal(model2.size(), 0);
  });

  t('testAddByModel', () => {
    modelAdd(model, 'a P b; c P d; x Q 1; y Q 2');
    model2.add(model);
    assert.equal(model2.size(), model.size());
    assertSameStatements(model, model2);
  });

  t('testRemoveByModel', () => {
    modelAdd(model, 'a P b; c P d; x Q 1; y Q 2');
    model2.add(model).remove(model);
    assert.equal(model2.size(), 0);
    assert.ok(!model2.listStatements().hasNext());
  });
});
