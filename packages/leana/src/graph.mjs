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
import {
  JenaException, ClosedException, NoSuchElementException, AddDeniedException,
  UnsupportedOperationException, unsupported,
} from './errors.mjs';

const DEFAULT_GRAPH = df.defaultGraph();

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
  andThen(other) {
    const rest = other instanceof ExtendedIterator ? other.toList() : [...other];
    return new ExtendedIterator(this.toList().concat(rest));
  }
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

/** The Graph SPI over a @factoidal/core Dataset (default graph). */
export class GraphMem {
  constructor() {
    this._ds = newDataset();
    this._pm = new PrefixMappingImpl();
    this._closed = false;
    this._id = ++graphCounter;
  }
  _check() { if (this._closed) throw new ClosedException('graph is closed'); }

  /** The @factoidal/core Dataset that holds this graph (the engine handle). */
  get dataset() { return this._ds; }

  add(s, p, o) {
    this._check();
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    if (!t.isConcrete()) throw new AddDeniedException('cannot add a triple with ANY or a variable: ' + t);
    try {
      this._ds.add(quadOf(t));
    } catch (e) {
      throw new AddDeniedException(e.message, { cause: e });
    }
  }
  /** Jena 4/5 name; same as add(Triple). */
  performAdd(t) { this.add(t); }

  delete(s, p, o) {
    this._check();
    const t = s instanceof Triple ? s : Triple.create(s, p, o);
    if (!t.isConcrete()) return;
    try { this._ds.delete(quadOf(t)); } catch (e) { throw new JenaException(e.message, { cause: e }); }
  }
  performDelete(t) { this.delete(t); }

  /** Remove every triple matching (s, p, o); null or ANY is a wildcard. */
  remove(s, p, o) {
    this._check();
    for (const t of this._findArray(s, p, o)) this._ds.delete(quadOf(t));
  }
  clear() {
    this._check();
    const old = this._ds;
    this._ds = newDataset();
    old.dispose();
  }

  _findArray(s, p, o) {
    if (s instanceof Triple) return this._findArray(s.getSubject(), s.getPredicate(), s.getObject());
    s = s ?? Node.ANY; p = p ?? Node.ANY; o = o ?? Node.ANY;
    const m = this._ds.match(patternTerm(s), patternTerm(p), patternTerm(o), DEFAULT_GRAPH);
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
    if (t.isConcrete()) return this._ds.has(quadOf(t));
    return this._findArray(t).length > 0;
  }

  size() { this._check(); return this._ds.size; }
  sizeLong() { return this.size(); }
  isEmpty() { return this.size() === 0; }

  close() {
    if (!this._closed) { this._closed = true; this._ds.dispose(); }
  }
  isClosed() { return this._closed; }

  getPrefixMapping() { return this._pm; }

  dependsOn(other) { return other === this; }

  /** Isomorphism (RDF 1.1 Concepts section 3.6), decided by the engine's RDFC-1.0 canonical form. */
  isIsomorphicWith(other) {
    this._check();
    const g = asGraphMem(other);
    if (g.size() !== this.size()) return false;
    try {
      return this._ds.toString('rdfc') === g._ds.toString('rdfc');
    } catch (e) {
      if (e && e.code === 'canon.unsupported-rdf12') {
        // With no blank node, isomorphism is set equality of the triples.
        if (!hasBlank(this) && !hasBlank(g)) return this.find().toList().every((t) => g.contains(t));
        return unsupported('Graph.isIsomorphicWith (blank nodes and triple terms)', 'isomorphism-rdf12');
      }
      throw new JenaException(e.message, { cause: e });
    }
  }

  getCapabilities() { return unsupported('Graph.getCapabilities', 'echo'); }
  getEventManager() { return unsupported('Graph.getEventManager', 'echo'); }
  getTransactionHandler() { return unsupported('Graph.getTransactionHandler', 'echo'); }

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

/** Jena WrappedGraph: every Graph method delegates to the base graph (subclass to intercept). */
export class WrappedGraph {
  constructor(base) { this._base = base; }
  getWrapped() { return this._base; }
  get dataset() { return this._base.dataset; }
  add(s, p, o) { return this._base.add(s, p, o); }
  performAdd(t) { this.add(t); }
  delete(s, p, o) { return this._base.delete(s, p, o); }
  performDelete(t) { this.delete(t); }
  remove(s, p, o) { return this._base.remove(s, p, o); }
  clear() { return this._base.clear(); }
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
  getEventManager() { return this._base.getEventManager(); }
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
  add(g, triples) { for (const t of iterOf(triples)) g.add(t); },
  delete(g, triples) { for (const t of iterOf(triples)) g.delete(t); },
  addInto(dst, src) { for (const t of src.find(Triple.ANY).toList()) dst.add(t); },
  deleteFrom(dst, src) { for (const t of src.find(Triple.ANY).toList()) dst.delete(t); },
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

/** Jena WrappedIterator.create: an ExtendedIterator over a JavaScript iterable or iterator. */
export const WrappedIterator = Object.freeze({
  create(it) { return new ExtendedIterator(it instanceof ExtendedIterator ? it.toList() : [...{ [Symbol.iterator]: () => (typeof it.next === 'function' && !it[Symbol.iterator] ? it : it[Symbol.iterator]()) }]); },
});

/**
 * Jena GraphBase: a Graph whose subclass gives graphBaseFind(Triple) and,
 * optionally, performAdd / performDelete. Every other method is derived from
 * those (no engine). toString shows at most TOSTRING_TRIPLE_LIMIT triples.
 */
export class GraphBase {
  constructor() { this._pmBase = new PrefixMappingImpl(); this._closedBase = false; }
  graphBaseFind(t) { throw new UnsupportedOperationException('graphBaseFind'); }
  performAdd(t) { throw new AddDeniedException('GraphBase::performAdd'); }
  performDelete(t) { throw new UnsupportedOperationException('GraphBase::performDelete'); }
  add(s, p, o) { this._checkOpen(); this.performAdd(s instanceof Triple ? s : Triple.create(s, p, o)); }
  delete(s, p, o) { this._checkOpen(); this.performDelete(s instanceof Triple ? s : Triple.create(s, p, o)); }
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
  remove(s, p, o) { for (const t of this.find(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY).toList()) this.delete(t); }
  clear() { this.remove(Node.ANY, Node.ANY, Node.ANY); }
  size() { this._checkOpen(); return this.find(Triple.ANY).toList().length; }
  sizeLong() { return this.size(); }
  isEmpty() { return this.size() === 0; }
  close() { this._closedBase = true; }
  isClosed() { return this._closedBase; }
  _checkOpen() { if (this._closedBase) throw new ClosedException('graph is closed'); }
  getPrefixMapping() { return this._pmBase; }
  dependsOn(other) { return other === this; }
  isIsomorphicWith(other) { return asGraphMem(this).isIsomorphicWith(other); }
  getCapabilities() { return unsupported('Graph.getCapabilities', 'echo'); }
  getEventManager() { return unsupported('Graph.getEventManager', 'echo'); }
  getTransactionHandler() { return unsupported('Graph.getTransactionHandler', 'echo'); }
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
});

function iterOf(x) {
  if (x instanceof ExtendedIterator) return x.toList();
  // A Graph (not a JavaScript iterator, which also has find() in Node 22).
  if (x && typeof x.find === 'function' && typeof x.size === 'function') return x.find(Triple.ANY).toList();
  return x;
}

function distinct(nodes) {
  return new ExtendedIterator(new JenaSet(nodes).toArray());
}

export { tripleOf, quadOf, DEFAULT_GRAPH };
