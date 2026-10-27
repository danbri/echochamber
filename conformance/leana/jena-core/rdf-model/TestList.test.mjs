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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestList.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind). getFileName() is the fixture copy in
// conformance/leana/fixtures/jena-core/; Model.read answers a Promise (awaited).
// as(RDFList.class) is as(RDFList); RDF.x is test data (lib/testlib.mjs); the
// RDFList.ApplyFn and ReduceFn classes are JS functions; Arrays.asList(...).iterator()
// is the array's iterator; Java's (Resource) casts are dropped.

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ModelFactory, RDFList, ListIndexException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF, assertEquals } from '../../lib/testlib.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core');
const getFileName = (fn) => join(FIX, fn);
const NS = 'uri:urn:x-rdf:test#';

/** Test that an iterator delivers the expected values (in any order). */
function iteratorTest(i, expected) {
  const expList = [...expected];
  const idx = (x) => expList.findIndex((e) => (e && typeof e.equals === 'function' ? e.equals(x) : e === x));
  while (i.hasNext()) {
    const next = i.next();
    const k = idx(next);
    assert.ok(k >= 0, 'Value ' + next + ' was not expected as a result from this iterator ');
    expList.splice(k, 1);
  }
  assert.equal(expList.length, 0, 'There were expected elements from the iterator that were not found');
}

describeJena('TestList', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestList.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, async () => {
    model = ModelFactory.createDefaultModel();
    try { return await fn(); } finally { model.close(); }
  });

  const checkValid = (testName, l, validExpected) => {
    l.setStrict(true);
    const valid = l.isValid();
    assert.equal(valid, validExpected, 'Validity test ' + testName + ' returned wrong isValid() result');
  };
  const getListRoot = (m) => {
    const root = m.getResource(NS + 'root');
    assert.notEqual(root, null, 'Root resource should not be null');
    const listHead = root.getRequiredProperty(m.getProperty(NS + 'p')).getResource();
    const l = listHead.as(RDFList);
    assert.notEqual(l, null, 'as(RDFList) should not return null for root');
    return l;
  };
  const abcde = (m, names = ['a', 'b', 'c', 'd', 'e']) => names.map((x) => m.createResource(NS + x));

  t('testAdd', async () => {
    const root = model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const nil = model.getResource(RDF.nil.getURI());
    let list = nil.as(RDFList);
    const toAdd = abcde(model);
    for (const element of toAdd) {
      const list0 = list.with(element);
      checkValid('addTest0', list0, true);
      assert.ok(list.equals(nil) || list0.equals(list), "added'ed lists should be equal");
      list = list0;
    }
    model.add(root, p, list);
    const m0 = ModelFactory.createDefaultModel();
    await m0.read(getFileName('ontology/list5.rdf'));
    assert.ok(m0.isIsomorphicWith(model), "Add'ed and read models should be the same");
  });

  t('testAppend', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const nil = model.getResource(RDF.nil.getURI());
    let list = nil.as(RDFList);
    const r = model.createResource(NS + 'foo');
    for (let i = 0; i < 5; i++) list = list.cons(r);
    const listLen = list.size();
    const root = getListRoot(model);
    const rootLen = root.size();
    const appended = root.append(list);
    checkValid('appendTest0', root, true);
    assert.equal(root.size(), rootLen, 'Original list should be unchanged');
    checkValid('appendTest1', list, true);
    assert.equal(list.size(), listLen, 'Original list should be unchanged');
    checkValid('appendTest2', appended, true);
    assert.equal(appended.size(), rootLen + listLen, 'Appended list not correct length');
  });

  t('testApply', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const root = getListRoot(model);
    let collect = '';
    root.apply((n) => { collect = collect + n.getLocalName(); });
    assert.equal(collect, 'abcde', 'Result of apply should be concatentation of local names');
  });

  t('testConcatenate', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const nil = model.getResource(RDF.nil.getURI());
    let list = nil.as(RDFList);
    const r = model.createResource(NS + 'foo');
    for (let i = 0; i < 5; i++) list = list.cons(r);
    const listLen = list.size();
    const root = getListRoot(model);
    const rootLen = root.size();
    root.concatenate(list);
    checkValid('concatTest0', list, true);
    assert.equal(list.size(), listLen, 'Original list should be unchanged');
    checkValid('concatTest1', root, true);
    assert.equal(root.size(), rootLen + listLen, 'Root list should be new length');
  });

  t('testConcatenate2', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const a = model.createResource(NS + 'a');
    const rs = abcde(model, ['b', 'c', 'd', 'e']);
    const aList = model.createList().cons(a);
    const rsList = model.createList(rs);
    aList.concatenate(rsList);
    checkValid('concatTest3', aList, true);
    const root = getListRoot(model);
    assert.ok(aList.sameListAs(root), 'Constructed and loaded lists should be the same');
  });

  t('testCons', async () => {
    const root = model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const nil = model.getResource(RDF.nil.getURI());
    let list = nil.as(RDFList);
    const toAdd = abcde(model, ['e', 'd', 'c', 'b', 'a']);
    for (const element of toAdd) {
      const list0 = list.cons(element);
      checkValid('constest1', list0, true);
      assert.ok(!list0.equals(list), "cons'ed lists should not be equal");
      list = list0;
    }
    model.add(root, p, list);
    const m0 = ModelFactory.createDefaultModel();
    await m0.read(getFileName('ontology/list5.rdf'));
    assert.ok(m0.isIsomorphicWith(model), "Cons'ed and read models should be the same");
  });

  t('testCount', async () => {
    for (let i = 0; i <= 5; i++) {
      model.removeAll();
      await model.read(getFileName('ontology/list' + i + '.rdf'));
      const l0 = getListRoot(model);
      assert.equal(l0.size(), i, 'List size should be ' + i);
    }
  });

  t('testHead', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    let l0 = getListRoot(model);
    for (const name of ['a', 'b', 'c', 'd', 'e']) {
      assert.equal(l0.getHead().getURI(), NS + name, 'head of list has incorrect URI');
      l0 = l0.getTail();
    }
  });

  t('testIndex1', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const toGet = abcde(model);
    const l1 = getListRoot(model);
    for (let i = 0; i < toGet.length; i++) {
      assert.ok(l1.contains(toGet[i]), 'list should contain element ' + i);
      assert.equal(l1.indexOf(toGet[i]), i, 'list element ' + i + ' is not correct');
    }
  });

  t('testIndex2', () => {
    const nil = model.getResource(RDF.nil.getURI());
    let list = nil.as(RDFList);
    const r = model.createResource(NS + 'a');
    for (let i = 0; i < 10; i++) list = list.cons(r);
    for (let j = 0; j < 10; j++) assert.equal(list.indexOf(r, j), j, "index of j'th item should be j");
  });

  t('testListEquals', () => {
    const nil = model.getResource(RDF.nil.getURI());
    const nilList = nil.as(RDFList);
    const r0 = abcde(model);
    const r1 = abcde(model);
    const r2 = abcde(model, ['a', 'b', 'c', 'd']);
    const r3 = abcde(model, ['a', 'b', 'd', 'c', 'e']);
    const r4 = abcde(model, ['a', 'b', 'c', 'D', 'e']);
    const testSpec = [[r0, r1, true], [r0, r2, false], [r0, r3, false], [r0, r4, false], [r1, r2, false],
      [r1, r3, false], [r1, r4, false], [r2, r3, false], [r2, r4, false]];
    for (let i = 0; i < testSpec.length; i++) {
      const l0 = nilList.append(testSpec[i][0][Symbol.iterator]());
      const l1 = nilList.append(testSpec[i][1][Symbol.iterator]());
      const expected = testSpec[i][2];
      assert.equal(l0.sameListAs(l1), expected, 'sameListAs testSpec[' + i + '] incorrect');
      assert.equal(l1.sameListAs(l0), expected, 'sameListAs testSpec[' + i + '] (swapped) incorrect');
    }
  });

  t('testListGet', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const toGet = abcde(model);
    const l1 = getListRoot(model);
    for (let i = 0; i < toGet.length; i++) assertEquals(toGet[i], l1.get(i), 'list element ' + i + ' is not correct');
    let gotEx = false;
    try {
      l1.get(toGet.length + 1);
    } catch (e) {
      if (!(e instanceof ListIndexException)) throw e;
      gotEx = true;
    }
    assert.ok(gotEx, 'Should see exception raised by accessing beyond end of list');
  });

  t('testMap1', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const root = getListRoot(model);
    iteratorTest(root.mapWith((n) => n.getLocalName()), ['a', 'b', 'c', 'd', 'e']);
  });

  t('testReduce', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const root = getListRoot(model);
    const f = (n, acc) => acc + n.getLocalName();
    assert.equal(root.reduce(f, ''), 'abcde', 'Result of reduce should be concatentation of local names');
  });

  t('testRemove', () => {
    const nil = model.getResource(RDF.nil.getURI());
    let list0 = nil.as(RDFList);
    let list1 = nil.as(RDFList);
    const r0 = model.createResource(NS + 'x');
    const r1 = model.createResource(NS + 'y');
    const r2 = model.createResource(NS + 'z');
    for (let i = 0; i < 10; i++) {
      list0 = list0.cons(r0);
      list1 = list1.cons(r1);
    }
    while (!list0.isEmpty()) {
      list0 = list0.removeHead();
      checkValid('removeTest0', list0, true);
    }
    list1.removeList();
    assert.equal(model.size(), 0, 'Model should be empty after deleting two lists');
    let list2 = nil.as(RDFList).cons(r2).cons(r1).cons(r0);
    assert.ok(list2.contains(r0), 'list should contain x ');
    assert.ok(list2.contains(r1), 'list should contain y ');
    assert.ok(list2.contains(r2), 'list should contain z ');
    list2 = list2.remove(r1);
    assert.ok(list2.contains(r0), 'list should contain x ');
    assert.ok(!list2.contains(r1), 'list should contain y ');
    assert.ok(list2.contains(r2), 'list should contain z ');
    list2 = list2.remove(r0);
    assert.ok(!list2.contains(r0), 'list should contain x ');
    assert.ok(!list2.contains(r1), 'list should contain y ');
    assert.ok(list2.contains(r2), 'list should contain z ');
    list2 = list2.remove(r2);
    assert.ok(!list2.contains(r0), 'list should contain x ');
    assert.ok(!list2.contains(r1), 'list should contain y ');
    assert.ok(!list2.contains(r2), 'list should contain z ');
    assert.ok(list2.isEmpty(), 'list should be empty');
  });

  t('testReplace', async () => {
    await model.read(getFileName('ontology/list5.rdf'));
    const toSet = ['a', 'b', 'c', 'd', 'e'].map((x) => model.createLiteral(x));
    const l1 = getListRoot(model);
    for (let i = 0; i < toSet.length; i++) l1.replace(i, toSet[i]);
    for (let i = 0; i < toSet.length; i++) assertEquals(toSet[i], l1.get(i), 'list element ' + i + ' is not correct');
    let gotEx = false;
    try {
      l1.replace(toSet.length + 1, toSet[0]);
    } catch (e) {
      if (!(e instanceof ListIndexException)) throw e;
      gotEx = true;
    }
    assert.ok(gotEx, 'Should see exception raised by accessing beyond end of list');
  });

  t('testSetHead', () => {
    const root = model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const nil = RDF.nil;
    model.add(nil, RDF.type, RDF.List);
    const list = model.createResource();
    model.add(list, RDF.type, RDF.List);
    model.add(list, RDF.first, 'fred');
    model.add(list, RDF.rest, nil);
    model.add(root, p, list);
    const l1 = getListRoot(model);
    checkValid('sethead1', l1, true);
    assert.equal(l1.getHead().getString(), 'fred', "List head should be 'fred'");
    l1.setHead(model.createTypedLiteral(42));
    checkValid('sethead2', l1, true);
    assert.equal(l1.getHead().getInt(), 42, "List head should be '42'");
  });

  t('testSetTail', () => {
    const m = ModelFactory.createDefaultModel();
    const root = m.createResource(NS + 'root');
    const p = m.createProperty(NS, 'p');
    const nil = RDF.nil;
    m.add(nil, RDF.type, RDF.List);
    const list0 = m.createResource();
    m.add(list0, RDF.type, RDF.List);
    m.add(list0, RDF.first, 'fred');
    m.add(list0, RDF.rest, nil);
    m.add(root, p, list0);
    const l1 = getListRoot(m);
    checkValid('settail1', l1, true);
    const list1 = m.createResource();
    m.add(list1, RDF.type, RDF.List);
    m.add(list1, RDF.first, 'george');
    m.add(list1, RDF.rest, nil);
    const l2 = list1.as(RDFList);
    assert.notEqual(l2, null, 'as(RDFList) should not return null for root');
    checkValid('settail2', l2, true);
    assert.equal(l1.size(), 1, 'l1 should have length 1');
    assert.equal(l2.size(), 1, 'l2 should have length 1');
    l1.setTail(l2);
    checkValid('settail3', l1, true);
    checkValid('settail4', l2, true);
    assert.equal(l1.size(), 2, 'l1 should have length 2');
    assert.equal(l2.size(), 1, 'l2 should have length 1');
  });

  t('testTail', async () => {
    for (let i = 0; i <= 5; i++) {
      await model.read(getFileName('ontology/list' + i + '.rdf'));
      let l0 = getListRoot(model);
      for (let j = 0; j < i; j++) l0 = l0.getTail();
      assert.ok(l0.isEmpty(), 'Should have reached the end of the list after ' + i + " getTail()'s");
    }
  });

  t('testValidity', () => {
    const root = model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const nil = RDF.nil;
    model.add(root, p, nil);
    const l0 = getListRoot(model);
    checkValid('valid1', l0, true);
    const badList = model.createResource();
    model.getRequiredProperty(root, p).remove();
    model.add(root, p, badList);
    model.add(badList, RDF.type, RDF.List);
    const l1 = getListRoot(model);
    checkValid('valid2', l1, false);
    model.add(badList, RDF.first, 'fred');
    checkValid('valid4', l1, false);
    model.add(badList, RDF.rest, nil);
    checkValid('valid5', l1, true);
  });

  t('testStmtGetList', () => {
    model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const r = model.createResource(NS + 'r');
    const r1 = model.createResource(NS + 'r1');
    const r2 = model.createResource(NS + 'r2');
    const list0 = model.createList(r1, r2);
    model.add(r, p, list0);
    const obj = model.listStatements(r, p, null).next().getResource();
    const list1 = model.getList(obj);
    const b = list0.sameListAs(list1);
    assert.ok(b, 'Different lists: expected: ' + list0 + ' : got: ' + list1);
  });

  t('testModelGetList', () => {
    model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const r = model.createResource(NS + 'r');
    const r1 = model.createResource(NS + 'r1');
    const r2 = model.createResource(NS + 'r2');
    const list0 = model.createList(r1, r2);
    model.add(r, p, list0);
    const list1 = model.listStatements(r, p, null).next().getList();
    const b = list0.sameListAs(list1);
    assert.ok(b, 'Different lists: expected: ' + list0 + ' : got: ' + list1);
  });

  t('testModelGetEmptyList', () => {
    model.createResource(NS + 'root');
    const p = model.createProperty(NS, 'p');
    const r = model.createResource(NS + 'r');
    const list0 = model.createList();
    model.add(r, p, list0);
    const list1 = model.listStatements(r, p, null).next().getList();
    const b = list0.sameListAs(list1);
    assert.ok(b, 'Different lists: expected: ' + list0 + ' : got: ' + list1);
  });
});
