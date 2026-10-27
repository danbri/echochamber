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
//   jena-core/src/test/java/org/apache/jena/shared/BaseTestPrefixMapping.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. The abstract class runs once, with getMapping() = PrefixMapping.Factory.create(); Java Map is a JS Map; NullPointerException is a JS TypeError; assertSame is ===.

import assert from 'node:assert/strict';
import { PrefixMapping } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import { assertDiffer } from '../../lib/testlib.mjs';

const getMapping = () => PrefixMapping.Factory.create();
const crispURI = 'http://crisp.nosuch.net/';
const ropeURI = 'scheme:rope/string#';
const butterURI = 'ftp://ftp.nowhere.at.all/cream#';

function addGetTest(prefix, uri) {
  const pmap = getMapping();
  pmap.setNsPrefix(prefix, uri);
  assert.equal(pmap.getNsPrefixURI(prefix), uri);
}
function getCrispyRope() {
  const ns = getMapping();
  ns.setNsPrefix('crisp', crispURI);
  ns.setNsPrefix('rope', ropeURI);
  return ns;
}
function testShortForm(title, ns) {
  ns.setNsPrefix('crisp', crispURI);
  ns.setNsPrefix('butter', butterURI);
  assert.equal(ns.shortForm(''), '', title);
  assert.equal(ns.shortForm(ropeURI), ropeURI, title);
  assert.equal(ns.shortForm(crispURI + 'tail'), 'crisp:tail', title);
  assert.equal(ns.shortForm(butterURI + 'here:we:are'), 'butter:here:we:are', title);
}
function checkContainsMapping(b) {
  assert.equal(b.getNsPrefixURI('crisp'), crispURI);
  assert.equal(b.getNsPrefixURI('rope'), ropeURI);
  assert.equal(b.getNsPrefixURI('butter'), butterURI);
}
/** JenaTestLib.listOfStrings: the whitespace-separated words. */
const listOfStrings = (s) => s.split(/\s+/).filter(Boolean);
function fill(pm, settings) {
  for (const setting of listOfStrings(settings)) {
    const eq = setting.indexOf('=');
    pm.setNsPrefix(setting.substring(0, eq), setting.substring(eq + 1));
  }
}
function testEquals4(S, T, expected, A, B) {
  fill(A, S);
  fill(B, T);
  const title = `usual: '${S}', testing: '${T}', should be ${expected ? 'equal' : 'different'}`;
  assert.equal(A.samePrefixMappingAs(B), expected, title);
  assert.equal(B.samePrefixMappingAs(A), expected, title);
}
function testEqualsBase(S, T, expected) {
  testEquals4(S, T, expected, getMapping(), getMapping());
  testEquals4(S, T, expected, PrefixMapping.Factory.create(), getMapping());
}
function testEquals(S, T = S, expected = true) {
  testEqualsBase(S, T, expected);
  testEqualsBase(T, S, expected);
}
function expectThrow(Cls, fn, msg) {
  try { fn(); } catch (e) { if (e instanceof Cls) return; throw e; }
  assert.fail(msg);
}

describeJena('BaseTestPrefixMapping', 'jena-core/src/test/java/org/apache/jena/shared/BaseTestPrefixMapping.java', (t) => {
  t('testEmptyPrefix', () => addGetTest('', crispURI));
  t('testStrPrefix1', () => addGetTest('abc', 'http://example/'));
  t('testStrPrefix2', () => addGetTest(String.fromCodePoint(0x1F607), 'http://example/'));

  t('testCheckNames', () => {
    const ns = getMapping();
    for (const bad of ['<hello>', 'foo:bar', 'with a space', '-argument']) {
      expectThrow(PrefixMapping.IllegalPrefixException, () => ns.setNsPrefix(bad, crispURI),
        `'${bad}' is an illegal prefix and should be trapped`);
    }
  });

  t('testNullURITrapped', () => {
    expectThrow(TypeError, () => getMapping().setNsPrefix('xy', null), 'should trap null URI in setNsPrefix');
  });

  t('testPrefixMappingMapping', () => {
    const toast = 'ftp://ftp.nowhere.not/';
    assertDiffer('crisp and toast must differ', crispURI, toast);
    const ns = getMapping();
    assert.equal(ns.getNsPrefixURI('crisp'), null);
    assert.equal(ns.getNsPrefixURI('toast'), null);
    assert.equal(ns.getNsPrefixURI('butter'), null);
    ns.setNsPrefix('crisp', crispURI);
    assert.equal(ns.getNsPrefixURI('crisp'), crispURI);
    assert.equal(ns.getNsPrefixURI('toast'), null);
    assert.equal(ns.getNsPrefixURI('butter'), null);
    ns.setNsPrefix('toast', toast);
    assert.equal(ns.getNsPrefixURI('crisp'), crispURI);
    assert.equal(ns.getNsPrefixURI('toast'), toast);
    assert.equal(ns.getNsPrefixURI('butter'), null);
  });

  t('testReversePrefixMapping', () => {
    const ns = getMapping();
    const uriA = 'http://jena.hpl.hp.com/A#', uriB = 'http://jena.hpl.hp.com/', uriC = 'http://jena.hpl.hp.com/Csharp/';
    ns.setNsPrefix('aa', uriA).setNsPrefix('bb', uriB);
    assert.equal(ns.getNsURIPrefix(uriC), null);
    assert.equal(ns.getNsURIPrefix(uriA), 'aa');
    assert.equal(ns.getNsURIPrefix(uriB), 'bb');
  });

  t('testPrefixMappingMap', () => {
    const map = getCrispyRope().getNsPrefixMap();
    assert.equal(map.size, 2, 'map should have two elements');
    assert.equal(map.get('crisp'), crispURI);
    assert.equal(map.get('rope'), 'scheme:rope/string#');
  });

  t('testPrefixMappingSecret', () => {
    const ns = getCrispyRope();
    const map = ns.getNsPrefixMap();
    try {
      map.set('crisp', 'with/onions');
      map.set('sandwich', 'with/cheese');
    } catch (e) { /* UnsupportedOperationException: an unmodifiable copy is fine */ }
    assert.equal(ns.getNsPrefixURI('crisp'), crispURI);
    assert.equal(ns.getNsPrefixURI('rope'), ropeURI);
    assert.equal(ns.getNsPrefixURI('sandwich'), null);
  });

  t('testExpandPrefix', () => {
    const ns = getMapping();
    ns.setNsPrefix('crisp', crispURI);
    ns.setNsPrefix('rope', ropeURI);
    for (const s of ['', 'http://www.somedomain.something/whatever#', 'crispy:cabbage', 'cris:isOnInfiniteEarths',
      'rop:tangled/web', 'roped:abseiling']) {
      assert.equal(ns.expandPrefix(s), s, 'should be unchanged');
    }
    for (const [a, b] of [['crisp:pathPart', crispURI + 'pathPart'], ['rope:partPath', ropeURI + 'partPath'],
      ['crisp:path:part', crispURI + 'path:part']]) {
      assert.equal(ns.expandPrefix(a), b, 'should expand correctly');
    }
  });

  t('testUseEasyPrefix', () => {
    testShortForm('prefix mapping impl', getMapping()); // testUseEasyPrefix is testShortForm
    testShortForm('prefix mapping impl', getMapping());
  });

  t('testEasyQName', () => {
    const ns = getMapping();
    const alphaURI = 'http://seasonal.song/preamble/';
    ns.setNsPrefix('alpha', alphaURI);
    assert.equal(ns.qnameFor(alphaURI + 'rowboat'), 'alpha:rowboat');
  });

  t('testNoQNameNoPrefix', () => {
    const ns = getMapping();
    ns.setNsPrefix('alpha', 'http://seasonal.song/preamble/');
    assert.equal(ns.qnameFor('eg:rowboat'), null);
  });

  t('testNoQNameBadLocal', () => {
    const ns = getMapping();
    const alphaURI = 'http://seasonal.song/preamble/';
    ns.setNsPrefix('alpha', alphaURI);
    assert.equal(ns.qnameFor(alphaURI + '12345'), null);
  });

  t('testQnameFromEmail', () => {
    const uri = 'http://some.long.uri/for/a/namespace#';
    const ns = getMapping();
    ns.setNsPrefix('x', uri);
    assert.equal(ns.qnameFor(uri), null);
    assert.equal(ns.qnameFor(uri + 'non/fiction'), null);
  });

  t('testAddOtherPrefixMapping', () => {
    const a = getMapping(), b = getMapping();
    assert.ok(a !== b, 'must have two diffferent maps');
    a.setNsPrefix('crisp', crispURI);
    a.setNsPrefix('rope', ropeURI);
    b.setNsPrefix('butter', butterURI);
    assert.equal(b.getNsPrefixURI('crisp'), null);
    assert.equal(b.getNsPrefixURI('rope'), null);
    b.setNsPrefixes(a);
    checkContainsMapping(b);
  });

  t('testAddMap', () => {
    const b = getMapping();
    const map = new Map([['crisp', crispURI], ['rope', ropeURI]]);
    b.setNsPrefix('butter', butterURI);
    b.setNsPrefixes(map);
    checkContainsMapping(b);
  });

  t('testAddDefaultMap', () => {
    const pm = getMapping();
    const root = PrefixMapping.Factory.create();
    pm.setNsPrefix('a', 'aPrefix:');
    pm.setNsPrefix('b', 'bPrefix:');
    root.setNsPrefix('a', 'pootle:');
    root.setNsPrefix('z', 'bPrefix:');
    root.setNsPrefix('c', 'cootle:');
    assert.ok(pm === pm.withDefaultMappings(root));
    assert.equal(pm.getNsPrefixURI('a'), 'aPrefix:');
    assert.equal(pm.getNsPrefixURI('z'), null);
    assert.equal(pm.getNsPrefixURI('b'), 'bPrefix:');
    assert.equal(pm.getNsPrefixURI('c'), 'cootle:');
  });

  t('testSecondPrefixRetainsExistingMap', () => {
    const A = getMapping();
    A.setNsPrefix('a', crispURI);
    A.setNsPrefix('b', crispURI);
    assert.equal(A.getNsPrefixURI('a'), crispURI);
    assert.equal(A.getNsPrefixURI('b'), crispURI);
  });

  t('testSecondPrefixReplacesReverseMap', () => {
    const A = getMapping();
    A.setNsPrefix('a', crispURI);
    A.setNsPrefix('b', crispURI);
    assert.equal(A.getNsURIPrefix(crispURI), 'b');
  });

  t('testSecondPrefixDeletedUncoversPreviousMap', () => {
    const A = getMapping();
    A.setNsPrefix('x', crispURI);
    A.setNsPrefix('y', crispURI);
    A.removeNsPrefix('y');
    assert.equal(A.getNsURIPrefix(crispURI), 'x');
  });

  t('testEmptyDoesNotWipeURI', () => {
    const pm = getMapping();
    pm.setNsPrefix('frodo', ropeURI);
    pm.setNsPrefix('', ropeURI);
    assert.equal(pm.getNsPrefixURI('frodo'), ropeURI);
  });

  t('testSameURIKeepsDefault', () => {
    const A = getMapping();
    A.setNsPrefix('', crispURI);
    A.setNsPrefix('crisp', crispURI);
    assert.equal(A.getNsPrefixURI(''), crispURI);
  });

  t('testReturnsSelf', () => {
    const A = getMapping();
    assert.ok(A === A.setNsPrefix('crisp', crispURI));
    assert.ok(A === A.setNsPrefixes(A));
    assert.ok(A === A.setNsPrefixes(new Map()));
    assert.ok(A === A.removeNsPrefix('rhubarb'));
  });

  t('testRemovePrefix', () => {
    const hURI = 'http://test.remove.prefixes/prefix#', bURI = 'http://other.test.remove.prefixes/prefix#';
    const A = getMapping();
    A.setNsPrefix('hr', hURI);
    A.setNsPrefix('br', bURI);
    A.removeNsPrefix('hr');
    assert.equal(A.getNsPrefixURI('hr'), null);
    assert.equal(A.getNsPrefixURI('br'), bURI);
  });

  t('testClear', () => {
    const hURI = 'http://test.remove.prefixes/prefix#', bURI = 'http://other.test.remove.prefixes/prefix#';
    const A = getMapping();
    A.setNsPrefix('hr', hURI);
    A.setNsPrefix('br', bURI);
    A.clearNsPrefixMap();
    assert.equal(A.getNsPrefixURI('hr'), null);
    assert.equal(A.getNsPrefixURI('br'), null);
    assert.equal(A.getNsURIPrefix(hURI), null);
    assert.equal(A.getNsURIPrefix(bURI), null);
  });

  t('testNoMapping', () => {
    const A = getMapping();
    assert.ok(A.hasNoMappings());
    A.setNsPrefix('hr', 'http://test.prefixes/prefix#');
    assert.ok(!A.hasNoMappings());
  });

  t('testNumPrefixes', () => {
    const A = getMapping();
    assert.equal(A.numPrefixes(), 0);
    A.setNsPrefix('hr', 'http://test.prefixes/prefix#');
    assert.equal(A.numPrefixes(), 1);
  });

  t('testEquality', () => {
    testEquals('');
    testEquals('', 'x=a', false);
    testEquals('x=a', '', false);
    testEquals('x=a');
    testEquals('x=a y=b', 'y=b x=a', true);
    testEquals('x=a x=b', 'x=b x=a', false);
  });

  t('testAllowNastyNamespace', () => {
    getMapping().setNsPrefix('abc', 'def');
  });

  t('testLock', () => {
    const A = getMapping();
    assert.ok(A === A.lock());
    const L = PrefixMapping.JenaLockedException;
    expectThrow(L, () => A.setNsPrefix('crisp', crispURI), 'mapping should be frozen');
    expectThrow(L, () => A.setNsPrefixes(A), 'mapping should be frozen');
    expectThrow(L, () => A.setNsPrefixes(new Map()), 'mapping should be frozen');
    expectThrow(L, () => A.removeNsPrefix('toast'), 'mapping should be frozen');
  });
});
