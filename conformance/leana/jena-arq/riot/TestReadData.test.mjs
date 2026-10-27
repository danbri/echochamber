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
//   jena-arq/src/test/java/org/apache/jena/riot/TestReadData.java
//   jena-arq/src/test/java/org/apache/jena/riot/ErrorHandlerTestLib.java (ErrorHandlerEx, ExWarning)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Reads answer a Promise (awaited). The fixture
// directory is the copied fixtures/jena-arq/testing/RIOT/Reader. FileInputStream
// is RDFDataMgr.open (the file's text as a StringReader). Iter.count(it) is the
// length of the iterator's list.

import assert from 'node:assert/strict';
import {
  RDFDataMgr, RDFLanguages, DatasetFactory, ErrorHandlerFactory, JenaException,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { JENA_ARQ } from '../../lib/riotlib.mjs';

const directory = JENA_ARQ + 'testing/RIOT/Reader';
const filename = (f) => directory + '/' + f;

// ErrorHandlerTestLib
class ExWarning extends JenaException {}
class ErrorHandlerEx {
  warning(message) { throw new ExWarning(message); }
  error(message) { throw new JenaException(message); }
  fatal(message) { throw new JenaException(message); }
}

async function read(dataurl, lang = null) {
  if (typeof lang === 'string') lang = RDFLanguages.nameToLang(lang);
  dataurl = filename(dataurl);
  const ds = DatasetFactory.create();
  await RDFDataMgr.read(ds, dataurl, lang);
}

async function readStream(fn, lang) {
  if (typeof lang === 'string') lang = RDFLanguages.nameToLang(lang);
  fn = filename(fn);
  // Read with a base
  const ds0 = DatasetFactory.create();
  await RDFDataMgr.read(ds0, RDFDataMgr.open(fn), 'http://example/base2', lang);
  // Read again, but without base
  const ds1 = DatasetFactory.create();
  await RDFDataMgr.read(ds1, RDFDataMgr.open(fn), null, lang);
}

describeJena('TestReadData', 'jena-arq/src/test/java/org/apache/jena/riot/TestReadData.java', (t) => {
  // Model, graph
  t('read_01', () => read('D.nq'));
  t('read_02', () => read('D.trig'));
  t('read_03', () => read('D.nq', RDFLanguages.NQUADS));
  t('read_04', () => read('D.trig', RDFLanguages.TRIG));
  t('read_11', () => read('D.nq', 'N-Quads'));
  t('read_12', () => read('D.nq', 'NQuads'));
  t('read_13', () => read('D.nq', 'NQ'));
  t('read_14', () => read('D.trig', 'TriG'));
  t('read_15', () => read('D.trig', 'trig'));
  t('read_21', () => read('D-nq', RDFLanguages.NQUADS));
  t('read_22', () => read('D-trig', RDFLanguages.TRIG));
  t('read_23', () => read('D-nq', 'NQuads'));
  t('read_24', () => read('D-trig', 'TRIG'));
  t('read_input_1', () => readStream('D.nq', 'NQ'));
  t('read_input_2', () => readStream('D.trig', 'trig'));

  t('load_01', () => RDFDataMgr.loadModel(filename('D.nt')));
  t('load_02', () => RDFDataMgr.loadModel(filename('D.nt'), RDFLanguages.NTRIPLES));
  t('load_03', () => RDFDataMgr.loadModel(filename('D-nt'), RDFLanguages.NTRIPLES));
  t('load_04', () => RDFDataMgr.loadDataset(filename('D.nq')));
  t('load_05', () => RDFDataMgr.loadDataset(filename('D.nq'), RDFLanguages.NQUADS));
  t('load_06', () => RDFDataMgr.loadDataset(filename('D-nq'), RDFLanguages.NQUADS));
  t('load_11', () => RDFDataMgr.loadGraph(filename('D.nt')));
  t('load_12', () => RDFDataMgr.loadGraph(filename('D.nt'), RDFLanguages.NTRIPLES));
  t('load_13', () => RDFDataMgr.loadGraph(filename('D-nt'), RDFLanguages.NTRIPLES));
  t('load_14', () => RDFDataMgr.loadDatasetGraph(filename('D.nq')));
  t('load_15', () => RDFDataMgr.loadDatasetGraph(filename('D.nq'), RDFLanguages.NQUADS));
  t('load_16', () => RDFDataMgr.loadDatasetGraph(filename('D-nq'), RDFLanguages.NQUADS));

  // Load triples into DSG
  t('load_17', async () => {
    const dsg = await RDFDataMgr.loadDatasetGraph(filename('D.ttl'));
    assert.ok(!dsg.getDefaultGraph().isEmpty());
    assert.equal(dsg.listGraphNodes().toList().length, 0);
  });

  // Load quads into graph - warning on named graphs
  t('load_18', async () => {
    const err = ErrorHandlerFactory.getDefaultErrorHandler();
    try {
      ErrorHandlerFactory.setDefaultErrorHandler(new ErrorHandlerEx());
      try {
        await RDFDataMgr.loadGraph(filename('D.trig'));
        assert.fail('No expection generated');
      } catch (e) {
        if (!(e instanceof ExWarning)) throw e;
      }
      ErrorHandlerFactory.setDefaultErrorHandler(ErrorHandlerFactory.errorHandlerNoLogging);
      const g = await RDFDataMgr.loadGraph(filename('D.trig'));
      assert.ok(!g.isEmpty());
      assert.equal(g.size(), 1);
    } finally {
      ErrorHandlerFactory.setDefaultErrorHandler(err);
    }
  });
});
