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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestAltMethods.java
//   jena-core/src/test/java/org/apache/jena/rdf/model/AbstractContainerMethods.java (inherited methods)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); the inherited methods come from
// AbstractContainerMethods.mjs; RDF.Alt is test data and the Java typed test
// values are tv (lib/testlib.mjs). Java's assertEquals(expected, actual, delta)
// is a tolerance check.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF, tv, assertEquals } from '../../lib/testlib.mjs';
import { containerMethods } from './AbstractContainerMethods.mjs';

const near = (expected, actual, delta) => assert.ok(Math.abs(expected - actual) <= delta, `${actual} not within ${delta} of ${expected}`);

describeJena('TestAltMethods', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestAltMethods.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); }
  });
  containerMethods(t, {
    model: () => model,
    createContainer: () => model.createAlt(),
    getContainerType: () => RDF.Alt,
  });

  t('testDefaults', () => {
    const a = model.createAlt();
    const tvLiteral = model.createLiteral('test 12 string 2');
    const tvBag = model.createBag();
    const tvAlt = model.createAlt();
    const tvSeq = model.createSeq();
    const tvResource = model.createResource();
    assertEquals(tvLiteral, a.setDefault(tvLiteral).getDefault());
    assertEquals(tvLiteral, a.getDefaultLiteral());
    assertEquals(tvResource, a.setDefault(tvResource).getDefaultResource());
    assertEquals(tv.tvByte, a.setDefault(tv.tvByte).getDefaultByte());
    assertEquals(tv.tvShort, a.setDefault(tv.tvShort).getDefaultShort());
    assertEquals(tv.tvInt, a.setDefault(tv.tvInt).getDefaultInt());
    assertEquals(tv.tvLong, a.setDefault(tv.tvLong).getDefaultLong());
    near(tv.tvFloat, a.setDefault(tv.tvFloat).getDefaultFloat(), tv.fDelta);
    near(tv.tvDouble, a.setDefault(tv.tvDouble).getDefaultDouble(), tv.dDelta);
    assertEquals(tv.tvChar, a.setDefault(tv.tvChar).getDefaultChar());
    assertEquals(tv.tvString, a.setDefault(tv.tvString).getDefaultString());
    assertEquals(tvAlt, a.setDefault(tvAlt).getDefaultAlt());
    assertEquals(tvBag, a.setDefault(tvBag).getDefaultBag());
    assertEquals(tvSeq, a.setDefault(tvSeq).getDefaultSeq());
  });
});
