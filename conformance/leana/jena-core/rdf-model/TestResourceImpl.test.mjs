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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceImpl.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Java typed values: 'x' (char), 1.0d, 1.0f, 1L (BigInt 1n), new Object() ({}); each needs an engine datatype choice.

import assert from 'node:assert/strict';
import { ModelFactory, ResourceFactory, Resource, ResourceRequiredException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, RDF, literalOf, resource, property, modelWithStatements } from '../../lib/testlib.mjs';

describeJena('TestResourceImpl', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestResourceImpl.java', (t) => {
  const setUp = () => ModelFactory.createDefaultModel();

  t('testAddLiteralPassesLiteralUnmodified', () => {
    const model = setUp();
    const r = model.createResource();
    const lit = model.createLiteral('spoo');
    r.addLiteral(RDF.value, lit);
    assert.ok(model.contains(null, RDF.value, lit), 'model should contain unmodified literal');
  });

  const addTyped = (v) => () => {
    const model = setUp();
    const r = model.createResource();
    r.addLiteral(RDF.value, v);
    assertEquals(model.createTypedLiteral(v), r.getProperty(RDF.value).getLiteral());
  };
  t('testAddTypedPropertyBoolean', addTyped(true));
  t('testAddTypedPropertyChar', addTyped('x'));
  t('testAddTypedPropertyDouble', addTyped(1.0));
  t('testAddTypedPropertyFloat', addTyped(1.0));
  t('testAddTypedPropertyInt', () => {
    // Commented out in Jena.
  });
  t('testAddTypedPropertyLong', addTyped(1n));
  t('testAddTypedPropertyObject', addTyped({}));
  t('testAddTypedPropertyString', () => {});

  t('testAsLiteral', () => {
    const model = setUp();
    assertThrows(ResourceRequiredException, () => literalOf(model, '17').as(Resource), 'literals cannot be resources');
  });

  t('testCannotAsNonLiteral', () => {
    const model = setUp();
    resource(model, 'plumPie').as(Resource);
  });

  t('testGetLocalNameReturnsLocalName', () => {
    assert.equal(resource('eh:xyz').getLocalName(), 'xyz');
  });

  t('testGetModel', () => {
    const model = setUp();
    assert.equal(model.createResource('eh:/wossname').getModel(), model);
  });

  t('testGetPropertyResourceValueReturnsNull', () => {
    const model = modelWithStatements('x p 17');
    const r = model.createResource('eh:/x');
    assert.equal(r.getPropertyResourceValue(property('q')), null);
    assert.equal(r.getPropertyResourceValue(property('p')), null);
  });

  t('testGetPropertyResourceValueReturnsResource', () => {
    const model = modelWithStatements('x p 17; x p y');
    const r = model.createResource('eh:/x');
    const value = r.getPropertyResourceValue(property('p'));
    assertEquals(resource('y'), value);
  });

  const hasTyped = (v) => () => {
    const model = setUp();
    const r = model.createResource();
    r.addLiteral(RDF.value, v);
    assert.ok(r.hasLiteral(RDF.value, v));
  };
  t('testHasTypedPropertyBoolean', hasTyped(false));
  t('testHasTypedPropertyChar', hasTyped('x'));
  t('testHasTypedPropertyDouble', hasTyped(1.0));
  t('testHasTypedPropertyFloat', hasTyped(1.0));
  t('testHasTypedPropertyInt', hasTyped(1));
  t('testHasTypedPropertyLong', hasTyped(1n));
  t('testHasTypedPropertyObject', hasTyped({}));
  t('testHasTypedPropertyString', () => {});

  t('testHasURI', () => {
    assert.ok(resource('eh:xyz').hasURI('eh:xyz'));
    assert.ok(!resource('eh:xyz').hasURI('eh:1yz'));
    assert.ok(!ResourceFactory.createResource().hasURI('42'));
  });

  t('testNameSpace', () => {
    assert.equal(resource('eh:xyz').getNameSpace(), 'eh:');
    assert.equal(resource('http://d/stuff').getNameSpace(), 'http://d/');
    assert.equal(resource('ftp://dd.com/12345').getNameSpace(), 'ftp://dd.com/12345');
    assert.equal(resource('http://domain/spoo#anchor').getNameSpace(), 'http://domain/spoo#');
    assert.equal(resource('ftp://abd/def#ghi#e11-2').getNameSpace(), 'ftp://abd/def#ghi#');
  });
});
