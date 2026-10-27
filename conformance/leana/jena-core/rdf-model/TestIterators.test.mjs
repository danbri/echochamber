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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestIterators.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// The @BeforeEach setUp runs at the start of each test.

import assert from 'node:assert/strict';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF } from '../../lib/testlib.mjs';

const num = 5;
const suri = 'http://aldabaran/test6/s';
const puri = 'http://aldabaran/test6/';

function setUp() {
  const model = ModelFactory.createDefaultModel();
  const subject = [], predicate = [], stmts = [];
  for (let i = 0; i < num; i++) {
    subject[i] = model.createResource(suri + String(i));
    predicate[i] = model.createProperty(puri + String(i), 'p');
  }
  for (let i = 0; i < num; i++) {
    for (let j = 0; j < num; j++) {
      const stmt = model.createStatement(subject[i], predicate[j], model.createTypedLiteral((i * num) + j));
      model.add(stmt);
      model.add(stmt);
      stmts[(i * num) + j] = stmt;
    }
  }
  return { model, subject, predicate, stmts };
}

describeJena('TestIterators', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestIterators.java', (t) => {
  t('testIteratorRemove', () => {
    const { model } = setUp();
    const it = model.listStatements();
    try {
      while (it.hasNext()) { it.next(); it.remove(); }
      assert.equal(model.size(), 0, 'Remove failed');
    } finally {
      it.close();
    }
  });

  t('testListObjects', () => {
    const { model } = setUp();
    let count = 0;
    const iter = model.listObjects();
    while (iter.hasNext()) { iter.nextNode(); count++; }
    assert.equal(count, num * num);
  });

  t('testNamespaceIterator', () => {
    const { model, predicate } = setUp();
    const predf = new Array(num).fill(false);
    const nIter = model.listNameSpaces();
    while (nIter.hasNext()) {
      const ns = nIter.nextNs();
      let found = false;
      for (let i = 0; i < num; i++) {
        if (ns === predicate[i].getNameSpace()) {
          found = true;
          assert.ok(!predf[i], 'Should not have found ' + predicate[i] + ' already.');
          predf[i] = true;
        }
      }
      assert.ok(found, 'Should have found ' + ns);
    }
    for (let i = 0; i < num; i++) assert.ok(predf[i], 'Should have found ' + predicate[i]);
  });

  t('testObjectsOfProperty', () => {
    const { model, predicate } = setUp();
    const object = new Array(num * num).fill(false);
    const iter = model.listObjectsOfProperty(predicate[0]);
    while (iter.hasNext()) object[iter.nextNode().getInt()] = true;
    for (let i = 0; i < num * num; i++) {
      if (i % num === 0) assert.ok(object[i]); else assert.ok(!object[i]);
    }
  });

  t('testObjectsOfPropertyAndValue', () => {
    const { model } = setUp();
    const object = new Array(num).fill(false);
    const subj = model.createResource();
    for (let i = 0; i < num; i++) model.addLiteral(subj, RDF.value, i);
    const iter = model.listObjectsOfProperty(subj, RDF.value);
    while (iter.hasNext()) object[iter.nextNode().getInt()] = true;
    for (let i = 0; i < num; i++) assert.ok(object[i]);
  });

  t('testResourceIterator', () => {
    const { model, subject } = setUp();
    const subjf = new Array(num).fill(false);
    const rIter = model.listSubjects();
    while (rIter.hasNext()) {
      const subj = rIter.nextResource();
      let found = false;
      for (let i = 0; i < num; i++) {
        if (subj.equals(subject[i])) {
          found = true;
          assert.ok(!subjf[i], 'Should not have found ' + subject[i] + ' already.');
          subjf[i] = true;
        }
      }
      assert.ok(found, 'Should have found ' + subj);
    }
    for (let i = 0; i < num; i++) assert.ok(subjf[i], 'Should have found ' + subject[i]);
  });

  t('testStatementIter', () => {
    const { model, stmts } = setUp();
    const numStmts = num * num;
    const stmtf = new Array(numStmts).fill(false);
    assert.equal(model.size(), numStmts);
    const sIter = model.listStatements();
    while (sIter.hasNext()) {
      const stmt = sIter.nextStatement();
      let found = false;
      for (let i = 0; i < numStmts; i++) {
        if (stmt.equals(stmts[i])) {
          found = true;
          assert.ok(!stmtf[i], 'Should not have found ' + stmts[i] + ' already.');
          stmtf[i] = true;
        }
      }
      assert.ok(found, 'Should have found ' + stmt);
    }
    for (let i = 0; i < numStmts; i++) assert.ok(stmtf[i], 'Should have found ' + stmts[i]);
  });
});
