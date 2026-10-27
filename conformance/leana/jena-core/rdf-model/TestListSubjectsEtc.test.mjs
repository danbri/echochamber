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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestListSubjectsEtc.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { UnsupportedOperationException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, modelWithStatements, modelAdd, resourceSet, assertIsoModels } from '../../lib/testlib.mjs';

describeJena('TestListSubjectsEtc', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestListSubjectsEtc.java', (t) => {
  t('testListObjectsNoRemove', () => {
    const m = modelWithStatements('a P b; b Q c; c R a');
    const it = m.listObjects();
    it.next();
    assertThrows(UnsupportedOperationException, () => it.remove(), 'listObjects should not support .remove()');
  });

  t('testListSubjectsNoRemove', () => {
    const m = modelWithStatements('a P b; b Q c; c R a');
    const it = m.listSubjects();
    it.next();
    assertThrows(UnsupportedOperationException, () => it.remove(), 'listSubjects should not support .remove()');
  });

  t('testListSubjectsWorksAfterRemoveProperties', () => {
    const m = modelWithStatements('p1 before terminal; p2 before terminal');
    m.createResource('eh:/p1').removeProperties();
    assertIsoModels(modelWithStatements('p2 before terminal'), m);
    assertEquals(resourceSet('p2'), m.listSubjects().toSet());
  });

  t('testListSubjectsWorksAfterRemovePropertiesWIthLots', () => {
    const m = modelWithStatements('p2 before terminal');
    for (let i = 0; i < 100; i += 1) modelAdd(m, 'p1 hasValue ' + i);
    m.createResource('eh:/p1').removeProperties();
    assertIsoModels(modelWithStatements('p2 before terminal'), m);
    assertEquals(resourceSet('p2'), m.listSubjects().toSet());
  });
});
