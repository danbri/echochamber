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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementCreation.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java typed overloads (Byte.MAX_VALUE, char, double, float, Integer.MAX_VALUE,
// Long.MAX_VALUE as a BigInt, Short.MAX_VALUE) are JS values; Java's
// assertEquals(expected, actual, delta) is a tolerance check.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory, NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, LitTestObj, NS } from '../../lib/testlib.mjs';

const subjURI = 'http://aldabaran.hpl.hp.com/foo';
const predURI = 'http://aldabaran.hpl.hp.com/bar';
const XSDinteger = NodeFactory.getType(NS.xsd + 'integer');
const near = (expected, actual, delta) => assert.ok(Math.abs(expected - actual) <= delta, `${actual} not within ${delta} of ${expected}`);

describeJena('TestStatementCreation', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestStatementCreation.java', (t0) => {
  const t = (name, fn) => t0(name, () => {
    const model = ModelFactory.createDefaultModel();
    const r = model.createResource(subjURI);
    const p = model.createProperty(predURI);
    try { return fn(model, r, p); } finally { model.close(); }
  });

  t('testCreateStatementByteMax', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, 127);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getByte(), 127);
  });

  t('testCreateStatementChar', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, '$');
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getChar(), '$');
  });

  t('testCreateStatementDouble', (model, r, p) => {
    const s = model.createStatement(r, p, model.createTypedLiteral(12345.67890));
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    near(12345.67890, s.getDouble(), 0.0000005);
  });

  t('testCreateStatementFactory', (model, r, p) => {
    const tv = new LitTestObj(-(2n ** 63n));
    const s = model.createLiteralStatement(r, p, tv);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
  });

  t('testCreateStatementFloat', (model, r, p) => {
    const s = model.createStatement(r, p, model.createTypedLiteral(123.456));
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    near(123.456, s.getFloat(), 0.0005);
  });

  t('testCreateStatementIntMax', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, 2147483647);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getInt(), 2147483647);
  });

  t('testCreateStatementLongMax', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, 2n ** 63n - 1n);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getLong(), 2n ** 63n - 1n);
  });

  t('testCreateStatementResource', (model, r, p) => {
    const tv = model.createResource();
    const s = model.createStatement(r, p, tv);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assertEquals(tv, s.getResource());
  });

  t('testCreateStatementShortMax', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, 32767);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getShort(), 32767);
  });

  t('testCreateStatementString', (model, r, p) => {
    const string = 'this is a plain string', lang = 'en';
    const s = model.createStatement(r, p, string);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getString(), string);
    assert.equal(model.createStatement(r, p, string, lang).getLanguage(), lang);
  });

  t('testCreateStatementTrue', (model, r, p) => {
    const s = model.createLiteralStatement(r, p, true);
    assertEquals(r, s.getSubject());
    assertEquals(p, s.getPredicate());
    assert.equal(s.getBoolean(), true);
  });

  t('testCreateStatementTypeLiteral', () => {
    const model = ModelFactory.createDefaultModel();
    const R = model.createResource('http://example/r');
    const P = model.createProperty('http://example/p');
    model.add(R, P, '2', XSDinteger);
    const L = ResourceFactory.createTypedLiteral('2', XSDinteger);
    assert.ok(model.contains(R, P, L));
    assert.ok(!model.contains(R, P, '2'));
  });
});
