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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphFind.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its create(); @BeforeEach setup() is a fresh dataset per
// method. Java Lists become arrays compared with equals(); stream(...) is a
// JavaScript iterator ([...stream] for toList()). The
// assumeTrue(dsg instanceof DatasetGraphBaseFind) methods run on every leana
// DatasetGraph (Jena's create(), createGeneral() and createTxnMem() datasets
// are all DatasetGraphBaseFind), so nothing is skipped.

import assert from 'node:assert/strict';
import { Quad, NodeFactory, AddDeniedException, DeleteDeniedException } from '@factoidal/leana';
import { assertThrows } from '../../lib/testlib.mjs';
import { parseNode, parseQuad, has, equalsUnordered } from './sse.mjs';

const XSD = 'http://www.w3.org/2001/XMLSchema#';
const nodeZero = NodeFactory.createLiteralDT('0', XSD + 'integer');
const nodeOne = NodeFactory.createLiteralDT('1', XSD + 'integer');

const s = parseNode(':s'), p = parseNode(':p'), o = parseNode(':o'), g1 = parseNode(':g1');
const q1 = Quad.create(Quad.defaultGraphIRI, s, p, o);
const q2 = Quad.create(Quad.defaultGraphIRI, s, p, nodeZero);
const q3 = parseQuad('(:g1 :s :p :o)');
const q4 = parseQuad('(:g1 :s :p 1)');
const q5 = parseQuad('(:g2 :s :p :o)');
const q6 = parseQuad('(:g2 :s :p 1)');
const q7 = parseQuad('(:g2 :s :p 2)');
const q8 = parseQuad('(:g3 :s :p :o)');
const q9 = parseQuad('(:g3 :s :p 1)');
const q10 = parseQuad('(:g3 :s :p 2)');
const data = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10];

const distinctTriples = (quads) => {
  const out = [];
  for (const q of quads) if (!has(out, q.asTriple())) out.push(q.asTriple());
  return out;
};
const assertEqualsUnordered = (a, b) => assert.ok(equalsUnordered(a, b), `Expected: ${a} : Actual: ${b}`);

export function runAbstractDatasetGraphFind(t, create) {
  const setup = () => { const dsg = create(); for (const q of data) dsg.add(q); return dsg; };
  const T = (name, fn) => t(name, () => fn(setup()));

  T('find_quad_01', (dsg) => {
    const x = dsg.find().toList();
    assert.equal(x.length, 10);
    assert.ok(has(x, q1));
    assert.ok(has(x, q5));
  });
  T('find_quad_02', (dsg) => {
    const x = dsg.find(null, s, p, o).toList();
    assert.equal(x.length, 4);
    assert.ok(!has(x, q2));
    assert.ok(!has(x, q4));
    assert.ok(has(x, q5));
  });
  T('find_ng_01', (dsg) => {
    const x = dsg.findNG(null, null, null, null).toList();
    assert.equal(x.length, 8);
    assert.ok(has(x, q4));
    assert.ok(has(x, q10));
    assert.ok(!has(x, q1));
  });
  T('find_ng_02', (dsg) => {
    const x = dsg.findNG(null, s, p, o).toList();
    assert.equal(x.length, 3);
    assert.ok(!has(x, q4));
    assert.ok(!has(x, q1));
    assert.ok(has(x, q3));
    assert.ok(has(x, q5));
    assert.ok(has(x, q8));
  });
  T('find_specific_01', (dsg) => {
    const x = dsg.find(g1, null, null, null).toList();
    assert.equal(x.length, 2);
    assert.ok(has(x, q4));
    assert.ok(has(x, q3));
  });
  T('find_specific_02', (dsg) => {
    const x = dsg.find(g1, null, null, nodeOne).toList();
    assert.equal(x.length, 1);
    assert.ok(has(x, q4));
  });
  T('find_dft_01', (dsg) => {
    const x = dsg.find(Quad.defaultGraphIRI, null, null, null).toList();
    assert.equal(x.length, 2);
    assert.ok(has(x, q1));
    assert.ok(has(x, q2));
  });
  T('find_dft_02', (dsg) => {
    assert.equal(dsg.find(Quad.defaultGraphIRI, null, null, nodeOne).toList().length, 0);
  });
  T('find_dft_03', (dsg) => {
    const x = dsg.find(Quad.defaultGraphIRI, null, null, nodeZero).toList();
    assert.equal(x.length, 1);
    assert.ok(has(x, q2));
  });
  T('find_union_01', (dsg) => {
    const x = dsg.find(Quad.unionGraph, null, null, null).toList();
    assert.equal(x.length, 3);
    const z = x.map((q) => q.asTriple());
    assert.ok(has(z, q4.asTriple()));
    assert.ok(has(z, q5.asTriple()));
    assert.ok(has(x, Quad.create(Quad.unionGraph, q4.asTriple())));
    assert.ok(!has(x, Quad.create(Quad.unionGraph, q2.asTriple())));
  });
  T('find_union_02', (dsg) => {
    assert.ok(dsg.getUnionGraph());
    const x = dsg.getUnionGraph().find(null, null, null).toList();
    assert.equal(x.length, 3);
    assert.ok(has(x, q4.asTriple()));
    assert.ok(has(x, q5.asTriple()));
    assert.ok(has(x, q10.asTriple()));
  });
  T('find_union_03', (dsg) => {
    const x1 = dsg.getUnionGraph().find(null, null, null).toSet();
    const x2 = dsg.find(Quad.unionGraph, null, null, null).mapWith((q) => q.asTriple()).toSet();
    assert.ok(x1.equals(x2));
  });
  T('find_union_04', (dsg) => {
    assertThrows(AddDeniedException, () => dsg.getUnionGraph().add(q4.asTriple()));
  });
  T('find_union_05', (dsg) => {
    assertThrows(DeleteDeniedException, () => dsg.getUnionGraph().delete(q4.asTriple()));
  });
  T('find_dsgFind_union_02', (dsg) => {
    const x = dsg.findInUnionGraph(null, null, null).toList();
    assert.equal(x.length, 3);
    assert.ok(has(x, q4.asTriple()));
    assert.ok(has(x, q5.asTriple()));
    assert.ok(has(x, q10.asTriple()));
  });
  T('find_dsgFind_union_03', (dsg) => {
    const x1 = dsg.findInUnionGraph(null, null, null).toList();
    const x2 = distinctTriples(dsg.find(Quad.unionGraph, null, null, null).toList());
    assertEqualsUnordered(x1, x2);
    assert.equal(x2.length, 3);
  });
  T('find_dsgFind_union_04', (dsg) => {
    const x = dsg.findInUnionGraph(null, null, o).toList();
    assert.equal(x.length, 1);
    assert.ok(has(x, q3.asTriple()));
  });
  T('find_dsgFind_union_05', (dsg) => {
    const x1 = dsg.findInUnionGraph(null, null, o).toList();
    const x2 = distinctTriples(dsg.find(Quad.unionGraph, null, null, o).toList());
    assertEqualsUnordered(x1, x2);
    assert.equal(x2.length, 1);
  });
  T('stream_dsg_01', (dsg) => {
    const x = [...dsg.stream()];
    assert.equal(x.length, 10);
    assert.ok(has(x, q1));
    assert.ok(has(x, q5));
  });
  T('stream_dsg_02', (dsg) => {
    const x = [...dsg.stream(null, s, p, o)];
    assert.equal(x.length, 4);
    assert.ok(!has(x, q2));
    assert.ok(!has(x, q4));
    assert.ok(has(x, q5));
  });
  T('stream_specific_01', (dsg) => {
    const x = [...dsg.stream(g1, null, null, null)];
    assert.equal(x.length, 2);
    assert.ok(has(x, q4));
    assert.ok(has(x, q3));
  });
  T('stream_specific_02', (dsg) => {
    const x = [...dsg.stream(g1, null, null, nodeOne)];
    assert.equal(x.length, 1);
    assert.ok(has(x, q4));
  });
  T('stream_dft_01', (dsg) => {
    const x = [...dsg.stream(Quad.defaultGraphIRI, null, null, null)];
    assert.equal(x.length, 2);
    assert.ok(has(x, q1));
    assert.ok(has(x, q2));
  });
  T('stream_dft_02', (dsg) => {
    assert.equal([...dsg.stream(Quad.defaultGraphIRI, null, null, nodeOne)].length, 0);
  });
  T('stream_dft_03', (dsg) => {
    const x = [...dsg.stream(Quad.defaultGraphIRI, null, null, nodeZero)];
    assert.equal(x.length, 1);
    assert.ok(has(x, q2));
  });
  T('stream_union_01', (dsg) => {
    const x = [...dsg.stream(Quad.unionGraph, null, null, null)];
    assert.equal(x.length, 3);
    assert.ok(x.every((q) => q.getGraph().equals(Quad.unionGraph)));
    const z = x.map((q) => q.asTriple());
    assert.ok(has(z, q4.asTriple()));
    assert.ok(has(z, q5.asTriple()));
    assert.ok(has(x, Quad.create(Quad.unionGraph, q4.asTriple())));
    assert.ok(!has(x, Quad.create(Quad.unionGraph, q2.asTriple())));
  });
  T('stream_matches_find', (dsg) => {
    const patterns = [
      [null, null, null, null],
      [Quad.defaultGraphIRI, null, null, null],
      [g1, null, null, null],
      [Quad.unionGraph, null, null, null],
      [null, s, p, o],
      [null, null, null, nodeOne],
      [Quad.unionGraph, null, null, o],
    ];
    for (const pat of patterns) {
      assertEqualsUnordered(dsg.find(...pat).toList(), [...dsg.stream(...pat)]);
    }
  });
  T('stream_dsgFind_union_02', (dsg) => {
    const x = [...dsg.streamQuadsInUnionGraph(null, null, null)].map((q) => q.asTriple());
    assert.equal(x.length, 3);
    assert.ok(has(x, q4.asTriple()));
    assert.ok(has(x, q5.asTriple()));
    assert.ok(has(x, q10.asTriple()));
  });
  T('stream_dsgFind_union_03', (dsg) => {
    const x1 = [...dsg.streamQuadsInUnionGraph(null, null, null)].map((q) => q.asTriple());
    const x2 = dsg.findInUnionGraph(null, null, null).toList();
    assertEqualsUnordered(x1, x2);
    const x3 = [...dsg.streamQuadsInUnionGraph(null, null, null)];
    assert.equal(x3.length, 3);
    assert.ok(x3.every((q) => q.getGraph().equals(Quad.unionGraph)));
  });
  T('stream_dsgFind_union_05', (dsg) => {
    const x1 = [...dsg.streamQuadsInUnionGraph(null, null, o)].map((q) => q.asTriple());
    const x2 = distinctTriples(dsg.find(Quad.unionGraph, null, null, o).toList());
    assertEqualsUnordered(x1, x2);
    assert.equal(x2.length, 1);
  });
  T('stream_dsgFind_ng', (dsg) => {
    assertEqualsUnordered(dsg.findNG(null, null, null, null).toList(), [...dsg.streamNG(null, null, null, null)]);
    assertEqualsUnordered(dsg.findNG(null, s, p, o).toList(), [...dsg.streamNG(null, s, p, o)]);
  });
}
