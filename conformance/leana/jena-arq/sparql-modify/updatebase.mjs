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
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/AbstractTestUpdateBase.java
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/AbstractTestUpdateGraph.java
//   jena-arq/src/test/java/org/apache/jena/sparql/modify/AbstractTestUpdateGraphMgt.java
//   (abstract; their methods run in each concrete subclass's file:
//   TestUpdateGraphMem, TestUpdateGraphMgtTxnMem, TestUpdateGraphMgtGeneralMem)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Updates answer a Promise (awaited). The scripts are
// read from the copied fixtures/jena-arq/testing/Update. NodeFactoryExtra.parseNode
// and SSE.parseNode/parseTriple/parseQuad are written as NodeFactory calls
// (SSE ':' is <http://example/>). UpdateExec is leana's UpdateExec;
// Iter.count(dsg.find()) is dsg.find().toList().length.

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  NodeFactory, Triple, Quad, GraphMemFactory, GraphFactory, GraphUtil, UpdateAction, UpdateExec, UpdateModify,
  UpdateDataInsert, UpdateDataDelete, UpdateDeleteWhere, QuadDataAcc, QuadAcc, QueryFactory, UpdateCopy, Target,
  UsingList, QueryException, UpdateCreate, UpdateDrop, UpdateAdd, DatasetGraphFactory,
} from '@factoidal/leana';

export const FileBase = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-arq', 'testing', 'Update');

const XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
const uri = (u) => NodeFactory.createURI(u);
const int = (n) => NodeFactory.createLiteralDT(String(n), XSD_INTEGER);
const v = (n) => NodeFactory.createVariable(n);

// AbstractTestUpdateBase
export function defaultGraphData(gStore, data) {
  const g = gStore.getDefaultGraph();
  g.clear();
  GraphUtil.addInto(g, data);
}
export function namedGraphData(gStore, gn, data) {
  let g = gStore.getGraph(gn);
  if (g === null || g === undefined) {
    gStore.addGraph(gn, GraphFactory.createDefaultGraph());
    g = gStore.getGraph(gn);
  } else g.clear();
  GraphUtil.addInto(g, data);
}
export const script = (gStore, filename) => UpdateAction.readExecute(FileBase + '/' + filename, gStore);
const graphEmpty = (g) => g.isEmpty();
const graphContains = (g, t) => g.contains(t);

// AbstractTestUpdateGraph
const s = uri('http://example/r');
const p = uri('http://example/p');
const q = uri('http://example/q');
const vv = uri('http://example/v');
const o1 = int(2007);
const triple1 = Triple.create(s, p, o1);
const o2 = int(1066);
const triple2 = Triple.create(s, p, o2);
const graphIRI = uri('http://example/graph');
function data(...triples) {
  const g = GraphMemFactory.createDefaultGraph();
  for (const t of triples) g.add(t);
  return g;
}
const data1 = () => data(triple1);
const data2 = () => data(triple2);
const graph1 = data1();
const countQuads = (dsg) => dsg.find().toList().length;

export function abstractTestUpdateGraph(t, getEmptyDatasetGraph) {
  t('testInsertData1', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const acc = new QuadDataAcc();
    acc.addTriple(triple2);
    const insert = new UpdateDataInsert(acc);
    const uProc = UpdateExec.dataset(gStore).update(insert).build();
    await uProc.execute();
    assert.ok(!graphEmpty(gStore.getDefaultGraph()));
    assert.ok(graphContains(gStore.getDefaultGraph(), triple1));
    assert.ok(graphContains(gStore.getDefaultGraph(), triple2));
  });

  t('testDeleteData1', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const acc = new QuadDataAcc();
    acc.addTriple(triple2);
    const del = new UpdateDataDelete(acc);
    await UpdateExec.dataset(gStore).update(del).build().execute();
    assert.ok(!graphEmpty(gStore.getDefaultGraph()));
    assert.ok(graphContains(gStore.getDefaultGraph(), triple1));
    assert.ok(!graphContains(gStore.getDefaultGraph(), triple2));
  });

  t('testDeleteData2', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const acc = new QuadDataAcc();
    acc.addTriple(triple1);
    const del = new UpdateDataDelete(acc);
    await UpdateExec.dataset(gStore).update(del).build().execute();
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
    assert.ok(!graphContains(gStore.getDefaultGraph(), triple1));
  });

  t('testInsert1', async () => {
    const gStore = getEmptyDatasetGraph();
    const insert = new UpdateModify();
    await UpdateAction.execute(insert, gStore);
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testInsert2', async () => {
    const gStore = getEmptyDatasetGraph();
    const insert = new UpdateModify();
    insert.getInsertAcc().addTriple(triple1);
    await UpdateAction.execute(insert, gStore);
    assert.ok(graphContains(gStore.getDefaultGraph(), triple1));
  });

  t('testInsert3', async () => {
    const gStore = getEmptyDatasetGraph();
    gStore.addGraph(graphIRI, GraphMemFactory.createDefaultGraph());
    const insert = new UpdateModify();
    insert.getInsertAcc().addQuad(Quad.create(graphIRI, triple1));
    await UpdateAction.execute(insert, gStore);
    assert.ok(graphContains(gStore.getGraph(graphIRI), triple1));
  });

  t('testInsert4', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const insert = new UpdateModify();
    insert.getInsertAcc().addTriple(Triple.create(v('s'), p, o2));
    const element = QueryFactory.createElement('{ ?s <http://example/p> 2007 }');
    insert.setElement(element);
    await UpdateAction.execute(insert, gStore);
    assert.ok(graphContains(gStore.getDefaultGraph(), triple2));
  });

  t('testDelete1', async () => {
    const gStore = getEmptyDatasetGraph();
    const acc = new QuadAcc();
    const del = new UpdateDeleteWhere(acc);
    await UpdateAction.execute(del, gStore);
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testDelete2', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const acc = new QuadAcc();
    const del = new UpdateDeleteWhere(acc);
    acc.addTriple(Triple.create(v('s'), v('p'), v('o')));
    await UpdateAction.execute(del, gStore);
    assert.ok(graphEmpty(gStore.getDefaultGraph()), 'Not empty');
  });

  t('testDelete3', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, graph1);
    const acc = new QuadDataAcc();
    const del = new UpdateDataDelete(acc);
    acc.addTriple(triple1);
    await UpdateAction.execute(del, gStore);
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testDelete4', async () => {
    const gStore = getEmptyDatasetGraph();
    namedGraphData(gStore, graphIRI, data1());
    const acc = new QuadDataAcc();
    const del = new UpdateDataDelete(acc);
    acc.setGraph(graphIRI);
    acc.addTriple(triple1);
    await UpdateAction.execute(del, gStore);
    assert.ok(graphEmpty(gStore.getGraph(graphIRI)));
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testDelete5', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, data2());
    namedGraphData(gStore, graphIRI, data1());
    const modify = new UpdateModify();
    const element = QueryFactory.createElement('{ ?s <http://example/p> ?o }');
    modify.setElement(element);
    modify.getDeleteAcc().addQuad(Quad.create(graphIRI, v('s'), p, o1));
    await UpdateAction.execute(modify, gStore);
    assert.ok(graphEmpty(gStore.getGraph(graphIRI)), 'Not empty');
    assert.ok(!graphEmpty(gStore.getDefaultGraph()));
  });

  t('testModify1', async () => {
    const gStore = getEmptyDatasetGraph();
    defaultGraphData(gStore, data2());
    namedGraphData(gStore, graphIRI, GraphMemFactory.createDefaultGraph());
    const modify = new UpdateModify();
    const element = QueryFactory.createElement('{ ?s <http://example/p> ?o }');
    modify.setElement(element);
    modify.getInsertAcc().addQuad(Quad.create(graphIRI, triple1));
    modify.getDeleteAcc().addTriple(Triple.create(v('s'), p, v('o')));
    modify.getDeleteAcc().addQuad(Quad.create(graphIRI, v('s'), p, v('o')));
    await UpdateAction.execute(modify, gStore);
    assert.ok(!graphEmpty(gStore.getGraph(graphIRI)));
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
    assert.ok(graphContains(gStore.getGraph(graphIRI), triple1));
  });

  t('testModify2', async () => {
    const tb = Triple.create(NodeFactory.createBlankNode(), p, o2);
    const gStore = getEmptyDatasetGraph();
    // Jena sets ARQ.spillToDiskThreshold to 0 here (forces spill to disk); leana has no spill.
    defaultGraphData(gStore, data(tb));
    namedGraphData(gStore, graphIRI, data(tb));
    const modify = new UpdateModify();
    const element = QueryFactory.createElement('{ ?s <http://example/p> ?o }');
    modify.setElement(element);
    modify.getInsertAcc().addQuad(Quad.create(graphIRI, triple1));
    modify.getDeleteAcc().addTriple(Triple.create(v('s'), p, v('o')));
    modify.getDeleteAcc().addQuad(Quad.create(graphIRI, v('s'), p, v('o')));
    await UpdateAction.execute(modify, gStore);
    assert.ok(!graphEmpty(gStore.getGraph(graphIRI)));
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
    assert.ok(graphContains(gStore.getGraph(graphIRI), triple1));
    assert.ok(!graphContains(gStore.getGraph(graphIRI), tb));
  });

  t('testCopy', async () => {
    const tb = Triple.create(NodeFactory.createBlankNode(), p, o2);
    const t2 = Triple.create(NodeFactory.createBlankNode(), p, o1);
    const gStore = getEmptyDatasetGraph();
    // Jena sets ARQ.spillToDiskThreshold to 0 here; leana has no spill.
    defaultGraphData(gStore, data(triple1, triple2, tb));
    namedGraphData(gStore, graphIRI, data(t2));
    const copy = new UpdateCopy(Target.DEFAULT, Target.create(graphIRI));
    await UpdateAction.execute(copy, gStore);
    assert.ok(!graphEmpty(gStore.getDefaultGraph()));
    assert.ok(!graphEmpty(gStore.getGraph(graphIRI)));
    assert.ok(graphContains(gStore.getGraph(graphIRI), triple1));
    assert.ok(graphContains(gStore.getGraph(graphIRI), triple2));
    assert.ok(graphContains(gStore.getGraph(graphIRI), tb));
    assert.ok(!graphContains(gStore.getGraph(graphIRI), t2));
    assert.ok(gStore.getDefaultGraph().isIsomorphicWith(gStore.getGraph(graphIRI)));
  });

  t('testUpdateInsertData', async () => {
    const dsg = getEmptyDatasetGraph();
    const updateStr = "INSERT DATA { <x:s> <x:p> 'dft' }";
    const bytes = new TextEncoder().encode(updateStr);
    const usingList = new UsingList();
    await UpdateAction.parseExecute(usingList, dsg, bytes);
    assert.equal(dsg.getDefaultGraph().size(), 1);
  });

  t('testUpdateDeleteData', async () => {
    const dsg = getEmptyDatasetGraph();
    dsg.add(Quad.create(Quad.defaultGraphNodeGenerated, uri('x:s'), uri('x:p'), uri('x:o')));
    assert.equal(dsg.getDefaultGraph().size(), 1);
    const updateStr = 'DELETE DATA { <x:s> <x:p> <x:o> }';
    const bytes = new TextEncoder().encode(updateStr);
    const usingList = new UsingList();
    await UpdateAction.parseExecute(usingList, dsg, bytes);
    assert.equal(dsg.getDefaultGraph().size(), 0);
  });

  t('testUpdateScript1', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'update-1.ru');
    assert.ok(graphContains(gStore.getDefaultGraph(), Triple.create(s, p, int(123))));
  });

  t('testUpdateScript2', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'update-2.ru');
    assert.ok(graphContains(gStore.getGraph(uri('http://example/g1')), Triple.create(s, p, int(123))));
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testUpdateScript3', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'update-3.ru');
    assert.ok(graphEmpty(gStore.getGraph(uri('http://example/g1'))));
    assert.ok(graphEmpty(gStore.getDefaultGraph()));
  });

  t('testUpdateScript4', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'data-1.ru');
    assert.ok(graphContains(gStore.getDefaultGraph(), Triple.create(s, p, int(123))));
  });

  t('testUpdateScript5', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'data-2.ru');
    const g = GraphFactory.createDefaultGraph();
    const b = NodeFactory.createBlankNode();
    g.add(Triple.create(s, p, b));
    g.add(Triple.create(b, q, vv));
    assert.ok(g.isIsomorphicWith(gStore.getDefaultGraph()));
  });

  t('testUpdateScript6', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'data-3.ru');
    assert.ok(graphContains(gStore.getGraph(graphIRI), Triple.create(s, p, int(123))));
  });

  t('testUpdateScript7', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'data-4.ru');
    assert.ok(graphContains(gStore.getDefaultGraph(), Triple.create(s, p, int(123))));
    assert.ok(graphContains(gStore.getGraph(graphIRI), Triple.create(s, p, o2)));
  });

  t('testUpdateScript8', async () => {
    const gn = uri('http://example/g');
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'data-5-with.ru');
    assert.ok(gStore.containsGraph(gn));
    const g = gStore.getGraph(gn);
    assert.equal(g.size(), 2);
    assert.equal(gStore.getDefaultGraph().size(), 0);
  });

  async function testBad(file, expectedSize) {
    // Bad queries may throw an exception or do a partial update (e.g. a template generates literals as subjects).
    const gStore = getEmptyDatasetGraph();
    await script(gStore, file);
    assert.equal(countQuads(gStore), expectedSize);
  }

  t('testUpdateBad1', async () => {
    await assert.rejects(() => testBad('bad-1.ru', 1), QueryException);
  });

  t('testUpdateBad2', async () => {
    await testBad('bad-2.ru', 1);
  });

  t('testUpdateBad3', async () => {
    await testBad('bad-3.ru', 0);
  });
}

// AbstractTestUpdateGraphMgt
const mgtGraphIRI = uri('http://example/graph');

export function abstractTestUpdateGraphMgt(t, getEmptyDatasetGraph) {
  t('testCreateDrop1', async () => {
    const gStore = getEmptyDatasetGraph();
    let u = new UpdateCreate(mgtGraphIRI);
    await UpdateAction.execute(u, gStore);
    assert.ok(graphEmpty(gStore.getGraph(mgtGraphIRI)));
    // With "auto SILENT" then these aren't errors (Jena: silentMode = true; the checks are not run).
    u = new UpdateDrop(mgtGraphIRI);
    await UpdateAction.execute(u, gStore);
    assert.ok(!gStore.containsGraph(mgtGraphIRI));
  });

  t('testCreateDrop2', async () => {
    const gStore = getEmptyDatasetGraph();
    let u = new UpdateCreate(mgtGraphIRI);
    await UpdateAction.execute(u, gStore);
    u = new UpdateCreate(mgtGraphIRI, true);
    await UpdateAction.execute(u, gStore);
    assert.ok(graphEmpty(gStore.getGraph(mgtGraphIRI)));
    u = new UpdateDrop(mgtGraphIRI);
    await UpdateAction.execute(u, gStore);
    assert.ok(!gStore.containsGraph(mgtGraphIRI));
    u = new UpdateDrop(mgtGraphIRI, true);
    await UpdateAction.execute(u, gStore);
  });

  t('testCreateDrop3', async () => {
    const gStore = getEmptyDatasetGraph();
    await script(gStore, 'create-1.ru');
    assert.ok(graphEmpty(gStore.getGraph(mgtGraphIRI)));
  });

  t('testCreateDrop4', async () => {
    const gStore = getEmptyDatasetGraph();
    gStore.addGraph(mgtGraphIRI, GraphFactory.createDefaultGraph());
    await script(gStore, 'drop-1.ru');
    assert.ok(!gStore.containsGraph(mgtGraphIRI));
  });

  t('testAdd', async () => {
    const gStore = DatasetGraphFactory.create();
    const g1 = uri('http://example/g1');
    const g2 = uri('http://example/g2');
    gStore.add(Quad.create(g1, uri('http://example/s'), uri('http://example/p'), uri('http://example/o')));
    // ADD GRAPH :g1 TO GRAPH :g2, not SILENT
    const add = new UpdateAdd(Target.create(g1), Target.create(g2), false);
    assert.ok(!gStore.containsGraph(g2));
    await UpdateAction.execute(add, gStore);
    assert.ok(gStore.containsGraph(g2));
  });
}
