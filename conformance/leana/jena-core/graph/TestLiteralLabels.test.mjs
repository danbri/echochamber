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
//   jena-core/src/test/java/org/apache/jena/graph/TestLiteralLabels.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java hashCode is leana's hashCode() key; the anonymous BaseDatatype subclass is a JS subclass of leana's BaseDatatype.

import assert from 'node:assert/strict';
import { BaseDatatype, LiteralLabelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { node } from '../../lib/testlib.mjs';

describeJena('TestLiteralLabels', 'jena-core/src/test/java/org/apache/jena/graph/TestLiteralLabels.java', (t) => {
  t('testHashCode', () => {
    const ll = LiteralLabelFactory.createByValue('test', null);
    ll.hashCode();
  });
  t('testHashCode2', () => {
    const ll1 = LiteralLabelFactory.createByValue('test', null);
    const ll2 = LiteralLabelFactory.createByValue('test', null);
    assert.equal(ll1.hashCode(), ll2.hashCode());
  });
  const hashPair = (spec) => {
    const A = node(spec).getLiteral(), B = node(spec).getLiteral();
    assert.equal(A.hashCode(), B.hashCode());
  };
  t('testHashCodesForBase64Binary_1', () => hashPair("'0123'http://www.w3.org/2001/XMLSchema#base64Binary"));
  t('testHashCodesForBase64Binary_2', () => hashPair("'illgeal'http://www.w3.org/2001/XMLSchema#base64Binary"));
  t('testHashCodesForHexBinary_1', () => hashPair("'0123'http://www.w3.org/2001/XMLSchema#hexBinary"));
  t('testHashCodesForHexBinary_2', () => hashPair("'illegal'http://www.w3.org/2001/XMLSchema#hexBinary"));
  t('testDatatypeIsEqualsNotCalledIfSecondOperandIsNotTyped', () => {
    class Fake extends BaseDatatype {
      isEqual() { assert.fail('RDFDatatype::isEquals should not be called if B has no datatype'); }
    }
    const d = new Fake('eh:/FakeDataType');
    const A = LiteralLabelFactory.createByValue('17', d);
    const B = LiteralLabelFactory.createByValue('17', null);
    assert.ok(!A.sameValueAs(B));
  });
  t('testEquality1', () => {
    const A = LiteralLabelFactory.createTypedLiteral('xyz');
    const B = LiteralLabelFactory.createTypedLiteral('xyz');
    assert.ok(A.equals(B));
    assert.ok(A.sameValueAs(B));
    assert.equal(A.hashCode(), B.hashCode());
  });
  t('testEquality2', () => {
    const A = LiteralLabelFactory.createTypedLiteral('xyz');
    const B = LiteralLabelFactory.createTypedLiteral('XYZ');
    assert.ok(!A.equals(B));
    assert.ok(!A.sameValueAs(B));
  });
  t('testEquality3', () => {
    const A = LiteralLabelFactory.createLang('xyz', 'en-us');
    const B = LiteralLabelFactory.createLang('xyz', 'en-uk');
    assert.ok(!A.equals(B));
    assert.ok(!A.sameValueAs(B));
  });
  t('testEquality4', () => {
    const A = LiteralLabelFactory.createLang('xyz', 'en-UK');
    const B = LiteralLabelFactory.createLang('xyz', 'en-uk');
    assert.ok(!A.equals(B));
    assert.ok(A.sameValueAs(B));
  });
});
