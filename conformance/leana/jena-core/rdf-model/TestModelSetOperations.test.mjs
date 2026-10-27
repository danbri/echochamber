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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModelSetOperations.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { modelAdd } from '../../lib/testlib.mjs';

describeJena('TestModelSetOperations', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModelSetOperations.java', (t0) => {
  let model, model2;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    model2 = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); model2.close(); }
  });

  t('testDifference', () => {
    modelAdd(model, 'a P b; w R x');
    modelAdd(model2, 'w R x; y S z');
    const dm = model.difference(model2);
    for (const it = dm.listStatements(); it.hasNext();) {
      const s = it.nextStatement();
      assert.ok(model.contains(s) && !model2.contains(s));
    }
    for (const it = model.union(model2).listStatements(); it.hasNext();) {
      const s = it.nextStatement();
      assert.equal(dm.contains(s), model.contains(s) && !model2.contains(s));
    }
    assert.ok(dm.containsAny(model));
    assert.ok(dm.containsAny(model.listStatements()));
    assert.ok(!dm.containsAny(model2));
    assert.ok(!dm.containsAny(model2.listStatements()));
    assert.ok(model.containsAll(dm));
  });

  t('testIntersection', () => {
    modelAdd(model, 'a P b; w R x');
    modelAdd(model2, 'w R x; y S z');
    const im = model.intersection(model2);
    assert.ok(!model.containsAll(model2));
    assert.ok(!model2.containsAll(model));
    assert.ok(model.containsAll(im));
    assert.ok(model2.containsAll(im));
    for (const it = im.listStatements(); it.hasNext();) {
      const s = it.nextStatement();
      assert.ok(model.contains(s) && model2.contains(s));
    }
    for (const it = im.listStatements(); it.hasNext();) assert.ok(model.contains(it.nextStatement()));
    for (const it = im.listStatements(); it.hasNext();) assert.ok(model2.contains(it.nextStatement()));
    assert.ok(model.containsAll(im.listStatements()));
    assert.ok(model2.containsAll(im.listStatements()));
  });

  t('testUnion', () => {
    modelAdd(model, 'a P b; w R x');
    modelAdd(model2, 'w R x; y S z');
    const um = model.union(model2);
    assert.ok(!model.containsAll(model2));
    assert.ok(!model2.containsAll(model));
    assert.ok(um.containsAll(model));
    assert.ok(um.containsAll(model2));
    for (const it = um.listStatements(); it.hasNext();) {
      const s = it.nextStatement();
      assert.ok(model.contains(s) || model2.contains(s));
    }
    for (const it = model.listStatements(); it.hasNext();) assert.ok(um.contains(it.nextStatement()));
    for (const it = model2.listStatements(); it.hasNext();) assert.ok(um.contains(it.nextStatement()));
    assert.ok(um.containsAll(model.listStatements()));
    assert.ok(um.containsAll(model2.listStatements()));
  });
});
