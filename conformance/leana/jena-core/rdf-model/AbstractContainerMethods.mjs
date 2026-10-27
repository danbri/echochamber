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
//   jena-core/src/test/java/org/apache/jena/rdf/model/AbstractContainerMethods.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Not a test file: TestBagMethods, TestAltMethods and
// TestSeqMethods call containerMethods(t, ctx) to port the inherited methods.
// RDF.type is test data (lib/testlib.mjs); the Java typed test values are tv.
// A Java boolean[] is a JS array of booleans.

import assert from 'node:assert/strict';
import { RDF, tv, assertEquals } from '../../lib/testlib.mjs';

/**
 * The @Test methods of AbstractContainerMethods. ctx.model() is the model of the
 * running method (Jena's setUp), ctx.createContainer() and ctx.getContainerType()
 * the subclass's.
 */
export function containerMethods(t, ctx) {
  t('testContainerOfIntegers', () => {
    const num = 10;
    const c = ctx.createContainer();
    for (let i = 0; i < num; i += 1) c.add(i);
    assert.equal(c.size(), num);
    const it = c.iterator();
    for (let i = 0; i < num; i += 1) assert.equal(it.nextNode().getInt(), i);
    assert.ok(!it.hasNext());
  });

  const testContainerOfIntegersWithRemoving = (retain) => {
    const num = retain.length;
    const found = new Array(num).fill(false);
    const c = ctx.createContainer();
    for (let i = 0; i < num; i += 1) c.add(i);
    const it = c.iterator();
    for (const aRetain of retain) {
      it.nextNode();
      if (aRetain === false) it.remove();
    }
    const s = c.iterator();
    while (s.hasNext()) {
      const v = s.nextNode().getInt();
      assert.ok(!found[v]);
      found[v] = true;
    }
    for (let i = 0; i < num; i += 1) assert.equal(found[i], retain[i], 'element ' + i);
  };
  t('testContainerOfIntegersRemovingA', () => testContainerOfIntegersWithRemoving([true, true, true, false, false, false, false, false, true, true]));
  t('testContainerOfIntegersRemovingB', () => testContainerOfIntegersWithRemoving([false, true, true, false, false, false, false, false, true, false]));
  t('testContainerOfIntegersRemovingC', () => testContainerOfIntegersWithRemoving([false, false, false, false, false, false, false, false, false, false]));

  t('testEmptyContainer', () => {
    const c = ctx.createContainer();
    assert.ok(ctx.model().contains(c, RDF.type, ctx.getContainerType()));
    assert.equal(c.size(), 0);
    assert.ok(!c.contains(tv.tvBoolean));
    assert.ok(!c.contains(tv.tvByte));
    assert.ok(!c.contains(tv.tvShort));
    assert.ok(!c.contains(tv.tvInt));
    assert.ok(!c.contains(tv.tvLong));
    assert.ok(!c.contains(tv.tvChar));
    assert.ok(!c.contains(tv.tvFloat));
    assert.ok(!c.contains(tv.tvString));
  });

  t('testFillingContainer', () => {
    const c = ctx.createContainer();
    const lang = 'fr';
    const tvLiteral = ctx.model().createLiteral('test 12 string 2');
    c.add(tv.tvBoolean);
    assert.ok(c.contains(tv.tvBoolean));
    c.add(tv.tvByte);
    assert.ok(c.contains(tv.tvByte));
    c.add(tv.tvShort);
    assert.ok(c.contains(tv.tvShort));
    c.add(tv.tvInt);
    assert.ok(c.contains(tv.tvInt));
    c.add(tv.tvLong);
    assert.ok(c.contains(tv.tvLong));
    c.add(tv.tvChar);
    assert.ok(c.contains(tv.tvChar));
    c.add(tv.tvFloat);
    assert.ok(c.contains(tv.tvFloat));
    c.add(tv.tvString);
    assert.ok(c.contains(tv.tvString));
    c.add(tv.tvString, lang);
    assert.ok(c.contains(tv.tvString, lang));
    c.add(tvLiteral);
    assert.ok(c.contains(tvLiteral));
    c.add(tv.tvLitObj);
    assert.ok(c.contains(tv.tvLitObj));
    assertEquals(11, c.size());
  });
}
