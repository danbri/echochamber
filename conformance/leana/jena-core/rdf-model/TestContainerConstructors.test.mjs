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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestContainerConstructors.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); RDF.x is test data (lib/testlib.mjs).

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF } from '../../lib/testlib.mjs';

describeJena('TestContainerConstructors', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestContainerConstructors.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); }
  });

  t('testCreateAnonAlt', () => {
    const tv = model.createAlt();
    assert.ok(tv.isAnon());
    assert.ok(model.contains(tv, RDF.type, RDF.Alt));
  });
  t('testCreateAnonBag', () => {
    const tv = model.createBag();
    assert.ok(tv.isAnon());
    assert.ok(model.contains(tv, RDF.type, RDF.Bag));
  });
  t('testCreateAnonSeq', () => {
    const tv = model.createSeq();
    assert.ok(tv.isAnon());
    assert.ok(model.contains(tv, RDF.type, RDF.Seq));
  });
  t('testCreateNamedAlt', () => {
    const uri = 'http://aldabaran/sirius';
    const tv = model.createAlt(uri);
    assert.equal(tv.getURI(), uri);
    assert.ok(model.contains(tv, RDF.type, RDF.Alt));
  });
  t('testCreateNamedBag', () => {
    const uri = 'http://aldabaran/foo';
    const tv = model.createBag(uri);
    assert.equal(tv.getURI(), uri);
    assert.ok(model.contains(tv, RDF.type, RDF.Bag));
  });
  t('testCreateNamedSeq', () => {
    const uri = 'http://aldabaran/andromeda';
    const tv = model.createSeq(uri);
    assert.equal(tv.getURI(), uri);
    assert.ok(model.contains(tv, RDF.type, RDF.Seq));
  });
});
