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
//   jena-arq/src/test/java/org/apache/jena/query/TestQueryCloningEssentials.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The class is parameterised in Jena over every .rq
// file under jena-arq/testing/ARQ (copied to fixtures/jena-arq/testing/ARQ);
// runTest runs here over all of them in turn. Jena drops the files that do
// not parse; leana does not parse at create (a leana Query is its text), so
// every file is used. A leana Query equals another with the same text and
// base: cloneQuery and the print-parse clone agree as text. Jena compares
// syntax trees (that object model is gap 'query').

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { QueryFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { checkedClone } from './cloning.mjs';
import { JENA_ARQ } from '../../lib/riotlib.mjs';

function rqFiles(dir) {
  const out = [];
  for (const f of readdirSync(dir).sort()) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...rqFiles(p));
    else if (f.endsWith('.rq')) out.push(p);
  }
  return out;
}

describeJena('TestQueryCloningEssentials', 'jena-arq/src/test/java/org/apache/jena/query/TestQueryCloningEssentials.java', (t) => {
  t('runTest', () => {
    const files = rqFiles(join(JENA_ARQ, 'testing', 'ARQ'));
    if (files.length !== 228) throw new Error('expected 228 .rq fixtures, found ' + files.length);
    for (const f of files) {
      const query = QueryFactory.create(readFileSync(f, 'utf8').split(/\r?\n/).join('\n'));
      checkedClone(query);
    }
  });
});
