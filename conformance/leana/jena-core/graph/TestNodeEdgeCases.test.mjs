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
//   jena-core/src/test/java/org/apache/jena/graph/TestNodeEdgeCases.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. RDFLangString.rdfLangString and RDFDirLangString.rdfDirLangString are the datatype objects of their IRIs (test data).

import assert from 'node:assert/strict';
import { NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { dtLangString, dtDirLangString } from '../../lib/testlib.mjs';

describeJena('TestNodeEdgeCases', 'jena-core/src/test/java/org/apache/jena/graph/TestNodeEdgeCases.java', (t) => {
  t('term_create_01', () => {
    // "abc"^^rdf:langString (no language)
    const node1 = NodeFactory.createLiteral('abc', null, null, dtLangString);
    assert.ok(node1 != null);
    const node2 = NodeFactory.createLiteralDT('abc', dtLangString);
    assert.ok(node2 != null);
  });
  t('term_create_02', () => {
    // "abc"^^rdf:dirLangString (no language, no base direction)
    const node1 = NodeFactory.createLiteral('abc', null, null, dtDirLangString);
    assert.ok(node1 != null);
    const node2 = NodeFactory.createLiteralDT('abc', dtDirLangString);
    assert.ok(node2 != null);
  });
});
