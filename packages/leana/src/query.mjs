// leana: SPARQL query and update in the style of Apache Jena ARQ.
//
// API modelled on Apache Jena org.apache.jena.query.{Query, QueryFactory,
// Syntax, QueryExecution, QueryExecutionFactory, QueryExecutionDatasetBuilder,
// ResultSet, ResultSetFactory, ResultSetRewindable, ResultSetFormatter,
// QuerySolution, QuerySolutionMap, QueryParseException, QueryExecException},
// org.apache.jena.update.{UpdateFactory, UpdateRequest, UpdateExecution,
// UpdateExecutionFactory, UpdateAction} and
// org.apache.jena.sparql.function.{FunctionRegistry, FunctionBase, NodeValue}
// (Apache License 2.0). No Jena code is copied.
//
// Every query and update is evaluated by @factoidal/core (Dataset.query,
// Dataset.update), which answers a Promise: execSelect(), execAsk(),
// execConstruct(), execDescribe(), UpdateExecution.execute() and the
// ResultSetFormatter writers answer a Promise (Jena's are synchronous).
// leana does not parse SPARQL: QueryFactory.create keeps the text, and a
// syntax error is a QueryParseException when the query runs. The Query object
// model (form, variables, serialization), syntax substitution, timeouts and
// property functions are gap 'query' (danbri/factoidal#1089).
//
// Initial bindings are a trailing VALUES clause (SPARQL 1.1 section 10.2.2;
// the engine evaluates it). Results come from the engine as RDF/JS terms
// (SPARQL 1.2 mode) or, for SELECT in SPARQL 1.1 mode, as the SPARQL 1.1
// Query Results JSON Format, which also gives the variables of an empty
// result. Formatted results (text, JSON, XML, CSV, TSV) are written by the
// engine (Dataset.query `output`), by running the query again on a snapshot
// of the data taken when it first ran.

import { registerExtensionFunction, unregisterExtensionFunction, FactoidalError, dataFactory as df } from '@factoidal/core';
import { Node, NodeFactory, Triple, fromRDFJS } from './node.mjs';
import { GraphMem, ExtendedIterator, DEFAULT_GRAPH, tripleOf } from './graph.mjs';
import { Model, RDFNode } from './model.mjs';
import { Dataset, DatasetGraph, DatasetFactory, Context, Quad } from './dataset.mjs';
import { newDataset } from './engine.mjs';
import { readFileSync } from 'node:fs';
import { JenaException, NoSuchElementException, unsupported } from './errors.mjs';
import { LangImpl, RDFFormat } from './riot.mjs';

// ---------------------------------------------------------------------------
// Exceptions (Jena org.apache.jena.query / org.apache.jena.update)

export class QueryException extends JenaException {}
export class QueryParseException extends QueryException {
  constructor(message, opts = {}) {
    super(message, opts);
    const pos = opts.cause && opts.cause.position;
    this._line = pos ? pos.line : -1; this._col = pos ? pos.column : -1;
  }
  getLine() { return this._line; }
  getColumn() { return this._col; }
}
export class QueryExecException extends QueryException {}
export class QueryCancelledException extends QueryExecException {}
export class QueryBuildException extends QueryException {}
export class UpdateException extends JenaException {}
export class UpdateParseException extends UpdateException {}
export class ExprEvalException extends QueryExecException {}

function queryError(e) {
  if (!(e instanceof FactoidalError)) return e;
  if (e.code === 'query.syntax') return new QueryParseException(e.message, { cause: e });
  return new QueryExecException(e.message, { cause: e });
}
function updateError(e) {
  if (!(e instanceof FactoidalError)) return e;
  if (e.code === 'update.syntax' || e.code === 'query.syntax') return new UpdateParseException(e.message, { cause: e });
  return new UpdateException(e.message, { cause: e });
}

// ---------------------------------------------------------------------------
// Syntax and Query

class SyntaxImpl {
  constructor(name, version) { this._name = name; this.version = version; Object.freeze(this); }
  getSymbol() { return this._name; }
  toString() { return this._name; }
}
/** Jena Syntax. SPARQL 1.1 runs in the engine's 1.1 mode; SPARQL 1.2 and ARQ in its 1.2 mode (ARQ's own extensions are not in the engine). */
export const Syntax = Object.freeze({
  syntaxSPARQL_10: new SyntaxImpl('http://jena.hpl.hp.com/2003/07/query/SPARQL_10', '1.1'),
  syntaxSPARQL_11: new SyntaxImpl('http://jena.hpl.hp.com/2003/07/query/SPARQL_11', '1.1'),
  syntaxSPARQL_12: new SyntaxImpl('http://jena.hpl.hp.com/2003/07/query/SPARQL_12', '1.2'),
  syntaxARQ: new SyntaxImpl('http://jena.hpl.hp.com/2003/07/query/ARQ', '1.2'),
  get syntaxSPARQL() { return Syntax.syntaxSPARQL_12; },
  get defaultSyntax() { return Syntax.syntaxSPARQL_12; },
  get defaultQuerySyntax() { return Syntax.syntaxSPARQL_12; },
  get defaultUpdateSyntax() { return Syntax.syntaxSPARQL_12; },
  lookup(name) {
    const n = String(name).toLowerCase();
    if (n === 'sparql_11' || n === 'sparql11' || n === 'sparql 1.1') return Syntax.syntaxSPARQL_11;
    if (n === 'sparql_10' || n === 'sparql10') return Syntax.syntaxSPARQL_10;
    if (n === 'sparql_12' || n === 'sparql12' || n === 'sparql') return Syntax.syntaxSPARQL_12;
    if (n === 'arq') return Syntax.syntaxARQ;
    return null;
  },
});

/**
 * Jena Query: here the query text with its base IRI and syntax. The object
 * model (form, variables, modifiers, serialization) is gap 'query'.
 */
export class Query {
  constructor(text = null, base = null, syntax = Syntax.defaultQuerySyntax) {
    this._text = text === null ? null : String(text);
    this._base = base; this._syntax = syntax || Syntax.defaultQuerySyntax;
  }
  getSyntax() { return this._syntax; }
  setSyntax(s) { this._syntax = s; }
  getBaseURI() { return this._base; }
  setBaseURI(b) { this._base = b; }
  /** The query text (Jena serializes its syntax tree; leana answers the text it was given). */
  toString() { return this._text ?? ''; }
  /** The text that runs: the base as a BASE declaration in front (a later BASE in the text still applies to what follows it). */
  _runText() {
    if (this._text === null) throw new QueryException('Query has no text');
    return this._base ? `BASE <${this._base}>\n${this._text}` : this._text;
  }
  cloneQuery() { return new Query(this._text, this._base, this._syntax); }
  equals(o) { return o instanceof Query && o._text === this._text && o._base === this._base; }
  hashCode() { return 'Q' + this._text; }
  serialize() { return unsupported('Query.serialize (query syntax tree)', 'query'); }
  isSelectType() { return unsupported('Query.isSelectType and the query form', 'query'); }
  isAskType() { return unsupported('Query.isSelectType and the query form', 'query'); }
  isConstructType() { return unsupported('Query.isSelectType and the query form', 'query'); }
  isDescribeType() { return unsupported('Query.isSelectType and the query form', 'query'); }
  queryType() { return unsupported('Query.isSelectType and the query form', 'query'); }
  getResultVars() { return unsupported('Query.getResultVars / getProjectVars', 'query'); }
  getProjectVars() { return unsupported('Query.getResultVars / getProjectVars', 'query'); }
  getQueryPattern() { return unsupported('Query.getQueryPattern (syntax tree)', 'query'); }
  setQueryPattern() { return unsupported('Query.getQueryPattern (syntax tree)', 'query'); }
  getValuesData() { return unsupported('Query.getQueryPattern (syntax tree)', 'query'); }
  setValuesDataBlock() { return unsupported('Query.getQueryPattern (syntax tree)', 'query'); }
  getPrefixMapping() { return unsupported('Query.getPrefixMapping (syntax tree)', 'query'); }
  setLimit() { return unsupported('Query.setLimit / setOffset / setDistinct (syntax tree)', 'query'); }
  setOffset() { return unsupported('Query.setLimit / setOffset / setDistinct (syntax tree)', 'query'); }
  setDistinct() { return unsupported('Query.setLimit / setOffset / setDistinct (syntax tree)', 'query'); }
  getLimit() { return unsupported('Query.setLimit / setOffset / setDistinct (syntax tree)', 'query'); }
  addResultVar() { return unsupported('Query.setLimit / setOffset / setDistinct (syntax tree)', 'query'); }
}

/** Jena QueryFactory. create() keeps the text; it is parsed by the engine when it runs (gap 'query'). */
export const QueryFactory = Object.freeze({
  /** create(text) | create(text, Syntax) | create(text, base) | create(text, base, Syntax) | create(Query) (a copy). */
  create(text, a, b) {
    if (text instanceof Query) return text.cloneQuery();
    if (text === undefined) return new Query();
    let base = null, syntax = Syntax.defaultQuerySyntax;
    if (a instanceof SyntaxImpl) syntax = a; else if (a !== undefined && a !== null) base = String(a);
    if (b instanceof SyntaxImpl) syntax = b;
    return new Query(text, base, syntax);
  },
  make() { return new Query(); },
  /** Jena createElement: a group graph pattern as a syntax tree (gap 'query'). */
  createElement() { return unsupported('QueryFactory.createElement (query pattern syntax tree)', 'query'); },
  parse(query, text, base, syntax) {
    query._text = String(text); if (base) query._base = base; if (syntax) query._syntax = syntax;
    return query;
  },
  /** read(path[, base][, Syntax]): the query text of a file. */
  read(path, base, syntax) { return QueryFactory.create(readText(path), base, syntax); },
});

function readText(path) {
  const p = String(path).replace(/^file:(\/\/)?/, '');
  try { return readFileSync(p, 'utf8'); } catch (e) { throw new QueryException('Not found: ' + path, { cause: e }); }
}

// ---------------------------------------------------------------------------
// Terms: SPARQL 1.1 Query Results JSON (section 3.2.2) and SPARQL text

/** A Node from one SRJ RDF term (also the shape of an extension-function argument). */
function nodeOfJson(t) {
  switch (t.type) {
    case 'uri': return NodeFactory.createURI(t.value);
    case 'bnode': return NodeFactory.createBlankNode(t.value);
    case 'literal':
    case 'typed-literal': {
      const lang = t['xml:lang'];
      const dir = t['its:dir'];
      if (lang && dir) return NodeFactory.createLiteralDirLang(t.value, lang, dir);
      if (lang) return NodeFactory.createLiteralLang(t.value, lang);
      if (t.datatype) return NodeFactory.createLiteralDT(t.value, t.datatype);
      return NodeFactory.createLiteralString(t.value);
    }
    case 'triple': {
      const v = t.value;
      return NodeFactory.createTripleTerm(nodeOfJson(v.subject), nodeOfJson(v.predicate), nodeOfJson(v.object));
    }
    default: throw new QueryExecException('leana: no Node for a result term of type ' + t.type);
  }
}

/** An SRJ-shaped term (the engine's extension-function shape) for a Node. */
function jsonOfNode(n) {
  if (n.isURI()) return { type: 'uri', value: n.getURI() };
  if (n.isBlank()) return { type: 'bnode', value: n.getBlankNodeLabel() };
  if (n.isLiteral()) {
    const lang = n.getLiteralLanguage();
    if (lang) return { type: 'literal', value: n.getLiteralLexicalForm(), 'xml:lang': lang };
    return { type: 'literal', value: n.getLiteralLexicalForm(), datatype: n.getLiteralDatatypeURI() };
  }
  throw new QueryExecException('leana: an extension function cannot answer ' + n);
}

/** A term in SPARQL syntax for a VALUES row: the engine's N-Triples form of the term. */
function sparqlTerm(n) {
  if (n.isBlank()) return unsupported('initial binding of a blank node (SPARQL VALUES has no blank nodes)', 'query');
  if (n.isVariable() || n === Node.ANY) throw new QueryException('initial binding to a variable: ' + n);
  // The engine writes the term (N-Triples term syntax is SPARQL term syntax for IRIs, literals and triple terms).
  const ds = newDataset();
  const S = '<urn:x-leana:s> <urn:x-leana:p> ';
  try {
    ds.add(df.quad(df.namedNode('urn:x-leana:s'), df.namedNode('urn:x-leana:p'), n.toRDFJS(), DEFAULT_GRAPH));
    const line = ds.toString({ format: 'ntriples' }).trim();
    return line.slice(S.length, line.length - 1).trim();
  } finally {
    ds.dispose();
  }
}

/** The query text with initial bindings as a trailing VALUES clause. */
function withValues(text, qsm) {
  if (!qsm || qsm.size() === 0) return text;
  const names = [...qsm._m.keys()];
  const row = names.map((k) => sparqlTerm(asNode(qsm._m.get(k))));
  return `${text}\nVALUES (${names.map((k) => '?' + k).join(' ')}) { (${row.join(' ')}) }`;
}

function asNode(x) {
  if (x instanceof Node) return x;
  if (x instanceof RDFNode) return x.asNode();
  throw new TypeError('not an RDFNode or Node: ' + x);
}

// ---------------------------------------------------------------------------
// The data a query or update runs on

/** A core Dataset holding the default graph `g` (a copy: a Graph's store may be a view of a larger dataset). */
function coreOfGraph(g) {
  const ds = newDataset();
  for (const t of g.find().toList()) ds.add(df.quad(t.getSubject().toRDFJS(), t.getPredicate().toRDFJS(), t.getObject().toRDFJS(), DEFAULT_GRAPH));
  return ds;
}

/**
 * Where a query runs: { model, dataset, core(): {ds, temp}, writeBack(ds) }.
 * Model and Graph: a copy of the graph; Dataset and DatasetGraph: the
 * dataset's quads (in place for the in-memory dataset).
 */
function sourceOf(x) {
  if (x instanceof Model) {
    const g = x.getGraph();
    return {
      model: x, dataset: null,
      core: () => ({ ds: coreOfGraph(g), temp: true }),
      writeBack: (ds) => syncGraph(g, ds),
    };
  }
  if (x instanceof Dataset || x instanceof DatasetGraph) {
    const dsg = x instanceof Dataset ? x.asDatasetGraph() : x;
    const dataset = x instanceof Dataset ? x : DatasetFactory.wrap(dsg);
    return {
      model: null, dataset,
      core: () => dsg._coreDatasetSync(),
      writeBack: (ds) => dsg._afterUpdate(ds),
    };
  }
  if (x && typeof x.find === 'function' && typeof x.add === 'function') return sourceOf(new Model(x));
  throw new TypeError('a query runs on a Model, a Graph, a Dataset or a DatasetGraph');
}

/** Make graph `g` hold the default graph of core Dataset `ds` (add and delete through the Graph API, so listeners hear them). */
function syncGraph(g, ds) {
  const want = [];
  for (const q of ds) if (q.graph.termType === 'DefaultGraph') want.push(tripleOf(q));
  const keep = new Set(want.map((t) => t.hashKey()));
  for (const t of g.find().toList()) if (!keep.has(t.hashKey())) g.delete(t);
  for (const t of want) if (!g.contains(t)) g.add(t);
}

/** A Model whose store is the core Dataset `ds` (a CONSTRUCT or DESCRIBE answer), or `ds` added into `into`. */
function modelOfCore(ds, into = null) {
  if (into) {
    for (const q of ds) if (q.graph.termType === 'DefaultGraph') into.getGraph().add(tripleOf(q));
    ds.dispose();
    return into;
  }
  const g = new GraphMem();
  g._ds.dispose();
  g._ds = ds;
  return new Model(g);
}

// ---------------------------------------------------------------------------
// Extension functions are registered with the engine asynchronously; a query waits for them.

const pendingRegistrations = new Set();
function track(p) {
  pendingRegistrations.add(p);
  p.finally(() => pendingRegistrations.delete(p)).catch(() => {});
  return p;
}
async function functionsReady() {
  if (pendingRegistrations.size) await Promise.all([...pendingRegistrations]);
}

// ---------------------------------------------------------------------------
// QuerySolution, QuerySolutionMap, ResultSet

function stripQ(name) { const s = String(name); return s.startsWith('?') || s.startsWith('$') ? s.slice(1) : s; }

/** Jena QuerySolution: one row; terms are RDFNodes of the result model. */
export class QuerySolution {
  constructor(row, model) { this._row = row; this._model = model; }
  get(name) {
    const n = this._row.get(stripQ(name));
    return n === undefined ? null : this._model.asRDFNode(n);
  }
  getResource(name) { const x = this.get(name); return x === null ? null : x.asResource(); }
  getLiteral(name) { const x = this.get(name); return x === null ? null : x.asLiteral(); }
  contains(name) { return this._row.has(stripQ(name)); }
  varNames() { return new ExtendedIterator([...this._row.keys()]); }
  /** The row as a Map from variable name to Node (Jena Binding). */
  asBinding() { return new Map(this._row); }
  toString() { return [...this._row].map(([k, v]) => `( ?${k} = ${v} )`).join(' '); }
}

/** Jena QuerySolutionMap: variable name to RDFNode. */
export class QuerySolutionMap {
  constructor() { this._m = new Map(); }
  add(name, node) { this._m.set(stripQ(name), node); }
  get(name) { return this._m.get(stripQ(name)) ?? null; }
  getResource(name) { const x = this.get(name); return x === null ? null : x.asResource(); }
  getLiteral(name) { const x = this.get(name); return x === null ? null : x.asLiteral(); }
  contains(name) { return this._m.has(stripQ(name)); }
  varNames() { return new ExtendedIterator([...this._m.keys()]); }
  asMap() { return new Map(this._m); }
  /** Jena asVarNodeMap: variable name to Node. */
  asVarNodeMap() { return new Map([...this._m].map(([k, v]) => [k, asNode(v)])); }
  addAll(other) {
    if (other instanceof QuerySolutionMap) for (const [k, v] of other._m) this._m.set(k, v);
    else if (other instanceof QuerySolution) for (const k of other._row.keys()) this._m.set(k, other.get(k));
    else if (other instanceof Map) for (const [k, v] of other) this._m.set(stripQ(k), v);
    return this;
  }
  clear() { this._m.clear(); }
  size() { return this._m.size; }
  isEmpty() { return this._m.size === 0; }
  toString() { return [...this._m].map(([k, v]) => `( ?${k} = ${v} )`).join(' '); }
}

const snapshots = new FinalizationRegistry((ds) => { try { ds.dispose(); } catch { /* already disposed */ } });

/**
 * Jena ResultSet over the rows of one SELECT. `vars` are the result
 * variables; `rerun(output)` (when the result set came from a query) has the
 * engine write the same results in a results format.
 */
export class ResultSet {
  constructor(vars, rows, model, rerun = null) {
    this._vars = vars; this._rows = rows; this._i = 0; this._model = model; this._rerun = rerun; this._closed = false;
  }
  hasNext() { return !this._closed && this._i < this._rows.length; }
  next() { return this.nextSolution(); }
  nextSolution() {
    if (!this.hasNext()) throw new NoSuchElementException('ResultSet.next');
    return new QuerySolution(this._rows[this._i++], this._model);
  }
  /** The next row as a Map from variable name to Node (Jena Binding). */
  nextBinding() {
    if (!this.hasNext()) throw new NoSuchElementException('ResultSet.next');
    return new Map(this._rows[this._i++]);
  }
  getRowNumber() { return this._i; }
  getResultVars() { return this._vars.slice(); }
  getResourceModel() { return this._model; }
  forEachRemaining(fn) { while (this.hasNext()) fn(this.next()); }
  close() { this._closed = true; }
  materialise() { return ResultSetFactory.copyResults(this); }
  /** Jena ResultSet.rewindable(): a rewindable copy of the rest (this is consumed). */
  rewindable() { return ResultSetFactory.copyResults(this); }
  [Symbol.iterator]() { const rs = this; return { next: () => (rs.hasNext() ? { value: rs.next(), done: false } : { value: undefined, done: true }) }; }
  /** The remaining rows, consumed. */
  _remaining() { const r = this._rows.slice(this._i); this._i = this._rows.length; return r; }
}

/** Jena ResultSetRewindable: a ResultSet that can be reset. It is also peekable (Jena ResultSetPeekable). */
export class ResultSetRewindable extends ResultSet {
  reset() { this._i = 0; this._closed = false; }
  size() { return this._rows.length; }
  rewindable() { return this; }
  peek() {
    if (!this.hasNext()) throw new NoSuchElementException('ResultSet.peek');
    return new QuerySolution(this._rows[this._i], this._model);
  }
  peekBinding() {
    if (!this.hasNext()) throw new NoSuchElementException('ResultSet.peek');
    return new Map(this._rows[this._i]);
  }
}

/** Jena ResultSetMem: an in-memory rewindable result set; new ResultSetMem() is empty (no variables, no rows). */
export class ResultSetMem extends ResultSetRewindable {
  constructor(rs = null) {
    if (rs === null) super([], [], new Model(), null);
    else super(rs.getResultVars(), rs._remaining(), rs.getResourceModel(), rs._rerun);
  }
}

/** java.lang.IllegalStateException. */
export class IllegalStateException extends JenaException {}

/**
 * Jena ResultSetPeeking: a peekable view of another result set, which
 * notices when the inner result set is moved independently.
 */
export class ResultSetPeeking {
  constructor(results) {
    if (!results) throw new TypeError('Inner result set cannot be null');
    this._rs = results; this._model = results.getResourceModel(); this._peeked = null; this._row = 0;
  }
  _hasPeeked() {
    const diff = this._rs.getRowNumber() - this._row;
    if (diff === 0) return false;
    if (diff === 1 && this._peeked !== null) return true;
    if (diff >= 1) { this._row = this._rs.getRowNumber(); this._peeked = null; return false; }
    throw new IllegalStateException('Underlying result set position has moved backwards, this result set is no longer usable');
  }
  hasNext() { return this._hasPeeked() ? true : this._rs.hasNext(); }
  next() { return new QuerySolution(this.nextBinding(), this._model); }
  nextSolution() { return this.next(); }
  nextBinding() {
    if (this._hasPeeked()) { const b = this._peeked; this._peeked = null; this._row++; return b; }
    if (this._rs.hasNext()) { const b = this.peekBinding(); this._peeked = null; this._row++; return b; }
    throw new NoSuchElementException('ResultSet.next');
  }
  peek() { return new QuerySolution(this.peekBinding(), this._model); }
  peekBinding() {
    if (this._hasPeeked()) return this._peeked;
    if (this._rs.hasNext()) { this._peeked = this._rs.nextBinding(); return this._peeked; }
    throw new NoSuchElementException('ResultSet.peek');
  }
  getRowNumber() { return this._hasPeeked() ? this._rs.getRowNumber() - 1 : this._rs.getRowNumber(); }
  getResultVars() { return this._rs.getResultVars(); }
  getResourceModel() { return this._model; }
  forEachRemaining(fn) { while (this.hasNext()) fn(this.next()); }
  close() { this._rs.close(); }
  _remaining() { const r = []; while (this.hasNext()) r.push(this.nextBinding()); return r; }
  get _vars() { return this._rs.getResultVars(); }
  get _rerun() { return null; }
}

const READ_RS = 'ResultSetFactory reading a results format (XML, JSON, CSV, TSV, Thrift)';

export const ResultSetFactory = Object.freeze({
  /** A rewindable copy of the rest of `rs` (rs is consumed). */
  copyResults(rs) {
    const rows = rs._remaining();
    return new ResultSetRewindable(rs.getResultVars(), rows, rs.getResourceModel(), rs._rerun);
  },
  makeRewindable(rs) { return ResultSetFactory.copyResults(rs); },
  makePeekable(rs) { return new ResultSetPeeking(rs); },
  /** Reading a results document: @factoidal/core has no results reader (gap 'query'). */
  fromXML() { return unsupported(READ_RS, 'query'); },
  fromJSON() { return unsupported(READ_RS, 'query'); },
  fromTSV() { return unsupported(READ_RS, 'query'); },
  load() { return unsupported(READ_RS, 'query'); },
  parse() { return unsupported(READ_RS, 'query'); },
  /** Jena closeableResultSet(qExec): run the SELECT (a Promise); close() closes the execution too. A non-SELECT is a QueryException. */
  async closeableResultSet(qe) {
    const rs = await qe.execSelect();
    const close = rs.close.bind(rs);
    rs.close = () => { close(); qe.close(); };
    return rs;
  },
  /** A result set from rows (Maps or objects of name to Node or RDFNode). */
  create(vars, rows, model = null) {
    const rs = rows.map((r) => new Map([...(r instanceof Map ? r : Object.entries(r))].map(([k, v]) => [stripQ(k), asNode(v)])));
    return new ResultSetRewindable(vars.map(stripQ), rs, model ?? new Model(), null);
  },
});

/** Jena ResultSetUtils.merge: the rows of rs1 then rs2 (both consumed); the variables must be the same. */
export const ResultSetUtils = Object.freeze({
  merge(rs1, rs2) {
    const v1 = rs1.getResultVars(), v2 = rs2.getResultVars();
    if (v1.length !== v2.length || !v1.every((v) => v2.includes(v))) throw new QueryException('Variables are not compatible');
    return new ResultSetRewindable(v1, [...rs1._remaining(), ...rs2._remaining()], rs1.getResourceModel(), null);
  },
});

const RS = 'urn:x-leana:rs:';

/**
 * The rows of a result set as a graph: one blank node per row, an arc per
 * binding (predicate: the variable), and with `ordered` the row index. Two
 * result sets match by term (blank nodes mapped consistently) exactly when
 * their graphs are isomorphic, which the engine decides.
 */
function rowsGraph(rows, ordered) {
  const g = new GraphMem();
  const top = NodeFactory.createURI(RS + 'results');
  rows.forEach((row, i) => {
    const r = NodeFactory.createBlankNode();
    g.add(Triple.create(top, NodeFactory.createURI(RS + 'row'), r));
    if (ordered) g.add(Triple.create(r, NodeFactory.createURI(RS + 'index'), NodeFactory.createLiteralString(String(i))));
    for (const [k, v] of row) g.add(Triple.create(r, NodeFactory.createURI(RS + 'v:' + encodeURIComponent(k)), v));
  });
  return g;
}

function sameHeader(rs1, rs2) {
  const a = rs1.getResultVars(), b = rs2.getResultVars();
  return a.length === b.length && a.every((v) => b.includes(v));
}

function rowKey(row) { return [...row].map(([k, v]) => k + '=' + v.toString()).sort().join('\u0000'); }

/**
 * Jena ResultsCompare. Destructive: both result sets are read to the end.
 * By term: blank nodes map one to one (graph isomorphism, decided by the
 * engine). By value: gap 'value-matching'.
 */
export const ResultsCompare = Object.freeze({
  equalsByTerm(rs1, rs2) {
    if (rs1 === rs2) return true;
    if (!sameHeader(rs1, rs2)) return false;
    const a = rs1._remaining(), b = rs2._remaining();
    return a.length === b.length && rowsGraph(a, false).isIsomorphicWith(rowsGraph(b, false));
  },
  equalsByTermAndOrder(rs1, rs2) {
    if (!sameHeader(rs1, rs2)) return false;
    const a = rs1._remaining(), b = rs2._remaining();
    return a.length === b.length && rowsGraph(a, true).isIsomorphicWith(rowsGraph(b, true));
  },
  /** Exact: blank nodes must have the same labels. */
  equalsExact(rs1, rs2) {
    if (!sameHeader(rs1, rs2)) return false;
    const a = rs1._remaining().map(rowKey).sort(), b = rs2._remaining().map(rowKey).sort();
    return a.length === b.length && a.every((k, i) => k === b[i]);
  },
  equalsByValue() { return unsupported('ResultsCompare.equalsByValue', 'value-matching'); },
  equalsByValueAndOrder() { return unsupported('ResultsCompare.equalsByValue', 'value-matching'); },
});

const RDF_RS = 'RDFOutput / RDFInput (a result set in the RDF result-set vocabulary)';
/** Jena RDFOutput and RDFInput (the DAWG result-set vocabulary): gap 'query'. */
export const RDFOutput = Object.freeze({ encodeAsModel() { return unsupported(RDF_RS, 'query'); }, encodeAsRDF() { return unsupported(RDF_RS, 'query'); } });
export const RDFInput = Object.freeze({ fromRDF() { return unsupported(RDF_RS, 'query'); } });

/**
 * The engine writes given rows: they become data (a blank node per row, an
 * index, an arc per binding) and a SELECT over that data reads them back in
 * order, written in `output` by the engine.
 */
async function writeRows(vars, rows, output) {
  const ds = newDataset();
  try {
    let q;
    if (vars.length === 0) {
      q = `SELECT * WHERE { VALUES () { ${'() '.repeat(rows.length)}} }`;
    } else {
      const pv = (k) => `<${RS}v:${encodeURIComponent(k)}>`;
      rows.forEach((row, i) => {
        const r = df.blankNode('x-leana-row-' + i);
        ds.add(df.quad(r, df.namedNode(RS + 'index'), df.literal(String(i).padStart(12, '0')), DEFAULT_GRAPH));
        for (const [k, v] of row) ds.add(df.quad(r, df.namedNode(RS + 'v:' + encodeURIComponent(k)), v.toRDFJS(), DEFAULT_GRAPH));
      });
      q = `SELECT ${vars.map((v) => '?' + v).join(' ')} WHERE { ?__r <${RS}index> ?__i ${vars.map((v) => `OPTIONAL { ?__r ${pv(v)} ?${v} }`).join(' ')} } ORDER BY ?__i`;
    }
    try { return await ds.query(q, { output }); } catch (e) { throw queryError(e); }
  } finally {
    ds.dispose();
  }
}

/**
 * Engine output of a result set, in one of the core results formats: a
 * result set from a SPARQL 1.1 query runs again on its snapshot; any other
 * (SPARQL 1.2 queries, rows made in code) is written from `rows`.
 */
async function formatted(rs, output, rows) {
  if (rs._rerun) return rs._rerun(output);
  return writeRows(rs._vars, rows, output);
}

function writeTo(out, text) {
  if (out && typeof out.write === 'function') out.write(text);
  else process.stdout.write(text);
}

/**
 * Jena ResultSetFormatter. The writers answer a Promise; the text is the
 * engine's (its text table is not Jena's layout). They consume the rest of
 * the result set, as in Jena, and write every row the query gave.
 */
export const ResultSetFormatter = Object.freeze({
  consume(rs) { let n = 0; while (rs.hasNext()) { rs.next(); n++; } return n; },
  toList(rs) { const xs = []; while (rs.hasNext()) xs.push(rs.next()); return xs; },
  async asText(rs) { return formatted(rs, 'table', rs._remaining()); },
  async out(out, rs) {
    if (rs === undefined) { rs = out; out = null; }
    if (typeof rs === 'boolean') { writeTo(out, (rs ? 'yes' : 'no') + '\n'); return; }
    writeTo(out, await ResultSetFormatter.asText(rs));
  },
  async asXMLString(rs) { return formatted(rs, 'xml', rs._remaining()); },
  async outputAsXML(out, rs) { if (rs === undefined) { rs = out; out = null; } writeTo(out, await ResultSetFormatter.asXMLString(rs)); },
  async outputAsJSON(out, rs) {
    if (rs === undefined) { rs = out; out = null; }
    const j = await formatted(rs, 'json', rs._remaining());
    writeTo(out, typeof j === 'string' ? j : JSON.stringify(j, null, 2));
  },
  async outputAsCSV(out, rs) { if (rs === undefined) { rs = out; out = null; } writeTo(out, await formatted(rs, 'csv', rs._remaining())); },
  async outputAsTSV(out, rs) { if (rs === undefined) { rs = out; out = null; } writeTo(out, await formatted(rs, 'tsv', rs._remaining())); },
  /** Jena output(out, rs, ResultsFormat): the result-set formats XML, JSON, CSV, TSV and text. */
  async output(out, rs, fmt) {
    if (rs && typeof rs.hasNext === 'function' && typeof rs.getResultVars !== 'function') {
      return unsupported('QueryExecution.execJson (ARQ JSON query form)', 'query');
    }
    const name = fmt instanceof ResultsFormatImpl ? fmt._engine : String(fmt && fmt.name ? fmt.name : fmt).toLowerCase();
    if (!name) return unsupported('ResultSetFormatter.output in an RDF syntax (result set as RDF)', 'query');
    const text = await formatted(rs, name === 'text' ? 'table' : name, rs._remaining());
    writeTo(out, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  },
});

/** Jena ResultSetLang: the result-set syntaxes (names only; the engine writes XML, JSON, CSV, TSV and text). */
export const ResultSetLang = Object.freeze({
  RS_XML: new LangImpl('SPARQL-Results-XML', 'SPARQL-Results-XML', null, null, ['SRX']),
  RS_JSON: new LangImpl('SPARQL-Results-JSON', 'SPARQL-Results-JSON', null, null, ['SRJ']),
  RS_CSV: new LangImpl('CSV', 'CSV', null, null),
  RS_TSV: new LangImpl('TSV', 'TSV', null, null),
  RS_Text: new LangImpl('SPARQL-Results-Text', 'SPARQL-Results-Text', null, null, ['TEXT']),
  RS_Thrift: new LangImpl('SPARQL-Results-Thrift', 'SPARQL-Results-Thrift', null, null, ['SRT']),
  RS_Protobuf: new LangImpl('SPARQL-Results-Protobuf', 'SPARQL-Results-Protobuf', null, null, ['SRP']),
  RS_None: new LangImpl('SPARQL-Results-None', 'SPARQL-Results-None', null, null),
});

const ENGINE_RS = new Map([[ResultSetLang.RS_XML, 'xml'], [ResultSetLang.RS_JSON, 'json'], [ResultSetLang.RS_CSV, 'csv'],
  [ResultSetLang.RS_TSV, 'tsv'], [ResultSetLang.RS_Text, 'table']]);

class ResultsFormatImpl {
  constructor(name, rsLang, triples, quads) {
    this.name = name; this._rs = rsLang; this._t = triples; this._q = quads;
    this._engine = rsLang ? (ENGINE_RS.get(rsLang) ?? null) : null;
    Object.freeze(this);
  }
  resultSetLang() { return this._rs; }
  triplesFormat() { return this._t; }
  quadsFormat() { return this._q; }
  isResultSet() { return this._rs !== null; }
  toString() { return this.name; }
}

const RF = {
  XML: new ResultsFormatImpl('XML', ResultSetLang.RS_XML, RDFFormat.RDFXML, null),
  JSON: new ResultsFormatImpl('JSON', ResultSetLang.RS_JSON, RDFFormat.JSONLD, RDFFormat.JSONLD),
  TEXT: new ResultsFormatImpl('TEXT', ResultSetLang.RS_Text, RDFFormat.TURTLE, RDFFormat.TRIG),
  CSV: new ResultsFormatImpl('CSV', ResultSetLang.RS_CSV, null, null),
  TSV: new ResultsFormatImpl('TSV', ResultSetLang.RS_TSV, null, null),
  THRIFT: new ResultsFormatImpl('THRIFT', ResultSetLang.RS_Thrift, null, null),
  PROTOBUF: new ResultsFormatImpl('PROTOBUF', ResultSetLang.RS_Protobuf, null, null),
  TTL: new ResultsFormatImpl('TTL', null, RDFFormat.TURTLE, null),
  NT: new ResultsFormatImpl('NT', null, RDFFormat.NTRIPLES, null),
  TRIG: new ResultsFormatImpl('TRIG', null, RDFFormat.TRIG, RDFFormat.TRIG),
  NQ: new ResultsFormatImpl('NQ', null, RDFFormat.NQUADS, RDFFormat.NQUADS),
  RDFXML: new ResultsFormatImpl('RDFXML', null, RDFFormat.RDFXML, null),
  JSONLD: new ResultsFormatImpl('JSONLD', null, RDFFormat.JSONLD, RDFFormat.JSONLD),
  COUNT: new ResultsFormatImpl('COUNT', null, null, null),
  NONE: new ResultsFormatImpl('NONE', ResultSetLang.RS_None, null, null),
  SSE: new ResultsFormatImpl('SSE', null, null, null),
};
// Jena's short names (ResultsFormat.lookup), compared ignoring case.
const RF_NAMES = new Map(Object.entries({
  srx: 'XML', srj: 'JSON', srt: 'THRIFT', srp: 'PROTOBUF', srpb: 'PROTOBUF', rt: 'THRIFT', trdf: 'THRIFT', rpb: 'PROTOBUF',
  pbrdf: 'PROTOBUF', rdfxml: 'RDFXML', xml: 'XML', json: 'JSON', rdf: 'TTL', ttl: 'TTL', turtle: 'TTL', trig: 'TRIG',
  'n-triples': 'NT', ntriples: 'NT', nt: 'NT', 'n-quads': 'NQ', nquads: 'NQ', nq: 'NQ', jsonld: 'JSONLD', 'json-ld': 'JSONLD',
  sse: 'SSE', csv: 'CSV', tsv: 'TSV', text: 'TEXT', txt: 'TEXT', count: 'COUNT', none: 'NONE',
}).map(([k, v]) => [k, RF[v]]));

/** Jena ResultsFormat: XML, JSON, ... and lookup(shortName). The FMT_* names are kept. */
export const ResultsFormat = Object.freeze({
  ...RF,
  FMT_RS_XML: RF.XML, FMT_RS_JSON: RF.JSON, FMT_RS_CSV: RF.CSV, FMT_RS_TSV: RF.TSV, FMT_TEXT: RF.TEXT,
  lookup(name) { return name === null || name === undefined ? null : RF_NAMES.get(String(name).toLowerCase()) ?? null; },
  values() { return Object.values(RF); },
  guessSyntax() { return unsupported('RDFLanguages.pathnameToLang', 'syntax-from-name'); },
});

/** Jena ResultsWriter (builder): the engine writes XML, JSON, CSV, TSV and text. Blank node label options are not kept. */
export const ResultsWriter = Object.freeze({
  create() {
    const b = { _lang: null, _cxt: null,
      lang(l) { b._lang = l; return b; },
      context(c) { b._cxt = c; return b; },
      build() { return b; },
      async write(out, rs) {
        const name = ENGINE_RS.get(b._lang);
        if (!name) return unsupported('ResultsWriter in a result-set syntax the engine does not write (Thrift, Protobuf)', 'query');
        const text = await formatted(rs, name, rs._remaining());
        writeTo(out, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
      },
    };
    return b;
  },
});

/** Jena ResultsReader and ResultSetMgr reading: @factoidal/core has no results reader (gap 'query'). */
export const ResultsReader = Object.freeze({
  create() {
    const b = { lang() { return b; }, context() { return b; }, build() { return b; }, read() { return unsupported(READ_RS, 'query'); } };
    return b;
  },
});
export const ResultSetMgr = Object.freeze({
  read() { return unsupported(READ_RS, 'query'); },
  async write(out, rs, lang) { return ResultsWriter.create().lang(lang).write(out, rs); },
});

// ---------------------------------------------------------------------------
// QueryExecution

/** Jena QueryExecution (one query on one source). */
export class QueryExecutionImpl {
  constructor(query, source, binding, context, remote = null) {
    this._query = query; this._src = source; this._binding = binding; this._cxt = context;
    this._closed = false; this._aborted = false; this._remote = remote;
  }
  getQuery() { return this._query; }
  getQueryString() { return this._query.toString(); }
  getDataset() { return this._src ? this._src.dataset : null; }
  getContext() { return this._cxt; }
  isClosed() { return this._closed; }
  close() { this._closed = true; }
  /** Jena abort(): a query is one engine call, so abort takes effect before it runs. */
  abort() { this._aborted = true; }
  _model() { return this._src.model ?? this._src.dataset.getDefaultModel(); }
  _check() {
    if (this._aborted) throw new QueryCancelledException('Query aborted');
    if (this._closed) throw new QueryExecException('QueryExecution is closed');
  }
  _text() { return withValues(this._query._runText(), this._binding); }

  /**
   * Run on the engine in the query's mode (SPARQL 1.2 unless the Syntax is
   * 1.1). For SELECT it also runs in SPARQL 1.1 mode with SRJ output, for
   * the result variables (an empty result has rows with no names) and a
   * snapshot for the formatters; a 1.1 syntax error there is not an error.
   * The rows always come from the first run (with SRJ output the engine does
   * not call extension functions: danbri/factoidal#1090).
   */
  async _run(select) {
    this._check();
    await functionsReady();
    const text = this._text();
    const version = this._query._syntax.version;
    const { ds, temp } = this._src.core();
    let keep = false;
    try {
      let value;
      try {
        value = await ds.query(text, { version });
      } catch (e) { throw queryError(e); }
      if (!select || !Array.isArray(value)) return { value };
      try {
        const j = await ds.query(text, { output: 'json' });
        if (j && j.results) { keep = temp; return { value, vars: j.head.vars || [], snapshot: temp ? ds : ds.clone() }; }
      } catch (e) {
        if (!(e instanceof FactoidalError)) throw e;
      }
      return { value };
    } finally {
      if (temp && !keep) ds.dispose();
    }
  }

  async execSelect() {
    if (this._remote) return this._remote.select(this);
    const r = await this._run(true);
    const model = this._model();
    if (!Array.isArray(r.value)) {
      if (r.value && typeof r.value.dispose === 'function') r.value.dispose();
      throw new QueryExecException('Not a SELECT query');
    }
    const rows = r.value.map((row) => new Map([...row].map(([k, t]) => [k, fromRDFJS(t)])));
    if (r.vars) {
      const snap = r.snapshot;
      const text = this._text();
      const rerun = async (output) => {
        try { return await snap.query(text, { output }); } catch (e) { throw queryError(e); }
      };
      const rs = new ResultSet(r.vars, rows, model, rerun);
      snapshots.register(rs, snap);
      return rs;
    }
    // SPARQL 1.2 only: the variables are those of the rows (Bindings iterate in SELECT order), and
    // the engine's results writers read SPARQL 1.1 queries, so there is no formatter output (gap 'query').
    const vars = [];
    for (const row of r.value) for (const k of row.keys()) if (!vars.includes(k)) vars.push(k);
    return new ResultSet(vars, rows, model, null);
  }

  async execAsk() {
    if (this._remote) return this._remote.ask(this);
    const r = await this._run(false);
    if (typeof r.value !== 'boolean') {
      if (r.value && typeof r.value.dispose === 'function') r.value.dispose();
      throw new QueryExecException('Not an ASK query');
    }
    return r.value;
  }

  async _graphForm(model) {
    if (this._remote) return this._remote.graph(this, model);
    const r = await this._run(false);
    if (!r.value || typeof r.value.dispose !== 'function') throw new QueryExecException('Not a CONSTRUCT or DESCRIBE query');
    return modelOfCore(r.value, model ?? null);
  }
  execConstruct(model) { return this._graphForm(model); }
  execDescribe(model) { return this._graphForm(model); }
  async execConstructTriples() { const m = await this._graphForm(); return m.getGraph().find(); }
  async execDescribeTriples() { const m = await this._graphForm(); return m.getGraph().find(); }
  async execConstructQuads() {
    const m = await this._graphForm();
    return new ExtendedIterator(m.getGraph().find().toList().map((t) => Quad.create(Quad.defaultGraphIRI, t)));
  }
  async execConstructDataset() { const m = await this._graphForm(); return DatasetFactory.create(m); }
  /** ARQ's JSON query form is not SPARQL (SPARQL 1.1 Query section 16): the engine refuses it (QueryParseException). */
  async execJson() { await this._run(false); throw new QueryExecException('Not a JSON query'); }
  async execJsonItems() { return this.execJson(); }
  // QueryExec-style names.
  select() { return this.execSelect(); }
  ask() { return this.execAsk(); }
  construct(m) { return this.execConstruct(m); }
  describe(m) { return this.execDescribe(m); }
  getTimeout1() { return -1; }
  getTimeout2() { return -1; }
}

/**
 * Jena QueryExecutionBuilder / QueryExecutionDatasetBuilder: query(), model()
 * or dataset(), initialBinding(), context settings, build().
 */
export class QueryExecutionDatasetBuilder {
  static create() { return new QueryExecutionDatasetBuilder(); }
  constructor() { this._query = null; this._src = null; this._binding = null; this._cxt = new Context(); this._remote = null; }
  query(q, syntax) {
    this._query = q instanceof Query ? q : QueryFactory.create(q, syntax);
    return this;
  }
  model(m) { this._src = m; return this; }
  dataset(d) { this._src = d; return this; }
  graph(g) { this._src = g; return this; }
  /** Initial bindings: a trailing VALUES clause (SPARQL 1.1 section 10.2.2). */
  initialBinding(qsm) { this._binding = qsm; return this; }
  /** Jena syntax substitution: rewriting the query needs its syntax tree (gap 'query'). */
  substitution() { return unsupported('QueryExecution.substitution (syntax substitution)', 'query'); }
  substitute() { return unsupported('QueryExecution.substitution (syntax substitution)', 'query'); }
  timeout() { return unsupported('QueryExecution.timeout', 'query'); }
  initialTimeout() { return unsupported('QueryExecution.timeout', 'query'); }
  overallTimeout() { return unsupported('QueryExecution.timeout', 'query'); }
  context(cxt) { if (cxt) this._cxt.putAll(cxt); return this; }
  set(symbol, value) { this._cxt.set(symbol, value); return this; }
  build() {
    if (!this._query) throw new QueryException('No query for QueryExecution');
    // The execution has its own copy of the context: later builder settings do not change it (as in Jena).
    if (this._remote) return new QueryExecutionImpl(this._query, null, this._binding, this._cxt.copy(), this._remote);
    if (this._src === null) throw new QueryException('No dataset for QueryExecution');
    return new QueryExecutionImpl(this._query, sourceOf(this._src), this._binding, this._cxt.copy());
  }
  /** Jena QueryExecBuilder.table(): build, run a SELECT and answer its rows as a Table (a Promise). */
  async table() { return Table.fromResultSet(await this.select()); }
  /** Build and run (Jena 5 shortcuts). */
  select() { return this.build().execSelect(); }
  ask() { return this.build().execAsk(); }
  construct(m) { return this.build().execConstruct(m); }
  describe(m) { return this.build().execDescribe(m); }
}

/**
 * A SPARQL 1.1 Protocol client (QueryExecution.service): the query is sent
 * with HTTP POST (application/sparql-query); SELECT and ASK ask for SRJ,
 * CONSTRUCT and DESCRIBE for N-Triples, which the engine reads.
 */
class RemoteExec {
  constructor(url) { this.url = url; }
  async _post(qe, accept) {
    let r;
    try {
      r = await fetch(this.url, { method: 'POST', headers: { 'content-type': 'application/sparql-query', accept }, body: qe._text() });
    } catch (e) { throw new QueryExecException('HTTP: ' + e.message, { cause: e }); }
    if (!r.ok) throw new QueryExecException(`HTTP ${r.status} from ${this.url}`);
    return r;
  }
  async select(qe) {
    const j = await (await this._post(qe, 'application/sparql-results+json')).json();
    if (!j.results) throw new QueryExecException('Not a SELECT query');
    const vars = j.head.vars || [];
    return new ResultSet(vars, j.results.bindings.map((b) => new Map(vars.filter((v) => b[v]).map((v) => [v, nodeOfJson(b[v])]))), new Model(), null);
  }
  async ask(qe) {
    const j = await (await this._post(qe, 'application/sparql-results+json')).json();
    if (typeof j.boolean !== 'boolean') throw new QueryExecException('Not an ASK query');
    return j.boolean;
  }
  async graph(qe, model) {
    const text = await (await this._post(qe, 'application/n-triples')).text();
    const { RDFParser, Lang } = await import('./riot.mjs');
    const m = model ?? new Model();
    await RDFParser.fromString(text, Lang.NTRIPLES).parse(m);
    return m;
  }
}

/**
 * Jena Table (org.apache.jena.sparql.algebra.table): variables and rows (Maps
 * from variable name to Node). equals() compares the rows as a multiset, term by term.
 */
export class Table {
  constructor(vars = [], rows = []) { this._vars = vars.map(stripQ); this._rows = rows.map((r) => new Map([...(r instanceof Map ? r : Object.entries(r))].map(([k, v]) => [stripQ(k), asNode(v)]))); }
  static create(vars, rows) { return new Table(vars, rows); }
  static fromResultSet(rs) { const rows = []; while (rs.hasNext()) rows.push(rs.nextBinding()); return new Table(rs.getResultVars(), rows); }
  getVarNames() { return this._vars.slice(); }
  size() { return this._rows.length; }
  isEmpty() { return this._rows.length === 0; }
  rows() { return this._rows.map((r) => new Map(r)); }
  equals(o) {
    if (!(o instanceof Table) || o._rows.length !== this._rows.length) return false;
    const same = (a, b) => a.size === b.size && [...a].every(([k, v]) => b.has(k) && b.get(k).equals(v));
    const left = o._rows.slice();
    for (const r of this._rows) {
      const i = left.findIndex((x) => same(r, x));
      if (i < 0) return false;
      left.splice(i, 1);
    }
    return true;
  }
  toString() { return '(table ' + this._rows.map((r) => '(row ' + [...r].map(([k, v]) => `(?${k} ${v})`).join(' ') + ')').join(' ') + ')'; }
}

export const QueryExecution = Object.freeze({
  create(query, src) {
    const b = new QueryExecutionDatasetBuilder();
    if (query !== undefined) b.query(query);
    if (src !== undefined) b.dataset(src);
    return b;
  },
  model(m) { return new QueryExecutionDatasetBuilder().model(m); },
  dataset(d) { return new QueryExecutionDatasetBuilder().dataset(d); },
  graph(g) { return new QueryExecutionDatasetBuilder().graph(g); },
  service(url) { const b = new QueryExecutionDatasetBuilder(); b._remote = new RemoteExec(String(url)); return b; },
});

/**
 * Jena QueryExec (the Graph-level execution): dataset(DatasetGraph) or
 * graph(Graph), then the same builder as QueryExecution. In leana a QueryExec
 * and a QueryExecution are the same object.
 */
export const QueryExec = Object.freeze({
  dataset(dsg) { return new QueryExecutionDatasetBuilder().dataset(dsg); },
  graph(g) { return new QueryExecutionDatasetBuilder().graph(g); },
  newBuilder() { return new QueryExecutionDatasetBuilder(); },
  service(url) { return QueryExecution.service(url); },
});
/** Jena QueryExecAdapter / QueryExecutionAdapter: the same object in leana. */
export const QueryExecAdapter = Object.freeze({ adapt(qe) { return qe; } });
export const QueryExecutionAdapter = Object.freeze({ adapt(qe) { return qe; } });
/** Jena QueryExecBuilderAdapter: the same builder in leana. */
export const QueryExecBuilderAdapter = Object.freeze({ adapt(b) { return b; } });

/** Jena QueryTransformOps: rewriting a query needs its syntax tree (gap 'query'). */
export const QueryTransformOps = Object.freeze({
  syntaxSubstitute() { return unsupported('QueryExecution.substitution (syntax substitution)', 'query'); },
  transform() { return unsupported('Query.getQueryPattern (syntax tree)', 'query'); },
});

/** Jena QueryExecutionFactory.create(query, Model | Dataset [, QuerySolution]). */
export const QueryExecutionFactory = Object.freeze({
  create(query, src, initial) {
    if (src === undefined) throw new QueryException('QueryExecutionFactory.create: no dataset');
    const b = new QueryExecutionDatasetBuilder().query(query).dataset(src);
    if (initial) b.initialBinding(initial instanceof QuerySolutionMap ? initial : new QuerySolutionMap().addAll(initial));
    return b.build();
  },
  sparqlService(url, query) { return QueryExecution.service(url).query(query).build(); },
  createServiceRequest(url, query) { return QueryExecutionFactory.sparqlService(url, query); },
});

// ---------------------------------------------------------------------------
// Update

/** Jena UpdateRequest: the update text, operation by operation (the operations' syntax trees are gap 'query'). */
export class UpdateRequest {
  constructor(base = null) { this._parts = []; this._base = base; }
  /** add(text | UpdateRequest). */
  add(x) {
    if (x instanceof UpdateRequest) this._parts.push(...x._parts);
    else this._parts.push(String(x));
    return this;
  }
  getBaseURI() { return this._base; }
  setBaseURI(b) { this._base = b; }
  isEmpty() { return this._parts.length === 0; }
  getOperations() { return unsupported('UpdateRequest.getOperations (update syntax tree)', 'query'); }
  iterator() { return unsupported('UpdateRequest.getOperations (update syntax tree)', 'query'); }
  /** Jena equalTo compares the operations' syntax trees (gap 'query'). */
  equalTo() { return unsupported('UpdateWriter / UpdateCompare (update syntax tree)', 'query'); }
  /** The text: the requests joined with ';' (SPARQL 1.1 Update section 3.1, grammar rule [29] Update). */
  toString() { return this._parts.join(' ;\n'); }
  _runText() {
    const t = this.toString();
    return this._base ? `BASE <${this._base}>\n${t}` : t;
  }
}

export const UpdateFactory = Object.freeze({
  create(text, base) {
    const r = new UpdateRequest(typeof base === 'string' ? base : null);
    if (text !== undefined && text !== null) r.add(text);
    return r;
  },
  parse(request, text) { request.add(text); return request; },
  /** read(path[, base]): the update text of a file. */
  read(path, base) { return UpdateFactory.create(readText(path), base); },
});

/**
 * An engine update failure as Jena reports it: a syntax error is a
 * QueryParseException (Jena's update parser throws it); LOAD, which the
 * engine cannot perform (it fetches no documents), is gap 'query'; any other
 * failure is an UpdateException.
 */
function updateFailure(e) {
  if (!(e instanceof FactoidalError)) return e;
  if (e.code === 'update.syntax' || e.code === 'query.syntax') return new QueryParseException(e.message, { cause: e });
  if (/no document fetch/.test(String(e.message))) return unsupported('UpdateAction LOAD (the engine fetches no documents)', 'query');
  return updateError(e);
}

async function runUpdate(request, target) {
  const src = sourceOf(target);
  const text = request instanceof UpdateRequest ? request._runText() : String(request);
  await functionsReady();
  const { ds, temp } = src.core();
  try {
    try { await ds.update(text); } catch (e) { throw updateFailure(e); }
    src.writeBack(ds);
  } finally {
    if (temp) ds.dispose();
  }
}

/** Jena UpdateExecution (builder): dataset(...).update(...).build().execute(). execute() answers a Promise. */
export class UpdateExecutionBuilder {
  constructor() { this._req = new UpdateRequest(); this._target = null; this._cxt = new Context(); }
  update(x) { this._req.add(x instanceof UpdateRequest ? x : String(x)); return this; }
  dataset(d) { this._target = d; return this; }
  graph(g) { this._target = g; return this; }
  model(m) { this._target = m; return this; }
  context(c) { if (c) this._cxt.putAll(c); return this; }
  set(k, v) { this._cxt.set(k, v); return this; }
  substitution() { return unsupported('QueryExecution.substitution (syntax substitution)', 'query'); }
  timeout() { return unsupported('QueryExecution.timeout', 'query'); }
  build() {
    if (this._target === null) throw new UpdateException('No dataset for update');
    const req = this._req, target = this._target, cxt = this._cxt;
    return { execute: () => runUpdate(req, target), getContext: () => cxt };
  }
  execute() { return this.build().execute(); }
}

export const UpdateExecution = Object.freeze({
  dataset(d) { return new UpdateExecutionBuilder().dataset(d); },
  create() { return new UpdateExecutionBuilder(); },
  graph(g) { return new UpdateExecutionBuilder().graph(g); },
  /** A SPARQL 1.1 Protocol update (HTTP POST, application/sparql-update). */
  service(url) {
    const req = new UpdateRequest();
    const b = {
      update(x) { req.add(x instanceof UpdateRequest ? x : String(x)); return b; },
      build() { return b; },
      async execute() {
        let r;
        try { r = await fetch(String(url), { method: 'POST', headers: { 'content-type': 'application/sparql-update' }, body: req._runText() }); } catch (e) {
          throw new UpdateException('HTTP: ' + e.message, { cause: e });
        }
        if (!r.ok) throw new UpdateException(`HTTP ${r.status} from ${url}`);
      },
    };
    return b;
  },
});

export const UpdateExecutionFactory = Object.freeze({
  create(request, target) { return new UpdateExecutionBuilder().update(request).dataset(target).build(); },
});

/** Jena UpdateAction: run an update on a Model, Graph, Dataset or DatasetGraph. Answers a Promise. */
export const UpdateAction = Object.freeze({
  execute(request, target) { return runUpdate(request, target); },
  /** parseExecute(text, target) | parseExecute(UsingList, target, text | bytes). */
  parseExecute(a, target, input) {
    if (a instanceof UsingList) {
      if (!a.isEmpty()) return unsupported('UpdateAction.parseExecute with a UsingList (USING added to each operation)', 'query');
      const text = typeof input === 'string' ? input : new TextDecoder().decode(input);
      return runUpdate(UpdateFactory.create(text), target);
    }
    return runUpdate(UpdateFactory.create(a), target);
  },
  readExecute(path, target) { return runUpdate(UpdateFactory.read(path), target); },
});

/** Jena UpdateExec (the DatasetGraph-level builder): dataset(dsg).update(...).build().execute(), or newBuilder(). */
export const UpdateExec = Object.freeze({
  dataset(d) { return new UpdateExecutionBuilder().dataset(d); },
  newBuilder() { return new UpdateExecutionBuilder(); },
  graph(g) { return new UpdateExecutionBuilder().graph(g); },
});

/** Jena UsingList: USING / USING NAMED graphs added to an update (adding them needs the update syntax tree: gap 'query'). */
export class UsingList {
  constructor() { this._using = []; this._named = []; }
  addUsing(n) { this._using.push(n); }
  addUsingNamed(n) { this._named.push(n); }
  getUsing() { return this._using.slice(); }
  getUsingNamed() { return this._named.slice(); }
  isEmpty() { return this._using.length === 0 && this._named.length === 0; }
}

/** Jena UpdateWriter and UpdateCompare work on the update syntax tree (gap 'query'). */
export const UpdateWriter = Object.freeze({
  output() { return unsupported('UpdateWriter / UpdateCompare (update syntax tree)', 'query'); },
});
export const UpdateCompare = Object.freeze({
  isomorphic() { return unsupported('UpdateWriter / UpdateCompare (update syntax tree)', 'query'); },
});

// Update operations built in code (Jena org.apache.jena.sparql.modify.request):
// each is written as SPARQL Update text, its terms written by the engine
// (sparqlTerm), and the engine runs that text. A WHERE pattern (an Element)
// is a syntax tree: gap 'query'.

function updTerm(n) {
  if (n.isVariable()) return '?' + n.getName();
  return sparqlTerm(n);
}
function updNode(x) { return typeof x === 'string' ? NodeFactory.createURI(x) : asNode(x); }
function updTriple(t) { return `${updTerm(t.getSubject())} ${updTerm(t.getPredicate())} ${updTerm(t.getObject())} .`; }
function updQuads(quads) {
  const dft = [], named = new Map();
  for (const q of quads) {
    const g = q.getGraph();
    if (g === null || Quad.isDefaultGraph(g)) { dft.push(updTriple(q.asTriple())); continue; }
    const k = updTerm(g);
    if (!named.has(k)) named.set(k, []);
    named.get(k).push(updTriple(q.asTriple()));
  }
  return [...dft, ...[...named].map(([g, ts]) => `GRAPH ${g} { ${ts.join(' ')} }`)].join(' ');
}

/** Jena QuadAcc / QuadDataAcc: the quads of a template or of INSERT DATA / DELETE DATA. */
export class QuadAcc {
  constructor(quads = []) { this._quads = []; this._graph = null; for (const q of quads) this.addQuad(q); }
  setGraph(g) { this._graph = g === null ? null : updNode(g); }
  getGraph() { return this._graph; }
  addTriple(t) { this._quads.push(Quad.create(this._graph ?? Quad.defaultGraphNodeGenerated, t)); }
  addQuad(q) { this._quads.push(q); }
  getQuads() { return this._quads.slice(); }
  _text() { return updQuads(this._quads); }
}
export class QuadDataAcc extends QuadAcc {}

/** Jena Update: one operation of an UpdateRequest; toString() is its SPARQL Update text. */
export class Update {
  toString() { return this._text(); }
}
export class UpdateDataInsert extends Update {
  constructor(acc) { super(); this._acc = acc; }
  getQuads() { return this._acc.getQuads(); }
  _text() { return `INSERT DATA { ${this._acc._text()} }`; }
}
export class UpdateDataDelete extends Update {
  constructor(acc) { super(); this._acc = acc; }
  getQuads() { return this._acc.getQuads(); }
  _text() { return `DELETE DATA { ${this._acc._text()} }`; }
}
export class UpdateDeleteWhere extends Update {
  constructor(acc) { super(); this._acc = acc; }
  getQuads() { return this._acc.getQuads(); }
  _text() { return `DELETE WHERE { ${this._acc._text()} }`; }
}
/** Jena UpdateModify (DELETE/INSERT ... WHERE): templates in code; a WHERE pattern is gap 'query' (WHERE {} when none is set). */
export class UpdateModify extends Update {
  constructor() { super(); this._ins = new QuadAcc(); this._del = new QuadAcc(); this._withIRI = null; }
  getInsertAcc() { return this._ins; }
  getDeleteAcc() { return this._del; }
  hasInsertClause() { return this._ins._quads.length > 0; }
  hasDeleteClause() { return this._del._quads.length > 0; }
  setWithIRI(g) { this._withIRI = updNode(g); }
  getWithIRI() { return this._withIRI; }
  setElement() { return unsupported('UpdateModify.setElement (WHERE pattern syntax tree)', 'query'); }
  getWherePattern() { return null; }
  _text() {
    const w = this._withIRI ? `WITH ${updTerm(this._withIRI)} ` : '';
    const d = this.hasDeleteClause() ? `DELETE { ${this._del._text()} } ` : '';
    const i = this.hasInsertClause() || !this.hasDeleteClause() ? `INSERT { ${this._ins._text()} } ` : '';
    return `${w}${d}${i}WHERE { }`;
  }
}

/** Jena Target: DEFAULT, NAMED, ALL or one graph. */
export class Target {
  constructor(kind, node = null) { this._kind = kind; this._node = node; Object.freeze(this); }
  static create(g) { return new Target('GRAPH', updNode(g)); }
  isDefault() { return this._kind === 'DEFAULT'; }
  isAll() { return this._kind === 'ALL'; }
  isAllNamed() { return this._kind === 'NAMED'; }
  isOneNamedGraph() { return this._kind === 'GRAPH'; }
  getGraph() { return this._node; }
  /** GraphRefAll / GraphOrDefault text (SPARQL 1.1 Update grammar rules [45], [46]). */
  _text() { return this._kind === 'GRAPH' ? `GRAPH ${updTerm(this._node)}` : this._kind; }
  toString() { return this._text(); }
}
Target.DEFAULT = new Target('DEFAULT');
Target.NAMED = new Target('NAMED');
Target.ALL = new Target('ALL');

const asTarget = (x) => (x instanceof Target ? x : Target.create(x));
const silentText = (s) => (s ? ' SILENT' : '');

export class UpdateCreate extends Update {
  constructor(g, silent = false) { super(); this._g = updNode(g); this._silent = !!silent; }
  getGraph() { return this._g; }
  isSilent() { return this._silent; }
  _text() { return `CREATE${silentText(this._silent)} GRAPH ${updTerm(this._g)}`; }
}
export class UpdateDrop extends Update {
  constructor(g, silent = false) { super(); this._t = asTarget(g); this._silent = !!silent; }
  getTarget() { return this._t; }
  isSilent() { return this._silent; }
  _text() { return `DROP${silentText(this._silent)} ${this._t._text()}`; }
}
export class UpdateClear extends Update {
  constructor(g, silent = false) { super(); this._t = asTarget(g); this._silent = !!silent; }
  getTarget() { return this._t; }
  isSilent() { return this._silent; }
  _text() { return `CLEAR${silentText(this._silent)} ${this._t._text()}`; }
}
class UpdateBinaryOp extends Update {
  constructor(op, src, dest, silent = false) { super(); this._op = op; this._src = asTarget(src); this._dest = asTarget(dest); this._silent = !!silent; }
  getSrc() { return this._src; }
  getDest() { return this._dest; }
  isSilent() { return this._silent; }
  _text() { return `${this._op}${silentText(this._silent)} ${this._src._text()} TO ${this._dest._text()}`; }
}
export class UpdateCopy extends UpdateBinaryOp { constructor(src, dest, silent) { super('COPY', src, dest, silent); } }
export class UpdateAdd extends UpdateBinaryOp { constructor(src, dest, silent) { super('ADD', src, dest, silent); } }
export class UpdateMove extends UpdateBinaryOp { constructor(src, dest, silent) { super('MOVE', src, dest, silent); } }

// ---------------------------------------------------------------------------
// Functions: NodeValue, FunctionBase, FunctionRegistry

const LITVAL = 'NodeValue.getInteger / getDouble / getBoolean (literal values)';

/**
 * Jena NodeValue, as far as leana can carry it: a Node, or a JavaScript
 * boolean, number or string made by makeBoolean/makeInteger/makeDouble,
 * whose datatype the engine chooses when the function answers. The values
 * of literals are gap 'literal-value'.
 */
export class NodeValue {
  constructor(node, value) { this._node = node; this._value = value; }
  static makeNode(n) { return new NodeValue(asNode(n), undefined); }
  static makeString(s) { return new NodeValue(NodeFactory.createLiteralString(String(s)), undefined); }
  static makeNodeString(s) { return NodeValue.makeString(s); }
  static makeBoolean(b) { return new NodeValue(null, !!b); }
  static makeInteger(n) {
    if (!Number.isInteger(Number(n))) throw new ExprEvalException('not an integer: ' + n);
    return new NodeValue(null, Number(n));
  }
  static makeDouble(n) { return new NodeValue(null, Number(n)); }
  static get TRUE() { return NodeValue.makeBoolean(true); }
  static get FALSE() { return NodeValue.makeBoolean(false); }
  asNode() {
    if (this._node) return this._node;
    return unsupported('NodeValue.asNode of a value made from a JavaScript value', 'js-value-literal');
  }
  getNode() { return this.asNode(); }
  isIRI() { return !!this._node && this._node.isURI(); }
  isBlank() { return !!this._node && this._node.isBlank(); }
  isLiteral() { return !this._node || this._node.isLiteral(); }
  isString() {
    return !!this._node && this._node.isLiteral() && this._node.getLiteralDatatypeURI() === NodeFactory.createLiteralString('').getLiteralDatatypeURI();
  }
  /** The lexical form of a string literal (for xsd:string the value is the lexical form). */
  getString() {
    if (this.isString()) return this._node.getLiteralLexicalForm();
    throw new ExprEvalException('Not a string: ' + this);
  }
  asString() { return this._node ? (this._node.isLiteral() ? this._node.getLiteralLexicalForm() : String(this._node)) : String(this._value); }
  getInteger() { return typeof this._value === 'number' ? BigInt(this._value) : unsupported(LITVAL, 'literal-value'); }
  getDouble() { return typeof this._value === 'number' ? this._value : unsupported(LITVAL, 'literal-value'); }
  getBoolean() { return typeof this._value === 'boolean' ? this._value : unsupported(LITVAL, 'literal-value'); }
  toString() { return this._node ? String(this._node) : String(this._value); }
  _toEngine() { return this._node ? jsonOfNode(this._node) : this._value; }
}

/**
 * Jena FunctionBase: subclass and give exec(...args) answering a NodeValue
 * (or a Node, or a JavaScript boolean, number or string). FunctionBase0..4
 * fix the argument count: a call with another count is an evaluation error
 * (Jena refuses it when the query is built).
 */
export class FunctionBase {
  build() {}
  exec() { throw new ExprEvalException('FunctionBase.exec not given'); }
  static arity = -1;
}
export class FunctionBase0 extends FunctionBase { static arity = 0; }
export class FunctionBase1 extends FunctionBase { static arity = 1; }
export class FunctionBase2 extends FunctionBase { static arity = 2; }
export class FunctionBase3 extends FunctionBase { static arity = 3; }
export class FunctionBase4 extends FunctionBase { static arity = 4; }

/** An engine callback from a FunctionBase subclass, a FunctionFactory ({create(uri)}) or a JS function of NodeValues. */
function engineFunction(uri, impl) {
  const make = () => {
    if (typeof impl === 'function' && impl.prototype instanceof FunctionBase) return new impl();
    if (impl && typeof impl.create === 'function') return impl.create(uri);
    if (typeof impl === 'function') return { exec: impl };
    if (impl && typeof impl.exec === 'function') return impl;
    throw new TypeError('FunctionRegistry.put: a FunctionBase subclass, a FunctionFactory or a function');
  };
  return async (args) => {
    const f = make();
    const arity = f.constructor && typeof f.constructor.arity === 'number' ? f.constructor.arity : -1;
    if (arity >= 0 && args.length !== arity) return null;
    if (args.some((a) => a.type === 'error')) return null;
    const nvs = args.map((a) => NodeValue.makeNode(nodeOfJson(a)));
    try {
      if (typeof f.build === 'function') f.build(uri, nvs);
      const r = await f.exec(...nvs);
      if (r === null || r === undefined) return null;
      if (r instanceof NodeValue) return r._toEngine();
      if (r instanceof Node || r instanceof RDFNode) return jsonOfNode(asNode(r));
      return r;
    } catch (e) {
      // An ExprEvalException is an evaluation error (SPARQL 1.1 section 17.3: the expression has no value).
      if (e instanceof JenaException) return null;
      throw e;
    }
  };
}

/** Jena FunctionRegistry over core registerExtensionFunction. put/remove answer a Promise; queries wait for them. */
export class FunctionRegistry {
  constructor() { this._m = new Map(); }
  static get() { return GLOBAL_FR; }
  static standardRegistry() { return GLOBAL_FR; }
  put(uri, impl) {
    const u = String(uri);
    this._m.set(u, impl);
    return track(registerExtensionFunction(u, engineFunction(u, impl)));
  }
  get(uri) { return this._m.get(String(uri)) ?? null; }
  isRegistered(uri) { return this._m.has(String(uri)); }
  remove(uri) {
    const u = String(uri);
    const had = this._m.get(u) ?? null;
    this._m.delete(u);
    track(unregisterExtensionFunction(u));
    return had;
  }
  keys() { return new ExtendedIterator([...this._m.keys()]); }
}
const GLOBAL_FR = new FunctionRegistry();

/** Jena PropertyFunctionRegistry: the engine has no property functions (gap 'query'). */
export const PropertyFunctionRegistry = Object.freeze({
  get() { return unsupported('PropertyFunctionRegistry (property functions)', 'query'); },
  set() { return unsupported('PropertyFunctionRegistry (property functions)', 'query'); },
});

// Jena's expression object model (org.apache.jena.sparql.expr: Expr, ExprVar,
// E_Function, E_Add, ...) is a syntax tree of SPARQL expressions: gap 'query'.
const EXPR = 'Expr (SPARQL expression object model)';
export class Expr { constructor() { unsupported(EXPR, 'query'); } }
export class ExprVar extends Expr {}
export class ExprList extends Expr {}
export class E_Function extends Expr {}
export class E_Add extends Expr {}
export class E_Subtract extends Expr {}
export class E_Multiply extends Expr {}
export class NodeValueInteger extends Expr {}
export class NodeValueDouble extends Expr {}
export class NodeValueBoolean extends Expr {}

const UDF = 'UserDefinedFunctionFactory.add (a function defined by a SPARQL expression)';
/**
 * Jena UserDefinedFunctionFactory: functions defined by SPARQL expressions
 * need the expression object model (gap 'query'). The registry itself is
 * API shape.
 */
export class UserDefinedFunctionFactory {
  constructor() { this._m = new Map(); this._preserve = false; }
  static getFactory() { return GLOBAL_UDF; }
  clear() { this._m.clear(); }
  setPreserveDependencies(b) { this._preserve = !!b; }
  getPreserveDependencies() { return this._preserve; }
  isRegistered(uri) { return this._m.has(String(uri)); }
  get(uri) { return this._m.get(String(uri)) ?? null; }
  add() { return unsupported(UDF, 'query'); }
  create() { return unsupported(UDF, 'query'); }
  remove(uri) { this._m.delete(String(uri)); }
}
const GLOBAL_UDF = new UserDefinedFunctionFactory();

export { Triple };
