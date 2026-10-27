// leana: graph compositions (dynamic union, intersection, difference, delta).
//
// API modelled on Apache Jena org.apache.jena.graph.compose.{CompositionBase,
// Dyadic, Union, Intersection, Difference, DisjointUnion, Delta, Polyadic,
// MultiUnion, PolyadicPrefixMappingImpl} (Apache License 2.0). No Jena code is
// copied. A composition is set algebra over the find() and contains() of its
// operand graphs, which match by term; no RDF semantics are added here.

import { Triple } from './node.mjs';
import { GraphBase, GraphMem, ExtendedIterator, JenaSet } from './graph.mjs';
import { PrefixMappingImpl } from './prefix.mjs';
import { JenaException } from './errors.mjs';

/** Jena CompositionBase: a GraphBase whose find() results delete through this graph (with events). */
export class CompositionBase extends GraphBase {
  /** Jena CompositionBase.butNot(a, b): the elements of a that are not in b. */
  static butNot(a, b) {
    const bSet = new JenaSet(b.toList ? b.toList() : [...b]);
    return a.filterDrop((x) => bSet.contains(x));
  }
  _notifyingRemove(triples) { return new ExtendedIterator(triples, (t) => this.delete(t)); }
  graphBaseFind(t) { return this._notifyingRemove(this._graphBaseFind(t)); }
  _graphBaseFind(t) { throw new JenaException('abstract'); }
  graphBaseContains(t) { return this._graphBaseFind(t).some((x) => t.matches(x)); }
  contains(s, p, o) {
    this._checkOpen();
    const t = s instanceof Triple ? s : Triple.createMatch(s, p, o);
    return this.graphBaseContains(t);
  }
}

function findList(g, t) { return g.find(t).toList(); }

/** Jena Dyadic: a composition of a left graph L and a right graph R. */
export class Dyadic extends CompositionBase {
  constructor(L, R) {
    super();
    this.L = L; this.R = R;
    this.getPrefixMapping().setNsPrefixes(L.getPrefixMapping()).setNsPrefixes(R.getPrefixMapping());
  }
  getL() { return this.L; }
  getR() { return this.R; }
  close() { this.L.close(); this.R.close(); super.close(); }
  union(X) { return new Union(this, X); }
  dependsOn(other) { return other === this || this.L.dependsOn(other) || this.R.dependsOn(other); }
}

/** Jena Union: add goes to L; delete from both; find is L then the R triples not seen in L. */
export class Union extends Dyadic {
  performAdd(t) { this.L.add(t); }
  performDelete(t) { this.L.delete(t); this.R.delete(t); }
  graphBaseContains(t) { return this.L.contains(t) || this.R.contains(t); }
  _graphBaseFind(t) {
    const seen = new JenaSet(findList(this.L, t));
    return [...seen].concat(findList(this.R, t).filter((x) => !seen.contains(x)));
  }
}

/** Jena Intersection: add goes to both; delete from L (when in the intersection); find is L's triples that R contains. */
export class Intersection extends Dyadic {
  performAdd(t) { this.L.add(t); this.R.add(t); }
  performDelete(t) { if (this.contains(t)) this.L.delete(t); }
  _graphBaseFind(t) { return findList(this.L, t).filter((x) => this.R.contains(x)); }
}

/** Jena Difference: add goes to L and is deleted from R; delete from L; find is L's triples that R does not contain. */
export class Difference extends Dyadic {
  performAdd(t) { this.L.add(t); this.R.delete(t); }
  performDelete(t) { this.L.delete(t); }
  _graphBaseFind(t) { return findList(this.L, t).filter((x) => !this.R.contains(x)); }
}

/** Jena DisjointUnion: find is L then R (no duplicate check); add goes to L unless R has it; delete from both. */
export class DisjointUnion extends Dyadic {
  _graphBaseFind(t) { return findList(this.L, t).concat(findList(this.R, t)); }
  graphBaseContains(t) { return this.L.contains(t) || this.R.contains(t); }
  performDelete(t) { this.L.delete(t); this.R.delete(t); }
  performAdd(t) { if (!this.R.contains(t)) this.L.add(t); }
}

/** Jena Delta: a base graph with recorded additions and deletions; the base is not changed. */
export class Delta extends CompositionBase {
  constructor(base) {
    super();
    this._baseG = base;
    this._additions = new GraphMem();
    this._deletions = new GraphMem();
  }
  getAdditions() { return this._additions; }
  getDeletions() { return this._deletions; }
  performAdd(t) {
    if (!this._baseG.contains(t)) this._additions.add(t);
    this._deletions.delete(t);
  }
  performDelete(t) {
    this._additions.delete(t);
    if (this._baseG.contains(t)) this._deletions.add(t);
  }
  _graphBaseFind(t) {
    return findList(this._baseG, t).filter((x) => !this._deletions.contains(x)).concat(findList(this._additions, t));
  }
  size() { this._checkOpen(); return this._baseG.size() + this._additions.size() - this._deletions.size(); }
  close() { super.close(); this._baseG.close(); this._additions.close(); this._deletions.close(); }
}

/** Jena Polyadic: a composition of a list of graphs, one of which may be the base (updatable) graph. */
export class Polyadic extends CompositionBase {
  constructor(graphs) {
    super();
    this.m_subGraphs = [];
    this.m_baseGraph = null;
    if (graphs) {
      const list = Array.isArray(graphs) ? graphs : (graphs instanceof ExtendedIterator ? graphs.toList() : [...graphs]);
      for (const g of list) this.m_subGraphs.push(g);
      if (graphs && typeof graphs.close === 'function') graphs.close();
    }
    this._pmBase = new PolyadicPrefixMappingImpl(this);
  }
  close() { for (const g of this.m_subGraphs) g.close(); super.close(); }
  dependsOn(other) { return other === this || this.m_subGraphs.some((g) => g.dependsOn(other)); }
  addGraph(g) { this.m_subGraphs.push(g); }
  removeGraph(g) {
    const i = this.m_subGraphs.indexOf(g);
    if (i >= 0) this.m_subGraphs.splice(i, 1);
    if (this.m_baseGraph === g) this.m_baseGraph = null;
  }
  getBaseGraph() {
    if (this.m_baseGraph === null) return this.m_subGraphs.length === 0 ? null : this.m_subGraphs[0];
    return this.m_baseGraph;
  }
  getRequiredBaseGraph() {
    const b = this.getBaseGraph();
    if (b === null) throw new JenaException('This polyadic graph should have a base graph, but none is defined');
    return b;
  }
  setBaseGraph(g) {
    if (!this.m_subGraphs.includes(g)) throw new TypeError('The updateable graph must be one of the graphs from the composition');
    this.m_baseGraph = g;
  }
  /** The graphs other than the base graph. */
  getSubGraphs() { const b = this.getBaseGraph(); return this.m_subGraphs.filter((g) => g !== b); }
  getTransactionHandler() {
    const b = this.getBaseGraph();
    return b === null ? super.getTransactionHandler() : b.getTransactionHandler();
  }
}

/** Jena MultiUnion: the union of a list of graphs; add and delete go to the base graph. */
export class MultiUnion extends Polyadic {
  performAdd(t) { this.getRequiredBaseGraph().add(t); }
  performDelete(t) { this.getRequiredBaseGraph().delete(t); }
  graphBaseContains(t) { return this.m_subGraphs.some((g) => g.contains(t)); }
  _graphBaseFind(t) {
    if (this.m_subGraphs.length === 1) return findList(this.m_subGraphs[0], t);
    const seen = new JenaSet();
    const out = [];
    for (const g of this.m_subGraphs) for (const x of findList(g, t)) if (seen.add(x)) out.push(x);
    return out;
  }
  addGraph(g) { if (!this.m_subGraphs.includes(g)) this.m_subGraphs.push(g); }
}

/**
 * Jena PolyadicPrefixMappingImpl: the prefix mapping of a Polyadic graph. Writes
 * go to the base graph's mapping (or to a pending mapping while there is no
 * base graph). Reads look at the base mapping first, then at each sub-graph's
 * in order; a sub-graph's default ("") prefix is not seen through the
 * composition, and the sizes are the base mapping's.
 */
export class PolyadicPrefixMappingImpl extends PrefixMappingImpl {
  constructor(poly) { super(); this._poly = poly; this._pending = new PrefixMappingImpl(); }
  _base() { const b = this._poly.getBaseGraph(); return b ? b.getPrefixMapping() : this._pending; }
  _subs() { return this._poly.getSubGraphs().map((g) => g.getPrefixMapping()); }
  /** The base mapping's answer, or else the first sub-graph answer that `ok` accepts. */
  _lookup(ask, miss, ok) {
    const s = ask(this._base());
    if (!miss(s)) return s;
    for (const pm of this._subs()) { const x = ask(pm); if (ok(x)) return x; }
    return s;
  }
  setNsPrefix(prefix, uri) { this._checkUnlocked(); this._base().setNsPrefix(prefix, uri); return this; }
  removeNsPrefix(prefix) { this._checkUnlocked(); this._base().removeNsPrefix(prefix); return this; }
  clearNsPrefixMap() { this._checkUnlocked(); this._base().clearNsPrefixMap(); return this; }
  setNsPrefixes(other) { this._checkUnlocked(); this._base().setNsPrefixes(other); return this; }
  getNsPrefixURI(prefix) {
    if (prefix === '') return this._base().getNsPrefixURI(prefix);
    return this._lookup((pm) => pm.getNsPrefixURI(prefix), (s) => s === null, (x) => x !== null);
  }
  getNsURIPrefix(uri) {
    return this._lookup((pm) => pm.getNsURIPrefix(uri), (s) => s === null, (x) => x !== null && x !== '');
  }
  /** Every mapping: the sub-graphs' (earlier ones win, no default prefix), then the base mapping's over them. */
  getNsPrefixMap() {
    const out = new Map();
    for (const pm of this._subs().reverse()) for (const [p, u] of pm.getNsPrefixMap()) out.set(p, u);
    out.delete('');
    for (const [p, u] of this._base().getNsPrefixMap()) out.set(p, u);
    return out;
  }
  expandPrefix(prefixed) {
    return this._lookup((pm) => pm.expandPrefix(prefixed), (s) => s === prefixed, (x) => x !== prefixed);
  }
  shortForm(uri) {
    return this._lookup((pm) => pm.shortForm(uri), (s) => s === uri, (x) => x !== uri);
  }
  qnameFor(uri) {
    return this._lookup((pm) => pm.qnameFor(uri), (s) => s === null, (x) => x !== null);
  }
  hasNoMappings() { return this._base().hasNoMappings(); }
  numPrefixes() { return this._base().numPrefixes(); }
  forEach(fn) { for (const [p, u] of this.getNsPrefixMap()) fn(p, u); }
  toString() { return '<polyadic prefix map>'; }
}
