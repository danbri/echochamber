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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestDefaultModel.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Not parameterised in Jena (newModel() is createDefaultModel()). JenaTestLib.assertInstanceOf is instanceof.

import assert from 'node:assert/strict';
import { ModelFactory, Node, Resource, Literal, Property, AnonId, PropertyNotFoundException, UnsupportedOperationException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  assertEquals, assertThrows, create, node, triple, statement, modelAdd, modelWithStatements, resource, property, assertIsoModels,
} from '../../lib/testlib.mjs';

const newModel = () => ModelFactory.createDefaultModel();
const assertInstanceOf = (Cls, x) => assert.ok(x instanceof Cls, `${x} should be a ${Cls.name}`);
const copy = (m) => ModelFactory.createDefaultModel().add(m);

describeJena('TestDefaultModel', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestDefaultModel.java', (t) => {
  t('testTransactions', () => {
    const model = newModel();
    if (model.supportsTransactions()) model.executeInTxn(() => {});
  });

  t('testCreateResourceFromNode', () => {
    const model = newModel();
    const S = model.getRDFNode(create('spoo:S'));
    assertInstanceOf(Resource, S);
    assert.equal(S.getURI(), 'spoo:S');
  });

  t('testCreateLiteralFromNode', () => {
    const model = newModel();
    const S = model.getRDFNode(create('42'));
    assertInstanceOf(Literal, S);
    assert.equal(S.getLexicalForm(), '42');
  });

  t('testCreateBlankFromNode', () => {
    const model = newModel();
    const S = model.getRDFNode(create('_Blank'));
    assertInstanceOf(Resource, S);
    assertEquals(new AnonId('_Blank'), S.getId());
  });

  t('testIsEmpty', () => {
    const model = newModel();
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

  t('testContainsResource', () => {
    const model = newModel();
    modelAdd(model, 'x R y; _a P _b');
    for (const x of ['x', 'R', 'y', '_a', 'P', '_b']) assert.ok(model.containsResource(resource(model, x)), x);
    assert.ok(!model.containsResource(resource(model, 'i')));
    assert.ok(!model.containsResource(resource(model, '_j')));
  });

  t('testGetProperty', () => {
    const model = newModel();
    modelAdd(model, 'x P a; x P b; x R c');
    const x = resource(model, 'x');
    assertEquals(resource(model, 'c'), x.getProperty(property(model, 'R')).getObject());
    const ob = x.getProperty(property(model, 'P')).getObject();
    assert.ok(ob.equals(resource(model, 'a')) || ob.equals(resource(model, 'b')));
    assert.equal(x.getProperty(property(model, 'noSuchPropertyHere')), null);
  });

  t('testGetPropertyWithLanguage', () => {
    const model = newModel();
    model.add(resource(model, 'x'), property(model, 'P'), 'a', 'pt');
    model.add(resource(model, 'x'), property(model, 'P'), 'b', 'en');
    model.add(resource(model, 'x'), property(model, 'P'), 'c', 'es');
    model.add(resource(model, 'x'), property(model, 'R'), 'd', 'fr');
    model.add(resource(model, 'x'), property(model, 'R'), 'e', 'de');
    {
      const x = resource(model, 'x');
      assert.equal(x.getProperty(property(model, 'P'), 'pt').getString(), 'a');
      assert.equal(x.getProperty(property(model, 'P'), 'en').getString(), 'b');
      assert.equal(x.getProperty(property(model, 'P'), 'ja'), null);
      const l = x.getProperty(property(model, 'R')).getLiteral();
      assert.ok(l.getString() === 'd' || l.getString() === 'e');
    }
    {
      const x = resource(model, 'x');
      assert.equal(x.getRequiredProperty(property(model, 'P'), 'pt').getString(), 'a');
      assert.equal(x.getRequiredProperty(property(model, 'P'), 'en').getString(), 'b');
      assertThrows(PropertyNotFoundException, () => x.getRequiredProperty(property(model, 'P'), 'ja'), 'Must thrown PropertyNotFoundException.');
      const l = x.getRequiredProperty(property(model, 'R')).getLiteral();
      assert.ok(l.getString() === 'd' || l.getString() === 'e');
      assert.ok(l.getLanguage() === 'de' || l.getLanguage() === 'fr');
    }
  });

  t('testToStatement', () => {
    const model = newModel();
    const tr = triple('a P b');
    const s = model.asStatement(tr);
    assertEquals(node('a'), s.getSubject().asNode());
    assertEquals(node('P'), s.getPredicate().asNode());
    assertEquals(node('b'), s.getObject().asNode());
  });

  t('testAsRDF', () => {
    const model = newModel();
    const present = (n, Cls) => {
      const r = model.asRDFNode(n);
      assert.equal(r.asNode(), n);
      assertInstanceOf(Cls, r);
    };
    present(node('a'), Resource);
    present(node('17'), Literal);
    present(node('_b'), Resource);
  });

  t('testURINodeAsResource', () => {
    const model = newModel();
    const n = node('a');
    assert.equal(model.wrapAsResource(n).asNode(), n);
  });

  t('testLiteralNodeAsResourceFails', () => {
    const model = newModel();
    assertThrows(UnsupportedOperationException, () => model.wrapAsResource(node('17')), 'should fail to convert literal to Resource');
  });

  t('testRemoveAll', () => {
    const model = newModel();
    for (const statements of ['', 'a RR b', "x P y; a Q b; c R 17; _d S 'e'", "subject Predicate 'object'; http://nowhere/x scheme:cunning not:plan"]) {
      modelAdd(model, statements);
      assert.equal(model.removeAll(), model);
      assert.equal(model.size(), 0, 'model should have size 0 following removeAll(): ');
    }
  });

  const cases = [
    ['x R y', 'x R y', ''],
    ['x R y; a P b', 'x R y', 'a P b'],
    ['x R y; a P b', '?? R y', 'a P b'],
    ['x R y; a P b', 'x R ??', 'a P b'],
    ['x R y; a P b', 'x ?? y', 'a P b'],
    ['x R y; a P b', '?? ?? ??', ''],
    ['x R y; a P b; c P d', '?? P ??', 'x R y'],
    ['x R y; a P b; x S y', 'x ?? ??', 'a P b'],
  ];

  t('testRemoveSPO', () => {
    const mc = ModelFactory.createDefaultModel();
    for (const aCase of cases) {
      for (let j = 0; j < 3; j += 1) {
        const content = newModel();
        const baseContent = copy(content);
        modelAdd(content, aCase[0]);
        const remove = triple(aCase[1]);
        const s = remove.getSubject(), p = remove.getPredicate(), o = remove.getObject();
        const S = s.equals(Node.ANY) ? null : mc.getRDFNode(s);
        const P = p.equals(Node.ANY) ? null : mc.getRDFNode(p).as(Property);
        const O = o.equals(Node.ANY) ? null : mc.getRDFNode(o);
        const expected = modelWithStatements(aCase[2]);
        content.removeAll(S, P, O);
        const finalContent = copy(content).remove(baseContent);
        assertIsoModels(aCase[1], expected, finalContent);
      }
    }
  });

  t('testIsClosedDelegatedToGraph', () => {
    const m = newModel();
    assert.ok(!m.isClosed());
    m.close();
    assert.ok(m.isClosed());
  });
});
