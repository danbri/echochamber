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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestGetFromModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF } from '../../lib/testlib.mjs';

describeJena('TestGetFromModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestGetFromModel.java', (t) => {
  const setUp = () => {
    const model = ModelFactory.createDefaultModel();
    const S = model.createResource('http://nowhere.man/subject');
    const P = model.createProperty('http://nowhere.man/predicate');
    return { model, S, P };
  };

  t('testGetAlt', () => {
    const { model } = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/rdf/test4/' + 160;
    model.createAlt(uri);
    const a = model.getAlt(uri);
    assert.equal(a.getURI(), uri);
    assert.ok(model.contains(a, RDF.type, RDF.Alt));
  });

  t('testGetBag', () => {
    const { model } = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/rdf/test4/' + 150;
    model.createBag(uri);
    const b = model.getBag(uri);
    assert.equal(b.getURI(), uri);
    assert.ok(model.contains(b, RDF.type, RDF.Bag));
  });

  t('testGetPropertyOneArg', () => {
    const { model } = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/rdf/test4/a' + 130;
    assert.equal(model.getProperty(uri).getURI(), uri);
  });

  t('testGetPropertyTwoArgs', () => {
    const { model } = setUp();
    const ns = 'http://aldabaran.hpl.hp.com/rdf/test4/a' + 140 + '/';
    assert.equal(model.getProperty(ns, 'foo').getURI(), ns + 'foo');
  });

  t('testGetResource', () => {
    const { model } = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/rdf/test4/a' + 110;
    assert.equal(model.getResource(uri).getURI(), uri);
  });

  t('testGetSeq', () => {
    const { model } = setUp();
    const uri = 'http://aldabaran.hpl.hp.com/rdf/test4/' + 170;
    model.createSeq(uri);
    const s = model.getSeq(uri);
    assert.equal(s.getURI(), uri);
    assert.ok(model.contains(s, RDF.type, RDF.Seq));
  });
});
