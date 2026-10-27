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
//   jena-arq/src/test/java/org/apache/jena/sparql/transaction/TestTransactionSupport.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterized over seven datasets; its
// one method txn_support runs once per dataset, named `txn_support[<label>]`.

import assert from 'node:assert/strict';
import { DatasetGraphFactory, DatasetGraphZero, DatasetGraphSink, GraphFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

const args = [
  ['createTxnMem', () => DatasetGraphFactory.createTxnMem(), true, true],
  ['createGeneral', () => DatasetGraphFactory.createGeneral(), true, false],
  ['create', () => DatasetGraphFactory.create(), true, false],
  ['wrap(Graph)', () => DatasetGraphFactory.wrap(GraphFactory.createDefaultGraph()), true, false],
  ['zero', () => DatasetGraphZero.create(), true, true],
  ['sink', () => DatasetGraphSink.create(), true, true],
  ['create(Graph)', () => DatasetGraphFactory.create(GraphFactory.createDefaultGraph()), true, false],
];

describeJena('TestTransactionSupport', 'jena-arq/src/test/java/org/apache/jena/sparql/transaction/TestTransactionSupport.java', (t) => {
  for (const [name, maker, supportsTxn, supportsAbort] of args) {
    t(`txn_support[${name}]`, () => {
      const dsg = maker();
      assert.equal(dsg.supportsTransactions(), supportsTxn, 'supports');
      assert.equal(dsg.supportsTransactionAbort(), supportsAbort, 'supportsAbort');
    });
  }
});
