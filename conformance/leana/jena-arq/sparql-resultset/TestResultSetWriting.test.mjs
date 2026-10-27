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
//   jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultSetWriting.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over 14 result
// sets ($rs0 ... $rs13, SSE text); here each method runs over all of them in
// turn, and the SSE result sets are written as rows of Nodes (1 is
// "1"^^xsd:integer). Writers answer a Promise (awaited) and write to a
// StringWriter in place of a ByteArrayOutputStream.

import assert from 'node:assert/strict';
import {
  NodeFactory, ResultSetFactory, ResultSetFormatter, ResultsCompare, ResultSetMgr, ResultSetLang, StringWriter,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { XSD, NS } from '../../lib/testlib.mjs';

const int = (n) => NodeFactory.createLiteralDT(String(n), XSD.integer);
const uri = (s) => NodeFactory.createURI(s);
const str = (s) => NodeFactory.createLiteralString(s);
const R = (o) => new Map(Object.entries(o));
const DATA = [
  ['$rs0', [], []],
  ['$rs1', [], [R({})]],
  ['$rs2', ['a', 'b', 'c'], [R({ a: int(1), b: int(2) }), R({ a: int(1), b: int(4), c: int(3) })]],
  ['$rs3', ['a', 'b', 'c'], [R({ a: int(1), b: int(4), c: int(3) }), R({ a: int(1), b: int(2) })]],
  ['$rs4', ['a', 'b', 'c'], [R({ a: int(1), c: int(4) }), R({ a: int(1), b: int(2), c: int(3) })]],
  ['$rs5', ['a', 'b'], [R({ a: int(1) }), R({ b: int(2) })]],
  ['$rs6', ['x'], [R({ x: uri(NS.rdf + 'type') }), R({ x: uri(NS.rdfs + 'label') }), R({ x: uri(NS.xsd + 'integer') }),
    R({ x: uri(NS.owl + 'sameAs') }), R({})]],
  ['$rs7', ['x'], [R({})]],
  ['$rs8', ['x'], [R({ x: str('has \t tab character') })]],
  ['$rs9', ['x'], [R({ x: NodeFactory.createBlankNode('bnode') })]],
  ['$rs10', ['x'], [R({ x: str('Includes a raw\ttab character') })]],
  ['$rs11', ['x'], [R({ x: str('Includes \n new line') })]],
  ['$rs12', ['x'], [R({ x: NodeFactory.createLiteralDirLang('abc', 'en', 'ltr') })]],
  ['$rs13', ['x'], [R({ x: NodeFactory.createTripleTerm(uri('x:s'), uri('x:p'), uri('x:o')) })]],
];
const make = ([, vars, rows]) => ResultSetFactory.makeRewindable(ResultSetFactory.create(vars, rows));

function checkIsomorphic(x, y) {
  const rs1 = x.rewindable();
  const rs2 = y.rewindable();
  assert.ok(ResultsCompare.equalsByTerm(rs1, rs2));
}

async function each(fn) {
  for (const d of DATA) {
    try { await fn(make(d)); } catch (e) { e.message = `${d[0]}: ${e.message}`; throw e; }
  }
}

describeJena('TestResultSetWriting', 'jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultSetWriting.java', (t) => {
  t('resultset_01', () => each(async (rs) => { await ResultSetFormatter.asText(rs); }));
  t('resultset_02', () => each(async (rs) => {
    const out = new StringWriter();
    await ResultSetFormatter.outputAsXML(out, rs);
    rs.reset();
    const rs2 = ResultSetFactory.fromXML(out.toString());
    checkIsomorphic(rs, rs2);
  }));
  t('resultset_03', () => each(async (rs) => {
    const out = new StringWriter();
    await ResultSetFormatter.outputAsJSON(out, rs);
    rs.reset();
    const rs2 = ResultSetFactory.fromJSON(out.toString());
    checkIsomorphic(rs, rs2);
  }));
  t('resultset_04', () => each(async (rs) => {
    const out = new StringWriter();
    await ResultSetFormatter.outputAsTSV(out, rs);
    rs.reset();
    const rs2 = ResultSetMgr.read(out.toString(), ResultSetLang.RS_TSV);
    checkIsomorphic(rs, rs2);
  }));
  t('resultset_05', () => each(async (rs) => {
    const out = new StringWriter();
    await ResultSetFormatter.outputAsCSV(out, rs);
  }));
});
