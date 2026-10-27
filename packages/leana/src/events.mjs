// leana: graph and model events.
//
// API modelled on Apache Jena org.apache.jena.graph.{GraphEventManager,
// GraphEvents, GraphListener}, org.apache.jena.graph.impl.SimpleEventManager,
// org.apache.jena.rdf.model.ModelChangedListener and
// org.apache.jena.rdf.listeners.{StatementListener, ObjectListener,
// ChangedListener, NullListener} (Apache License 2.0). No Jena code is copied.
// Events are bookkeeping in JavaScript: no RDF semantics.

/** java.util.List stand-in: an Array that Jena-style overloads read as a List, not as an array. */
export class ArrayList extends Array {
  static of(...xs) { const a = new ArrayList(); a.push(...xs); return a; }
  static from(xs) { const a = new ArrayList(); for (const x of xs) a.push(x); return a; }
  size() { return this.length; }
  get(i) { return this[i]; }
  isEmpty() { return this.length === 0; }
  contains(x) { return this.some((y) => (y && typeof y.equals === 'function' ? y.equals(x) : y === x)); }
  equals(o) {
    if (!o || typeof o.length !== 'number' || o.length !== this.length) return false;
    for (let i = 0; i < this.length; i++) {
      const a = this[i], b = o[i];
      if (!(a && typeof a.equals === 'function' ? a.equals(b) : a === b)) return false;
    }
    return true;
  }
}

/** Jena GraphEvents: a titled event value. */
export class GraphEvents {
  constructor(title, content) { this._title = title; this._content = content; }
  getTitle() { return this._title; }
  getContent() { return this._content; }
  /** A fluid triple relevant to the event, or null. */
  getTriple() { return this._triple === undefined ? null : this._triple; }
  equals(o) {
    if (o === this) return true;
    if (!(o instanceof GraphEvents) || o._title !== this._title) return false;
    const a = this._content, b = o._content;
    return a && typeof a.equals === 'function' ? a.equals(b) : a === b;
  }
  hashKey() { return 'GE' + this._title + ':' + (this._content && this._content.hashKey ? this._content.hashKey() : String(this._content)); }
  toString() { return '<GE ' + this._title + '>'; }
  /** GraphEvents.remove(s, p, o): the event of Graph.remove(s, p, o); its triple is the fluid match triple. */
  static remove(s, p, o) {
    // Triple is imported lazily to avoid a module cycle (node.mjs does not import events.mjs).
    const t = GraphEvents._createMatch(s, p, o);
    const e = new GraphEvents('remove', t);
    e._triple = t;
    return e;
  }
}
GraphEvents._createMatch = null; // set by graph.mjs (Triple.createMatch)

/**
 * Jena SimpleEventManager: listeners in registration order (a listener may be
 * registered more than once); each notify* call is passed to every listener
 * that has the method.
 */
export class GraphEventManager {
  constructor() { this._listeners = []; }
  register(listener) { this._listeners.push(listener); return this; }
  /** Remove one registration equal to `listener` (equals(), or identity). */
  unregister(listener) {
    const i = this._listeners.findIndex((l) => l === listener || (l && typeof l.equals === 'function' && l.equals(listener)));
    if (i >= 0) this._listeners.splice(i, 1);
    return this;
  }
  listening() { return this._listeners.length > 0; }
  _each(method, args) {
    for (const l of this._listeners.slice()) if (l && typeof l[method] === 'function') l[method](...args);
  }
  notifyAddTriple(g, t) { this._each('notifyAddTriple', [g, t]); }
  notifyAddArray(g, ts) { this._each('notifyAddArray', [g, ts]); }
  notifyAddList(g, ts) { this._each('notifyAddList', [g, ts]); }
  /** Jena passes the materialised list of triples (notifyAddIterator(Graph, List)). */
  notifyAddIterator(g, ts) { this._each('notifyAddIterator', [g, ArrayList.from(ts)]); }
  notifyAddGraph(g, added) { this._each('notifyAddGraph', [g, added]); }
  notifyDeleteTriple(g, t) { this._each('notifyDeleteTriple', [g, t]); }
  notifyDeleteArray(g, ts) { this._each('notifyDeleteArray', [g, ts]); }
  notifyDeleteList(g, ts) { this._each('notifyDeleteList', [g, ts]); }
  notifyDeleteIterator(g, ts) { this._each('notifyDeleteIterator', [g, ArrayList.from(ts)]); }
  notifyDeleteGraph(g, removed) { this._each('notifyDeleteGraph', [g, removed]); }
  notifyEvent(source, event) { this._each('notifyEvent', [source, event]); }
}

/** Jena GraphListener with every method a no-op (subclass and override). */
export class GraphListenerBase {
  notifyAddTriple() {}
  notifyAddArray() {}
  notifyAddList() {}
  notifyAddIterator() {}
  notifyAddGraph() {}
  notifyDeleteTriple() {}
  notifyDeleteArray() {}
  notifyDeleteList() {}
  notifyDeleteIterator() {}
  notifyDeleteGraph() {}
  notifyEvent() {}
}

/**
 * Jena ModelListenerAdapter: a GraphListener that passes graph events to a
 * ModelChangedListener as statements of `model`. Two adapters are equal when
 * their model and listener are (so Model.unregister finds the registration).
 */
export class ModelListenerAdapter {
  constructor(model, listener) { this.m = model; this.L = listener; }
  _st(t) { return this.m.asStatement(t); }
  _sts(ts) { return ts.map((t) => this._st(t)); }
  _call(method, arg) { if (typeof this.L[method] === 'function') this.L[method](arg); }
  notifyAddTriple(g, t) { this._call('addedStatement', this._st(t)); }
  notifyAddArray(g, ts) { this._call('addedStatements', [...ts].map((t) => this._st(t))); }
  notifyAddList(g, ts) { this._call('addedStatements', ArrayList.from(this._sts([...ts]))); }
  notifyAddIterator(g, ts) { this._call('addedStatements', this.m._stmtIterator(this._sts([...ts]))); }
  notifyAddGraph(g, added) { this._call('addedStatements', this.m._asModel(added)); }
  notifyDeleteTriple(g, t) { this._call('removedStatement', this._st(t)); }
  notifyDeleteArray(g, ts) { this._call('removedStatements', [...ts].map((t) => this._st(t))); }
  notifyDeleteList(g, ts) { this._call('removedStatements', ArrayList.from(this._sts([...ts]))); }
  notifyDeleteIterator(g, ts) { this._call('removedStatements', this.m._stmtIterator(this._sts([...ts]))); }
  notifyDeleteGraph(g, removed) { this._call('removedStatements', this.m._asModel(removed)); }
  notifyEvent(g, event) { if (typeof this.L.notifyEvent === 'function') this.L.notifyEvent(this.m, event); }
  equals(o) { return o instanceof ModelListenerAdapter && o.m === this.m && o.L === this.L; }
}

function statementsOf(x) {
  if (Array.isArray(x)) return [...x];
  if (x && typeof x.listStatements === 'function') return x.listStatements().toList();
  if (x && typeof x.toList === 'function') return x.toList();
  return [...x];
}

/** Jena StatementListener: every bulk event becomes addedStatement / removedStatement calls. */
export class StatementListener {
  addedStatement() {}
  removedStatement() {}
  addedStatements(x) { for (const s of statementsOf(x)) this.addedStatement(s); }
  removedStatements(x) { for (const s of statementsOf(x)) this.removedStatement(s); }
  notifyEvent() {}
}

/** Jena NullListener: ignores every event. */
export class NullListener {
  addedStatement() {}
  addedStatements() {}
  removedStatement() {}
  removedStatements() {}
  notifyEvent() {}
}

/** Jena ObjectListener: every event becomes added(Object) / removed(Object) with the event's argument. */
export class ObjectListener {
  added() {}
  removed() {}
  addedStatement(s) { this.added(s); }
  addedStatements(x) { this.added(x); }
  removedStatement(s) { this.removed(s); }
  removedStatements(x) { this.removed(x); }
  notifyEvent() {}
}

/** Jena ChangedListener: hasChanged() is true after any add or remove event. */
export class ChangedListener {
  constructor() { this._changed = false; }
  _set() { this._changed = true; }
  addedStatement() { this._set(); }
  addedStatements() { this._set(); }
  removedStatement() { this._set(); }
  removedStatements() { this._set(); }
  notifyEvent() {}
  hasChanged() { const r = this._changed; this._changed = false; return r; }
}
