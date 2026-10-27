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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestReaderEvents.java
//   jena-core/src/test/java/org/apache/jena/rdf/model/RecordingModelListener.java (the parts used)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind). The reader's read answers a Promise (awaited).
// testReaderEvent is a helper (public but not an @Test) and is not a test here.

import assert from 'node:assert/strict';
import { ModelFactory, GraphEvents, StringReader } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

/** Jena RecordingModelListener: the history of a ModelChangedListener (Java List equality). */
class RecordingModelListener {
  constructor() { this.history = []; }
  record(...xs) { this.history.push(...xs); }
  addedStatement(s) { this.record('add', s); }
  addedStatements(x) { this.record('addList', x); }
  removedStatement(s) { this.record('remove', s); }
  removedStatements(x) { this.record('removeList', x); }
  notifyEvent(m, event) { this.record('someEvent', m, event); }
  static eq(a, b) { return a === b || (a && typeof a.equals === 'function' && a.equals(b)); }
  hasStart(L) { return L.length <= this.history.length && L.every((x, i) => RecordingModelListener.eq(x, this.history[i])); }
  hasEnd(L) {
    const off = this.history.length - L.length;
    return off >= 0 && L.every((x, i) => RecordingModelListener.eq(x, this.history[off + i]));
  }
  assertHasStart(start) { assert.ok(this.hasStart(start), `expected [${start}] at the beginning of [${this.history}]`); }
  assertHasEnd(end) { assert.ok(this.hasEnd(end), `expected [${end}] at the end of [${this.history}]`); }
}

describeJena('TestReaderEvents', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestReaderEvents.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, async () => {
    model = ModelFactory.createDefaultModel();
    try { return await fn(); } finally { model.close(); }
  });
  const testReaderEvent = async (language, emptyModel) => {
    const L = new RecordingModelListener();
    model.register(L);
    const r = model.getReader(language);
    const stringReader = new StringReader(emptyModel);
    await r.read(model, stringReader, '');
    L.assertHasStart(['someEvent', model, GraphEvents.startRead]);
    L.assertHasEnd(['someEvent', model, GraphEvents.finishRead]);
  };

  t('testNTriplesReaderEvents', () => testReaderEvent('N-TRIPLE', ''));

  t('testXMLReaderEvents', () => {
    const emptyModel = "<rdf:RDF xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#'></rdf:RDF>";
    return testReaderEvent('RDF/XML', emptyModel);
  });
});
