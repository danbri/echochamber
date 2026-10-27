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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModelFactory.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// GenericRuleReasoner, Rule.parseRules, InfGraph and the Union graph are not in
// leana: those tests call the ModelFactory method directly.

import assert from 'node:assert/strict';
import { ModelFactory, GenericRuleReasoner, Rule, InfModel } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

describeJena('TestModelFactory', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModelFactory.java', (t) => {
  t('testAssembleModelFromModel', () => {});
  t('testAssmbleModelFromRoot', () => {});

  t('testCreateDefaultModel', () => {
    ModelFactory.createDefaultModel().close();
  });

  t('testCreateInfModel', () => {
    // Jena: new GenericRuleReasoner(Rule.parseRules("-> (eg:r eg:p eg:v).")).bind(graph) -> InfGraph.
    const rule = '-> (eg:r eg:p eg:v).';
    const r = new GenericRuleReasoner(Rule.parseRules(rule));
    const ig = r.bind(ModelFactory.createDefaultModel().getGraph());
    const im = ModelFactory.createInfModel(ig);
    assert.ok(im instanceof InfModel);
    assert.equal(im.size(), 1);
  });

  t('testCreateUnion', () => {
    const m1 = ModelFactory.createDefaultModel();
    const m2 = ModelFactory.createDefaultModel();
    const m = ModelFactory.createUnion(m1, m2);
    assert.ok(m1.getGraph() === m.getGraph().getL());
    assert.ok(m2.getGraph() === m.getGraph().getR());
  });
});
