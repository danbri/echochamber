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
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateSilent.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Updates answer a Promise (awaited); assertThrows is
// assert.rejects. DatasetGraphOne.create(g) is new DatasetGraphOne(g). The
// relative <file:testing/Update/empty.nt> is the copied fixture as a file: IRI.

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { DatasetGraphOne, GraphFactory, UpdateExec, UpdateException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { FileBase } from './updatebase.mjs';

const EMPTY = pathToFileURL(FileBase + '/empty.nt').href;

async function test(updateRequest) {
  // A characteristic of DatasetGraphOne is that it has no named graphs and they can't be added.
  const dataset = new DatasetGraphOne(GraphFactory.createGraphMem());
  await UpdateExec.dataset(dataset).update(updateRequest).build().execute();
}

describeJena('TestUpdateSilent', 'jena-arq/src/test/java/org/apache/jena/sparql/modify/TestUpdateSilent.java', (t) => {
  t('LOAD_toNonExistingGraph', async () => {
    await assert.rejects(() => test(`LOAD <${EMPTY}> INTO GRAPH <http://example/no-such-graph>`), UpdateException);
  });
  t('LOAD_SILENT_toNonExistingGraph', async () => {
    await test(`LOAD SILENT <${EMPTY}> INTO GRAPH <http://example/no-such-graph>`);
  });
  t('CLEAR_nonExistingGraph', async () => {
    await assert.rejects(() => test('CLEAR GRAPH <http://example/no-such-graph>'), UpdateException);
  });
  t('CLEAR_SILENT_nonExistingGraph', async () => {
    await test('CLEAR SILENT GRAPH <http://example/no-such-graph>');
  });
  t('CREATE_nonExistingGraph', async () => {
    // The target is DatasetGraphOne which does not provide named graphs.
    await assert.rejects(() => test(`CREATE GRAPH <${EMPTY}>`), UpdateException);
  });
  t('CREATE_SILENT_nonExistingGraph', async () => {
    await test(`CREATE SILENT GRAPH <${EMPTY}>`);
  });
  t('DROP_ofNonExistingGraph', async () => {
    // DROP non-existent is not an error.
    await test('DROP GRAPH <http://example/no-such-graph>');
  });
  t('DROP_SILENT_ofNonExistingGraph', async () => {
    await test('DROP SILENT GRAPH <http://example/no-such-graph>');
  });
  t('COPY_toNonExistingGraph', async () => {
    await assert.rejects(() => test('COPY DEFAULT TO <http://example/no-such-graph>'), UpdateException);
  });
  t('COPY_SILENT_toNonExistingGraph', async () => {
    await test('COPY SILENT DEFAULT TO <http://example/no-such-graph>');
  });
  t('COPY_fromNonExistingGraph', async () => {
    await assert.rejects(() => test('COPY <http://example/no-such-graph> TO DEFAULT'), UpdateException);
  });
  t('COPY_SILENT_fromNonExistingGraph', async () => {
    await test('COPY SILENT <http://example/no-such-graph> TO DEFAULT');
  });
  t('MOVE_toNonExistingGraph_isError', async () => {
    await assert.rejects(() => test('MOVE DEFAULT TO <http://example/no-such-graph>'), UpdateException);
  });
  t('MOVE_SILENT_toNonExistingGraph', async () => {
    await test('MOVE SILENT DEFAULT TO <http://example/no-such-graph>');
  });
  t('MOVE_fromNonExistingGraph', async () => {
    await assert.rejects(() => test('MOVE <http://example/no-such-graph> TO DEFAULT'), UpdateException);
  });
  t('MOVE_SILENT_fromNonExistingGraph', async () => {
    await test('MOVE SILENT <http://example/no-such-graph> TO DEFAULT');
  });
  t('ADD_toNonExistingGraph', async () => {
    await assert.rejects(() => test('ADD DEFAULT TO <http://example/no-such-graph>'), UpdateException);
  });
  t('ADD_SILENT_toNonExistingGraph', async () => {
    await test('ADD SILENT DEFAULT TO <http://example/no-such-graph>');
  });
  t('ADD_fromNonExistingGraph', async () => {
    await assert.rejects(() => test('ADD <http://example/no-such-graph> TO DEFAULT'), UpdateException);
  });
  t('ADD_SILENT_fromNonExistingGraph', async () => {
    await test('ADD SILENT <http://example/no-such-graph> TO DEFAULT');
  });
});
