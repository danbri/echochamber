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
//   jena-core/src/test/java/org/apache/jena/vocabulary/TestVocabRDF.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. RDF is leana's vocabulary class (the class under test),
// not the test data of lib/testlib.mjs; the expected IRIs are test data.

import { RDF } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const RDFns = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

describeJena('TestVocabRDF', 'jena-core/src/test/java/org/apache/jena/vocabulary/TestVocabRDF.java', (t) => {
  t('testRDFVocabulary', () => {
    const ns = RDFns;
    assertEquals(ns, RDF.getURI());
    for (const k of ['Alt', 'Bag', 'Property', 'Seq', 'Statement', 'List', 'nil', 'type', 'rest', 'first', 'subject', 'predicate', 'object', 'value']) {
      assertEquals(ns + k, RDF[k].getURI());
    }
  });

  t('testLI', () => {
    const ns = RDFns;
    assertEquals(ns + '_1', RDF.li(1).getURI());
    assertEquals(ns + '_1', RDF.li(1).getURI());
    assertEquals(ns + '_10', RDF.li(10).getURI());
    assertEquals(ns + '_11', RDF.li(11).getURI());
    assertEquals(ns + '_100', RDF.li(100).getURI());
    assertEquals(ns + '_123', RDF.li(123).getURI());
    assertEquals(ns + '_32768', RDF.li(32768).getURI());
  });

  t('testNodes', () => {
    for (const k of ['Alt', 'Bag', 'Property', 'Seq', 'Statement', 'List', 'nil', 'type', 'rest', 'first', 'subject', 'predicate', 'object', 'value']) {
      assertEquals(RDF[k].asNode(), RDF.Nodes[k]);
    }
  });
});
