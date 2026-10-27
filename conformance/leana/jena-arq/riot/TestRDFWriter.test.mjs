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
//   jena-arq/src/test/java/org/apache/jena/riot/TestRDFWriter.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. SSE.parseGraph("(graph (:s :p :o))") is built with
// NodeFactory (SSE's default prefix ':' is <http://example/>).
// ByteArrayOutputStream and CharArrayWriter are leana StringWriter.

import assert from 'node:assert/strict';
import { GraphFactory, NodeFactory, RDFWriter, Lang, RiotException, StringWriter } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertThrows } from '../../lib/testlib.mjs';

const ex = (l) => NodeFactory.createURI('http://example/' + l);
const graph = GraphFactory.createGraphMem();
graph.add(ex('s'), ex('p'), ex('o'));

describeJena('TestRDFWriter', 'jena-arq/src/test/java/org/apache/jena/riot/TestRDFWriter.java', (t) => {
  t('rdfwriter_create', () => {
    RDFWriter.source(graph).build();
  });

  t('rdfwriter_string_output_1', () => {
    const s = RDFWriter.create().source(graph).lang(Lang.NT).asString();
    assert.ok(s.includes('example/s'));
  });

  t('rdfwriter_string_output_2', () => {
    const s = RDFWriter.create().source(graph).lang(Lang.NT).toString();
    assert.ok(s.includes('example/s'));
  });

  t('rdfwriter_no_source', () => {
    assertThrows(RiotException, () => RDFWriter.create().build());
  });

  t('rdfwriter_no_syntax', () => {
    assertThrows(RiotException, () => RDFWriter.create().source(graph).asString());
  });

  t('rdfwriter_output_1', () => {
    const bout = new StringWriter();
    RDFWriter.create().source(graph).lang(Lang.NT).output(bout);
    assert.ok(bout.toString().includes('example/s'));
  });

  t('rdfwriter_output_2', () => {
    const w = new StringWriter();
    RDFWriter.create().source(graph).lang(Lang.NT).build().output(w);
    assert.ok(w.toString().includes('example/s'));
  });
});
