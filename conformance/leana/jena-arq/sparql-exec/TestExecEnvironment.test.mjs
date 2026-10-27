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
//   jena-arq/src/test/java/org/apache/jena/sparql/exec/TestExecEnvironment.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. TimeUnit arguments are dropped (milliseconds).
// try-with-resources is try/finally close().

import assert from 'node:assert/strict';
import { QueryExecutionFactory, QueryExecAdapter, QueryExecBuilderAdapter, QueryExecutionDatasetBuilder, DatasetFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

describeJena('TestExecEnvironment', 'jena-arq/src/test/java/org/apache/jena/sparql/exec/TestExecEnvironment.java', (t) => {
  /** QueryExecutionAdapter.adapt must not return null; see https://github.com/apache/jena/issues/1393 */
  t('testQueryExecAdapter', () => {
    const qExec = QueryExecutionFactory.create('SELECT * { ?s ?p ?o }', DatasetFactory.empty());
    try {
      const qe = QueryExecAdapter.adapt(qExec);
      assert.ok(qe !== null && qe !== undefined);
    } finally { qExec.close(); }
  });

  /** initialTimeout and overallTimeout are passed on to the delegate. This should succeed without errors. */
  t('testQueryExecutionDatasetBuilderWrapping', () => {
    const builder = QueryExecBuilderAdapter.adapt(QueryExecutionDatasetBuilder.create());
    const qe = builder
      .query('SELECT * { ?s ?p ?o }')
      .initialTimeout(1000)
      .timeout(2000)
      .overallTimeout(3000)
      .build();
    qe.close();
  });
});
