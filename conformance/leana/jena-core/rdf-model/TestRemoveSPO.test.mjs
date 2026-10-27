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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestRemoveSPO.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// The anonymous WrappedGraph subclass is a JS subclass of leana's WrappedGraph;
// JenaTestLib.listOfOne(x) is [x], compared element-wise with equals().

import assert from 'node:assert/strict';
import { ModelFactory, WrappedGraph } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { resource, property, rdfNode, createTriple } from '../../lib/testlib.mjs';

describeJena('TestRemoveSPO', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestRemoveSPO.java', (t0) => {
  const t = (name, fn) => t0(name, () => {
    const model = ModelFactory.createDefaultModel();
    try { return fn(model); } finally { model.close(); }
  });

  t('testRemoveSPOCallsGraphDeleteTriple', (model0) => {
    const deleted = [];
    const base = new (class extends WrappedGraph {
      delete(tr) { deleted.push(tr); }
    })(model0.getGraph());
    const model = ModelFactory.createModelForGraph(base);
    model.remove(resource('R'), property('P'), rdfNode(model, '17'));
    const expected = [createTriple('R P 17')];
    assert.equal(deleted.length, expected.length);
    expected.forEach((x, i) => assert.ok(x.equals(deleted[i]), `${x} != ${deleted[i]}`));
  });

  t('testRemoveSPOReturnsModel', (model) => {
    assert.ok(model === model.remove(resource('R'), property('P'), rdfNode(model, '17')));
  });
});
