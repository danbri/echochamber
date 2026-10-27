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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestReaders.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind). getInputStream() is RDFDataMgr.open on the
// fixture copy in conformance/leana/fixtures/jena-core/ (the file text as a
// StringReader); Model.read answers a Promise (awaited). The remote-read tests
// keep Jena's "no public internet" escape: a JenaException caused by an I/O
// failure, or (leana reads files, not URLs) a RiotNotFoundException for the
// http(s) URL, is the noPublicInternet() branch; Jena's logger warning is dropped.

import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  ModelFactory, NTripleReader, RDFDataMgr, JenaException, RiotNotFoundException, LeanaUnsupportedError,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core');
const getInputStream = (fn) => RDFDataMgr.open(join(FIX, fn));

/** Jena: jx.getCause() is NoRouteToHost/UnknownHost/Connect/IOException. */
const isNoInternet = (jx) => jx instanceof RiotNotFoundException ||
  (jx.cause && (jx.cause.code !== undefined || /fetch failed|network/i.test(String(jx.cause.message))));

describeJena('TestReaders', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestReaders.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, async () => {
    model = ModelFactory.createDefaultModel();
    try { return await fn(); } finally { model.close(); }
  });
  const noPublicInternet = () => {};
  const remote = async (fn) => {
    try {
      await fn();
    } catch (jx) {
      if (jx instanceof JenaException && !(jx instanceof LeanaUnsupportedError) && isNoInternet(jx)) noPublicInternet();
      else throw jx;
    }
  };

  t('testGetNTripleReader', () => {
    const reader = new NTripleReader();
    assert.notEqual(reader, null);
  });

  t('testReadLocalNTriple', async () => {
    await model.read(getInputStream('TestReaders.nt'), '', 'N-TRIPLE');
    assert.equal(model.size(), 5, 'Wrong size model');
    const iter = model.listStatements(null, null, 'foo"\\\n\r\tbar');
    assert.ok(iter.hasNext(), 'No next statement found');
  });

  t('testReadLocalRDF', async () => {
    await model.read(getInputStream('TestReaders.rdf'), 'http://example.org/');
  });

  t('testReadRemoteNTriple', () => remote(() =>
    model.read('https://www.w3.org/2000/10/rdf-tests/rdfcore/' + 'rdf-containers-syntax-vs-schema/test001.nt', 'N-TRIPLE')));

  t('testReadRemoteRDF', () => remote(() =>
    model.read('https://www.w3.org/2000/10/rdf-tests/rdfcore/' + 'rdf-containers-syntax-vs-schema/test001.rdf')));
});
