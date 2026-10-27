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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestContext.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Symbol is leana's Symbol_. A Java Integer is a
// JavaScript number and a Java Long a BigInt (1L is 1n), so getInt of a long
// value is the ARQException of testCxt9. JA (Jena's assembler vocabulary,
// org.apache.jena.assembler.JA) is test data here: its three properties.
// Resource.addLiteral(JA.cxtValue, true) is as Jena wrote it.

import assert from 'node:assert/strict';
import {
  Context, Symbol_, NodeFactory, ModelFactory, ResourceFactory, AssemblerUtils, ARQException,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertThrows } from '../../lib/testlib.mjs';

const p1 = Symbol_.create('p1');
const p2 = Symbol_.create('p2');

const JA_NS = 'http://jena.hpl.hp.com/2005/11/Assembler#';
const JA = {
  context: ResourceFactory.createProperty(JA_NS + 'context'),
  cxtName: ResourceFactory.createProperty(JA_NS + 'cxtName'),
  cxtValue: ResourceFactory.createProperty(JA_NS + 'cxtValue'),
};

function parseTestContext(key) {
  const model = ModelFactory.createDefaultModel();
  const k = model.asRDFNode(key);
  const cxtRes = model.createResource().addProperty(JA.cxtName, k).addLiteral(JA.cxtValue, true);
  const r = model.createResource().addProperty(JA.context, cxtRes);
  return AssemblerUtils.parseContext(r);
}

describeJena('TestContext', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestContext.java', (t) => {
  t('testCxt1', () => { new Context(); });
  t('testCxt2', () => {
    const cxt = new Context();
    assert.ok(!cxt.isDefined(p1), 'Defined in empty context');
    cxt.set(p1, 'v');
    assert.ok(cxt.isDefined(p1), 'Not defined after .set');
    assert.equal(cxt.get(p1), 'v', 'Not the same');
  });
  t('testCxt3', () => {
    const cxt = new Context();
    cxt.set(p1, 'v');
    cxt.setIfUndef(p1, 'w');
    assert.equal(cxt.get(p1), 'v', 'Not as first set');
  });
  t('testCxt4', () => {
    const cxt = new Context();
    cxt.set(p1, 'true');
    assert.ok(cxt.isTrue(p1), 'Not true');
    assert.ok(cxt.isTrueOrUndef(p1), 'Not true or undef');
    assert.ok(cxt.isFalseOrUndef(p2), 'Not false or undef');
    assert.ok(!cxt.isFalse(p2), 'False when undef');
  });
  t('testCxt5', () => {
    const cxt = new Context();
    cxt.set(p1, 'false');
    assert.ok(cxt.isFalse(p1), 'Not false');
    assert.ok(cxt.isFalseOrUndef(p1), 'Not false or undef');
  });
  t('testCxt6', () => {
    const cxt = new Context();
    cxt.setTrue(p1);
    assert.ok(cxt.isTrue(p1), 'Not true');
    assert.equal(cxt.getAsString(p1), 'true', "Not string 'true'");
  });
  t('testCxt7', () => {
    const cxt = new Context();
    assert.equal(cxt.getInt(p1, -1), -1);
    cxt.set(p1, 1);
    assert.equal(cxt.getInt(p1, -1), 1);
  });
  t('testCxt8', () => {
    const cxt = new Context();
    assert.equal(cxt.getLong(p1, -1n), -1n);
    cxt.set(p1, 1n);
    assert.equal(cxt.getLong(p1, -2n), 1n);
  });
  t('testCxt9', () => {
    const cxt = new Context();
    assert.equal(cxt.getLong(p1, -1n), -1n);
    cxt.set(p1, 1n);
    assertThrows(ARQException, () => cxt.getInt(p1, -2));
  });
  t('testCxtAssemblerLiteral', () => {
    const keyNode = NodeFactory.createLiteralString('http://www.example.org/key');
    const keySym = Symbol_.create(keyNode.getLiteralLexicalForm());
    const cxt = parseTestContext(keyNode);
    assert.ok(cxt.isTrue(keySym));
  });
  t('testCxtAssemblerURI', () => {
    const keyNode = NodeFactory.createURI('http://www.example.org/key');
    const keySym = Symbol_.create(keyNode.getURI());
    const cxt = parseTestContext(keyNode);
    assert.ok(cxt.isTrue(keySym));
  });
  t('testCxtAssemblerInvalid', () => {
    assertThrows(ARQException, () => {
      parseTestContext(NodeFactory.createBlankNode());
    });
  });
});
