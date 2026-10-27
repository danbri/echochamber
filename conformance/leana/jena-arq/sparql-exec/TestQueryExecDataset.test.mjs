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
//   jena-arq/src/test/java/org/apache/jena/sparql/exec/TestQueryExecDataset.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Var.alloc("s") is the name 's'; SSE.parseNode(":x")
// is <http://example/x> (SSE's default prefix).

import assert from 'node:assert/strict';
import { QueryExec, DatasetGraphFactory, NodeFactory, Symbol_ } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const testSymbol = Symbol_.create('a:b:c');

describeJena('TestQueryExecDataset', 'jena-arq/src/test/java/org/apache/jena/sparql/exec/TestQueryExecDataset.java', (t) => {
  t('queryExec_substitution_01', () => {
    const queryExec = QueryExec.dataset(DatasetGraphFactory.empty())
      .query('SELECT * { ?s ?p ?o }')
      .substitution('s', NodeFactory.createURI('http://example/x'))
      .build();
    const query = queryExec.getQuery();
    const s = query.toString();
    assert.ok(s.includes('http://example/x'));
  });

  t('queryExec_substitution_02', () => {
    const builder = QueryExec.dataset(DatasetGraphFactory.empty())
      .query('SELECT * { ?s ?p ?o }')
      .set(testSymbol, 'TRUE')
      .substitution('s', NodeFactory.createURI('http://example/x'));

    const queryExec = builder.build();
    const cxt = queryExec.getContext();

    assert.ok(cxt.isDefined(testSymbol));
    assertEquals('TRUE', cxt.get(testSymbol));

    builder.set(testSymbol, 'FALSE');
    assertEquals('TRUE', cxt.get(testSymbol));

    // Different context.
    const cxt2 = builder.build().getContext();
    assertEquals('FALSE', cxt2.get(testSymbol));
  });
});
