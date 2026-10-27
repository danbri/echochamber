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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractTestQueryExec.java
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestQueryExecMem.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The parameterized class runs each method once per
// dataset maker; the method name carries the maker: join_skew_01[General].
// execSelect answers a Promise (awaited).

import { DatasetFactory, QueryFactory, QueryExecutionFactory, ResultSetFormatter } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

/** AbstractTestQueryExec.testCount (also used by AbstractTestDynamicDataset). */
export async function testCount(queryString, expected, ds) {
  const query = QueryFactory.create(queryString);
  const qExec = QueryExecutionFactory.create(query, ds);
  const rs = await qExec.execSelect();
  const n = ResultSetFormatter.consume(rs);
  assertEquals(expected, n);
}

const makers = [['General', () => DatasetFactory.createGeneral()], ['TxnMem', () => DatasetFactory.createTxnMem()]];

describeJena('TestQueryExecMem', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestQueryExecMem.java', (t) => {
  for (const [name, maker] of makers) {
    /** GH-2412 */
    t(`join_skew_01[${name}]`, () => testCount('SELECT * { VALUES ?x { 0 } { VALUES ?x { UNDEF } FILTER(bound(?x)) } }', 0, maker()));
    /** GH-2412 */
    t(`join_skew_02[${name}]`, () => testCount('SELECT * { BIND(0 AS ?x) { BIND(coalesce() AS ?x) FILTER(bound(?x)) } }', 0, maker()));
  }
});
