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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestBagMethods.java
//   jena-core/src/test/java/org/apache/jena/rdf/model/AbstractContainerMethods.java (inherited methods)
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; run once on ModelFactory.createDefaultModel() (Jena
// runs it per ModelCreators kind); the inherited methods come from
// AbstractContainerMethods.mjs; RDF.Bag is test data (lib/testlib.mjs).

import { ModelFactory } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { RDF } from '../../lib/testlib.mjs';
import { containerMethods } from './AbstractContainerMethods.mjs';

describeJena('TestBagMethods', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestBagMethods.java', (t0) => {
  let model;
  const t = (name, fn) => t0(name, () => {
    model = ModelFactory.createDefaultModel();
    try { return fn(); } finally { model.close(); }
  });
  containerMethods(t, {
    model: () => model,
    createContainer: () => model.createBag(),
    getContainerType: () => RDF.Bag,
  });
});
