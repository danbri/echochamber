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
//   jena-core/src/test/java/org/apache/jena/datatypes/TestDatatypes.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. XSDDatatype.XSDx are the datatype objects of the xsd:
// IRIs and the org.apache.jena.vocabulary.XSD resources are their IRIs (test
// data, lib/testlib.mjs). Java values become JS values: BigDecimal("0.004") and
// UUID are strings, Double/Float are numbers (a JS number cannot carry the Java
// class: leana refuses to guess, gap 'js-value-literal'). new XSDDouble("double",
// Double.class) is new XSDDouble('double', Number). Java's (XSDDatatype) cast is
// dropped. A Java String hash code is the string here: leana's hashCode() answers
// keys (BaseDatatype.hashCode() is its IRI, '' for null, as Objects.hashCode(null)
// equals "".hashCode()).

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { NodeFactory, BaseDatatype, XSDDouble } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { XSDDatatype, NS, assertEquals } from '../../lib/testlib.mjs';

/** org.apache.jena.vocabulary.XSD (test data): XSD.getURI() and XSD.x.getURI(). */
const XSD = new Proxy({}, {
  get: (_, k) => (k === 'getURI' ? () => NS.xsd : { getURI: () => NS.xsd + String(k) }),
});
const javaHashOf = (s) => s; // String.hashCode(): see the header
const javaClassName = (v) => (typeof v === 'string' ? 'String' : typeof v === 'number' ? 'Number' : v?.constructor?.name);

describeJena('TestDatatypes', 'jena-core/src/test/java/org/apache/jena/datatypes/TestDatatypes.java', (t) => {
  const xsdDateTime = XSDDatatype.XSDdateTime;
  const xsdDateTimeStamp = XSDDatatype.XSDdateTimeStamp;
  const xsdDuration = XSDDatatype.XSDduration;
  const xsdYearMonthDuration = XSDDatatype.XSDyearMonthDuration;
  const xsdDayTimeDuration = XSDDatatype.XSDdayTimeDuration;
  const xsdLanguage = XSDDatatype.XSDlanguage;

  const valid = (dt, s) => assert.ok(dt.isValid(s), 'Expected valid: ' + s);
  const invalid = (dt, s) => assert.ok(!dt.isValid(s), 'Expected invalid: ' + s);
  const checkRegistration1 = (localName, r) => {
    const _xsd = NodeFactory.getType(XSD.getURI() + localName);
    assert.notEqual(_xsd, null);
    assert.equal(_xsd.getURI(), r.getURI());
  };
  const testValueToLex = (value, datatype) => {
    const node = NodeFactory.createLiteralByValue(value, datatype);
    assert.ok(datatype.isValid(node.getLiteralLexicalForm()), 'Not valid lexical form ' + value + ' -> ' + node);
  };
  const testLiteralIsCorrectType = (value, datatype) => {
    const node = NodeFactory.createLiteralByValue(value, datatype);
    assert.equal(node.getLiteralValue().constructor, datatype.getJavaClass(),
      'If passing object of type ' + javaClassName(value) + ' as ' + datatype + ' it needs to be treated as ' + datatype.getJavaClass());
  };

  t('registration_01', () => checkRegistration1('dateTime', XSD.dateTime));
  t('registration_02', () => checkRegistration1('dateTimeStamp', XSD.dateTimeStamp));
  t('registration_03', () => checkRegistration1('duration', XSD.duration));
  t('registration_04', () => checkRegistration1('yearMonthDuration', XSD.yearMonthDuration));
  t('registration_05', () => checkRegistration1('dayTimeDuration', XSD.dayTimeDuration));

  t('dateTimeStamp_01', () => { valid(xsdDateTime, '2015-02-23T15:21:18Z'); valid(xsdDateTimeStamp, '2015-02-23T15:21:18Z'); });
  t('dateTimeStamp_02', () => { valid(xsdDateTime, '2015-02-23T15:21:18'); invalid(xsdDateTimeStamp, '2015-02-23T15:21:18'); });
  t('dateTimeStamp_03', () => { invalid(xsdDateTime, '2015-02-23Z'); invalid(xsdDateTimeStamp, '2015-02-23Z'); });
  t('dateTimeStamp_04', () => { valid(xsdDateTime, '2015-02-23T15:21:18.665Z'); valid(xsdDateTimeStamp, '2015-02-23T15:21:18.665Z'); });
  t('dateTimeStamp_05', () => { valid(xsdDateTime, '2015-02-23T15:21:18.665+00:00'); valid(xsdDateTimeStamp, '2015-02-23T15:21:18.665+00:00'); });
  t('dateTimeStamp_06', () => { invalid(xsdDateTime, '2015-02-23T15:21:18.665+15:00'); invalid(xsdDateTimeStamp, '2015-02-23T15:21:18.665+15:00'); });

  t('yearMonthDuration_01', () => { valid(xsdDuration, 'P1Y'); valid(xsdYearMonthDuration, 'P1Y'); });
  t('yearMonthDuration_02', () => { valid(xsdDuration, '-P1M'); valid(xsdYearMonthDuration, '-P1M'); });
  t('yearMonthDuration_03', () => { valid(xsdYearMonthDuration, 'P9Y10M'); valid(xsdYearMonthDuration, 'P9Y10M'); });
  t('yearMonthDuration_04', () => { valid(xsdDuration, 'P1Y1D'); invalid(xsdYearMonthDuration, 'P1Y1D'); });
  t('yearMonthDuration_05', () => { valid(xsdDuration, 'P1YT1M'); invalid(xsdYearMonthDuration, 'P1YT1M'); });
  t('yearMonthDuration_06', () => { valid(xsdDuration, 'P1D'); invalid(xsdYearMonthDuration, 'P1D'); });

  t('dayTimeDuration_01', () => { valid(xsdDuration, 'PT0S'); valid(xsdDayTimeDuration, 'PT0S'); });
  t('dayTimeDuration_02', () => { invalid(xsdDuration, 'PT'); invalid(xsdDayTimeDuration, 'PT'); });
  t('dayTimeDuration_03', () => { valid(xsdDuration, 'P1D'); valid(xsdDayTimeDuration, 'P1D'); });
  t('dayTimeDuration_04', () => { valid(xsdDuration, 'PT1M'); valid(xsdDayTimeDuration, 'PT1M'); });
  t('dayTimeDuration_05', () => { valid(xsdDuration, 'PT1S'); valid(xsdDayTimeDuration, 'PT1S'); });
  t('dayTimeDuration_06', () => { valid(xsdDuration, 'PT1M'); invalid(xsdDayTimeDuration, 'P1M'); });
  t('dayTimeDuration_07', () => { invalid(xsdDuration, 'P1DT'); invalid(xsdDayTimeDuration, 'P1DT'); });

  t('language_01', () => { valid(xsdLanguage, 'en'); valid(xsdLanguage, 'en-UK'); valid(xsdLanguage, 'es-419'); });
  t('language_02', () => {
    invalid(xsdLanguage, '-');
    invalid(xsdLanguage, 'en-');
    invalid(xsdLanguage, '-en-UK');
    invalid(xsdLanguage, '-es-419-');
  });
  t('language_03', () => {
    valid(xsdLanguage, 'zh-Hans');
    valid(xsdLanguage, 'zh-Hant-HK');
    valid(xsdLanguage, 'de-CH-1901');
    valid(xsdLanguage, 'de-DE-u-co-phonebk');
  });
  t('language_04', () => invalid(xsdLanguage, 'gęś'));

  t('valueToLex_bigdecimal_01', () => testValueToLex('0.004', XSDDatatype.XSDdecimal));
  t('valueToLex_bigdecimal_02', () => testValueToLex('1E21', XSDDatatype.XSDdecimal));
  t('valueToLex_double_01', () => testValueToLex(Number('1E21'), XSDDatatype.XSDdouble));
  t('valueToLex_double_02', () => testValueToLex(Number.POSITIVE_INFINITY, XSDDatatype.XSDdouble));
  t('valueToLex_double_03', () => testValueToLex(Number.NEGATIVE_INFINITY, XSDDatatype.XSDdouble));
  t('valueToLex_float_01', () => testValueToLex(Number('1E21'), XSDDatatype.XSDfloat));
  t('valueToLex_float_02', () => testValueToLex(Number.POSITIVE_INFINITY, XSDDatatype.XSDfloat));
  t('valueToLex_float_03', () => testValueToLex(Number.NEGATIVE_INFINITY, XSDDatatype.XSDfloat));

  t('passAsString_UUID', () => testLiteralIsCorrectType(randomUUID(), XSDDatatype.XSDstring));
  t('passAsString_Integer', () => testLiteralIsCorrectType(5, XSDDatatype.XSDstring));
  t('passAsString_Float', () => testLiteralIsCorrectType(9.99, XSDDatatype.XSDstring));
  t('passAsInteger_String', () => testLiteralIsCorrectType('5', XSDDatatype.XSDint));
  t('passAsFloat_String', () => testLiteralIsCorrectType('5.55', XSDDatatype.XSDfloat));

  const equalityOf = (a, b) => {
    assertEquals(a, a);
    assertEquals(a, b);
    assertEquals(b, a);
    assert.equal(a.hashCode(), b.hashCode());
  };
  t('baseDataTypeEquality', () => equalityOf(new BaseDatatype('urn:x-hp-dt:unknown'), new BaseDatatype('urn:x-hp-dt:unknown')));
  t('baseDataTypeEmptyEquality', () => equalityOf(new BaseDatatype(''), new BaseDatatype('')));
  t('baseDataTypeNullEquality', () => equalityOf(new BaseDatatype(null), new BaseDatatype(null)));
  t('xsdDoubleEquality', () => equalityOf(new XSDDouble('double', Number), XSDDatatype.XSDdouble));

  t('baseDataTypeNotEquals', () => {
    const a = new BaseDatatype('urn:x-hp-dt:unknownA');
    const b = new BaseDatatype('urn:x-hp-dt:unknownB');
    assert.ok(!a.equals(b));
    assert.ok(!b.equals(a));
  });
  t('baseDataTypeNullNotEquals', () => {
    const a = new BaseDatatype('urn:x-hp-dt:unknownA');
    const b = new BaseDatatype(null);
    assert.ok(!a.equals(b));
    assert.ok(!b.equals(a));
  });
  t('hashCodeEqualsUriHashCode', () => {
    const dt = new BaseDatatype('urn:x-hp-dt:unknown');
    assert.equal(dt.hashCode(), javaHashOf(dt.getURI()));
  });
});
