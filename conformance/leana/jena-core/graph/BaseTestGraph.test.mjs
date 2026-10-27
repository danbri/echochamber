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
//   jena-core/src/test/java/org/apache/jena/graph/BaseTestGraph.java
//   (abstract; run once here with getNewGraph() = GraphMemFactory.createGraphMem())
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Java Sets are JenaSet; RecordingListener is not ported
// (the event tests stop at getEventManager(), gap 'echo'); the
// testModelEquals files are read from conformance/leana/fixtures with a
// StringReader instead of the class loader. failingTestDoubleRemoveAll is not
// an @Test in Jena and is not ported.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  Node, Triple, GraphMemFactory, GraphUtil, ModelFactory, ReifierStd, JenaSet, JenaException,
  UnsupportedOperationException, StringReader,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  create, createTriple, node, nodeSet, triple, tripleArray, graphAdd, graphWith, assertContainsAll,
  assertOmitsAll, assertIsomorphic, assertEquals, assertDiffer, testContains, testOmits,
} from '../../lib/testlib.mjs';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core', 'regression', 'testModelEquals');

const getNewGraph = () => GraphMemFactory.createGraphMem();
function getGraphWith(facts) {
  const g = getNewGraph();
  graphAdd(g, facts);
  return g;
}

const SPO = createTriple('S P O');
// RecordingListener L: the listener tests stop at getEventManager() (gap 'echo').
const L = {};

function getAndRegister(gl) {
  const g = getNewGraph();
  g.getEventManager().register(gl);
  return g;
}

function setMinus(A, B) {
  const r = new JenaSet(A);
  for (const x of B) r.remove(x);
  return r;
}

function assertSameUnordered(x1, exclude, expected) {
  const ex = new JenaSet(exclude);
  const x = x1.filter((n) => !ex.contains(n));
  assert.equal(x.length, expected.length);
  assertEquals(new JenaSet(expected), new JenaSet(x));
}

function copy(g) {
  const result = GraphMemFactory.createDefaultGraph();
  GraphUtil.addInto(result, g);
  return result;
}
function removeGraph(toUpdate, toRemove) {
  GraphUtil.deleteFrom(toUpdate, toRemove);
  return toUpdate;
}

describeJena('BaseTestGraph', 'jena-core/src/test/java/org/apache/jena/graph/BaseTestGraph.java', (t) => {
  t('testCloseSetsIsClosed', () => {
    const g = getNewGraph();
    assert.ok(!g.isClosed(), 'unclosed Graph should not be isClosed()');
    g.close();
    assert.ok(g.isClosed(), 'closed Graph should be isClosed()');
  });

  t('testFindAndContains', () => {
    const g = getNewGraph();
    const r = create('r'), s = create('s'), p = create('P');
    g.add(Triple.create(r, p, s));
    assert.ok(g.contains(r, p, Node.ANY));
    assert.equal(g.find(r, p, Node.ANY).toList().length, 1);
  });

  t('testRepeatedSubjectDoesNotConceal', () => {
    const g = getGraphWith('s P o; s Q r');
    for (const f of ['s P o', 's Q r', '?? P o', '?? Q r', '?? P ??', '?? Q ??']) assert.ok(g.contains(triple(f)), f);
  });

  t('testFindByFluidTriple', () => {
    const g = getGraphWith('x y z ');
    const expect = new JenaSet([triple('x y z')]);
    assertEquals(expect, g.find(triple('?? y z')).toSet());
    assertEquals(expect, g.find(triple('x ?? z')).toSet());
    assertEquals(expect, g.find(triple('x y ??')).toSet());
  });

  t('testContainsConcrete', () => {
    const g = getGraphWith('s P o; _x _R _y; x S 0');
    assert.ok(g.contains(triple('s P o')));
    assert.ok(g.contains(triple('_x _R _y')));
    assert.ok(g.contains(triple('x S 0')));
    assert.ok(!g.contains(triple('s P Oh')));
    assert.ok(!g.contains(triple('S P O')));
    assert.ok(!g.contains(triple('s p o')));
    assert.ok(!g.contains(triple('_x _r _y')));
    assert.ok(!g.contains(triple('x S 1')));
  });

  t('testContainsFluid', () => {
    const g = getGraphWith('x R y; a P b');
    for (const f of ['?? R y', 'x ?? y', 'x R ??', '?? P b', 'a ?? b', 'a P ??', '?? R y']) assert.ok(g.contains(triple(f)), f);
    for (const f of ['?? R b', 'a ?? y', 'x P ??', '?? R x', 'x ?? R', 'a S ??']) assert.ok(!g.contains(triple(f)), f);
  });

  t('testMatchLanguagedLiteralCaseInsensitive', () => {
    const m = graphWith("a p 'chat'en");
    const chaten = node("'chat'en"), chatEN = node("'chat'EN");
    assertEquals(chaten, chatEN);
    assert.ok(chaten.sameValueAs(chatEN));
    assertEquals(chaten.getIndexingValue(), chatEN.getIndexingValue());
    assert.equal(m.find(Node.ANY, Node.ANY, chaten).toList().length, 1);
    assert.equal(m.find(Node.ANY, Node.ANY, chatEN).toList().length, 1);
  });

  t('testMatchBothLanguagedLiteralsCaseInsensitive', () => {
    const m = graphWith("a p 'chat'en; a p 'chat'EN");
    const chaten = node("'chat'en"), chatEN = node("'chat'EN");
    assertEquals(chaten, chatEN);
    assert.ok(chaten.sameValueAs(chatEN));
    assertEquals(chaten.getIndexingValue(), chatEN.getIndexingValue());
    assert.equal(m.find(Node.ANY, Node.ANY, chaten).toList().length, 1);
    assert.equal(m.find(Node.ANY, Node.ANY, chatEN).toList().length, 1);
  });

  t('testIsEmpty', () => {
    const g = getNewGraph();
    if (g.isEmpty()) { // canBeEmpty(g)
      assert.ok(g.isEmpty());
      g.add(createTriple('S P O'));
      assert.ok(!g.isEmpty());
      g.add(createTriple('A B C'));
      assert.ok(!g.isEmpty());
      g.add(createTriple('S P O'));
      assert.ok(!g.isEmpty());
      g.delete(createTriple('S P O'));
      assert.ok(!g.isEmpty());
      g.delete(createTriple('A B C'));
      assert.ok(g.isEmpty());
    }
  });

  t('testAGraph', () => {
    const title = 'BaseTestGraph';
    const g = getNewGraph();
    const baseSize = g.size();
    graphAdd(g, 'x R y; p S q; a T b');
    assertContainsAll(title + ': simple graph', g, 'x R y; p S q; a T b');
    assert.equal(g.size(), baseSize + 3, title + ': size');
    graphAdd(g, 'spindizzies lift cities; Diracs communicate instantaneously');
    assert.equal(g.size(), baseSize + 5, title + ': size after adding');
    g.delete(triple('x R y'));
    g.delete(triple('a T b'));
    assert.equal(g.size(), baseSize + 3, title + ': size after deleting');
    assertContainsAll(title + ': modified simple graph', g, 'p S q; spindizzies lift cities; Diracs communicate instantaneously');
    assertOmitsAll(title + ': modified simple graph', g, 'x R y; a T b');
    const it = g.find(Node.ANY, node('lift'), Node.ANY);
    assert.ok(it.hasNext(), title + ': finds some triple(s)');
    assertEquals(triple('spindizzies lift cities'), it.next(), title + ": finds a 'lift' triple");
    assert.ok(!it.hasNext(), title + ': finds exactly one triple');
    it.close();
  });

  const swallowUOE = (fn) => { try { fn(); } catch (e) { if (!(e instanceof UnsupportedOperationException)) throw e; } };

  t('testHasTransactions', () => {
    const g = getNewGraph();
    const th = g.getTransactionHandler();
    th.transactionsSupported();
    swallowUOE(() => th.begin());
    swallowUOE(() => th.abort());
    swallowUOE(() => { th.begin(); th.commit(); });
    swallowUOE(() => th.execute(() => {}));
  });

  t('testExecuteInTransactionCatchesThrowable', () => {
    const g = getNewGraph();
    const th = g.getTransactionHandler();
    try { th.executeAlways(() => { throw new Error(); }); } catch (x) { if (!(x instanceof JenaException)) throw x; }
  });

  t('testCalculateInTransactionCatchesThrowable', () => {
    const g = getNewGraph();
    const th = g.getTransactionHandler();
    try { th.calculateAlways(() => { throw new Error(); }); } catch (x) { if (!(x instanceof JenaException)) throw x; }
  });

  const tArray = tripleArray('S P O; A R B; X Q Y');
  const tList = tripleArray('i lt j; p equals q');
  const setTriples = tripleArray('scissors cut paper; paper wraps stone; stone breaks scissors');
  const tSet = new JenaSet(setTriples);
  const setIter = () => tSet[Symbol.iterator]();

  t('testBulkUpdate', () => {
    const g = getNewGraph();
    const items = graphWith('pigs might fly; dead can dance');
    const initialSize = g.size();
    GraphUtil.add(g, tArray);
    testContains(g, tArray);
    testOmits(g, tList);
    GraphUtil.add(g, tList);
    testContains(g, tList);
    testContains(g, tArray);
    GraphUtil.add(g, setIter());
    testContains(g, setIter());
    testContains(g, tList);
    testContains(g, tArray);
    GraphUtil.addInto(g, items);
    testContains(g, items);
    testContains(g, setIter());
    testContains(g, tArray);
    testContains(g, tList);
    GraphUtil.delete(g, tArray);
    testOmits(g, tArray);
    testContains(g, tList);
    testContains(g, setIter());
    testContains(g, items);
    GraphUtil.delete(g, setIter());
    testOmits(g, setIter());
    testOmits(g, tArray);
    testContains(g, tList);
    testContains(g, items);
    GraphUtil.deleteFrom(g, items);
    testOmits(g, setIter());
    testOmits(g, tArray);
    testContains(g, tList);
    testOmits(g, items);
    GraphUtil.delete(g, tList);
    assert.equal(g.size(), initialSize, 'graph has original size');
  });

  t('testAddWithReificationPreamble', () => {
    const g = getNewGraph();
    ReifierStd.reifyAs(g, create('x'), createTriple('S P O')); // xSPO(g)
    assert.ok(!g.isEmpty());
  });

  function testRemove(findRemove, findCheck) {
    const g = getGraphWith('S P O');
    const it = g.find(createTriple(findRemove));
    try {
      it.next();
      it.remove();
      it.close();
      assert.equal(g.size(), 0, 'remove with ' + findRemove + ':');
      assert.ok(!g.contains(createTriple(findCheck)));
    } catch (e) {
      if (!(e instanceof UnsupportedOperationException)) throw e;
      it.close();
    }
  }

  t('testRemove', () => {
    testRemove('?? ?? ??', '?? ?? ??');
    testRemove('S ?? ??', 'S ?? ??');
    testRemove('S ?? ??', '?? P ??');
    testRemove('S ?? ??', '?? ?? O');
    testRemove('?? P ??', 'S ?? ??');
    testRemove('?? P ??', '?? P ??');
    testRemove('?? P ??', '?? ?? O');
    testRemove('?? ?? O', 'S ?? ??');
    testRemove('?? ?? O', '?? P ??');
    testRemove('?? ?? O', '?? ?? O');
  });

  t('testFind', () => {
    const g = getNewGraph();
    graphAdd(g, 'S P O');
    assertDiffer(new JenaSet(), g.find(Node.ANY, Node.ANY, Node.ANY).toSet());
    assertDiffer(new JenaSet(), g.find(Triple.ANY).toSet());
  });

  t('testEventRegister', () => {
    const g = getNewGraph();
    const gem = g.getEventManager();
    assert.equal(gem.register(L), gem);
  });

  t('testEventUnregister', () => {
    getNewGraph().getEventManager().unregister(L);
  });

  // The listener tests below need GraphEventManager and RecordingListener:
  // each stops at getEventManager() (gap 'echo').
  t('testAddTriple', () => { const g = getAndRegister(L); g.add(SPO); });
  t('testDeleteTriple', () => { const g = getAndRegister(L); g.delete(SPO); });

  const listSubjects = (g) => GraphUtil.listSubjects(g, Node.ANY, Node.ANY).toSet();
  const listPredicates = (g) => GraphUtil.listPredicates(g, Node.ANY, Node.ANY).toSet();
  const listObjects = (g) => GraphUtil.listObjects(g, Node.ANY, Node.ANY).toSet();

  t('testListSubjects', () => {
    const empty = listSubjects(getGraphWith(''));
    const g = getGraphWith('x P y; y Q z');
    assertEquals(nodeSet('x y'), setMinus(listSubjects(g), empty));
    g.delete(triple('x P y'));
    assertEquals(nodeSet('y'), setMinus(listSubjects(g), empty));
  });

  t('testListPredicates', () => {
    const empty = listPredicates(getGraphWith(''));
    const g = getGraphWith('x P y; y Q z');
    assertEquals(nodeSet('P Q'), setMinus(listPredicates(g), empty));
    g.delete(triple('x P y'));
    assertEquals(nodeSet('Q'), setMinus(listPredicates(g), empty));
  });

  t('testListObjects', () => {
    const empty = listObjects(getGraphWith(''));
    const g = getGraphWith('x P y; y Q z');
    assertEquals(nodeSet('y z'), setMinus(listObjects(g), empty));
    g.delete(triple('x P y'));
    assertEquals(nodeSet('z'), setMinus(listObjects(g), empty));
  });

  t('testEventDeleteByFind', () => {
    const g = getAndRegister(L);
    const toRemove = triple('remove this triple');
    g.add(toRemove);
    const rtr = g.find(toRemove);
    assert.ok(rtr.hasNext(), 'ensure at least one triple');
    rtr.next();
    rtr.remove();
    rtr.close();
  });

  t('testTwoListeners', () => {
    const g = getNewGraph();
    const gem = g.getEventManager();
    gem.register({}).register({});
    g.add(SPO);
  });

  t('testUnregisterWorks', () => {
    const g = getNewGraph();
    const gem = g.getEventManager();
    gem.register(L).unregister(L);
    g.add(SPO);
  });

  t('testRegisterTwice', () => { const g = getAndRegister(L); g.getEventManager().register(L); g.add(SPO); });
  t('testUnregisterOnce', () => { const g = getAndRegister(L); g.getEventManager().register(L).unregister(L); g.delete(SPO); });
  t('testBulkAddArrayEvent', () => { const g = getAndRegister(L); GraphUtil.add(g, tripleArray('x R y; a P b')); });
  t('testBulkAddList', () => { const g = getAndRegister(L); GraphUtil.add(g, tripleArray('bells ring loudly; pigs might fly')); });
  t('testBulkDeleteArray', () => { const g = getAndRegister(L); GraphUtil.delete(g, tripleArray('x R y; a P b')); });
  t('testBulkDeleteList', () => { const g = getAndRegister(L); GraphUtil.delete(g, tripleArray('bells ring loudly; pigs might fly')); });
  t('testBulkAddIterator', () => { const g = getAndRegister(L); GraphUtil.add(g, tripleArray('I wrote this; you read that; I wrote this')[Symbol.iterator]()); });
  t('testBulkDeleteIterator', () => { const g = getAndRegister(L); GraphUtil.delete(g, tripleArray('I wrote this; you read that; I wrote this')[Symbol.iterator]()); });

  t('testBulkAddGraph', () => {
    const g = getAndRegister(L);
    const triples = graphWith('this type graph; I type slowly');
    GraphUtil.addInto(g, triples);
    testContains(g, triples);
  });

  t('testBulkAddGraph1', () => {
    const g1 = graphWith('pigs might fly; dead can dance');
    const g2 = graphWith('this type graph');
    GraphUtil.addInto(g1, g2);
    testContains(g1, g2);
  });

  t('testBulkAddGraph2', () => {
    const g1 = graphWith('this type graph');
    const g2 = graphWith('pigs might fly; dead can dance');
    GraphUtil.addInto(g1, g2);
    testContains(g1, g2);
  });

  t('testBulkDeleteGraph', () => {
    const g = getAndRegister(L);
    const triples = graphWith('this type graph; I type slowly');
    GraphUtil.deleteFrom(g, triples);
    testOmits(g, triples);
  });

  t('testBulkDeleteGraph1', () => {
    const g1 = graphWith('pigs might fly; dead can dance');
    const g2 = graphWith('pigs might fly');
    GraphUtil.deleteFrom(g1, g2);
    testOmits(g1, g2);
  });

  t('testBulkDeleteGraph2', () => {
    const g1 = graphWith('pigs might fly');
    const g2 = graphWith('pigs might fly; dead can dance');
    GraphUtil.deleteFrom(g1, g2);
    testOmits(g1, g2);
  });

  t('testGeneralEvent', () => { const g = getAndRegister(L); g.getEventManager().notifyEvent(g, []); });
  t('testRemoveAllEvent', () => { const g = getAndRegister(L); g.clear(); });
  t('testRemoveSomeEvent', () => { const g = getAndRegister(L); g.remove(node('S'), node('??'), node('??')); });

  t('testContainsNode', () => {
    const g = getNewGraph();
    graphAdd(g, 'a P b; _c _Q _d; a 11 12');
    for (const n of ['a', 'P', 'b', '_c', '_Q', '_d', '11', '12']) assert.ok(GraphUtil.containsNode(g, node(n)), n);
    for (const n of ['x', '_y', '99']) assert.ok(!GraphUtil.containsNode(g, node(n)), n);
  });

  t('testSubjectsFor', () => {
    const b = getGraphWith('');
    const B = GraphUtil.listSubjects(b, Node.ANY, Node.ANY).toSet();
    const g = getGraphWith('a P b; a Q c; a P d; b P x; c Q y');
    const ts = (p, o, ...expected) => assertSameUnordered(GraphUtil.listSubjects(g, p, o).toList(), B, expected);
    ts(Node.ANY, Node.ANY, node('a'), node('b'), node('c'));
    ts(node('P'), Node.ANY, node('a'), node('b'));
    ts(node('Q'), node('c'), node('a'));
    ts(node('Q'), node('y'), node('c'));
    ts(node('Q'), node('a'));
    ts(node('Q'), node('z'));
  });

  function assertNoRemove(it, what) {
    it.next();
    try {
      it.remove();
      assert.fail(what + ' should not support .remove()');
    } catch (e) {
      if (!(e instanceof UnsupportedOperationException)) throw e;
    }
  }

  t('testListSubjectsNoRemove', () => {
    const g = getGraphWith('a P b; b Q c; c R a');
    assertNoRemove(GraphUtil.listSubjects(g, Node.ANY, Node.ANY), 'listSubjects');
  });

  t('testObjectsFor', () => {
    const b = getGraphWith('');
    const B = GraphUtil.listObjects(b, Node.ANY, Node.ANY).toSet();
    const g = getGraphWith('b P a; c Q a; d P a; x P b; y Q c');
    const to = (s, p, ...expected) => assertSameUnordered(GraphUtil.listObjects(g, s, p).toList(), B, expected);
    to(Node.ANY, Node.ANY, node('a'), node('b'), node('c'));
    to(Node.ANY, node('P'), node('a'), node('b'));
    to(node('c'), node('Q'), node('a'));
    to(node('y'), node('Q'), node('c'));
    to(node('a'), node('Q'));
    to(node('z'), node('Q'));
  });

  t('testPredicatesFor', () => {
    const b = getGraphWith('');
    const B = GraphUtil.listPredicates(b, Node.ANY, Node.ANY).toSet();
    const g = getGraphWith('a P b; z P b; c Q d; e R f; g P b; h Q i');
    const tp = (s, o, ...expected) => assertSameUnordered(GraphUtil.listPredicates(g, s, o).toList(), B, expected);
    tp(Node.ANY, Node.ANY, node('P'), node('Q'), node('R'));
    tp(Node.ANY, node('b'), node('P'));
    tp(node('g'), Node.ANY, node('P'));
    tp(node('c'), node('d'), node('Q'));
    tp(node('e'), node('f'), node('R'));
    tp(node('e'), node('a'));
    tp(node('z'), node('y'));
  });

  t('testListObjectsNoRemove', () => {
    const g = getGraphWith('a P b; b Q c; c R a');
    assertNoRemove(GraphUtil.listObjects(g, Node.ANY, Node.ANY), 'listObjects');
  });

  t('testListPredicatesNoRemove', () => {
    const g = getGraphWith('a P b; b Q c; c R a');
    assertNoRemove(GraphUtil.listPredicates(g, Node.ANY, Node.ANY), 'listPredicates');
  });

  t('testRemoveAll', () => {
    for (const triples of ['', 'a R b', "c S d; e:ff GGG hhhh; _i J 27; Ell Em 'en'"]) {
      const g = getNewGraph();
      graphAdd(g, triples);
      g.clear();
      assert.ok(g.isEmpty());
    }
  });

  const cases = [['x R y', 'x R y', ''], ['x R y; a P b', 'x R y', 'a P b'], ['x R y; a P b', '?? R y', 'a P b'],
    ['x R y; a P b', 'x R ??', 'a P b'], ['x R y; a P b', 'x ?? y', 'a P b'], ['x R y; a P b', '?? ?? ??', ''],
    ['x R y; a P b; c P d', '?? P ??', 'x R y'], ['x R y; a P b; x S y', 'x ?? ??', 'a P b']];

  t('testRemoveSPO', () => {
    for (const aCase of cases) {
      for (let j = 0; j < 3; j += 1) {
        const content = getNewGraph();
        const baseContent = copy(content);
        graphAdd(content, aCase[0]);
        const remove = triple(aCase[1]);
        const expected = graphWith(aCase[2]);
        content.remove(remove.getSubject(), remove.getPredicate(), remove.getObject());
        const finalContent = removeGraph(copy(content), baseContent);
        assertIsomorphic(aCase[1], expected, finalContent);
      }
    }
  });

  async function testIsomorphismFile(n, lang, suffix, result) {
    const g1 = getNewGraph(), g2 = getNewGraph();
    const m1 = ModelFactory.createModelForGraph(g1), m2 = ModelFactory.createModelForGraph(g2);
    const text = (k) => readFileSync(join(FIXTURES, `${n}-${k}.${suffix}`), 'utf8');
    await m1.read(new StringReader(text(1)), 'http://www.example.org/', lang);
    await m2.read(new StringReader(text(2)), 'http://www.example.org/', lang);
    assert.ok((g1.isIsomorphicWith(g2) === result), `Isomorphism test failed: ${n} ${suffix}`);
  }

  t('testIsomorphismFile', async () => {
    await testIsomorphismFile(1, 'RDF/XML', 'rdf', true);
    await testIsomorphismFile(2, 'RDF/XML', 'rdf', true);
    await testIsomorphismFile(3, 'RDF/XML', 'rdf', true);
    await testIsomorphismFile(5, 'RDF/XML', 'rdf', false);
    await testIsomorphismFile(7, 'N-TRIPLE', 'nt', true);
    await testIsomorphismFile(8, 'N-TRIPLE', 'nt', false);
  });
});
