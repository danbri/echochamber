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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestLiteralsInModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java addLiteral overloads (true, 'x' char, 14.0d, 14.0f, 99 int, 99L long)
// pass JS values (99L is the BigInt 99n); leana must refuse to choose a datatype.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { resource, property } from '../../lib/testlib.mjs';

describeJena('TestLiteralsInModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestLiteralsInModel.java', (t0) => {
  let model, X, P;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    X = resource('X');
    P = property('P');
    try { return fn(); } finally { model.close(); }
  });
  const addWith = (v) => () => {
    model.addLiteral(X, P, v);
    assert.ok(model.contains(X, P, model.createTypedLiteral(v)));
    assert.ok(model.containsLiteral(X, P, v));
  };

  t('testAddWithBooleanObject', addWith(true));
  t('testAddWithCharObject', addWith('x'));
  t('testAddWithDoubleObject', addWith(14.0));
  t('testAddWithFloatObject', addWith(14.0));
  t('testAddWithIntObject', addWith(99));

  t('testAddWithLiteralObject', () => {
    const lit = model.createLiteral('spoo');
    model.addLiteral(X, P, lit);
    assert.ok(model.contains(X, P, lit));
    assert.ok(model.containsLiteral(X, P, lit));
  });

  t('testAddWithLongObject', addWith(99n));
});
