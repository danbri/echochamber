// @factoidal/echo03: an N3.js-style API (Parser, Writer, Store, DataFactory)
// over the public API of @factoidal/core. Working name; see README.md.
//
// API shape modelled on N3.js (https://github.com/rdfjs/N3.js, MIT licence,
// Copyright 2012-present N3.js contributors): class and method names,
// argument orders and callback conventions. No N3.js code is copied. Every
// RDF decision (parsing, IRI resolution, term checks, writing, matching) is
// made by the engine; this file only moves arguments and results around.
//
// The engine loads asynchronously. Call `await ready()` once before using
// Store, Writer.quadToString or Writer.quadsToString, which are synchronous
// in N3.js and stay synchronous here.

import * as core from '@factoidal/core';
import {
  dataFactory as coreFactory,
  NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad,
  quadToNQuads, quadsToNQuads, termToNQuads,
} from '@factoidal/core/rdfjs';

export { NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad, Quad as Triple };

/** The error a method throws when the engine does not offer what it needs. */
export class UnsupportedError extends Error {
  constructor(what, gap) {
    super(`echo03: ${what} is not supported (${gap})`);
    this.name = 'UnsupportedError';
    this.gap = gap;
  }
}

// ---------------------------------------------------------------------
// Engine load
// ---------------------------------------------------------------------

let emptyDataset = null;
let loading = null;

/** Load the engine. Store and the synchronous Writer methods need it. */
export function ready() {
  if (!loading) {
    loading = (async () => {
      await core.ready();
      // An empty engine Dataset; every Store is a synchronous clone() of it.
      emptyDataset = await core.openDataset('', 'nquads');
    })();
  }
  return loading;
}

function needReady(who) {
  if (!emptyDataset) {
    throw new Error(`echo03: ${who} needs the engine; await ready() first`);
  }
}

// ---------------------------------------------------------------------
// DataFactory: the core RDF/JS DataFactory plus N3.js's `triple`.
// ---------------------------------------------------------------------

export const DataFactory = Object.freeze({
  namedNode: coreFactory.namedNode,
  blankNode: coreFactory.blankNode,
  literal(value, languageOrDatatype) {
    // N3.js picks a datatype for JS numbers, booleans, BigInts and Dates.
    // That is a value-to-datatype decision for the engine (gap list G4).
    const t = typeof value;
    if ((t === 'number' || t === 'boolean' || t === 'bigint' || value instanceof Date) && languageOrDatatype === undefined) {
      throw new UnsupportedError('DataFactory.literal with a non-string value', 'G4');
    }
    return coreFactory.literal(value, languageOrDatatype);
  },
  variable: coreFactory.variable,
  defaultGraph: coreFactory.defaultGraph,
  quad: coreFactory.quad,
  triple(subject, predicate, object) { return coreFactory.quad(subject, predicate, object); },
  fromTerm: coreFactory.fromTerm,
  fromQuad: coreFactory.fromQuad,
});

// A copy of `term` made by another factory (field copy only).
function withFactory(term, f) {
  switch (term.termType) {
    case 'NamedNode': return f.namedNode(term.value);
    case 'BlankNode': return f.blankNode(term.value);
    case 'Variable': return f.variable(term.value);
    case 'DefaultGraph': return f.defaultGraph();
    case 'Literal':
      if (term.direction) return f.literal(term.value, { language: term.language, direction: term.direction });
      if (term.language) return f.literal(term.value, term.language);
      return f.literal(term.value, f.namedNode(term.datatype.value));
    case 'Quad':
      return f.quad(withFactory(term.subject, f), withFactory(term.predicate, f),
        withFactory(term.object, f), withFactory(term.graph, f));
    default: throw new TypeError(`unknown termType ${term.termType}`);
  }
}

// ---------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------

// N3.js reads its `format` option by the last word of the string (so media
// types work too) and by substring: 'turtle', 'trig', 'triple', 'quad', 'n3'.
// This reproduces that option rule; it decides nothing about the input text.
// The tags are @factoidal/core parse format names (RDF 1.2 readers, as N3.js
// 2 reads RDF 1.2). An empty or unrecognised format leaves the choice to the
// engine (op detectFormat).
function parseTagOf(format) {
  if (typeof format !== 'string') return { tag: undefined };
  const m = format.match(/(?:^|\W)(\w*)$/);
  const word = (m ? m[1] : '').toLowerCase();
  if (/n3/.test(word)) return { n3: true };
  if (/trig/.test(word)) return { tag: 'trig12' };
  if (/turtle/.test(word)) return { tag: 'turtle12' };
  if (/quad/.test(word)) return { tag: 'nquads12' };
  if (/triple/.test(word)) return { tag: 'ntriples12' };
  return { tag: undefined };
}

export class Parser {
  constructor(options) {
    this._options = options || {};
    this._factory = this._options.factory || null;
    this._format = parseTagOf(this._options.format);
  }

  async _parseAll(input) {
    if (this._format.n3) throw new UnsupportedError('Notation3 syntax (format N3)', 'G1');
    if (typeof input !== 'string') {
      throw new UnsupportedError('parsing a stream or non-string input', 'G2');
    }
    const opts = {};
    if (this._format.tag) opts.format = this._format.tag;
    if (this._options.baseIRI) opts.baseIRI = this._options.baseIRI;
    const ds = await core.parse(input, opts);
    try {
      let quads = ds.toArray();
      if (this._factory) quads = quads.map((q) => withFactory(q, this._factory));
      return { quads, prefixes: { ...ds.prefixes } };
    } finally {
      ds.dispose();
    }
  }

  /**
   * parse(input) answers a Promise of the quads (N3.js answers the array
   * synchronously: divergence D1, the engine parse is asynchronous).
   * parse(input, callback, prefixCallback) and parse(input, {onQuad,
   * onPrefix}) call back as N3.js does, after the engine has read the whole
   * input: each quad, then (null, null, prefixes); or once with an error.
   * `onComment` is not called (gap G3: the engine reports no comments).
   */
  parse(input, quadCallback, prefixCallback) {
    let onQuad, onPrefix;
    if (quadCallback && typeof quadCallback === 'object') {
      onQuad = quadCallback.onQuad;
      onPrefix = quadCallback.onPrefix;
    } else {
      onQuad = quadCallback;
      onPrefix = prefixCallback;
    }
    const result = this._parseAll(input);
    if (!onQuad) return result.then((r) => r.quads);
    result.then(({ quads, prefixes }) => {
      if (onPrefix) {
        const f = this._factory || DataFactory;
        for (const [p, iri] of Object.entries(prefixes)) onPrefix(p, f.namedNode(iri));
      }
      for (const q of quads) onQuad(null, q);
      onQuad(null, null, prefixes);
    }, (error) => onQuad(error, null));
    return undefined;
  }
}

// ---------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------

function quadOf(s, p, o, g) {
  if (p === undefined && s && s.subject) return s;
  return coreFactory.quad(s, p, o, g || coreFactory.defaultGraph());
}

export class Writer {
  constructor(outputStream, options) {
    if (outputStream && typeof outputStream.write !== 'function') {
      options = outputStream;
      outputStream = null;
    }
    this._options = options || {};
    this._outputStream = outputStream || null;
    this._quads = [];
    this._prefixes = {};
    const fmt = typeof this._options.format === 'string' ? this._options.format.toLowerCase() : '';
    this._lineMode = /triple|quad/.test(fmt);
    this._n3 = /n3/.test(fmt);
    this._ended = false;
    if (this._options.prefixes) this.addPrefixes(this._options.prefixes);
  }

  /** One quad as an N-Quads line, written by the engine. Needs ready(). */
  quadToString(subject, predicate, object, graph) {
    needReady('Writer.quadToString');
    return quadToNQuads(quadOf(subject, predicate, object, graph));
  }

  /** Quads as N-Quads lines in the given order, written by the engine. Needs ready(). */
  quadsToString(quads) {
    needReady('Writer.quadsToString');
    return quadsToNQuads(quads);
  }

  addQuad(subject, predicate, object, graph, done) {
    if (predicate === undefined || typeof predicate === 'function') {
      done = predicate;
      this._quads.push(subject);
    } else {
      if (typeof graph === 'function') { done = graph; graph = undefined; }
      this._quads.push(quadOf(subject, predicate, object, graph));
    }
    if (done) done();
  }

  addQuads(quads) {
    for (const q of quads) this._quads.push(q);
  }

  addPrefix(prefix, iri, done) {
    this._prefixes[prefix] = typeof iri === 'string' ? iri : iri.value;
    if (done) done();
  }

  addPrefixes(prefixes, done) {
    for (const [p, iri] of Object.entries(prefixes || {})) this.addPrefix(p, iri);
    if (done) done();
  }

  blank() { throw new UnsupportedError('Writer.blank', 'G5'); }
  list() { throw new UnsupportedError('Writer.list', 'G5'); }

  async _text() {
    if (this._n3) throw new UnsupportedError('writing Notation3', 'G1');
    await ready();
    if (this._lineMode) return quadsToNQuads(this._quads);
    const hasGraphs = this._quads.some((q) => q.graph && q.graph.termType !== 'DefaultGraph');
    const ds = await core.fromQuads(this._quads);
    try {
      const prefixes = Object.keys(this._prefixes).length ? this._prefixes : undefined;
      return await ds.serialize({ format: hasGraphs ? 'trig' : 'turtle', ...(prefixes ? { prefixes } : {}) });
    } finally {
      ds.dispose();
    }
  }

  /** Write everything; done(error, result). Also answers a Promise of the text. */
  end(done) {
    this._ended = true;
    const out = this._text().then((text) => {
      if (this._outputStream) {
        this._outputStream.write(text, 'utf8');
        if (this._options.end !== false && typeof this._outputStream.end === 'function') {
          return new Promise((resolve) => this._outputStream.end(() => resolve(text)));
        }
      }
      return text;
    });
    if (done) out.then((text) => done(null, text), (error) => done(error));
    return out;
  }
}

// ---------------------------------------------------------------------
// Store: an engine Dataset with N3.js's Store methods.
// ---------------------------------------------------------------------

function arg(t) { return t === undefined ? null : t; }

// A key two terms share exactly when the engine writes the same N-Quads
// token for them (for distinct getSubjects() etc.).
function tokenOf(term) {
  return term.termType === 'DefaultGraph' ? '' : termToNQuads(term);
}

export class Store {
  constructor(quads, options) {
    needReady('new Store()');
    if (quads && !(Symbol.iterator in Object(quads))) { options = quads; quads = null; }
    this._ds = emptyDataset.clone();
    this._options = options || {};
    if (quads) this.addQuads(quads);
  }

  static _fromDataset(ds) {
    const s = Object.create(Store.prototype);
    s._ds = ds;
    s._options = {};
    return s;
  }

  get size() { return this._ds.size; }

  addQuad(subject, predicate, object, graph) {
    const q = quadOf(subject, predicate, object, graph);
    if (this._ds.has(q)) return false;
    this._ds.add(q);
    return true;
  }

  addQuads(quads) { for (const q of quads) this.addQuad(q); }

  removeQuad(subject, predicate, object, graph) {
    // N3.js: an incomplete triple is not in the store.
    if (predicate !== undefined && (!subject || !predicate || !object)) return false;
    const q = quadOf(subject, predicate, object, graph);
    if (!this._ds.has(q)) return false;
    this._ds.delete(q);
    return true;
  }

  removeQuads(quads) { for (const q of quads) this.removeQuad(q); }

  // RDF/JS DatasetCore
  add(quad) { this.addQuad(quad); return this; }
  delete(quad) { this.removeQuad(quad); return this; }
  has(subjectOrQuad, predicate, object, graph) {
    if (subjectOrQuad && subjectOrQuad.subject && predicate === undefined) return this._ds.has(subjectOrQuad);
    return this.countQuads(subjectOrQuad, predicate, object, graph) > 0;
  }

  _matchDataset(s, p, o, g) { return this._ds.match(arg(s), arg(p), arg(o), arg(g)); }

  getQuads(subject, predicate, object, graph) {
    const m = this._matchDataset(subject, predicate, object, graph);
    try { return m.toArray(); } finally { m.dispose(); }
  }

  countQuads(subject, predicate, object, graph) {
    const m = this._matchDataset(subject, predicate, object, graph);
    try { return m.size; } finally { m.dispose(); }
  }

  /** A new Store of the matching quads (N3.js also makes it a readable stream: gap G2). */
  match(subject, predicate, object, graph) {
    return Store._fromDataset(this._matchDataset(subject, predicate, object, graph));
  }

  *readQuads(subject, predicate, object, graph) { yield* this.getQuads(subject, predicate, object, graph); }

  [Symbol.iterator]() { return this.getQuads()[Symbol.iterator](); }

  forEach(callback, s, p, o, g) { this.getQuads(s, p, o, g).forEach((q) => callback(q)); }
  every(callback, s, p, o, g) { return this.getQuads(s, p, o, g).every((q) => callback(q)); }
  some(callback, s, p, o, g) { return this.getQuads(s, p, o, g).some((q) => callback(q)); }

  _distinct(position, s, p, o, g) {
    const seen = new Map();
    for (const q of this.getQuads(s, p, o, g)) {
      const t = q[position];
      const k = tokenOf(t);
      if (!seen.has(k)) seen.set(k, t);
    }
    return [...seen.values()];
  }

  getSubjects(predicate, object, graph) { return this._distinct('subject', null, predicate, object, graph); }
  getPredicates(subject, object, graph) { return this._distinct('predicate', subject, null, object, graph); }
  getObjects(subject, predicate, graph) { return this._distinct('object', subject, predicate, null, graph); }
  getGraphs(subject, predicate, object) { return this._distinct('graph', subject, predicate, object, null); }
  forSubjects(cb, p, o, g) { this.getSubjects(p, o, g).forEach((t) => cb(t)); }
  forPredicates(cb, s, o, g) { this.getPredicates(s, o, g).forEach((t) => cb(t)); }
  forObjects(cb, s, p, g) { this.getObjects(s, p, g).forEach((t) => cb(t)); }
  forGraphs(cb, s, p, o) { this.getGraphs(s, p, o).forEach((t) => cb(t)); }

  /** Removes the matching quads. N3.js answers an EventEmitter (gap G2); this answers the Store. */
  removeMatches(subject, predicate, object, graph) {
    for (const q of this.getQuads(subject, predicate, object, graph)) this._ds.delete(q);
    return this;
  }

  deleteGraph(graph) { return this.removeMatches(null, null, null, graph); }

  createBlankNode() { throw new UnsupportedError('Store.createBlankNode', 'G6'); }
  import() { throw new UnsupportedError('Store.import (RDF/JS Sink)', 'G2'); }
  remove() { throw new UnsupportedError('Store.remove (RDF/JS Sink)', 'G2'); }

  /** Release the engine Dataset. */
  dispose() { this._ds.dispose(); }
}

/** N3.js's StreamParser, StreamWriter and Reasoner have no counterpart yet (gaps G2, G7). */
export class StreamParser { constructor() { throw new UnsupportedError('StreamParser', 'G2'); } }
export class StreamWriter { constructor() { throw new UnsupportedError('StreamWriter', 'G2'); } }
export class Reasoner { constructor() { throw new UnsupportedError('Reasoner (N3 rules)', 'G7'); } }

export default {
  ready, DataFactory, Parser, Writer, Store, StreamParser, StreamWriter, Reasoner,
  NamedNode, BlankNode, Literal, Variable, DefaultGraph, Quad, Triple: Quad, UnsupportedError,
};
