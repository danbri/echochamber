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
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateCompare.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. StrUtils.strjoinNL is a join with '\n'.

import assert from 'node:assert/strict';
import { UpdateFactory, UpdateCompare } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

function test(updateString1, updateString2 = updateString1, isomorphic = true) {
  const update1 = UpdateFactory.create(updateString1);
  const update2 = UpdateFactory.create(updateString2);
  const b = UpdateCompare.isomorphic(update1, update2);
  assert.equal(b, isomorphic, update1.toString());
}

describeJena('TestUpdateCompare', 'jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateCompare.java', (t) => {
  t('updateCompare01', () => test('INSERT DATA {}'));
  t('updateCompare02', () => test('INSERT DATA {<s> <p> <o>}'));
  t('updateCompare03', () => test('INSERT DATA {<s> <p> _:a}', 'INSERT DATA {<s> <p> _:b}'));
  t('updateCompare04', () => test('INSERT DATA {<s> <p> _:a; <p> 123 }', 'INSERT DATA {<s> <p> _:b . <s> <p> 123 }'));
  t('updateCompare05', () => test('INSERT DATA {<s> <p> _:a; <p> 123 }', 'INSERT DATA {<s> <p> 123 . <s> <p> _:b .  }', false));
  t('updateCompare06', () => test('DELETE DATA {}', 'INSERT DATA {}', false));
  t('updateCompare07', () => test('DELETE DATA {<s> <p> <o>}', 'DELETE DATA {<s> <p> <o>}'));
  t('updateCompare08', () => test('DELETE {} INSERT {} WHERE {}'));
  t('updateCompare09', () => test('DELETE {<s> <p> ?v} INSERT {<s> <t> _:a } WHERE { <s> <p> _:a }'));
  t('updateCompare10', () => test('PREFIX : <http://example/> INSERT DATA { :s :p :o }'));
  t('updateCompare11', () => test('PREFIX : <http://example/> INSERT DATA { :s :p :o }',
    'PREFIX ex: <http://example/> INSERT DATA { ex:s ex:p ex:o }', false));
  t('updateCompare20', () => {
    const u1 = ['PREFIX : <http://example/>', 'WITH :g1 INSERT { :s :p :o } WHERE {}'].join('\n');
    test(u1);
  });
  t('updateCompare21', () => {
    const u1 = 'PREFIX : <http://example/> WITH :AAA INSERT { } WHERE {}';
    const u2 = 'PREFIX : <http://example/> WITH :ZZZ INSERT { } WHERE {}';
    test(u1, u2, false);
  });
  t('updateCompare22', () => test('PREFIX : <http://example/> DELETE { } USING :G WHERE {}'));
  t('updateCompare23', () => {
    const u1 = 'PREFIX : <http://example/> DELETE { } USING :G WHERE {}';
    const u2 = 'PREFIX : <http://example/> DELETE { } USING :X WHERE {}';
    test(u1, u2, false);
  });
  t('updateCompare24', () => test('PREFIX : <http://example/> DELETE { } USING NAMED :G WHERE {}'));
  t('updateCompare25', () => {
    const u1 = 'PREFIX : <http://example/> DELETE { } USING NAMED :G WHERE {}';
    const u2 = 'PREFIX : <http://example/> DELETE { } USING :G WHERE {}';
    test(u1, u2, false);
  });
});
