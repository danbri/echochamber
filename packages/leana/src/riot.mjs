// leana: Lang, RDFParser, RDFWriter, RDFDataMgr on strings.
//
// API modelled on Apache Jena org.apache.jena.riot.{Lang, RDFParser,
// RDFWriter, RDFDataMgr} (Apache License 2.0). No Jena code is copied.
//
// Reading text is @factoidal/core parse(), which is asynchronous: parse()
// and read() answer a Promise (Jena's are synchronous). Writing is the
// synchronous Dataset.toString(). leana does not choose a syntax from a file
// name or media type (GAPS.md 'syntax-from-name'): give the Lang.

import { parse as coreParse } from '@factoidal/core';
import { readFileSync } from 'node:fs';
import { GraphMem, tripleOf } from './graph.mjs';
import { Model } from './model.mjs';
import { PrefixMappingImpl } from './prefix.mjs';
import { RiotException, RiotNotFoundException, JenaException, unsupported } from './errors.mjs';

/**
 * An RDF syntax. `read` and `write` are the @factoidal/core format names.
 * The Jena name and label are API naming; content types and file
 * extensions are not here (GAPS.md 'syntax-from-name').
 */
export class LangImpl {
  constructor(name, label, read, write) {
    this._name = name; this._label = label; this.read = read; this.write = write;
    Object.freeze(this);
  }
  getName() { return this._name; }
  getLabel() { return this._label; }
  getContentType() { return unsupported('Lang.getContentType', 'syntax-from-name'); }
  getHeaderString() { return unsupported('Lang.getHeaderString', 'syntax-from-name'); }
  getFileExtensions() { return unsupported('Lang.getFileExtensions', 'syntax-from-name'); }
  getAltNames() { return [this._name]; }
  equals(o) { return o === this; }
  toString() { return 'Lang:' + this._label; }
}

// Jena reads RDF 1.2 syntax with every Turtle-family parser; the
// @factoidal/core '...12' readers accept RDF 1.1 and RDF 1.2 text.
const TURTLE = new LangImpl('Turtle', 'Turtle', 'turtle12', 'turtle');
const NTRIPLES = new LangImpl('N-Triples', 'N-Triples', 'ntriples12', 'ntriples');
const NQUADS = new LangImpl('N-Quads', 'N-Quads', 'nquads12', 'nquads');
const TRIG = new LangImpl('TriG', 'TriG', 'trig12', 'trig');
const RDFXML = new LangImpl('RDF/XML', 'RDF/XML', 'rdfxml', 'rdfxml');
const JSONLD = new LangImpl('JSON-LD', 'JSON-LD', 'jsonld', 'jsonld');

export const Lang = Object.freeze({
  TURTLE, TTL: TURTLE, NTRIPLES, NT: NTRIPLES, NQUADS, NQ: NQUADS, TRIG, RDFXML, JSONLD,
  get N3() { return unsupported('Lang.N3', 'echo'); },
  get RDFJSON() { return unsupported('Lang.RDFJSON', 'echo'); },
  get TRIX() { return unsupported('Lang.TRIX', 'echo'); },
  get RDFTHRIFT() { return unsupported('Lang.RDFTHRIFT', 'echo'); },
  get RDFPROTO() { return unsupported('Lang.RDFPROTO', 'echo'); },
  get CSV() { return unsupported('Lang.CSV', 'echo'); },
  get SHACLC() { return unsupported('Lang.SHACLC', 'echo'); },
});

const ALL_LANGS = [TURTLE, NTRIPLES, NQUADS, TRIG, RDFXML, JSONLD];

/** Jena RDFLanguages: by Jena name (API naming); by file name or media type: gap. */
export const RDFLanguages = Object.freeze({
  // Jena RDFLanguages repeats the Lang constants.
  TURTLE, TTL: TURTLE, NTRIPLES, NT: NTRIPLES, NQUADS, NQ: NQUADS, TRIG, RDFXML, JSONLD,
  get N3() { return unsupported('RDFLanguages.N3', 'echo'); },
  get RDFJSON() { return unsupported('RDFLanguages.RDFJSON', 'echo'); },
  get TRIX() { return unsupported('RDFLanguages.TRIX', 'echo'); },
  init() {},
  nameToLang(name) {
    // Jena's names and labels (their spelling is API naming, not a syntax decision).
    // Jena's labels and alternative names (RDFLanguages, compared ignoring case).
    const NAMES = {
      'turtle': TURTLE, 'ttl': TURTLE,
      'n-triples': NTRIPLES, 'ntriples': NTRIPLES, 'ntriple': NTRIPLES, 'n-triple': NTRIPLES, 'nt': NTRIPLES,
      'n-quads': NQUADS, 'nquads': NQUADS, 'nquad': NQUADS, 'n-quad': NQUADS, 'nq': NQUADS,
      'trig': TRIG,
      'rdf/xml': RDFXML, 'rdfxml': RDFXML, 'rdf/xml-abbrev': RDFXML, 'rdfxml-abbrev': RDFXML,
      'json-ld': JSONLD, 'jsonld': JSONLD,
    };
    // Jena's N3 name: Lang.N3 is not in leana (gap 'echo').
    if (String(name).toLowerCase() === 'n3') return Lang.N3;
    return NAMES[String(name).toLowerCase()] ?? null;
  },
  filenameToLang() { return unsupported('RDFLanguages.filenameToLang', 'syntax-from-name'); },
  pathnameToLang() { return unsupported('RDFLanguages.pathnameToLang', 'syntax-from-name'); },
  contentTypeToLang() { return unsupported('RDFLanguages.contentTypeToLang', 'syntax-from-name'); },
  fileExtToLang() { return unsupported('RDFLanguages.fileExtToLang', 'syntax-from-name'); },
  getRegisteredLanguages() { return ALL_LANGS.slice(); },
  isTriples(l) { return l === TURTLE || l === NTRIPLES || l === RDFXML || l === JSONLD; },
  isQuads(l) { return l === NQUADS || l === TRIG || l === JSONLD; },
});

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

function graphOf(target) {
  if (target instanceof GraphMem) return target;
  if (target instanceof Model) return target.getGraph();
  if (target && typeof target.getGraph === 'function') return target.getGraph();
  throw new TypeError('parse target must be a Graph or a Model');
}

/** Parse `text` in `lang` into `target` (Graph or Model). The default graph is kept. */
async function parseInto(target, text, lang, base) {
  const g = graphOf(target);
  const opts = { format: lang.read };
  if (base) opts.baseIRI = base;
  let ds;
  try {
    ds = await coreParse(text, opts);
  } catch (e) {
    throw new RiotException(e.message, { cause: e });
  }
  try {
    for (const q of ds) if (q.graph.termType === 'DefaultGraph') g.add(tripleOf(q));
    g.getPrefixMapping().setNsPrefixes(ds.prefixes || {});
  } finally {
    ds.dispose();
  }
}

function readSource(path) {
  let p = String(path);
  if (p.startsWith('file:')) p = decodeURIComponent(p.replace(/^file:(\/\/)?/, ''));
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p)) return unsupported('RDFParser.source(URL) (HTTP)', 'echo');
  try {
    return readFileSync(p, 'utf8');
  } catch (e) {
    throw new RiotNotFoundException('Not found: ' + path, { cause: e });
  }
}

export class RDFParserBuilder {
  static create() { return new RDFParserBuilder(); }
  constructor() { this._text = null; this._path = null; this._lang = null; this._force = null; this._base = null; }
  fromString(s) { this._text = String(s); this._path = null; return this; }
  /** source(path | 'file:' IRI | StringReader). The last source wins. */
  source(path) {
    if (path instanceof StringReader) return this.fromString(path.text);
    this._path = String(path); this._text = null; return this;
  }
  lang(l) { this._lang = langOf(l); return this; }
  forceLang(l) { this._force = langOf(l); return this; }
  base(b) { this._base = b; return this; }
  errorHandler() { return unsupported('RDFParser.errorHandler', 'echo'); }
  streamManager() { return unsupported('RDFParser.streamManager', 'echo'); }
  labelToNode() { return unsupported('RDFParser.labelToNode', 'echo'); }
  factory() { return unsupported('RDFParser.factory', 'echo'); }
  prefixes() { return unsupported('RDFParser.prefixes (initial prefix map)', 'echo'); }
  /** canonicalValues(false) is the default (lexical forms kept); true needs the engine's canonical forms. */
  canonicalValues(flag) {
    if (flag) return unsupported('RDFParser.canonicalValues(true)', 'literal-value');
    return this;
  }
  toDatasetGraph() { return unsupported('RDFParser.toDatasetGraph (datasets: stage 2)', 'echo'); }
  toDataset() { return unsupported('RDFParser.toDataset (datasets: stage 2)', 'echo'); }
  strict() { return unsupported('RDFParser.strict', 'echo'); }
  checking() { return unsupported('RDFParser.checking', 'echo'); }
  build() { return this; }
  /** Parse into a Graph or Model. Answers a Promise (the engine's parse is asynchronous). */
  async parse(target) {
    const lang = this._force || this._lang;
    let text = this._text;
    if (text === null) {
      if (this._path === null) throw new RiotException('No source specified');
      text = readSource(this._path);
      if (!lang) return unsupported('RDFParser.source(path) with no lang (syntax from the file name)', 'syntax-from-name');
    }
    if (!lang) throw new RiotException('No language specified');
    await parseInto(target, text, lang, this._base);
  }
  /** Parse and answer a new Graph. */
  async toGraph() { const g = new GraphMem(); await this.parse(g); return g; }
  async toModel() { const m = new Model(); await this.parse(m); return m; }
}

export const RDFParser = Object.freeze({
  create() { return new RDFParserBuilder(); },
  fromString(s, lang) { const b = new RDFParserBuilder().fromString(s); return lang ? b.lang(lang) : b; },
  source(path) { return new RDFParserBuilder().source(path); },
});

function writeText(src, lang) {
  const g = graphOf(src);
  const prefixes = Object.fromEntries(g.getPrefixMapping().getNsPrefixMap());
  const opts = { format: lang.write };
  if (lang.write === 'turtle' || lang.write === 'trig') opts.prefixes = prefixes;
  try {
    return g.dataset.toString(opts);
  } catch (e) {
    throw new RiotException(e.message, { cause: e });
  }
}

export class RDFWriterBuilder {
  constructor() { this._src = null; this._lang = null; }
  source(g) { this._src = g; return this; }
  lang(l) { this._lang = langOf(l); return this; }
  format(f) { this._lang = langOf(f); return this; }
  base() { return unsupported('RDFWriter.base', 'echo'); }
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
  output(out) {
    const text = this.asString();
    if (out && typeof out.write === 'function') { out.write(text); return; }
    return unsupported('RDFWriter.output(path)', 'echo');
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
  loadDataset() { return unsupported('RDFDataMgr.loadDataset (datasets: stage 2)', 'echo'); },
  loadDatasetGraph() { return unsupported('RDFDataMgr.loadDatasetGraph (datasets: stage 2)', 'echo'); },
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
    await RDFDataMgr.read(this, input, base ?? null, lang === undefined ? undefined : langOf(lang));
    return this;
  };
  Model.prototype.write = function write(out, lang, base) {
    if (base !== undefined && base !== null) return unsupported('Model.write(out, lang, base)', 'echo');
    // Jena's default syntax of Model.write is RDF/XML.
    RDFDataMgr.write(out, this, lang === undefined || lang === null ? RDFXML : langOf(lang));
    return this;
  };
}

export { JenaException };

/** Jena ErrorHandlerFactory: named handlers only; RDFParser.errorHandler is not in leana. */
export const ErrorHandlerFactory = Object.freeze({
  errorHandlerStd: Object.freeze({ name: 'errorHandlerStd' }),
  errorHandlerStrict: Object.freeze({ name: 'errorHandlerStrict' }),
  errorHandlerWarn: Object.freeze({ name: 'errorHandlerWarn' }),
  errorHandlerNoLogging: Object.freeze({ name: 'errorHandlerNoLogging' }),
  getDefaultErrorHandler() { return unsupported('ErrorHandlerFactory.getDefaultErrorHandler', 'echo'); },
  setDefaultErrorHandler() { return unsupported('ErrorHandlerFactory.setDefaultErrorHandler', 'echo'); },
});

/** Jena StreamManager / LocatorFile: not in leana. */
export class StreamManager { constructor() { unsupported('StreamManager', 'echo'); } }
export class LocatorFile { constructor() { unsupported('LocatorFile', 'echo'); } }
/** Jena LabelToNode (blank node label policy of a parse): not in leana. */
export const LabelToNode = Object.freeze({
  createUseLabelAsGiven() { return unsupported('LabelToNode.createUseLabelAsGiven', 'echo'); },
  createScopeByDocumentHash() { return unsupported('LabelToNode.createScopeByDocumentHash', 'echo'); },
});
/** Jena FactoryRDFStd (term factory of a parse): not in leana. */
export class FactoryRDFStd { constructor() { unsupported('FactoryRDFStd', 'echo'); } }
/** Jena RIOT PrefixMapFactory: a leana PrefixMapping with the given entries. */
export const PrefixMapFactory = Object.freeze({
  create(entries) {
    const pm = new PrefixMappingImpl();
    if (entries) pm.setNsPrefixes(entries);
    return pm;
  },
});
/** Jena RDFReaderFactoryRIOT (the Jena 2 RDFReaderI adapters): not in leana. */
export class RDFReaderFactoryRIOT {
  getReader() { return unsupported('RDFReaderFactoryRIOT.getReader', 'echo'); }
}
