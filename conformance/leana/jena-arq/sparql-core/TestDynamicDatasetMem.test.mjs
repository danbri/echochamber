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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractTestDynamicDataset.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestDynamicDatasetMem.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The parameterized class runs each method once per
// dataset maker; the method name carries the maker: dynamic01[General].
// SSE.parseTriple is written out with NodeFactory. execSelect answers a
// Promise (awaited).

import { DatasetFactory, NodeFactory, Triple, QueryFactory, QueryExecutionFactory, ResultSetFormatter } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

async function testCount(queryString, expected, ds) {
  const query = QueryFactory.create(queryString);
  const rs = await QueryExecutionFactory.create(query, ds).execSelect();
  assertEquals(expected, ResultSetFormatter.consume(rs));
}

const uri = (x) => NodeFactory.createURI(x);
const int = (n) => NodeFactory.createLiteralDT(String(n), 'http://www.w3.org/2001/XMLSchema#integer');
const str = (x) => NodeFactory.createLiteralString(x);

function addGraph(dataset, i) {
  // Not a very interesting model
  const m = dataset.getNamedModel('graph:' + i);
  m.getGraph().add(Triple.create(uri('uri:x'), uri('uri:p'), int(i)));
  m.getGraph().add(Triple.create(uri('uri:y'), uri('uri:q'), str('ABC')));
}

/** @BeforeEach */
function before(maker) {
  const dataset = maker();
  // Named graphs
  for (let i = 0; i < 5; i++) addGraph(dataset, i);
  // Default model.
  const m = dataset.getDefaultModel();
  m.getGraph().add(Triple.create(uri('uri:x'), uri('uri:p'), int(0)));
  m.getGraph().add(Triple.create(uri('uri:y'), uri('uri:q'), str('ABC')));
  m.getGraph().add(Triple.create(uri('uri:z'), uri('uri:property'), str('DEF')));
  return dataset;
}

const cases = [
  ['dynamic01', 'SELECT * {?s ?p ?o}', 3],
  ['dynamic02', 'SELECT ?g { GRAPH ?g {} }', 5],
  ['dynamic03', 'SELECT * FROM <graph:1> {?s <uri:p> ?o}', 1],
  ['dynamic04', 'SELECT * FROM <graph:1> { GRAPH ?g { ?s ?p ?o} }', 0],
  ['dynamic05', 'SELECT * FROM <graph:1> FROM <graph:2> {?s <uri:p> ?o}', 2],
  // Duplicate surpression
  ['dynamic06', 'SELECT ?s FROM <graph:1> FROM <graph:2> {?s <uri:q> ?o}', 1],
  ['dynamic07', 'SELECT ?s FROM NAMED <graph:1> {?s <uri:q> ?o}', 0],
  ['dynamic08', 'SELECT ?s FROM <graph:2> FROM NAMED <graph:1> {?s <uri:q> ?o}', 1],
  ['dynamic09', 'SELECT * FROM <graph:1> FROM <graph:2> FROM NAMED <graph:3> FROM NAMED <graph:4> { GRAPH ?g { ?s <uri:q> ?o }}', 2],
  ['dynamic10', 'SELECT * FROM <graph:1> FROM <graph:2>FROM NAMED <graph:3> FROM NAMED <graph:4> { GRAPH ?g { ?s <uri:q> ?o }}', 2],
  ['dynamic11', 'SELECT * FROM <x:unknown>{ GRAPH ?g { ?s <uri:q> ?o }}', 0],
  ['dynamic12', 'SELECT * FROM  <graph:1>{ GRAPH ?g { }}', 0],
  ['dynamic13', 'SELECT * FROM NAMED <graph:1>{ GRAPH ?g { }}', 1],
  ['dynamic14', 'SELECT * FROM NAMED <graph:1> FROM NAMED <graph:2>FROM <graph:3> { GRAPH ?g { }}', 2],
  // -- Union graph.
  // No FROM <union> the underlying dataset.
  ['dynamic_union_1', 'SELECT * FROM <urn:x-arq:UnionGraph> { ?s <uri:p> ?o }', 5],
  // Should be able to see two graphs in the union.
  ['dynamic_union_2', 'SELECT * FROM NAMED <graph:1> FROM NAMED <graph:2> FROM <graph:3>{ GRAPH <urn:x-arq:UnionGraph> { ?s <uri:p> ?o } }', 2],
  ['dynamic_union_3', 'SELECT * FROM NAMED <urn:x-arq:UnionGraph> { GRAPH <urn:x-arq:UnionGraph> { } }', 1],
  // The union graph isn't in the named set, even if placed there explicitly.
  ['dynamic_union_4', 'SELECT * FROM NAMED <urn:x-arq:UnionGraph> { GRAPH ?g { } }', 0],
  ['dynamic_union5', 'SELECT * FROM NAMED <urn:x-arq:UnionGraph> { GRAPH <urn:x-arq:UnionGraph> { ?s <uri:p> ?o } }', 0],
  // GRAPH <union> is the union over the view dataset (FROM NAMED)
  ['dynamic_union_6', 'SELECT * FROM NAMED <urn:x-arq:UnionGraph> FROM NAMED <graph:4> { GRAPH <urn:x-arq:UnionGraph> { ?s <uri:p> ?o } }', 1],
  // -- dft graph
  ['dynamic_dft_1', 'SELECT * FROM <urn:x-arq:DefaultGraph> { ?s <uri:p> 0 }', 1],
  ['dynamic_dft_2', 'SELECT * FROM NAMED <urn:x-arq:DefaultGraph> { ?s <uri:p> 0 }', 0],
  ['dynamic_dft_3', 'SELECT * FROM NAMED <urn:x-arq:DefaultGraph> { GRAPH ?g { } }', 1],
  // No FROM -> empty default.
  ['dynamic_dft_4', 'SELECT * FROM NAMED <urn:x-arq:DefaultGraph> { GRAPH ?g { ?s <uri:p> 0 } }', 0],
  // No FROM -> empty default.
  ['dynamic_dft_5', 'SELECT * FROM NAMED <urn:x-arq:DefaultGraph> { GRAPH <urn:x-arq:DefaultGraph> { ?s <uri:p> 0 } }', 0],
  ['dynamic_dft_6', 'SELECT * FROM <graph:1> FROM <graph:2> FROM NAMED <urn:x-arq:DefaultGraph> { GRAPH ?g { ?s <uri:p> ?o .FILTER ( ?o IN ( 1, 2) ) } }', 2],
  ['dynamic_dft_7', 'SELECT * FROM <graph:1> FROM <graph:2> FROM NAMED <urn:x-arq:DefaultGraph> { GRAPH <urn:x-arq:DefaultGraph> { ?s <uri:p> ?o . FILTER ( ?o IN ( 1, 2) ) } }', 2],
];

const makers = [['General', () => DatasetFactory.createGeneral()], ['TxnMem', () => DatasetFactory.createTxnMem()]];

describeJena('TestDynamicDatasetMem', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestDynamicDatasetMem.java', (t) => {
  for (const [name, maker] of makers) {
    for (const [method, q, n] of cases) t(`${method}[${name}]`, () => testCount(q, n, before(maker)));
  }
});
