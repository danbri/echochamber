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
  getLiteralDatatype() { return new BaseDatatype(this.getLiteralDatatypeURI()); }
  getLiteralValue() { return unsupported('Node.getLiteralValue', 'literal-value'); }
  /** Jena: the node itself for URIs and blank nodes; for a literal, a value key (engine op needed). */
  getIndexingValue() {
    if (this.isLiteral()) return unsupported('Node.getIndexingValue (literal)', 'value-matching');
    return this;
  }
  getTriple() { throw new UnsupportedOperationException(this.constructor.name + ' is not a triple term'); }
  getNameSpace() { return unsupported('Node.getNameSpace', 'iri-split'); }
  getLocalName() { return unsupported('Node.getLocalName', 'iri-split'); }

  /** Value equality (Jena sameValueAs): engine op needed. */
  sameValueAs(other) { return unsupported('Node.sameValueAs', 'value-matching'); }

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
  getDatatype() { return new BaseDatatype(this.getDatatypeURI()); }
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

/** Jena Node_Graph (a graph as a node): not in leana. */
export class Node_Graph extends Node {
  constructor() { super(); unsupported('Node_Graph', 'echo'); }
}

Node.ANY = new Node_ANY();
Object.freeze(Node.ANY);

/** A datatype named by IRI. Only the IRI: the datatype's semantics are the engine's. */
export class BaseDatatype {
  constructor(uri) { this._uri = String(uri); Object.freeze(this); }
  getURI() { return this._uri; }
  isValid(lex) { return unsupported('RDFDatatype.isValid', 'literal-value'); }
  parse(lex) { return unsupported('RDFDatatype.parse', 'literal-value'); }
  unparse(v) { return unsupported('RDFDatatype.unparse', 'literal-value'); }
  getJavaClass() { return unsupported('RDFDatatype.getJavaClass', 'js-value-literal'); }
  isEqual(a, b) { return unsupported('RDFDatatype.isEqual', 'value-matching'); }
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
  getSafeTypeByName(uri) { return new BaseDatatype(uri); },
  getTypeByName(uri) { return new BaseDatatype(uri); },
  getTypeByValue(v) { return unsupported('TypeMapper.getTypeByValue', 'js-value-literal'); },
  getTypeByClass(c) { return unsupported('TypeMapper.getTypeByClass', 'js-value-literal'); },
  registerDatatype() { return unsupported('TypeMapper.registerDatatype', 'literal-value'); },
});
export const TypeMapper = Object.freeze({ getInstance() { return TYPE_MAPPER; } });

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
    if (lex === null || lex === undefined) throw new JenaException('null lexical form');
    return new Node_Literal(df.literal(String(lex)));
  },
  /** Jena 4 createLiteral(String): a string literal. */
  createLiteral(lex, langOrDt) {
    if (langOrDt === undefined || langOrDt === null || langOrDt === '') return NodeFactory.createLiteralString(lex);
    if (typeof langOrDt === 'string') return NodeFactory.createLiteralLang(lex, langOrDt);
    return NodeFactory.createLiteralDT(lex, langOrDt);
  },
  createLiteralLang(lex, lang) {
    if (lex === null || lex === undefined) throw new JenaException('null lexical form');
    if (lang === null || lang === undefined || lang === '') return NodeFactory.createLiteralString(lex);
    // The engine decides the form of the language tag (case).
    return new Node_Literal(engineObjectTerm(df.literal(String(lex), String(lang))));
  },
  createLiteralDT(lex, dtype) {
    if (lex === null || lex === undefined) throw new JenaException('null lexical form');
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
  getType(uri) { return new BaseDatatype(uri); },
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
  toString(pm) {
    if (pm) return unsupported('Triple.toString(PrefixMapping)', 'iri-split');
    return tripleNodeString(this._s) + ' ' + tripleNodeString(this._p) + ' ' + tripleNodeString(this._o);
  }
}
Triple.ANY = new Triple(Node.ANY, Node.ANY, Node.ANY);

function anyToNull(n) { return n === Node.ANY ? null : n; }

function tripleNodeString(n) {
  if (n.isURI()) return '<' + n.getURI() + '>';
  return n.toString();
}

export { XSD_STRING, RDF_LANGSTRING };
