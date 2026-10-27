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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceFactory.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// Java == on the XSDDatatype singletons is equals() on leana's per-IRI datatype
// objects; a Java Calendar is a JS Date.

import assert from 'node:assert/strict';
import { ResourceFactory, NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, NS } from '../../lib/testlib.mjs';

const XSDinteger = NodeFactory.getType(NS.xsd + 'integer');
const XSDint = NodeFactory.getType(NS.xsd + 'int');
const XSDdateTime = NodeFactory.getType(NS.xsd + 'dateTime');
const uri1 = 'http://example.org/example#a1';
const uri2 = 'http://example.org/example#a2';

// TestFactory implements ResourceFactory.Interface: createResource() answers `resource`, the rest null.
class TestFactory {
  constructor(r) { this.resource = r; }
  createLangLiteral() { return null; }
  createStringLiteral() { return null; }
  createProperty() { return null; }
  createResource(uri) { return uri === undefined ? this.resource : null; }
  createStatementTerm() { return null; }
  createStatement() { return null; }
  createTypedLiteral() { return null; }
}

describeJena('TestResourceFactory', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceFactory.java', (t) => {
  t('testCreateLiteral', () => {
    const l = ResourceFactory.createPlainLiteral('lex');
    assert.ok(l.getLexicalForm() === 'lex');
    assert.ok(l.getLanguage() === '');
    assert.ok(l.getDatatype() != null);
    assert.ok(l.getDatatypeURI() != null);
  });

  t('testCreateProperty', () => {
    const p1 = ResourceFactory.createProperty(uri1);
    assert.ok(p1.getURI() === uri1);
    const p2 = ResourceFactory.createProperty(uri1, '2');
    assert.ok(p2.getURI() === uri1 + '2');
  });

  t('testCreateResource', () => {
    let r1 = ResourceFactory.createResource();
    assert.ok(r1.isAnon());
    const r2 = ResourceFactory.createResource();
    assert.ok(r2.isAnon());
    assert.ok(!r1.equals(r2));
    r1 = ResourceFactory.createResource(uri1);
    assert.ok(r1.getURI() === uri1);
  });

  t('testCreateStatement', () => {
    const s = ResourceFactory.createResource();
    const p = ResourceFactory.createProperty(uri2);
    const o = ResourceFactory.createResource();
    const stmt = ResourceFactory.createStatement(s, p, o);
    assert.ok(stmt.getSubject().equals(s));
    assert.ok(stmt.getPredicate().equals(p));
    assert.ok(stmt.getObject().equals(o));
  });

  t('testCreateTypedLiteral', () => {
    const l = ResourceFactory.createTypedLiteral('22', XSDinteger);
    assert.ok(l.getLexicalForm() === '22');
    assert.ok(l.getLanguage() === '');
    assert.ok(l.getDatatype().equals(XSDinteger));
    assert.ok(l.getDatatypeURI() === XSDinteger.getURI());
  });

  t('testCreateTypedLiteralObject', () => {
    const l = ResourceFactory.createTypedLiteral(22); // Java Integer 22
    assert.equal(l.getLexicalForm(), '22');
    assert.equal(l.getLanguage(), '');
    assertEquals(XSDint, l.getDatatype());
  });

  t('testCreateTypedLiteralOverload', () => {
    const testCal = new Date(Date.UTC(1999, 4, 30, 15, 9, 32, 0)); // GregorianCalendar GMT
    const lc = ResourceFactory.createTypedLiteral(testCal);
    assertEquals(ResourceFactory.createTypedLiteral('1999-05-30T15:09:32Z', XSDdateTime), lc, 'calendar overloading test');
  });

  t('testCreateStatementTerm', () => {
    const s = ResourceFactory.createResource();
    const p = ResourceFactory.createProperty(uri2);
    const o = ResourceFactory.createResource();
    const stmt0 = ResourceFactory.createStatement(s, p, o);
    const stmtTerm = ResourceFactory.createStatementTerm(stmt0);
    assertEquals(stmt0, stmtTerm.getStatement());
    const stmt = stmtTerm.getStatement();
    assert.ok(stmt.getSubject().equals(s));
    assert.ok(stmt.getPredicate().equals(p));
    assert.ok(stmt.getObject().equals(o));
  });

  t('testGetInstance', () => {
    ResourceFactory.getInstance();
    const r1 = ResourceFactory.createResource();
    assert.ok(r1.isAnon());
    const r2 = ResourceFactory.createResource();
    assert.ok(r2.isAnon());
    assert.ok(!r1.equals(r2));
  });

  t('testSetInstance', () => {
    const r = ResourceFactory.createResource();
    const oldFactory = ResourceFactory.getInstance();
    const factory = new TestFactory(r);
    try {
      ResourceFactory.setInstance(factory);
      assert.ok(factory === ResourceFactory.getInstance());
      assert.ok(ResourceFactory.createResource() === r);
    } finally {
      ResourceFactory.setInstance(oldFactory);
    }
  });
});
