// leana: Lang, RDFParser, RDFWriter, RDFDataMgr on strings.
//
// API modelled on Apache Jena org.apache.jena.riot.{Lang, RDFParser,
// RDFWriter, RDFDataMgr} (Apache License 2.0). No Jena code is copied.
//
// Reading text is @factoidal/core parse(), which is asynchronous: parse()
// and read() answer a Promise (Jena's are synchronous). Writing is the
// synchronous Dataset.toString(). leana does not choose a syntax from a file
// name or media type (GAPS.md 'syntax-from-name'): give the Lang. A parse
// reads the whole document first and then adds it to the target, so a syntax
// error leaves the target unchanged (Jena streams into it).

import { parse as coreParse, FactoidalError } from '@factoidal/core';
import { readFileSync, writeFileSync } from 'node:fs';
import { join as pathJoin, isAbsolute } from 'node:path';
import { GraphMem, tripleOf } from './graph.mjs';
import { Node, NodeFactory, Triple, fromRDFJS } from './node.mjs';
import { Model } from './model.mjs';
import { PrefixMappingImpl } from './prefix.mjs';
import { Dataset, DatasetGraph, DatasetGraphFactory, DatasetFactory, Quad } from './dataset.mjs';
import { RiotException, RiotNotFoundException, JenaException, unsupported } from './errors.mjs';

/**
 * An RDF syntax. `read` and `write` are the @factoidal/core format names.
 * The Jena name and label are API naming; content types and file
 * extensions are not here (GAPS.md 'syntax-from-name').
 */
export class LangImpl {
  constructor(name, label, read, write, altNames = []) {
    this._name = name; this._label = label; this.read = read; this.write = write;
    this._alt = Object.freeze([name, ...altNames]);
    Object.freeze(this);
  }
  getName() { return this._name; }
  getLabel() { return this._label; }
  getContentType() { return unsupported('Lang.getContentType', 'syntax-from-name'); }
  getHeaderString() { return unsupported('Lang.getHeaderString', 'syntax-from-name'); }
  getFileExtensions() { return unsupported('Lang.getFileExtensions', 'syntax-from-name'); }
  getAltNames() { return this._alt.slice(); }
  equals(o) { return o === this; }
  toString() { return 'Lang:' + this._label; }
}

// Jena reads RDF 1.2 syntax with every Turtle-family parser; the
// @factoidal/core '...12' readers accept RDF 1.1 and RDF 1.2 text. The names
// and alternative names are Jena's (RDFLanguages), compared ignoring case.
// Jena reads N3 with its Turtle parser ("N3 (treat as Turtle)"); so does leana.
// A Lang with no engine reader or writer (read/write null) is a name only:
// reading or writing it is gap 'syntaxes'.
const TURTLE = new LangImpl('Turtle', 'Turtle', 'turtle12', 'turtle', ['TTL']);
const N3 = new LangImpl('N3', 'N3', 'turtle12', 'turtle');
const NTRIPLES = new LangImpl('N-Triples', 'N-Triples', 'ntriples12', 'ntriples', ['NT', 'NTriples', 'NTriple', 'N-Triple']);
const NQUADS = new LangImpl('N-Quads', 'N-Quads', 'nquads12', 'nquads', ['NQ', 'NQuads', 'NQuad', 'N-Quad']);
const TRIG = new LangImpl('TriG', 'TriG', 'trig12', 'trig');
const RDFXML = new LangImpl('RDF/XML', 'RDF/XML', 'rdfxml', 'rdfxml', ['RDFXML', 'RDF/XML-ABBREV', 'RDFXML-ABBREV']);
const JSONLD = new LangImpl('JSON-LD', 'JSON-LD', 'jsonld', 'jsonld', ['JSONLD']);
const RDFJSON = new LangImpl('RDF/JSON', 'RDF/JSON', null, null, ['RDFJSON']);
const TRIX = new LangImpl('TriX', 'TriX', null, null, ['TRIX']);
const RDFTHRIFT = new LangImpl('RDF-THRIFT', 'RDF-THRIFT', null, null, ['RDF_THRIFT', 'RDFTHRIFT', 'RDF/THRIFT', 'TRDF']);
const RDFPROTO = new LangImpl('RDF-PROTO', 'RDF-PROTO', null, null, ['RDF_PB', 'RDFPB', 'RDF/PB', 'PBRDF']);
const SHACLC = new LangImpl('SHACLC', 'SHACLC', null, null);
// Jena: CSV and TSV are result-set formats, not RDF syntaxes.
const CSV = new LangImpl('CSV', 'CSV', null, null);
const TSV = new LangImpl('TSV', 'TSV', null, null);

const LANGS = { TURTLE, TTL: TURTLE, N3, NTRIPLES, NT: NTRIPLES, NQUADS, NQ: NQUADS, TRIG, RDFXML, JSONLD, RDFJSON, TRIX, RDFTHRIFT, RDFPROTO, SHACLC };
export const Lang = Object.freeze({ ...LANGS, CSV, TSV });

const ALL_LANGS = [TURTLE, N3, NTRIPLES, NQUADS, TRIG, RDFXML, JSONLD, RDFJSON, TRIX, RDFTHRIFT, RDFPROTO, SHACLC];
const BY_NAME = new Map();
for (const l of ALL_LANGS) for (const n of l.getAltNames()) BY_NAME.set(n.toLowerCase(), l);

/** Jena RDFLanguages: by Jena name (API naming); by file name or media type: gap. */
export const RDFLanguages = Object.freeze({
  ...LANGS,
  init() {},
  nameToLang(name) { return name === null || name === undefined ? null : BY_NAME.get(String(name).toLowerCase()) ?? null; },
  shortnameToLang(name) { return RDFLanguages.nameToLang(name); },
  isRegistered(l) { return ALL_LANGS.includes(l); },
  sameLang(a, b) { return a === b; },
  filenameToLang() { return unsupported('RDFLanguages.filenameToLang', 'syntax-from-name'); },
  pathnameToLang() { return unsupported('RDFLanguages.pathnameToLang', 'syntax-from-name'); },
  contentTypeToLang() { return unsupported('RDFLanguages.contentTypeToLang', 'syntax-from-name'); },
  fileExtToLang() { return unsupported('RDFLanguages.fileExtToLang', 'syntax-from-name'); },
  getRegisteredLanguages() { return ALL_LANGS.slice(); },
  isTriples(l) { return [TURTLE, N3, NTRIPLES, RDFXML, JSONLD, RDFJSON, RDFTHRIFT, RDFPROTO].includes(l); },
  isQuads(l) { return [NQUADS, TRIG, JSONLD, TRIX, RDFTHRIFT, RDFPROTO].includes(l); },
});

function readName(lang) {
  if (!lang.read) return unsupported('RIOT read of a syntax the engine does not read (RDF/JSON, TriX, RDF Thrift, RDF Protobuf, SHACLC, CSV)', 'syntaxes');
  return lang.read;
}
function writeName(lang) {
  if (!lang.write) return unsupported('RIOT write of a syntax the engine does not write (RDF/JSON, TriX, RDF Thrift, RDF Protobuf, SHACLC, CSV)', 'syntaxes');
  return lang.write;
}

function langOf(x) {
  if (x instanceof LangImpl) return x;
  if (x && typeof x.getLang === 'function') return x.getLang();
  if (typeof x === 'string') {
    const l = RDFLanguages.nameToLang(x);
    if (l) return l;
  }
  throw new RiotException('No such language: ' + x);
}

/** Jena RDFFormat: a Lang plus a writer variant. leana has one writer per syntax. */
export class RDFFormat {
  constructor(lang, variant) { this._lang = lang; this._variant = variant || 'default'; Object.freeze(this); }
  getLang() { return this._lang; }
  toString() { return this._lang.getLabel() + '/' + this._variant; }
}
RDFFormat.TURTLE = new RDFFormat(TURTLE);
RDFFormat.TTL = RDFFormat.TURTLE;
RDFFormat.NTRIPLES = new RDFFormat(NTRIPLES);
RDFFormat.NT = RDFFormat.NTRIPLES;
RDFFormat.NQUADS = new RDFFormat(NQUADS);
RDFFormat.TRIG = new RDFFormat(TRIG);
RDFFormat.RDFXML = new RDFFormat(RDFXML);
RDFFormat.JSONLD = new RDFFormat(JSONLD);
Object.freeze(RDFFormat);

/** java.io.StringReader stand-in: text to read. */
export class StringReader {
  constructor(text) { this.text = String(text); Object.freeze(this); }
}

/** java.io.StringWriter stand-in: collects text written to it. */
export class StringWriter {
  constructor() { this._parts = []; }
  write(s) { this._parts.push(String(s)); }
  toString() { return this._parts.join(''); }
}

// ---------------------------------------------------------------------------
// Error handlers (Jena org.apache.jena.riot.system.ErrorHandler)

/**
 * An error handler has warning(message, line, col), error(...) and
 * fatal(...). After error or fatal the parse ends with a RiotException even
 * when the handler returns (Jena's parsers stop at the first error too).
 */
class ErrorHandlerNamed {
  constructor(name, { throwOnWarning = false, throwOnError = true } = {}) {
    this.name = name; this._tw = throwOnWarning; this._te = throwOnError; Object.freeze(this);
  }
  warning(message, line, col) { if (this._tw) throw new RiotException(fmt(message, line, col)); }
  error(message, line, col) { if (this._te) throw new RiotException(fmt(message, line, col)); }
  fatal(message, line, col) { throw new RiotException(fmt(message, line, col)); }
  toString() { return this.name; }
}
function fmt(message, line, col) {
  return line > 0 ? `[line: ${line}, col: ${col}] ${message}` : String(message);
}

const errorHandlerStd = new ErrorHandlerNamed('errorHandlerStd');
let defaultErrorHandler = errorHandlerStd;

/** Jena ErrorHandlerFactory: the named handlers and the default one. Jena logs; leana's handlers do not write to the console. */
export const ErrorHandlerFactory = Object.freeze({
  errorHandlerStd,
  errorHandlerStrict: new ErrorHandlerNamed('errorHandlerStrict', { throwOnWarning: true }),
  errorHandlerWarn: new ErrorHandlerNamed('errorHandlerWarn', { throwOnError: false }),
  errorHandlerNoLogging: new ErrorHandlerNamed('errorHandlerNoLogging'),
  errorHandlerExceptions: new ErrorHandlerNamed('errorHandlerExceptions'),
  errorHandlerStrictNoLogging: new ErrorHandlerNamed('errorHandlerStrictNoLogging', { throwOnWarning: true }),
  errorHandlerSimple() { return new ErrorHandlerNamed('errorHandlerSimple'); },
  errorHandlerWarning: new ErrorHandlerNamed('errorHandlerWarning', { throwOnError: false }),
  getDefaultErrorHandler() { return defaultErrorHandler; },
  setDefaultErrorHandler(h) { defaultErrorHandler = h || errorHandlerStd; },
});

// ---------------------------------------------------------------------------
// Parser term factory and blank node label policy

/** Jena FactoryRDFStd: the parser makes every term and triple through it (subclass to observe or change). */
export class FactoryRDFStd {
  createURI(uriStr) { return NodeFactory.createURI(uriStr); }
  createBlankNode(label) { return label === undefined ? NodeFactory.createBlankNode() : NodeFactory.createBlankNode(label); }
  createStringLiteral(lex) { return NodeFactory.createLiteralString(lex); }
  createLangLiteral(lex, lang) { return NodeFactory.createLiteralLang(lex, lang); }
  createLangDirLiteral(lex, lang, dir) { return NodeFactory.createLiteralDirLang(lex, lang, dir); }
  createTypedLiteral(lex, dt) { return NodeFactory.createLiteralDT(lex, dt); }
  createTripleTerm(s, p, o) { return NodeFactory.createTripleTerm(s, p, o); }
  createTriple(s, p, o) { return Triple.create(s, p, o); }
  createQuad(g, s, p, o) { return Quad.create(g, s, p, o); }
  reset() {}
}

/** A term read by the engine, made again through a FactoryRDFStd. */
function viaFactory(f, n) {
  if (n.isURI()) return f.createURI(n.getURI());
  if (n.isBlank()) return f.createBlankNode(n.getBlankNodeLabel());
  if (n.isTripleTerm()) {
    const t = n.getTriple();
    return f.createTripleTerm(viaFactory(f, t.getSubject()), viaFactory(f, t.getPredicate()), viaFactory(f, t.getObject()));
  }
  if (n.isLiteral()) {
    const lang = n.getLiteralLanguage();
    const dir = n.getLiteralBaseDirection ? n.getLiteralBaseDirection() : null;
    if (lang && dir) return f.createLangDirLiteral(n.getLiteralLexicalForm(), lang, dir);
    if (lang) return f.createLangLiteral(n.getLiteralLexicalForm(), lang);
    const dt = n.getLiteralDatatypeURI();
    if (dt === NodeFactory.createLiteralString('').getLiteralDatatypeURI()) return f.createStringLiteral(n.getLiteralLexicalForm());
    return f.createTypedLiteral(n.getLiteralLexicalForm(), n.getLiteralDatatype());
  }
  return n;
}

class LabelPolicy {
  constructor(name) { this.name = name; Object.freeze(this); }
  toString() { return this.name; }
}
/** Jena LabelToNode: blank node label policies of a parse. */
export const LabelToNode = Object.freeze({
  /** Each document gets fresh blank nodes: what @factoidal/core parse() does. */
  createScopeByDocumentHash() { return new LabelPolicy('scopeByDocument'); },
  createScopeByDocumentOld() { return new LabelPolicy('scopeByDocument'); },
  createIncrementalLabels() { return new LabelPolicy('scopeByDocument'); },
  /** Keep the label of the document (gap 'syntaxes': @factoidal/core has no such parse option). */
  createUseLabelAsGiven() { return new LabelPolicy('asGiven'); },
  createUseLabelEncoded() { return new LabelPolicy('asGiven'); },
});

// ---------------------------------------------------------------------------
// Sources: files, StreamManager, HTTP

/** Jena LocatorFile: opens file names relative to a directory (or as given). */
export class LocatorFile {
  constructor(dir = null) { this._dir = dir; }
  _path(name) {
    let p = String(name);
    if (p.startsWith('file:')) p = decodeURIComponent(p.replace(/^file:(\/\/)?/, ''));
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) return null;
    return this._dir && !isAbsolute(p) ? pathJoin(this._dir, p) : p;
  }
  /** The text of the file, or null when there is none. */
  open(name) {
    const p = this._path(name);
    if (p === null) return null;
    try { return readFileSync(p, 'utf8'); } catch { return null; }
  }
  exists(name) { return this.open(name) !== null; }
  getName() { return 'LocatorFile(' + (this._dir ?? '') + ')'; }
}

/** Jena StreamManager: a list of locators tried in order. */
export class StreamManager {
  constructor() { this._locators = []; }
  static get() { return GLOBAL_SM; }
  static makeDefaultStreamManager() { const sm = new StreamManager(); sm.addLocator(new LocatorFile()); return sm; }
  addLocator(l) { this._locators.push(l); return this; }
  locators() { return this._locators.slice(); }
  clearLocators() { this._locators = []; }
  /** The text at `name` (StreamManager.open answers a TypedInputStream in Jena), or null. */
  open(name) {
    for (const l of this._locators) { const t = l.open(name); if (t !== null) return t; }
    return null;
  }
  clone() { const sm = new StreamManager(); sm._locators = this._locators.slice(); return sm; }
}
const GLOBAL_SM = StreamManager.makeDefaultStreamManager();

function isHttp(p) { return /^https?:\/\//i.test(String(p)); }

function readSource(path, sm = null) {
  let p = String(path);
  if (sm) {
    const t = sm.open(p);
    if (t === null) throw new RiotNotFoundException('Not found: ' + path);
    return t;
  }
  if (p.startsWith('file:')) p = decodeURIComponent(p.replace(/^file:(\/\/)?/, ''));
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) throw new RiotNotFoundException('Not found (not a file): ' + path);
  try {
    return readFileSync(p, 'utf8');
  } catch (e) {
    throw new RiotNotFoundException('Not found: ' + path, { cause: e });
  }
}

/** An HTTP(S) source: the body text (fetch). The media type is not used to choose a syntax (gap 'syntax-from-name'). */
async function fetchSource(url) {
  let r;
  try { r = await fetch(url, { headers: { accept: 'text/turtle, application/n-triples, application/n-quads, application/trig, application/rdf+xml, application/ld+json;q=0.9, */*;q=0.1' } }); } catch (e) {
    throw new RiotNotFoundException('Not found: ' + url, { cause: e });
  }
  if (!r.ok) throw new RiotNotFoundException(`Not found: ${url} (HTTP ${r.status})`);
  return r.text();
}

// ---------------------------------------------------------------------------
// Targets: Graph, Model, DatasetGraph, Dataset

function graphOf(target) {
  if (target instanceof Model) return target.getGraph();
  if (target instanceof GraphMem) return target;
  if (target && typeof target.find === 'function' && typeof target.add === 'function' && typeof target.getPrefixMapping === 'function' && !(target instanceof DatasetGraph)) return target;
  if (target && typeof target.getGraph === 'function' && !(target instanceof DatasetGraph) && !(target instanceof Dataset)) return target.getGraph();
  return null;
}
function dsgOf(target) {
  if (target instanceof Dataset) return target.asDatasetGraph();
  if (target instanceof DatasetGraph) return target;
  return null;
}

/** Add the prefixes of an initial PrefixMap (RDFParser.prefixes) as Turtle/TriG PREFIX lines on the first line. */
function withPrefixes(text, lang, pm) {
  if (!pm || !(lang === TURTLE || lang === N3 || lang === TRIG)) return { text, lines: 0 };
  const map = typeof pm.getNsPrefixMap === 'function' ? pm.getNsPrefixMap() : pm instanceof Map ? pm : new Map(Object.entries(pm));
  const decl = [...map].map(([k, v]) => `PREFIX ${k}: <${v}>`).join(' ');
  return decl ? { text: decl + '\n' + text, lines: 1 } : { text, lines: 0 };
}

/**
 * Parse `text` in `lang` into `target` (Graph, Model, DatasetGraph or
 * Dataset). A graph keeps the default graph; quads in named graphs are a
 * warning (Jena: "Only triples or default graph data expected").
 */
async function parseInto(target, text, lang, opts = {}) {
  const g = graphOf(target);
  const dsg = g ? null : dsgOf(target);
  if (!g && !dsg) throw new TypeError('parse target must be a Graph, a Model, a DatasetGraph or a Dataset');
  const eh = opts.errorHandler || defaultErrorHandler;
  if (opts.labels && opts.labels.name === 'asGiven') return unsupported('LabelToNode.createUseLabelAsGiven', 'syntaxes');
  const pre = withPrefixes(text, lang, opts.prefixes);
  const po = { format: readName(lang) };
  if (opts.base) po.baseIRI = opts.base;
  let ds;
  try {
    ds = await coreParse(pre.text, po);
  } catch (e) {
    if (!(e instanceof FactoidalError)) throw e;
    const pos = e.position;
    const line = pos ? pos.line - pre.lines : -1, col = pos ? pos.column : -1;
    try { eh.fatal(e.message, line, col); } catch (x) {
      if (x instanceof RiotException) throw new RiotException(x.message, { cause: e });
      throw x;
    }
    throw new RiotException(fmt(e.message, line, col), { cause: e });
  }
  try {
    for (const w of ds.warnings || []) eh.warning(w.message, w.line - pre.lines, w.column);
    const f = opts.factory || null;
    const conv = (t) => (f ? viaFactory(f, fromRDFJS(t)) : fromRDFJS(t));
    if (g) {
      let named = false;
      for (const q of ds) {
        if (q.graph.termType !== 'DefaultGraph') { named = true; continue; }
        g.add(f ? f.createTriple(conv(q.subject), conv(q.predicate), conv(q.object)) : tripleOf(q));
      }
      if (named) eh.warning('Only triples or default graph data expected : named graph data ignored', -1, -1);
      g.getPrefixMapping().setNsPrefixes(ds.prefixes || {});
    } else {
      for (const q of ds) {
        const gn = q.graph.termType === 'DefaultGraph' ? Quad.defaultGraphIRI : conv(q.graph);
        dsg.add(f ? f.createQuad(gn, conv(q.subject), conv(q.predicate), conv(q.object)) : Quad.create(gn, conv(q.subject), conv(q.predicate), conv(q.object)));
      }
      dsg.getPrefixMapping().setNsPrefixes(ds.prefixes || {});
    }
  } finally {
    ds.dispose();
  }
}

export class RDFParserBuilder {
  static create() { return new RDFParserBuilder(); }
  constructor() {
    this._text = null; this._path = null; this._lang = null; this._force = null; this._base = null;
    this._eh = null; this._sm = null; this._labels = null; this._factory = null; this._prefixes = null;
    this._strict = false; this._checking = true;
  }
  fromString(s) { this._text = String(s); this._path = null; return this; }
  /** source(path | 'file:' IRI | http(s) URL | StringReader). The last source wins. */
  source(path) {
    if (path instanceof StringReader) return this.fromString(path.text);
    this._path = String(path); this._text = null; return this;
  }
  lang(l) { this._lang = langOf(l); return this; }
  forceLang(l) { this._force = langOf(l); return this; }
  base(b) { this._base = b; return this; }
  errorHandler(h) { this._eh = h; return this; }
  streamManager(sm) { this._sm = sm; return this; }
  labelToNode(policy) { this._labels = policy; return this; }
  factory(f) { this._factory = f; return this; }
  /** Prefixes the parse knows before the text starts (Turtle, N3 and TriG). */
  prefixes(pm) { this._prefixes = pm; return this; }
  /** canonicalValues(false) is the default (lexical forms kept); true needs the engine's canonical forms. */
  canonicalValues(flag) {
    if (flag) return unsupported('RDFParser.canonicalValues(true)', 'literal-value');
    return this;
  }
  /**
   * Jena strict mode and checking. @factoidal/core always parses by the
   * specification (strict) and always checks IRIs and terms; the flags are
   * kept for the builder's shape and change nothing.
   */
  strict(flag = true) { this._strict = !!flag; return this; }
  checking(flag = true) { this._checking = !!flag; return this; }
  build() { return this; }
  async _text_() {
    if (this._text !== null) return this._text;
    if (this._path === null) throw new RiotException('No source specified');
    if (isHttp(this._path) && !this._sm) return fetchSource(this._path);
    return readSource(this._path, this._sm);
  }
  /** Parse into a Graph, Model, DatasetGraph or Dataset. Answers a Promise (the engine's parse is asynchronous). */
  async parse(target) {
    const lang = this._force || this._lang;
    const fromText = this._text !== null;
    const text = await this._text_();
    if (!lang) {
      if (!fromText) return unsupported('RDFParser.source(path) with no lang (syntax from the file name)', 'syntax-from-name');
      throw new RiotException('No language specified');
    }
    await parseInto(target, text, lang, {
      base: this._base, errorHandler: this._eh, labels: this._labels, factory: this._factory, prefixes: this._prefixes,
    });
  }
  /** Parse and answer a new Graph. */
  async toGraph() { const g = new GraphMem(); await this.parse(g); return g; }
  async toModel() { const m = new Model(); await this.parse(m); return m; }
  /** Parse and answer a new DatasetGraph (nothing is answered when the parse fails). */
  async toDatasetGraph() { const d = DatasetGraphFactory.createTxnMem(); await this.parse(d); return d; }
  async toDataset() { const d = DatasetFactory.createTxnMem(); await this.parse(d); return d; }
}

export const RDFParser = Object.freeze({
  create() { return new RDFParserBuilder(); },
  fromString(s, lang) { const b = new RDFParserBuilder().fromString(s); return lang ? b.lang(lang) : b; },
  source(path) { return new RDFParserBuilder().source(path); },
});

function writeText(src, lang) {
  const format = writeName(lang);
  let ds, temp = false, pm;
  const dsg = dsgOf(src);
  if (dsg) {
    ({ ds, temp } = dsg._coreDatasetSync());
    pm = dsg.getPrefixMapping();
  } else {
    const g = graphOf(src);
    if (!g) throw new TypeError('write source must be a Graph, a Model, a DatasetGraph or a Dataset');
    pm = g.getPrefixMapping();
    if (g.dataset) ds = g.dataset;
    else {
      // A graph not held in one core Dataset (composition graphs, GraphBase): copy its triples.
      ({ ds, temp } = DatasetGraphFactory.wrap(g)._coreDatasetSync());
    }
  }
  const opts = { format };
  if (format === 'turtle' || format === 'trig') opts.prefixes = Object.fromEntries(pm.getNsPrefixMap());
  try {
    return ds.toString(opts);
  } catch (e) {
    throw new RiotException(e.message, { cause: e });
  } finally {
    if (temp) ds.dispose();
  }
}

export class RDFWriterBuilder {
  constructor() { this._src = null; this._lang = null; }
  source(g) { this._src = g; return this; }
  lang(l) { this._lang = langOf(l); return this; }
  format(f) { this._lang = langOf(f); return this; }
  /** Relative IRIs against a base need the engine's IRI relativisation (gap 'syntaxes'). */
  base() { return unsupported('RDFWriter.base', 'syntaxes'); }
  build() {
    if (!this._src) throw new RiotException('No source to write');
    return this;
  }
  asString() {
    if (!this._src) throw new RiotException('No source to write');
    if (!this._lang) throw new RiotException('No syntax to write');
    return writeText(this._src, this._lang);
  }
  toString() { return this.asString(); }
  /** output(out): `out` has write(string); output(path): the file is written (UTF-8). */
  output(out) {
    const text = this.asString();
    if (out && typeof out.write === 'function') { out.write(text); return; }
    if (typeof out === 'string') {
      try { writeFileSync(out.replace(/^file:(\/\/)?/, ''), text, 'utf8'); } catch (e) { throw new RiotException('Failed to write ' + out, { cause: e }); }
      return;
    }
    throw new TypeError('RDFWriter.output: a path or an object with write(string)');
  }
}

export const RDFWriter = Object.freeze({
  create() { return new RDFWriterBuilder(); },
  source(g) { return new RDFWriterBuilder().source(g); },
});

export const RDFDataMgr = Object.freeze({
  /**
   * read(target, StringReader, base, lang) | read(target, path, lang) |
   * read(target, path, base, lang). Answers a Promise.
   */
  async read(target, input, a, b) {
    let base = null, lang = null;
    if (b !== undefined) { base = a; lang = b; } else if (a instanceof LangImpl || a instanceof RDFFormat) { lang = a; } else { base = a ?? null; }
    const builder = new RDFParserBuilder();
    if (input instanceof StringReader) builder.fromString(input.text); else builder.source(input);
    if (lang) builder.lang(lang);
    if (base) builder.base(base);
    return builder.parse(target);
  },
  async loadModel(path, lang) { const m = new Model(); await RDFDataMgr.read(m, path, lang); return m; },
  async loadGraph(path, lang) { const g = new GraphMem(); await RDFDataMgr.read(g, path, lang); return g; },
  /** write(out, Graph | Model, Lang | RDFFormat); `out` has write(string). */
  write(out, src, lang) {
    if (lang === undefined) throw new RiotException('No syntax to write');
    new RDFWriterBuilder().source(src).lang(lang).output(out);
  },
  determineLang() { return unsupported('RDFDataMgr.determineLang', 'syntax-from-name'); },
  /** Open a file: its text as a StringReader (Jena: a TypedInputStream; the content type is not kept). */
  open(path) { return new StringReader(readSource(path)); },
  async loadDataset(path, lang) { const d = DatasetFactory.createTxnMem(); await RDFDataMgr.read(d, path, lang); return d; },
  async loadDatasetGraph(path, lang) { const d = DatasetGraphFactory.createTxnMem(); await RDFDataMgr.read(d, path, lang); return d; },
});

/** Model.read / Model.write in the Jena style, on strings. */
export function installModelIO() {
  Model.prototype.read = async function read(input, base, lang) {
    if (lang === null) lang = undefined; // Jena: a null lang means "choose from the source"
    if (typeof input === 'string' && !(input instanceof StringReader)) {
      // Jena Model.read(String url[, lang]): a file path here.
      if (lang === undefined && base !== undefined && (typeof base === 'string' && RDFLanguages.nameToLang(base))) {
        await RDFDataMgr.read(this, input, langOf(base));
      } else {
        await RDFDataMgr.read(this, input, base ?? null, lang === undefined ? undefined : langOf(lang));
      }
      return this;
    }
    // Jena Model.read(InputStream | Reader, base): no lang is RDF/XML (RDFReaderFImpl.DEFAULTLANG).
    await RDFDataMgr.read(this, input, base ?? null, lang === undefined ? RDFXML : langOf(lang));
    return this;
  };
  Model.prototype.write = function write(out, lang, base) {
    if (base !== undefined && base !== null) return unsupported('Model.write(out, lang, base)', 'syntaxes');
    // Jena's default syntax of Model.write is RDF/XML.
    RDFDataMgr.write(out, this, lang === undefined || lang === null ? RDFXML : langOf(lang));
    return this;
  };
}

export { JenaException };

/** Jena RIOT PrefixMapFactory: a leana PrefixMapping with the given entries. */
export const PrefixMapFactory = Object.freeze({
  create(entries) {
    const pm = new PrefixMappingImpl();
    if (entries) pm.setNsPrefixes(entries);
    return pm;
  },
});
/**
 * Jena RDFReaderFactoryRIOT: the Jena 2 RDFReaderI adapters. getReader(name)
 * answers a reader whose read(model, source[, base]) is RDFDataMgr.read with
 * that syntax. Answers a Promise.
 */
export class RDFReaderFactoryRIOT {
  getReader(name) {
    const lang = name === null || name === undefined ? RDFXML : langOf(name);
    let eh = null;
    return {
      read(model, input, base = null) {
        const b = new RDFParserBuilder().lang(lang);
        if (input instanceof StringReader) b.fromString(input.text); else b.source(input);
        if (base) b.base(base);
        if (eh) b.errorHandler(eh);
        return b.parse(model);
      },
      setErrorHandler(h) { const old = eh; eh = h; return old; },
      setProperty() { return null; },
    };
  }
}
