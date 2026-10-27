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
//   jena-arq/src/test/java/org/apache/jena/riot/TestLangRIOT.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana.

import { RDFLanguages } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

function test(expected, string) {
  const lang = RDFLanguages.nameToLang(string);
  assertEquals(expected, lang);
}
function guess(filename, expected) {
  const lang = RDFLanguages.filenameToLang(filename);
  assertEquals(expected, lang);
}

describeJena('TestLangRIOT', 'jena-arq/src/test/java/org/apache/jena/riot/TestLangRIOT.java', (t) => {
  RDFLanguages.init(); // @BeforeAll
  t('lang_01', () => test(RDFLanguages.NTRIPLES, 'NT'));
  t('lang_02', () => test(RDFLanguages.NTRIPLES, 'N-Triples'));
  t('lang_03', () => test(RDFLanguages.NTRIPLES, 'N-TRIPLES'));
  t('lang_04', () => test(RDFLanguages.NTRIPLES, 'NTRIPLE'));
  t('lang_05', () => test(RDFLanguages.NTRIPLES, 'NTRIPLES'));
  t('lang_11', () => test(RDFLanguages.TURTLE, 'TTL'));
  t('lang_12', () => test(RDFLanguages.TURTLE, 'TUrtLE'));
  t('lang_21', () => test(RDFLanguages.RDFXML, 'RDF/XML'));
  t('lang_22', () => test(RDFLanguages.RDFXML, 'RDFXML'));
  t('lang_23', () => test(RDFLanguages.RDFXML, 'RDF/XML-ABBREV'));
  t('lang_30', () => test(RDFLanguages.RDFJSON, 'RDFJSON'));
  t('lang_31', () => test(RDFLanguages.RDFJSON, 'RDF/json'));
  t('lang_40', () => test(RDFLanguages.NQUADS, 'N-QUADS'));
  t('lang_41', () => test(RDFLanguages.NQUADS, 'NQuads'));
  t('lang_50', () => test(RDFLanguages.TRIG, 'TriG'));
  t('lang_51', () => test(RDFLanguages.TRIG, 'trig'));
  t('lang_52', () => test(RDFLanguages.TRIG, 'TRIG'));
  t('guess_01', () => guess('D.nt', RDFLanguages.NTRIPLES));
  t('guess_02', () => guess('D.ttl.nt', RDFLanguages.NTRIPLES));
  t('guess_03', () => guess('D.ttl', RDFLanguages.TURTLE));
  t('guess_04', () => guess('D.rdf', RDFLanguages.RDFXML));
  t('guess_06', () => guess('D.rj', RDFLanguages.RDFJSON));
  t('guess_08', () => guess('D.nq', RDFLanguages.NQUADS));
  t('guess_09', () => guess('D.trig', RDFLanguages.TRIG));
  t('guess_10', () => guess('D.jsonld', RDFLanguages.JSONLD));
  // JENA-1467 : URI fragments
  t('guess_11', () => guess('http://example/foo/bar.ttl#frag', RDFLanguages.TTL));
  t('guess_12', () => guess('bar.ttl#frag', RDFLanguages.TTL));
});
