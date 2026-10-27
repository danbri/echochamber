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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestLiteralImpl.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// UniqueValueClass1/2 are JS classes; TypeMapper.reset is not in leana (the gap is raised before it is reached).

import assert from 'node:assert/strict';
import { ModelFactory, NodeFactory, TypeMapper, Literal, LiteralRequiredException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertDiffer, assertThrows, literalOf, resource, XSDDatatype } from '../../lib/testlib.mjs';

class UniqueValueClass1 { constructor(v) { this.value = v; } toString() { return this.value; } }
class UniqueValueClass2 { constructor(v) { this.value = v; } toString() { return this.value; } }

describeJena('TestLiteralImpl', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestLiteralImpl.java', (t) => {
  const setUp = () => ModelFactory.createDefaultModel();

  t('testAsLiteral', () => {
    const model = setUp();
    literalOf(model, '17').as(Literal);
  });

  t('testCannotAsNonLiteral', () => {
    const model = setUp();
    assertThrows(LiteralRequiredException, () => resource(model, 'plumPie').as(Literal), 'non-literal cannot be converted to literal');
  });

  t('testAsNumber', () => {
    const model = setUp();
    const number = literalOf(model, '17').getInt();
    assert.equal(number, 17);
  });

  t('testCannotAsNonNumber', () => {
    const model = setUp();
    // Jena: DatatypeFormatException whose message names the datatype and XSDDateTime.
    let err = null;
    try {
      const node = NodeFactory.createLiteralDT('1984', XSDDatatype.XSDgYear);
      const literal = model.asRDFNode(node).asLiteral();
      literal.getInt();
    } catch (e) { err = e; }
    if (err === null) assert.fail('Expected DatatypeFormatException');
    if (err.name !== 'DatatypeFormatException') throw err;
    assert.ok(err.message.includes('Error converting typed value to a number'));
    assert.ok(err.message.includes('http://www.w3.org/2001/XMLSchema#gYear'));
    assert.ok(err.message.includes('XSDDateTime'));
  });

  t('testInModel', () => {
    const m1 = ModelFactory.createDefaultModel();
    const m2 = ModelFactory.createDefaultModel();
    const l1 = m1.createLiteral('17');
    const l2 = l1.inModel(m2);
    assertEquals(l1, l2);
    assert.equal(l2.getModel(), m2);
  });

  t('testLiteralHasModel', () => {
    const model = setUp();
    const has = (m, lit) => assert.equal(lit.getModel(), m);
    has(model, model.createLiteral('hello, world'));
    has(model, model.createLiteral('hello, world', 'en-GB'));
    has(model, model.createTypedLiteral(false));
    has(model, model.createTypedLiteral(17));
    has(model, model.createTypedLiteral('x'));
  });

  t('testSameAdhocClassUS', () => {
    const model = setUp();
    const ra = new UniqueValueClass1('rhubarb');
    const rb = new UniqueValueClass1('cottage');
    assert.equal(TypeMapper.getInstance().getTypeByValue(ra), null, 'not expecting registered RDF Datatype');
    const la = model.createTypedLiteral(ra);
    const lb = model.createTypedLiteral(rb);
    assert.equal(lb.getDatatype(), la.getDatatype());
    assert.notEqual(TypeMapper.getInstance().getTypeByValue(ra), null);
  });

  t('testTypedLiteralTypesAndValues', () => {
    const model = setUp();
    const r = new UniqueValueClass2('rhubarb');
    assert.equal(TypeMapper.getInstance().getTypeByValue(r), null, 'not expecting registered RDF Datatype');
    const typed = model.createTypedLiteral(r);
    const string = model.createLiteral(r.value);
    assert.equal(typed.getLexicalForm(), string.getLexicalForm());
    assert.equal(typed.getLanguage(), string.getLanguage());
    assertDiffer(string.getDatatypeURI(), typed.getDatatypeURI());
    assert.ok(typed.getDatatype() != null, 'a datatype should have been invented for Resource[Impl]');
    assertDiffer(typed, string);
    assertDiffer(typed.getValue(), string.getValue());
    assertEquals(r, typed.getValue());
    assertDiffer(typed.hashCode(), string.hashCode());
  });
});
