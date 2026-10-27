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
//   jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestUserFunctionsInSparql.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The @BeforeAll definition of the square function
// runs at the start of the method (a failing hook would hide the method).
// Functions defined by SPARQL expressions (the Expr object model) are gap
// 'query'. A Binding is a Map from variable name to Node; intToNode(4) is
// "4"^^xsd:integer.

import assert from 'node:assert/strict';
import {
  UserDefinedFunctionFactory, E_Multiply, ExprVar, QueryFactory, QueryExecutionFactory, ModelFactory, NodeFactory,
} from '@factoidal/leana';
import { after } from 'node:test';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, XSD } from '../../lib/testlib.mjs';

function setup() {
  UserDefinedFunctionFactory.getFactory().clear();
  const square = new E_Multiply(new ExprVar('x'), new ExprVar('x'));
  UserDefinedFunctionFactory.getFactory().add('http://example/square', square, [...square.getVarsMentioned()]);
}

describeJena('TestUserFunctionsInSparql', 'jena-arq/src/test/java/org/apache/jena/sparql/function/user/TestUserFunctionsInSparql.java', (t) => {
  after(() => UserDefinedFunctionFactory.getFactory().clear());
  t('test_user_functions_in_sparql', async () => {
    setup();
    assert.ok(UserDefinedFunctionFactory.getFactory().isRegistered('http://example/square'));
    const q = QueryFactory.create('SELECT (<http://example/square>(2) AS ?square) { }');
    const qe = QueryExecutionFactory.create(q, ModelFactory.createDefaultModel());
    try {
      const rset = await qe.execSelect();
      assert.ok(rset.hasNext());
      const b = rset.nextBinding();
      assert.ok(!rset.hasNext());
      assertEquals(NodeFactory.createLiteralDT('4', XSD.integer), b.get('square'));
    } finally { qe.close(); }
  });
});
