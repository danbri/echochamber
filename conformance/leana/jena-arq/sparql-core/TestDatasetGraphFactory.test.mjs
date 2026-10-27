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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphFactory.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. A GraphMaker is a function (name) => Graph;
// AtomicInteger is a number. NodeConst.TRUE, FALSE and nodeOne are written
// with NodeFactory.createLiteralDT.

import assert from 'node:assert/strict';
import { DatasetGraphFactory, NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

const XSD = 'http://www.w3.org/2001/XMLSchema#';

describeJena('TestDatasetGraphFactory', 'jena-arq/src/test/java/org/apache/jena/sparql/core/TestDatasetGraphFactory.java', (t) => {
  t('withGraphMaker', () => {
    let makerCount = 0;
    const graphMaker = (name) => { makerCount++; return DatasetGraphFactory.graphMakerMem.create(name); };
    const dsg = DatasetGraphFactory.createWithGraphMaker(graphMaker);
    assert.equal(makerCount, 1);
    const gn = NodeFactory.createURI('http://example/');
    const x = NodeFactory.createURI('http://example/x');
    dsg.add(gn, x, x, NodeFactory.createLiteralDT('true', XSD + 'boolean'));
    assert.equal(makerCount, 2);
    assert.equal(dsg.find().toList().length, 1);
    const gn2 = dsg.listGraphNodes().next();
    assert.ok(gn.equals(gn2));
    dsg.add(gn, x, x, NodeFactory.createLiteralDT('false', XSD + 'boolean'));
    dsg.add(gn, x, x, NodeFactory.createLiteralDT('1', XSD + 'integer'));
    assert.equal(makerCount, 2);
    assert.equal(dsg.find().toList().length, 3);
  });
});
