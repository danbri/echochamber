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
// Derived from Apache Jena (Apache License 2.0) at commit
// a1164c5dc5c9e1a9c58d94766c13d870e0a8ba98:
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateBuild.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. execute() answers a Promise (awaited); Jena's
// Transactional.execute(action) is executeWrite (which waits for a Promise).
// SSE.parseBinding("(binding (?x 123))") is a QuerySolutionMap. Iter.count(dsg.find())
// is dsg.find().toList().length. ARQ.getContext().copy() is a new Context; StreamManager.set(context, sm)
// is context.set of the StreamManager symbol IRI (leana has no StreamManager.set); the
// relative <file:testing/Update/empty.nt> is the copied fixture as a file: IRI.

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  DatasetGraphFactory, UpdateExec, UpdateFactory, UpdateException, QuerySolutionMap, NodeFactory, Context, StreamManager,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { FileBase } from './updatebase.mjs';

const XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
const insertData = 'INSERT DATA { <http://example/s> <http://example/p> 123 . }';
const update = UpdateFactory.create(insertData);
function binding(name, n) {
  const b = new QuerySolutionMap();
  b.add(name, NodeFactory.createLiteralDT(String(n), XSD_INTEGER));
  return b;
}

describeJena('TestUpdateBuild', 'jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateBuild.java', (t) => {
  t('update_build_01', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    await UpdateExec.newBuilder()
      .dataset(dsg)
      .update(update)
      .build()
      .execute();
    assert.ok(!dsg.getDefaultGraph().isEmpty());
  });

  t('update_build_02', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    const insertStr = 'INSERT { <http://example/s> <http://example/p> ?x } WHERE { }';
    const upd = UpdateFactory.create(insertStr);
    await UpdateExec.newBuilder()
      .dataset(dsg)
      .update(upd)
      .substitution(binding('x', 123))
      .build()
      .execute();
    assert.ok(!dsg.getDefaultGraph().isEmpty());
  });

  t('update_build_03', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    const insertStr = 'INSERT { <http://example/s> <http://example/p> 123 } WHERE { FILTER(?x = 456) }';
    const upd = UpdateFactory.create(insertStr);
    await UpdateExec.newBuilder()
      .dataset(dsg)
      .update(upd)
      .substitution(binding('x', 456))
      .build()
      .execute();
    assert.ok(!dsg.getDefaultGraph().isEmpty());
  });

  t('update_build_execute_1', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    assert.ok(dsg.isEmpty());
    await dsg.executeWrite(() => UpdateExec.newBuilder()
      .dataset(dsg)
      .update('INSERT DATA { <x:s> <x:p> <x:o> }')
      .execute());
    assert.ok(!dsg.isEmpty());
  });

  t('update_build_execute_2', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    assert.ok(dsg.isEmpty());
    await dsg.executeWrite(() => UpdateExec.newBuilder()
      .dataset(dsg)
      .update('INSERT DATA { <x:s> <x:p> <x:o1> }')
      .update('INSERT DATA { <x:s> <x:p> <x:o2> }')
      .execute());
    assert.equal(dsg.find().toList().length, 2);
  });

  t('update_build_context_1', async () => {
    const dsg = DatasetGraphFactory.createTxnMem();
    assert.ok(dsg.isEmpty());
    const context = new Context();
    const streamManager = new StreamManager();
    context.set('http://jena.apache.org/riot/streamManager', streamManager); // Jena StreamManager.set(context, streamManager)
    const upExec = UpdateExec.newBuilder()
      .context(context)
      .dataset(dsg)
      .update(`LOAD <${pathToFileURL(FileBase + '/empty.nt').href}>`)
      .build();
    await assert.rejects(() => dsg.executeWrite(() => upExec.execute()), UpdateException);
  });
});
