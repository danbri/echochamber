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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestHiddenStatements.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Jena runs the class once per ModelCreators kind (plain,
// Intersection, Difference, Union); here each method runs over all four in turn
// (testlib modelCreators). PrefixMapping.Standard is test data (testlib
// Standard); Java Map.equals is a same-entries check of two JS Maps.

import assert from 'node:assert/strict';
import { describeJena } from '../../lib/harness.mjs';
import { modelCreators, Standard } from '../../lib/testlib.mjs';

function sameMapping(L, R) {
  const a = L.getNsPrefixMap(), b = R.getNsPrefixMap();
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (!b.has(k) || b.get(k) !== v) return false;
  return true;
}
function assertSameMapping(L, R) {
  if (!sameMapping(L, R)) assert.fail('wanted ' + L + ' but got ' + R);
}

describeJena('TestHiddenStatements', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestHiddenStatements.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    for (const [kind, create] of modelCreators) {
      model = create();
      try { fn(kind); } finally { model.close(); }
    }
  });

  t('testPrefixCopied', () => {
    model.setNsPrefixes(Standard);
    assertSameMapping(Standard, model);
  });
});
