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
//   jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestFunctionExpansion.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Functions defined by SPARQL expressions (the Expr
// object model, its expansion and evaluation) are gap 'query'. A List<Var>
// is an array of variable names; SSE_ExprBuildException is QueryException
// here; nodeToInt(n) is the integer of the literal.

import assert from 'node:assert/strict';
import { before, after } from 'node:test';
import {
  UserDefinedFunctionFactory, E_Multiply, E_Add, E_Subtract, E_Function, ExprVar, ExprList,
  NodeValueInteger, NodeValueDouble, NodeValueBoolean, QueryException,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertThrows } from '../../lib/testlib.mjs';

const F = () => UserDefinedFunctionFactory.getFactory();
const nodeToInt = (n) => Number(n.getLiteralLexicalForm());
const list = (...xs) => { const l = new ExprList(); for (const x of xs) l.add(x); return l; };

/** test_function_expansion_06 .. 09, 12: takeaway(x, y) = x - y, then test = takeaway(args) with defArgs. */
function takeawayThen(args, defArgs) {
  const takeaway = new E_Subtract(new ExprVar('x'), new ExprVar('y'));
  F().add('http://example/takeaway', takeaway, ['x', 'y']);
  const test = new E_Function('http://example/takeaway', args());
  F().add('http://example/test', test, defArgs);
  const base = F().get('http://example/test').getBaseExpr();
  assert.ok(base instanceof E_Subtract);
  return base;
}

/** test_function_expansion_04, 05: cube = square(v) * v is expanded. */
function cubeExpanded(v) {
  const square = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
  F().add('http://example/square', square, [...square.getVarsMentioned()]);
  const cube = new E_Multiply(new E_Function('http://example/square', new ExprList(new ExprVar(v))), new ExprVar(v));
  F().add('http://example/cube', cube, [...cube.getVarsMentioned()]);
  const base = F().get('http://example/cube').getBaseExpr();
  assert.ok(base instanceof E_Multiply);
  assert.ok(base.getArg1() instanceof E_Multiply);
  assert.ok(base.getArg2() instanceof ExprVar);
  assertEquals(1, base.getVarsMentioned().size());
}

/** test_function_expansion_10, 11: add(x, y) = single(v) + y. */
function addSingle(v) {
  const single = new ExprVar('x');
  F().add('http://example/single', single, [...single.getVarsMentioned()]);
  const add = new E_Add(new E_Function('http://example/single', new ExprList(new ExprVar(v))), new ExprVar('y'));
  F().add('http://example/add', add, ['x', 'y']);
  const base = F().get('http://example/add').getBaseExpr();
  assert.ok(base instanceof E_Add);
  assert.ok(base.getArg1() instanceof ExprVar);
  assert.ok(base.getArg2() instanceof ExprVar);
  return base;
}

describeJena('TestFunctionExpansion', 'jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestFunctionExpansion.java', (t) => {
  before(() => { F().clear(); F().setPreserveDependencies(false); });
  after(() => { F().clear(); F().setPreserveDependencies(false); });

  t('test_function_expansion_01', () => {
    const e = new ExprVar('x');
    F().add('http://example/simple', e, [...e.getVarsMentioned()]);
    const f = F().create('http://example/simple');
    f.build('http://example/simple', new ExprList(new NodeValueBoolean(true)));
    const actual = f.getActualExpr();
    assert.ok(!e.equals(actual));
    assertEquals(0, actual.getVarsMentioned().size());
    assertEquals(new NodeValueBoolean(true), actual);
  });
  t('test_function_expansion_02', () => {
    const e = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', e, [...e.getVarsMentioned()]);
    const f = F().create('http://example/square');
    f.build('http://example/square', new ExprList(new NodeValueInteger(3)));
    const actual = f.getActualExpr();
    assert.ok(!e.equals(actual));
    assertEquals(0, actual.getVarsMentioned().size());
    assertEquals(new E_Multiply(new NodeValueInteger(3), new NodeValueInteger(3)), actual);
  });
  t('test_function_expansion_03', () => {
    const e = new E_Multiply(new ExprVar('x'), new ExprVar('y'));
    F().add('http://example/square', e, ['x', 'y']);
    const f = F().create('http://example/square');
    f.build('http://example/square', list(new NodeValueInteger(3), new NodeValueInteger(4)));
    const actual = f.getActualExpr();
    assert.ok(!e.equals(actual));
    assertEquals(0, actual.getVarsMentioned().size());
    assertEquals(new E_Multiply(new NodeValueInteger(3), new NodeValueInteger(4)), actual);
  });
  t('test_function_expansion_04', () => cubeExpanded('x'));
  t('test_function_expansion_05', () => cubeExpanded('y'));
  t('test_function_expansion_06', () => {
    const s = takeawayThen(() => list(new NodeValueInteger(1), new NodeValueDouble(2.3)), []);
    assert.ok(s.getArg1() instanceof NodeValueInteger);
    assert.ok(s.getArg2() instanceof NodeValueDouble);
  });
  t('test_function_expansion_07', () => {
    const s = takeawayThen(() => list(new NodeValueDouble(2.3), new NodeValueInteger(1)), []);
    assert.ok(s.getArg1() instanceof NodeValueDouble);
    assert.ok(s.getArg2() instanceof NodeValueInteger);
  });
  t('test_function_expansion_08', () => {
    const s = takeawayThen(() => list(new ExprVar('a'), new ExprVar('b')), ['a', 'b']);
    assert.ok(s.getArg1() instanceof ExprVar);
    assert.ok(s.getArg2() instanceof ExprVar);
    assertEquals(s.getArg1().getVarName(), 'a');
    assertEquals(s.getArg2().getVarName(), 'b');
  });
  t('test_function_expansion_09', () => {
    const s = takeawayThen(() => list(new ExprVar('b'), new ExprVar('a')), ['a', 'b']);
    assert.ok(s.getArg1() instanceof ExprVar);
    assert.ok(s.getArg2() instanceof ExprVar);
    assertEquals(s.getArg1().getVarName(), 'b');
    assertEquals(s.getArg2().getVarName(), 'a');
  });
  t('test_function_expansion_10', () => {
    const a = addSingle('x');
    assertEquals('x', a.getArg1().getVarName());
    assertEquals('y', a.getArg2().getVarName());
  });
  t('test_function_expansion_11', () => {
    const a = addSingle('y');
    assertEquals('y', a.getArg1().getVarName());
    assertEquals('y', a.getArg2().getVarName());
  });
  t('test_function_expansion_12', () => {
    const s = takeawayThen(() => list(new ExprVar('a'), new ExprVar('a')), ['a', 'b']);
    assert.ok(s.getArg1() instanceof ExprVar);
    assert.ok(s.getArg2() instanceof ExprVar);
    assertEquals(s.getArg1().getVarName(), 'a');
    assertEquals(s.getArg2().getVarName(), 'a');
  });
  t('test_function_expansion_13', () => {
    let square = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', square, [...square.getVarsMentioned()]);
    const cube = new E_Multiply(new E_Function('http://example/square', new ExprList(new ExprVar('x'))), new ExprVar('x'));
    F().add('http://example/cube', cube, [...cube.getVarsMentioned()]);
    const f = F().create('http://example/cube');
    f.build('http://example/cube', new ExprList(new NodeValueInteger(2)));
    let result = f.getActualExpr().eval(new Map());
    assertEquals(8, nodeToInt(result.asNode()));
    square = new ExprVar('x');
    F().add('http://example/square', square, [...square.getVarsMentioned()]);
    f.build('http://example/cube', new ExprList(new NodeValueInteger(2)));
    result = f.getActualExpr().eval(new Map());
    assertEquals(8, nodeToInt(result.asNode()));
  });
  t('test_function_expansion_bad_01', () => {
    const add = new E_Add(new ExprVar('x'), new ExprVar('y'));
    assertThrows(QueryException, () => F().add('http://example/add', add, []));
  });
  t('test_function_expansion_bad_02', () => {
    const single = new ExprVar('x');
    F().add('http://example/single', single, [...single.getVarsMentioned()]);
    const test = new E_Function('http://example/single', new ExprList(new ExprVar('x')));
    assertThrows(QueryException, () => F().add('http://example/test', test, []));
  });
});
