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
//   jena-core/src/test/java/org/apache/jena/graph/TestRDFStringLiterals.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java NullPointerException is a JS TypeError; XSDDatatype/RDF datatype constants are test data.

import assert from 'node:assert/strict';
import { Node, NodeFactory, TextDirection, JenaException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, XSDDatatype, dtLangString, dtDirLangString } from '../../lib/testlib.mjs';

const RTL = TextDirection.RTL;
const noTextDirection = Node.noTextDirection;
const XSDstring = XSDDatatype.XSDstring;

function check(node, lexicalForm, lang, textDir, datatype, indexingValue) {
  assert.equal(node.getLiteralLexicalForm(), lexicalForm, 'Lexical form:');
  assert.equal(node.getLiteralLanguage(), lang, 'Language:');
  if (textDir === null) assert.equal(node.getLiteralBaseDirection(), null, 'Text Direction:');
  else assertEquals(textDir, node.getLiteralBaseDirection(), 'Text Direction:');
  assertEquals(datatype, node.getLiteralDatatype(), 'Datatype:');
  assert.equal(node.getIndexingValue(), indexingValue, 'Indexing:');
}

describeJena('TestRDFStringLiterals', 'jena-core/src/test/java/org/apache/jena/graph/TestRDFStringLiterals.java', (t) => {
  t('string01', () => check(NodeFactory.createLiteralString('abc'), 'abc', '', noTextDirection, XSDstring, 'abc'));
  t('string02', () => check(NodeFactory.createLiteralLang('abc', null), 'abc', '', null, XSDstring, 'abc'));
  t('string03', () => check(NodeFactory.createLiteralDirLang('abc', null, null), 'abc', '', null, XSDstring, 'abc'));
  t('string04', () => check(NodeFactory.createLiteralDirLang('abc', '', ''), 'abc', '', null, XSDstring, 'abc'));
  t('strLang01', () => check(NodeFactory.createLiteralLang('abc', 'en'), 'abc', 'en', null, dtLangString, 'abc@en'));
  t('strLang02', () => check(NodeFactory.createLiteralLang('abc', 'EN'), 'abc', 'en', null, dtLangString, 'abc@en'));
  t('strLang03', () => check(NodeFactory.createLiteralLang('abc', ''), 'abc', '', null, XSDstring, 'abc'));
  t('strLang04', () => check(NodeFactory.createLiteralDirLang('abc', null, null), 'abc', '', null, XSDstring, 'abc'));
  t('strLang05', () => check(NodeFactory.createLiteralDirLang('abc', '', ''), 'abc', '', null, XSDstring, 'abc'));
  t('strLangTag01', () => check(NodeFactory.createLiteralLang('abc', 'en'), 'abc', 'en', null, dtLangString, 'abc@en'));
  t('strLangTag02', () => check(NodeFactory.createLiteralLang('abc', 'EN-GB'), 'abc', 'en-GB', null, dtLangString, 'abc@en-GB'));
  t('strLangTag03', () => check(NodeFactory.createLiteralLang('abc', 'EN-LATN-GB'), 'abc', 'en-Latn-GB', null, dtLangString, 'abc@en-Latn-GB'));
  t('dirLangString01', () => check(NodeFactory.createLiteralDirLang('abc', 'en', 'rtl'), 'abc', 'en', RTL, dtDirLangString, 'abc@en'));
  t('dirLangString02', () => { assertThrows(JenaException, () => NodeFactory.createLiteralDirLang('abc', 'en', 'LTR')); });
  t('dirLangString03', () => { assertThrows(JenaException, () => NodeFactory.createLiteralDirLang('abc', 'en', 'unk')); });
  t('dirLangString04', () => check(NodeFactory.createLiteralDirLang('abc', 'en', ''), 'abc', 'en', null, dtLangString, 'abc@en'));
  t('dirLangString05', () => { assertThrows(JenaException, () => NodeFactory.createLiteralDirLang('abc', 'en', 'x')); });
  t('dirLangString10', () => check(NodeFactory.createLiteralLang('abc', 'en--rtl'), 'abc', 'en', RTL, dtDirLangString, 'abc@en'));
  t('dirLangString_equality', () => {
    const n1 = NodeFactory.createLiteralLang('abc', 'en--ltr');
    const n2 = NodeFactory.createLiteralLang('abc', 'en--ltr');
    assertEquals(n1, n2);
    const n3 = NodeFactory.createLiteralLang('abc', 'en--rtl');
    assert.ok(!n1.equals(n3));
    const n4 = NodeFactory.createLiteralLang('abc', 'en');
    assert.ok(!n1.equals(n4));
  });
  t('dirLangString11', () => { assertThrows(JenaException, () => NodeFactory.createLiteralLang('abc', 'en--LTR')); });
  t('dirLangString12', () => { assertThrows(JenaException, () => NodeFactory.createLiteralLang('abc', 'en--')); });
  t('rdfStringBad01', () => { assertThrows(JenaException, () => NodeFactory.createLiteralDirLang('abc', null, TextDirection.LTR)); });
  t('rdfStringBad02', () => { assertThrows(JenaException, () => NodeFactory.createLiteralDirLang('abc', '', TextDirection.LTR)); });
  t('rdfStringBad03', () => { assertThrows(TypeError, () => NodeFactory.createLiteralString(null)); });
  t('rdfStringBad04', () => { assertThrows(TypeError, () => NodeFactory.createLiteralLang(null, 'en')); });
  t('rdfStringBad05', () => { assertThrows(TypeError, () => NodeFactory.createLiteralDirLang(null, 'en', TextDirection.LTR)); });
});
