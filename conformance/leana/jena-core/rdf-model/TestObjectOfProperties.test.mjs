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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestObjectOfProperties.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// The @BeforeEach setUp runs at the start of each test.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

const num = 5;
const suri = 'http://aldabaran/test8/s';
const puri = 'http://aldabaran/test8/';
const tvBooleanArray = [false, true];
const tvLongArray = [123n, 321n];
const tvCharArray = ['@', ';'];
const tvFloatArray = [456.789, 789.456];
const tvDoubleArray = [123.456, 456.123];
const tvStringArray = ['testing string 1', 'testing string 2'];
const lang = ['en', 'fr'];
const numObj = 7;

function setUp() {
  const model = ModelFactory.createDefaultModel();
  const subject = [], predicate = [], object = [];
  for (let i = 0; i < num; i++) {
    subject[i] = model.createResource(suri + String(i));
    predicate[i] = model.createProperty(puri + String(i), 'p');
  }
  for (let i = 0; i < num; i++) model.addLiteral(subject[i], predicate[4], false);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      let stmt = model.createStatement(subject[i], predicate[j], model.createTypedLiteral(tvBooleanArray[j]));
      model.add(stmt);
      stmt = model.createLiteralStatement(subject[i], predicate[j], tvLongArray[j]);
      model.add(stmt);
      stmt = model.createLiteralStatement(subject[i], predicate[j], tvCharArray[j]);
      model.add(stmt);
      stmt = model.createStatement(subject[i], predicate[j], model.createTypedLiteral(tvFloatArray[j]));
      model.add(stmt);
      stmt = model.createStatement(subject[i], predicate[j], model.createTypedLiteral(tvDoubleArray[j]));
      model.add(stmt);
      stmt = model.createStatement(subject[i], predicate[j], tvStringArray[j]);
      model.add(stmt);
      stmt = model.createStatement(subject[i], predicate[j], tvStringArray[j], lang[j]);
      model.add(stmt);
      model.add(stmt);
    }
  }
  object[0] = model.createTypedLiteral(tvBooleanArray[1]);
  object[1] = model.createTypedLiteral(tvLongArray[1]);
  object[2] = model.createTypedLiteral(tvCharArray[1]);
  object[3] = model.createTypedLiteral(tvFloatArray[1]);
  object[4] = model.createTypedLiteral(tvDoubleArray[1]);
  object[5] = model.createLiteral(tvStringArray[1]);
  object[6] = model.createLiteral(tvStringArray[1], lang[1]);
  return { model, subject, predicate, object };
}

describeJena('TestObjectOfProperties', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestObjectOfProperties.java', (t) => {
  const assertFoundAll = (subject, subjf) => { for (let i = 0; i < num; i++) assert.ok(subjf[i], 'Should have found ' + subject[i]); };
  const assertFoundNone = (subject, subjf) => { for (let i = 0; i < num; i++) assert.ok(!subjf[i], 'Should not have found ' + subject[i]); };
  const checkBooleanSubjects = (subjf) => {
    for (let i = 0; i < num; i++) { if (subjf[i]) assert.ok(!(i > 1)); else assert.ok(!(i < 2)); }
  };
  const processIterator = (subject, rIter, subjf) => {
    for (let i = 0; i < num; i++) subjf[i] = false;
    while (rIter.hasNext()) {
      const subj = rIter.nextResource();
      let found = false;
      for (let i = 0; i < num; i++) {
        if (subj.equals(subject[i])) {
          found = true;
          assert.ok(!subjf[i], 'Should not have found ' + subject[i] + ' already');
          subjf[i] = true;
        }
      }
      assert.ok(found, 'Should have found ' + subj);
    }
  };

  t('testListObjectsOfProperty', () => {
    const { model, predicate, object } = setUp();
    const objf = new Array(numObj).fill(false);
    const nIter = model.listObjectsOfProperty(predicate[1]);
    while (nIter.hasNext()) {
      const obj = nIter.nextNode();
      let found = false;
      for (let i = 0; i < numObj; i++) {
        if (obj.equals(object[i])) {
          found = true;
          assert.ok(!objf[i], 'Should not have found ' + object[i] + ' already');
          objf[i] = true;
        }
      }
      assert.ok(found, 'Should have found ' + obj);
    }
    for (let i = 0; i < numObj; i++) assert.ok(objf[i], 'Should have found ' + object[i]);
  });

  t('testListResourcesWIthProperty', () => {
    const { model, subject, predicate } = setUp();
    const subjf = new Array(num).fill(false);
    const p = (it) => processIterator(subject, it, subjf);
    p(model.listResourcesWithProperty(predicate[4])); assertFoundAll(subject, subjf);
    p(model.listResourcesWithProperty(predicate[0])); checkBooleanSubjects(subjf);
    p(model.listResourcesWithProperty(predicate[0], model.createTypedLiteral(tvBooleanArray[0]))); checkBooleanSubjects(subjf);
    p(model.listResourcesWithProperty(predicate[0], model.createTypedLiteral(tvBooleanArray[1]))); assertFoundNone(subject, subjf);
    for (const cast of [Number, Number, Number, (x) => x]) {
      p(model.listResourcesWithProperty(predicate[0], cast(tvLongArray[0]))); checkBooleanSubjects(subjf);
      p(model.listResourcesWithProperty(predicate[0], cast(tvLongArray[1]))); assertFoundNone(subject, subjf);
    }
    p(model.listResourcesWithProperty(predicate[0], tvCharArray[0])); checkBooleanSubjects(subjf);
    p(model.listResourcesWithProperty(predicate[0], tvCharArray[1])); assertFoundNone(subject, subjf);
    for (let k = 0; k < 2; k++) {
      p(model.listResourcesWithProperty(predicate[0], model.createTypedLiteral(tvDoubleArray[0]))); checkBooleanSubjects(subjf);
      p(model.listResourcesWithProperty(predicate[0], model.createTypedLiteral(tvDoubleArray[1]))); assertFoundNone(subject, subjf);
    }
  });

  t('testListSubjectsWithProperty', () => {
    const { model, subject, predicate } = setUp();
    const subjf = new Array(num).fill(false);
    const p = (it) => processIterator(subject, it, subjf);
    p(model.listSubjectsWithProperty(predicate[0], tvStringArray[0])); checkBooleanSubjects(subjf);
    p(model.listSubjectsWithProperty(predicate[0], tvStringArray[1])); assertFoundNone(subject, subjf);
    p(model.listSubjectsWithProperty(predicate[0], tvStringArray[0], lang[0])); checkBooleanSubjects(subjf);
    p(model.listSubjectsWithProperty(predicate[0], tvStringArray[1])); assertFoundNone(subject, subjf);
  });
});
