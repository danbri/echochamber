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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModelRead.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over model kinds; it
// runs here once, on ModelFactory.createDefaultModel() (a term-equality model).
// Vocabulary constants (RDF.value, ...) are test data from lib/testlib.mjs.
// getFileName() is the fixture copy in conformance/leana/fixtures/jena-core/. Model.read answers a Promise of the model (Jena: the model).

import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { modelWithStatements, assertIsoModels } from '../../lib/testlib.mjs';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'jena-core');
const getFileName = (fn) => pathToFileURL(join(FIX, fn)).href;

describeJena('TestModelRead', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModelRead.java', (t) => {
  t('testDefaultLangXML', async () => {
    const model = ModelFactory.createDefaultModel();
    await model.read(getFileName('modelReading/plain.rdf'), null, null);
  });

  t('testLoadsSimpleModel', async () => {
    const model = ModelFactory.createDefaultModel();
    const expected = ModelFactory.createDefaultModel();
    await expected.read(getFileName('modelReading/simple.n3'), 'N3');
    assert.equal(await model.read(getFileName('modelReading/simple.n3'), 'base', 'N3'), model);
    assertIsoModels(expected, model);
  });

  t('testReturnsSelf', async () => {
    const model = ModelFactory.createDefaultModel();
    assert.equal(await model.read(getFileName('modelReading/empty.n3'), 'base', 'N3'), model);
    assert.ok(model.isEmpty());
  });

  t('testSimpleLoadExplicitBase', async () => {
    const mBasedExplicit = ModelFactory.createDefaultModel();
    await mBasedExplicit.read(getFileName('modelReading/based.n3'), 'http://example/', 'N3');
    assertIsoModels(modelWithStatements('http://example/ ja:predicate ja:object'), mBasedExplicit);
  });
});
