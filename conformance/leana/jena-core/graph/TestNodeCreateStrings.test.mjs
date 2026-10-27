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
//   jena-core/src/test/java/org/apache/jena/graph/TestNodeCreateStrings.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java (String)null is JS null.

import assert from 'node:assert/strict';
import { NodeFactory, Util } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

function check(n, simple, lang, dirLang, hasLang, hasDir) {
  assert.equal(Util.isSimpleString(n), simple);
  assert.equal(Util.isLangString(n), lang);
  assert.equal(Util.isDirLangString(n), dirLang);
  assert.equal(Util.hasLang(n), hasLang);
  assert.equal(Util.hasDirection(n), hasDir);
}

describeJena('TestNodeCreateStrings', 'jena-core/src/test/java/org/apache/jena/graph/TestNodeCreateStrings.java', (t) => {
  t('testIsSimpleString1', () => check(NodeFactory.createLiteralString('abc'), true, false, false, false, false));
  t('testIsSimpleString2', () => check(NodeFactory.createLiteralLang('abc', ''), true, false, false, false, false));
  t('testIsSimpleString3', () => check(NodeFactory.createLiteralDirLang('abc', '', null), true, false, false, false, false));
  t('testIsLangString1', () => check(NodeFactory.createLiteralLang('abc', 'en-GB'), false, true, false, true, false));
  t('testIsLangString2', () => check(NodeFactory.createLiteralDirLang('abc', 'en-GB', null), false, true, false, true, false));
  t('testIsDirLangString1', () => check(NodeFactory.createLiteralDirLang('abc', 'en-GB', 'ltr'), false, false, true, true, true));
});
