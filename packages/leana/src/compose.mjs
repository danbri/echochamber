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
 * go to the base graph's mapping; reads look at the base graph's mapping, then
 * at each sub-graph's.
 */
export class PolyadicPrefixMappingImpl extends PrefixMappingImpl {
  constructor(poly) { super(); this._poly = poly; }
  _base() { const b = this._poly.getBaseGraph(); return b ? b.getPrefixMapping() : null; }
  _all() {
    const b = this._base();
    const subs = this._poly.getSubGraphs().map((g) => g.getPrefixMapping());
    return b ? [b, ...subs] : subs;
  }
  _writable() { const b = this._base(); return b || this._local(); }
  _local() { if (!this._own) this._own = new PrefixMappingImpl(); return this._own; }
  setNsPrefix(prefix, uri) { this._checkUnlocked(); this._writable().setNsPrefix(prefix, uri); return this; }
  removeNsPrefix(prefix) { this._checkUnlocked(); this._writable().removeNsPrefix(prefix); return this; }
  clearNsPrefixMap() { this._checkUnlocked(); this._writable().clearNsPrefixMap(); return this; }
  getNsPrefixURI(prefix) {
    for (const pm of this._all()) { const u = pm.getNsPrefixURI(prefix); if (u !== null && u !== undefined) return u; }
    return null;
  }
  /** Every mapping, the sub-graphs' first and the base graph's over them. */
  getNsPrefixMap() {
    const out = new Map();
    const all = this._all();
    for (const pm of all.slice(1).reverse()) for (const [p, u] of pm.getNsPrefixMap()) out.set(p, u);
    if (all.length) for (const [p, u] of all[0].getNsPrefixMap()) out.set(p, u);
    return out;
  }
  getNsURIPrefix(uri) {
    for (const pm of this._all()) { const p = pm.getNsURIPrefix(uri); if (p !== null && p !== undefined) return p; }
    return null;
  }
  shortForm(uri) {
    for (const [p, ns] of this.getNsPrefixMap()) if (uri.startsWith(ns)) return p + ':' + uri.substring(ns.length);
    return uri;
  }
  hasNoMappings() { return this.getNsPrefixMap().size === 0; }
  numPrefixes() { return this.getNsPrefixMap().size; }
  forEach(fn) { for (const [p, u] of this.getNsPrefixMap()) fn(p, u); }
  toString() { return 'pm:' + JSON.stringify(Object.fromEntries(this.getNsPrefixMap())); }
}
