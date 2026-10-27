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
//   jena-arq/src/test/java/org/apache/jena/query/TestResultSetFormatter.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The writer answers a Promise (awaited) and writes to
// a StringWriter in place of a ByteArrayOutputStream. Datatypes are test data
// (lib/testlib.mjs XSDDatatype).

import assert from 'node:assert/strict';
import {
  ModelFactory, AnonId, ResourceFactory, QueryFactory, QueryExecutionFactory, Syntax, ResultSetFormatter, StringWriter,
} from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { XSDDatatype } from '../../lib/testlib.mjs';

describeJena('TestResultSetFormatter', 'jena-arq/src/test/java/org/apache/jena/query/TestResultSetFormatter.java', (t) => {
  t('testIterator', async () => {
    const model = ModelFactory.createDefaultModel();
    {
      let r = model.createResource(AnonId.create('first'));
      let p = model.getProperty('');
      let node = ResourceFactory.createTypedLiteral('123', XSDDatatype.XSDdecimal);
      model.add(r, p, node);
      r = model.createResource(AnonId.create('second'));
      p = model.getProperty('');
      node = ResourceFactory.createTypedLiteral('abc', XSDDatatype.XSDstring);
      model.add(r, p, node);
      r = model.createResource(AnonId.create('third'));
      p = model.getProperty('');
      node = ResourceFactory.createLangLiteral('def', 'en');
      model.add(r, p, node);
      r = model.createResource(AnonId.create('fourth'));
      p = model.getProperty('');
      node = ResourceFactory.createTypedLiteral('true', XSDDatatype.XSDboolean);
      model.add(r, p, node);
    }
    const query = QueryFactory.create('JSON { "s": ?s , "p": ?p , "o" : ?o } WHERE { ?s ?p ?o }', Syntax.syntaxARQ);
    const qexec = QueryExecutionFactory.create(query, model);
    try {
      const execJsonItems = await qexec.execJsonItems();
      const baos = new StringWriter();
      await ResultSetFormatter.output(baos, execJsonItems);
      const output = baos.toString();
      assert.ok(output.includes('"_:first"'));
      assert.ok(output.includes('"_:second"'));
      assert.ok(output.includes('"_:third"'));
      assert.ok(output.includes('"_:fourth"'));
      assert.ok(!output.includes('"true"'));
      assert.ok(output.includes('true'));
      assert.ok(output.includes('123'));
      assert.ok(!output.includes('"123"'));
      assert.ok(output.includes('"abc"'));
    } finally { qexec.close(); }
  });
});
