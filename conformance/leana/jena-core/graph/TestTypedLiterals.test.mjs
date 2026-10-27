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
//   jena-core/src/test/java/org/apache/jena/graph/TestTypedLiterals.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java values become JS values (int/double: number, BigInteger: BigInt, BigDecimal: a test-local value object, byte[]: Uint8Array, Calendar/Date: Date); Java class checks become constructor checks; assertSame is ===; XSDDatatype and RDF constants are test data; RationalType/Rational are JS classes over leana's BaseDatatype; JenaParameters is leana's.

import assert from 'node:assert/strict';
import {
  Node, NodeFactory, GraphMemFactory, ModelFactory, TypeMapper, BaseDatatype, LiteralLabelFactory,
  JenaParameters, XSDDateTime, JenaException, StringReader,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, XSDDatatype, dtLangString, RDF } from '../../lib/testlib.mjs';

const X = XSDDatatype;
/** Stand-in for java.math.BigDecimal: a value object (not a string), so leana must not guess its datatype. */
class BigDecimal { constructor(s) { this.s = s; } toString() { return this.s; } }
/** Java Calendar/GregorianCalendar in GMT: a JS Date. Months are 0-based as in Java. */
const gmt = (y, mo, d, h = 0, mi = 0, s = 0, ms = 0) => new Date(Date.UTC(y, mo, d, h, mi, s, ms));
/** Java DatatypeFormatException: leana has none of its own; the engine would decide. */
const isDatatypeFormatException = (e) => e instanceof JenaException && e.name === 'DatatypeFormatException';

class Rational {
  constructor(n, d) { this.numerator = n; this.denominator = d; }
  getNumerator() { return this.numerator; }
  getDenominator() { return this.denominator; }
  equals(o) { return o instanceof Rational && o.numerator === this.numerator && o.denominator === this.denominator; }
  toString() { return `rational[${this.numerator}/${this.denominator}]`; }
}
class RationalType extends BaseDatatype {
  unparse(value) { return value.getNumerator() + '/' + value.getDenominator(); }
  parse(lex) {
    const i = lex.indexOf('/');
    if (i === -1) throw new JenaException('DatatypeFormatException: ' + lex);
    return new Rational(parseInt(lex.substring(0, i), 10), parseInt(lex.substring(i + 1), 10));
  }
  isEqual(a, b) { return a.getDatatype() === b.getDatatype() && a.getValue().equals(b.getValue()); }
}
RationalType.theTypeURI = 'urn:example:dt-rational';
RationalType.theRationalType = new RationalType(RationalType.theTypeURI);

describeJena('TestTypedLiterals', 'jena-core/src/test/java/org/apache/jena/graph/TestTypedLiterals.java', (t) => {
  const m = ModelFactory.createDefaultModel();

  const assertDiffer = (title, x, y) => assert.ok(!x.sameValueAs(y), title);
  const assertSameValueAs = (title, x, y) => assert.ok(x.sameValueAs(y), title);
  const assertFloatEquals = (title, x, y) => assert.ok(Math.abs(x - y) < 0.001, title);
  function checkIllegalLiteral(lex, dtype) {
    try {
      const l = m.createTypedLiteral(lex, dtype);
      l.getValue();
      assert.fail(`Failed to catch '${lex}' as an illegal ${dtype}`);
    } catch (e) {
      if (!isDatatypeFormatException(e)) throw e;
    }
  }
  function checkLegalLiteral(lex, dtype, jtype, value) {
    const l = m.createTypedLiteral(lex, dtype);
    assert.equal(l.getValue().constructor, jtype);
    assertEquals(value, l.getValue());
    assertEquals(l.getDatatype(), dtype);
  }
  function checkSerialization(lex, dtype) {
    const l = m.createTypedLiteral(lex, dtype);
    assert.equal(l.getValue().toString(), lex);
  }

  t('testUnknownDatatype', () => {
    const typeURI = 'urn:jena-dt:unknown', typeURI2 = 'urn:jena-dt:unknown2';
    const originalFlag = JenaParameters.enableSilentAcceptanceOfUnknownDatatypes;
    JenaParameters.enableSilentAcceptanceOfUnknownDatatypes = true;
    const l1 = m.createTypedLiteral('foo', typeURI);
    const l3 = m.createTypedLiteral('15', typeURI);
    const l5 = m.createTypedLiteral('foo', typeURI2);
    const l6 = m.createLiteral('foo', 'lang');
    JenaParameters.enableSilentAcceptanceOfUnknownDatatypes = originalFlag;
    assert.ok(l1 && l3 && l5);
    assertDiffer('datatype sensitive', l1, l5);
    assertDiffer('value sensitive', l1, l3);
    assertDiffer('typed and plain differ', l1, l6);
    try { l3.getInt(); assert.fail('Allowed int conversion'); } catch (e) { if (!isDatatypeFormatException(e)) throw e; }
    // Jena: l1.getValue() equals new BaseDatatype.TypedValue("foo", typeURI).
    const v = l1.getValue();
    assert.equal(v.lexicalValue, 'foo');
    assert.equal(v.datatypeURI, typeURI);
    JenaParameters.enableSilentAcceptanceOfUnknownDatatypes = false;
    let foundException = false;
    try { m.createTypedLiteral('food', typeURI + '3'); } catch (e) { if (isDatatypeFormatException(e)) foundException = true; else throw e; }
    JenaParameters.enableSilentAcceptanceOfUnknownDatatypes = originalFlag;
    assert.ok(foundException, 'Detected unknown datatype');
    const foo = new Date(123456); // java.sql.Date
    const ll = LiteralLabelFactory.createTypedLiteral(foo);
    assert.equal(ll.getLexicalForm(), foo.toString());
  });

  t('testUserDef', () => {
    const rtype = RationalType.theRationalType;
    TypeMapper.getInstance().registerDatatype(rtype);
    const l1 = m.createTypedLiteral('3/5', rtype);
    const l3 = m.createTypedLiteral('7/5', rtype);
    assert.ok(l1 && l3);
    assertDiffer('values should be tested!', l1, l3);
    assert.ok(l1.getDatatype() === rtype, 'Datatype incorrect');
    assert.equal(l1.getDatatypeURI(), RationalType.theTypeURI, 'Datatype uri incorrect');
    const val = l1.getValue();
    assert.ok(val instanceof Rational, 'Value space check');
    assert.ok(val.getNumerator() === 3 && val.getDenominator() === 5, 'Value check');
    try { l1.getInt(); assert.fail('Allowed int conversion'); } catch (e) { if (!isDatatypeFormatException(e)) throw e; }
  });

  t('testRDFLangString_1', () => {
    const dt = TypeMapper.getInstance().getTypeByName(RDF.langString.getURI());
    assertEquals(dtLangString, dt);
    assert.ok(dtLangString === dt);
  });

  t('testRDFLangString_2', () => {
    const ll1 = m.createTypedLiteral('abc', dtLangString);
    assert.equal(ll1.getLanguage(), '');
    const ll2 = m.createLiteral('xyz', 'en');
    assert.ok(ll1.getDatatype() === ll2.getDatatype());
  });

  t('testXSDbasics', () => {
    const xsdIntURI = 'http://www.w3.org/2001/XMLSchema#int';
    let l1 = m.createTypedLiteral(42); // default map: Java Integer -> xsd:int
    let l2 = m.createTypedLiteral('42', X.XSDint);
    const l4 = m.createTypedLiteral('63');
    assertSameValueAs('Default map failed', l1, l2);
    assertEquals(42, l1.getValue(), 'Value wrong');
    assert.equal(l1.getInt(), 42, 'Value accessor problem');
    assert.equal(l2.getDatatypeURI(), xsdIntURI, 'wrong type name');
    assertEquals(l2.getDatatype(), X.XSDint, 'wrong type');
    assertDiffer('Not value sensitive', l1, l4);
    checkIllegalLiteral('zap', X.XSDint);
    checkIllegalLiteral('42.1', X.XSDint);
    const l5 = m.createTypedLiteral('42', X.XSDnonNegativeInteger);
    assertSameValueAs('type coercion', l2, l5);
    l1 = m.createTypedLiteral(42.42);
    l2 = m.createTypedLiteral('42.42', X.XSDfloat);
    const l3 = m.createTypedLiteral('42.42', X.XSDdouble);
    assertFloatEquals('value wrong', l1.getValue(), 42.42);
    assertFloatEquals('value wrong', l2.getValue(), 42.42);
    assertFloatEquals('Value accessor problem', l1.getFloat(), 42.42);
    assertEquals(l2.getDatatype(), X.XSDfloat, 'wrong type');
    assertSameValueAs('equality fn', l1, l3);
    checkLegalLiteral('12345', X.XSDlong, Number, 12345);
    checkLegalLiteral('-12345', X.XSDlong, Number, -12345);
    checkIllegalLiteral('2.3', X.XSDlong);
    checkLegalLiteral('1234', X.XSDshort, Number, 1234);
    checkLegalLiteral('-1234', X.XSDshort, Number, -1234);
    checkLegalLiteral('32767', X.XSDshort, Number, 32767);
    checkLegalLiteral('-32768', X.XSDshort, Number, -32768);
    checkIllegalLiteral('32769', X.XSDshort);
    checkIllegalLiteral('2.3', X.XSDshort);
    checkLegalLiteral('42', X.XSDbyte, Number, 42);
    checkLegalLiteral('-42', X.XSDbyte, Number, -42);
    checkLegalLiteral('127', X.XSDbyte, Number, 127);
    checkLegalLiteral('-128', X.XSDbyte, Number, -128);
    checkIllegalLiteral('32769', X.XSDbyte);
    checkIllegalLiteral('128', X.XSDbyte);
    checkIllegalLiteral('2.3', X.XSDbyte);
    checkLegalLiteral('12345', X.XSDunsignedLong, Number, 12345);
    checkLegalLiteral('+12345', X.XSDunsignedLong, Number, 12345);
    checkLegalLiteral('9223372036854775808', X.XSDunsignedLong, BigInt, 9223372036854775808n);
    checkIllegalLiteral('-12345', X.XSDunsignedLong);
    checkLegalLiteral('12345', X.XSDunsignedInt, Number, 12345);
    checkLegalLiteral('2147483648', X.XSDunsignedInt, Number, 2147483648);
    checkIllegalLiteral('-12345', X.XSDunsignedInt);
    checkLegalLiteral('1234', X.XSDunsignedShort, Number, 1234);
    checkLegalLiteral('32679', X.XSDunsignedShort, Number, 32679);
    checkIllegalLiteral('-12345', X.XSDunsignedShort);
    checkLegalLiteral('123', X.XSDunsignedByte, Number, 123);
    checkLegalLiteral('129', X.XSDunsignedByte, Number, 129);
    checkIllegalLiteral('-123', X.XSDunsignedByte);
    checkLegalLiteral('12345', X.XSDinteger, Number, 12345);
    checkLegalLiteral('0', X.XSDinteger, Number, 0);
    checkLegalLiteral('-12345', X.XSDinteger, Number, -12345);
    checkLegalLiteral('9223372036854775808', X.XSDinteger, BigInt, 9223372036854775808n);
    checkLegalLiteral('12345', X.XSDpositiveInteger, Number, 12345);
    checkIllegalLiteral('0', X.XSDpositiveInteger);
    checkIllegalLiteral('-12345', X.XSDpositiveInteger);
    checkLegalLiteral('9223372036854775808', X.XSDpositiveInteger, BigInt, 9223372036854775808n);
    checkLegalLiteral('12345', X.XSDnonNegativeInteger, Number, 12345);
    checkLegalLiteral('0', X.XSDnonNegativeInteger, Number, 0);
    checkIllegalLiteral('-12345', X.XSDnonNegativeInteger);
    checkLegalLiteral('9223372036854775808', X.XSDnonNegativeInteger, BigInt, 9223372036854775808n);
    checkLegalLiteral('-12345', X.XSDnegativeInteger, Number, -12345);
    checkIllegalLiteral('0', X.XSDnegativeInteger);
    checkIllegalLiteral('12345', X.XSDnegativeInteger);
    checkLegalLiteral('-9223372036854775808', X.XSDnegativeInteger, BigInt, -9223372036854775808n);
    checkLegalLiteral('-12345', X.XSDnonPositiveInteger, Number, -12345);
    checkLegalLiteral('0', X.XSDnonPositiveInteger, Number, 0);
    checkIllegalLiteral('12345', X.XSDnonPositiveInteger);
    checkLegalLiteral('-9223372036854775808', X.XSDnonPositiveInteger, BigInt, -9223372036854775808n);
    checkLegalLiteral('12345', X.XSDdecimal, Number, 12345);
    checkLegalLiteral('0.0', X.XSDdecimal, Number, 0);
    checkLegalLiteral('42.45', X.XSDdecimal, BigDecimal, new BigDecimal('42.45'));
    checkLegalLiteral('9223372036854775808.1234', X.XSDdecimal, BigDecimal, new BigDecimal('9223372036854775808.1234'));
    checkLegalLiteral('123.4', X.XSDdecimal, BigDecimal, new BigDecimal('123.4'));
    checkIllegalLiteral('123,4', X.XSDdecimal);
    checkLegalLiteral('true', X.XSDboolean, Boolean, true);
    checkLegalLiteral('false', X.XSDboolean, Boolean, false);
    l1 = m.createTypedLiteral(true);
    assertEquals(X.XSDboolean, l1.getDatatype(), 'boolean mapping');
    checkLegalLiteral('hello world', X.XSDstring, String, 'hello world');
    l1 = m.createTypedLiteral('foo bar');
    assertEquals(X.XSDstring, l1.getDatatype(), 'string mapping');
  });

  t('testMiscEquality', () => {
    let l1 = m.createTypedLiteral('10', 'http://www.w3.org/2001/XMLSchema#integer');
    let l3 = m.createTypedLiteral('010', 'http://www.w3.org/2001/XMLSchema#integer');
    assertSameValueAs('Int lex form', l1, l3);
    l1 = m.createTypedLiteral('1', X.XSDint);
    l3 = m.createTypedLiteral('1', X.XSDnonNegativeInteger);
    assertSameValueAs('numeric comparisons', l1, l3);
  });

  t('testOverloads', () => {
    const old = JenaParameters.enableEagerLiteralValidation;
    try {
      JenaParameters.enableEagerLiteralValidation = true;
      let test1 = false;
      try { m.createTypedLiteral('foo', 'http://www.w3.org/2001/XMLSchema#integer'); } catch (e) { if (isDatatypeFormatException(e)) test1 = true; else throw e; }
      assert.ok(test1, 'detected illegal string, direct');
      // Jena test2: createTypedLiteral((Object)"foo", xsd:integer) is the same call in JavaScript.
      const lc = m.createTypedLiteral(gmt(1999, 4, 30, 15, 9, 32));
      assertEquals(m.createTypedLiteral('1999-05-30T15:09:32Z', X.XSDdateTime), lc, 'calendar overloading test');
    } finally {
      JenaParameters.enableEagerLiteralValidation = old;
    }
  });

  t('testPlainSameValueAs', () => {
    const lString = m.createTypedLiteral('10', X.XSDstring);
    const lPlain = m.createTypedLiteral('10', null); // (RDFDatatype) null
    const lPlain3 = m.createTypedLiteral('10', null); // (String) null
    const lPlain2 = m.createLiteral('10');
    const lInt = m.createTypedLiteral('10', X.XSDint);
    assertSameValueAs('Null type = plain literal', lPlain, lPlain2);
    assertSameValueAs('Null type = plain literal', lPlain, lPlain3);
    assertSameValueAs('Null type = plain literal', lPlain2, lPlain3);
    assertEquals(X.XSDstring, lPlain3.getDatatype(), 'null type mean xsd:string');
    assertDiffer('String != int', lString, lInt);
    assertDiffer('Plain != int', lPlain, lInt);
    assertDiffer('Plain != int', lPlain2, lInt);
    assertSameValueAs('String != plain??', lString, lPlain);
    assertSameValueAs('String != plain??', lString, lPlain2);
  });

  t('testNumberSameValueAs', () => {
    const lDouble = m.createTypedLiteral('5', X.XSDdouble);
    const lDouble2 = m.createTypedLiteral('5.5', X.XSDdouble);
    const lDouble3 = m.createTypedLiteral('5.5', X.XSDdouble);
    const lDouble4 = m.createTypedLiteral('5.6', X.XSDdouble);
    const lFloat = m.createTypedLiteral('5', X.XSDfloat);
    const lint = m.createTypedLiteral('5', X.XSDint);
    const linteger = m.createTypedLiteral('5', X.XSDinteger);
    const lbyte = m.createTypedLiteral('5', X.XSDbyte);
    assertSameValueAs('integer subclasses equal', lint, linteger);
    assertSameValueAs('integer subclasses equal', lint, lbyte);
    assertSameValueAs('integer subclasses equal', linteger, lbyte);
    assertSameValueAs('double equality', lDouble2, lDouble3);
    assertDiffer('float/double/int distinct', lDouble, lDouble2);
    assertDiffer('float/double/int distinct', lDouble, lFloat);
    assertDiffer('float/double/int distinct', lDouble, lint);
    assertDiffer('float/double/int distinct', lDouble, linteger);
    assertDiffer('float/double/int distinct', lDouble2, lint);
    assertDiffer('float/double/int distinct', lDouble2, lbyte);
    assertDiffer('float/double/int distinct', lint, lDouble);
    assertDiffer('float/double/int distinct', lbyte, lDouble);
    assertDiffer('float/double/int distinct', lint, lDouble2);
    assertDiffer('float/double/int distinct', lbyte, lDouble2);
    assertDiffer('double inequality', lDouble3, lDouble4);
    assertDiffer('double inequality', lDouble2, lDouble);
    const lDecimal = m.createTypedLiteral('5.5', X.XSDdecimal);
    const lDecimal2 = m.createTypedLiteral('5.6', X.XSDdecimal);
    assertDiffer('decimal inequality', lDecimal, lDecimal2);
  });

  t('testBigNums', () => {
    const l1 = m.createTypedLiteral('12345678901234567890', X.XSDinteger);
    const l2 = m.createTypedLiteral('12345678901234567891', X.XSDinteger);
    assertDiffer('Big integer equality', l1, l2);
    const lb1 = m.createTypedLiteral(12345678901234567890n, X.XSDinteger);
    assertSameValueAs('big integer creation equality', l1, lb1);
    const ld1 = m.createTypedLiteral(new BigDecimal('12345678901234567890.00'), X.XSDdecimal);
    const ld1b = m.createTypedLiteral(new BigDecimal('12345678901234567890.0'), X.XSDdecimal);
    const ld2 = m.createTypedLiteral(new BigDecimal('12345678901234567890.1'), X.XSDdecimal);
    assertSameValueAs('big decimal equality check', ld1, ld1b);
    assertSameValueAs('big decimal equality check', ld1, lb1);
    assertDiffer('Decimal equality', ld1, ld2);
    const ldF = m.createTypedLiteral(new BigDecimal('12345678901234567890.1'), X.XSDdecimal);
    const ldFb = m.createTypedLiteral(new BigDecimal('12345678901234567890.10'), X.XSDdecimal);
    const ldF2 = m.createTypedLiteral(new BigDecimal('12345678901234567890.2'), X.XSDdecimal);
    assertSameValueAs('big decimal equality check', ldF, ldFb);
    assertDiffer('Decimal equality', ldF, ldF2);
  });

  t('testDecimalFind', () => {
    const graph = GraphMemFactory.createDefaultGraphSameValue();
    const dt = X.XSDdecimal;
    const ns = NodeFactory.createURI('x'), np = NodeFactory.createURI('p');
    const nx1 = NodeFactory.createLiteralDT('0.50', dt);
    const nx2 = NodeFactory.createLiteralDT('0.500', dt);
    graph.add(ns, np, nx1);
    assert.ok(graph.find(Node.ANY, Node.ANY, nx2).hasNext());
    assert.ok(graph.find(ns, np, nx2).hasNext());
  });

  t('testDecimalCanonicalize', () => {
    const check = (value, expected, expectedKind) => {
      const normalized = X.XSDdecimal.cannonicalise(new BigDecimal(value));
      assert.equal(normalized.toString(), expected);
      assert.equal(normalized.constructor.name, expectedKind);
    };
    check('0.500', '0.5', 'BigDecimal');
    check('0.50', '0.5', 'BigDecimal');
    check('0.5', '0.5', 'BigDecimal');
    check('0.0', '0', 'Number');
    check('5.0', '5', 'Number');
    check('500.0', '500', 'Number');
    check('5.00100', '5.001', 'BigDecimal');
  });

  t('testDateTime_1', () => {
    const l1 = m.createTypedLiteral('P1Y2M3DT5H6M7.50S', X.XSDduration);
    assertEquals(X.XSDduration, l1.getDatatype(), 'duration data type');
    const v = l1.getValue();
    assert.equal(v.getYears(), 1);
    assert.equal(v.getMonths(), 2);
    assert.equal(v.getDays(), 3);
    assert.equal(v.getHours(), 5);
    assert.equal(v.getMinutes(), 6);
    assert.equal(v.getFullSeconds(), 7);
    assertFloatEquals('duration value', 18367.5, v.getTimePart());
    assert.equal(v.toString(), 'P1Y2M3DT5H6M7.5S', 'serialization');
    assert.ok(l1.sameValueAs(m.createTypedLiteral('P1Y2M3DT5H6M7.5S', X.XSDduration)), 'equality test');
    assert.ok(l1 !== m.createTypedLiteral('P1Y2M2DT5H6M7.5S', X.XSDduration), 'inequality test');
  });

  t('testDateTime_2', () => {
    const l1 = m.createTypedLiteral('P1Y2M3DT5H0M', X.XSDduration);
    assert.equal(l1.getValue().toString(), 'P1Y2M3DT5H', 'serialization');
  });

  t('testDateTime_3', () => {
    const l1 = m.createTypedLiteral('P1Y', X.XSDduration);
    assertEquals(X.XSDduration, l1.getDatatype(), 'duration data type');
    assert.equal(l1.getValue().getYears(), 1, 'duration value');
    assert.equal(l1.getValue().toString(), 'P1Y', 'serialization');
    assert.ok(l1.sameValueAs(m.createTypedLiteral('P1Y', X.XSDduration)), 'equality test');
    assert.ok(l1 !== m.createTypedLiteral('P1Y', X.XSDduration), 'inequality test');
  });

  t('testDateTime_4', () => {
    const l1 = m.createTypedLiteral('-P120D', X.XSDduration);
    const l2 = m.createTypedLiteral(l1.getValue());
    assert.equal(l2.getLexicalForm(), '-P120D');
  });

  t('testDateTime_5', () => {
    const d1 = m.createTypedLiteral('PT1H1M1S', X.XSDduration);
    const d2 = m.createTypedLiteral('PT1H1M1.1S', X.XSDduration);
    assert.ok(!d1.sameValueAs(d2), 'duration compare');
    assert.equal(d2.getValue().compare(d1.getValue()), 1, 'duration compare order');
  });

  t('testDateTime_6', () => {
    const l1 = m.createTypedLiteral('1999-05-31T02:09:32Z', X.XSDdateTime);
    const xdt = l1.getValue();
    assertEquals(X.XSDdateTime, l1.getDatatype(), 'dateTime data type');
    assert.equal(xdt.getYears(), 1999);
    assert.equal(xdt.getMonths(), 5);
    assert.equal(xdt.getDays(), 31);
    assert.equal(xdt.getHours(), 2);
    assert.equal(xdt.getMinutes(), 9);
    assert.equal(xdt.getFullSeconds(), 32);
    assert.equal(xdt.toString(), '1999-05-31T02:09:32Z', 'serialization');
    assert.equal(xdt.asCalendar().getTime(), gmt(1999, 4, 31, 2, 9, 32).getTime(), 'calendar value');
    assertEquals(l1, m.createTypedLiteral('1999-05-31T02:09:32Z', X.XSDdateTime), 'equality test');
    assert.ok(l1 !== m.createTypedLiteral('1999-04-31T02:09:32Z', X.XSDdateTime), 'inequality test');
    const lc = m.createTypedLiteral(gmt(1999, 4, 30, 15, 9, 32));
    assertEquals(m.createTypedLiteral('1999-05-30T15:09:32Z', X.XSDdateTime), lc, 'calendar 24 hour test');
  });

  t('testDateTime_7', async () => {
    const testCal3 = gmt(1999, 0, 30, 15, 9, 32);
    const lc = m.createTypedLiteral(testCal3);
    assert.equal(lc.getLexicalForm(), '1999-01-30T15:09:32Z');
    const urib = 'rdf://test.com#', uri1 = urib + '1', urip = urib + 'prop';
    const testN3 = `<${uri1}> <${urip}> "${lc.getLexicalForm()}"^^<${lc.getDatatypeURI()}> .`;
    await m.read(new StringReader(testN3), urib, 'N-TRIPLES');
    assert.ok(m.contains(m.getResource(uri1), m.getProperty(urip)));
    const returned = m.getResource(uri1).getProperty(m.getProperty(urip)).getLiteral().getValue();
    assert.equal(returned.asCalendar().getTime(), testCal3.getTime(), 'deserialized calendar value');
  });

  t('testDateTime_8', () => {
    const doDateTimeTest = (cal, lex, time) => {
      const lc4 = m.createTypedLiteral(cal);
      assert.equal(lc4.getValue().toString(), lex, 'serialization');
      assertEquals(m.createTypedLiteral(lex, X.XSDdateTime), lc4, 'calendar ms test');
      const dt4 = lc4.getValue();
      assert.ok(Math.abs(dt4.getSeconds() - time) < 0.0001, 'Fraction time check');
      assert.equal(dt4.asCalendar().getTime(), cal.getTime());
    };
    doDateTimeTest(gmt(1999, 4, 30, 15, 9, 32, 25), '1999-05-30T15:09:32.025Z', 32.025);
    doDateTimeTest(gmt(1999, 4, 30, 15, 9, 32, 250), '1999-05-30T15:09:32.25Z', 32.25);
    doDateTimeTest(gmt(1999, 4, 30, 15, 9, 32, 2), '1999-05-30T15:09:32.002Z', 32.002);
  });

  t('testDateTime_9', () => {
    for (const y of [0, 7, 77, 777, 7777]) {
      const calM1 = new Date(); calM1.setFullYear(y, 10, 23);
      const xdtM = new XSDDateTime(calM1);
      const ll = LiteralLabelFactory.createByValue(xdtM, X.XSDdateTime);
      assert.ok(ll.isWellFormed(), 'Pre-1000 calendar value');
      assert.match(ll.getLexicalForm(), /^[0-9]{4}-.*/, 'Pre-1000 calendar value');
    }
    let ok = false;
    const old = JenaParameters.enableEagerLiteralValidation;
    try {
      JenaParameters.enableEagerLiteralValidation = true;
      m.createTypedLiteral(new Date(12345656), X.XSDdateTime);
    } catch (e) { if (isDatatypeFormatException(e)) ok = true; else throw e; } finally { JenaParameters.enableEagerLiteralValidation = old; }
    assert.ok(ok, 'Early detection of invalid literals');
  });

  const fieldTest = (lex, dt, fields, illegal) => () => {
    const l1 = m.createTypedLiteral(lex, dt);
    assertEquals(dt, l1.getDatatype(), 'dateTime data type');
    const xdt = l1.getValue();
    for (const [getter, v] of Object.entries(fields)) assert.equal(xdt[getter](), v, 'dateTime value');
    assert.throws(() => xdt[illegal](), (e) => e && e.name === 'IllegalDateTimeFieldException', 'Failed to prevent illegal access');
  };
  t('testDateTime_10', fieldTest('1999-05-31', X.XSDdate, { getYears: 1999, getMonths: 5, getDays: 31 }, 'getHours'));
  t('testDateTime_11', fieldTest('12:56:32', X.XSDtime, { getHours: 12, getMinutes: 56, getFullSeconds: 32 }, 'getDays'));
  t('testDateTime_12', fieldTest('1999-05', X.XSDgYearMonth, { getYears: 1999, getMonths: 5 }, 'getDays'));
  t('testDateTime_13', fieldTest('1999', X.XSDgYear, { getYears: 1999 }, 'getMonths'));
  t('testDateTime_14', fieldTest('--05--', X.XSDgMonth, { getMonths: 5 }, 'getYears'));
  t('testDateTime_15', fieldTest('--05-25', X.XSDgMonthDay, { getMonths: 5, getDays: 25 }, 'getYears'));
  t('testDateTime_16', fieldTest('---25', X.XSDgDay, { getDays: 25 }, 'getMonths'));

  t('testDateTime_17', () => {
    const l1 = m.createTypedLiteral(gmt(2003, 11, 8, 10, 50, 42));
    assertEquals(X.XSDdateTime, l1.getDatatype(), 'DateTime from date');
    assert.equal(l1.getValue().toString(), '2003-12-08T10:50:42Z', 'DateTime from date');
  });

  t('testDateTime_18', () => {
    // Jena: a SimpleTimeZone at -8h with daylight saving (America/Los_Angeles); a JS Date is
    // an instant, so the instants are given: 2004-03-21 12:50:42 PST, 2004-04-21 12:50:42 PDT.
    let l1 = m.createTypedLiteral(new Date(Date.UTC(2004, 2, 21, 20, 50, 42)));
    assertEquals(X.XSDdateTime, l1.getDatatype(), 'DateTime from date');
    assert.equal(l1.getValue().toString(), '2004-03-21T20:50:42Z', 'DateTime from date');
    l1 = m.createTypedLiteral(new Date(Date.UTC(2004, 3, 21, 19, 50, 42)));
    assertEquals(X.XSDdateTime, l1.getDatatype(), 'DateTime from date');
    assert.equal(l1.getValue().toString(), '2004-04-21T19:50:42Z', 'DateTime from date');
  });

  t('testTypedContains', () => {
    const model = ModelFactory.createModelSameValue();
    const p = model.createProperty('urn:x-eg/p');
    const l1 = model.createTypedLiteral('10', 'http://www.w3.org/2001/XMLSchema#integer');
    const l2 = model.createTypedLiteral('010', 'http://www.w3.org/2001/XMLSchema#integer');
    assertSameValueAs('sameas test', l1, l2);
    const a = model.createResource('urn:x-eg/a');
    model.add(a, p, l1);
    assert.ok(model.getGraph().contains(a.asNode(), p.asNode(), l1.asNode()));
    assert.ok(model.getGraph().contains(a.asNode(), p.asNode(), l2.asNode()));
  });

  t('testIsValidLiteral', () => {
    let ll = m.createTypedLiteral('1000', X.XSDinteger).asNode().getLiteral();
    assert.ok(X.XSDlong.isValidLiteral(ll));
    assert.ok(X.XSDint.isValidLiteral(ll));
    assert.ok(X.XSDshort.isValidLiteral(ll));
    assert.ok(X.XSDunsignedInt.isValidLiteral(ll));
    assert.ok(X.XSDunsignedLong.isValidLiteral(ll));
    assert.ok(X.XSDunsignedShort.isValidLiteral(ll));
    assert.ok(X.XSDpositiveInteger.isValidLiteral(ll));
    assert.ok(X.XSDdecimal.isValidLiteral(ll));
    assert.ok(!X.XSDstring.isValidLiteral(ll));
    assert.ok(!X.XSDbyte.isValidLiteral(ll));
    assert.ok(!X.XSDnegativeInteger.isValidLiteral(ll));
    ll = m.createTypedLiteral('-2', X.XSDinteger).asNode().getLiteral();
    assert.ok(X.XSDlong.isValidLiteral(ll));
    assert.ok(X.XSDint.isValidLiteral(ll));
    assert.ok(X.XSDshort.isValidLiteral(ll));
    assert.ok(!X.XSDunsignedInt.isValidLiteral(ll));
    assert.ok(!X.XSDunsignedLong.isValidLiteral(ll));
    assert.ok(!X.XSDunsignedShort.isValidLiteral(ll));
    assert.ok(X.XSDdecimal.isValidLiteral(ll));
    assert.ok(!X.XSDpositiveInteger.isValidLiteral(ll));
    assert.ok(!X.XSDstring.isValidLiteral(ll));
    assert.ok(X.XSDbyte.isValidLiteral(ll));
    assert.ok(X.XSDnegativeInteger.isValidLiteral(ll));
    ll = m.createTypedLiteral('4.5', X.XSDfloat).asNode().getLiteral();
    assert.ok(!X.XSDdouble.isValidLiteral(ll));
    assert.ok(!X.XSDdecimal.isValidLiteral(ll));
    const l2 = m.createTypedLiteral('foo', X.XSDstring);
    assert.ok(X.XSDstring.isValidLiteral(l2.asNode().getLiteral()));
    assert.ok(X.XSDnormalizedString.isValidLiteral(l2.asNode().getLiteral()));
    assert.ok(!X.XSDint.isValidLiteral(l2.asNode().getLiteral()));
    ll = m.createTypedLiteral('foo bar').asNode().getLiteral();
    assert.ok(X.XSDstring.isValidLiteral(ll));
    assert.ok(!X.XSDint.isValidLiteral(ll));
    ll = m.createTypedLiteral('12').asNode().getLiteral();
    assert.ok(X.XSDstring.isValidLiteral(ll));
    assert.ok(!X.XSDint.isValidLiteral(ll));
    assert.ok(X.XSDnonNegativeInteger.isValidValue(10));
    assert.ok(!X.XSDnonNegativeInteger.isValidValue(-10));
    assert.ok(!X.XSDnonNegativeInteger.isValidValue('10'));
    assert.ok(X.XSDfloat.isValidValue(2.3)); // Java Float.valueOf("2.3"): no JS float
    assert.ok(X.XSDdouble.isValidValue(2.3));
    assert.ok(!X.XSDfloat.isValidValue(2)); // Java Integer.valueOf("2")
  });

  t('testIsValidLiteral1', () => {
    const lit = m.createTypedLiteral('100', X.XSD + '#anyType');
    assert.ok(!X.XSDinteger.isValidLiteral(lit.asNode().getLiteral()));
  });

  t('testIsValidLiteral2', () => {
    const lit = m.createTypedLiteral('100', X.XSD + '#anySimpleType');
    assert.ok(!X.XSDinteger.isValidLiteral(lit.asNode().getLiteral()));
  });

  const data = new Uint8Array([12, 42, 99]);

  t('testBinary1', () => {
    const l = m.createTypedLiteral(new Uint8Array([12, 42, 99]));
    const ll = l.asNode().getLiteral();
    assertEquals(X.XSDbase64Binary, ll.getDatatype(), 'binary test 1a');
    assert.equal(ll.getLexicalForm(), 'DCpj', 'binary test 1b');
  });

  t('testBinary2', () => {
    const l2 = m.createTypedLiteral('DCpj', X.XSDbase64Binary).asNode().getLiteral();
    const data2 = l2.getValue();
    assert.ok(data2 instanceof Uint8Array, 'binary test 3');
    assert.deepEqual([...data2], [...data]);
  });

  t('testBinary3', () => {
    const l = m.createTypedLiteral(data, X.XSDhexBinary);
    const ll = l.asNode().getLiteral();
    assertEquals(ll.getDatatype(), X.XSDhexBinary, 'binary test 1b');
    assert.equal(ll.getLexicalForm(), '0C2A63', 'binary test 2b');
    const l2 = m.createTypedLiteral(ll.getLexicalForm(), X.XSDhexBinary).asNode().getLiteral();
    assert.deepEqual([...l2.getValue()], [...data]);
    assertEquals(l2, ll);
  });

  t('testBinary4', () => {
    const la = m.createTypedLiteral('GpM7', X.XSDbase64Binary);
    const lb = m.createTypedLiteral('GpM7', X.XSDbase64Binary);
    assert.ok(la.sameValueAs(lb), 'equality test');
    const l = m.createTypedLiteral(new Uint8Array([15, 0xB7]), X.XSDhexBinary);
    assert.equal(l.getLexicalForm(), '0FB7', 'hexBinary encoding');
  });

  const indexing = (lex, dt, what) => () => {
    const x1 = m.createTypedLiteral(lex, dt), x2 = m.createTypedLiteral(lex, dt);
    assert.equal(x1.asNode().getIndexingValue().hashCode(), x2.asNode().getIndexingValue().hashCode(), what + ' indexing hashCode');
    assertEquals(x1.asNode().getIndexingValue(), x2.asNode().getIndexingValue(), what + ' indexing');
  };
  t('testBinaryIndexing1', indexing('', X.XSDbase64Binary, 'base64Binary'));
  t('testBinaryIndexing2', indexing('GpM7', X.XSDbase64Binary, 'base64Binary'));
  t('testBinaryIndexing3', indexing('', X.XSDhexBinary, 'hexBinary'));
  t('testBinaryIndexing4', indexing('AABB', X.XSDhexBinary, 'hexBinary'));

  t('testXSDanyURI', () => {
    const node1 = NodeFactory.createLiteralDT('http://example/', X.XSDanyURI);
    const node2 = NodeFactory.createLiteralDT('http://example/', X.XSDstring);
    assert.ok(!node1.sameValueAs(node2));
  });

  t('testDateTimeBug3', () => {
    const testLex = '-0001-02-03T04:05:06';
    const n = NodeFactory.createLiteralDT(testLex, X.XSDdateTime);
    assert.equal(n.getLiteralValue().toString(), testLex, 'Got wrong XSDDateTime representation!');
  });

  t('testDateTimeBug', () => {
    const dt = TypeMapper.getInstance().getSafeTypeByName('http://www.w3.org/2001/XMLSchema#date');
    const obj = dt.parse('2003-05-21');
    const literal = m.createTypedLiteral(obj, dt);
    literal.toString();
    const value2 = dt.parse(obj.toString());
    assertEquals(obj, value2);
    m.createTypedLiteral('2003-05-21', X.XSDdate);
    checkSerialization('2003-05-21', X.XSDdate);
    checkSerialization('2003-05-21T12:56:10Z', X.XSDdateTime);
    checkSerialization('2003-05', X.XSDgYearMonth);
    checkSerialization('2003', X.XSDgYear);
    checkSerialization('--05', X.XSDgMonth);
    checkSerialization('--05-12', X.XSDgMonthDay);
    checkSerialization('---12', X.XSDgDay);
  });

  t('testDateTimeBug2', () => {
    // Jena: for each time zone and sample "MM/dd/yyy HH:mm" local time, an XSDDateTime made
    // from the Calendar has the Calendar's hour once the zone offset is applied. The Java
    // DateFormat/TimeZone work is done here with Intl.
    const local = (tz, date) => {
      const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
        .formatToParts(date).map((p) => [p.type, p.value]));
      const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
      return { offset: Math.round((asUTC - date.getTime()) / 3600000), hour: +parts.hour };
    };
    const localToDate = (s, tz) => {
      const [, mo, d, y, h, mi] = /^(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d)$/.exec(s);
      const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
      return new Date(guess - local(tz, new Date(guess)).offset * 3600000);
    };
    for (const tz of ['GMT', 'America/New_York', 'America/Chicago']) {
      for (const tstr of ['03/10/2012 01:29', '03/11/2012 00:29', '03/11/2012 01:29', '03/11/2012 02:29',
        '03/11/2012 03:29', '03/11/2012 04:29', '03/12/2012 01:29', '11/03/2012 23:29', '11/04/2012 00:29',
        '11/04/2012 01:29', '11/04/2012 02:29', '11/04/2012 03:29']) {
        const dt = localToDate(tstr, tz);
        const xdt = new XSDDateTime(dt, tz);
        const { offset, hour: dhr } = local(tz, dt);
        const dif = (xdt.getHours() - dhr + offset) % 24;
        assert.equal(dif, 0, 'Difference between cal and xdt');
      }
    }
  });

  t('testFlags', () => {
    const originalFlag = JenaParameters.enableEagerLiteralValidation;
    JenaParameters.enableEagerLiteralValidation = true;
    let foundException = false;
    try { m.createTypedLiteral('fool', X.XSDint); } catch (e) { if (isDatatypeFormatException(e)) foundException = true; else throw e; }
    JenaParameters.enableEagerLiteralValidation = originalFlag;
    assert.ok(foundException, 'Early datatype format exception');
    JenaParameters.enableEagerLiteralValidation = false;
    foundException = false;
    const l = m.createTypedLiteral('fool', X.XSDint);
    try { l.getValue(); } catch (e) { if (isDatatypeFormatException(e)) foundException = true; else throw e; }
    JenaParameters.enableEagerLiteralValidation = originalFlag;
    assert.ok(foundException, 'Early datatype format exception');
  });

  t('testLexicalDistinction', () => {
    let l1 = m.createTypedLiteral('3.0', X.XSDdecimal);
    let l2 = m.createTypedLiteral('3.00', X.XSDdecimal);
    let l3 = m.createTypedLiteral('3.0', X.XSDdecimal);
    assertSameValueAs('lexical form does not affect value', l1, l2);
    assertSameValueAs('lexical form does not affect value', l3, l2);
    assert.ok(!l1.equals(l2), 'lexical form affects equality');
    assert.ok(l1.equals(l3), 'lexical form affects equality');
    l1 = m.createTypedLiteral('3', X.XSDint);
    l2 = m.createTypedLiteral(' 3 ', X.XSDint);
    l3 = m.createTypedLiteral('3', X.XSDint);
    assertSameValueAs('lexical form does not affect value', l1, l2);
    assertSameValueAs('lexical form does not affect value', l3, l2);
    assert.ok(!l1.equals(l2), 'lexical form affects equality');
    assert.ok(l1.equals(l3), 'lexical form affects equality');
  });

  t('testRoundTrip', () => {
    const doTestRoundTrip = (lex, dt, testeq) => {
      const ll = LiteralLabelFactory.create(lex, dt);
      const lex2 = dt.unparse(ll.getValue());
      if (testeq) assert.equal(lex2, lex);
      assert.ok(LiteralLabelFactory.create(lex2, dt).isWellFormed());
    };
    const doTestValueRoundTrip = (lex, dt, testType) => {
      const l1 = m.createTypedLiteral(lex, dt);
      const o1 = l1.getValue();
      const l2 = m.createTypedLiteral(o1);
      assert.ok(l1.sameValueAs(l2), 'value round trip');
      assert.ok(o1.equals(l2.getValue()), 'value round trip2');
      if (testType) assertEquals(dt, l2.getDatatype(), 'Datatype round trip');
    };
    doTestRoundTrip('13:20:00.000', X.XSDtime, false);
    doTestRoundTrip('GpM7', X.XSDbase64Binary, true);
    doTestRoundTrip('0FB7', X.XSDhexBinary, true);
    doTestValueRoundTrip('2005-06-27', X.XSDdate, true);
    doTestValueRoundTrip('2005', X.XSDgYear, true);
    doTestValueRoundTrip('2005-06', X.XSDgYearMonth, true);
    doTestValueRoundTrip('13:20:00.000', X.XSDtime, true);
  });

  t('testDateOverride', () => {
    const xsdDate = new XSDDateTime(gmt(2007, 3, 4));
    const l1 = m.createTypedLiteral(xsdDate, X.XSDdate);
    assertEquals(X.XSDdate, l1.getDatatype());
    assert.equal(l1.getLexicalForm(), '2007-04-04Z');
  });
});
