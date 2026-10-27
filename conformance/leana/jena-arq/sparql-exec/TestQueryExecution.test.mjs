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
//   jena-arq/src/test/java/org/apache/jena/sparql/exec/TestQueryExecution.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. QueryExec...table() answers a Promise (awaited).
// SSE.parseTable is written out as a leana Table of NodeFactory terms.

import { QueryExec, DatasetGraphFactory, NodeFactory, Table } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const int = (n) => NodeFactory.createLiteralDT(String(n), 'http://www.w3.org/2001/XMLSchema#integer');
const str = (x) => NodeFactory.createLiteralString(x);

describeJena('TestQueryExecution', 'jena-arq/src/test/java/org/apache/jena/sparql/exec/TestQueryExecution.java', (t) => {
  t('lateral_with_join', async () => {
    // GH-2896 LATERAL
    const qsReport = `SELECT * {
    BIND( 'x' AS ?xIn )
    LATERAL {
        VALUES ?x { 1 }
        { SELECT ?xIn ?xOut { BIND(?xIn AS ?xOut) } }
    }
}
`;
    // (table (row (?xIn 'x') (?x 1) (?xOut 'x') ) )
    const expected = Table.create(['xIn', 'x', 'xOut'], [{ xIn: str('x'), x: int(1), xOut: str('x') }]);
    const actual = await QueryExec.dataset(DatasetGraphFactory.empty()).query(qsReport).table();
    assertEquals(expected, actual);
  });

  t('lateral_with_nesting', async () => {
    // GH-2924
    const qsReport = `SELECT * {
    BIND(1 AS ?s)
    LATERAL {
        BIND(?s AS ?x)
        LATERAL {
            BIND(?s AS ?y)
        }
    }
}
`;
    // (table (row (?s 1) (?x 1) (?y 1) ) )
    const expected = Table.create(['s', 'x', 'y'], [{ s: int(1), x: int(1), y: int(1) }]);
    const actual = await QueryExec.dataset(DatasetGraphFactory.empty()).query(qsReport).table();
    assertEquals(expected, actual);
  });
});
