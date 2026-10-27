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
// Derived from Apache Jena (Apache License 2.0) at commit
// a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98:
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateWriter.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. IndentedLineBuffer is a string sink ({write, asString}).

import assert from 'node:assert/strict';
import { UpdateFactory, UpdateWriter } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

function test(updateString) {
  const update1 = UpdateFactory.create(updateString);
  let buf = '';
  const w = { write: (s) => { buf += s; }, asString: () => buf };
  UpdateWriter.output(update1, w);
  const s = w.asString();
  const update2 = UpdateFactory.create(s);
  assert.ok(update1.equalTo(update2));
}

describeJena('TestUpdateWriter', 'jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateWriter.java', (t) => {
  t('updateWrite01', () => test('INSERT DATA {}'));
  t('updateWrite02', () => test('PREFIX : <http://example/> INSERT DATA { <s> :p 123 }'));
  t('updateWrite03', () => test('PREFIX : <http://example/> INSERT DATA { _:a :p 123 , 456 }'));
  t('updateWrite04', () => test('PREFIX : <http://example/> INSERT DATA { _:a :p 123; :q 456 }'));
  t('updateWrite05', () => test('DELETE {<s> <p> ?v } INSERT {<s> <p> _:x } WHERE {?v <p> _:x }'));
  t('updateWrite06', () => test('INSERT {<s> <p> ?v } WHERE {?v <p> 123}'));
  t('updateWrite07', () => test('DELETE {<s> <p> ?v} WHERE {?v <p> 123}'));
  t('updateWrite08', () => test('DELETE WHERE {?v <p> 123}'));
  t('updateWrite09', () => test('DELETE { ?w <q> 56 } INSERT {?v <p> 123} WHERE { _:a ?p _:b }'));
  t('updateWrite10', () => test('INSERT {} WHERE { ?x ?p [ ?a  ?b ] }'));
  t('updateWrite20', () => test('PREFIX : <http://example/> DELETE {} INSERT {} WHERE {}'));
  t('updateWrite21', () => test('PREFIX : <http://example/> DELETE {} INSERT {} USING :G WHERE {}'));
  t('updateWrite22', () => test('PREFIX : <http://example/> DELETE {} INSERT {} USING NAMED :GN WHERE {}'));
  t('updateWrite23', () => test('PREFIX : <http://example/> WITH :ABC DELETE {} INSERT {} WHERE {}'));
});
