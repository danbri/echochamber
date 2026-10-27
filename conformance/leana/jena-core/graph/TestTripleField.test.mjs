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
//   jena-core/src/test/java/org/apache/jena/graph/TestTripleField.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java Predicate.test is the returned function's test().

import assert from 'node:assert/strict';
import { Triple } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { node, triple, assertEquals } from '../../lib/testlib.mjs';

const Field = Triple.Field;

describeJena('TestTripleField', 'jena-core/src/test/java/org/apache/jena/graph/TestTripleField.java', (t) => {
  t('testFieldsExistAndAreTyped', () => {
    assert.ok(Field.fieldSubject instanceof Triple.Field);
    assert.ok(Field.fieldObject instanceof Triple.Field);
    assert.ok(Field.fieldPredicate instanceof Triple.Field);
  });
  t('testGetSubject', () => assertEquals(node('s'), Field.fieldSubject.getField(triple('s p o'))));
  t('testGetObject', () => assertEquals(node('o'), Field.fieldObject.getField(triple('s p o'))));
  t('testGetPredicate', () => assertEquals(node('p'), Field.fieldPredicate.getField(triple('s p o'))));
  t('testFilterSubject', () => {
    assert.ok(Field.fieldSubject.filterOn(node('a')).test(triple('a P b')));
    assert.ok(!Field.fieldSubject.filterOn(node('x')).test(triple('a P b')));
  });
  t('testFilterObject', () => {
    assert.ok(Field.fieldObject.filterOn(node('b')).test(triple('a P b')));
    assert.ok(!Field.fieldObject.filterOn(node('c')).test(triple('a P b')));
  });
  t('testFilterPredicate', () => {
    assert.ok(Field.fieldPredicate.filterOn(node('P')).test(triple('a P b')));
    assert.ok(!Field.fieldPredicate.filterOn(node('Q')).test(triple('a P b')));
  });
  t('testFilterOnConcreteSubject', () => {
    assert.ok(Field.fieldSubject.filterOnConcrete(node('a')).test(triple('a P b')));
    assert.ok(!Field.fieldSubject.filterOnConcrete(node('x')).test(triple('a P b')));
  });
  t('testFilterOnConcreteObject', () => {
    assert.ok(Field.fieldObject.filterOnConcrete(node('b')).test(triple('a P b')));
    assert.ok(!Field.fieldObject.filterOnConcrete(node('c')).test(triple('a P b')));
  });
  t('testFilterOnConcretePredicate', () => {
    assert.ok(Field.fieldPredicate.filterOnConcrete(node('P')).test(triple('a P b')));
    assert.ok(!Field.fieldPredicate.filterOnConcrete(node('Q')).test(triple('a P b')));
  });
  t('testFilterByTriple', () => {
    assert.ok(Field.fieldSubject.filterOn(triple('s P o')).test(triple('s Q p')));
    assert.ok(!Field.fieldSubject.filterOn(triple('s P o')).test(triple('x Q p')));
  });
});
