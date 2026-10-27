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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestNamespace.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// Also from jena-core/src/test/java/org/apache/jena/graph/compose/AbstractTestPrefixMapping.java (testShortForm). getFileName() is the fixture copy in conformance/leana/fixtures/jena-core/. Model.read/write take StringReader/StringWriter (java.io streams); read answers a Promise. ModelCom.addNamespaces is setNsPrefix per entry.

import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { ModelFactory, StringReader, StringWriter } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { statement } from '../../lib/testlib.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core');
const getFileName = (fn) => pathToFileURL(join(FIX, fn)).href;

// AbstractTestPrefixMapping constants.
const crispURI = 'http://crisp.nosuch.net/';
const ropeURI = 'scheme:rope/string#';
const butterURI = 'ftp://ftp.nowhere.at.all/cream#';
function testShortForm(title, ns) {
  ns.setNsPrefix('crisp', crispURI);
  ns.setNsPrefix('butter', butterURI);
  assert.equal(ns.shortForm(''), '', title);
  assert.equal(ns.shortForm(ropeURI), ropeURI, title);
  assert.equal(ns.shortForm(crispURI + 'tail'), 'crisp:tail', title);
  assert.equal(ns.shortForm(butterURI + 'here:we:are'), 'butter:here:we:are', title);
}

function makePrefixes(prefixes) {
  const result = new Map();
  for (const def of prefixes.split(';').filter(Boolean)) {
    const eq = def.indexOf('=');
    result.set(def.substring(0, eq), new Set([def.substring(eq + 1)]));
  }
  return result;
}
// ModelCom.addNamespaces(model, Map<String, Set<String>>): each prefix to each of its URIs.
function addNamespaces(m, ns) {
  for (const [prefix, uris] of ns) for (const uri of uris) m.setNsPrefix(prefix, uri);
}

describeJena('TestNamespace', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestNamespace.java', (t) => {
  t('testReadPrefixes', async () => {
    const model = ModelFactory.createDefaultModel();
    await model.read(getFileName('wg/rdf-ns-prefix-confusion/test0014.rdf'));
    const ns = model.getNsPrefixMap();
    assert.equal(ns.get('eg'), 'http://example.org/', 'namespace eg');
    assert.equal(ns.get('rdf'), 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'namespace rdf');
    assert.equal(ns.get('spoo') ?? null, null, 'not present');
  });

  t('testUseEasyPrefix', () => {
    testShortForm('default model', ModelFactory.createDefaultModel());
  });

  t('testWritePrefixes', async () => {
    const model = ModelFactory.createDefaultModel();
    addNamespaces(model, makePrefixes('fred=ftp://net.fred.org/;spoo=http://spoo.net/'));
    model.add(statement(model, 'http://spoo.net/S http://spoo.net/P http://spoo.net/O'));
    model.add(statement(model, 'http://spoo.net/S ftp://net.fred.org/P http://spoo.net/O'));
    const bout = new StringWriter();
    model.write(bout, 'RDF/XML');
    const bin = new StringReader(bout.toString());
    const m2 = ModelFactory.createDefaultModel();
    await m2.read(bin, 'http://example/base/', 'RDF/XML');
    const ns = m2.getNsPrefixMap();
    assert.equal(ns.get('spoo'), 'http://spoo.net/', 'namespace spoo');
    assert.equal(ns.get('fred'), 'ftp://net.fred.org/', 'namespace fred');
  });
});
