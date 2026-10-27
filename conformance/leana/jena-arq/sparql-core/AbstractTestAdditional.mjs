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
//   jena-arq/src/test/java/org/apache/jena/sparql/AbstractTestAdditional.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its dataset(). The query runs with leana's QueryExecution
// (QueryExec.dataset(dsg).query(q).build().select() is
// QueryExecution.dataset(dsg).query(q).select(), which answers a Promise; the
// write transaction's action is async and awaited). The expected SSE result
// set is written as rows of Nodes; ResultsCompare.equalsByTerm is a row-set
// comparison by term (one row expected, no blank nodes).

import assert from 'node:assert/strict';
import { Txn, Quad, NodeFactory, QueryExecution } from '@factoidal/leana';
import { parseDatasetGraph } from './sse.mjs';

const PREFIXES = 'PREFIX : <http://example/>\n';
const ex = (x) => NodeFactory.createURI('http://example/' + x);

function equalsByTerm(expected, got) {
  if (expected.length !== got.length) return false;
  const key = (row) => [...row].map(([k, v]) => k + '=' + v.hashKey()).sort().join(' ');
  const a = expected.map(key).sort(), b = got.map(key).sort();
  return a.every((x, i) => x === b[i]);
}

export function runAbstractTestAdditional(t, dataset) {
  t('substitute_1', async () => {
    const ds = dataset();
    const expected = [new Map([['s', ex('s1')], ['p', ex('p')], ['o', ex('o')]])];
    await Txn.executeWrite(ds, async () => {
      const data = `(dataset
                      (:g1 :s1 :p :o)
                      (:g1 :s2 :p :o)
                      (:g2 :s1 :p :o)
                      (:g2 :s2 :p :o)
                    )`;
      const dsg = parseDatasetGraph(data);
      ds.asDatasetGraph().addAll(dsg);
      const qs = PREFIXES + 'SELECT * { VALUES ?s { :s1 } GRAPH <' + Quad.unionGraph.getURI() + '> { ?s ?p ?o } }';
      const rs = await QueryExecution.dataset(dsg).query(qs).select();
      const got = [];
      while (rs.hasNext()) got.push(rs.nextBinding());
      assert.ok(equalsByTerm(expected, got), 'result sets different: ' + JSON.stringify(got.map((r) => [...r].map(([k, v]) => k + '=' + v))));
    });
  });
}
