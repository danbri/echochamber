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
//   jena-core/src/test/java/org/apache/jena/shared/TestPrefixMapping.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Only the two methods TestPrefixMapping declares; the inherited BaseTestPrefixMapping methods run in BaseTestPrefixMapping.test.mjs on the same PrefixMappingImpl. Vocabulary namespace IRIs (RDF, RDFS, DC_11, OWL, RSS, VCARD, JA) are test data from lib/testlib.mjs.

import assert from 'node:assert/strict';
import { PrefixMapping } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { NS } from '../../lib/testlib.mjs';

function runTestStandard(st) {
  assert.equal(st.getNsPrefixURI('rdf'), NS.rdf);
  assert.equal(st.getNsPrefixURI('rdfs'), NS.rdfs);
  assert.equal(st.getNsPrefixURI('dc'), NS.dc);
  assert.equal(st.getNsPrefixURI('owl'), NS.owl);
}
function runTestExtended(st) {
  runTestStandard(st);
  assert.equal(st.getNsPrefixURI('rss'), NS.rss);
  assert.equal(st.getNsPrefixURI('vcard'), NS.vcard);
  assert.equal(st.getNsPrefixURI('ja'), NS.ja);
  assert.equal(st.getNsPrefixURI('eg'), 'http://www.example.org/');
}

describeJena('TestPrefixMapping', 'jena-core/src/test/java/org/apache/jena/shared/TestPrefixMapping.java', (t) => {
  t('testStandard', () => runTestStandard(PrefixMapping.Standard));
  t('testExtended', () => runTestExtended(PrefixMapping.Extended));
});
