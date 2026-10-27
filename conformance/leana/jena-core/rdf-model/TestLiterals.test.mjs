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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestLiterals.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Java byte/short/int/long/float/double/char values cannot be told apart in JS; long is a BigInt. Byte.MIN_VALUE etc. are numeric constants. assertEquals(double, double, delta) is a delta check.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertDiffer, tv } from '../../lib/testlib.mjs';

const Byte = { MIN_VALUE: -128, MAX_VALUE: 127 };
const Short = { MIN_VALUE: -32768, MAX_VALUE: 32767 };
const Integer = { MIN_VALUE: -2147483648, MAX_VALUE: 2147483647 };
const Long = { MIN_VALUE: -(2n ** 63n), MAX_VALUE: 2n ** 63n - 1n };
const Double = { MIN_VALUE: Number.MIN_VALUE, MAX_VALUE: Number.MAX_VALUE };
const Float = { MIN_VALUE: 1.4e-45, MAX_VALUE: 3.4028235e38 };

function assertInRange(min, x, max) { if (!(min <= x && x <= max)) assert.fail(`outside range: ${x} min: ${min} max: ${max}`); }
function assertOutsideRange(min, x, max) { if (min <= x && x <= max) assert.fail(`inside range: ${x} min: ${min} max: ${max}`); }
function assertClose(expected, actual, delta) { assert.ok(Math.abs(expected - actual) <= delta, `expected ${expected} got ${actual}`); }
// Java IllegalArgumentException from a narrowing accessor.
const isIllegalArgument = (e) => e instanceof RangeError;
function tryNarrow(fn, tvv, min, max) {
  try { assert.equal(fn(), tvv); assertInRange(min, tvv, max); } catch (e) {
    if (!isIllegalArgument(e)) throw e;
    assertOutsideRange(min, tvv, max);
  }
}

describeJena('TestLiterals', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestLiterals.java', (t) => {
  const setUp = () => ModelFactory.createDefaultModel();

  t('testBooleans', () => {
    const model = setUp();
    assert.ok(model.createTypedLiteral(true).getBoolean());
    assert.ok(!model.createTypedLiteral(false).getBoolean());
  });

  const testByte = (model, v) => {
    const l = model.createTypedLiteral(v);
    assert.equal(l.getByte(), v); assert.equal(l.getShort(), v); assert.equal(l.getInt(), v); assert.equal(l.getLong(), v);
  };
  t('testByteLiterals', () => {
    const model = setUp();
    for (const v of [0, -1, Byte.MIN_VALUE, Byte.MAX_VALUE]) testByte(model, v);
  });

  t('testCharacterLiterals', () => {
    const model = setUp();
    for (const c of ['A', 'a', '#', '@', '0', '9', 'ሴ', '噸']) assert.equal(model.createTypedLiteral(c).getChar(), c);
  });

  t('testDoubleLiterals', () => {
    const model = setUp();
    for (const v of [0.0, 1.0, -1.0, 12345.678901, Double.MIN_VALUE, Double.MAX_VALUE]) assertClose(v, model.createTypedLiteral(v).getDouble(), tv.dDelta);
  });

  t('testFloatLiterals', () => {
    const model = setUp();
    for (const v of [0.0, 1.0, -1.0, 12345.6789, Float.MIN_VALUE, Float.MAX_VALUE]) assertClose(v, model.createTypedLiteral(v).getFloat(), tv.fDelta);
  });

  const testInt = (model, v) => {
    const l = model.createTypedLiteral(v);
    tryNarrow(() => l.getByte(), v, Byte.MIN_VALUE, Byte.MAX_VALUE);
    tryNarrow(() => l.getShort(), v, Short.MIN_VALUE, Short.MAX_VALUE);
    assert.equal(l.getInt(), v);
    assert.equal(l.getLong(), v);
  };
  t('testIntLiterals', () => {
    const model = setUp();
    for (const v of [0, -1, Integer.MIN_VALUE, Integer.MAX_VALUE]) testInt(model, v);
  });

  const testLanguagedString = (model, s, lang) => {
    const l = model.createLiteral(s, lang);
    assert.equal(l.getString(), s);
    assert.equal(l.getLexicalForm(), s);
    assert.equal(l.getLanguage(), lang);
  };
  t('testLanguagedStringLiterals', () => {
    const model = setUp();
    testLanguagedString(model, '', 'en');
    testLanguagedString(model, 'chat', 'fr');
  });

  const testLong = (model, v) => {
    const l = model.createTypedLiteral(v);
    tryNarrow(() => l.getByte(), v, Byte.MIN_VALUE, Byte.MAX_VALUE);
    tryNarrow(() => l.getShort(), v, Short.MIN_VALUE, Short.MAX_VALUE);
    tryNarrow(() => l.getInt(), v, Integer.MIN_VALUE, Integer.MAX_VALUE);
    assert.equal(l.getLong(), v);
  };
  t('testLongLiterals', () => {
    const model = setUp();
    for (const v of [0n, -1n, Long.MIN_VALUE, Long.MAX_VALUE]) testLong(model, v);
  });

  const testPlainString = (model, s) => {
    const l = model.createLiteral(s);
    assert.equal(l.getString(), s);
    assert.equal(l.getLexicalForm(), s);
    assert.equal(l.getLanguage(), '');
  };
  t('testPlainStringLiterals', () => {
    const model = setUp();
    testPlainString(model, '');
    testPlainString(model, 'A test string');
    testPlainString(model, 'Another test string');
  });

  const testShort = (model, v) => {
    const l = model.createTypedLiteral(v);
    tryNarrow(() => l.getByte(), v, Byte.MIN_VALUE, Byte.MAX_VALUE);
    assert.equal(l.getShort(), v); assert.equal(l.getInt(), v); assert.equal(l.getLong(), v);
  };
  t('testShortLiterals', () => {
    const model = setUp();
    for (const v of [0, -1, Short.MIN_VALUE, Short.MAX_VALUE]) testShort(model, v);
  });

  t('testStringLiteralEquality', () => {
    const model = setUp();
    assertEquals(model.createLiteral('A'), model.createLiteral('A'));
    assertEquals(model.createLiteral('Alpha'), model.createLiteral('Alpha'));
    assertDiffer(model.createLiteral('Alpha'), model.createLiteral('Beta'));
    assertDiffer(model.createLiteral('A', 'en'), model.createLiteral('A'));
    assertDiffer(model.createLiteral('A'), model.createLiteral('A', 'en'));
    assertDiffer(model.createLiteral('A', 'en'), model.createLiteral('A', 'fr'));
    assertEquals(model.createLiteral('A', 'en'), model.createLiteral('A', 'en'));
  });
});
