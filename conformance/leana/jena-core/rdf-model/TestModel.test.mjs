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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); vocabulary constants (RDF.x) and the Java
// typed test values are test data from lib/testlib.mjs.
// assertInstanceOf(C, x) is instanceof; assertSame is ===; as(Property.class)
// is new Property(node, model); a Java Iterator over RDFNodes is a JS iterator.

import assert from 'node:assert/strict';
import { ModelFactory, Node, Resource, Literal, Property, AnonId, UnsupportedOperationException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  assertEquals, assertThrows, create, node, triple, modelAdd, modelWithStatements, resource, property, statement,
  assertIsoModels,
} from '../../lib/testlib.mjs';

const cases = [['x R y', 'x R y', ''], ['x R y; a P b', 'x R y', 'a P b'], ['x R y; a P b', '?? R y', 'a P b'],
  ['x R y; a P b', 'x R ??', 'a P b'], ['x R y; a P b', 'x ?? y', 'a P b'], ['x R y; a P b', '?? ?? ??', ''],
  ['x R y; a P b; c P d', '?? P ??', 'x R y'], ['x R y; a P b; x S y', 'x ?? ??', 'a P b']];

const createModel = () => ModelFactory.createDefaultModel();
const copy = (m) => createModel().add(m);

describeJena('TestModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModel.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    model = createModel();
    try { return fn(); } finally { model.close(); }
  });
  const testPresentAsRDFNode = (n, nodeClass) => {
    const r = model.asRDFNode(n);
    assert.ok(n === r.asNode());
    assert.ok(r instanceof nodeClass);
  };

  t('testAsRDF', () => {
    testPresentAsRDFNode(node('a'), Resource);
    testPresentAsRDFNode(node('17'), Literal);
    testPresentAsRDFNode(node('_b'), Resource);
  });

  t('testContainsResource', () => {
    modelAdd(model, 'x R y; _a P _b');
    assert.ok(model.containsResource(resource(model, 'x')));
    assert.ok(model.containsResource(resource(model, 'R')));
    assert.ok(model.containsResource(resource(model, 'y')));
    assert.ok(model.containsResource(resource(model, '_a')));
    assert.ok(model.containsResource(resource(model, 'P')));
    assert.ok(model.containsResource(resource(model, '_b')));
    assert.ok(!model.containsResource(resource(model, 'i')));
    assert.ok(!model.containsResource(resource(model, '_j')));
  });

  t('testCreateBlankFromNode', () => {
    const S = model.getRDFNode(create('_Blank'));
    assert.ok(S instanceof Resource);
    assertEquals(new AnonId('_Blank'), S.getId());
  });

  t('testCreateLiteralFromNode', () => {
    const S = model.getRDFNode(create('42'));
    assert.ok(S instanceof Literal);
    assert.equal(S.getLexicalForm(), '42');
  });

  t('testCreateListFromEmptyIterator', () => {
    const list = model.createList([][Symbol.iterator]());
    assert.equal(list.size(), 0);
  });

  t('testCreateSingletonListFromIterator', () => {
    const expected = [model.createResource()];
    const list = model.createList(expected[Symbol.iterator]());
    assert.deepEqual(list.asJavaList(), expected);
  });

  t('testCreateListFromIterator', () => {
    const expected = [model.createResource(), model.createResource(), model.createResource()];
    const list = model.createList(expected[Symbol.iterator]());
    assert.deepEqual(list.asJavaList(), expected);
  });

  t('testCreateResourceFromNode', () => {
    const S = model.getRDFNode(create('spoo:S'));
    assert.ok(S instanceof Resource);
    assert.equal(S.getURI(), 'spoo:S');
  });

  t('testGetProperty', () => {
    modelAdd(model, 'x P a; x P b; x R c');
    const x = resource(model, 'x');
    assertEquals(resource(model, 'c'), x.getProperty(property(model, 'R')).getObject());
    const ob = x.getProperty(property(model, 'P')).getObject();
    assert.ok(ob.equals(resource(model, 'a')) || ob.equals(resource(model, 'b')));
    assert.equal(x.getProperty(property(model, 'noSuchPropertyHere')), null);
  });

  t('testIsClosedDelegatedToGraph', () => {
    assert.ok(!model.isClosed());
    model.close();
    assert.ok(model.isClosed());
  });

  t('testIsEmpty', () => {
    const S1 = statement(model, 'model rdf:type nonEmpty');
    const S2 = statement(model, 'pinky rdf:type Pig');
    assert.ok(model.isEmpty());
    model.add(S1);
    assert.ok(!model.isEmpty());
    model.add(S2);
    assert.ok(!model.isEmpty());
    model.remove(S1);
    assert.ok(!model.isEmpty());
    model.remove(S2);
    assert.ok(model.isEmpty());
  });

  t('testLiteralNodeAsResourceFails', () => {
    assertThrows(UnsupportedOperationException, () => model.wrapAsResource(node('17')), 'should fail to convert literal to Resource');
  });

  t('testRemoveAll', () => {
    const testRemoveAll = (statements) => {
      modelAdd(model, statements);
      assert.ok(model === model.removeAll());
      assert.equal(model.size(), 0, 'model should have size 0 following removeAll(): ');
    };
    testRemoveAll('');
    testRemoveAll('a RR b');
    testRemoveAll("x P y; a Q b; c R 17; _d S 'e'");
    testRemoveAll("subject Predicate 'object'; http://nowhere/x scheme:cunning not:plan");
  });

  t('testRemoveSPO', () => {
    const mc = createModel();
    for (const case1 of cases) {
      for (let j = 0; j < 3; j += 1) {
        const content = createModel();
        const baseContent = copy(content);
        modelAdd(content, case1[0]);
        const remove = triple(case1[1]);
        const s = remove.getSubject(), p = remove.getPredicate(), o = remove.getObject();
        const S = s.equals(Node.ANY) ? null : mc.getRDFNode(s);
        const P = p.equals(Node.ANY) ? null : new Property(mc.getRDFNode(p).asNode(), mc);
        const O = o.equals(Node.ANY) ? null : mc.getRDFNode(o);
        const expected = modelWithStatements(case1[2]);
        content.removeAll(S, P, O);
        const finalContent = copy(content).remove(baseContent);
        assertIsoModels(case1[1], expected, finalContent);
      }
    }
  });

  t('testToStatement', () => {
    const tr = triple('a P b');
    const s = model.asStatement(tr);
    assertEquals(node('a'), s.getSubject().asNode());
    assertEquals(node('P'), s.getPredicate().asNode());
    assertEquals(node('b'), s.getObject().asNode());
  });

  t('testTransactions', () => {
    if (model.supportsTransactions()) model.executeInTxn(() => {});
  });

  t('testURINodeAsResource', () => {
    const n = node('a');
    const r = model.wrapAsResource(n);
    assert.ok(n === r.asNode());
  });
});
