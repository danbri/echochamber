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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestListSubjects.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Java (byte)/(short)/(int) casts of the long values are plain numbers; long values are BigInts.

import assert from 'node:assert/strict';
import { ModelFactory, JenaSet, PropertyNotFoundException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, RDF, resource } from '../../lib/testlib.mjs';

const subjectPrefix = 'http://aldabaran/test8/s';
const predicatePrefix = 'http://aldabaran/test8/';
const tvBooleans = [false, true];
const tvLongs = [123n, 321n];
const tvChars = ['@', ';'];
const tvFloats = [456.789, 789.456];
const tvDoubles = [123.456, 456.123];
const tvStrings = ['test8 testing string 1', 'test8 testing string 2'];
const langs = ['en', 'fr'];

function setUp() {
  const model = ModelFactory.createDefaultModel();
  const num = 5;
  const objects = [model.createTypedLiteral(tvBooleans[1]), model.createTypedLiteral(tvLongs[1]),
    model.createTypedLiteral(tvChars[1]), model.createTypedLiteral(tvFloats[1]), model.createTypedLiteral(tvDoubles[1]),
    model.createLiteral(tvStrings[1]), model.createLiteral(tvStrings[1], langs[1])];
  const subjects = [], predicates = [];
  for (let i = 0; i < num; i++) {
    subjects[i] = model.createResource(subjectPrefix + i);
    predicates[i] = model.createProperty(predicatePrefix + i, 'p');
  }
  for (let i = 0; i < num; i += 1) model.addLiteral(subjects[i], predicates[4], false);
  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 2; j += 1) {
      model.add(subjects[i], predicates[j], model.createTypedLiteral(tvBooleans[j]));
      model.addLiteral(subjects[i], predicates[j], tvLongs[j]);
      model.addLiteral(subjects[i], predicates[j], tvChars[j]);
      model.add(subjects[i], predicates[j], model.createTypedLiteral(tvFloats[j]));
      model.add(subjects[i], predicates[j], model.createTypedLiteral(tvDoubles[j]));
      model.add(subjects[i], predicates[j], tvStrings[j]);
      model.add(subjects[i], predicates[j], tvStrings[j], langs[j]);
    }
  }
  return { model, subjects, predicates, objects };
}

function assertEquiv(set, iterator) {
  const L = iterator.toList();
  assert.equal(L.length, set.size());
  assertEquals(set, new JenaSet(L));
}
function subjectsTo(prefix, limit) {
  const result = new JenaSet();
  for (let i = 0; i < limit; i += 1) result.add(resource(prefix + i));
  return result;
}

describeJena('TestListSubjects', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestListSubjects.java', (t) => {
  t('testGetRequiredProperty', () => {
    const { model, subjects, predicates } = setUp();
    model.getRequiredProperty(subjects[1], predicates[1]);
    assertThrows(PropertyNotFoundException, () => model.getRequiredProperty(subjects[1], RDF.value), 'should not find absent property');
  });

  t('testListSubjects', () => {
    const { model, predicates } = setUp();
    const sp = subjectPrefix;
    assertEquiv(subjectsTo(sp, 5), model.listResourcesWithProperty(predicates[4]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], tvBooleans[0]));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], tvBooleans[1]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], tvChars[0]));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], tvChars[1]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], tvLongs[0]));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], tvLongs[1]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], tvFloats[0]));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], tvFloats[1]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], tvDoubles[0]));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], tvDoubles[1]));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], Number(tvLongs[0])));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], Number(tvLongs[1])));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], Number(tvLongs[0])));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], Number(tvLongs[1])));
    assertEquiv(subjectsTo(sp, 2), model.listResourcesWithProperty(predicates[0], Number(tvLongs[0])));
    assertEquiv(subjectsTo(sp, 0), model.listResourcesWithProperty(predicates[0], Number(tvLongs[1])));
    assertEquiv(subjectsTo(sp, 2), model.listSubjectsWithProperty(predicates[0], tvStrings[0]));
    assertEquiv(subjectsTo(sp, 0), model.listSubjectsWithProperty(predicates[0], tvStrings[1]));
    assertEquiv(subjectsTo(sp, 2), model.listSubjectsWithProperty(predicates[0], tvStrings[0], langs[0]));
    assertEquiv(subjectsTo(sp, 0), model.listSubjectsWithProperty(predicates[0], tvStrings[1], langs[0]));
    assertEquiv(subjectsTo(sp, 0), model.listSubjectsWithProperty(predicates[0], tvStrings[0], langs[1]));
    assertEquiv(subjectsTo(sp, 0), model.listSubjectsWithProperty(predicates[0], tvStrings[1], langs[1]));
  });
});
