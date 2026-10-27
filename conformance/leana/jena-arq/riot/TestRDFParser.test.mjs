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
//   jena-arq/src/test/java/org/apache/jena/riot/TestRDFParser.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. parse() answers a Promise (awaited). InputStream and
// java.io.StringReader sources are leana StringReader. Path.of(p) is the path
// string. DIR is the copied fixture directory (fixtures/jena-arq/testing/RIOT/Parser/)
// as an absolute path, since Jena runs these tests in jena-arq. SSE.parseNode
// expected values are written with NodeFactory. LogCtl.withLevel (logging
// only) runs its body directly. Txn.executeWrite(dsg, f) is dsg.executeWrite(f).

import assert from 'node:assert/strict';
import {
  GraphFactory, RDFParser, RDFParserBuilder, RDFDataMgr, Lang, RiotException, NodeFactory, Node,
  StringReader, StringWriter, ErrorHandlerFactory, StreamManager, LocatorFile, LabelToNode, FactoryRDFStd,
  PrefixMapFactory, DatasetGraphFactory,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, NS } from '../../lib/testlib.mjs';
import { JENA_ARQ, assertRejects } from '../../lib/riotlib.mjs';

const DIR = JENA_ARQ + 'testing/RIOT/Parser/';
const testdata = '@prefix : <http://example/ns#> . :x :x _:b .';

const PREFIX = `PREFIX :        <http://example/>
PREFIX rdf:     <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
`;
// SSE.parseNode(":s"), (":p"): SSE's default prefix ':' is <http://example/>.
const s = NodeFactory.createURI('http://example/s');
const p = NodeFactory.createURI('http://example/p');
const integer = (lex) => NodeFactory.createLiteralDT(lex, NS.xsd + 'integer');
const decimal = (lex) => NodeFactory.createLiteralDT(lex, NS.xsd + 'decimal');
const double = (lex) => NodeFactory.createLiteralDT(lex, NS.xsd + 'double');

class TestingFactoryRDF extends FactoryRDFStd {
  constructor() { super(); this.counter = 0; }
  createURI(uriStr) { this.counter++; return super.createURI(uriStr); }
}

function builder() {
  const input = new StringReader(testdata); // ByteArrayInputStream of testdata
  return RDFParserBuilder.create().lang(Lang.TTL).source(input);
}

async function testNormalization(input, objExpected, b) {
  const graph = GraphFactory.createDefaultGraph();
  const x = PREFIX + ':s :p ' + input;
  await b.source(new StringReader(x)).parse(graph);
  assert.equal(graph.size(), 1);
  const objObtained = graph.find(s, p, null).next().getObject();
  assertEquals(objExpected, objObtained);
}

describeJena('TestRDFParser', 'jena-arq/src/test/java/org/apache/jena/riot/TestRDFParser.java', (t) => {
  t('source_not_uri_01', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParserBuilder.create().lang(Lang.TTL).fromString(testdata).parse(graph);
    assert.equal(graph.size(), 1);
  });

  t('source_not_uri_02', async () => {
    const graph = GraphFactory.createGraphMem();
    const input = new StringReader(testdata);
    await RDFParser.create().lang(Lang.TTL).source(input).parse(graph);
    assert.equal(graph.size(), 1);
  });

  t('source_uri_01', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().source('file:' + DIR + 'data.ttl').parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('source_uri_02', async () => {
    const graph = GraphFactory.createGraphMem();
    await assertRejects(RiotException, () => RDFParser.create().source('file:' + DIR + 'data.unknown').parse(graph));
  });

  t('source_uri_03', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().source('file:' + DIR + 'data.unknown').lang(Lang.TTL).parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('source_uri_04', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().source(DIR + 'data.ttl').parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('source_uri_05', async () => {
    // Last source wins.
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().source('http://example/').source(DIR + 'data.ttl').parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('source_shortcut_01', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.fromString(testdata, Lang.TTL).parse(graph);
    assert.equal(graph.size(), 1);
  });

  t('source_notfound_1', async () => {
    const graph = GraphFactory.createGraphMem();
    await assertRejects(RiotException, () => RDFParser.create().source(DIR + 'data.nosuchfile.ttl').parse(graph));
  });

  t('source_notfound_2', async () => {
    const graph = GraphFactory.createGraphMem();
    await assertRejects(RiotException, () => RDFParser.create().source(DIR + 'data.nosuchfile.ttl').parse(graph));
  });

  t('source_uri_hint_lang', async () => {
    const graph = GraphFactory.createGraphMem();
    await assertRejects(RiotException, () => RDFParser.create().source('file:data.rdf')
      .lang(Lang.RDFXML)
      .errorHandler(ErrorHandlerFactory.errorHandlerNoLogging)
      .parse(graph));
  });

  t('source_string', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().fromString('<x> <p> <z> .').lang(Lang.NT).parse(graph);
    assert.equal(graph.size(), 1);
  });

  t('errorHandler', async () => {
    const graph = GraphFactory.createGraphMem();
    // This test file contains Turtle.
    await assertRejects(RiotException, () => RDFParser.create().source(DIR + 'data.rdf')
      .errorHandler(ErrorHandlerFactory.errorHandlerNoLogging)
      .parse(graph));
  });

  t('source_uri_force_lang', async () => {
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().source('file:' + DIR + 'data.rdf').forceLang(Lang.TTL).parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('source_streamManager', async () => {
    const sMgr = new StreamManager();
    sMgr.addLocator(new LocatorFile(DIR));
    const graph = GraphFactory.createGraphMem();
    await RDFParser.create().streamManager(sMgr).source('file:data.rdf').forceLang(Lang.TTL).parse(graph);
    assert.equal(graph.size(), 3);
  });

  t('labels_01', async () => {
    const graph = GraphFactory.createGraphMem();
    await builder().labelToNode(LabelToNode.createUseLabelAsGiven()).parse(graph);
    assert.equal(graph.size(), 1);
    const sw = new StringWriter();
    RDFDataMgr.write(sw, graph, Lang.NT);
    assert.ok(sw.toString().includes('_:Bb'));
  });

  t('factory_01', async () => {
    const f = new TestingFactoryRDF();
    const graph = GraphFactory.createGraphMem();
    await builder().factory(f).parse(graph);
    assert.equal(graph.size(), 1);
    assert.notEqual(f.counter, 0);
  });

  // Canonical literals.
  t('canonical_value_1', () => testNormalization('0123', integer('0123'), builder().canonicalValues(false)));
  t('canonical_value_2', () => testNormalization('+123', integer('123'), builder().canonicalValues(true)));
  t('canonical_value_3', () => testNormalization('+123.00', decimal('123.0'), builder().canonicalValues(true)));
  t('canonical_value_4', () => testNormalization('+123.00e0', double('123.0e0'), builder().canonicalValues(true)));
  t('canonical_value_5', () => testNormalization("'+INF'^^xsd:double", double('INF'), builder().canonicalValues(true)));
  // Check no conversion
  t('canonical_value_no_conversion_01', () => testNormalization('+123.00e0', double('+123.00e0'), builder().canonicalValues(false)));
  t('canonical_value_no_conversion_02', () => testNormalization("'+INF'^^xsd:double", double('+INF'), builder().canonicalValues(false)));

  t('parser_fragment', async () => {
    const pmap = PrefixMapFactory.create(new Map([['', 'http://example/']]));
    const g = await RDFParser.fromString('<s> :p :o .', Lang.TTL).prefixes(pmap).base('http://base/').toGraph();
    assert.ok(!g.isEmpty());
    const g2 = GraphFactory.createDefaultGraph();
    g2.add(NodeFactory.createURI('http://base/s'), NodeFactory.createURI('http://example/p'), NodeFactory.createURI('http://example/o'));
    assert.ok(g2.isIsomorphicWith(g));
  });

  t('parse_to_dataset_implicit', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata);
    const dsg = await b.toDatasetGraph();
    assert.equal([...dsg.stream()].length, 1);
  });

  t('parse_to_dataset_supplied', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata);
    const dsg = DatasetGraphFactory.create();
    await b.parse(dsg);
    assert.equal([...dsg.stream()].length, 1);
  });

  t('parse_to_dataset_supplied_in_transaction', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata);
    const dsg = DatasetGraphFactory.createTxnMem();
    await dsg.executeWrite(() => b.parse(dsg));
    assert.equal([...dsg.stream()].length, 1);
  });

  t('parse_to_dataset_malformed_01', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata + '\njunk data goes here');
    const dsg = DatasetGraphFactory.createTxnMem();
    try {
      await dsg.executeWrite(() => b.parse(dsg));
      assert.fail('Parsing should have produced an error');
    } catch (e) {
      if (!(e instanceof RiotException)) throw e;
      // Size should be zero: failure to parse aborts the transaction.
      assert.equal([...dsg.stream()].length, 0);
    }
  });

  t('parse_to_dataset_malformed_02', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata + '\njunk data goes here');
    const dsg = DatasetGraphFactory.createTxnMem();
    try {
      await b.parse(dsg);
      assert.fail('Parsing should have produced an error');
    } catch (e) {
      if (!(e instanceof RiotException)) throw e;
      // Without a transaction the valid quad would have gone into the dataset before the error.
      assert.equal([...dsg.stream()].length, 1);
    }
  });

  t('parse_to_dataset_malformed_03', async () => {
    const b = RDFParserBuilder.create().lang(Lang.TRIG).fromString(testdata + '\njunk data goes here');
    let dsg = null;
    try {
      dsg = await b.toDatasetGraph();
      assert.fail('Parsing should have produced an error');
    } catch (e) {
      if (!(e instanceof RiotException)) throw e;
      assert.equal(dsg, null);
    }
  });
});
