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
//   jena-core/src/test/java/org/apache/jena/graph/TestLiteralLabelSameValueAs.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The two gen(lex, RDFDatatype) / gen(lex, lang) overloads are one function that tests the type of its second argument; XSDDatatype constants are test data.

import assert from 'node:assert/strict';
import { NodeFactory, LiteralLabelFactory, BaseDatatype } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { XSDDatatype } from '../../lib/testlib.mjs';

function testSameValueAs(lit1, lit2, sameValue) {
  assert.equal(lit1.sameValueAs(lit2), sameValue, 'lit1 sameValueAs lit2');
  assert.equal(lit2.sameValueAs(lit1), sameValue, 'lit2 sameValueAs lit1');
  if (!sameValue) {
    assert.ok(!lit1.equals(lit2));
    assert.ok(!lit2.equals(lit1));
  }
}
function gen(lex, dtOrLang) {
  if (dtOrLang === undefined) return LiteralLabelFactory.create(lex, XSDDatatype.XSDstring);
  if (dtOrLang instanceof BaseDatatype) return LiteralLabelFactory.create(lex, dtOrLang);
  return LiteralLabelFactory.createLang(lex, dtOrLang);
}
const dtUnknown = NodeFactory.getType('http://example/unknown');
const X = XSDDatatype;

describeJena('TestLiteralLabelSameValueAs', 'jena-core/src/test/java/org/apache/jena/graph/TestLiteralLabelSameValueAs.java', (t) => {
  t('literalLabel_string_01', () => testSameValueAs(gen('abc'), gen('abc'), true));
  t('literalLabel_string_02', () => testSameValueAs(gen('abc'), gen('abcd'), false));
  t('literalLabel_string_03', () => testSameValueAs(gen('abc'), gen('abc', X.XSDstring), true));
  t('literalLabel_lang_01', () => testSameValueAs(gen('abc', 'en'), gen('abc', 'en-uk'), false));
  t('literalLabel_lang_02', () => testSameValueAs(gen('abc', 'en'), gen('abc', 'EN'), true));
  t('literalLabel_lang_03', () => testSameValueAs(gen('abc', 'en'), gen('abc', 'en-uk'), false));
  t('literalLabel_numeric_01', () => testSameValueAs(gen('01', X.XSDinteger), gen('+1', X.XSDinteger), true));
  t('literalLabel_numeric_02', () => testSameValueAs(gen('01', X.XSDinteger), gen('+1', X.XSDint), true));
  t('literalLabel_numeric_03', () => testSameValueAs(gen('-01', X.XSDinteger), gen('-1', X.XSDdecimal), true));
  t('literalLabel_numeric_04', () => testSameValueAs(gen('-01', X.XSDinteger), gen('-1.0', X.XSDdecimal), true));
  t('literalLabel_numeric_05', () => testSameValueAs(gen('+1', X.XSDdouble), gen('1e0', X.XSDdouble), true));
  t('literalLabel_numeric_06', () => testSameValueAs(gen('-10e-1', X.XSDfloat), gen('-0.1e1', X.XSDfloat), true));
  t('literalLabel_numeric_10', () => testSameValueAs(gen('1', X.XSDinteger), gen('1e0', X.XSDdouble), false));
  t('literalLabel_unknown_01', () => testSameValueAs(gen('abc', dtUnknown), gen('abc', dtUnknown), true));
  t('literalLabel_unknown_02', () => testSameValueAs(gen('abc', dtUnknown), gen('xyz', dtUnknown), false));
  t('literalLabel_unknown_03', () => testSameValueAs(gen('1', X.XSDinteger), gen('1', dtUnknown), false));
  t('literalLabel_bad_01', () => testSameValueAs(gen('abc', X.XSDinteger), gen('abc'), false));
  t('literalLabel_bad_03', () => testSameValueAs(gen('abc', X.XSDinteger), gen('abc', dtUnknown), false));
});
