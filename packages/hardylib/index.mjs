// @factoidal/hardylib (working placeholder name): an API in the style of
// RDFLib (Python) over the public API of @factoidal/core. Prototype.
//
// API shape (names, argument order, defaults) follows RDFLib
// (https://github.com/RDFLib/rdflib, commit 58c3700e5e21b5b833d0e31072f930c665059db2,
// rdflib/graph.py, rdflib/term.py, rdflib/namespace/__init__.py).
// RDFLib: Copyright (c) 2002-2026, RDFLib Team. BSD 3-Clause License.
// Changes: rewritten in JavaScript; no RDFLib code is copied. Python
// operators become methods (docs/hardylib/feasibility.md section 5). Every RDF
// decision (term syntax, parsing, writing, isomorphism, SPARQL, value
// comparison) is a call of @factoidal/core. A method that needs semantics
// the engine does not have throws NotSupported (README.md, "Gaps").
import * as core from '@factoidal/core';
import { termToNQuads } from '@factoidal/core/rdfjs';

const df = core.dataFactory;

/** Thrown by a method that needs engine semantics @factoidal/core does not have. */
export class NotSupported extends Error {
  constructor(what, issue) {
    super(`${what} is not supported: it needs an engine op (${issue})`);
    this.name = 'NotSupported';
    this.issue = issue;
  }
}
const GAP_VALUES = 'https://github.com/danbri/factoidal/issues/1051';

// ---------------------------------------------------------------- terms
// Terms are the RDF/JS terms of @factoidal/core, so they go to any RDF/JS
// consumer unchanged. RDFLib's `a == b` is `a.equals(b)`.

/** URIRef(value): an IRI. The engine checks it when the term enters a graph. */
export function URIRef(value) {
  if (typeof value !== 'string') throw new TypeError('URIRef takes a string');
  return df.namedNode(value);
}

/** BNode(id?): a blank node; with no id the core data factory makes a fresh label. */
export function BNode(id) {
  return id === undefined ? df.blankNode() : df.blankNode(String(id));
}

/**
 * Literal(lexicalForm, {lang, datatype}). RDFLib's Literal(12) chooses
 * xsd:integer from the Python type, and normalises lexical forms
 * (Literal("01", datatype=XSD.integer) is "1"): both need an engine table,
 * so a non-string value throws NotSupported and the lexical form is kept.
 */
export function Literal(value, { lang, datatype } = {}) {
  if (typeof value !== 'string') throw new NotSupported('Literal() from a JavaScript value (' + typeof value + ')', GAP_VALUES);
  if (lang != null && datatype != null) throw new TypeError('A Literal can only have one of lang or datatype');
  if (lang != null) return df.literal(value, lang);
  if (datatype != null) return df.literal(value, typeof datatype === 'string' ? df.namedNode(datatype) : datatype);
  return df.literal(value);
}

/** term.n3() in RDFLib: the N-Triples form of the term, written by the engine. */
export function n3(term) { return termToNQuads(term); }

/** Literal.toPython() has no engine op that maps a literal to a JavaScript value. */
export function toValue() { throw new NotSupported('Literal value mapping (toPython)', GAP_VALUES); }

/**
 * Literal.eq(other) in RDFLib compares values. Here the engine decides with
 * the SPARQL `=` operator (SPARQL 1.1 section 17.3): true, false, or null
 * when SPARQL raises a type error (RDFLib answers NotImplemented or False).
 */
export async function valueEquals(a, b) {
  const rows = await core.query('', `SELECT ?r WHERE { BIND((${n3(a)} = ${n3(b)}) AS ?r) }`, 'ntriples');
  const r = rows[0]?.get('r');
  return r ? r.value === 'true' : null;
}

// ------------------------------------------------------------ namespaces
const NS_OWN = new Set(['term', 'toString', 'valueOf', 'toJSON', 'uri']);

/**
 * Namespace(iri): EX.name, EX['name'] and EX.term('name') give the IRI
 * iri + name, as RDFLib's Namespace (a str subclass) does by concatenation.
 * The names term, toString, valueOf, toJSON, uri and then are the
 * namespace's own: use EX.term('then') for those. No vocabulary IRIs
 * (RDF, RDFS, XSD, ...) are listed in JS; see README.md, "Gaps".
 */
export function Namespace(iri) {
  if (typeof iri !== 'string') throw new TypeError('Namespace takes a string');
  const own = {
    term: (name) => df.namedNode(iri + name),
    toString: () => iri, valueOf: () => iri, toJSON: () => iri, uri: iri,
  };
  return new Proxy(own, {
    get(t, prop) {
      if (typeof prop === 'symbol') return prop === Symbol.toPrimitive ? () => iri : undefined;
      if (prop === 'then') return undefined; // a Namespace is not a thenable
      if (NS_OWN.has(prop)) return t[prop];
      return df.namedNode(iri + prop);
    },
    has(t, prop) { return typeof prop === 'string' && prop.length > 0; },
  });
}

// ----------------------------------------------------------------- graph
const DEFAULT = df.defaultGraph();
const asTriple = (q) => [q.subject, q.predicate, q.object];
const pattern = (t) => {
  if (!Array.isArray(t) || t.length !== 3) throw new TypeError('a triple is an array [s, p, o] (null is a wildcard)');
  return t.map((x) => x ?? null);
};

/**
 * Graph: one RDF graph held by the engine (an @factoidal/core Dataset
 * whose quads are all in the default graph). Make one with
 * `await Graph.create()`; afterwards the store calls are synchronous.
 */
export class Graph {
  #ds; #prefixes;
  constructor(dataset, { identifier } = {}) {
    if (!(dataset instanceof core.Dataset)) throw new TypeError('use await Graph.create()');
    this.#ds = dataset;
    this.#prefixes = {};
    this.identifier = identifier ?? BNode();
  }
  static async create(options = {}) { return new Graph(await core.fromQuads([]), options); }

  /** The @factoidal/core Dataset behind this graph. */
  get dataset() { return this.#ds; }

  /** len(g) */
  get length() { return this.#ds.size; }

  /** g.add((s, p, o)) */
  add(triple) {
    const [s, p, o] = pattern(triple);
    if (!s || !p || !o) throw new TypeError('add() takes a full triple');
    this.#ds.add(df.quad(s, p, o, DEFAULT));
    return this;
  }
  /** g.addN(quads) — here: an iterable of triples */
  addN(triples) { for (const t of triples) this.add(t); return this; }

  /** g.remove((s, p, None)): removes every triple matching the pattern. */
  remove(triple) {
    const [s, p, o] = pattern(triple);
    for (const q of this.#ds.match(s, p, o, DEFAULT).toArray()) this.#ds.delete(q);
    return this;
  }

  /** g.triples((s, p, None)): a generator of [s, p, o]. */
  *triples(triple = [null, null, null]) {
    const [s, p, o] = pattern(triple);
    for (const q of this.#ds.match(s, p, o, DEFAULT)) yield asTriple(q);
  }
  [Symbol.iterator]() { return this.triples(); }

  /** (s, p, o) in g — the pattern may have nulls, as in RDFLib. Term equality. */
  contains(triple) {
    const [s, p, o] = pattern(triple);
    if (s && p && o) return this.#ds.has(df.quad(s, p, o, DEFAULT));
    return this.#ds.match(s, p, o, DEFAULT).size > 0;
  }

  *subjects(predicate = null, object = null, { unique = false } = {}) { yield* this.#col(0, [null, predicate, object], unique); }
  *predicates(subject = null, object = null, { unique = false } = {}) { yield* this.#col(1, [subject, null, object], unique); }
  *objects(subject = null, predicate = null, { unique = false } = {}) { yield* this.#col(2, [subject, predicate, null], unique); }
  *subjectObjects(predicate = null) { for (const [s, , o] of this.triples([null, predicate, null])) yield [s, o]; }
  *subjectPredicates(object = null) { for (const [s, p] of this.triples([null, null, object])) yield [s, p]; }
  *predicateObjects(subject = null) { for (const [, p, o] of this.triples([subject, null, null])) yield [p, o]; }
  *#col(i, pat, unique) {
    const seen = new Set();
    for (const t of this.triples(pat)) {
      if (unique) { const k = n3(t[i]); if (seen.has(k)) continue; seen.add(k); }
      yield t[i];
    }
  }

  /**
   * g.value(subject, predicate, object=None, default=None, any=True):
   * the one missing term of the first matching triple.
   */
  value(subject = null, predicate = null, object = null, { default: dflt = null, any = true } = {}) {
    const holes = [subject, predicate, object].map((x, i) => (x == null ? i : -1)).filter((i) => i >= 0);
    if (holes.length !== 1) throw new TypeError('value() needs exactly one of subject, predicate, object missing');
    const it = this.triples([subject, predicate, object]);
    const first = it.next();
    if (first.done) return dflt;
    if (!any && !it.next().done) throw new Error('value(): more than one value (any=false)');
    return first.value[holes[0]];
  }

  /** g.bind(prefix, namespace): a prefix used by the Turtle writer. */
  bind(prefix, namespace) { this.#prefixes[prefix] = String(namespace); return this; }
  /** g.namespaces(): [prefix, IRI] pairs, the bound ones over the parsed ones. */
  *namespaces() { yield* Object.entries({ ...this.#ds.prefixes, ...this.#prefixes }); }

  /** g.parse(data=..., format=..., publicID=...): read text into this graph. */
  async parse({ data, format, publicID } = {}) {
    if (typeof data !== 'string') throw new TypeError('parse() takes {data: string}; file and URL sources are not in the prototype');
    const opts = {};
    if (format) opts.format = format;
    if (publicID) opts.baseIRI = publicID;
    const parsed = await core.parse(data, opts);
    try {
      for (const q of parsed) {
        if (q.graph.termType !== 'DefaultGraph') throw new TypeError('the data has named graphs: a Graph holds one graph');
        this.#ds.add(q);
      }
      Object.assign(this.#prefixes, parsed.prefixes, this.#prefixes);
    } finally { parsed.dispose(); }
    return this;
  }

  /** g.serialize(format="turtle"): the engine writes; answers a string. */
  async serialize({ format = 'turtle' } = {}) {
    const options = { format };
    if (format === 'turtle' || format === 'ttl') options.prefixes = { ...this.#prefixes };
    return this.#ds.serialize(options);
  }

  /**
   * g.query(sparql): SELECT answers an array of rows (a Map from variable
   * name to term, as @factoidal/core gives), ASK a boolean, CONSTRUCT and
   * DESCRIBE a Graph.
   */
  async query(sparql) {
    const r = await this.#ds.query(sparql);
    return r instanceof core.Dataset ? new Graph(r) : r;
  }
  /** g.update(sparqlUpdate) */
  async update(text) { await this.#ds.update(text); return this; }

  /** rdflib.compare.isomorphic(g, other): the engine decides. */
  isomorphic(other) { return core.isomorphic(this.#ds, other.dataset); }

  // Python operators on graphs (rdflib/graph.py __add__, __sub__, __mul__,
  // __xor__, __iadd__, __isub__): set operations on triples; blank nodes are
  // not renamed, as in RDFLib.
  /** g + h */
  async union(other) { const g = await this.copy(); return g.addAll(other); }
  /** g - h */
  async difference(other) { const g = await this.copy(); for (const t of other) g.remove(t); return g; }
  /** g * h */
  async intersection(other) {
    const g = await Graph.create();
    for (const t of this) if (other.contains(t)) g.add(t);
    return g;
  }
  /** g ^ h */
  async symmetricDifference(other) {
    const a = await this.difference(other);
    for (const t of other) if (!this.contains(t)) a.add(t);
    return a;
  }
  /** g += h */
  addAll(other) { for (const t of other) this.add(t); return this; }
  /** g -= h */
  removeAll(other) { for (const t of other) this.remove(t); return this; }

  async copy() {
    const g = new Graph(this.#ds.clone(), { identifier: this.identifier });
    for (const [p, n] of Object.entries(this.#prefixes)) g.bind(p, n);
    return g;
  }

  /** RDFLib names that need engine semantics @factoidal/core does not have. */
  qname() { throw new NotSupported('Graph.qname / compute_qname (IRI split into namespace and local name)', GAP_VALUES); }
  collection() { throw new NotSupported('Graph.collection (RDF list walk)', GAP_VALUES); }

  dispose() { this.#ds.dispose(); }
  [Symbol.dispose]() { this.dispose(); }
}

export const version = '0.0.0';
export const coreVersion = core.version;
