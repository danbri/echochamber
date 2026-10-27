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
  [Symbol.iterator]() { const rs = this; return { next: () => (rs.hasNext() ? { value: rs.next(), done: false } : { value: undefined, done: true }) }; }
  /** The remaining rows, consumed. */
  _remaining() { const r = this._rows.slice(this._i); this._i = this._rows.length; return r; }
}

/** Jena ResultSetRewindable: a ResultSet that can be reset. */
export class ResultSetRewindable extends ResultSet {
  reset() { this._i = 0; this._closed = false; }
  size() { return this._rows.length; }
}

export const ResultSetFactory = Object.freeze({
  /** A rewindable copy of the rest of `rs` (rs is consumed). */
  copyResults(rs) {
    const rows = rs._remaining();
    return new ResultSetRewindable(rs.getResultVars(), rows, rs.getResourceModel(), rs._rerun);
  },
  makeRewindable(rs) { return ResultSetFactory.copyResults(rs); },
  /** A result set from rows (Maps or objects of name to Node or RDFNode). It has no query, so the engine cannot write it (gap 'query'). */
  create(vars, rows, model = null) {
    const rs = rows.map((r) => new Map([...(r instanceof Map ? r : Object.entries(r))].map(([k, v]) => [stripQ(k), asNode(v)])));
    return new ResultSetRewindable(vars.map(stripQ), rs, model ?? new Model(), null);
  },
});

/** Engine output of a result set, in one of the core results formats. */
async function formatted(rs, output) {
  if (!rs._rerun) return unsupported('ResultSetFormatter output of a result set not made by a SPARQL 1.1 query', 'query');
  return rs._rerun(output);
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
  async asText(rs) { rs._remaining(); return formatted(rs, 'table'); },
  async out(out, rs) {
    if (rs === undefined) { rs = out; out = null; }
    if (typeof rs === 'boolean') { writeTo(out, (rs ? 'yes' : 'no') + '\n'); return; }
    writeTo(out, await ResultSetFormatter.asText(rs));
  },
  async asXMLString(rs) { rs._remaining(); return formatted(rs, 'xml'); },
  async outputAsXML(out, rs) { if (rs === undefined) { rs = out; out = null; } writeTo(out, await ResultSetFormatter.asXMLString(rs)); },
  async outputAsJSON(out, rs) {
    if (rs === undefined) { rs = out; out = null; }
    rs._remaining();
    const j = await formatted(rs, 'json');
    writeTo(out, typeof j === 'string' ? j : JSON.stringify(j, null, 2));
  },
  async outputAsCSV(out, rs) { if (rs === undefined) { rs = out; out = null; } rs._remaining(); writeTo(out, await formatted(rs, 'csv')); },
  async outputAsTSV(out, rs) { if (rs === undefined) { rs = out; out = null; } rs._remaining(); writeTo(out, await formatted(rs, 'tsv')); },
  /** Jena output(out, rs, ResultsFormat). */
  async output(out, rs, fmt) {
    const f = String(fmt && fmt.name ? fmt.name : fmt).toLowerCase();
    rs._remaining();
    const text = await formatted(rs, f === 'text' ? 'table' : f);
    writeTo(out, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
  },
});

/** Jena ResultsFormat names, mapped to the engine's results formats. */
export const ResultsFormat = Object.freeze({
  FMT_RS_XML: Object.freeze({ name: 'xml' }),
  FMT_RS_JSON: Object.freeze({ name: 'json' }),
  FMT_RS_CSV: Object.freeze({ name: 'csv' }),
  FMT_RS_TSV: Object.freeze({ name: 'tsv' }),
  FMT_TEXT: Object.freeze({ name: 'text' }),
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
  execJson() { return unsupported('QueryExecution.execJson (ARQ JSON query form)', 'query'); }
  execJsonItems() { return unsupported('QueryExecution.execJson (ARQ JSON query form)', 'query'); }
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
    if (this._remote) return new QueryExecutionImpl(this._query, null, this._binding, this._cxt, this._remote);
    if (this._src === null) throw new QueryException('No dataset for QueryExecution');
    return new QueryExecutionImpl(this._query, sourceOf(this._src), this._binding, this._cxt);
  }
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

async function runUpdate(request, target) {
  const src = sourceOf(target);
  const text = request instanceof UpdateRequest ? request._runText() : String(request);
  await functionsReady();
  const { ds, temp } = src.core();
  try {
    try { await ds.update(text); } catch (e) { throw updateError(e); }
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
  parseExecute(text, target) { return runUpdate(UpdateFactory.create(text), target); },
  readExecute(path, target) { return runUpdate(UpdateFactory.read(path), target); },
});

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

export { Triple };
