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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestRDFNodes.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Java RDFVisitor is an object with visitBlank/visitURI/visitLiteral/visitStmt; assertSame is ===.

import assert from 'node:assert/strict';
import { ModelFactory, LiteralRequiredException, ResourceRequiredException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows, resource, property, statement, modelWithStatements, assertIsoModels } from '../../lib/testlib.mjs';

describeJena('TestRDFNodes', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestRDFNodes.java', (t) => {
  t('testInModel', () => {
    const m1 = modelWithStatements('');
    const m2 = modelWithStatements('');
    const r1 = resource(m1, 'r1');
    const r2 = resource(m1, '_r2');
    assert.equal(r1.getModel(), m1);
    assert.equal(r2.getModel(), m1);
    assert.ok(!r1.isAnon());
    assert.ok(r2.isAnon());
    assert.equal(r1.inModel(m2).getModel(), m2);
    assert.equal(r2.inModel(m2).getModel(), m2);
    assertEquals(r1, r1.inModel(m2));
    assertEquals(r2, r2.inModel(m2));
  });

  t('testIsAnon', () => {
    const m = modelWithStatements('');
    assert.equal(m.createResource('eh:/foo').isAnon(), false);
    assert.equal(m.createResource().isAnon(), true);
    assert.equal(m.createTypedLiteral(17).isAnon(), false);
    assert.equal(m.createTypedLiteral('hello').isAnon(), false);
  });

  t('testIsLiteral', () => {
    const m = modelWithStatements('');
    assert.equal(m.createResource('eh:/foo').isLiteral(), false);
    assert.equal(m.createResource().isLiteral(), false);
    assert.equal(m.createTypedLiteral(17).isLiteral(), true);
    assert.equal(m.createTypedLiteral('hello').isLiteral(), true);
  });

  t('testIsResource', () => {
    const m = modelWithStatements('');
    const stmt = statement('S P O');
    const tripleTerm = m.createStatementTerm(stmt);
    assert.equal(m.createResource('eh:/foo').isResource(), true);
    assert.equal(m.createResource().isResource(), true);
    assert.equal(m.createTypedLiteral(17).isResource(), false);
    assert.equal(m.createTypedLiteral('hello').isResource(), false);
    assert.equal(tripleTerm.isResource(), false);
  });

  t('testIsURIResource', () => {
    const m = modelWithStatements('');
    assert.equal(m.createResource('eh:/foo').isURIResource(), true);
    assert.equal(m.createResource().isURIResource(), false);
    assert.equal(m.createTypedLiteral(17).isURIResource(), false);
    assert.equal(m.createTypedLiteral('hello').isURIResource(), false);
  });

  t('testIsStatementTerm1', () => {
    const m = modelWithStatements('');
    const stmt = statement('S P O');
    const tripleTerm = m.createStatementTerm(stmt);
    assert.equal(m.createResource('eh:/foo').isStatementTerm(), false);
    assert.equal(m.createResource().isStatementTerm(), false);
    assert.equal(m.createTypedLiteral(17).isStatementTerm(), false);
    assert.equal(m.createTypedLiteral('hello').isStatementTerm(), false);
    assert.equal(tripleTerm.isStatementTerm(), true);
  });

  t('testIsStatementTerm2', () => {
    const m = modelWithStatements('');
    const stmt = statement('S P O');
    const tripleTerm = m.createStatementTerm(stmt);
    assert.equal(tripleTerm.isAnon(), false);
    assert.equal(tripleTerm.isURIResource(), false);
    assert.equal(tripleTerm.isLiteral(), false);
    assert.equal(tripleTerm.isResource(), false);
    assert.equal(tripleTerm.isStatementTerm(), true);
  });

  t('testLiteralAsResourceThrows', () => {
    const m = modelWithStatements('');
    const r = m.createResource('eh:/spoo');
    assertThrows(LiteralRequiredException, () => r.asLiteral(), 'should not be able to do Resource.asLiteral()');
  });

  t('testRDFNodeAsLiteral', () => {
    const m = modelWithStatements('');
    const l = m.createLiteral('hello, world');
    assert.equal(l.asLiteral(), l);
  });

  t('testRDFNodeAsResource', () => {
    const m = modelWithStatements('');
    const r = m.createResource('eh:/spoo');
    assert.equal(r.asResource(), r);
  });

  t('testRDFVisitor', () => {
    const history = [];
    const m = ModelFactory.createDefaultModel();
    const S = m.createResource();
    const P = m.createProperty('eh:PP');
    const O = m.createLiteral('LL');
    const stmt = m.createStatement(S, P, O);
    const ST = m.createStatementTerm(stmt);
    const rv = {
      visitBlank(R, id) {
        history.push('blank');
        assert.ok(R === S, 'must visit correct node');
        assertEquals(R.getId(), id, 'must have correct field');
        return 'blank result';
      },
      visitLiteral(L) {
        history.push('literal');
        assert.ok(L === O, 'must visit correct node');
        return 'literal result';
      },
      visitURI(R, uri) {
        history.push('uri');
        assert.ok(R === P, 'must visit correct node');
        assert.equal(uri, R.getURI(), 'must have correct field');
        return 'uri result';
      },
      visitStmt(statementTerm, st) {
        history.push('statementTerm');
        return 'statement term result';
      },
    };
    assert.equal(S.visitWith(rv), 'blank result');
    assert.equal(P.visitWith(rv), 'uri result');
    assert.equal(O.visitWith(rv), 'literal result');
    assert.equal(ST.visitWith(rv), 'statement term result');
    assert.deepEqual(history, ['blank', 'uri', 'literal', 'statementTerm']);
  });

  t('testRemoveAllBoring', () => {
    const m1 = modelWithStatements('x P a; y Q b');
    const m2 = modelWithStatements('x P a; y Q b');
    resource(m2, 'x').removeAll(property(m2, 'Z'));
    assertIsoModels('m2 should be unchanged', m1, m2);
  });

  t('testRemoveAllRemoves', () => {
    const ps = 'x P a; x P b', rest = 'x Q c; y P a; y Q b';
    const m = modelWithStatements(ps + '; ' + rest);
    const r = resource(m, 'x');
    const r2 = r.removeAll(property(m, 'P'));
    assert.equal(r2, r, 'removeAll should deliver its receiver');
    assertIsoModels("x's P-values should go", modelWithStatements(rest), m);
  });

  t('testResourceAsLiteralThrows', () => {
    const m = modelWithStatements('');
    const l = m.createLiteral('hello, world');
    assertThrows(ResourceRequiredException, () => l.asResource(), 'should not be able to do Literal.asResource()');
  });
});
