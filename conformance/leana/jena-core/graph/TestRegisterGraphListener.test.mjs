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
//   jena-core/src/test/java/org/apache/jena/graph/TestRegisterGraphListener.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract ComeAndGoListener and its anonymous
// subclasses are JS classes; `all` and `graph` are per-test state.

import assert from 'node:assert/strict';
import { GraphListenerBase } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { newGraph, triple } from '../../lib/testlib.mjs';

let all, graph;

class ComeAndGoListener extends GraphListenerBase {
  constructor(damage) {
    super();
    this.inPlay = false; // registered when start() was called, and not unregistered since
    this.registered = false;
    this.notified = false;
    this.doSomeDamage = damage || (() => {});
  }
  registerWith(g) { this.registered = true; g.getEventManager().register(this); }
  unregisterFrom(g) { this.registered = false; this.inPlay = false; g.getEventManager().unregister(this); }
  start() { if (this.registered) this.inPlay = true; }
  check() {
    if (this.inPlay && !this.notified) assert.fail('listener that was in-play was not notified of adding triple.');
  }
  notifyAddTriple() { this.notified = true; this.doSomeDamage(); }
}
const SimpleListener = () => new ComeAndGoListener();

function testAddingTriple(addMe, ...allx) {
  graph = newGraph();
  all = allx;
  for (let i = 0; i < addMe; i++) all[i].registerWith(graph);
  for (const l of all) l.start();
  graph.add(triple('make a change'));
  for (const l of all) l.check();
}

describeJena('TestRegisterGraphListener', 'jena-core/src/test/java/org/apache/jena/graph/TestRegisterGraphListener.java', (t) => {
  t('testAddOne', () => {
    testAddingTriple(2, new ComeAndGoListener(() => all[2].registerWith(graph)), SimpleListener(), SimpleListener());
  });

  t('testDelete2nd', () => {
    testAddingTriple(3, new ComeAndGoListener(() => all[1].unregisterFrom(graph)), SimpleListener(), SimpleListener());
  });

  t('testDelete1st', () => {
    testAddingTriple(3, SimpleListener(), new ComeAndGoListener(() => all[0].unregisterFrom(graph)), SimpleListener());
  });

  t('testDeleteSelf', () => {
    testAddingTriple(3, new ComeAndGoListener(function () { this.unregisterFrom(graph); }), SimpleListener(), SimpleListener());
  });

  t('testDeleteAndAddSelf', () => {
    testAddingTriple(3, new ComeAndGoListener(function () { this.unregisterFrom(graph); this.registerWith(graph); }),
      SimpleListener(), SimpleListener());
  });
});
