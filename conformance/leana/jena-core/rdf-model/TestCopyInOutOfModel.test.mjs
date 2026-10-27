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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestCopyInOutOfModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

describeJena('TestCopyInOutOfModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestCopyInOutOfModel.java', (t) => {
  t('testCopyStatement', () => {
    const model = ModelFactory.createDefaultModel();
    const S = ResourceFactory.createResource();
    const P = ResourceFactory.createProperty('http://example.com/property');
    const O = ResourceFactory.createResource();
    const model2 = ModelFactory.createDefaultModel();
    const stmt = model.createStatement(S, P, O);
    assert.equal(stmt.getModel(), model);
    assert.equal(model.size(), 0);
    assert.equal(stmt.getSubject().getModel(), model);
    assert.equal(stmt.getPredicate().getModel(), model);
    assert.equal(stmt.getObject().getModel(), model);
    model.add(stmt);
    assert.equal(model.size(), 1);
    assert.equal(stmt.getSubject().getModel(), model);
    assert.equal(stmt.getPredicate().getModel(), model);
    assert.equal(stmt.getObject().getModel(), model);
    model2.add(stmt);
    assert.equal(model.size(), 1);
    assert.equal(stmt.getSubject().getModel(), model);
    assert.equal(stmt.getPredicate().getModel(), model);
    assert.equal(stmt.getObject().getModel(), model);
    assert.equal(model2.size(), 1);
    const stmt2 = model2.listStatements().next();
    assert.equal(stmt2.getSubject().getModel(), model2);
    assert.equal(stmt2.getPredicate().getModel(), model2);
    assert.equal(stmt2.getObject().getModel(), model2);
  });
});
