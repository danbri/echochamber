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
// Changed for echochamber: the static helpers slowClone and checkedClone, in
// JavaScript over @factoidal/leana, shared by the two cloning test files.

import { QueryFactory } from '@factoidal/leana';
import { assertEquals } from '../../lib/testlib.mjs';

export function slowClone(query) {
  const qs = query.toString();
  return QueryFactory.create(qs, query.getSyntax());
}

/** Clone by cloneQuery and by print-parse; they must agree. */
export function checkedClone(query) {
  const expected = slowClone(query);
  const actual = query.cloneQuery();
  assertEquals(query, actual);
  assertEquals(expected, actual);
  const again = slowClone(actual);
  assertEquals(query, again);
  return actual;
}
