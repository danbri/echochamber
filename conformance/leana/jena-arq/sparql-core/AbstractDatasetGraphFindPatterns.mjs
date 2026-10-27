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
//   jena-arq/src/test/java/org/apache/jena/sparql/core/AbstractDatasetGraphFindPatterns.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class is a function run by each concrete
// test file with its create(). AssertExtra.assertEqualsUnordered compares
// arrays with equals(). find_pattern_gso is as Jena wrote it (it finds gpo).

import assert from 'node:assert/strict';
import { parseNode, parseQuad, equalsUnordered } from './sse.mjs';

const q = parseQuad('(:g :s :p :o)');
const q_g = parseQuad('(:gx :s :p :o)');
const q_s = parseQuad('(:g :sx :p :o)');
const q_p = parseQuad('(:g :s :px :o)');
const q_o = parseQuad('(:g :s :p :ox)');
const q_gs = parseQuad('(:gx :sx :p :o)');
const q_gp = parseQuad('(:gx :s :px :o)');
const q_go = parseQuad('(:gx :s :p :ox)');
const q_sp = parseQuad('(:g :sx :px :o)');
const q_so = parseQuad('(:g :sx :p :ox)');
const q_po = parseQuad('(:g :s :px :ox)');
const q_gsp = parseQuad('(:gx :sx :px :o)');
const q_gpo = parseQuad('(:gx :s :px :ox)');
const q_gso = parseQuad('(:gx :sx :p :ox)');
const q_spo = parseQuad('(:g :sx :px :ox)');
const q_gspo = parseQuad('(:gx :sx :px :ox)');
const dataPattern = [q, q_g, q_s, q_p, q_o, q_gs, q_gp, q_go, q_sp, q_so, q_po, q_gsp, q_gpo, q_gso, q_spo, q_gspo];

const node = (str) => parseNode(str);
const assertEqualsUnordered = (a, b, msg) => assert.ok(equalsUnordered(a, b), `${msg}: Expected: ${b} : Actual: ${a}`);

export function runAbstractDatasetGraphFindPatterns(t, create) {
  const load = () => { const dsg = create(); for (const x of dataPattern) dsg.add(x); return dsg; };
  const pattern = (name, g, s, p, o, expected) => t(name, () => {
    const dsg = load();
    const quads1 = dsg.find(g && node(g), s && node(s), p && node(p), o && node(o)).toList();
    assert.ok(quads1);
    assertEqualsUnordered(quads1, expected, name);
  });

  t('find_quad_00', () => {
    const dsg = load();
    const quads1 = dsg.find().toList();
    assert.ok(quads1, 'find()');
    const quads2 = dsg.find(null, null, null, null).toList();
    assert.ok(quads2, 'find(null,null,null,null)');
    assertEqualsUnordered(quads1, quads2, 'find()');
  });
  pattern('find_pattern_gspo', ':g', ':s', ':p', ':o', [q]);
  pattern('find_pattern_g', ':gx', null, null, null, [q_g, q_gs, q_gp, q_go, q_gsp, q_gso, q_gpo, q_gspo]);
  pattern('find_pattern_s', null, ':sx', null, null, [q_s, q_gs, q_sp, q_so, q_gsp, q_gso, q_spo, q_gspo]);
  pattern('find_pattern_p', null, null, ':px', null, [q_p, q_gp, q_sp, q_po, q_gsp, q_gpo, q_spo, q_gspo]);
  pattern('find_pattern_o', null, null, null, ':ox', [q_o, q_go, q_so, q_po, q_gpo, q_gso, q_spo, q_gspo]);
  pattern('find_pattern_gs', ':gx', ':sx', null, null, [q_gs, q_gsp, q_gso, q_gspo]);
  pattern('find_pattern_gp', ':gx', null, ':px', null, [q_gp, q_gsp, q_gpo, q_gspo]);
  pattern('find_pattern_go', ':gx', null, null, ':ox', [q_go, q_gpo, q_gso, q_gspo]);
  pattern('find_pattern_sp', null, ':sx', ':px', null, [q_sp, q_gsp, q_spo, q_gspo]);
  pattern('find_pattern_so', null, ':sx', null, ':ox', [q_so, q_gso, q_spo, q_gspo]);
  pattern('find_pattern_po', null, null, ':px', ':ox', [q_po, q_gpo, q_spo, q_gspo]);
  pattern('find_pattern_gsp', ':gx', ':sx', ':px', null, [q_gsp, q_gspo]);
  pattern('find_pattern_gpo', ':gx', null, ':px', ':ox', [q_gpo, q_gspo]);
  pattern('find_pattern_gso', ':gx', null, ':px', ':ox', [q_gpo, q_gspo]);
  pattern('find_pattern_spo', null, ':sx', ':px', ':ox', [q_spo, q_gspo]);
}
