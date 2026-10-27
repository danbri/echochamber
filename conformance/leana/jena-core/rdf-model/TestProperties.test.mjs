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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestProperties.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Not parameterised. new PropertyImpl(uri) is ResourceFactory.createProperty(uri).

import assert from 'node:assert/strict';
import { ResourceFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { NS } from '../../lib/testlib.mjs';

const createProperty = (uri) => ResourceFactory.createProperty(uri);
function testOrdinalValue(i, URI) {
  assert.equal(createProperty(URI).getOrdinal(), i, 'property should have expected ordinal value for ' + URI);
}
const testRDFOrdinalValue = (i, local) => testOrdinalValue(i, NS.rdf + local);

describeJena('TestProperties', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestProperties.java', (t) => {
  t('testNonOrdinalRDFURIs', () => {
    for (const l of ['x', 'x1', '_x', 'x123', '0xff', '_xff']) testRDFOrdinalValue(0, l);
  });
  t('testNonRDFElementURIsHaveOrdinal0', () => {
    for (const u of ['foo:bar', 'foo:bar1', 'foo:bar2', NS.rdfs + '_17']) testOrdinalValue(0, u);
  });
  t('testOrdinalValues', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1234, 67890]) testRDFOrdinalValue(n, '_' + n);
  });
});
