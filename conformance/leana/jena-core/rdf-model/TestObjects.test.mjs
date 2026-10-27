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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestObjects.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { ModelFactory, JenaSet } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, RDF, resource, property } from '../../lib/testlib.mjs';

const numberSubjects = 7;
const numberPredicates = 3;
const subjectPrefix = 'http://aldabaran/test6/s';
const predicatePrefix = 'http://aldabaran/test6/';

function fill(model) {
  const statements = new JenaSet();
  for (let i = 0; i < numberSubjects; i += 1) {
    for (let j = 0; j < numberPredicates; j += 1) {
      const s = model.createLiteralStatement(resource(subjectPrefix + i), property(predicatePrefix + j + '/p'), (i * numberPredicates) + j);
      model.add(s);
      statements.add(s);
    }
  }
  assert.equal(model.size(), numberSubjects * numberPredicates);
  return statements;
}
const literalsFor = (model, predicate) => {
  const r = new JenaSet();
  for (let i = 0; i < numberSubjects; i += 1) r.add(model.createTypedLiteral((i * numberPredicates) + predicate));
  return r;
};
const literalsUpto = (model, limit) => {
  const r = new JenaSet();
  for (let i = 0; i < limit; i += 1) r.add(model.createTypedLiteral(i));
  return r;
};
const predicateSet = (limit) => {
  const r = new Set();
  for (let i = 0; i < limit; i += 1) r.add(predicatePrefix + i + '/');
  return r;
};
const subjectSet = (limit) => {
  const r = new JenaSet();
  for (let i = 0; i < limit; i += 1) r.add(resource(subjectPrefix + i));
  return r;
};

describeJena('TestObjects', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestObjects.java', (t) => {
  const setUp = () => ModelFactory.createDefaultModel();

  t('testListNamespaces', () => {
    const model = setUp();
    fill(model);
    const L = model.listNameSpaces().toList();
    assert.equal(L.length, numberPredicates);
    assert.deepEqual(new Set(L), predicateSet(numberPredicates));
  });

  t('testListObjects', () => {
    const model = setUp();
    fill(model);
    assertEquals(literalsUpto(model, numberSubjects * numberPredicates), model.listObjects().toSet());
  });

  t('testListObjectsOfPropertyByProperty', () => {
    const model = setUp();
    fill(model);
    const L = model.listObjectsOfProperty(property(predicatePrefix + '0/p')).toList();
    assert.equal(L.length, numberSubjects);
    assertEquals(literalsFor(model, 0), new JenaSet(L));
  });

  t('testListObjectsOfPropertyBySubject', () => {
    const model = setUp();
    const size = 10;
    const s = model.createResource();
    for (let i = 0; i < size; i += 1) model.addLiteral(s, RDF.value, i);
    const L = model.listObjectsOfProperty(s, RDF.value).toList();
    assert.equal(L.length, size);
    assertEquals(literalsUpto(model, size), new JenaSet(L));
  });

  t('testListStatements', () => {
    const model = setUp();
    const statements = fill(model);
    const L = model.listStatements().toList();
    assert.equal(L.length, statements.size());
    assertEquals(statements, new JenaSet(L));
  });

  t('testListSubjects', () => {
    const model = setUp();
    fill(model);
    const L = model.listSubjects().toList();
    assert.equal(L.length, numberSubjects);
    assertEquals(subjectSet(numberSubjects), new JenaSet(L));
  });
});
