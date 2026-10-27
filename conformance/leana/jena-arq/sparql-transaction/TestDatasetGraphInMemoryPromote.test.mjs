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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryPromote.java
//   jena-arq/src/test/java/org/apache/jena/sparql/transaction/AbstractTestTransPromote.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. It carries the abstract class AbstractTestTransPromote,
// run over new DatasetGraphInMemory() (getTransactionExceptionClass() is
// JenaTransactionException). The logger level changes (@BeforeEach,
// @AfterEach) are left out. The methods that run a second transaction on
// another thread (ThreadTxn, Thread, ExecutorService, Semaphore) are Java-only:
// not-ported/TestDatasetGraphInMemoryPromote.json. Iter.count(dsg.find()) is
// dsg.find().toList().length.

import assert from 'node:assert/strict';
import { DatasetGraphInMemory, TxnType, ReadWrite, Txn, JenaTransactionException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { parseQuad } from '../sparql-core/sse.mjs';

const q1 = parseQuad('(_ :s :p1 1)');
const q2 = parseQuad('(_ :s :p2 2)');
const create = () => new DatasetGraphInMemory();

function assertCount(expected, dsg) {
  dsg.begin(ReadWrite.READ);
  const x = dsg.find().toList().length;
  dsg.end();
  assert.equal(x, expected);
}

const runs = {
  run_01(txnType) {
    const dsg = create();
    dsg.begin(txnType); dsg.add(q1); dsg.commit(); dsg.end();
  },
  run_02(txnType) {
    const dsg = create();
    dsg.begin(txnType); dsg.end();
    dsg.begin(txnType); dsg.add(q1); dsg.commit(); dsg.end();
  },
  run_03(txnType) {
    const dsg = create();
    dsg.begin(TxnType.WRITE); dsg.commit(); dsg.end();
    dsg.begin(txnType); dsg.add(q1); dsg.commit(); dsg.end();
  },
  run_04(txnType) {
    const dsg = create();
    dsg.begin(ReadWrite.WRITE); dsg.abort(); dsg.end();
    dsg.begin(txnType); dsg.add(q1); dsg.commit(); dsg.end();
  },
  run_05(txnType) {
    const dsg = create();
    dsg.begin(txnType);
    dsg.add(q1);
    try {
      dsg.end();
      assert.fail('begin(W);end() did not throw an exception');
    } catch (e) { if (!(e instanceof JenaTransactionException)) throw e; }
    assertCount(0, dsg);
  },
  run_08(txnType) {
    const dsg = create();
    dsg.begin(txnType); dsg.add(q1); dsg.add(q2); dsg.commit(); dsg.end();
    Txn.executeRead(dsg, () => {
      assert.equal(dsg.find().toList().length, 2);
    });
  },
};

describeJena('TestDatasetGraphInMemoryPromote', 'jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryPromote.java', (t) => {
  for (const n of ['01', '02', '03', '04', '05', '08']) {
    t('promote_snapshot_' + n, () => runs['run_' + n](TxnType.READ_PROMOTE));
    t('promote_readCommitted_' + n, () => runs['run_' + n](TxnType.READ_COMMITTED_PROMOTE));
  }
});
