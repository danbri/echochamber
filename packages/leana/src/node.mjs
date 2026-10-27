// leana: Node, NodeFactory, Triple.
//
// API modelled on Apache Jena org.apache.jena.graph.{Node, NodeFactory,
// Triple} (Apache License 2.0). No Jena code is copied. A leana Node wraps an
// RDF/JS term of @factoidal/core. Term equality is decided by the engine: two
// concrete nodes are equal when @factoidal/core writes them as the same
// N-Quads term (termToNQuads), so for example language-tag case follows the
// engine.

import { dataFactory as df } from '@factoidal/core';
import { termToNQuads, nquadsToQuads, XSD_STRING, RDF_LANGSTRING } from '@factoidal/core/rdfjs';
import { UnsupportedOperationException, JenaException, unsupported, engineCall } from './errors.mjs';

const HELPER_S = df.namedNode('urn:leana:s');
const HELPER_P = df.namedNode('urn:leana:p');

/** The engine's form of an object term, read back (language tags as the engine writes them). */
function engineObjectTerm(term) {
  const line = engineCall(() => termToNQuads(HELPER_S) + ' ' + termToNQuads(HELPER_P) + ' ' + termToNQuads(term) + ' .');
  const qs = engineCall(() => nquadsToQuads(line));
  return qs[0].object;
}

function nodeArg(n, what) {
  if (n === null || n === undefined) throw new UnsupportedOperationException(what + ' cannot be null');
  if (!(n instanceof Node)) throw new TypeError(what + ' must be a Node');
  return n;
}

export class Node {
  isConcrete() { return false; }
  isURI() { return false; }
  isBlank() { return false; }
  isLiteral() { return false; }
  isVariable() { return false; }
  isTripleTerm() { return false; }
  /** Jena 4 name of isTripleTerm. */
  isNodeTriple() { return this.isTripleTerm(); }
  isExt() { return false; }

  getURI() { throw new UnsupportedOperationException(this.constructor.name + ' is not a URI node'); }
  hasURI(uri) { return false; }
  getBlankNodeLabel() { throw new UnsupportedOperationException(this.constructor.name + ' is not a blank node'); }
  getBlankNodeId() { return this.getBlankNodeLabel(); }
  getName() { throw new UnsupportedOperationException(this.constructor.name + ' is not a variable node'); }
  getLiteral() { throw new UnsupportedOperationException(this.constructor.name + ' is not a literal node'); }
  getLiteralLexicalForm() { return this.getLiteral().getLexicalForm(); }
  getLiteralLanguage() { return this.getLiteral().language(); }
  getLiteralDatatypeURI() { return this.getLiteral().getDatatypeURI(); }
  /** A datatype object naming the IRI only (BaseDatatype); its value semantics are the engine's. */
  getLiteralDatatype() { return datatypeFor(this.getLiteralDatatypeURI()); }
  /** Jena getLiteralBaseDirection: a TextDirection, or null (Node.noTextDirection). */
  getLiteralBaseDirection() { return this.getLiteral().baseDirection(); }
  getLiteralValue() { return unsupported('Node.getLiteralValue', 'literal-value'); }
  /** Jena: the node itself for URIs and blank nodes; for a literal, a value key (engine op needed). */
  getIndexingValue() {
    if (this.isLiteral()) return unsupported('Node.getIndexingValue (literal)', 'value-matching');
    return this;
  }
  getTriple() { throw new UnsupportedOperationException(this.constructor.name + ' is not a triple term'); }
  getNameSpace() { return unsupported('Node.getNameSpace', 'iri-split'); }
  getLocalName() { return unsupported('Node.getLocalName', 'iri-split'); }

  /**
   * Value equality (Jena sameValueAs). For nodes with no literal inside, the
   * value is the term (RDF 1.1 Concepts section 3.6): term equality. For a
   * literal, value equality needs an engine op.
   */
  sameValueAs(other) {
    if (!(other instanceof Node)) return false;
    if (hasLiteral(this) || hasLiteral(other)) return unsupported('Node.sameValueAs', 'value-matching');
    return this.equals(other);
  }
  isNodeGraph() { return false; }
  getGraph() { throw new UnsupportedOperationException(this.constructor.name + ' is not a graph node'); }

  /** Jena sameTermAs: term equality; null is refused (Jena 6: NullPointerException). */
  sameTermAs(other) {
    if (other === null || other === undefined) throw new TypeError('sameTermAs(null)');
    return this.equals(other);
  }

  /** Jena Node.matches: ANY matches every node; otherwise term equality. */
  matches(other) { return this.equals(other); }

  /** A string that two nodes share exactly when equals() holds (Java hashCode/equals contract). */
  hashKey() { throw new Error('abstract'); }
  hashCode() { return this.hashKey(); }
  equals(other) {
    return other instanceof Node && other.hashKey() === this.hashKey();
  }

  /** The RDF/JS term of @factoidal/core (null for ANY). */
  toRDFJS() { return null; }

  /** Jena NodeVisitor dispatch (API shape only). */
  visitWith(v) {
    if (this === Node.ANY) return v.visitAny(this);
    if (this.isURI()) return v.visitURI(this, this.getURI());
    if (this.isBlank()) return v.visitBlank(this, this.getBlankNodeLabel());
    if (this.isLiteral()) return v.visitLiteral(this, this.getLiteralLexicalForm(), this.getLiteralLanguage(), this.getLiteralDatatype());
    if (this.isVariable()) return v.visitVariable(this, this.getName());
    if (this.isTripleTerm()) return v.visitTriple(this, this.getTriple());
    if (this.isNodeGraph()) return v.visitGraph(this, this.getGraph());
    throw new JenaException('no visit for ' + this);
  }
}

export class Node_URI extends Node {
  constructor(uri) {
    super();
    if (typeof uri !== 'string') throw new TypeError('URI must be a string');
    this._term = df.namedNode(uri);
    Object.freeze(this);
  }
  isConcrete() { return true; }
  isURI() { return true; }
  getURI() { return this._term.value; }
  hasURI(uri) { return this._term.value === uri; }
  hashKey() { return 'U' + this._term.value; }
  toRDFJS() { return this._term; }
  toString(pm) {
    // Jena: pm.qnameFor(uri), else the URI. qnameFor needs an IRI split.
    if (pm) return unsupported('Node.toString(PrefixMapping)', 'iri-split');
    return this._term.value;
  }
}

export class Node_Blank extends Node {
  constructor(label) {
    super();
    this._term = df.blankNode(label === undefined ? undefined : String(label));
    Object.freeze(this);
  }
  isConcrete() { return true; }
  isBlank() { return true; }
  getBlankNodeLabel() { return this._term.value; }
  hashKey() { return 'B' + this._term.value; }
  toRDFJS() { return this._term; }
  toString() { return '_:' + this._term.value; }
}

/** Jena LiteralLabel: the lexical form, language and datatype IRI of a literal. */
export class LiteralLabel {
  constructor(term) {
    this._term = term;
    Object.freeze(this);
  }
  getLexicalForm() { return this._term.value; }
  language() { return this._term.language || ''; }
  getDatatypeURI() { return this._term.datatype.value; }
  getValue() { return unsupported('LiteralLabel.getValue', 'literal-value'); }
  getIndexingValue() { return unsupported('LiteralLabel.getIndexingValue', 'value-matching'); }
  isWellFormed() { return unsupported('LiteralLabel.isWellFormed', 'literal-value'); }
  getDatatype() { return datatypeFor(this.getDatatypeURI()); }
  /** The base direction (RDF 1.2): a TextDirection, or null. */
  baseDirection() { return TextDirection.of(this._term.direction || ''); }
  sameValueAs(other) { return unsupported('LiteralLabel.sameValueAs', 'value-matching'); }
  equals(other) { return other instanceof LiteralLabel && termToNQuads(other._term) === termToNQuads(this._term); }
  hashCode() { return termToNQuads(this._term); }
  toString(quoting = true) {
    if (!quoting && this._term.datatype.value === XSD_STRING) return this._term.value;
    return termToNQuads(this._term);
  }
}

export class Node_Literal extends Node {
  constructor(term) {
    super();
    this._term = term;
    this._key = 'L' + engineCall(() => termToNQuads(term));
    Object.freeze(this);
  }
  isConcrete() { return true; }
  isLiteral() { return true; }
  getLiteral() { return new LiteralLabel(this._term); }
  getLiteralLexicalForm() { return this._term.value; }
  getLiteralLanguage() { return this._term.language || ''; }
  getLiteralDatatypeURI() { return this._term.datatype.value; }
  hashKey() { return this._key; }
  toRDFJS() { return this._term; }
  toString(pm) {
    // Jena writes the datatype with PrefixMapping.Standard (vocabulary table);
    // leana writes the engine's N-Triples form of the term.
    if (pm) return unsupported('Node.toString(PrefixMapping)', 'iri-split');
    return termToNQuads(this._term);
  }
}

export class Node_Variable extends Node {
  constructor(name) {
    super();
    this._name = String(name);
    Object.freeze(this);
  }
  isVariable() { return true; }
  getName() { return this._name; }
  hashKey() { return 'V' + this._name; }
  toRDFJS() { return df.variable(this._name); }
  toString() { return '?' + this._name; }
}

class Node_ANY extends Node {
  hashKey() { return 'ANY'; }
  matches(other) { return other instanceof Node; }
  toString() { return 'ANY'; }
}

export class Node_Triple extends Node {
  constructor(triple) {
    super();
    if (!(triple instanceof Triple)) throw new TypeError('Node_Triple needs a Triple');
    this._triple = triple;
    Object.freeze(this);
  }
  isConcrete() { return this._triple.isConcrete(); }
  isTripleTerm() { return true; }
  getTriple() { return this._triple; }
  hashKey() { return 'T(' + this._triple.hashKey() + ')'; }
  toRDFJS() {
    const t = this._triple;
    return df.quad(t.getSubject().toRDFJS(), t.getPredicate().toRDFJS(), t.getObject().toRDFJS());
  }
  toString() { return '<<( ' + this._triple.toString() + ' )>>'; }
}

function hasLiteral(n) {
  if (n.isLiteral()) return true;
  if (n.isTripleTerm()) {
    const t = n.getTriple();
    return hasLiteral(t.getSubject()) || hasLiteral(t.getPredicate()) || hasLiteral(t.getObject());
  }
  return false;
}

const GRAPH_IDS = new WeakMap();
let graphIds = 0;
/**
 * Jena Node_Graph: a graph as a node (a Jena extension, not an RDF term).
 * Two are equal when they hold the same graph object. It is not concrete
 * and has no RDF/JS term, so it cannot be stored in a graph.
 */
export class Node_Graph extends Node {
  constructor(graph) {
    super();
    if (graph === null || graph === undefined) throw new TypeError('Node_Graph needs a graph');
    this._graph = graph;
    if (!GRAPH_IDS.has(graph)) GRAPH_IDS.set(graph, ++graphIds);
    Object.freeze(this);
  }
  isNodeGraph() { return true; }
  getGraph() { return this._graph; }
  hashKey() { return 'G' + GRAPH_IDS.get(this._graph); }
  toString() { return '{graph ' + GRAPH_IDS.get(this._graph) + '}'; }
}

Node.ANY = new Node_ANY();
Object.freeze(Node.ANY);
/** Jena Node.noTextDirection and Node.noLangTag. */
Node.noTextDirection = null;
Node.noLangTag = '';

/** Jena TextDirection (RDF 1.2 base direction): LTR and RTL. */
export class TextDirection {
  constructor(d) { this._d = d; Object.freeze(this); }
  direction() { return this._d; }
  /** The TextDirection of an engine direction string; null for ''. */
  static of(d) {
    if (d === '') return null;
    if (d === 'ltr') return TextDirection.LTR;
    if (d === 'rtl') return TextDirection.RTL;
    return new TextDirection(d);
  }
  equals(o) { return o instanceof TextDirection && o._d === this._d; }
  toString() { return this._d; }
}
TextDirection.LTR = new TextDirection('ltr');
TextDirection.RTL = new TextDirection('rtl');

const DATATYPES = new Map();
/** The one BaseDatatype object of an IRI (Jena datatypes are singletons). */
export function datatypeFor(uri) {
  const k = String(uri);
  let dt = DATATYPES.get(k);
  if (!dt) { dt = new BaseDatatype(k); DATATYPES.set(k, dt); }
  return dt;
}

/** A datatype named by IRI. Only the IRI: the datatype's semantics are the engine's. */
export class BaseDatatype {
  constructor(uri) { this._uri = String(uri); Object.freeze(this); }
  getURI() { return this._uri; }
  isValid(lex) { return unsupported('RDFDatatype.isValid', 'literal-value'); }
  parse(lex) { return unsupported('RDFDatatype.parse', 'literal-value'); }
  unparse(v) { return unsupported('RDFDatatype.unparse', 'literal-value'); }
  getJavaClass() { return unsupported('RDFDatatype.getJavaClass', 'js-value-literal'); }
  isEqual(a, b) { return unsupported('RDFDatatype.isEqual', 'value-matching'); }
  isValidLiteral(ll) { return unsupported('RDFDatatype.isValidLiteral', 'literal-value'); }
  isValidValue(v) { return unsupported('RDFDatatype.isValidValue', 'js-value-literal'); }
  cannonicalise(v) { return unsupported('RDFDatatype.cannonicalise', 'literal-value'); }
  equals(o) { return o instanceof BaseDatatype && o._uri === this._uri; }
  toString() { return 'Datatype[' + this._uri + ']'; }
}

function datatypeIri(dt) {
  if (typeof dt === 'string') return dt;
  if (dt && typeof dt.getURI === 'function') return dt.getURI();
  throw new TypeError('datatype must be an IRI string or an RDFDatatype');
}

/** Build the leana Node of an RDF/JS term (as @factoidal/core answers it). */
export function fromRDFJS(t) {
  switch (t.termType) {
    case 'NamedNode': return new Node_URI(t.value);
    case 'BlankNode': return new Node_Blank(t.value);
    case 'Literal': return new Node_Literal(t);
    case 'Variable': return new Node_Variable(t.value);
    case 'Quad': return new Node_Triple(new Triple(fromRDFJS(t.subject), fromRDFJS(t.predicate), fromRDFJS(t.object)));
    default: throw new JenaException('leana: no Node for RDF/JS term type ' + t.termType);
  }
}

/** Jena TypeMapper: by IRI only. Choosing a datatype for a value needs an engine table. */
const TYPE_MAPPER = Object.freeze({
  getSafeTypeByName(uri) { return datatypeFor(uri); },
  getTypeByName(uri) { return datatypeFor(uri); },
  getTypeByValue(v) { return unsupported('TypeMapper.getTypeByValue', 'js-value-literal'); },
  getTypeByClass(c) { return unsupported('TypeMapper.getTypeByClass', 'js-value-literal'); },
  registerDatatype() { return unsupported('TypeMapper.registerDatatype', 'literal-value'); },
});
export const TypeMapper = Object.freeze({ getInstance() { return TYPE_MAPPER; } });

/**
 * Jena org.apache.jena.rdf.model.impl.Util string-literal tests. They read the
 * term's components (datatype IRI as answered by @factoidal/core, language,
 * direction); no RDF semantics.
 */
export const Util = Object.freeze({
  isSimpleString(n) { return n.isLiteral() && n.getLiteralDatatypeURI() === XSD_STRING; },
  isLangString(n) { return n.isLiteral() && n.getLiteralDatatypeURI() === RDF_LANGSTRING; },
  isDirLangString(n) { return n.isLiteral() && n.getLiteralLanguage() !== '' && n.getLiteralBaseDirection() !== null; },
  hasLang(n) { return n.isLiteral() && n.getLiteralLanguage() !== ''; },
  hasDirection(n) { return n.isLiteral() && n.getLiteralBaseDirection() !== null; },
});

export const NodeFactory = Object.freeze({
  createURI(uri) {
    if (uri === null || uri === undefined) throw new JenaException('null URI');
    return new Node_URI(uri);
  },
  createBlankNode(label) {
    // A fresh label comes from @factoidal/core's DataFactory.
    return new Node_Blank(label);
  },
  createVariable(name) { return new Node_Variable(name); },
  createLiteralString(lex) {
    if (lex === null || lex === undefined) throw new TypeError('null lexical form');
    return new Node_Literal(df.literal(String(lex)));
  },
  /**
   * Jena 4 createLiteral(String): a string literal. Jena 5
   * createLiteral(lex, lang, dir, dtype): the four-argument form.
   */
  createLiteral(lex, langOrDt, dir, dtype) {
    if (lex instanceof LiteralLabel) return new Node_Literal(lex._term);
    if (arguments.length >= 3) {
      if (langOrDt) return NodeFactory.createLiteralDirLang(lex, langOrDt, dir);
      if (dtype !== undefined && dtype !== null) return NodeFactory.createLiteralDT(lex, dtype);
      return NodeFactory.createLiteralString(lex);
    }
    if (langOrDt === undefined || langOrDt === null || langOrDt === '') return NodeFactory.createLiteralString(lex);
    if (typeof langOrDt === 'string') return NodeFactory.createLiteralLang(lex, langOrDt);
    return NodeFactory.createLiteralDT(lex, langOrDt);
  },
  createLiteralLang(lex, lang) {
    if (lex === null || lex === undefined) throw new TypeError('null lexical form');
    if (lang === null || lang === undefined || lang === '') return NodeFactory.createLiteralString(lex);
    // The engine decides the form of the language tag (case).
    return new Node_Literal(engineObjectTerm(df.literal(String(lex), String(lang))));
  },
  /**
   * createLiteralDirLang(lex, lang, dir): dir is 'ltr', 'rtl', a TextDirection,
   * or null/'' (no direction). The engine decides whether the term is well formed.
   */
  createLiteralDirLang(lex, lang, dir) {
    if (lex === null || lex === undefined) throw new TypeError('null lexical form');
    const d = dir instanceof TextDirection ? dir.direction() : (dir ?? '');
    if (d === '') return NodeFactory.createLiteralLang(lex, lang);
    return new Node_Literal(engineObjectTerm(df.literal(String(lex), { language: String(lang ?? ''), direction: String(d) })));
  },
  createLiteralDT(lex, dtype) {
    if (lex === null || lex === undefined) throw new TypeError('null lexical form');
    if (dtype === null || dtype === undefined) return NodeFactory.createLiteralString(lex);
    return new Node_Literal(df.literal(String(lex), df.namedNode(datatypeIri(dtype))));
  },
  createLiteralByValue(value, dtype) { return unsupported('NodeFactory.createLiteralByValue', 'js-value-literal'); },
  createTripleTerm(s, p, o) {
    if (s instanceof Triple) return new Node_Triple(s);
    return new Node_Triple(Triple.create(s, p, o));
  },
  /** Jena 4 name of createTripleTerm. */
  createTripleNode(s, p, o) { return NodeFactory.createTripleTerm(s, p, o); },
  /** A datatype object for an IRI (the IRI only; see BaseDatatype). */
  getType(uri) { return datatypeFor(uri); },
});

export class Triple {
  constructor(s, p, o) {
    this._s = nodeArg(s, 'subject');
    this._p = nodeArg(p, 'predicate');
    this._o = nodeArg(o, 'object');
    Object.freeze(this);
  }
  static create(s, p, o) { return new Triple(s, p, o); }
  /** Jena createMatch: null means ANY. */
  static createMatch(s, p, o) {
    return new Triple(s ?? Node.ANY, p ?? Node.ANY, o ?? Node.ANY);
  }
  getSubject() { return this._s; }
  getPredicate() { return this._p; }
  getObject() { return this._o; }
  getMatchSubject() { return anyToNull(this._s); }
  getMatchPredicate() { return anyToNull(this._p); }
  getMatchObject() { return anyToNull(this._o); }
  isConcrete() { return this._s.isConcrete() && this._p.isConcrete() && this._o.isConcrete(); }
  sameAs(s, p, o) { return this._s.equals(s) && this._p.equals(p) && this._o.equals(o); }
  matches(s, p, o) {
    if (s instanceof Triple) return this.matches(s.getSubject(), s.getPredicate(), s.getObject());
    return this._s.matches(s) && this._p.matches(p) && this._o.matches(o);
  }
  subjectMatches(n) { return this._s.matches(n); }
  predicateMatches(n) { return this._p.matches(n); }
  objectMatches(n) { return this._o.matches(n); }
  hashKey() { return this._s.hashKey() + ' ' + this._p.hashKey() + ' ' + this._o.hashKey(); }
  hashCode() { return this.hashKey(); }
  equals(other) { return other instanceof Triple && other.hashKey() === this.hashKey(); }
  /**
   * toString() writes <uri>. toString(pm) is Jena's: a URI as pm.shortForm(uri)
   * (string bookkeeping); a literal with a datatype other than xsd:string is
   * written by Jena with PrefixMapping.Standard (gap 'vocabulary').
   */
  toString(pm) {
    if (pm) return tripleNodeStringPM(pm, this._s) + ' ' + tripleNodeStringPM(pm, this._p) + ' ' + tripleNodeStringPM(pm, this._o);
    return tripleNodeString(this._s) + ' ' + tripleNodeString(this._p) + ' ' + tripleNodeString(this._o);
  }
}
Triple.ANY = new Triple(Node.ANY, Node.ANY, Node.ANY);

function tripleNodeStringPM(pm, n) {
  if (n.isURI()) return pm.shortForm(n.getURI());
  if (n.isBlank()) return '_:' + n.getBlankNodeLabel();
  if (n.isLiteral()) {
    const lang = n.getLiteralLanguage();
    if (!lang && n.getLiteralDatatypeURI() !== XSD_STRING) {
      return unsupported('Triple.toString(PrefixMapping) (datatype written with PrefixMapping.Standard)', 'vocabulary');
    }
    // The quoted, escaped lexical form is the engine's (termToNQuads of the plain string).
    const quoted = engineCall(() => termToNQuads(df.literal(n.getLiteralLexicalForm())));
    return lang ? quoted + '@' + lang : quoted;
  }
  return n.toString();
}

/** Jena Triple.Field: getField, filterOn, filterOnConcrete. Jena's object field compares by value (sameValueAs). */
class TripleField {
  constructor(get, valueBased) { this._get = get; this._value = valueBased; Object.freeze(this); }
  getField(t) { return this._get(t); }
  filterOnConcrete(n) {
    if (this._value) return unsupported('Triple.Field.fieldObject.filterOnConcrete (sameValueAs)', 'value-matching');
    const pred = (x) => n.equals(this._get(x));
    pred.test = pred;
    return pred;
  }
  filterOn(n) {
    if (n instanceof Triple) return this.filterOn(this._get(n));
    if (!n.isConcrete()) { const any = () => true; any.test = any; return any; }
    if (this._value) return unsupported('Triple.Field.fieldObject.filterOn (sameValueAs)', 'value-matching');
    return this.filterOnConcrete(n);
  }
}
Triple.Field = Object.freeze({
  fieldSubject: new TripleField((t) => t.getSubject(), false),
  fieldPredicate: new TripleField((t) => t.getPredicate(), false),
  fieldObject: new TripleField((t) => t.getObject(), true),
  [Symbol.hasInstance]: (x) => x instanceof TripleField,
});

function anyToNull(n) { return n === Node.ANY ? null : n; }

function tripleNodeString(n) {
  if (n.isURI()) return '<' + n.getURI() + '>';
  return n.toString();
}

export { XSD_STRING, RDF_LANGSTRING };

/**
 * Jena LiteralLabelFactory. A LiteralLabel is that of a literal Node made by
 * NodeFactory; making one from a Java/JavaScript value needs an engine table.
 */
export const LiteralLabelFactory = Object.freeze({
  createString(lex) { return NodeFactory.createLiteralString(lex).getLiteral(); },
  createLang(lex, lang) { return NodeFactory.createLiteralLang(lex, lang).getLiteral(); },
  createDirLang(lex, lang, dir) { return NodeFactory.createLiteralDirLang(lex, lang, dir).getLiteral(); },
  create(lex, dtype) { return NodeFactory.createLiteralDT(lex, dtype).getLiteral(); },
  createByValue(value, dtype) { return unsupported('LiteralLabelFactory.createByValue', 'js-value-literal'); },
  createTypedLiteral(value) { return unsupported('LiteralLabelFactory.createTypedLiteral(value)', 'js-value-literal'); },
});

/**
 * Jena JenaParameters (global flags). leana never validates literals itself:
 * it behaves as enableEagerLiteralValidation = false and
 * enableSilentAcceptanceOfUnknownDatatypes = true. Asking for the other
 * behaviour needs the engine's datatype checks.
 */
const FLAGS = { enableEagerLiteralValidation: false, enableSilentAcceptanceOfUnknownDatatypes: true };
export const JenaParameters = Object.freeze(Object.defineProperties({}, Object.fromEntries(
  Object.keys(FLAGS).map((k) => [k, {
    enumerable: true,
    get() { return FLAGS[k]; },
    set(v) { if (v !== FLAGS[k]) unsupported('JenaParameters.' + k + ' = ' + v, 'literal-value'); },
  }]),
)));

/** Jena XSDDateTime (a value of the XSD date/time types): made from a Calendar/Date value. */
export class XSDDateTime {
  constructor() { unsupported('new XSDDateTime(Calendar)', 'js-value-literal'); }
}
