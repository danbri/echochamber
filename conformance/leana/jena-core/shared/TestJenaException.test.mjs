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
//   jena-core/src/test/java/org/apache/jena/shared/TestJenaException.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana; java.lang.Exception is the JS Error and getMessage()
// is .message.

import assert from 'node:assert/strict';
import { JenaException } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';

describeJena('TestJenaException', 'jena-core/src/test/java/org/apache/jena/shared/TestJenaException.java', (t) => {
  t('testRethrownMessage', () => {
    const e = new Error('kings and queens');
    const j = new JenaException(e);
    assert.ok(j.message.endsWith(e.message));
  });
});
