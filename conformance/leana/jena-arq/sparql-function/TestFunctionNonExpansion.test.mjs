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
//   jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestFunctionNonExpansion.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Functions defined by SPARQL expressions (the Expr
// object model and its evaluation) are gap 'query'. A List<Var> is an array
// of variable names; nodeToInt(n) is the integer of the literal.

import assert from 'node:assert/strict';
import { before, after } from 'node:test';
import { UserDefinedFunctionFactory, E_Multiply, E_Function, ExprVar, ExprList, NodeValueInteger } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const F = () => UserDefinedFunctionFactory.getFactory();
const nodeToInt = (n) => Number(n.getLiteralLexicalForm());

describeJena('TestFunctionNonExpansion', 'jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestFunctionNonExpansion.java', (t) => {
  before(() => { F().clear(); F().setPreserveDependencies(true); });
  after(() => { F().clear(); F().setPreserveDependencies(false); });
  t('test_function_non_expansion_01', () => {
    const square = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', square, [...square.getVarsMentioned()]);
    const cube = new E_Multiply(new E_Function('http://example/square', new ExprList(new ExprVar('x'))), new ExprVar('x'));
    F().add('http://example/cube', cube, [...cube.getVarsMentioned()]);
    const def = F().get('http://example/cube');
    const base = def.getBaseExpr();
    assert.ok(base instanceof E_Multiply);
    assert.ok(base.getArg1() instanceof E_Function);
    assert.ok(base.getArg2() instanceof ExprVar);
    assertEquals('http://example/square', base.getArg1().getFunctionIRI());
    assertEquals(1, base.getVarsMentioned().size());
  });
  t('test_function_non_expansion_02', () => {
    let square = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', square, [...square.getVarsMentioned()]);
    const cube = new E_Multiply(new E_Function('http://example/square', new ExprList(new ExprVar('x'))), new ExprVar('x'));
    F().add('http://example/cube', cube, [...cube.getVarsMentioned()]);
    const f = F().create('http://example/cube');
    f.build('http://example/cube', new ExprList(new NodeValueInteger(2)));
    let actual = f.getActualExpr();
    let result = actual.eval(new Map());
    assertEquals(8, nodeToInt(result.asNode()));
    square = new ExprVar('x');
    F().add('http://example/square', square, [...square.getVarsMentioned()]);
    f.build('http://example/cube', new ExprList(new NodeValueInteger(2)));
    actual = f.getActualExpr();
    result = actual.eval(new Map());
    assertEquals(4, nodeToInt(result.asNode()));
  });
});
