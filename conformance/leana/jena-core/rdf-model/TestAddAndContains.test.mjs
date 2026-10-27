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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestAddAndContains.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java typed overloads addLiteral(S, P, boolean|byte|char|double|float|int|long|short)
// pass the JS test values of lib/testlib.mjs (tv).

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF, tv, LitTestObj } from '../../lib/testlib.mjs';

describeJena('TestAddAndContains', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestAddAndContains.java', (t0) => {
  let model, S, P;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    S = model.createResource('http://nowhere.man/subject');
    P = model.createProperty('http://nowhere.man/predicate');
    try { return fn(); } finally { model.close(); }
  });
  const addContains = (v) => () => {
    model.addLiteral(S, P, v);
    assert.ok(model.containsLiteral(S, P, v));
  };

  t('testAddContainLiteralByStatement', () => {
    const L = model.createTypedLiteral(210);
    const s = model.createStatement(S, RDF.value, L);
    assert.ok(model.add(s).contains(s));
    assert.ok(model.contains(S, RDF.value));
  });

  t('testAddContainsBoolean', addContains(tv.tvBoolean));
  t('testAddContainsByte', addContains(tv.tvByte));
  t('testAddContainsChar', addContains(tv.tvChar));
  t('testAddContainsDouble', addContains(tv.tvDouble));
  t('testAddContainsFloat', addContains(tv.tvFloat));
  t('testAddContainsInt', addContains(tv.tvInt));

  t('testAddContainsLanguagedString', () => {
    model.add(S, P, 'test string', 'en');
    assert.ok(!model.contains(S, P, 'test string'));
    assert.ok(model.contains(S, P, 'test string', 'en'));
  });

  t('testAddContainsLong', addContains(tv.tvLong));

  t('testAddContainsPlainString', () => {
    model.add(S, P, 'test string');
    assert.ok(model.contains(S, P, 'test string'));
    assert.ok(!model.contains(S, P, 'test string', 'en'));
  });

  t('testAddContainsResource', () => {
    const r = model.createResource();
    model.add(S, P, r);
    assert.ok(model.contains(S, P, r));
  });

  t('testAddContainsShort', addContains(tv.tvShort));

  t('testAddDuplicateLeavesSizeSame', () => {
    const s = model.createStatement(S, RDF.value, 'something');
    model.add(s);
    const size = model.size();
    model.add(s);
    assert.equal(model.size(), size);
  });

  t('testEmpty', () => {
    assert.ok(!model.containsLiteral(S, P, tv.tvBoolean));
    assert.ok(!model.contains(S, P, model.createResource()));
    assert.ok(!model.containsLiteral(S, P, tv.tvByte));
    assert.ok(!model.containsLiteral(S, P, tv.tvShort));
    assert.ok(!model.containsLiteral(S, P, tv.tvInt));
    assert.ok(!model.containsLiteral(S, P, tv.tvLong));
    assert.ok(!model.containsLiteral(S, P, tv.tvChar));
    assert.ok(!model.containsLiteral(S, P, tv.tvFloat));
    assert.ok(!model.containsLiteral(S, P, tv.tvDouble));
    assert.ok(!model.containsLiteral(S, P, new LitTestObj(12345)));
    assert.ok(!model.contains(S, P, 'test string'));
    assert.ok(!model.contains(S, P, 'test string', 'en'));
  });
});
