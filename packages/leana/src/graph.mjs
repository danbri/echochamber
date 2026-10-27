// leana: Graph, GraphMemFactory, ExtendedIterator.
//
// API modelled on Apache Jena org.apache.jena.graph.{Graph, GraphMemFactory,
// GraphUtil} and org.apache.jena.util.iterator.ExtendedIterator (Apache
// License 2.0). No Jena code is copied. A leana GraphMem is the default
// graph of a @factoidal/core Dataset: add, delete, find, contains and size are
// the Dataset's add, delete, match, has and size. Matching is by term (RDF 1.1
// Concepts section 3.6 / SPARQL 1.1 section 18.3), as Jena's
// GraphMemFactory.createGraphMem().

import { dataFactory as df } from '@factoidal/core';
import { Node, Triple, fromRDFJS } from './node.mjs';
import { PrefixMappingImpl } from './prefix.mjs';
import { newDataset } from './engine.mjs';
import { GraphEventManager, GraphEvents, ArrayList } from './events.mjs';
import {
  JenaException, ClosedException, NoSuchElementException, AddDeniedException,
  UnsupportedOperationException, unsupported,
} from './errors.mjs';

const DEFAULT_GRAPH = df.defaultGraph();

GraphEvents._createMatch = (s, p, o) => Triple.createMatch(s, p, o);
/** Jena GraphEvents.removeAll (its triple is Triple.ANY), startRead, finishRead. */
GraphEvents.removeAll = new GraphEvents('removeAll', '');
GraphEvents.removeAll._triple = Triple.ANY;
GraphEvents.startRead = new GraphEvents('startRead', '');
GraphEvents.finishRead = new GraphEvents('finishRead', '');
Object.freeze(GraphEvents.removeAll);

/** A set with Java equals/hashCode semantics: members are keyed by hashKey(). */
export class JenaSet {
  constructor(items) {
    this._m = new Map();
    if (items) for (const x of items) this.add(x);
  }
  static keyOf(x) {
    if (x && typeof x.hashKey === 'function') return 'K' + x.hashKey();
    return typeof x + ':' + String(x);
  }
  add(x) { const k = JenaSet.keyOf(x); const had = this._m.has(k); this._m.set(k, x); return !had; }
  contains(x) { return this._m.has(JenaSet.keyOf(x)); }
  has(x) { return this.contains(x); }
  remove(x) { return this._m.delete(JenaSet.keyOf(x)); }
  delete(x) { return this.remove(x); }
  size() { return this._m.size; }
  isEmpty() { return this._m.size === 0; }
  addAll(xs) { let ch = false; for (const x of xs) ch = this.add(x) || ch; return ch; }
  containsAll(xs) { for (const x of xs) if (!this.contains(x)) return false; return true; }
  equals(other) {
    const o = other instanceof JenaSet ? other : new JenaSet(other);
    if (o.size() !== this.size()) return false;
    for (const k of this._m.keys()) if (!o._m.has(k)) return false;
    return true;
  }
  toArray() { return [...this._m.values()]; }
  [Symbol.iterator]() { return this._m.values(); }
  toString() { return '[' + this.toArray().map(String).join(', ') + ']'; }
}

/** Jena ExtendedIterator over a snapshot array. remove() deletes the last item from its source. */
export class ExtendedIterator {
  constructor(items, remover) {
    this._items = items;
    this._i = 0;
    this._remover = remover || null;
    this._last = undefined;
    this._closed = false;
  }
  static of(items, remover) { return new ExtendedIterator(items, remover); }
  static empty() { return new ExtendedIterator([]); }
  hasNext() { return !this._closed && this._i < this._items.length; }
  next() {
    if (!this.hasNext()) throw new NoSuchElementException('iterator exhausted');
    this._last = this._items[this._i++];
    return this._last;
  }
  remove() {
    if (this._last === undefined) throw new JenaException('remove() before next()');
    if (!this._remover) throw new UnsupportedOperationException('remove() not supported by this iterator');
    this._remover(this._last);
    this._last = undefined;
  }
  removeNext() { const x = this.next(); this.remove(); return x; }
  close() { this._closed = true; }
  toList() { const out = []; while (this.hasNext()) out.push(this.next()); return out; }
  toSet() { return new JenaSet(this.toList()); }
  forEachRemaining(fn) { while (this.hasNext()) fn(this.next()); }
  forEach(fn) { this.forEachRemaining(fn); }
  nextOptional() { return this.hasNext() ? this.next() : null; }
  mapWith(fn) { return new ExtendedIterator(this.toList().map(fn)); }
  filterKeep(pred) { return new ExtendedIterator(this.toList().filter(pred), this._remover); }
  filterDrop(pred) { return new ExtendedIterator(this.toList().filter((x) => !pred(x)), this._remover); }
  /** Jena NiceIterator.andThen: this, then `other` (lazy; remove() and close() reach the component iterators). */
  andThen(other) { return new AndThenIterator(this, other); }
  [Symbol.iterator]() { return { next: () => (this.hasNext() ? { value: this.next(), done: false } : { value: undefined, done: true }) }; }
}

function patternTerm(n) {
  if (n === null || n === undefined) return null;
  if (!(n instanceof Node)) throw new TypeError('find/contains needs Nodes');
  if (!n.isConcrete()) return null; // ANY, a variable, or a triple term with one inside
  return n.toRDFJS();
}

function quadOf(t) {
  return df.quad(t.getSubject().toRDFJS(), t.getPredicate().toRDFJS(), t.getObject().toRDFJS(), DEFAULT_GRAPH);
}

function tripleOf(q) {
  return new Triple(fromRDFJS(q.subject), fromRDFJS(q.predicate), fromRDFJS(q.object));
}

let graphCounter = 0;

/** Jena Capabilities of a leana graph. */
export class Capabilities {
  constructor(o) { Object.assign(this, { _size: true, _add: true, _del: true, _typing: false }, o); Object.freeze(this); }
  sizeAccurate() { return this._size; }
  addAllowed() { return this._add; }
  deleteAllowed() { return this._del; }
  /** false: leana graphs match by term, not by literal value. */
  handlesLiteralTyping() { return this._typing; }
}
const CAPS_MEM = new Capabilities({});

/**
 * Jena TransactionHandlerBase: execute / calculate in terms of begin, commit
 * and abort; executeAlways / calculateAlways run the action directly when
 * transactions are not supported, wrapping a non-Jena error in JenaException.
 */
export class TransactionHandlerBase {
  transactionsSupported() { return false; }
  begin() { throw new UnsupportedOperationException('transactions are not supported'); }
  commit() { throw new UnsupportedOperationException('transactions are not supported'); }
  abort() { throw new UnsupportedOperationException('transactions are not supported'); }
  _run(fn) {
    try { return fn(); } catch (e) {
      try { this.abort(); } catch (_) { /* keep the first error */ }
      if (e instanceof JenaException) throw e;
      throw new JenaException(String(e && e.message), { cause: e });
    }
  }
  execute(action) { this.begin(); this._run(() => { action(); this.commit(); }); }
  executeAlways(action) {
    if (!this.transactionsSupported()) { this._runNoTxn(action); return; }
    this.execute(action);
  }
  calculate(action) { this.begin(); return this._run(() => { const r = action(); this.commit(); return r; }); }
  calculateAlways(action) {
    if (!this.transactionsSupported()) return this._runNoTxn(action);
    return this.calculate(action);
  }
  _runNoTxn(fn) {
    try { return fn(); } catch (e) {
      if (e instanceof JenaException) throw e;
      throw new JenaException(String(e && e.message), { cause: e });
    }
  }
}
/** Jena SimpleTransactionHandler: a graph with no transactions. */
export class SimpleTransactionHandler extends TransactionHandlerBase {}

/**
 * The Graph SPI over a @factoidal/core Dataset. A GraphMem owns its Dataset
 * and uses its default graph; GraphView (dataset.mjs) is the same graph code
 * over one graph of a DatasetGraph.
 */
export class GraphMem {
  constructor() {
    this._ds = newDataset();
    this._gn = DEFAULT_GRAPH;
    this._pm = new PrefixMappingImpl();
    this._closed = false;
    this._id = ++graphCounter;
    this._gem = null;
    this._th = null;
  }
  _check() { if (this._closed) throw new ClosedException('graph is closed'); }
  /** The core Dataset that holds the triples (a GraphView answers its DatasetGraph's). */
  _d() { return this._ds; }

  /** The @factoidal/core Dataset that holds this graph (the engine handle). */
  get dataset() { return this._d(); }

  getEventManager() { if (!this._gem) this._gem = new GraphEventManager(); return this._gem; }
  _listening() { return this._gem !== null && this._gem.listening(); }
  getTransactionHandler() { if (!this._th) this._th = new SimpleTransactionHandler(); return this._th; }
  getCapabilities() { return CAPS_MEM; }
  /** Java identity hash code (a graph is equal only to itself). */
  hashCode() { return 'graph#' + this._id; }

  _quad(t) {
    return df.quad(t.getSubject().toRDFJS(), t.getPredicate().toRDFJS(), t.getObject().toRDFJS(), this._gn);
  }

  /** Add a triple and notify the listeners. */
  add(s, p, o) {
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this.performAdd(t);
    if (this._listening()) this._gem.notifyAddTriple(this, t);
  }
  /** Add a triple; no event. */
  performAdd(t) {
    this._check();
    if (!t.isConcrete()) throw new AddDeniedException('cannot add a triple with ANY or a variable: ' + t);
    try {
      this._d().add(this._quad(t));
    } catch (e) {
      throw new AddDeniedException(e.message, { cause: e });
    }
  }

  delete(s, p, o) {
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this.performDelete(t);
    if (this._listening()) this._gem.notifyDeleteTriple(this, t);
  }
  performDelete(t) {
    this._check();
    if (!t.isConcrete()) return;
    try { this._d().delete(this._quad(t)); } catch (e) { throw new JenaException(e.message, { cause: e }); }
  }

  /** Remove every triple matching (s, p, o); null or ANY is a wildcard. Event: GraphEvents.remove(s, p, o). */
  remove(s, p, o) {
    this._check();
    for (const t of this._findArray(s, p, o)) this._d().delete(this._quad(t));
    if (this._listening()) this._gem.notifyEvent(this, GraphEvents.remove(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY));
  }
  /** Remove every triple. Event: GraphEvents.removeAll. */
  clear() {
    this._check();
    this._clearStore();
    if (this._listening()) this._gem.notifyEvent(this, GraphEvents.removeAll);
  }
  _clearStore() {
    const old = this._ds;
    this._ds = newDataset();
    old.dispose();
  }

  _findArray(s, p, o) {
    if (s instanceof Triple) return this._findArray(s.getSubject(), s.getPredicate(), s.getObject());
    s = s ?? Node.ANY; p = p ?? Node.ANY; o = o ?? Node.ANY;
    const m = this._d().match(patternTerm(s), patternTerm(p), patternTerm(o), this._gn);
    let quads;
    try { quads = m.toArray(); } finally { m.dispose(); }
    let triples = quads.map(tripleOf);
    // A triple-term pattern with ANY inside is matched here, by term (no semantics).
    if ((s.isTripleTerm() && !s.isConcrete()) || (o.isTripleTerm() && !o.isConcrete())) {
      triples = triples.filter((t) => nodeMatches(s, t.getSubject()) && nodeMatches(o, t.getObject()));
    }
    return triples;
  }

  /** find(), find(Triple) or find(s, p, o): an ExtendedIterator of Triples. */
  find(s, p, o) {
    this._check();
    if (s === undefined && p === undefined && o === undefined) s = Triple.ANY;
    return new ExtendedIterator(this._findArray(s, p, o), (t) => this.delete(t));
  }
  stream(s, p, o) { return this.find(s, p, o).toList()[Symbol.iterator](); }

  contains(s, p, o) {
    this._check();
    const t = s instanceof Triple ? s : Triple.createMatch(s, p, o);
    if (t.isConcrete()) return this._d().has(this._quad(t));
    return this._findArray(t).length > 0;
  }

  size() { this._check(); return this._d().size; }
  sizeLong() { return this.size(); }
  isEmpty() { return this.size() === 0; }

  close() {
    if (!this._closed) { this._closed = true; this._ds.dispose(); }
  }
  isClosed() { return this._closed; }

  getPrefixMapping() { return this._pm; }

  dependsOn(other) { return other === this; }

  /** A core Dataset whose default graph is this graph's triples (this graph's own, or a copy). */
  _ownDataset() { return { ds: this._ds, temp: false }; }

  /** Isomorphism (RDF 1.1 Concepts section 3.6), decided by the engine's RDFC-1.0 canonical form. */
  isIsomorphicWith(other) {
    this._check();
    const g = asGraphMem(other);
    if (g.size() !== this.size()) return false;
    const a = this._ownDataset(), b = g._ownDataset();
    try {
      return a.ds.toString('rdfc') === b.ds.toString('rdfc');
    } catch (e) {
      if (e && e.code === 'canon.unsupported-rdf12') {
        // With no blank node, isomorphism is set equality of the triples.
        if (!hasBlank(this) && !hasBlank(g)) return this.find().toList().every((t) => g.contains(t));
        return unsupported('Graph.isIsomorphicWith (blank nodes and triple terms)', 'isomorphism-rdf12');
      }
      throw new JenaException(e.message, { cause: e });
    } finally {
      if (a.temp) a.ds.dispose();
      if (b.temp) b.ds.dispose();
    }
  }

  toString() {
    if (this._closed) return '{closed}';
    return '{' + this.find().toList().map(String).join('; ') + '}';
  }
}

function nodeMatches(pattern, n) {
  if (!pattern.isConcrete() && !pattern.isTripleTerm()) return true;
  if (pattern.isTripleTerm() && !pattern.isConcrete()) {
    if (!n.isTripleTerm()) return false;
    const a = pattern.getTriple(), b = n.getTriple();
    return nodeMatches(a.getSubject(), b.getSubject()) && nodeMatches(a.getPredicate(), b.getPredicate()) &&
      nodeMatches(a.getObject(), b.getObject());
  }
  return pattern.equals(n);
}

function hasBlank(g) {
  const blank = (n) => n.isBlank() || (n.isTripleTerm() && [n.getTriple().getSubject(), n.getTriple().getObject()].some(blank));
  return g.find().toList().some((t) => blank(t.getSubject()) || blank(t.getObject()));
}

function asGraphMem(g) {
  if (g instanceof GraphMem) return g;
  if (g && typeof g.getGraph === 'function') return asGraphMem(g.getGraph());
  if (g && typeof g.find === 'function') {
    const out = new GraphMem();
    for (const t of g.find(Triple.ANY).toList()) out.add(t);
    return out;
  }
  throw new TypeError('not a Graph');
}

/** Jena WrappedGraph: every Graph method delegates to the base graph (subclass to intercept); it has its own event manager. */
export class WrappedGraph {
  constructor(base) { this._base = base; this._gem = null; }
  getWrapped() { return this._base; }
  get dataset() { return this._base.dataset; }
  getEventManager() { if (!this._gem) this._gem = new GraphEventManager(); return this._gem; }
  add(s, p, o) {
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this._base.add(t);
    if (this._gem) this._gem.notifyAddTriple(this, t);
  }
  performAdd(t) { this._base.performAdd ? this._base.performAdd(t) : this._base.add(t); }
  delete(s, p, o) {
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this._base.delete(t);
    if (this._gem) this._gem.notifyDeleteTriple(this, t);
  }
  performDelete(t) { this._base.performDelete ? this._base.performDelete(t) : this._base.delete(t); }
  remove(s, p, o) {
    this._base.remove(s, p, o);
    if (this._gem) this._gem.notifyEvent(this, GraphEvents.remove(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY));
  }
  clear() { this._base.clear(); if (this._gem) this._gem.notifyEvent(this, GraphEvents.removeAll); }
  find(s, p, o) { return this._base.find(s, p, o); }
  stream(s, p, o) { return this._base.stream(s, p, o); }
  contains(s, p, o) { return this._base.contains(s, p, o); }
  size() { return this._base.size(); }
  sizeLong() { return this._base.sizeLong(); }
  isEmpty() { return this._base.isEmpty(); }
  close() { return this._base.close(); }
  isClosed() { return this._base.isClosed(); }
  getPrefixMapping() { return this._base.getPrefixMapping(); }
  dependsOn(other) { return other === this || this._base.dependsOn(other); }
  isIsomorphicWith(other) { return this._base.isIsomorphicWith(other); }
  getCapabilities() { return this._base.getCapabilities(); }
  getTransactionHandler() { return this._base.getTransactionHandler(); }
  toString() { return this._base.toString(); }
}

export const GraphMemFactory = Object.freeze({
  /** A term-equality in-memory graph. */
  createGraphMem() { return new GraphMem(); },
  createDefaultGraph() { return new GraphMem(); },
  /** Jena 5 GraphMem2 variants are all term-equality graphs. */
  createGraphMem2() { return new GraphMem(); },
  createDefaultGraphSameTerm() { return new GraphMem(); },
  /** Jena: value-based matching (Model's default). Needs an engine op. */
  createDefaultGraphSameValue() { return unsupported('GraphMemFactory.createDefaultGraphSameValue', 'value-matching'); },
  createGraphMemBasic() { return new GraphMem(); },
  empty() { return new GraphMem(); },
});

/** Jena 4 GraphFactory. */
export const GraphFactory = Object.freeze({
  createGraphMem() { return new GraphMem(); },
  createDefaultGraph() { return new GraphMem(); },
  createPlainGraph() { return new GraphMem(); },
});

export const GraphUtil = Object.freeze({
  findAll(g) { return g.find(Triple.ANY); },
  /**
   * add(g, Triple[]) | add(g, ArrayList) | add(g, Iterator): performAdd each, then one
   * bulk event (notifyAddArray, notifyAddList or notifyAddIterator), as Jena.
   */
  add(g, triples) { bulk(g, triples, 'performAdd', 'add', 'Add'); },
  delete(g, triples) { bulk(g, triples, 'performDelete', 'delete', 'Delete'); },
  addInto(dst, src) {
    if (dst === src) return;
    for (const t of src.find(Triple.ANY).toList()) perform(dst, 'performAdd', 'add', t);
    eventsOf(dst)?.notifyAddGraph(dst, src);
  },
  deleteFrom(dst, src) {
    const ts = src.find(Triple.ANY).toList();
    for (const t of ts) perform(dst, 'performDelete', 'delete', t);
    eventsOf(dst)?.notifyDeleteGraph(dst, src);
  },
  remove(g, s, p, o) { g.remove(s, p, o); },
  listSubjects(g, p, o) { return distinct(g.find(Node.ANY, p ?? Node.ANY, o ?? Node.ANY).toList().map((t) => t.getSubject())); },
  listObjects(g, s, p) { return distinct(g.find(s ?? Node.ANY, p ?? Node.ANY, Node.ANY).toList().map((t) => t.getObject())); },
  listPredicates(g, s, o) { return distinct(g.find(s ?? Node.ANY, Node.ANY, o ?? Node.ANY).toList().map((t) => t.getPredicate())); },
  isomorphic(a, b) { return a.isIsomorphicWith(b); },
  containsNode(g, n) {
    return g.contains(n, Node.ANY, Node.ANY) || g.contains(Node.ANY, Node.ANY, n) || g.contains(Node.ANY, n, Node.ANY);
  },
  /** -1, 0 or 1 as the graph has fewer, as many or more triples than `size`, by stepping find(). */
  compareSizeTo(g, size) {
    const it = g.find();
    try {
      let steps = 0;
      while (steps < size && it.hasNext()) { it.next(); steps++; }
      if (steps < size) return -1;
      return it.hasNext() ? 1 : 0;
    } finally { it.close(); }
  },
});

/** A Java-style iterator (hasNext/next[/remove/close]) over a Java-style iterator, a JS iterator or an iterable. */
function javaStyle(it) {
  if (it && typeof it.hasNext === 'function') return it;
  const js = it && typeof it[Symbol.iterator] === 'function' ? it[Symbol.iterator]() : it;
  let ahead = null;
  return {
    hasNext() { if (ahead === null) ahead = js.next(); return !ahead.done; },
    next() {
      if (!this.hasNext()) throw new NoSuchElementException('iterator exhausted');
      const v = ahead.value; ahead = null; return v;
    },
    close() { if (typeof js.return === 'function') js.return(); },
  };
}

/**
 * Jena WrappedIterator: an ExtendedIterator over a base iterator (Java-style
 * hasNext/next, a JavaScript iterator or an iterable). remove() and close()
 * go to the base when it has them; createNoRemove denies remove().
 */
export class WrappedIterator extends ExtendedIterator {
  constructor(base, removeDenied = false) {
    super([]);
    this._base = javaStyle(base);
    this._removeDenied = removeDenied;
  }
  /** WrappedIterator.create(it): `it` itself when it is already an ExtendedIterator. */
  static create(it) { return it instanceof ExtendedIterator ? it : new WrappedIterator(it, false); }
  static createNoRemove(it) { return new WrappedIterator(it, true); }
  hasNext() { return this._base.hasNext(); }
  next() { return this._base.next(); }
  remove() {
    if (this._removeDenied || typeof this._base.remove !== 'function') throw new UnsupportedOperationException('remove() not supported by this iterator');
    this._base.remove();
  }
  close() { if (typeof this._base.close === 'function') this._base.close(); }
}

/** Jena NiceIterator.andThen(a, b): a concatenation; andThen on it appends (and answers itself). */
class AndThenIterator extends ExtendedIterator {
  constructor(a, b) {
    super([]);
    this._current = javaStyle(a);
    this._pending = [b];
    this._index = 0;
    this._removeFrom = null;
  }
  hasNext() {
    if (this._current.hasNext()) return true;
    while (this._index < this._pending.length) {
      this._current = javaStyle(this._pending[this._index]);
      this._pending[this._index++] = null;
      if (this._current.hasNext()) return true;
    }
    return false;
  }
  next() {
    if (!this.hasNext()) throw new NoSuchElementException('concatenation');
    this._removeFrom = this._current;
    return this._current.next();
  }
  remove() {
    if (this._removeFrom === null) throw new JenaException('no calls to next() since last call to remove()');
    if (typeof this._removeFrom.remove !== 'function') throw new UnsupportedOperationException('remove() not supported by this iterator');
    this._removeFrom.remove();
    this._removeFrom = null;
  }
  close() {
    const shut = (it) => { if (it && typeof it.close === 'function') it.close(); };
    shut(this._current);
    for (let i = this._index; i < this._pending.length; i++) shut(this._pending[i]);
    this._removeFrom = null;
  }
  andThen(other) { this._pending.push(other); return this; }
}

/**
 * Jena GraphBase: a Graph whose subclass gives graphBaseFind(Triple) and,
 * optionally, performAdd / performDelete. Every other method is derived from
 * those (no engine). toString shows at most TOSTRING_TRIPLE_LIMIT triples.
 */
export class GraphBase {
  constructor() { this._pmBase = new PrefixMappingImpl(); this._closedBase = false; this._gem = null; this._th = null; }
  graphBaseFind(t) { throw new UnsupportedOperationException('graphBaseFind'); }
  performAdd(t) { throw new AddDeniedException('GraphBase::performAdd'); }
  performDelete(t) { throw new UnsupportedOperationException('GraphBase::performDelete'); }
  add(s, p, o) {
    this._checkOpen();
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this.performAdd(t);
    if (this._gem) this._gem.notifyAddTriple(this, t);
  }
  delete(s, p, o) {
    this._checkOpen();
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    this.performDelete(t);
    if (this._gem) this._gem.notifyDeleteTriple(this, t);
  }
  find(s, p, o) {
    this._checkOpen();
    if (s === undefined && p === undefined && o === undefined) return this.graphBaseFind(Triple.ANY);
    return this.graphBaseFind(s instanceof Triple ? s : Triple.createMatch(s, p, o));
  }
  contains(s, p, o) {
    const t = s instanceof Triple ? s : Triple.createMatch(s, p, o);
    const it = this.find(t);
    try { return it.toList().some((x) => t.matches(x)); } finally { it.close(); }
  }
  remove(s, p, o) {
    for (const t of this.find(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY).toList()) this.performDelete(t);
    if (this._gem) this._gem.notifyEvent(this, GraphEvents.remove(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY));
  }
  clear() {
    for (const t of this.find(Triple.ANY).toList()) this.performDelete(t);
    if (this._gem) this._gem.notifyEvent(this, GraphEvents.removeAll);
  }
  size() { this._checkOpen(); return this.find(Triple.ANY).toList().length; }
  sizeLong() { return this.size(); }
  isEmpty() { return this.size() === 0; }
  close() { this._closedBase = true; }
  isClosed() { return this._closedBase; }
  _checkOpen() { if (this._closedBase) throw new ClosedException('graph is closed'); }
  getPrefixMapping() { return this._pmBase; }
  dependsOn(other) { return other === this; }
  isIsomorphicWith(other) { return asGraphMem(this).isIsomorphicWith(other); }
  getCapabilities() { return CAPS_MEM; }
  getEventManager() { if (!this._gem) this._gem = new GraphEventManager(); return this._gem; }
  getTransactionHandler() { if (!this._th) this._th = new SimpleTransactionHandler(); return this._th; }
  toString() { return GraphBase.toStringOf(this._closedBase ? 'closed ' : '', this); }
  static toStringOf(prefix, that) {
    const pm = that.getPrefixMapping();
    let b = prefix + ' {', count = 0, gap = '';
    const it = GraphUtil.findAll(that);
    while (it.hasNext() && count < GraphBase.TOSTRING_TRIPLE_LIMIT) {
      b += gap; gap = '; '; count += 1;
      b += it.next().toString(pm);
    }
    if (it.hasNext()) b += '...';
    it.close();
    return b + '}';
  }
}
GraphBase.TOSTRING_TRIPLE_BASE = 10;
GraphBase.TOSTRING_TRIPLE_LIMIT = 17;

/** Jena GraphPlain.plain(g): a same-term view. leana graphs already match by term, so this is g. */
export const GraphPlain = Object.freeze({ plain(g) { return g; } });

/** Jena ReifierStd: reification writes rdf:subject, rdf:predicate, rdf:object, rdf:Statement (vocabulary IRIs). */
export const ReifierStd = Object.freeze({
  reifyAs() { return unsupported('ReifierStd.reifyAs', 'vocabulary'); },
  getTriple() { return unsupported('ReifierStd.getTriple', 'vocabulary'); },
  hasTriple() { return unsupported('ReifierStd.hasTriple', 'vocabulary'); },
  allNodes() { return unsupported('ReifierStd.allNodes', 'vocabulary'); },
  remove() { return unsupported('ReifierStd.remove', 'vocabulary'); },
  findExposed() { return unsupported('ReifierStd.findExposed', 'vocabulary'); },
  findEither() { return unsupported('ReifierStd.findEither', 'vocabulary'); },
});

function eventsOf(g) {
  try { return typeof g.getEventManager === 'function' ? g.getEventManager() : null; } catch (_) { return null; }
}
function perform(g, raw, plain, t) {
  if (typeof g[raw] === 'function') g[raw](t); else g[plain](t);
}
function bulk(g, triples, raw, plain, kind) {
  let ev;
  if (triples instanceof ArrayList) {
    for (const t of triples) perform(g, raw, plain, t);
    ev = ['notify' + kind + 'List', triples];
  } else if (Array.isArray(triples)) {
    for (const t of triples) perform(g, raw, plain, t);
    ev = ['notify' + kind + 'Array', triples];
  } else {
    const list = iterOf(triples);
    const arr = [...list];
    for (const t of arr) perform(g, raw, plain, t);
    ev = ['notify' + kind + 'Iterator', arr];
  }
  const em = eventsOf(g);
  if (em) em[ev[0]](g, ev[1]);
}

function iterOf(x) {
  if (x instanceof ExtendedIterator) return x.toList();
  // A Graph (not a JavaScript iterator, which also has find() in Node 22).
  if (x && typeof x.find === 'function' && typeof x.size === 'function') return x.find(Triple.ANY).toList();
  return x;
}

function distinct(nodes) {
  return new ExtendedIterator(new JenaSet(nodes).toArray());
}

export { tripleOf, quadOf, DEFAULT_GRAPH, asGraphMem, patternTerm, nodeMatches, hasBlank, CAPS_MEM };
/** Jena NiceIterator: the base class of leana's iterators (ExtendedIterator is the class itself here). */
export { ExtendedIterator as NiceIterator };
