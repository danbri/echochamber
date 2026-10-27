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
//   jena-arq/src/test/java/org/apache/jena/query/TestQueryCloningCornerCases.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The query's syntax tree (ElementGroup,
// ElementPathBlock, ElementData, the VALUES data block) is gap 'query'.

import { QueryFactory, Triple, NodeFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertEquals, assertDiffer, NS } from '../../lib/testlib.mjs';
import { checkedClone } from './cloning.mjs';

describeJena('TestQueryCloningCornerCases', 'jena-arq/src/test/java/org/apache/jena/query/TestQueryCloningCornerCases.java', (t) => {
  t('testCloneOfDataAndPathBlocks', () => {
    const str = 'PREFIX eg: <http://www.example.org/> SELECT * { ?s eg:foo/eg:bar ?o VALUES (?s ?o) { (eg:baz 1) } }';
    const query = QueryFactory.create(str);
    const clone = checkedClone(query);
    {
      const cloneOfClone = clone.cloneQuery();
      const elt = cloneOfClone.getQueryPattern().get(0);
      const type = NodeFactory.createURI(NS.rdf + 'type');
      elt.addTriple(Triple.create(type, type, NodeFactory.createURI(NS.rdf + 'Property')));
      assertDiffer(elt, query);
    }
    assertEquals(query, clone);
    {
      const cloneOfClone = clone.cloneQuery();
      const elt = cloneOfClone.getQueryPattern().get(1);
      elt.getRows().push(new Map());
      assertDiffer(query, cloneOfClone);
    }
    assertEquals(query, clone);
  });
  t('testCloneOfValuesDataBlock', () => {
    const str = 'PREFIX eg: <http://www.example.org/> SELECT * { ?s eg:foo/eg:bar ?o } VALUES (?s ?o) { (eg:baz 1) }';
    const query = QueryFactory.create(str);
    const clone = checkedClone(query);
    assertEquals(query.getValuesData(), clone.getValuesData());
    clone.setValuesDataBlock(['x'], [new Map([['x', NodeFactory.createLiteralDT('1', NS.xsd + 'integer')]])]);
    assertDiffer(query.getValuesData(), clone.getValuesData());
  });
});
