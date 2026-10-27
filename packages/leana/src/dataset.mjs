// leana: Quad, DatasetGraph, Dataset, DatasetFactory, DatasetGraphFactory, Txn.
//
// API modelled on Apache Jena org.apache.jena.sparql.core.{Quad, DatasetGraph,
// DatasetGraphFactory, GraphView}, org.apache.jena.query.{Dataset,
// DatasetFactory, ReadWrite, TxnType} and org.apache.jena.system.Txn (Apache
// License 2.0). No Jena code is copied.
//
// Two DatasetGraph kinds, as in Jena:
//   - DatasetGraphInMemory (DatasetGraphFactory.create(), createTxnMem()): the
//     quads live in one @factoidal/core Dataset; a graph is a view of the
//     quads with one graph name; a graph exists while it has a quad.
//     Transactions are a snapshot (Dataset.clone()) restored on abort.
//   - DatasetGraphMapLink (createGeneral()): a default graph and a map from
//     graph name to Graph objects, linked, not copied (addGraph keeps the
//     Graph). Its quads are read from the graphs.
// Jena's special graph names (urn:x-arq:DefaultGraph, urn:x-arq:DefaultGraphNode,
// urn:x-arq:UnionGraph) are API names for the default graph and the union of
// the named graphs; the engine never sees them.

import { dataFactory as df } from '@factoidal/core';
import { Node, NodeFactory, Triple, fromRDFJS } from './node.mjs';
import {
  GraphMem, ExtendedIterator, JenaSet, Capabilities, TransactionHandlerBase, patternTerm, nodeMatches, DEFAULT_GRAPH,
} from './graph.mjs';
import { GraphEvents } from './events.mjs';
import { PrefixMappingImpl } from './prefix.mjs';
import { newDataset } from './engine.mjs';
import { Model, Resource } from './model.mjs';
import { JenaException, AddDeniedException, DeleteDeniedException, UnsupportedOperationException } from './errors.mjs';

// ---------------------------------------------------------------------------
// Quad

export class Quad {
  constructor(g, s, p, o) {
    if (s instanceof Triple && p === undefined) { const t = s; s = t.getSubject(); p = t.getPredicate(); o = t.getObject(); }
    if (s === null || s === undefined) throw new UnsupportedOperationException('Quad: subject cannot be null');
    if (p === null || p === undefined) throw new UnsupportedOperationException('Quad: predicate cannot be null');
    if (o === null || o === undefined) throw new UnsupportedOperationException('Quad: object cannot be null');
    this._g = g === undefined ? null : g; this._s = s; this._p = p; this._o = o;
    Object.freeze(this);
  }
  /** Quad.create(g, s, p, o) | Quad.create(g, Triple). A null graph means "a triple" (Quad.tripleInQuad). */
  static create(g, s, p, o) {
    if (s instanceof Triple) return new Quad(g, s.getSubject(), s.getPredicate(), s.getObject());
    return new Quad(g, s, p, o);
  }
  static createMatch(g, s, p, o) { return new Quad(g, s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY); }
  getGraph() { return this._g; }
  getSubject() { return this._s; }
  getPredicate() { return this._p; }
  getObject() { return this._o; }
  asTriple() { return Triple.create(this._s, this._p, this._o); }
  isConcrete() { return this._s.isConcrete() && this._p.isConcrete() && this._o.isConcrete() && (this._g === null || this._g.isConcrete()); }
  matches(g, s, p, o) {
    if (g instanceof Quad) return this.matches(g._g, g._s, g._p, g._o);
    const m = (a, b) => isAny(a) || isAny(b) || a.sameTermAs(b);
    return m(this._g, g) && m(this._s, s) && m(this._p, p) && m(this._o, o);
  }
  static isDefaultGraphGenerated(n) { return Quad.defaultGraphNodeGenerated.equals(n); }
  static isDefaultGraphExplicit(n) { return Quad.defaultGraphIRI.equals(n); }
  static isDefaultGraph(n) { return Quad.isDefaultGraphGenerated(n) || Quad.isDefaultGraphExplicit(n); }
  static isUnionGraph(n) { return Quad.unionGraph.equals(n); }
  isDefaultGraphExplicit() { return Quad.isDefaultGraphExplicit(this._g); }
  isDefaultGraphGenerated() { return Quad.isDefaultGraphGenerated(this._g); }
  isDefaultGraph() { return Quad.isDefaultGraph(this._g); }
  isUnionGraph() { return Quad.isUnionGraph(this._g); }
  isTriple() { return this._g === null; }
  isLegalAsData() {
    const s = this._s, p = this._p, o = this._o, g = this._g;
    if (s.isLiteral() || s.isVariable()) return false;
    if (!p.isURI()) return false;
    if (o.isVariable()) return false;
    if (g !== null && !g.isURI() && !g.isBlank()) return false;
    return true;
  }
  hashKey() { return 'Q(' + (this._g === null ? '_' : this._g.hashKey()) + '|' + this._s.hashKey() + '|' + this._p.hashKey() + '|' + this._o.hashKey() + ')'; }
  hashCode() { return this.hashKey(); }
  equals(o) { return o instanceof Quad && o.hashKey() === this.hashKey(); }
  toString() {
    return '[' + (this._g === null ? '_' : String(this._g)) + ' ' + this._s + ' ' + this._p + ' ' + this._o + ']';
  }
}
function isAny(n) { return n === null || n === undefined || n === Node.ANY || (n && n.equals && n.equals(Node.ANY)); }
Quad.defaultGraphIRI = NodeFactory.createURI('urn:x-arq:DefaultGraph');
Quad.defaultGraphNodeGenerated = NodeFactory.createURI('urn:x-arq:DefaultGraphNode');
Quad.unionGraph = NodeFactory.createURI('urn:x-arq:UnionGraph');
Quad.tripleInQuad = null;
Quad.ANY = Quad.create(Node.ANY, Node.ANY, Node.ANY, Node.ANY);

/** The graph name in the store: null for the default graph (null, ANY handled by the caller). */
function isDefaultName(g) { return g === null || g === undefined || Quad.isDefaultGraph(g); }

// ---------------------------------------------------------------------------
// Transactions

/** Jena ReadWrite and TxnType. */
export const ReadWrite = Object.freeze({ READ: 'READ', WRITE: 'WRITE' });
export const TxnType = Object.freeze({
  READ: 'READ', WRITE: 'WRITE', READ_PROMOTE: 'READ_PROMOTE', READ_COMMITTED_PROMOTE: 'READ_COMMITTED_PROMOTE',
  convert(rw) { return rw === ReadWrite.WRITE ? 'WRITE' : 'READ'; },
  initial(t) { return t === 'WRITE' ? ReadWrite.WRITE : ReadWrite.READ; },
});

/** Jena Transactional.Promote: the promotion a promote(mode) call asks for. */
export const Promote = Object.freeze({ ISOLATED: 'ISOLATED', READ_COMMITTED: 'READ_COMMITTED' });

/** Jena JenaTransactionException. */
export class JenaTransactionException extends JenaException {}

/** Jena ARQException (org.apache.jena.sparql.ARQException). */
export class ARQException extends JenaException {}

/**
 * Jena Txn: executeRead / executeWrite / calculateRead / calculateWrite over
 * anything with begin/commit/abort/end/isInTransaction. Nested inside an
 * existing transaction, the action runs in it. An action that answers a
 * Promise is awaited before commit (then the call answers a Promise).
 */
export const Txn = Object.freeze({
  executeRead(t, fn) { return txnRun(t, ReadWrite.READ, fn); },
  executeWrite(t, fn) { return txnRun(t, ReadWrite.WRITE, fn); },
  calculateRead(t, fn) { return txnRun(t, ReadWrite.READ, fn); },
  calculateWrite(t, fn) { return txnRun(t, ReadWrite.WRITE, fn); },
  exec(t, type, fn) { return txnRun(t, type === 'WRITE' ? ReadWrite.WRITE : ReadWrite.READ, fn); },
  calc(t, type, fn) { return txnRun(t, type === 'WRITE' ? ReadWrite.WRITE : ReadWrite.READ, fn); },
});

function txnRun(t, mode, fn) {
  if (t.isInTransaction()) return fn();
  t.begin(mode);
  const finish = (r) => {
    if (t.isInTransaction()) { if (mode === ReadWrite.WRITE) t.commit(); else t.end(); }
    return r;
  };
  const fail = (e) => {
    if (t.isInTransaction()) { try { t.abort(); } catch (_) { /* keep e */ } try { t.end(); } catch (_) { /* keep e */ } }
    throw e;
  };
  let r;
  try { r = fn(); } catch (e) { return fail(e); }
  if (r && typeof r.then === 'function') return r.then(finish, fail);
  try { return finish(r); } catch (e) { return fail(e); }
}

// ---------------------------------------------------------------------------
// Graph views

/**
 * Jena TransactionHandlerView: a graph view's transactions are its dataset's.
 * Jena answers transactionsSupported() with the dataset's supportsTransactionAbort().
 */
class TransactionHandlerView extends TransactionHandlerBase {
  constructor(dsg) { super(); this._dsg = dsg; }
  transactionsSupported() { return this._dsg.supportsTransactionAbort(); }
  begin() { this._dsg.begin(ReadWrite.WRITE); }
  commit() { this._dsg.commit(); }
  abort() { if (this._dsg.isInTransaction()) this._dsg.abort(); this._dsg.end(); }
}

/**
 * Jena GraphView: one graph of a DatasetGraph, read and written through the
 * dataset (the default graph, a named graph, or the union of the named graphs,
 * which is read only). Over a DatasetGraphInMemory the view reads the
 * dataset's current core Dataset (so a transaction's snapshot and abort are
 * seen); over any other DatasetGraph it goes through the DatasetGraph API.
 */
export class GraphView extends GraphMem {
  constructor(dsg, gname) {
    super();
    this._ds.dispose();
    this._ds = null;
    this._dsg = dsg;
    this._union = gname instanceof Node && Quad.isUnionGraph(gname);
    this._gname = this._union ? Quad.unionGraph : (isDefaultName(gname) ? null : gname);
    this._mem = !this._union && typeof dsg._store === 'function';
    this._gn = this._gname === null || this._union ? DEFAULT_GRAPH : this._gname.toRDFJS();
    this._pm = dsg.getPrefixMapping();
  }
  /** Jena GraphView.createDefaultGraph(dsg). */
  static createDefaultGraph(dsg) { return new GraphView(dsg, null); }
  /** Jena GraphView.createNamedGraph(dsg, graphName). */
  static createNamedGraph(dsg, gn) { return new GraphView(dsg, gn); }
  /** Jena GraphView.createUnionGraph(dsg): the union of the named graphs, read only. */
  static createUnionGraph(dsg) { return new GraphView(dsg, Quad.unionGraph); }
  _d() {
    if (!this._mem) throw new UnsupportedOperationException('GraphView: no core Dataset of its own');
    return this._dsg._store();
  }
  get dataset() { return this._mem ? this._d() : this._dsg._coreDatasetSync().ds; }
  getGraphName() { return this._gname; }
  getDataset() { return this._dsg; }
  isUnionGraph() { return this._union; }
  getTransactionHandler() { return new TransactionHandlerView(this._dsg); }
  getCapabilities() { return this._union ? new Capabilities({ _add: false, _del: false }) : super.getCapabilities(); }

  performAdd(t) {
    if (this._union) throw new AddDeniedException('the union graph is read only');
    this._dsg._mutate();
    if (this._mem) { super.performAdd(t); return; }
    this._dsg.add(this._gname, t.getSubject(), t.getPredicate(), t.getObject());
  }
  performDelete(t) {
    if (this._union) throw new DeleteDeniedException('the union graph is read only');
    this._dsg._mutate();
    if (this._mem) { super.performDelete(t); return; }
    if (t.isConcrete()) this._dsg.delete(this._gname, t.getSubject(), t.getPredicate(), t.getObject());
  }
  remove(s, p, o) {
    if (this._union) throw new DeleteDeniedException('the union graph is read only');
    this._dsg._mutate();
    for (const t of this._findArray(s, p, o)) this.performDelete(t);
    if (this._listening()) this._gem.notifyEvent(this, GraphEvents.remove(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY));
  }
  _findArray(s, p, o) {
    if (s instanceof Triple) return this._findArray(s.getSubject(), s.getPredicate(), s.getObject());
    s = s ?? Node.ANY; p = p ?? Node.ANY; o = o ?? Node.ANY;
    if (this._mem) return super._findArray(s, p, o);
    if (this._union) {
      const out = new JenaSet();
      for (const q of this._dsg._findNamed(s, p, o)) out.add(q.asTriple());
      return out.toArray();
    }
    const quads = this._gname === null ? this._dsg._findDefault(s, p, o) : this._dsg._findIn(this._gname, s, p, o);
    return quads.map((q) => q.asTriple());
  }
  contains(s, p, o) {
    if (this._mem) return super.contains(s, p, o);
    const t = s instanceof Triple ? s : Triple.createMatch(s, p, o);
    return this._findArray(t).length > 0;
  }
  size() {
    if (!this._mem) return this._findArray(Node.ANY, Node.ANY, Node.ANY).length;
    const m = this._d().match(null, null, null, this._gn);
    try { return m.size; } finally { m.dispose(); }
  }
  _clearStore() {
    if (this._union) throw new DeleteDeniedException('the union graph is read only');
    this._dsg._mutate();
    if (!this._mem) {
      for (const t of this._findArray(Node.ANY, Node.ANY, Node.ANY)) this.performDelete(t);
      return;
    }
    const m = this._d().match(null, null, null, this._gn);
    let qs;
    try { qs = m.toArray(); } finally { m.dispose(); }
    for (const q of qs) this._d().delete(q);
  }
  close() { this._closed = false; }
  isClosed() { return false; }
  _ownDataset() {
    const ds = newDataset();
    for (const t of this._findArray(Node.ANY, Node.ANY, Node.ANY)) ds.add(df.quad(t.getSubject().toRDFJS(), t.getPredicate().toRDFJS(), t.getObject().toRDFJS(), DEFAULT_GRAPH));
    return { ds, temp: true };
  }
  equals(o) {
    return o instanceof GraphView && o._dsg === this._dsg && o._union === this._union &&
      (o._gname === null ? this._gname === null : o._gname.equals(this._gname));
  }
}

/** The union of the named graphs of a DatasetGraph, read only (Jena GraphUnionRead; a GraphView of Quad.unionGraph). */
export class GraphUnionView extends GraphView {
  constructor(dsg) { super(dsg, Quad.unionGraph); }
}

// ---------------------------------------------------------------------------
// DatasetGraph

function quadArgs(a, s, p, o) {
  if (a instanceof Quad) return [a.getGraph(), a.getSubject(), a.getPredicate(), a.getObject()];
  return [a, s, p, o];
}

/** What every DatasetGraph shares: names, find, transactions. */
class DatasetGraphBase {
  constructor() {
    this._pm = new PrefixMappingImpl();
    this._txn = null; // { mode }
    this._context = new Context();
    this._closed = false;
  }
  getPrefixMapping() { return this._pm; }
  /** Jena DatasetGraph.prefixes(): the dataset's PrefixMap. */
  prefixes() { return this._pm; }
  getContext() { return this._context; }
  getUnionGraph() { return new GraphUnionView(this); }
  /** Jena DatasetGraph.getGraph(Quad.unionGraph) is the union graph; any other name is that graph (or the default graph). */
  getGraph(gn) {
    if (gn instanceof Node && Quad.isUnionGraph(gn)) return this.getUnionGraph();
    return this._graph(gn);
  }
  getDefaultGraph() { return this._graph(null); }

  add(a, s, p, o) {
    const [g, s1, p1, o1] = quadArgs(a, s, p, o);
    if (g instanceof Node && Quad.isUnionGraph(g)) throw new AddDeniedException("Can't add to the union graph");
    this._mutate();
    this._add(isDefaultName(g) ? null : g, Triple.create(s1, p1, o1));
  }
  delete(a, s, p, o) {
    const [g, s1, p1, o1] = quadArgs(a, s, p, o);
    if (g instanceof Node && Quad.isUnionGraph(g)) throw new DeleteDeniedException("Can't delete from the union graph");
    this._mutate();
    this._delete(isDefaultName(g) ? null : g, Triple.create(s1, p1, o1));
  }
  deleteAny(g, s, p, o) {
    if (g instanceof Node && Quad.isUnionGraph(g)) throw new DeleteDeniedException("Can't delete from the union graph");
    for (const q of this.find(g ?? Node.ANY, s, p, o).toList()) this.delete(q);
  }
  /** Jena DatasetGraph.addAll(DatasetGraph): add every quad of `src`. */
  addAll(src) {
    for (const q of src.find().toList()) this.add(q);
  }
  /** find() | find(Quad) | find(g, s, p, o): null or ANY is a wildcard; default-graph quads carry Quad.defaultGraphIRI. */
  find(a, s, p, o) {
    if (a === undefined && s === undefined) return this.find(Node.ANY, Node.ANY, Node.ANY, Node.ANY);
    const [g, s1, p1, o1] = quadArgs(a, s, p, o);
    s = s1 ?? Node.ANY; p = p1 ?? Node.ANY; o = o1 ?? Node.ANY;
    let quads;
    if (isAny(g)) quads = this._findDefault(s, p, o).concat(this._findNamed(s, p, o));
    else if (Quad.isDefaultGraph(g)) quads = this._findDefault(s, p, o);
    else if (Quad.isUnionGraph(g)) {
      const seen = new JenaSet();
      quads = [];
      for (const q of this._findNamed(s, p, o)) if (seen.add(q.asTriple())) quads.push(Quad.create(Quad.unionGraph, q.asTriple()));
    } else quads = this._findIn(g, s, p, o);
    return new ExtendedIterator(quads, (q) => this.delete(q));
  }
  /** find in the named graphs only. */
  findNG(a, s, p, o) {
    const [g, s1, p1, o1] = a === undefined ? [Node.ANY] : quadArgs(a, s, p, o);
    s = s1 ?? Node.ANY; p = p1 ?? Node.ANY; o = o1 ?? Node.ANY;
    if (isAny(g)) return new ExtendedIterator(this._findNamed(s, p, o));
    if (Quad.isDefaultGraph(g)) return ExtendedIterator.empty();
    return this.find(g, s, p, o);
  }
  /** Jena stream(...): a JavaScript iterator (with the Iterator helpers) over find(...). */
  stream(a, s, p, o) { return this.find(a, s, p, o).toList()[Symbol.iterator](); }
  /** Jena streamNG(...): stream over the named graphs only. */
  streamNG(a, s, p, o) { return this.findNG(a, s, p, o).toList()[Symbol.iterator](); }
  /** Jena DatasetGraphBaseFind.findInUnionGraph(s, p, o): the distinct triples of the named graphs. */
  findInUnionGraph(s, p, o) {
    const out = new JenaSet();
    for (const q of this._findNamed(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY)) out.add(q.asTriple());
    return new ExtendedIterator(out.toArray());
  }
  /** Jena DatasetGraphBaseFind.streamQuadsInUnionGraph(s, p, o): those triples as quads of Quad.unionGraph. */
  streamQuadsInUnionGraph(s, p, o) {
    return this.findInUnionGraph(s, p, o).toList().map((t) => Quad.create(Quad.unionGraph, t))[Symbol.iterator]();
  }
  contains(a, s, p, o) { return this.find(a, s, p, o).hasNext(); }
  containsGraph(gn) {
    if (isDefaultName(gn) || Quad.isUnionGraph(gn)) return true;
    return this.listGraphNodes().toList().some((n) => n.equals(gn));
  }
  /** Number of named graphs (Jena DatasetGraph.size()). */
  size() { return this.listGraphNodes().toList().length; }
  isEmpty() { return !this.find().hasNext(); }
  /** Jena: remove every quad (and every named graph). */
  clear() {
    this._mutate();
    for (const gn of this.listGraphNodes().toList()) this.removeGraph(gn);
    this.getDefaultGraph().clear();
  }
  setDefaultGraph(g) {
    this._mutate();
    const d = this.getDefaultGraph();
    d.clear();
    for (const t of g.find().toList()) d.add(t);
  }
  close() { this._closed = true; }
  isClosed() { return this._closed; }

  // --- transactions (Jena Transactional)
  // One transaction at a time (JavaScript has one thread). begin(TxnType |
  // ReadWrite) takes a snapshot; abort() restores it. A write in a READ
  // transaction is a JenaTransactionException; in READ_PROMOTE or
  // READ_COMMITTED_PROMOTE it promotes the transaction to WRITE. end() of a
  // WRITE transaction that was neither committed nor aborted aborts it and
  // throws, as Jena does.
  supportsTransactions() { return true; }
  supportsTransactionAbort() { return true; }
  isInTransaction() { return this._txn !== null; }
  transactionMode() { return this._txn ? this._txn.mode : null; }
  transactionType() { return this._txn ? this._txn.type : null; }
  begin(mode = TxnType.READ_PROMOTE) {
    if (this._txn) throw new JenaTransactionException('Already in a transaction');
    const m = String(mode);
    const type = m === 'WRITE' ? 'WRITE' : m === 'READ' ? 'READ'
      : (m === 'READ_PROMOTE' || m === 'READ_COMMITTED_PROMOTE') ? m : null;
    if (type === null) throw new JenaTransactionException('Unknown transaction type: ' + m);
    this._txn = { type, mode: type === 'WRITE' ? ReadWrite.WRITE : ReadWrite.READ, snapshot: this._snapshot() };
  }
  /** Jena promote() | promote(Promote): false for a READ transaction; true (and WRITE mode) otherwise. */
  promote(_how) {
    if (!this._txn) throw new JenaTransactionException('Not in a transaction');
    if (this._txn.mode === ReadWrite.WRITE) return true;
    if (this._txn.type === 'READ') return false;
    this._txn.mode = ReadWrite.WRITE;
    return true;
  }
  /** Called before every change: a write must be in a WRITE (or promotable) transaction, or in none. */
  _mutate() {
    const t = this._txn;
    if (t === null || t.mode === ReadWrite.WRITE) return;
    if (t.type === 'READ') throw new JenaTransactionException('Tried to write inside a READ transaction');
    t.mode = ReadWrite.WRITE;
  }
  commit() {
    if (!this._txn) throw new JenaTransactionException('Not in a transaction');
    this._dropSnapshot(this._txn.snapshot);
    this._txn = null;
  }
  abort() {
    if (!this._txn) throw new JenaTransactionException('Not in a transaction');
    this._restore(this._txn.snapshot);
    this._txn = null;
  }
  /** Jena end(): finish a read transaction; a write transaction that was not committed or aborted is aborted, and end() throws. */
  end() {
    if (!this._txn) return;
    if (this._txn.mode === ReadWrite.WRITE) {
      this.abort();
      throw new JenaTransactionException('end() called for a WRITE transaction without commit or abort having been called');
    }
    this._dropSnapshot(this._txn.snapshot);
    this._txn = null;
  }
  executeRead(fn) { return Txn.executeRead(this, fn); }
  executeWrite(fn) { return Txn.executeWrite(this, fn); }
  calculateRead(fn) { return Txn.calculateRead(this, fn); }
  calculateWrite(fn) { return Txn.calculateWrite(this, fn); }
  exec(type, fn) { return Txn.exec(this, type, fn); }
  calc(type, fn) { return Txn.calc(this, type, fn); }
  /** The TransactionHandler of a graph of this dataset: the dataset's transactions (Jena TransactionHandlerView). */
  _graphTxnHandler() { return new TransactionHandlerView(this); }

  /** A core Dataset with this dataset's quads (for query and update); `temp` when it is a copy. */
  async _coreDataset() { return this._coreDatasetSync(); }
  /** The same, synchronously (a copy is built with Dataset.add, which is synchronous). */
  _coreDatasetSync() {
    const ds = newDataset();
    for (const q of this.find().toList()) {
      const g = q.isDefaultGraph() ? DEFAULT_GRAPH : q.getGraph().toRDFJS();
      ds.add(df.quad(q.getSubject().toRDFJS(), q.getPredicate().toRDFJS(), q.getObject().toRDFJS(), g));
    }
    return { ds, temp: true };
  }

  toString() {
    const lines = [];
    for (const q of this.find().toList()) lines.push(String(q));
    return '(dataset ' + lines.join(' ') + ')';
  }
}

/** Jena DatasetGraphInMemory (createTxnMem): one core Dataset holds every quad. */
export class DatasetGraphInMemory extends DatasetGraphBase {
  constructor() { super(); this._ds = newDataset(); }
  _store() { return this._ds; }
  /** The @factoidal/core Dataset that holds the quads (the engine handle). */
  get dataset() { return this._ds; }
  _graph(gn) { return new GraphView(this, gn); }
  _add(gn, t) { this._graph(gn).add(t); }
  _delete(gn, t) { this._graph(gn).delete(t); }
  _quadsOf(term, s, p, o) {
    const m = this._ds.match(patternTerm(s), patternTerm(p), patternTerm(o), term);
    let qs;
    try { qs = m.toArray(); } finally { m.dispose(); }
    let out = qs.map((q) => Quad.create(q.graph.termType === 'DefaultGraph' ? Quad.defaultGraphIRI : fromRDFJS(q.graph),
      fromRDFJS(q.subject), fromRDFJS(q.predicate), fromRDFJS(q.object)));
    if ((s.isTripleTerm() && !s.isConcrete()) || (o.isTripleTerm() && !o.isConcrete())) {
      out = out.filter((q) => nodeMatches(s, q.getSubject()) && nodeMatches(o, q.getObject()));
    }
    return out;
  }
  _findDefault(s, p, o) { return this._quadsOf(DEFAULT_GRAPH, s, p, o); }
  _findNamed(s, p, o) { return this._quadsOf(null, s, p, o).filter((q) => !q.isDefaultGraph()); }
  _findIn(g, s, p, o) {
    if (!g.isURI() && !g.isBlank()) return [];
    return this._quadsOf(g.toRDFJS(), s, p, o);
  }
  listGraphNodes() {
    const seen = new JenaSet();
    for (const q of this._findNamed(Node.ANY, Node.ANY, Node.ANY)) seen.add(q.getGraph());
    return new ExtendedIterator(seen.toArray());
  }
  containsGraph(gn) {
    if (isDefaultName(gn) || Quad.isUnionGraph(gn)) return true;
    if (!(gn.isURI() || gn.isBlank())) return false;
    const m = this._ds.match(null, null, null, gn.toRDFJS());
    try { return m.size > 0; } finally { m.dispose(); }
  }
  /** Jena addGraph: replace the graph's triples with a copy of `graph`'s. */
  addGraph(gn, graph) {
    this._mutate();
    if (isDefaultName(gn)) { this.setDefaultGraph(graph); return; }
    const v = this._graph(gn);
    v._clearStore();
    for (const t of graph.find().toList()) v.performAdd(t);
  }
  removeGraph(gn) {
    this._mutate();
    if (isDefaultName(gn)) { this.getDefaultGraph().clear(); return; }
    this._graph(gn)._clearStore();
  }
  clear() {
    this._mutate();
    const old = this._ds;
    this._ds = newDataset();
    if (!this._txn || this._txn.snapshot !== old) old.dispose();
  }
  _snapshot() { return this._ds.clone(); }
  _dropSnapshot(s) { if (s && s !== this._ds) s.dispose(); }
  _restore(s) { const cur = this._ds; this._ds = s; if (cur !== s) cur.dispose(); }
  async _coreDataset() { return { ds: this._ds, temp: false }; }
  _coreDatasetSync() { return { ds: this._ds, temp: false }; }
  /** After an update on the core Dataset (in place): nothing to copy back. */
  _afterUpdate() {}
}

/**
 * Jena DatasetGraphMapLink (createGeneral): the default graph and the named
 * graphs are Graph objects; addGraph links the graph, it does not copy it.
 * getGraph(name) for a name with no graph adds a new empty one.
 */
export class DatasetGraphMapLink extends DatasetGraphBase {
  constructor(dftGraph, graphMaker) {
    super();
    this._maker = graphMaker || (() => new GraphMem());
    this._dft = dftGraph || this._maker();
    this._graphs = new Map(); // hashKey -> [Node, Graph]
  }
  _graph(gn) {
    if (isDefaultName(gn)) return this._dft;
    const k = gn.hashKey();
    if (!this._graphs.has(k)) this._graphs.set(k, [gn, this._maker(gn)]);
    return this._graphs.get(k)[1];
  }
  _add(gn, t) { this._graph(gn).add(t); }
  _delete(gn, t) {
    if (gn === null) { this._dft.delete(t); return; }
    const e = this._graphs.get(gn.hashKey());
    if (e) e[1].delete(t);
  }
  _quadsFrom(gn, g, s, p, o) { return g.find(s, p, o).toList().map((t) => Quad.create(gn, t)); }
  _findDefault(s, p, o) { return this._quadsFrom(Quad.defaultGraphIRI, this._dft, s, p, o); }
  _findNamed(s, p, o) {
    const out = [];
    for (const [gn, g] of this._graphs.values()) out.push(...this._quadsFrom(gn, g, s, p, o));
    return out;
  }
  _findIn(g, s, p, o) {
    const e = this._graphs.get(g.hashKey());
    return e ? this._quadsFrom(e[0], e[1], s, p, o) : [];
  }
  listGraphNodes() { return new ExtendedIterator([...this._graphs.values()].map((e) => e[0])); }
  containsGraph(gn) {
    if (isDefaultName(gn) || Quad.isUnionGraph(gn)) return true;
    return this._graphs.has(gn.hashKey());
  }
  addGraph(gn, graph) {
    this._mutate();
    if (isDefaultName(gn)) { this._dft = graph; return; }
    this._graphs.set(gn.hashKey(), [gn, graph]);
  }
  removeGraph(gn) {
    this._mutate();
    if (isDefaultName(gn)) { this._dft = this._maker(); return; }
    this._graphs.delete(gn.hashKey());
  }
  /** Jena DatasetGraphMapLink.setDefaultGraph links the graph. */
  setDefaultGraph(g) { this._mutate(); this._dft = g; }
  clear() { this._mutate(); this._graphs.clear(); this._dft.clear(); }
  /** Jena: DatasetGraphMapLink does not promise abort (leana's restores a snapshot of the linked graphs). */
  supportsTransactionAbort() { return false; }
  _snapshot() {
    const copy = (g) => { const c = new GraphMem(); for (const t of g.find().toList()) c.add(t); return c; };
    return { dft: [this._dft, copy(this._dft)], graphs: [...this._graphs.entries()].map(([k, [n, g]]) => [k, n, g, copy(g)]) };
  }
  _dropSnapshot(s) {
    if (!s) return;
    s.dft[1].close();
    for (const e of s.graphs) e[3].close();
  }
  _restore(s) {
    const refill = (g, c) => { g.clear(); for (const t of c.find().toList()) g.add(t); c.close(); };
    this._dft = s.dft[0];
    refill(this._dft, s.dft[1]);
    this._graphs = new Map(s.graphs.map(([k, n, g, c]) => { refill(g, c); return [k, [n, g]]; }));
  }
  /** After an update on a copy: write the copy's graphs back into the linked graphs. */
  _afterUpdate(ds) {
    const byGraph = new Map();
    for (const q of ds) {
      const key = q.graph.termType === 'DefaultGraph' ? '' : fromRDFJS(q.graph).hashKey();
      if (!byGraph.has(key)) byGraph.set(key, [q.graph.termType === 'DefaultGraph' ? null : fromRDFJS(q.graph), []]);
      byGraph.get(key)[1].push(Triple.create(fromRDFJS(q.subject), fromRDFJS(q.predicate), fromRDFJS(q.object)));
    }
    const sync = (g, ts) => {
      const want = new JenaSet(ts);
      for (const t of g.find().toList()) if (!want.contains(t)) g.delete(t);
      for (const t of ts) if (!g.contains(t)) g.add(t);
    };
    sync(this._dft, byGraph.has('') ? byGraph.get('')[1] : []);
    for (const [k, [n, g]] of [...this._graphs.entries()]) {
      if (byGraph.has(k)) sync(g, byGraph.get(k)[1]);
      else this._graphs.delete(k); // the update dropped (or emptied) the graph
      void n;
    }
    for (const [k, [n, ts]] of byGraph) if (k !== '' && !this._graphs.has(k)) sync(this._graph(n), ts);
  }
}

/** Jena DatasetGraphOne / a dataset over one graph (DatasetGraphFactory.wrap(graph)): that graph is the default graph. */
export class DatasetGraphOne extends DatasetGraphMapLink {
  constructor(graph) { super(graph); }
  addGraph() { throw new UnsupportedOperationException("Can't add a graph to a DatasetGraphOne"); }
}

/**
 * Jena DatasetGraphMap (DatasetGraphFactory.create()): graphs are copied in
 * (addGraph copies). leana keeps the quads in one core Dataset, as
 * DatasetGraphInMemory does; like Jena's, it does not promise abort.
 */
export class DatasetGraphMap extends DatasetGraphInMemory {
  supportsTransactionAbort() { return false; }
}

/** Jena DatasetGraphZero: always empty, no change allowed; it keeps transaction state. */
export class DatasetGraphZero extends DatasetGraphInMemory {
  static create() { return new DatasetGraphZero(); }
  _mutate() { throw new UnsupportedOperationException('DatasetGraphZero: no change allowed'); }
  add() { this._mutate(); }
  delete() { this._mutate(); }
  deleteAny() { this._mutate(); }
  addGraph() { this._mutate(); }
  removeGraph() { this._mutate(); }
  setDefaultGraph() { this._mutate(); }
  clear() { this._mutate(); }
}

/** Jena DatasetGraphSink: every change is accepted and dropped; always empty. */
export class DatasetGraphSink extends DatasetGraphInMemory {
  static create() { return new DatasetGraphSink(); }
  _mutate() {}
  _add() {}
  _delete() {}
  deleteAny() {}
  addGraph() {}
  removeGraph() {}
  setDefaultGraph() {}
  clear() {}
  _graph(gn) { return new SinkGraphView(this, gn); }
}
class SinkGraphView extends GraphView {
  performAdd() {}
  performDelete() {}
  _clearStore() {}
}

// ---------------------------------------------------------------------------
// Context (Jena sparql.util.Context): symbol -> value.

export class Symbol_ {
  constructor(name) { this._name = String(name); Object.freeze(this); }
  static create(name) { return new Symbol_(name); }
  getSymbol() { return this._name; }
  equals(o) { return o instanceof Symbol_ && o._name === this._name; }
  hashKey() { return 'S' + this._name; }
  toString() { return this._name; }
}
export class Context {
  constructor(other) { this._m = new Map(other instanceof Context ? other._m : []); }
  static create() { return new Context(); }
  static _key(k) { return k instanceof Symbol_ ? k.getSymbol() : String(k); }
  set(k, v) { if (v === null || v === undefined) this._m.delete(Context._key(k)); else this._m.set(Context._key(k), v); return this; }
  put(k, v) { return this.set(k, v); }
  get(k, dft = null) { return this._m.has(Context._key(k)) ? this._m.get(Context._key(k)) : dft; }
  getAsString(k, dft = null) { const v = this.get(k); return v === null ? dft : String(v); }
  isDefined(k) { return this._m.has(Context._key(k)); }
  isUndef(k) { return !this.isDefined(k); }
  isTrue(k) { const v = this.get(k); return v === true || v === 'true'; }
  isFalse(k) { const v = this.get(k); return v === false || v === 'false'; }
  isTrueOrUndef(k) { return this.isUndef(k) || this.isTrue(k); }
  isFalseOrUndef(k) { return this.isUndef(k) || this.isFalse(k); }
  setTrue(k) { return this.set(k, true); }
  setFalse(k) { return this.set(k, false); }
  setIfUndef(k, v) { if (this.isUndef(k)) this.set(k, v); return this; }
  /**
   * Jena getInt(symbol, dft): a string is parsed; a JavaScript number that is
   * an integer is an int. A BigInt (leana's Java long) is not an int: ARQException.
   */
  getInt(k, dft) {
    if (this.isUndef(k)) return dft;
    const v = this.get(k);
    if (typeof v === 'string') return Number.parseInt(v, 10);
    if (typeof v === 'number' && Number.isInteger(v)) return v;
    throw new ARQException('Value for ' + Context._key(k) + ' is not a recognized class: ' + typeof v);
  }
  /** Jena getLong(symbol, dft): a BigInt (Java long), an integer number or a string, answered as a BigInt. */
  getLong(k, dft) {
    if (this.isUndef(k)) return dft;
    const v = this.get(k);
    if (typeof v === 'bigint') return v;
    if (typeof v === 'string') return BigInt(v);
    if (typeof v === 'number' && Number.isInteger(v)) return BigInt(v);
    throw new ARQException('Value for ' + Context._key(k) + ' is not a recognized class: ' + typeof v);
  }
  remove(k) { this._m.delete(Context._key(k)); return this; }
  unset(k) { return this.remove(k); }
  clear() { this._m.clear(); return this; }
  keys() { return new JenaSet([...this._m.keys()].map((k) => Symbol_.create(k))); }
  size() { return this._m.size; }
  copy() { return new Context(this); }
  putAll(other) { if (other) for (const [k, v] of other._m) this._m.set(k, v); return this; }
  toString() { return [...this._m].map(([k, v]) => k + ' = ' + v).join('\n'); }
}

/**
 * Jena AssemblerUtils.parseContext(Resource): the Context of the
 * `ja:context [ ja:cxtName name ; ja:cxtValue value ]` settings of `r`, or
 * null when it has none. The ja: names are Jena's assembler vocabulary (API
 * names). A name is a string literal or an IRI; a value is its lexical form
 * (or IRI); the value "undef" removes the setting.
 */
const JA_NS = 'http://jena.hpl.hp.com/2005/11/Assembler#';
const JA_CONTEXT = NodeFactory.createURI(JA_NS + 'context');
const JA_CXT_NAME = NodeFactory.createURI(JA_NS + 'cxtName');
const JA_CXT_VALUE = NodeFactory.createURI(JA_NS + 'cxtValue');
export const AssemblerUtils = Object.freeze({
  parseContext(r) {
    const g = r.getModel().getGraph();
    const settings = g.find(r.asNode(), JA_CONTEXT, Node.ANY).toList();
    if (settings.length === 0) return null;
    const cxt = new Context();
    const str = (n, what) => {
      if (n.isLiteral()) return n.getLiteralLexicalForm();
      if (n.isURI()) return n.getURI();
      throw new ARQException('Context ' + what + ' must be a literal or an IRI: ' + n);
    };
    for (const t of settings) {
      const c = t.getObject();
      for (const tn of g.find(c, JA_CXT_NAME, Node.ANY).toList()) {
        const name = str(tn.getObject(), 'name');
        for (const tv of g.find(c, JA_CXT_VALUE, Node.ANY).toList()) {
          const v = str(tv.getObject(), 'value');
          if (v === 'undef') cxt.remove(name); else cxt.set(name, v);
        }
      }
    }
    return cxt;
  },
});

// ---------------------------------------------------------------------------
// Dataset (Model level)

function nameNode(uri) {
  if (uri instanceof Node) return uri;
  if (uri instanceof Resource) return uri.asNode();
  return NodeFactory.createURI(String(uri));
}

export class Dataset {
  constructor(dsg) { this._dsg = dsg; }
  asDatasetGraph() { return this._dsg; }
  getDefaultModel() { return new Model(this._dsg.getDefaultGraph()); }
  getUnionModel() { return new Model(this._dsg.getUnionGraph()); }
  setDefaultModel(m) { this._dsg.setDefaultGraph(m.getGraph()); return this; }
  getNamedModel(uri) { return new Model(this._dsg.getGraph(nameNode(uri))); }
  addNamedModel(uri, m) { this._dsg.addGraph(nameNode(uri), m.getGraph()); return this; }
  removeNamedModel(uri) { this._dsg.removeGraph(nameNode(uri)); return this; }
  replaceNamedModel(uri, m) { this._dsg.removeGraph(nameNode(uri)); this._dsg.addGraph(nameNode(uri), m.getGraph()); return this; }
  /** Jena containsNamedModel: the union graph and the default graph names are always there (AbstractTestDataset dataset_08, dataset_09). */
  containsNamedModel(uri) { return this._dsg.containsGraph(nameNode(uri)); }
  /** The names of the named models, as strings (Jena listNames). */
  listNames() { return new ExtendedIterator(this._dsg.listGraphNodes().toList().map((n) => (n.isURI() ? n.getURI() : n.getBlankNodeLabel()))); }
  listModelNames() { const m = this.getDefaultModel(); return new ExtendedIterator(this._dsg.listGraphNodes().toList().map((n) => m.wrapAsResource(n))); }
  isEmpty() { return this._dsg.isEmpty(); }
  getContext() { return this._dsg.getContext(); }
  getPrefixMapping() { return this._dsg.getPrefixMapping(); }
  getLock() { if (!this._lock) this._lock = new (class { enterCriticalSection() {} leaveCriticalSection() {} })(); return this._lock; }
  close() { this._dsg.close(); }
  isClosed() { return this._dsg.isClosed(); }
  supportsTransactions() { return this._dsg.supportsTransactions(); }
  supportsTransactionAbort() { return this._dsg.supportsTransactionAbort(); }
  begin(mode) { this._dsg.begin(mode); }
  commit() { this._dsg.commit(); }
  abort() { this._dsg.abort(); }
  end() { this._dsg.end(); }
  promote(how) { return this._dsg.promote(how); }
  isInTransaction() { return this._dsg.isInTransaction(); }
  transactionMode() { return this._dsg.transactionMode(); }
  transactionType() { return this._dsg.transactionType(); }
  executeRead(fn) { return Txn.executeRead(this, fn); }
  executeWrite(fn) { return Txn.executeWrite(this, fn); }
  calculateRead(fn) { return Txn.calculateRead(this, fn); }
  calculateWrite(fn) { return Txn.calculateWrite(this, fn); }
  /** Jena Dataset.add(Model) adds to the default model; add(Quad) a quad. */
  add(x) {
    if (x instanceof Model) this.getDefaultModel().add(x);
    else if (x instanceof Quad) this._dsg.add(x);
    else throw new TypeError('Dataset.add: a Model or a Quad');
    return this;
  }
  remove(x) {
    if (x instanceof Model) this.getDefaultModel().remove(x);
    else if (x instanceof Quad) this._dsg.delete(x);
    else throw new TypeError('Dataset.remove: a Model or a Quad');
    return this;
  }
  /** Jena Dataset.asDatasetGraph().find as Model-level iteration is not here; use asDatasetGraph(). */
  toString() { return this._dsg.toString(); }
}

// ---------------------------------------------------------------------------
// Factories

export const DatasetGraphFactory = Object.freeze({
  /** Jena create(): an in-memory dataset (graphs are copied in). */
  create(graph) {
    const dsg = new DatasetGraphMap();
    if (graph) dsg.setDefaultGraph(graph);
    return dsg;
  },
  createTxnMem() { return new DatasetGraphInMemory(); },
  createGeneral() { return new DatasetGraphMapLink(); },
  /** Jena DatasetGraphFactory.graphMakerMem: a GraphMaker of in-memory graphs. */
  graphMakerMem: Object.freeze({ create() { return new GraphMem(); } }),
  createWithGraphMaker(maker) { return new DatasetGraphMapLink(null, typeof maker === 'function' ? maker : (n) => maker.create(n)); },
  createGraphMem() { return new DatasetGraphMap(); },
  /** A dataset whose default graph is `graph` (linked). */
  wrap(graph) { return new DatasetGraphOne(graph); },
  createOneGraph(graph) { return new DatasetGraphOne(graph); },
  empty() { return new DatasetGraphInMemory(); },
  /** Jena DatasetGraphFactory.cloneStructure / copy are not here. */
});

export const DatasetFactory = Object.freeze({
  /** create() | create(Model): a general dataset; the model, when given, is linked as the default model. */
  create(model) {
    if (model instanceof Model) return new Dataset(new DatasetGraphMapLink(model.getGraph()));
    if (model instanceof DatasetGraphBase) return new Dataset(model);
    return new Dataset(new DatasetGraphMapLink());
  },
  createGeneral(model) { return DatasetFactory.create(model); },
  createTxnMem() { return new Dataset(new DatasetGraphInMemory()); },
  /** wrap(DatasetGraph) | wrap(Model). */
  wrap(x) {
    if (x instanceof DatasetGraphBase) return new Dataset(x);
    if (x instanceof Model) return new Dataset(new DatasetGraphOne(x.getGraph()));
    throw new TypeError('DatasetFactory.wrap: a DatasetGraph or a Model');
  },
  empty() { return new Dataset(new DatasetGraphInMemory()); },
});

/** True when x is a leana DatasetGraph. */
export function isDatasetGraph(x) { return x instanceof DatasetGraphBase; }

export { DatasetGraphBase as DatasetGraph, GraphEvents };
