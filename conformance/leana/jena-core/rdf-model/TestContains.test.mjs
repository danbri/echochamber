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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestContains.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// The anonymous ModelCom subclass is a JS subclass of leana's Model; its
// contains(s, p, o) override records only the three-argument form.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory, GraphMemFactory, Model } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { modelWithStatements, rdfNode, resource, property } from '../../lib/testlib.mjs';

const prop = (uri) => ResourceFactory.createProperty('eh:/' + uri);
const res = (uri) => ResourceFactory.createResource('eh:/' + uri);

describeJena('TestContains', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestContains.java', (t0) => {
  const t = (name, fn) => t0(name, () => {
    const model = ModelFactory.createDefaultModel();
    try { return fn(model); } finally { model.close(); }
  });

  const checkContains = (yes, facts, resourceName) => {
    const m = modelWithStatements(facts);
    const r = rdfNode(m, resourceName);
    if (modelWithStatements(facts).containsResource(r) !== yes) {
      assert.fail(`[${facts}] should${yes ? '' : ' not'} contain ${resourceName}`);
    }
  };

  t('testContains', () => {
    checkContains(false, '', 'x');
    checkContains(false, 'a R b', 'x');
    checkContains(false, 'a R b; c P d', 'x');
    checkContains(false, 'a R b', 'z');
    checkContains(true, 'x R y', 'x');
    checkContains(true, 'a P b', 'P');
    checkContains(true, 'i  Q  j', 'j');
    checkContains(true, 'x R y; a P b; i Q j', 'y');
    checkContains(true, 'x R y; a P b; i Q j', 'y');
    checkContains(true, 'x R y; a P b; i Q j', 'R');
    checkContains(true, 'x R y; a P b; i Q j', 'a');
  });

  const checkCWN = (yes, facts, S, P, O) => assert.equal(modelWithStatements(facts).contains(S, P, O), yes);

  t('testContainsWithNull', () => {
    checkCWN(false, '', null, null, null);
    checkCWN(true, 'x R y', null, null, null);
    checkCWN(false, 'x R y', null, null, res('z'));
    checkCWN(true, 'x RR y', res('x'), prop('RR'), null);
    checkCWN(true, 'a BB c', null, prop('BB'), res('c'));
    checkCWN(false, 'a BB c', null, prop('ZZ'), res('c'));
  });

  t('testModelComContainsSPcallsContainsSPO', () => {
    const g = GraphMemFactory.createDefaultGraph();
    const wasCalled = [false];
    const m = new (class extends Model {
      contains(s, p, o, lang) {
        if (arguments.length === 3) wasCalled[0] = true;
        return super.contains(...arguments);
      }
    })(g);
    assert.ok(!m.contains(resource('r'), property('p')));
    assert.ok(wasCalled[0], 'contains(S,P) should call contains(S,P,O)');
  });
});
