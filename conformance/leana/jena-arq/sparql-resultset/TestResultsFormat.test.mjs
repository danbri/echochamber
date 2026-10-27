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
//   jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultsFormat.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. ResultsFormat.lookup is Jena's table of short names
// (API naming). leana has one RDF/XML writer: RDFFormat.RDFXML stands for
// Jena's RDFXML_ABBREV.

import { ResultsFormat, ResultSetLang, RDFFormat } from '@factoidal/leana';
import assert from 'node:assert/strict';
import { describeJena } from '../../lib/harness.mjs';

function test(string, expected, rsLang, triplesFormat, quadsFormat) {
  const rFmt = ResultsFormat.lookup(string);
  assert.equal(rFmt, expected);
  assert.equal(rFmt.resultSetLang(), rsLang);
  assert.equal(rFmt.triplesFormat(), triplesFormat);
  assert.equal(rFmt.quadsFormat(), quadsFormat);
}
function testBad(string) {
  assert.equal(ResultsFormat.lookup(string), null);
}

describeJena('TestResultsFormat', 'jena-arq/src/test/java/org/apache/jena/sparql/resultset/TestResultsFormat.java', (t) => {
  t('entry_srj', () => test('srj', ResultsFormat.JSON, ResultSetLang.RS_JSON, RDFFormat.JSONLD, RDFFormat.JSONLD));
  t('entry_srx', () => test('srx', ResultsFormat.XML, ResultSetLang.RS_XML, RDFFormat.RDFXML, null));
  t('entry_ttl1', () => test('ttl', ResultsFormat.TTL, null, RDFFormat.TURTLE, null));
  t('entry_ttl2', () => test('turtle', ResultsFormat.TTL, null, RDFFormat.TURTLE, null));
  t('entry_nt1', () => test('nt', ResultsFormat.NT, null, RDFFormat.NTRIPLES, null));
  t('entry_nt2', () => test('n-triples', ResultsFormat.NT, null, RDFFormat.NTRIPLES, null));
  t('entry_trig1', () => test('trig', ResultsFormat.TRIG, null, RDFFormat.TRIG, RDFFormat.TRIG));
  t('entry_nq1', () => test('NQ', ResultsFormat.NQ, null, RDFFormat.NQUADS, RDFFormat.NQUADS));
  t('entry_nq2', () => test('n-quads', ResultsFormat.NQ, null, RDFFormat.NQUADS, RDFFormat.NQUADS));
  t('entry_text1', () => test('text', ResultsFormat.TEXT, ResultSetLang.RS_Text, RDFFormat.TURTLE, RDFFormat.TRIG));
  t('entry_text2', () => test('txt', ResultsFormat.TEXT, ResultSetLang.RS_Text, RDFFormat.TURTLE, RDFFormat.TRIG));
  t('entry_text3', () => test('TXT', ResultsFormat.TEXT, ResultSetLang.RS_Text, RDFFormat.TURTLE, RDFFormat.TRIG));
  t('entry_xml', () => test('xml', ResultsFormat.XML, ResultSetLang.RS_XML, RDFFormat.RDFXML, null));
  t('entry_rdfxml', () => test('rdfxml', ResultsFormat.RDFXML, null, RDFFormat.RDFXML, null));
  t('entry_json', () => test('json', ResultsFormat.JSON, ResultSetLang.RS_JSON, RDFFormat.JSONLD, RDFFormat.JSONLD));
  t('entry_jsonld', () => test('jsonld', ResultsFormat.JSONLD, null, RDFFormat.JSONLD, RDFFormat.JSONLD));
  t('entry_bad', () => testBad('SHACL'));
});
