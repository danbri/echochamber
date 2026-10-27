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
//   jena-arq/src/test/java/org/apache/jena/riot/TestJenaReaderRIOT.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Reads answer a Promise (awaited). The fixture
// directory is the copied fixtures/jena-arq/testing/RIOT/Reader, as an
// absolute path: Jena's relative names ("testing/RIOT/Reader/D.ttl") and its
// cwd-based absolute names (read_url_3*, read_url_4*) are both this path.
// FileInputStream and RDFDataMgr.open are RDFDataMgr.open (the file text as a
// StringReader). StrUtils.strjoinNL is join('\n'). IRILib.filenameToIRI is
// node:url pathToFileURL.

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  ModelFactory, RDFDataMgr, RDFLanguages, RDFReaderFactoryRIOT, StringReader,
} from '@factoidal/leana';
import { readFileSync } from 'node:fs';
import { describeJena } from '../../lib/harness.mjs';
import { JENA_ARQ } from '../../lib/riotlib.mjs';

const directory = JENA_ARQ + 'testing/RIOT/Reader';
const filename = (f) => directory + '/' + f;
const plainRelFnTTL = directory + '/D.ttl';
const plainRelFnRDFXML = directory + '/D.rdf';

async function modelRead(fn) {
  const m = ModelFactory.createDefaultModel();
  await m.read(fn);
  return m;
}

async function jenaread1(dataurl) {
  dataurl = filename(dataurl);
  const m = ModelFactory.createDefaultModel();
  await m.read(dataurl);
  assert.ok(m.size() !== 0);
}

async function jenaread2(dataurl, lang) {
  // read via WebReader to make sure the test setup is right.
  dataurl = filename(dataurl);
  const m0 = ModelFactory.createDefaultModel();
  await RDFDataMgr.read(m0, dataurl, RDFLanguages.nameToLang(lang));
  assert.ok(m0.size() !== 0);
  const m1 = ModelFactory.createDefaultModel();
  await new RDFReaderFactoryRIOT().getReader(lang).read(m1, dataurl);
  assert.ok(m1.size() !== 0);
  // Read via Jena model API.
  const m2 = ModelFactory.createDefaultModel();
  const x = RDFLanguages.nameToLang(lang).getName();
  await m2.read(dataurl, x);
  assert.ok(m2.size() !== 0);
}

async function jenaread3(dataurl, lang, base) {
  dataurl = filename(dataurl);
  const m1 = ModelFactory.createDefaultModel();
  const m2 = ModelFactory.createDefaultModel();
  await RDFDataMgr.read(m1, dataurl, base, RDFLanguages.nameToLang(lang));
  await m2.read('file:' + dataurl, base, lang);
  assert.ok(m1.size() !== 0);
  assert.ok(m2.size() !== 0);
  assert.ok(m1.isIsomorphicWith(m2));
  // and check base processing ...
  const s = m1.listStatements().next().getSubject();
  assert.ok(s.getURI().startsWith('http://'));
  assert.ok(s.getURI() === 'http://baseuri/s');
}

async function jenareadStream(fn, lang) {
  fn = filename(fn);
  // Read with a base
  const m0 = ModelFactory.createDefaultModel();
  await RDFDataMgr.read(m0, RDFDataMgr.open(fn), 'http://example/base2', RDFLanguages.nameToLang(lang));
  // Read again, but without base
  const m1 = ModelFactory.createDefaultModel();
  await RDFDataMgr.read(m1, RDFDataMgr.open(fn), RDFLanguages.nameToLang(lang));
  // Read via Jena API.
  const m2 = ModelFactory.createDefaultModel();
  await m2.read(RDFDataMgr.open(fn), 'http://example/base3', lang);
  const x = readFileSync(fn, 'utf8');
  ModelFactory.createDefaultModel(); // m3 (unused in Jena too)
  await m2.read(new StringReader(x), 'http://example/base4', lang);
}

describeJena('TestJenaReaderRIOT', 'jena-arq/src/test/java/org/apache/jena/riot/TestJenaReaderRIOT.java', (t) => {
  t('read_01', () => jenaread1('D.nt'));
  t('read_02', () => jenaread1('D.ttl'));
  t('read_03', () => jenaread1('D.rdf'));
  t('read_04', () => jenaread1('D.rdf'));
  t('read_05', () => jenaread1('D.rj'));
  t('read_06', () => jenaread1('D.jsonld'));
  t('read_11', () => jenaread2('D.nt', 'N-TRIPLES'));
  t('read_12', () => jenaread2('D.ttl', 'TTL'));
  t('read_13', () => jenaread2('D.rdf', 'RDF/XML'));
  t('read_14', () => jenaread2('D.rdf', 'RDF/XML-ABBREV'));
  t('read_15', () => jenaread2('D.rj', 'RDF/JSON'));
  t('read_16', () => jenaread2('D.jsonld', 'JSON-LD'));
  t('read_21a', () => jenaread2('D-nt', 'N-TRIPLES'));
  t('read_21b', () => jenaread2('D-nt', 'NTRIPLES'));
  t('read_21c', () => jenaread2('D-nt', 'NT'));
  t('read_21d', () => jenaread2('D-nt', 'N-Triples'));
  t('read_22a', () => jenaread2('D-ttl', 'TURTLE'));
  t('read_22b', () => jenaread2('D-ttl', 'TTL'));
  t('read_23a', () => jenaread2('D-rdf', 'RDF/XML'));
  t('read_23b', () => jenaread2('D-rdf', 'RDFXML'));
  t('read_24', () => jenaread2('D-json', 'RDF/JSON'));

  t('read_30', async () => {
    {
      const inp = RDFDataMgr.open(filename('D-not-TTL.ttl'));
      const m0 = ModelFactory.createDefaultModel();
      await RDFDataMgr.read(m0, inp, RDFLanguages.RDFXML);
    }
    const in1 = RDFDataMgr.open(filename('D-not-TTL.ttl'));
    const m1 = ModelFactory.createDefaultModel();
    await m1.read(in1, null, 'RDF/XML');
  });

  // test read from StringReader..
  t('read_StringReader_31', async () => {
    const x = '<s> <p> <p> .';
    {
      const s = new StringReader(x);
      const m = ModelFactory.createDefaultModel();
      await RDFDataMgr.read(m, s, null, RDFLanguages.NTRIPLES);
    }
    const s1 = new StringReader('<s> <p> <p> .');
    const m1 = ModelFactory.createDefaultModel();
    await m1.read(s1, null, 'N-TRIPLES');
  });

  t('read_StringReader_32', async () => {
    const x = [
      '<rdf:RDF',
      '   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"',
      '   xmlns:j.0="http://example/">',
      '  <rdf:Description rdf:about="http://example/s">',
      '     <j.0:p rdf:resource="http://example/o"/>',
      '   </rdf:Description>',
      '</rdf:RDF>'].join('\n');
    {
      const s = new StringReader(x);
      const m = ModelFactory.createDefaultModel();
      await RDFDataMgr.read(m, s, null, RDFLanguages.RDFXML);
    }
    const s1 = new StringReader(x);
    const m = ModelFactory.createDefaultModel();
    await m.read(s1, null, 'RDF/XML');
  });

  // Stream opening is hardwired into jena!
  t('read_base_1', () => jenaread3('D-no-base.ttl', 'TTL', 'http://baseuri/'));
  t('read_input_1', () => jenareadStream('D.ttl', 'TTL'));
  t('read_input_2', () => jenareadStream('D.rdf', 'RDF/XML'));

  // Ways to pass in the filename.
  t('read_url_1', () => modelRead(plainRelFnTTL));
  t('read_url_1x', () => modelRead(plainRelFnRDFXML));
  t('read_url_2', () => modelRead('file:' + plainRelFnTTL));
  t('read_url_2x', () => modelRead('file:' + plainRelFnRDFXML));
  t('read_url_3', () => modelRead('file:' + plainRelFnTTL));
  t('read_url_3x', () => modelRead('file:' + plainRelFnRDFXML));
  t('read_url_4', () => modelRead(pathToFileURL(plainRelFnTTL).href));
  t('read_url_4x', () => modelRead(pathToFileURL(plainRelFnRDFXML).href));
});
