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
//   jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultSet.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Writers answer a Promise (awaited); a Binding is a
// Map from variable name to Node. The SSE row sets of the isomorphism tests
// are written as rows of Nodes; NodeFactoryExtra.parseNode("123") is
// "123"^^xsd:integer. ResultSetException is QueryException here. ARQ's
// blank-node-label context symbols are Symbol_.create(<name>). The files of
// DIR are the copied fixtures/jena-arq/testing/ResultSet/.

import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  NodeFactory, ResultSetFactory, ResultSetFormatter, ResultSetMem, ResultsCompare, ResultSetUtils, ResultsFormat,
  RDFOutput, RDFInput, ResultSetLang, ResultsWriter, ResultsReader, Context, Symbol_, NoSuchElementException,
  IllegalStateException, QueryException, StringWriter,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertThrows, XSD } from '../../lib/testlib.mjs';
import { JENA_ARQ } from '../../lib/riotlib.mjs';

const DIR = join(JENA_ARQ, 'testing', 'ResultSet') + '/';
const uri = (s) => NodeFactory.createURI(s);
const bn = (s) => NodeFactory.createBlankNode(s);
const row = (v, n) => new Map([[v, n]]);
const make = (vars, ...rows) => new ResultSetMem(ResultSetFactory.create(vars, rows));
const make1 = (v, n) => make([v], row(v, n));
const make2 = (v, n) => make([v], row(v, n), row(v, n));
const makeRewindable = (v, n) => ResultSetFactory.makeRewindable(make1(v, n));
const make2Rewindable = (v, n) => ResultSetFactory.makeRewindable(make2(v, n));
const makePeekable = (v, n) => ResultSetFactory.makePeekable(make1(v, n));

async function test_RS_fmt(rs, fmt, ordered) {
  const rs1 = ResultSetFactory.makeRewindable(rs);
  const arr = new StringWriter();
  await ResultSetFormatter.output(arr, rs1, fmt);
  rs1.reset();
  const rs2 = ResultSetFactory.makeRewindable(ResultSetFactory.load(arr.toString(), fmt));
  let b = ResultsCompare.equalsByTerm(rs1, rs2);
  if (ordered) { rs1.reset(); rs2.reset(); b = b & ResultsCompare.equalsByTerm(rs1, rs2); }
  assert.ok(b);
}

// (resultset (?x ?y) (row (?x _:b0) (?y _:b1)) (row (?x _:b2) (?y _:b3)) (row (?x _:b1) (?y _:b0)))
const rs1$ = () => ResultSetFactory.makeRewindable(make(['x', 'y'],
  new Map([['x', bn('b0')], ['y', bn('b1')]]), new Map([['x', bn('b2')], ['y', bn('b3')]]), new Map([['x', bn('b1')], ['y', bn('b0')]])));
// (resultset (?x ?y) (row (?x _:c1) (?y _:c0)) (row (?x _:c3) (?y _:c2)) (row (?x _:c2) (?y _:c3)))
const rs2$ = () => ResultSetFactory.makeRewindable(make(['x', 'y'],
  new Map([['x', bn('c1')], ['y', bn('c0')]]), new Map([['x', bn('c3')], ['y', bn('c2')]]), new Map([['x', bn('c2')], ['y', bn('c3')]])));

const cxt = new Context();
cxt.set(Symbol_.create('http://jena.apache.org/ARQ#inputGraphBNodeLabels'), true);
cxt.set(Symbol_.create('http://jena.apache.org/ARQ#outputGraphBNodeLabels'), true);

async function preserve_bnodes(lang, c, same) {
  const rs1 = rs1$();
  const x = new StringWriter();
  await ResultsWriter.create().context(c).lang(lang).write(x, rs1);
  const rs2 = ResultSetFactory.copyResults(ResultsReader.create().context(c).lang(lang).read(x.toString()));
  rs1.reset(); rs2.reset();
  if (same) assert.ok(ResultsCompare.equalsExact(rs1, rs2));
  else assert.ok(!ResultsCompare.equalsExact(rs1, rs2));
}

describeJena('TestResultSet', 'jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultSet.java', (t) => {
  t('test_RS_1', async () => {
    const rs1 = new ResultSetMem();
    const arr = new StringWriter();
    await ResultSetFormatter.outputAsXML(arr, rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromXML(arr.toString());
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_1_str', async () => {
    const rs1 = new ResultSetMem();
    const x = await ResultSetFormatter.asXMLString(rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromXML(x);
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_2', async () => {
    const rs1 = makeRewindable('x', uri('tag:local'));
    const arr = new StringWriter();
    await ResultSetFormatter.outputAsXML(arr, rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromXML(arr.toString());
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_2_str', async () => {
    const rs1 = makeRewindable('x', uri('tag:local'));
    const x = await ResultSetFormatter.asXMLString(rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromXML(x);
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_3', () => {
    const rs1 = new ResultSetMem();
    const model = RDFOutput.encodeAsModel(rs1);
    rs1.reset();
    const rs2 = RDFInput.fromRDF(model);
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_4', () => {
    const rs1 = makeRewindable('x', uri('tag:local'));
    const model = RDFOutput.encodeAsModel(rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.makeRewindable(RDFInput.fromRDF(model));
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_5', async () => {
    const rs1 = new ResultSetMem();
    const arr = new StringWriter();
    await ResultSetFormatter.outputAsJSON(arr, rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromJSON(arr.toString());
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_6', async () => {
    const rs1 = make2Rewindable('x', uri('tag:local'));
    const arr = new StringWriter();
    await ResultSetFormatter.outputAsJSON(arr, rs1);
    rs1.reset();
    const rs2 = ResultSetFactory.fromJSON(arr.toString());
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_7', async () => { await test_RS_fmt(ResultSetFactory.load(DIR + 'output.srx'), ResultsFormat.XML, true); });
  t('test_RS_8', async () => { await test_RS_fmt(ResultSetFactory.load(DIR + 'output.srx'), ResultsFormat.JSON, true); });
  t('test_RS_9', async () => { await test_RS_fmt(ResultSetFactory.load(DIR + 'output.srx'), ResultsFormat.XML, false); });
  t('test_RS_10', () => {
    const rs = ResultSetFactory.load(DIR + 'output.srx');
    for (; rs.hasNext(); rs.next()) { /* consume */ }
    assert.ok(!rs.hasNext());
  });
  t('rs_xmllang_datatype_1', () => { ResultSetFactory.load(DIR + 'rs-xmllang-datatype-1.srj'); });
  t('rs_xmllang_datatype_2', () => {
    assertThrows(QueryException, () => ResultSetFactory.load(DIR + 'rs-xmllang-datatype-2.srj'));
  });
  t('rs_datatype_string', () => { ResultSetFactory.load(DIR + 'rs-datatype-string.srj'); });
  t('test_RS_union_1', () => {
    const rs1 = make1('x', uri('tag:local'));
    const rs2 = make1('x', uri('tag:local'));
    const rs3 = make2('x', uri('tag:local'));
    assert.ok(ResultsCompare.equalsByTerm(rs3, ResultSetUtils.merge(rs1, rs2)));
  });
  t('test_RS_cmp_1', () => {
    const rs1 = new ResultSetMem();
    const rs2 = new ResultSetMem();
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
    rs1.reset(); rs2.reset();
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_cmp_2', () => {
    assert.ok(!ResultsCompare.equalsByTerm(make1('x', uri('tag:local')), new ResultSetMem()));
  });
  t('test_RS_cmp_3', () => {
    assert.ok(!ResultsCompare.equalsByTerm(make1('x', uri('tag:local')), new ResultSetMem()));
  });
  t('test_RS_cmp_4', () => {
    const rs1 = make1('x', uri('tag:local'));
    const rs2 = make1('x', uri('tag:local'));
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_cmp_5', () => {
    const rs1 = makeRewindable('x', uri('tag:local:1'));
    const rs2 = makeRewindable('x', uri('tag:local:2'));
    assert.ok(!ResultsCompare.equalsByTerm(rs1, rs2));
    rs1.reset(); rs2.reset();
    assert.ok(rs1.hasNext());
    assert.ok(rs2.hasNext());
    assert.ok(!ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_cmp_6', () => {
    const rs1 = makeRewindable('x', uri('tag:local'));
    const rs2 = makeRewindable('y', uri('tag:local'));
    assert.ok(!ResultsCompare.equalsByTermAndOrder(rs1, rs2));
    rs1.reset(); rs2.reset();
    assert.ok(rs1.hasNext());
    assert.ok(rs2.hasNext());
    assert.ok(!ResultsCompare.equalsByTerm(rs1, rs2));
  });
  t('test_RS_cmp_value_1', () => {
    const rs1 = makeRewindable('x', NodeFactory.createLiteralDT('123', XSD.integer));
    const rs2 = makeRewindable('x', NodeFactory.createLiteralDT('0123', XSD.integer));
    assert.ok(!ResultsCompare.equalsByTerm(rs1, rs2));
    assert.ok(ResultsCompare.equalsByValue(rs1, rs2));
  });
  t('test_RS_peeking_1', () => {
    const rs = makePeekable('x', uri('tag:local'));
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.next(), null);
    assert.ok(!rs.hasNext());
  });
  t('test_RS_peeking_2', () => {
    const rs = makePeekable('x', uri('tag:local'));
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.next(), null);
    assert.ok(!rs.hasNext());
    assertThrows(NoSuchElementException, () => rs.peek());
  });
  t('test_RS_peeking_3', () => {
    const rs = makeRewindable('x', uri('tag:local'));
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.next(), null);
    assert.ok(!rs.hasNext());
  });
  t('test_RS_peeking_4', () => {
    const rs = makeRewindable('x', uri('tag:local'));
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.next(), null);
    assert.ok(!rs.hasNext());
    assertThrows(NoSuchElementException, () => rs.peek());
  });
  t('test_RS_peeking_5', () => {
    const inner = make(['x'], row('x', uri('tag:local')), row('x', uri('tag:local')));
    const rs = ResultSetFactory.makePeekable(inner);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    inner.next();
    assert.ok(!rs.hasNext());
  });
  t('test_RS_peeking_6', () => {
    const inner = make(['x'], row('x', uri('tag:local')), row('x', uri('tag:local')), row('x', uri('tag:local')));
    const rs = ResultSetFactory.makePeekable(inner);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    inner.next();
    assert.ok(rs.hasNext());
  });
  t('test_RS_peeking_7', () => {
    const inner = makeRewindable('x', uri('tag:local'));
    const rs = ResultSetFactory.makePeekable(inner);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    inner.reset();
    assert.ok(rs.hasNext());
  });
  t('test_RS_peeking_8', () => {
    const resultSet0 = make(['x'], row('x', uri('tag:local')), row('x', uri('tag:local')));
    const inner = ResultSetFactory.makeRewindable(resultSet0);
    const rs = ResultSetFactory.makePeekable(inner);
    assert.ok(rs.hasNext());
    assert.notEqual(rs.peek(), null);
    assert.notEqual(rs.next(), null);
    inner.reset();
    assertThrows(IllegalStateException, () => rs.hasNext());
  });
  t('test_RS_peeking_9', () => {
    const first = uri('tag:first');
    const second = uri('tag:second');
    const inner = make(['x'], row('x', first), row('x', second));
    const rs = ResultSetFactory.makePeekable(inner);
    assert.ok(rs.hasNext());
    let peeked = rs.peekBinding();
    assert.notEqual(peeked, null);
    assert.ok(first.equals(peeked.get('x')));
    let next = rs.nextBinding();
    assert.notEqual(next, null);
    assert.ok(first.equals(next.get('x')));
    peeked = rs.peekBinding();
    assert.notEqual(peeked, null);
    assert.ok(second.equals(peeked.get('x')));
    next = rs.nextBinding();
    assert.notEqual(next, null);
    assert.ok(second.equals(next.get('x')));
  });
  t('test_RS_iso_1', () => {
    const rs1 = rs1$();
    const rs2 = rs2$();
    assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
    rs1.reset(); rs2.reset();
    assert.ok(ResultsCompare.equalsByValue(rs1, rs2));
  });
  t('preserve_bnodes_1', async () => {
    await preserve_bnodes(ResultSetLang.RS_JSON, cxt, true);
    await preserve_bnodes(ResultSetLang.RS_JSON, new Context(), false);
  });
  t('preserve_bnodes_2', async () => {
    await preserve_bnodes(ResultSetLang.RS_XML, cxt, true);
    await preserve_bnodes(ResultSetLang.RS_XML, new Context(), false);
  });
  t('preserve_bnodes_3', async () => {
    await preserve_bnodes(ResultSetLang.RS_Thrift, cxt, true);
    await preserve_bnodes(ResultSetLang.RS_Thrift, new Context(), true);
  });
});
