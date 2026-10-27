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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryTransactions.java
//   jena-arq/src/test/java/org/apache/jena/sparql/transaction/AbstractTestTransactionLifecycle.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. It carries the abstract class
// AbstractTestTransactionLifecycle, run over DatasetFactory.createTxnMem()
// (supportsAbort() and supportsPromote() are true, so no assumeTrue skips).
// LogCtl calls (logging only) are left out. transaction_err_nontxn_commit_1
// has no @Test in Jena and is not a test here either. The two concurrency
// methods need threads: not-ported/TestDatasetGraphInMemoryTransactions.json.

import assert from 'node:assert/strict';
import { DatasetFactory, TxnType, ReadWrite, Promote, JenaTransactionException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertThrows } from '../../lib/testlib.mjs';

const create = () => DatasetFactory.createTxnMem();

const read1 = (ds) => { ds.begin(TxnType.READ); assert.ok(ds.isInTransaction()); ds.commit(); assert.ok(!ds.isInTransaction()); ds.end(); };
const read2 = (ds) => { ds.begin(TxnType.READ); assert.ok(ds.isInTransaction()); ds.end(); assert.ok(!ds.isInTransaction()); };
const write = (ds) => { ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction()); ds.commit(); assert.ok(!ds.isInTransaction()); ds.end(); };
const safeEnd = (ds) => { try { ds.end(); } catch (e) { if (!(e instanceof JenaTransactionException)) throw e; } };

/** try { action; fail(msg) } catch (JenaTransactionException) { after(ds) } */
function expectTxnError(ds, action, msg, after) {
  let err = null;
  try { action(); } catch (e) { err = e; }
  if (err === null) assert.fail(msg);
  if (!(err instanceof JenaTransactionException)) throw err;
  after(ds);
}
function testBeginBegin(t1, t2) {
  const ds = create();
  ds.begin(t1);
  expectTxnError(ds, () => ds.begin(t2), `Expected transaction exception - begin-begin (${t1}, ${t2})`, safeEnd);
}
function testCommitCommit(tt) {
  const ds = create();
  ds.begin(tt); ds.commit();
  expectTxnError(ds, () => ds.commit(), `Expected transaction exception - commit-commit(${tt})`, safeEnd);
}
function testCommitAbort(tt) {
  const ds = create();
  ds.begin(tt); ds.commit();
  expectTxnError(ds, () => ds.abort(), `Expected transaction exception - commit-abort(${tt})`, safeEnd);
}
function testAbortAbort(tt) {
  const ds = create();
  ds.begin(tt); ds.abort();
  expectTxnError(ds, () => ds.abort(), `Expected transaction exception - abort-abort(${tt})`, (d) => d.end());
}
function testAbortCommit(tt) {
  const ds = create();
  ds.begin(tt); ds.abort();
  expectTxnError(ds, () => ds.commit(), `Expected transaction exception - abort-commit(${tt})`, safeEnd);
}
function testPromote(txnType, promoteMode, succeeds) {
  const ds = create();
  ds.begin(txnType);
  assert.ok(ds.isInTransaction());
  const b1 = ds.promote(promoteMode);
  assert.equal(b1, succeeds);
  const b2 = ds.promote(promoteMode);
  assert.equal(b2, b1, 'Try same promote again');
  ds.commit();
  ds.end();
}
function transaction_promote_write(txnType) {
  const ds = create();
  ds.begin(txnType); ds.promote(); ds.commit(); ds.end();
  ds.begin(TxnType.WRITE); ds.commit(); ds.end();
}

describeJena('TestDatasetGraphInMemoryTransactions', 'jena-arq/src/test/java/org/apache/jena/sparql/core/mem/TestDatasetGraphInMemoryTransactions.java', (t) => {
  t('transaction_00', () => assert.ok(create().supportsTransactions()));
  t('transaction_r01', () => {
    const ds = create();
    ds.begin(TxnType.READ); assert.ok(ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_r02', () => {
    const ds = create();
    ds.begin(TxnType.READ); assert.ok(ds.isInTransaction());
    ds.commit(); assert.ok(!ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_r03', () => {
    const ds = create();
    ds.begin(TxnType.READ); assert.ok(ds.isInTransaction());
    ds.abort(); assert.ok(!ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_r04', () => {
    const ds = create();
    ds.begin(ReadWrite.READ); assert.ok(ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w01', () => {
    const ds = create();
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.commit(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w02', () => {
    const ds = create();
    ds.begin(ReadWrite.WRITE); assert.ok(ds.isInTransaction());
    ds.commit(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w03', () => {
    const ds = create();
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.abort(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w04', () => {
    const ds = create();
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.commit(); assert.ok(!ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w05', () => {
    const ds = create();
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.abort(); assert.ok(!ds.isInTransaction());
    ds.end(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_w06', () => {
    const ds = create();
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.abort(); assert.ok(!ds.isInTransaction());
    ds.begin(TxnType.WRITE); assert.ok(ds.isInTransaction());
    ds.abort(); assert.ok(!ds.isInTransaction());
  });
  t('transaction_p01', () => {
    const ds = create();
    ds.begin(TxnType.READ_PROMOTE);
    assert.equal(ds.transactionType(), TxnType.READ_PROMOTE);
    assert.ok(ds.isInTransaction());
    assert.equal(ds.transactionMode(), ReadWrite.READ);
    ds.promote();
    assert.equal(ds.transactionMode(), ReadWrite.WRITE);
    ds.commit(); ds.end();
  });
  t('transaction_p02', () => {
    const ds = create();
    ds.begin(TxnType.READ_COMMITTED_PROMOTE);
    assert.equal(ds.transactionType(), TxnType.READ_COMMITTED_PROMOTE);
    assert.ok(ds.isInTransaction());
    assert.equal(ds.transactionMode(), ReadWrite.READ);
    assert.ok(ds.promote());
    assert.equal(ds.transactionMode(), ReadWrite.WRITE);
    ds.commit(); ds.end();
  });
  t('transaction_p03', () => {
    const ds = create();
    ds.begin(TxnType.READ_PROMOTE);
    assert.ok(ds.isInTransaction());
    assert.equal(ds.transactionMode(), ReadWrite.READ);
    assert.ok(ds.promote());
    assert.equal(ds.transactionMode(), ReadWrite.WRITE);
    ds.abort(); ds.end();
    assert.ok(!ds.isInTransaction());
  });
  t('transaction_p04', () => {
    const ds = create();
    ds.begin(TxnType.READ_COMMITTED_PROMOTE);
    assert.ok(ds.isInTransaction());
    assert.equal(ds.transactionMode(), ReadWrite.READ);
    assert.ok(ds.promote());
    assert.equal(ds.transactionMode(), ReadWrite.WRITE);
    ds.abort(); ds.end();
    assert.ok(!ds.isInTransaction());
  });
  t('transaction_p05', () => {
    const ds = create();
    ds.begin(TxnType.READ_COMMITTED_PROMOTE);
    assert.ok(ds.isInTransaction());
    assert.ok(ds.promote());
    assert.ok(ds.promote());
    ds.commit(); ds.end();
  });
  t('transaction_p06_err', () => {
    const ds = create();
    ds.begin(TxnType.READ);
    assert.ok(ds.isInTransaction());
    assert.equal(ds.promote(), false);
    assert.equal(ds.promote(), false);
    ds.end();
  });
  t('transaction_p10', () => transaction_promote_write(TxnType.READ_COMMITTED_PROMOTE));
  t('transaction_p11', () => transaction_promote_write(TxnType.READ_PROMOTE));
  t('transaction_promote_write_isolated', () => testPromote(TxnType.WRITE, Promote.ISOLATED, true));
  t('transaction_promote_write_readCommitted', () => testPromote(TxnType.WRITE, Promote.READ_COMMITTED, true));
  t('transaction_promote_read_isolated', () => testPromote(TxnType.READ, Promote.ISOLATED, false));
  t('transaction_promote_read_readCommitted', () => testPromote(TxnType.READ, Promote.READ_COMMITTED, false));
  t('transaction_promote_readPromote_isolated', () => testPromote(TxnType.READ_PROMOTE, Promote.ISOLATED, true));
  t('transaction_promote_readPromote_committed', () => testPromote(TxnType.READ_PROMOTE, Promote.READ_COMMITTED, true));
  t('transaction_promote_readCommitted_isolated', () => testPromote(TxnType.READ_COMMITTED_PROMOTE, Promote.ISOLATED, true));
  t('transaction_promote_readCommitted_readCommitted', () => testPromote(TxnType.READ_COMMITTED_PROMOTE, Promote.READ_COMMITTED, true));
  t('transaction_read_promote', () => {
    const ds = create();
    ds.begin(TxnType.READ);
    assert.equal(ds.promote(), false);
    ds.commit(); ds.end();
  });
  t('transaction_pattern_01', () => { const ds = create(); read1(ds); read1(ds); });
  t('transaction_pattern_02', () => { const ds = create(); read2(ds); read2(ds); });
  t('transaction_pattern_03', () => { const ds = create(); write(ds); write(ds); });
  t('transaction_pattern_04', () => { const ds = create(); write(ds); read2(ds); read2(ds); write(ds); read2(ds); });
  t('transaction_err_nontxn_commit_2', () => {
    const ds = create();
    ds.begin(TxnType.READ); ds.end();
    assertThrows(JenaTransactionException, () => ds.commit());
  });
  t('transaction_err_nontxn_commit_3', () => {
    const ds = create();
    ds.begin(TxnType.WRITE);
    assertThrows(JenaTransactionException, () => ds.end());
  });
  t('transaction_err_nontxn_abort_1', () => {
    const ds = create();
    assertThrows(JenaTransactionException, () => ds.abort());
  });
  t('transaction_err_nontxn_abort_2', () => {
    const ds = create();
    ds.begin(TxnType.READ); ds.end();
    assertThrows(JenaTransactionException, () => ds.abort());
  });
  t('transaction_err_nontxn_abort_3', () => {
    const ds = create();
    ds.begin(TxnType.WRITE);
    assertThrows(JenaTransactionException, () => ds.end());
  });
  t('transaction_err_01', () => testBeginBegin(TxnType.WRITE, TxnType.WRITE));
  t('transaction_err_02', () => testBeginBegin(TxnType.WRITE, TxnType.READ));
  t('transaction_err_03', () => testBeginBegin(TxnType.READ, TxnType.READ));
  t('transaction_err_04', () => testBeginBegin(TxnType.READ, TxnType.WRITE));
  t('transaction_err_05', () => testCommitCommit(TxnType.READ));
  t('transaction_err_06', () => testCommitCommit(TxnType.WRITE));
  t('transaction_err_07', () => testCommitAbort(TxnType.READ));
  t('transaction_err_08', () => testCommitAbort(TxnType.WRITE));
  t('transaction_err_09', () => testAbortAbort(TxnType.READ));
  t('transaction_err_10', () => testAbortAbort(TxnType.WRITE));
  t('transaction_err_11', () => testAbortCommit(TxnType.READ));
  t('transaction_err_12', () => testAbortCommit(TxnType.WRITE));
});
