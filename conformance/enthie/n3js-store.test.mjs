// Derived from N3.js test/N3Store-test.js (https://github.com/rdfjs/N3.js) at
// commit ce8f71be6af502a7a16193f7fb0fe9ad239f6d8d, licensed as follows:
//
// The MIT License (MIT)
// Copyright ©2012–present N3.js contributors
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// What changed: the describe blocks 'The Store export', 'An empty Store',
// 'A Store with initialized with 5 elements' and the search, count and
// remove blocks of 'A Store with 7 elements' (upstream lines 22-317, 426-589,
// 2634-2860), ported from jest to node:test over the N3.js-style echo. Each
// upstream `it` is one test with the same describe path and name, run in the
// upstream order (the blocks share a store, as upstream).
// Adaptation, recorded in docs/enthie/feasibility.md: N3.js's tests name
// terms with relative names ('s1') and pass N3.js term-id strings and plain
// {subject, predicate, object} objects to the Store. The engine stores only
// absolute IRIs (RDF 1.2 Concepts section 3.2), so every name n becomes the
// IRI http://example.org/n (the rule N3.js's own parser tests use,
// mapToQuad), and ids are turned into terms by the test (support.mjs
// termFromId), not by the Store. The streaming cases (store.import,
// store.remove, removeMatches as a stream) are kept and fail as gap G2.
import { strictEqual, ok, deepStrictEqual } from 'node:assert';
import { Store, Quad, DefaultGraph, DataFactory, ready } from '@factoidal/enthie';
import { termFromId } from './n3js/support.mjs';
import { vtest } from './harness.mjs';

await ready();

const BASE = 'http://example.org/';
// An N3.js test name or id as an RDF/JS term (the adaptation above).
const t = (id) => (id === null || id === undefined ? null
  : typeof id !== 'string' ? id
  : termFromId(/^$|^["?_[]|:/.test(id) ? id : BASE + id, DataFactory));
const nn = (n) => DataFactory.namedNode(BASE + n);
const q = (s, p, o, g) => DataFactory.quad(t(s), t(p), t(o), g === undefined ? undefined : t(g));

// N3.js shouldIncludeAll: same length, and every expected quad is present.
function includesAll(result, ...items) {
  const expected = items.map((a) => q(a[0], a[1], a[2], a[3] || ''));
  strictEqual(result.length, expected.length);
  for (const e of expected) ok(result.some((r) => r.equals(e)), `missing ${e.subject.value} ${e.predicate.value} ${e.object.value}`);
}

const P = 'n3js-store > Store';
const alwaysTrue = () => true;
const alwaysFalse = () => false;

// --- The Store export
vtest(`${P} > The Store export > should be a function`, () => { strictEqual(typeof Store, 'function'); });
vtest(`${P} > The Store export > should be an Store constructor`, () => { ok(new Store() instanceof Store); });

// --- An empty Store
{
  const E = `${P} > An empty Store`;
  const store = new Store({});
  vtest(`${E} > should have size 0`, () => { strictEqual(store.size, 0); });
  vtest(`${E} > should be empty`, () => { strictEqual(store.getQuads().length, 0); });
  vtest(`${E} > when removing a stream of 2 quads > should have size 0`, async () => {
    await new Promise((resolve, reject) => {
      const events = store.remove([q('s1', 'p2', 'o2'), q('s1', 'p1', 'o1')]);
      events.on('end', resolve); events.on('error', reject);
    });
    strictEqual(store.size, 0);
  });
  vtest(`${E} > when importing a stream of 2 nested quads > should have size 2`, async () => {
    await new Promise((resolve, reject) => {
      const events = store.import([
        DataFactory.quad(q('s1', 'p2', 'o2'), nn('p2'), nn('o2')),
        DataFactory.quad(nn('s1'), nn('p1'), q('s1', 'p2', 'o2')),
      ]);
      events.on('end', resolve); events.on('error', reject);
    });
    strictEqual(store.size, 2);
  });
  vtest(`${E} > when removing a stream of 2 nested quads > should have size 0`, async () => {
    await new Promise((resolve, reject) => {
      const events = store.remove([
        DataFactory.quad(q('s1', 'p2', 'o2'), nn('p2'), nn('o2')),
        DataFactory.quad(nn('s1'), nn('p1'), q('s1', 'p2', 'o2')),
      ]);
      events.on('end', resolve); events.on('error', reject);
    });
    strictEqual(store.size, 0);
  });
  vtest(`${E} > every > with no parameters and a callback always returning true > should return true on empty set`, () => {
    strictEqual(store.every(alwaysTrue, null, null, null, null), true);
  });
  vtest(`${E} > every > with no parameters and a callback always returning false > should return true on empty set`, () => {
    strictEqual(store.every(alwaysFalse, null, null, null, null), true);
  });
  vtest(`${E} > some > with no parameters and a callback always returning true > should return false`, () => {
    strictEqual(store.some(alwaysTrue, null, null, null, null), false);
  });
  vtest(`${E} > some > with no parameters and a callback always returning false > should return false`, () => {
    strictEqual(store.some(alwaysFalse, null, null, null, null), false);
  });
  vtest(`${E} > should still have size 0 (instead of null) after adding and removing a triple`, () => {
    strictEqual(store.size, 0);
    strictEqual(store.addQuad(nn('a'), nn('b'), nn('c')), true);
    strictEqual(store.removeQuad(nn('a'), nn('b'), nn('c')), true);
    strictEqual(store.size, 0);
  });
  vtest(`${E} > should be able to generate unnamed blank nodes`, () => {
    strictEqual(store.createBlankNode().value, 'b0');
    strictEqual(store.createBlankNode().value, 'b1');
    strictEqual(store.addQuad(t('_:b0'), t('_:b1'), t('_:b2')), true);
    strictEqual(store.createBlankNode().value, 'b3');
    store.removeQuads(store.getQuads());
  });
  vtest(`${E} > should be able to generate named blank nodes`, () => {
    strictEqual(store.createBlankNode('blank').value, 'blank');
    strictEqual(store.createBlankNode('blank').value, 'blank1');
    strictEqual(store.createBlankNode('blank').value, 'blank2');
  });
  vtest(`${E} > should be able to store and retrieve triples with Date literals`, () => {
    const date = new Date(Date.UTC(2017, 3, 27, 14, 39, 48, 901));
    strictEqual(store.addQuad(nn('a'), nn('b'), DataFactory.literal(date)), true);
    const quads = store.getQuads(null, null, DataFactory.literal(date));
    strictEqual(quads.length, 1);
    ok(quads[0].object.equals(t('"2017-04-27T14:39:48.901Z"^^http://www.w3.org/2001/XMLSchema#dateTime')));
    store.removeQuads(store.getQuads());
  });
  vtest(`${E} > should be able to store triples with generated blank nodes`, () => {
    strictEqual(store.addQuad(store.createBlankNode('x'), nn('b'), nn('c')), true);
    includesAll(store.getQuads(null, nn('b')), ['_:x', 'b', 'c']);
    store.removeQuads(store.getQuads());
  });
}

// --- A Store with initialized with 5 elements
{
  const F = `${P} > A Store with initialized with 5 elements`;
  let store;
  // Upstream passes the 5 quads to the constructor. The first has a triple
  // term as subject, which the engine refuses (RDF 1.2 Concepts section 3.1),
  // so the quads are added one by one here and that refusal is caught: the
  // store then holds 4 quads, and the size checks below fail as a divergence.
  store = new Store();
  for (const quad of [
    DataFactory.quad(q('s1', 'p1', 'o1'), nn('p1'), nn('o1')),
    q('s1', 'p1', 'o1'), q('s1', 'p1', 'o2'), q('s1', 'p1', 'o3'), q('s2', 'p2', 'o2', 'g1'),
  ]) { try { store.addQuad(quad); } catch { /* refused: see above */ } }
  const run = (name, fn) => vtest(`${F} > ${name}`, fn);
  run('should have size 5', () => {
    strictEqual(store.size, 5);
    strictEqual(store.match(nn('s2'), nn('p2'), nn('o2'), nn('g1')).size, 1);
    strictEqual(store.match(null, nn('p2'), nn('o2'), nn('g1')).size, 1);
    strictEqual(store.match(nn('s2'), null, nn('o2'), nn('g1')).size, 1);
    strictEqual(store.match(nn('s2'), nn('p2'), null, nn('g1')).size, 1);
    strictEqual(store.match(nn('s2'), nn('p2'), nn('o2'), null).size, 1);
    strictEqual(store.match(nn('s2'), nn('p2'), nn('o2'), nn('g2')).size, 0);
    strictEqual(store.match(null, nn('p2'), nn('o2'), nn('g2')).size, 0);
    strictEqual(store.match(nn('s2'), null, nn('o2'), nn('g2')).size, 0);
    strictEqual(store.match(nn('s2'), nn('p2'), null, nn('g2')).size, 0);
  });
  run('adding a triple that already exists > should return false', () => { strictEqual(store.addQuad(t('s1'), t('p1'), t('o1')), false); });
  run('adding a triple that already exists > should not increase the size', () => { strictEqual(store.size, 5); });
  run('adding a triple that already exists > should return false for a triple with a quad as subject', () => {
    strictEqual(store.addQuad(q('s1', 'p1', 'o1'), t('p1'), t('o1')), false);
  });
  run('adding a triple that already exists > should not increase the size for a triple with a quad as subject', () => { strictEqual(store.size, 5); });
  run('adding a triple that did not exist yet > should return true', () => {
    strictEqual(store.has(q('s1', 'p1', 'o4')), false);
    strictEqual(store.has(nn('s1'), nn('p1'), nn('o4')), false);
    strictEqual(store.has(null, null, nn('o4')), false);
    strictEqual(store.addQuad(t('s1'), t('p1'), t('o4')), true);
    strictEqual(store.has(q('s1', 'p1', 'o4')), true);
    strictEqual(store.has(nn('s1'), nn('p1'), nn('o4')), true);
    strictEqual(store.has(nn('s1'), nn('p1'), nn('o4'), new DefaultGraph()), true);
    strictEqual(store.has(null, null, nn('o4')), true);
  });
  run('adding a triple that did not exist yet > should increase the size', () => { strictEqual(store.size, 6); });
  run('adding a triple that did not exist yet > should return true for a triple with a quad as subject', () => {
    strictEqual(store.addQuad(q('s1', 'p1', 'o1'), t('p1'), t('o4')), true);
  });
  run('adding a triple that did not exist yet > should increase the size for a triple with a quad as subject', () => { strictEqual(store.size, 7); });
  run('adding a triple that did not exist yet > should return self', () => { strictEqual(store.add(q('s2', 'p2', 'o2')), store); });
  run('adding a triple that did not exist yet > should increase the size after add', () => { strictEqual(store.size, 8); });
  run('removing an existing triple > should return true', () => { strictEqual(store.removeQuad(t('s1'), t('p1'), t('o4')), true); });
  run('removing an existing triple > should decrease the size', () => { strictEqual(store.size, 7); });
  run('removing an existing triple > should return true for a triple with a quad as subject', () => {
    strictEqual(store.removeQuad(q('s1', 'p1', 'o1'), t('p1'), t('o4')), true);
  });
  run('removing an existing triple > should decrease the size for a triple with a quad as subject', () => { strictEqual(store.size, 6); });
  run('removing an existing triple > should return self', () => { strictEqual(store.delete(q('s2', 'p2', 'o2')), store); });
  run('removing an existing triple > should decrease the size after delete', () => { strictEqual(store.size, 5); });
  run('removing a non-existing triple > should return false', () => { strictEqual(store.removeQuad(t('s1'), t('p1'), t('o5')), false); });
  run('removing a non-existing triple > should not decrease the size', () => { strictEqual(store.size, 5); });
  run('removing a non-existing triple > should return false for a triple with a quad as subject', () => {
    strictEqual(store.removeQuad(q('s1', 'p1', 'o4'), t('p1'), t('o1')), false);
  });
  run('removing a non-existing triple > should not decrease the size for a triple with a quad as subject', () => { strictEqual(store.size, 5); });
  run('removing matching quads > should return the removed quads', async () => {
    // Upstream: removeMatches answers a stream of the removed quads (gap G2).
    const result = store.removeMatches(t('s1'), t('p1'));
    if (typeof result.on !== 'function') throw new Error('removeMatches does not answer a stream (gap G2)');
  });
  run('removing matching quads > should decrease the size', () => { strictEqual(store.size, 2); });
  run('removing a graph > should return the removed quads', () => {
    const result = store.deleteGraph(t('g1'));
    if (typeof result.on !== 'function') throw new Error('deleteGraph does not answer a stream (gap G2)');
  });
  run('removing a graph > should decrease the size', () => { strictEqual(store.size, 1); });
}

// --- A Store with 7 elements (search, count and remove blocks)
{
  const S = `${P} > A Store with 7 elements`;
  const store = new Store();
  // Upstream adds the 7 quads with id strings and plain objects; here each is
  // a term or a quad (adaptation above). The sixth has a triple term as
  // subject, which RDF 1.2 does not allow; its add fails (RDF 1.2 Concepts
  // section 3.1) and is caught, so the store holds 6 quads here.
  const added = [];
  const tryAdd = (f) => { try { added.push(f()); } catch (e) { added.push(e); } };
  tryAdd(() => store.addQuad(t('s1'), t('p1'), t('o1')));
  tryAdd(() => store.addQuad(q('s1', 'p1', 'o2')));
  tryAdd(() => store.addQuads([q('s1', 'p2', 'o2'), q('s2', 'p1', 'o1')]));
  tryAdd(() => store.addQuad(t('s1'), t('p1'), t('o1'), t('c4')));
  tryAdd(() => store.addQuad(q('s2', 'p2', 'o2'), t('p1'), t('o3')));
  const addResult = store.add(q('s2', 'p2', 'o2'));
  const tripleTermQuad = () => DataFactory.quad(q('s2', 'p2', 'o2'), nn('p1'), nn('o3'));

  vtest(`${S} > should return true when adding new quads`, () => {
    strictEqual(added[0], true); strictEqual(added[1], true); strictEqual(added[3], true);
  });
  vtest(`${S} > should return the store from add`, () => { strictEqual(addResult, store); });
  vtest(`${S} > should have size 7`, () => { strictEqual(store.size, 7); });

  const all = [['s1', 'p1', 'o1'], ['s1', 'p1', 'o2'], ['s1', 'p2', 'o2'], ['s2', 'p1', 'o1'], ['s1', 'p1', 'o1', 'c4'], 'TT', ['s2', 'p2', 'o2']];
  // 'TT' stands for upstream's [termToId(new Quad('s2','p2','o2')), 'p1', 'o3'].
  const includes = (result, items) => {
    const expected = items.map((a) => (a === 'TT' ? tripleTermQuad() : q(a[0], a[1], a[2], a[3] || '')));
    strictEqual(result.length, expected.length);
    for (const e of expected) ok(result.some((r) => r.equals(e)));
  };
  const searches = [
    ['when searched without parameters > should return all items', [], all],
    ['when searched with an existing subject parameter > should return all items with this subject in all graphs', [nn('s1'), null, null], [all[0], all[1], all[2], all[4]]],
    ['when searched with a non-existing subject parameter > should be empty', [nn('s3'), null, null], []],
    ['when searched with a non-existing subject parameter that exists elsewhere > should be empty', [nn('p1'), null, null], []],
    ['when searched with an existing predicate parameter > should return all items with this predicate in all graphs', [null, nn('p1'), null], [all[0], all[1], all[3], all[4], 'TT']],
    ['when searched with a non-existing predicate parameter > should be empty', [null, nn('p3'), null], []],
    ['when searched with an existing object parameter > should return all items with this object in all graphs', [null, null, nn('o1')], [all[0], all[3], all[4]]],
    ['when searched with a non-existing object parameter > should be empty', [null, null, nn('o4')], []],
    ['when searched with existing subject and predicate parameters > should return all items with this subject and predicate in all graphs', [nn('s1'), nn('p1'), null], [all[0], all[1], all[4]]],
    ['when searched with non-existing subject and predicate parameters > should be empty', [nn('s2'), nn('p3'), null], []],
    ['when searched with existing subject and object parameters > should return all items with this subject and object in all graphs', [nn('s1'), null, nn('o1')], [all[0], all[4]]],
    ['when searched with non-existing subject and object parameters > should be empty', [nn('s2'), null, nn('o3')], []],
    ['when searched with existing predicate and object parameters > should return all items with this predicate and object in all graphs', [null, nn('p1'), nn('o1')], [all[0], all[3], all[4]]],
    ['when searched with non-existing predicate and object parameters in the default graph > should be empty', [null, nn('p2'), nn('o3'), new DefaultGraph()], []],
    ['when searched with existing subject, predicate, and object parameters > should return all items with this subject, predicate, and object in all graphs', [nn('s1'), nn('p1'), nn('o1')], [all[0], all[4]]],
    ['when searched with a non-existing triple > should be empty', [nn('s2'), nn('p2'), nn('o1')], []],
    ['when searched with the default graph parameter > should return all items in the default graph', [null, null, null, new DefaultGraph()], [all[0], all[1], all[2], all[3], 'TT', all[6]]],
    ['when searched with an existing named graph parameter > should return all items in that graph', [null, null, null, nn('c4')], [all[4]]],
    ['when searched with a non-existing named graph parameter > should be empty', [null, null, null, nn('c5')], []],
  ];
  for (const [name, args, items] of searches) vtest(`${S} > ${name}`, () => includes(store.getQuads(...args), items));

  const counts = [
    ['when counted without parameters > should count all items in all graphs', [], 7],
    ['when counted with an existing subject parameter > should count all items with this subject in all graphs', [nn('s1'), null, null], 4],
    ['when counted with a non-existing subject parameter > should be empty', [nn('s3'), null, null], 0],
    ['when counted with a non-existing subject parameter that exists elsewhere > should be empty', [nn('p1'), null, null], 0],
    ['when counted with an existing predicate parameter > should count all items with this predicate in all graphs', [null, nn('p1'), null], 5],
    ['when counted with a non-existing predicate parameter > should be empty', [null, nn('p3'), null], 0],
    ['when counted with an existing object parameter > should count all items with this object in all graphs', [null, null, t('o1')], 3],
    ['when counted with a non-existing object parameter > should be empty', [null, null, t('o4')], 0],
    ['when counted with existing subject and predicate parameters > should count all items with this subject and predicate in all graphs', [t('s1'), t('p1'), null], 3],
    ['when counted with non-existing subject and predicate parameters > should be empty', [t('s2'), t('p3'), null], 0],
    ['when counted with existing subject and object parameters > should count all items with this subject and object in all graphs', [t('s1'), null, t('o1')], 2],
    ['when counted with non-existing subject and object parameters > should be empty', [t('s2'), null, t('o3')], 0],
    ['when counted with existing predicate and object parameters > should count all items with this predicate and object in all graphs', [null, t('p1'), t('o1')], 3],
    ['when counted with non-existing predicate and object parameters > should be empty', [null, t('p2'), t('o3')], 0],
    ['when counted with existing subject, predicate, and object parameters > should count all items with this subject, predicate, and object in all graphs', [t('s1'), t('p1'), t('o1')], 2],
    ['when counted with a non-existing triple > should be empty', [t('s2'), t('p2'), t('o1')], 0],
    ['when counted with the default graph parameter > should count all items in the default graph', [null, null, null, new DefaultGraph()], 6],
    ['when counted with an existing named graph parameter > should count all items in that graph', [null, null, null, t('c4')], 1],
    ['when counted with a non-existing named graph parameter > should be empty', [null, null, null, t('c5')], 0],
  ];
  for (const [name, args, n] of counts) vtest(`${S} > ${name}`, () => { strictEqual(store.countQuads(...args), n); });

  const removes = [
    ['when trying to remove a triple with a non-existing subject', [nn('s0'), nn('p1'), nn('o1')]],
    ['when trying to remove a triple with a non-existing predicate', [nn('s1'), nn('p0'), nn('o1')]],
    ['when trying to remove a triple with a non-existing object', [nn('s1'), nn('p1'), nn('o0')]],
    ['when trying to remove a triple for which no subjects exist', [nn('o1'), nn('p1'), nn('o1')]],
    ['when trying to remove a triple for which no predicates exist', [nn('s1'), nn('s1'), nn('o1')]],
    ['when trying to remove a triple for which no objects exist', [nn('s1'), nn('p1'), nn('s1')]],
    ['when trying to remove a triple that does not exist', [nn('s1'), nn('p2'), nn('o1')]],
    ['when trying to remove an incomplete triple', [nn('s1'), null, null]],
    ['when trying to remove a triple with a non-existing graph', [nn('s1'), nn('p1'), nn('o1'), nn('c0')]],
  ];
  for (const [name, args] of removes) {
    let removed;
    vtest(`${S} > ${name} > should return false when removing`, () => {
      try { removed = store.removeQuad(...args); } catch (e) { removed = e; }
      strictEqual(removed, false);
    });
    vtest(`${S} > ${name} > should still have size 7`, () => { strictEqual(store.size, 7); });
  }
}
