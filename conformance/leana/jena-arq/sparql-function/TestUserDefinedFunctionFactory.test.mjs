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
//   jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestUserDefinedFunctionFactory.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Functions defined by SPARQL expressions (the Expr
// object model, and an expression string parsed to it) are gap 'query'.

import assert from 'node:assert/strict';
import { before, after } from 'node:test';
import { UserDefinedFunctionFactory, E_Multiply, ExprVar } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const F = () => UserDefinedFunctionFactory.getFactory();

describeJena('TestUserDefinedFunctionFactory', 'jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestUserDefinedFunctionFactory.java', (t) => {
  before(() => F().clear());
  after(() => F().clear());
  t('test_user_defined_function_factory_instance', () => {
    const factory = UserDefinedFunctionFactory.getFactory();
    assert.notEqual(factory, null);
  });
  t('test_user_defined_function_factory_add_01', () => {
    const e = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', e, [...e.getVarsMentioned()]);
    assert.ok(F().isRegistered('http://example/square'));
    assertEquals(e, F().get('http://example/square').getBaseExpr());
  });
  t('test_user_defined_function_factory_add_02', () => {
    const e1 = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    const e2 = new E_Multiply(new ExprVar('y'), new ExprVar('y'));
    F().add('http://example/square', e1, [...e1.getVarsMentioned()]);
    assert.ok(F().isRegistered('http://example/square'));
    assertEquals(e1, F().get('http://example/square').getBaseExpr());
    F().add('http://example/square', e2, [...e2.getVarsMentioned()]);
    assert.ok(F().isRegistered('http://example/square'));
    assertEquals(e2, F().get('http://example/square').getBaseExpr());
  });
  t('test_user_defined_function_factory_add_03', () => {
    const e = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
    F().add('http://example/square', '?x * ?x', [...e.getVarsMentioned()]);
    assert.ok(F().isRegistered('http://example/square'));
    assertEquals(e, F().get('http://example/square').getBaseExpr());
  });
});
