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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestListStatements.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// The class is not parameterised. @BeforeAll setUpBeforeClass is run (once, cached) by each test that reads its shared model; a failure there fails every such test, as in JUnit.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF } from '../../lib/testlib.mjs';

let shared = null;
function setUpBeforeClass() {
  if (shared) return shared;
  const m = ModelFactory.createDefaultModel();
  const s = m.createResource('http://www.a.com/s');
  const p = m.createProperty('http://www.a.com/p');
  m.add(s, p, m.createResource('http://www.a.com/o'));
  m.add(s, p, 'texte', 'fr');
  m.add(s, p, 'text', 'en');
  m.add(s, p, 'text');
  m.add(m.createLiteralStatement(s, p, 1789));
  shared = { m, s, p };
  return shared;
}

describeJena('TestListStatements', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestListStatements.java', (t) => {
  t('thereAre2LitsWoLang', () => {
    const { m, s, p } = setUpBeforeClass();
    assert.ok(m.listStatements(s, p, null, '').toList().length === 2);
  });
  t('thereAre4Literals', () => {
    const { m, s, p } = setUpBeforeClass();
    assert.ok(m.listStatements(s, p, null, null).toList().length === 4);
  });
  t('thereIsOneFrench', () => {
    const { m, s, p } = setUpBeforeClass();
    const lis = m.listStatements(s, p, null, 'fr').toList();
    assert.ok(lis.length === 1);
    assert.ok(lis[0].getObject().toString() === '"texte"@fr');
  });
  t('theresAreTwoText', () => {
    const { m, s, p } = setUpBeforeClass();
    assert.ok(m.listStatements(s, p, 'text', null).toList().length === 2);
  });
  t('theresOneTextEN', () => {
    const { m, s, p } = setUpBeforeClass();
    const lis = m.listStatements(s, p, 'text', 'en').toList();
    assert.ok(lis.length === 1);
    assert.ok(lis[0].getObject().toString() === '"text"@en');
  });
  t('theresOneTextWoLang', () => {
    const { m, s, p } = setUpBeforeClass();
    assert.ok(m.listStatements(s, p, 'text', '').toList().length === 1);
  });
  t('theresOneWithABNodeObject', () => {
    const m = ModelFactory.createDefaultModel();
    const anon = m.createResource();
    m.createResource('http://example').addProperty(RDF.type, anon);
    const lis = m.listStatements(null, null, anon).toList();
    assert.ok(lis.length === 1);
  });
});
