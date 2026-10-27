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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestResources.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Java typed values (AbstractModelTestBase.tv*) are lib/testlib.mjs tv; Iter.toSet is ExtendedIterator.toSet.

import assert from 'node:assert/strict';
import { ModelFactory, JenaSet, InvalidPropertyURIException, PropertyNotFoundException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, RDF, NS, tv } from '../../lib/testlib.mjs';

const setOf = (x) => new JenaSet([x]);

function checkNumericContent(cont2, num) {
  const nit = cont2.iterator();
  for (let i = 0; i < num; i += 1) assert.equal(nit.nextNode().getInt(), i);
  assert.ok(!nit.hasNext());
}
function retainOnlySpecified(cont2, num, retain) {
  const nit = cont2.iterator();
  for (let i = 0; i < num; i++) {
    nit.nextNode();
    if (retain[i] === false) nit.remove();
  }
  assert.ok(!nit.hasNext());
}
function seeWhatsThere(cont2, found) {
  const nit = cont2.iterator();
  while (nit.hasNext()) {
    const v = nit.nextNode().getInt();
    assert.ok(!found[v]);
    found[v] = true;
  }
}

function containerTest(model, cont1, cont2) {
  const tvLiteral = model.createLiteral('test 12 string 2');
  const tvLitObj = tv.tvLitObj;
  model.createBag();
  model.createAlt();
  model.createSeq();
  const lang = 'en';
  assert.equal(cont1.size(), 0);
  assert.equal(cont2.size(), 0);
  for (const x of [tv.tvBoolean, tv.tvByte, tv.tvShort, tv.tvInt, tv.tvLong, tv.tvFloat, tv.tvDouble, tv.tvChar, tv.tvString]) {
    assert.ok(cont1.add(x).contains(x));
  }
  assert.ok(!cont1.contains(tv.tvString, lang));
  assert.ok(cont1.add(tv.tvString, lang).contains(tv.tvString, lang));
  assert.ok(cont1.add(tvLiteral).contains(tvLiteral));
  assert.ok(cont1.add(tvLitObj).contains(tvLitObj));
  assert.equal(cont1.size(), 12);
  const num = 10;
  for (let i = 0; i < num; i += 1) cont2.add(i);
  assert.equal(cont2.size(), num);
  checkNumericContent(cont2, num);
  const found = new Array(num).fill(false);
  const retain = [true, true, true, false, false, false, false, false, true, true];
  retainOnlySpecified(cont2, num, retain);
  seeWhatsThere(cont2, found);
  for (let i = 0; i < num; i += 1) assert.equal(found[i], retain[i], i + 'th element of array');
}

function resourceTest(model, r, numProps) {
  const tvLiteral = model.createLiteral('test 12 string 2');
  const tvResource = model.createResource();
  const lang = 'fr';
  for (const x of [tv.tvBoolean, tv.tvByte, tv.tvShort, tv.tvInt, tv.tvLong, tv.tvChar, tv.tvFloat, tv.tvDouble]) {
    assert.ok(r.addLiteral(RDF.value, x).hasLiteral(RDF.value, x));
  }
  assert.ok(r.addProperty(RDF.value, tv.tvString).hasProperty(RDF.value, tv.tvString));
  assert.ok(r.addProperty(RDF.value, tv.tvString, lang).hasProperty(RDF.value, tv.tvString, lang));
  assert.ok(r.addLiteral(RDF.value, tv.tvObject).hasLiteral(RDF.value, tv.tvObject));
  assert.ok(r.addProperty(RDF.value, tvLiteral).hasProperty(RDF.value, tvLiteral));
  assert.ok(r.addProperty(RDF.value, tvResource).hasProperty(RDF.value, tvResource));
  assert.ok(r.getRequiredProperty(RDF.value).getSubject().equals(r));
  const p = model.createProperty('foo/', 'bar');
  assertThrows(PropertyNotFoundException, () => r.getRequiredProperty(p), 'should detect missing property');
  assert.equal(r.listProperties(RDF.value).toSet().size(), 13);
  assertEquals(setOf(r), r.listProperties(RDF.value).mapWith((s) => s.getSubject()).toSet());
  assert.equal(r.listProperties(p).toSet().size(), 0);
  assertEquals(new JenaSet(), r.listProperties(p).mapWith((s) => s.getSubject()).toSet());
  assert.equal(r.listProperties().toSet().size(), 13 + numProps);
  assertEquals(setOf(r), r.listProperties().mapWith((s) => s.getSubject()).toSet());
  r.removeProperties();
  assert.equal(r.listProperties().toList().length, 0);
}

describeJena('TestResources', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestResources.java', (t) => {
  const setUp = () => ModelFactory.createDefaultModel();

  t('testCreateAnonResource', () => {
    const model = setUp();
    const r = model.createResource();
    assert.ok(r.isAnon());
    assert.equal(r.getURI(), null);
    assert.equal(r.getNameSpace(), null);
    assert.equal(r.getLocalName(), null);
  });

  t('testCreateAnonResourceWithNull', () => {
    const model = setUp();
    const r = model.createResource(null);
    assert.ok(r.isAnon());
    assert.equal(r.getURI(), null);
    assert.equal(r.getNameSpace(), null);
    assert.equal(r.getLocalName(), null);
  });

  t('testCreateNamedResource', () => {
    const model = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/foo';
    assert.equal(model.createResource(uri).getURI(), uri);
  });

  t('testCreateNullPropertyFails', () => {
    const model = setUp();
    assertThrows(InvalidPropertyURIException, () => model.createProperty(null), 'should not create null property');
  });

  t('testCreatePropertyOneArg', () => {
    const model = setUp();
    const p = model.createProperty('abc/def');
    assert.equal(p.getNameSpace(), 'abc/');
    assert.equal(p.getLocalName(), 'def');
    assert.equal(p.getURI(), 'abc/def');
  });

  t('testCreatePropertyStrangeURI', () => {
    const model = setUp();
    const uri = NS.rdf + '_345';
    const p = model.createProperty(uri);
    assert.equal(p.getNameSpace(), NS.rdf);
    assert.equal(p.getLocalName(), '_345');
    assert.equal(p.getURI(), uri);
  });

  t('testCreatePropertyStrangeURITwoArgs', () => {
    const model = setUp();
    const local = '_345';
    const p = model.createProperty(NS.rdf, local);
    assert.equal(p.getNameSpace(), NS.rdf);
    assert.equal(p.getLocalName(), local);
    assert.equal(p.getURI(), NS.rdf + local);
  });

  t('testCreatePropertyTwoArgs', () => {
    const model = setUp();
    const p = model.createProperty('abc/', 'def');
    assert.equal(p.getNameSpace(), 'abc/');
    assert.equal(p.getLocalName(), 'def');
    assert.equal(p.getURI(), 'abc/def');
  });

  t('testCreateTypedAnonResource', () => {
    const model = setUp();
    const r = model.createResource(RDF.Property);
    assert.ok(r.isAnon());
    assert.ok(model.contains(r, RDF.type, RDF.Property));
  });

  t('testCreateTypedNamedresource', () => {
    const model = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/foo';
    const r = model.createResource(uri, RDF.Property);
    assert.equal(r.getURI(), uri);
    assert.ok(model.contains(r, RDF.type, RDF.Property));
  });

  t('testEnhancedResources', () => {
    const model = setUp();
    const r = model.createResource();
    resourceTest(model, r, 0);
    resourceTest(model, model.createBag(), 1);
    containerTest(model, model.createBag(), model.createBag());
    resourceTest(model, model.createAlt(), 1);
    containerTest(model, model.createAlt(), model.createAlt());
    resourceTest(model, model.createSeq(), 1);
    containerTest(model, model.createSeq(), model.createSeq());
  });
});
