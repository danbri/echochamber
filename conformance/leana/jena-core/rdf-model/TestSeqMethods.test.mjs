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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestSeqMethods.java
//   jena-core/src/test/java/org/apache/jena/rdf/model/AbstractContainerMethods.java (inherited methods)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); the inherited methods come from
// AbstractContainerMethods.mjs; RDF.Seq is test data and the Java typed test
// values are tv (lib/testlib.mjs): Java casts such as (byte)1, (short)2, 123.456f
// and 'x' are the JS number or one-character string. Java's
// assertEquals(expected, actual, delta) is a tolerance check; a Java List is an
// array (ExtendedIterator.toList()).

import assert from 'node:assert/strict';
import { ModelFactory, SeqIndexBoundsException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF, tv, assertEquals, LitTestObj } from '../../lib/testlib.mjs';
import { containerMethods } from './AbstractContainerMethods.mjs';

const near = (expected, actual, delta) => assert.ok(Math.abs(expected - actual) <= delta, `${actual} not within ${delta} of ${expected}`);
const lang = 'fr';
const num = 10;
const bools = (s) => [...s].map((c) => c === 't');
const error = (test, n) => assert.fail(test + ' -- ' + n);
/** try { fn(); fail } catch (SeqIndexBoundsException) { pass } */
function expectBounds(fn, onMissing) {
  try {
    fn();
  } catch (e) {
    if (e instanceof SeqIndexBoundsException) return;
    throw e;
  }
  onMissing();
}

describeJena('TestSeqMethods', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestSeqMethods.java', (t0) => {
  let model, aLitTestObj, tvLiteral, tvResource, anObject, tvBag, tvAlt, tvSeq;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    try {
      // setUp
      aLitTestObj = new LitTestObj(12345);
      tvLiteral = model.createLiteral('test 12 string 2');
      tvResource = model.createResource();
      anObject = new LitTestObj(1234);
      tvBag = model.createBag();
      tvAlt = model.createAlt();
      tvSeq = model.createSeq();
      return fn();
    } finally { model.close(); }
  });
  containerMethods(t, {
    model: () => model,
    createContainer: () => model.createSeq(),
    getContainerType: () => RDF.Seq,
  });

  t('testMoreIndexing', () => {
    const num = 10;
    const seq = model.createSeq();
    for (let i = 0; i < num; i += 1) seq.add(i);
    expectBounds(() => seq.add(0, false), () => assert.fail('cannot at at position 0'));
    seq.add(num + 1, false);
    assert.equal(seq.size(), num + 1);
    seq.remove(num + 1);
    expectBounds(() => seq.add(num + 2, false), () => assert.fail('cannot add past the end'));
    const size = seq.size();
    for (let i = 1; i <= num - 1; i += 1) {
      seq.add(i, 1000 + i);
      assert.equal(seq.getInt(i), 1000 + i);
      assert.equal(seq.getInt(i + 1), 0);
      assert.equal(seq.size(), size + i);
      assert.equal(seq.getInt(size), num - i - 1);
    }
  });

  const testRemove = (retain) => {
    const num = retain.length;
    const seq = model.createSeq();
    for (let i = 0; i < num; i += 1) seq.add(i);
    const retained = [];
    const nIter = seq.iterator();
    for (const aRetain of retain) {
      const x = nIter.nextNode();
      if (aRetain) retained.push(x); else nIter.remove();
    }
    assert.ok(!nIter.hasNext());
    const got = seq.iterator().toList();
    assert.ok(retained.length === got.length && retained.every((x, i) => x.equals(got[i])), `${retained} != ${got}`);
  };
  t('testRemoveA', () => testRemove(bools('tttffffftt')));
  t('testRemoveB', () => testRemove(bools('ftftttttft')));
  t('testRemoveC', () => testRemove(bools('ffffffffff')));

  t('testSeq4', () => {
    const test = 'temp';
    let n = 58305;
    const seq4 = model.createSeq();
    n = Math.trunc(n / 100) * 100 + 100;
    n++; seq4.add(tv.tvBoolean);
    n++; if (!(seq4.getBoolean(1) === tv.tvBoolean)) error(test, n);
    n++; seq4.add(tv.tvByte);
    n++; if (!(seq4.getByte(2) === tv.tvByte)) error(test, n);
    n++; seq4.add(tv.tvShort);
    n++; if (!(seq4.getShort(3) === tv.tvShort)) error(test, n);
    n++; seq4.add(tv.tvInt);
    n++; if (!(seq4.getInt(4) === tv.tvInt)) error(test, n);
    n++; seq4.add(tv.tvLong);
    n++; if (!(seq4.getLong(5) === tv.tvLong)) error(test, n);
    n++; seq4.add(tv.tvChar);
    n++; if (!(seq4.getChar(6) === tv.tvChar)) error(test, n);
    n++; seq4.add(tv.tvFloat);
    n++; if (!(seq4.getFloat(7) === tv.tvFloat)) error(test, n);
    n++; seq4.add(tv.tvDouble);
    n++; if (!(seq4.getDouble(8) === tv.tvDouble)) error(test, n);
    n++; seq4.add(tv.tvString);
    n++; if (!(seq4.getString(9) === tv.tvString)) error(test, n);
    n++; if (!(seq4.getLanguage(9) === '')) error(test, n);
    n++; seq4.add(tv.tvString, lang);
    n++; if (!(seq4.getString(10) === tv.tvString)) error(test, n);
    n++; if (!(seq4.getLanguage(10) === lang)) error(test, n);
    n++; seq4.add(anObject);
    n++;
    n++; seq4.add(tvResource);
    n++; if (!seq4.getResource(12).equals(tvResource)) error(test, n);
    n++; seq4.add(tvLiteral);
    n++; if (!seq4.getLiteral(13).equals(tvLiteral)) error(test, n);
    n++;
    n++; seq4.add(tvBag);
    n++; if (!seq4.getBag(14).equals(tvBag)) error(test, n);
    n++; seq4.add(tvAlt);
    n++; if (!seq4.getAlt(15).equals(tvAlt)) error(test, n);
    n++; seq4.add(tvSeq);
    n++; if (!seq4.getSeq(16).equals(tvSeq)) error(test, n);
    n++; expectBounds(() => seq4.getInt(17), () => error(test, n));
    n++; expectBounds(() => seq4.getInt(0), () => error(test, n));
  });

  t('testSeq5', () => {
    const seq5 = model.createSeq();
    const test = 'seq5';
    let n = 0;
    for (let i = 0; i < num; i++) seq5.add(i);
    n++; expectBounds(() => seq5.add(0, false), () => error(test, n));
    seq5.add(num + 1, false);
    if (seq5.size() !== num + 1) error(test, n);
    seq5.remove(num + 1);
    n++; expectBounds(() => seq5.add(num + 2, false), () => error(test, n));
    n = Math.trunc(n / 100) * 100 + 100;
    const size = seq5.size();
    for (let i = 1; i <= num - 1; i++) {
      n++; seq5.add(i, 1000 + i);
      n++; if (!(seq5.getInt(i) === 1000 + i)) error(test, n);
      n++; if (!(seq5.getInt(i + 1) === 0)) error(test, n);
      n++; if (!(seq5.size() === size + i)) error(test, n);
      n++; if (!(seq5.getInt(size) === num - i - 1)) error(test, n);
    }
  });

  t('testSeq6', () => {
    const test = 'seq6';
    let n = 0;
    const seq6 = model.createSeq();
    seq6.add(model.createResource());
    seq6.add(1, tv.tvBoolean);
    n++; if (!(seq6.getBoolean(1) === tv.tvBoolean)) error(test, n);
    seq6.add(1, tv.tvByte);
    n++; if (!(seq6.getByte(1) === tv.tvByte)) error(test, n);
    seq6.add(1, tv.tvShort);
    n++; if (!(seq6.getShort(1) === tv.tvShort)) error(test, n);
    seq6.add(1, tv.tvInt);
    n++; if (!(seq6.getInt(1) === tv.tvInt)) error(test, n);
    seq6.add(1, tv.tvLong);
    n++; if (!(seq6.getLong(1) === tv.tvLong)) error(test, n);
    seq6.add(1, tv.tvChar);
    n++; if (!(seq6.getChar(1) === tv.tvChar)) error(test, n);
    seq6.add(1, tv.tvFloat);
    n++; if (!(seq6.getFloat(1) === tv.tvFloat)) error(test, n);
    seq6.add(1, tv.tvDouble);
    n++; if (!(seq6.getDouble(1) === tv.tvDouble)) error(test, n);
    seq6.add(1, tv.tvString);
    n++; if (!(seq6.getString(1) === tv.tvString)) error(test, n);
    seq6.add(1, tv.tvString, lang);
    n++; if (!(seq6.getString(1) === tv.tvString)) error(test, n);
    seq6.add(1, tvResource);
    n++; if (!seq6.getResource(1).equals(tvResource)) error(test, n);
    seq6.add(1, tvLiteral);
    n++; if (!seq6.getLiteral(1).equals(tvLiteral)) error(test, n);
    seq6.add(1, anObject);
    n++;
    n = Math.trunc(n / 100) * 100 + 100;
    n++; if (!(seq6.indexOf(anObject) === 1)) error(test, n);
    n++; if (!(seq6.indexOf(tvLiteral) === 2)) error(test, n);
    n++; if (!(seq6.indexOf(tvResource) === 3)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvString, lang) === 4)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvString) === 5)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvDouble) === 6)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvFloat) === 7)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvChar) === 8)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvLong) === 9)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvInt) === 10)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvShort) === 11)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvByte) === 12)) error(test, n);
    n++; if (!(seq6.indexOf(tv.tvBoolean) === 13)) error(test, n);
    n++; if (!(seq6.indexOf(1234543) === 0)) error(test, n);
  });

  t('testSeq7', () => {
    const seq7 = model.createSeq();
    const test = 'seq7';
    let n = 0;
    n = Math.trunc(n / 100) * 100 + 100;
    for (let i = 0; i < num; i++) seq7.add(i);
    // Each block: set element 5, read it back, and check its neighbours and the size.
    const neighbours = () => {
      n++; if (!(seq7.getInt(4) === 3)) error(test, n);
      n++; if (!(seq7.getInt(6) === 5)) error(test, n);
      n++; if (!(seq7.size() === num)) error(test, n);
    };
    const block = (value, check) => {
      n = Math.trunc(n / 100) * 100 + 100;
      seq7.set(5, value);
      n++; if (!check()) error(test, n);
      neighbours();
    };
    block(tv.tvBoolean, () => seq7.getBoolean(5) === tv.tvBoolean);
    block(tv.tvByte, () => seq7.getByte(5) === tv.tvByte);
    block(tv.tvShort, () => seq7.getShort(5) === tv.tvShort);
    block(tv.tvInt, () => seq7.getInt(5) === tv.tvInt);
    block(tv.tvLong, () => seq7.getLong(5) === tv.tvLong);
    block(tv.tvChar, () => seq7.getChar(5) === tv.tvChar);
    block(tv.tvFloat, () => seq7.getFloat(5) === tv.tvFloat);
    block(tv.tvDouble, () => seq7.getDouble(5) === tv.tvDouble);
    n = Math.trunc(n / 100) * 100 + 100;
    seq7.set(5, tv.tvString);
    n++; if (!(seq7.getString(5) === tv.tvString)) error(test, n);
    n++; if (!(seq7.getLanguage(5) === '')) error(test, n);
    neighbours();
    seq7.set(5, tv.tvString, lang);
    n++; if (!(seq7.getString(5) === tv.tvString)) error(test, n);
    n++; if (!(seq7.getLanguage(5) === lang)) error(test, n);
    neighbours();
    block(tvLiteral, () => seq7.getLiteral(5).equals(tvLiteral));
    block(tvResource, () => seq7.getResource(5).equals(tvResource));
    block(anObject, () => true);
    n = Math.trunc(n / 100) * 100 + 100;
    neighbours();
  });

  t('testSeqAccessByIndexing', () => {
    const tvLiteral = model.createLiteral('test 12 string 2');
    const tvResource = model.createResource();
    const tvLitObj = new LitTestObj(1234);
    const tvBag = model.createBag();
    const tvAlt = model.createAlt();
    const tvSeq = model.createSeq();
    const seq = model.createSeq();
    seq.add(true);
    assert.equal(seq.getBoolean(1), true);
    seq.add(1);
    assert.equal(seq.getByte(2), 1);
    seq.add(2);
    assert.equal(seq.getShort(3), 2);
    seq.add(-1);
    assert.equal(seq.getInt(4), -1);
    seq.add(-2);
    assert.equal(seq.getLong(5), -2);
    seq.add('!');
    assert.equal(seq.getChar(6), '!');
    seq.add(123.456);
    near(123.456, seq.getFloat(7), 0.00005);
    seq.add(12345.67890);
    near(12345.67890, seq.getDouble(8), 0.00000005);
    seq.add('some string');
    assert.equal(seq.getString(9), 'some string');
    seq.add(tvLitObj);
    seq.add(tvResource);
    assertEquals(tvResource, seq.getResource(11));
    seq.add(tvLiteral);
    assertEquals(tvLiteral, seq.getLiteral(12));
    seq.add(tvBag);
    assertEquals(tvBag, seq.getBag(13));
    seq.add(tvAlt);
    assertEquals(tvAlt, seq.getAlt(14));
    seq.add(tvSeq);
    assertEquals(tvSeq, seq.getSeq(15));
    expectBounds(() => seq.getInt(16), () => assert.fail('there is no element 16'));
    expectBounds(() => seq.getInt(0), () => assert.fail('there is no element 0'));
  });

  t('testSeqAdd', () => {
    const seq = model.createSeq();
    assert.equal(seq.size(), 0);
    assert.ok(model.contains(seq, RDF.type, RDF.Seq));
    seq.add(tv.tvBoolean);
    assert.ok(seq.contains(tv.tvBoolean));
    assert.ok(!seq.contains(!tv.tvBoolean));
    seq.add(tv.tvByte);
    assert.ok(seq.contains(tv.tvByte));
    assert.ok(!seq.contains(101));
    seq.add(tv.tvShort);
    assert.ok(seq.contains(tv.tvShort));
    assert.ok(!seq.contains(102));
    seq.add(tv.tvInt);
    assert.ok(seq.contains(tv.tvInt));
    assert.ok(!seq.contains(-101));
    seq.add(tv.tvLong);
    assert.ok(seq.contains(tv.tvLong));
    assert.ok(!seq.contains(-102));
    seq.add(tv.tvChar);
    assert.ok(seq.contains(tv.tvChar));
    assert.ok(!seq.contains('?'));
    seq.add(123.456);
    assert.ok(seq.contains(123.456));
    assert.ok(!seq.contains(456.123));
    seq.add(-123.456);
    assert.ok(seq.contains(-123.456));
    assert.ok(!seq.contains(-456.123));
    seq.add('a string');
    assert.ok(seq.contains('a string'));
    assert.ok(!seq.contains('a necklace'));
    seq.add(model.createLiteral('another string'));
    assert.ok(seq.contains('another string'));
    assert.ok(!seq.contains('another necklace'));
    seq.add(new LitTestObj(12345));
    assert.ok(seq.contains(new LitTestObj(12345)));
    assert.ok(!seq.contains(new LitTestObj(54321)));
    assert.equal(seq.size(), 11);
  });

  t('testSeqAddInts', () => {
    const num = 10;
    const seq = model.createSeq();
    for (let i = 0; i < num; i += 1) seq.add(i);
    assert.equal(seq.size(), num);
    const L = seq.iterator().toList();
    assert.equal(L.length, num);
    for (let i = 0; i < num; i += 1) assert.equal(L[i].getInt(), i);
  });

  t('testSeqInsertByIndexing', () => {
    const tvLiteral = model.createLiteral('test 12 string 2');
    const tvResource = model.createResource();
    const tvLitObj = new LitTestObj(1234);
    const tvBag = model.createBag();
    const tvAlt = model.createAlt();
    const tvSeq = model.createSeq();
    const seq = model.createSeq();
    seq.add(model.createResource());
    seq.add(1, true);
    assert.equal(seq.getBoolean(1), true);
    seq.add(1, 1);
    assert.equal(seq.getByte(1), 1);
    seq.add(1, 2);
    assert.equal(seq.getShort(1), 2);
    seq.add(1, -1);
    assert.equal(seq.getInt(1), -1);
    seq.add(1, -2);
    assert.equal(seq.getLong(1), -2);
    seq.add(1, '!');
    assert.equal(seq.getChar(1), '!');
    seq.add(1, 123.456);
    near(123.456, seq.getFloat(1), 0.00005);
    seq.add(1, 12345.67890);
    near(12345.67890, seq.getDouble(1), 0.00000005);
    seq.add(1, 'some string');
    assert.equal(seq.getString(1), 'some string');
    seq.add(1, tvLitObj);
    seq.add(1, tvResource);
    assertEquals(tvResource, seq.getResource(1));
    seq.add(1, tvLiteral);
    assertEquals(tvLiteral, seq.getLiteral(1));
    seq.add(1, tvBag);
    assertEquals(tvBag, seq.getBag(1));
    seq.add(1, tvAlt);
    assertEquals(tvAlt, seq.getAlt(1));
    seq.add(1, tvSeq);
    assertEquals(tvSeq, seq.getSeq(1));
    assert.equal(seq.indexOf(1234543), 0);
    assert.equal(seq.indexOf(tvSeq), 1);
    assert.equal(seq.indexOf(tvAlt), 2);
    assert.equal(seq.indexOf(tvBag), 3);
    assert.equal(seq.indexOf(tvLiteral), 4);
    assert.equal(seq.indexOf(tvResource), 5);
    assert.equal(seq.indexOf(tvLitObj), 6);
    assert.equal(seq.indexOf('some string'), 7);
    assert.equal(seq.indexOf(12345.67890), 8);
    assert.equal(seq.indexOf(123.456), 9);
    assert.equal(seq.indexOf('!'), 10);
    assert.equal(seq.indexOf(-2), 11);
    assert.equal(seq.indexOf(-1), 12);
    assert.equal(seq.indexOf(2), 13);
    assert.equal(seq.indexOf(1), 14);
    assert.equal(seq.indexOf(true), 15);
  });

  t('testSet', () => {
    const tvLiteral = model.createLiteral('test 12 string 2');
    const tvResource = model.createResource();
    const num = 10;
    const seq = model.createSeq();
    for (let i = 0; i < num; i++) seq.add(i);
    const rest = () => {
      assert.equal(seq.getInt(4), 3);
      assert.equal(seq.getInt(6), 5);
      assert.equal(seq.size(), num);
    };
    seq.set(5, tv.tvBoolean);
    assert.equal(seq.getBoolean(5), tv.tvBoolean); rest();
    seq.set(5, tv.tvByte);
    assert.equal(seq.getByte(5), tv.tvByte); rest();
    seq.set(5, tv.tvShort);
    assert.equal(seq.getShort(5), tv.tvShort); rest();
    seq.set(5, tv.tvInt);
    assert.equal(seq.getInt(5), tv.tvInt); rest();
    seq.set(5, tv.tvLong);
    assert.equal(seq.getLong(5), tv.tvLong); rest();
    seq.set(5, tv.tvString);
    assert.equal(seq.getString(5), tv.tvString); rest();
    seq.set(5, tv.tvBoolean);
    assert.equal(seq.getBoolean(5), tv.tvBoolean); rest();
    seq.set(5, tv.tvFloat);
    near(tv.tvFloat, seq.getFloat(5), 0.00005); rest();
    seq.set(5, tv.tvDouble);
    near(tv.tvDouble, seq.getDouble(5), 0.000000005); rest();
    seq.set(5, tvLiteral);
    assertEquals(tvLiteral, seq.getLiteral(5)); rest();
    seq.set(5, tvResource);
    assertEquals(tvResource, seq.getResource(5)); rest();
    seq.set(5, tv.tvLitObj);
    rest();
  });
});
