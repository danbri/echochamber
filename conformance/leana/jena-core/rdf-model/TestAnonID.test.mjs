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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestAnonID.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Not parameterised. JenaParameters.disableBNodeUIDGeneration selects how Jena's JVM
// makes AnonId strings (java.rmi UID or a counter); leana has one label supply (the
// engine's DataFactory), so the flag is dropped and doTestAnonID runs twice as in Jena.

import assert from 'node:assert/strict';
import { AnonId } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertDiffer } from '../../lib/testlib.mjs';

function doTestAnonID() {
  const id1 = AnonId.create(), id2 = AnonId.create(), id3 = AnonId.create(), id4 = AnonId.create();
  assertDiffer(id1, id2);
  assertDiffer(id1, id3);
  assertDiffer(id1, id4);
  assertDiffer(id2, id3);
  assertDiffer(id2, id4);
}

describeJena('TestAnonID', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestAnonID.java', (t) => {
  t('testAnonID', () => {
    doTestAnonID(); // disableBNodeUIDGeneration = false
    doTestAnonID(); // disableBNodeUIDGeneration = true
  });

  t('testAnonIdPreserved', () => {
    const anon = AnonId.create();
    const id = anon.toString();
    assertEquals(anon, AnonId.create(id));
    assert.equal(AnonId.create(id).toString(), id);
  });
});
