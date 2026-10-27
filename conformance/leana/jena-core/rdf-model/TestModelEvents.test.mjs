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
//   jena-core/src/test/java/org/apache/jena/rdf/model/TestModelEvents.java
// Changed for echochamber: translated from Java/JUnit 5 to JavaScript/node:test
// over @factoidal/leana. Jena runs the class once per ModelCreators kind (plain,
// Intersection, Difference, Union); here each method runs over all four in turn
// (testlib modelCreators), with @BeforeEach setUp before each. Statement[] is a
// JS array, Arrays.asList a leana ArrayList (testlib asList), StmtIteratorImpl
// a leana StmtIterator; the ModelChangedListener overloads are one method that
// looks at its argument (testlib RecordingModelListener); `new int[]{}` is a
// fresh JS array.

import assert from 'node:assert/strict';
import { StmtIterator, ObjectListener, StatementListener, ChangedListener, NullListener, ArrayList } from '@factoidal/leana';
import { describeJena } from '../../lib/harness.mjs';
import {
  modelCreators, RecordingModelListener, resource, property, statement, statements, modelAdd, asList, Extended,
} from '../../lib/testlib.mjs';

class OL extends ObjectListener {
  constructor() { super(); this.recorded = null; this.how = null; }
  added(x) { this.recorded = x; this.how = 'add'; }
  removed(x) { this.recorded = x; this.how = 'rem'; }
  _comparable(x) {
    if (Array.isArray(x) && !(x instanceof ArrayList)) return asList(x);
    if (x && typeof x.toList === 'function' && typeof x.listStatements !== 'function') return x.toList();
    return x;
  }
  recent(wantHow, value) {
    assert.ok(RecordingModelListener.checkEquality(this._comparable(value), this._comparable(this.recorded)));
    assert.equal(this.how, wantHow);
    this.recorded = this.how = null;
  }
}

/** A StatementListener that funnels every change through addedStatement / removedStatement. */
class WatchStatementListener extends StatementListener {
  constructor() { super(); this.statements = []; this.addOrRem = '<unset>'; }
  addedStatement(s) { this.statements.push(s); this.addOrRem = 'add'; }
  removedStatement(s) { this.statements.push(s); this.addOrRem = 'rem'; }
  contents() { try { return this.statements; } finally { this.statements = []; } }
  getAddOrRem() { return this.addOrRem; }
}

/** asBag: a Map from triple key to count. */
function asBag(l) {
  const result = new Map();
  for (const s of l) { const k = s.asTriple().hashKey(); result.set(k, (result.get(k) || 0) + 1); }
  return result;
}
function assertSameBag(wanted, got) { assert.deepEqual(asBag(got), asBag(wanted)); }
const asIterator = (sts) => new StmtIterator([...sts]);

describeJena('TestModelEvents', 'jena-core/src/test/java/org/apache/jena/rdf/model/TestModelEvents.java', (t0) => {
  let model, SL, createModel;
  const t = (name, fn) => t0(name, () => {
    for (const [kind, create] of modelCreators) {
      createModel = create;
      model = create();
      SL = new RecordingModelListener();
      try { fn(kind); } finally { model.close(); }
    }
  });
  // AbstractModelTestBase.modelWithStatements: a model of this kind, with the Extended prefixes.
  const modelWithStatements = (facts) => {
    const m = createModel();
    m.setNsPrefixes(Extended);
    return modelAdd(m, facts);
  };
  const testGot = (sl, how, template) => {
    assertSameBag(statements(model, template), sl.contents());
    assert.equal(sl.getAddOrRem(), how);
    assert.ok(sl.contents().length === 0);
  };

  t('testAddInPieces', () => {
    model.register(SL);
    model.add(resource(model, 'S'), property(model, 'P'), resource(model, 'O'));
    SL.assertHas(['add', statement(model, 'S P O')]);
  });

  t('testAddModel', () => {
    model.register(SL);
    const m = modelWithStatements('NT beats S; S beats H; H beats D');
    model.add(m);
    SL.assertHas(['addModel', m]);
  });

  t('testAddSingleStatements', () => {
    const S1 = statement(model, 'S P O');
    const S2 = statement(model, 'A B C');
    assert.ok(!SL.has('add', S1));
    model.register(SL);
    model.add(S1);
    SL.assertHas(['add', S1]);
    model.add(S2);
    SL.assertHas(['add', S1, 'add', S2]);
    model.add(S1);
    SL.assertHas(['add', S1, 'add', S2, 'add', S1]);
  });

  t('testAddStatementArray', () => {
    model.register(SL);
    const s = statements(model, 'a P b; c Q d');
    model.add(s);
    SL.assertHas(['add[]', asList(s)]);
  });

  t('testAddStatementIterator', () => {
    model.register(SL);
    const sa = statements(model, 'x R y; a P b; x R y');
    model.add(asIterator(sa));
    SL.assertHas(['addIterator', asList(sa)]);
  });

  t('testAddStatementList', () => {
    model.register(SL);
    const L = asList(statements(model, 'b I g; model U g'));
    model.add(L);
    SL.assertHas(['addList', L]);
  });

  t('testChangedListener', () => {
    const CL = new ChangedListener();
    model.register(CL);
    assert.ok(!CL.hasChanged());
    model.add(statement(model, 'S P O'));
    assert.ok(CL.hasChanged());
    assert.ok(!CL.hasChanged());
    model.remove(statement(model, 'ab CD ef'));
    assert.ok(CL.hasChanged());
    model.add(statements(model, 'gh IJ kl'));
    assert.ok(CL.hasChanged());
    model.remove(statements(model, 'mn OP qr'));
    assert.ok(CL.hasChanged());
    model.add(asIterator(statements(model, 'st UV wx')));
    assert.ok(CL.hasChanged());
    assert.ok(!CL.hasChanged());
    model.remove(asIterator(statements(model, 'yz AB cd')));
    assert.ok(CL.hasChanged());
    model.add(modelWithStatements('ef GH ij'));
    assert.ok(CL.hasChanged());
    model.remove(modelWithStatements('kl MN op'));
    assert.ok(CL.hasChanged());
    model.add(asList(statements(model, 'rs TU vw')));
    assert.ok(CL.hasChanged());
    model.remove(asList(statements(model, 'xy wh q')));
    assert.ok(CL.hasChanged());
  });

  t('testDeleteModel', () => {
    model.register(SL);
    const m = modelWithStatements('NT beats S; S beats H; H beats D');
    model.remove(m);
    SL.assertHas(['removeModel', m]);
  });

  t('testDeleteStatementArray', () => {
    model.register(SL);
    const s = statements(model, 'a P b; c Q d');
    model.remove(s);
    SL.assertHas(['remove[]', asList(s)]);
  });

  t('testDeleteStatementIterator', () => {
    model.register(SL);
    const sa = statements(model, 'x R y; a P b; x R y');
    model.remove(asIterator(sa));
    SL.assertHas(['removeIterator', asList(sa)]);
  });

  t('testDeleteStatementList', () => {
    model.register(SL);
    const lst = asList(statements(model, 'b I g; model U g'));
    model.remove(lst);
    SL.assertHas(['removeList', lst]);
  });

  t('testGeneralEvent', () => {
    model.register(SL);
    const e = [];
    model.notifyEvent(e);
    SL.assertHas(['someEvent', model, e]);
  });

  t('testNullListener', () => {
    const NL = new NullListener();
    model.register(NL);
    model.add(statement(model, 'S P O '));
    model.remove(statement(model, 'X Y Z'));
    model.add(statements(model, 'a B c; d E f'));
    model.remove(statements(model, 'g H i; j K l'));
    model.add(asIterator(statements(model, 'model N o; p Q r')));
    model.remove(asIterator(statements(model, 's T u; v W x')));
    model.add(modelWithStatements('leaves fall softly'));
    model.remove(modelWithStatements('water drips endlessly'));
    model.add(asList(statements(model, 'xx RR yy')));
    model.remove(asList(statements(model, 'aa VV rr')));
  });

  t('testObjectListener', () => {
    const ll = new OL();
    model.register(ll);
    const s = statement(model, 'aa BB cc'), s2 = statement(model, 'dd EE ff');
    model.add(s);
    ll.recent('add', s);
    model.remove(s2);
    ll.recent('rem', s2);
    const sList = asList(statements(model, 'gg HH ii; jj KK ll'));
    model.add(sList);
    ll.recent('add', sList);
    const sList2 = asList(statements(model, 'mm NN oo; pp QQ rr; ss TT uu'));
    model.remove(sList2);
    ll.recent('rem', sList2);
    const m1 = modelWithStatements('vv WW xx; yy ZZ aa');
    model.add(m1);
    ll.recent('add', m1);
    const m2 = modelWithStatements('a B g; d E z');
    model.remove(m2);
    ll.recent('rem', m2);
    const sa1 = statements(model, 'th i k; l model n');
    model.add(sa1);
    ll.recent('add', sa1);
    const sa2 = statements(model, 'x o p; r u ch');
    model.remove(sa2);
    ll.recent('rem', sa2);
    const si1 = statements(model, 'u ph ch; psi om eh');
    model.add(asIterator(si1));
    ll.recent('add', asIterator(si1));
    const si2 = statements(model, 'at last the; end of these; tests ok guv');
    model.remove(asIterator(si2));
    ll.recent('rem', asIterator(si2));
  });

  t('testRegistrationCompiles', () => {
    assert.ok(model === model.register(new RecordingModelListener()));
  });

  t('testRemoveSingleStatements', () => {
    const S = statement(model, 'D E F');
    model.register(SL);
    model.add(S);
    model.remove(S);
    SL.assertHas(['add', S, 'remove', S]);
  });

  t('testTripleListener', () => {
    const sl = new WatchStatementListener();
    model.register(sl);
    model.add(statement(model, 'b C d'));
    testGot(sl, 'add', 'b C d');
    model.remove(statement(model, 'e F g'));
    testGot(sl, 'rem', 'e F g');
    model.add(statements(model, 'h I j; k L model'));
    testGot(sl, 'add', 'h I j; k L model');
    model.remove(statements(model, 'n O p; q R s'));
    testGot(sl, 'rem', 'n O p; q R s');
    model.add(asList(statements(model, 't U v; w X y')));
    testGot(sl, 'add', 't U v; w X y');
    model.remove(asList(statements(model, 'z A b; c D e')));
    testGot(sl, 'rem', 'z A b; c D e');
    model.add(asIterator(statements(model, 'f G h; i J k')));
    testGot(sl, 'add', 'f G h; i J k');
    model.remove(asIterator(statements(model, 'l M n; o P q')));
    testGot(sl, 'rem', 'l M n; o P q');
    model.add(modelWithStatements('r S t; u V w; x Y z'));
    testGot(sl, 'add', 'r S t; u V w; x Y z');
    model.remove(modelWithStatements('a E i; o U y'));
    testGot(sl, 'rem', 'a E i; o U y');
  });

  t('testTwoListeners', () => {
    const S = statement(model, 'S P O');
    const SL1 = new RecordingModelListener();
    const SL2 = new RecordingModelListener();
    model.register(SL1).register(SL2);
    model.add(S);
    SL2.assertHas(['add', S]);
    SL1.assertHas(['add', S]);
  });

  t('testUnregisterWorks', () => {
    model.register(SL);
    model.unregister(SL);
    model.add(statement(model, 'X R Y'));
    SL.assertHas([]);
  });

  t('testUnregistrationCompiles', () => {
    model.unregister(new RecordingModelListener());
  });
});
