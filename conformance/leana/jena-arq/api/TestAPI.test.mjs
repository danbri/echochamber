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
//   jena-arq/src/test/java/org/apache/jena/sparql/api/TestAPI.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Query execution answers a Promise (awaited).
// GraphFactory.makeDefaultModel() is ModelFactory.createDefaultModel().
// try-with-resources is try/finally close().

import assert from 'node:assert/strict';
import { ModelFactory, QueryExecution, QuerySolutionMap } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals } from '../../lib/testlib.mjs';

const ns = 'http://example/ns#';
const m = ModelFactory.createDefaultModel();
const r1 = m.createResource();
const p1 = m.createProperty(ns + 'p1');
const p2 = m.createProperty(ns + 'p2');
const p3 = m.createProperty(ns + 'p3');
const dft = ModelFactory.createDefaultModel();
const s = dft.createResource(ns + 's');
const p = dft.createProperty(ns + 'p');
const o = dft.createResource(ns + 'o');
m.add(r1, p1, 'x1');
m.add(r1, p2, 'X2'); // NB Capital
m.add(r1, p3, 'y1');
dft.add(s, p, o);

async function withExec(qExec, body) {
  try { return await body(qExec); } finally { qExec.close(); }
}

describeJena('TestAPI', 'jena-arq/src/test/java/org/apache/jena/sparql/api/TestAPI.java', (t) => {
  t('testSelect1', async () => {
    const qs = 'SELECT * {?s ?p ?o}';
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const rs = await qExec.execSelect();
      assert.ok(rs.hasNext(), 'No results');
      const qSoln = rs.nextSolution();
      const qr = qSoln.getResource('s');
      const s1 = qr.getModel().listStatements().toSet();
      const s2 = m.listStatements().toSet();
      assertEquals(s1, s2);
    });
  });

  t('testConstruct1', async () => {
    const qs = 'CONSTRUCT {?s ?p ?o} WHERE { ?s ?p ?o }';
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const m2 = await qExec.execConstruct();
      assert.ok(!m2.isEmpty(), 'No results');
      assert.ok(m.isIsomorphicWith(m2), 'Not isonorphic');
    });
  });

  t('testConstructBad1', async () => {
    const qs = `PREFIX :     <http://example/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
CONSTRUCT {
    << 456 :p :o >> .
    ?x :p :o .
    :s ?x :o .
    :tt1 :p <<( ?x :c2 :c3 )>> .
    :tt2 :p <<( :c1 ?x :c3 )>> .
    :tt3 :p <<( :c1 :c2 <<( ?x :d2 :d3 )>> )>> .
 } WHERE { BIND(123 AS ?x) }
`;
    // Bad triples in result. They should be filtered out.
    await withExec(QueryExecution.model(m).query(qs).build(), async (qExec) => {
      const m2 = await qExec.execConstruct();
      assert.ok(m2.isEmpty(), 'Expected empty graph');
    });
  });

  t('testSubstitutionConstruct1', async () => {
    const init = new QuerySolutionMap();
    init.add('z', m.createLiteral('zzz'));
    const qs = "CONSTRUCT {?s ?p ?z} {?s ?p 'x1'}";
    await withExec(QueryExecution.model(m).query(qs).substitution(init).build(), async (qExec) => {
      const r = await qExec.execConstruct();
      assert.ok(r.size() > 0, 'Empty model');
      const p1b = m.createProperty(ns + 'p1');
      assert.ok(r.contains(null, p1b, init.get('z')), 'Empty model');
    });
  });
});
