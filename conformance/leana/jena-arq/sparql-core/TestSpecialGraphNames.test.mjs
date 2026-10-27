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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestSpecialGraphNames.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterized over three datasets
// (General: createGeneral(), Plain: create(), TxnMem: createTxnMem()); each
// method runs once per dataset, named `<method>[<label>]`. Jena evaluates
// SSE algebra (Algebra.exec), in triple, quad or quad-block form; leana has
// no algebra, so each op is written as the SPARQL query it stands for and run
// by leana's QueryExecution (on @factoidal/core), which answers a Promise.
// The three forms are one query each. The test data is read by ./sse.mjs
// (relative IRIs made absolute against eh:/, also in the queries).

import assert from 'node:assert/strict';
import { DatasetGraphFactory, Quad, QueryExecution } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { buildDataset, relIRI } from './sse.mjs';

const x1 = `(dataset
  (graph (<s> <p> <x>) (<x> <p> <o>) (<x2> <p> <o1>) (<x2> <p> <o3>) (<x2> <p> <o4>))
  (graph <g1> (<s1> <p1> <s1>) (<s1> <p1> <s2>))
  (graph <g2> (triple <s2> <p2> <o2>) (triple <s2> <p3> <o3>))
  (graph <g3> (triple <s2> <p2> <o2>))
)`;

const makers = [
  ['General', () => DatasetGraphFactory.createGeneral()],
  ['Plain', () => DatasetGraphFactory.create()],
  ['TxnMem', () => DatasetGraphFactory.createTxnMem()],
];

const I = (x) => '<' + relIRI(x) + '>';
const U = '<' + Quad.unionGraph.getURI() + '>';
const D = '<' + Quad.defaultGraphIRI.getURI() + '>';
const DG = '<' + Quad.defaultGraphNodeGenerated.getURI() + '>';

async function count(dsg, where) {
  const rs = await QueryExecution.dataset(dsg).query('SELECT * WHERE { ' + where + ' }').select();
  let n = 0;
  while (rs.hasNext()) { rs.next(); n++; }
  return n;
}

describeJena('TestSpecialGraphNames', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestSpecialGraphNames.java', (t) => {
  for (const [label, maker] of makers) {
    const T = (name, fn) => t(`${name}[${label}]`, () => fn(buildDataset(maker(), x1)));
    const exec = (name, where, expected) => T(name, async (dsg) => assert.equal(await count(dsg, where), expected));

    const union_dft_1 = async (dsg) => {
      assert.equal(await count(dsg, '?s ?p ?o'), 5);
      assert.equal(await count(dsg, `GRAPH ${U} { ?s ?p ?o }`), 4);
    };
    T('union_dft_1t', union_dft_1);
    T('union_dft_1q', union_dft_1);
    for (const m of ['t', 'q']) {
      exec('graph_union_1' + m, `GRAPH ${U} { ${I('s2')} ?p ?o }`, 2);
      exec('graph_union_2' + m, `GRAPH ${U} { ${I('s1')} ?p ?o . ?o ?q ?z }`, 4);
      exec('graph_dft_1' + m, `GRAPH ${D} { ${I('s2')} ?p ?o }`, 0);
      exec('graph_dft_2' + m, `GRAPH ${D} { ${I('s')} ?p ?o }`, 1);
      exec('graph_dft_3' + m, `GRAPH ${D} { ?x ?p ?z . ?z ?q ?y }`, 1);
      exec('graph_dftg_1' + m, `GRAPH ${DG} { ${I('s2')} ?p ?o }`, 0);
      exec('graph_dftg_2' + m, `GRAPH ${DG} { ${I('x2')} ?p ?o }`, 3);
      exec('direct_3' + m, `GRAPH ${I('g1')} { ${I('s1')} ?p ?o }`, 2);
    }
    exec('direct_4', `GRAPH ${I('g1')} { ${I('s2')} ?p ?o }`, 0);
    exec('direct_5', `GRAPH ${I('g2')} { ${I('s2')} ?p ?o }`, 2);
    for (const n of ['1', '2', '3']) {
      exec('minus_' + n, `{ ?s ?p ?o } MINUS { ${I('x2')} ?p ?o }`, 2);
      exec('filter_exists_' + n, `?s ?p ?o FILTER EXISTS { ?s ${I('p')} ${I('o')} }`, 1);
      exec('filter_notexists_' + n, `?s ?p ?o FILTER NOT EXISTS { ?s ${I('p')} ${I('o')} }`, 4);
    }
  }
});
