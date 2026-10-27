// leana: Model, Statement, RDFNode, Resource, Property, Literal, ModelFactory,
// ResourceFactory.
//
// API modelled on Apache Jena org.apache.jena.rdf.model (Apache License 2.0).
// No Jena code is copied. Every Model is over a leana GraphMem, so matching
// is by TERM. Jena's ModelFactory.createDefaultModel() matches by VALUE
// ("01"^^xsd:integer finds "1"^^xsd:integer); leana does not (GAPS.md,
// 'value-matching').

import { Node, NodeFactory, Triple, BaseDatatype } from './node.mjs';
import { GraphMem, ExtendedIterator, JenaSet, GraphUtil } from './graph.mjs';
import { ModelListenerAdapter, ArrayList } from './events.mjs';
import { Union } from './compose.mjs';
import { XSD_STRING } from '@factoidal/core/rdfjs';
import {
  JenaException, PropertyNotFoundException, LiteralRequiredException, ResourceRequiredException,
  ClosedException, UnsupportedOperationException, InvalidPropertyURIException, unsupported,
} from './errors.mjs';

// ---------------------------------------------------------------------------
// RDFNode, Resource, Property, Literal

/** Jena AnonId: the label of a blank node. */
export class AnonId {
  constructor(label) { this._label = label === undefined ? NodeFactory.createBlankNode().getBlankNodeLabel() : String(label); Object.freeze(this); }
  /** Jena AnonId.create() (a fresh label from the engine's DataFactory) | AnonId.create(label). */
  static create(label) { return new AnonId(label); }
  getLabelString() { return this._label; }
  hashKey() { return 'A' + this._label; }
  hashCode() { return this.hashKey(); }
  equals(o) { return o instanceof AnonId && o._label === this._label; }
  toString() { return this._label; }
}

export class RDFNode {
  constructor(node, model) {
    if (!(node instanceof Node)) throw new TypeError('RDFNode needs a Node');
    this._node = node;
    this._model = model || null;
  }
  asNode() { return this._node; }
  getModel() { return this._model; }
  isAnon() { return this._node.isBlank(); }
  isLiteral() { return this._node.isLiteral(); }
  isURIResource() { return this._node.isURI(); }
  /** Jena EnhNode.isResource: a URI or a blank node (a triple term is a StatementTerm, not a Resource). */
  isResource() { return this._node.isURI() || this._node.isBlank(); }
  isStmtResource() { return this._node.isTripleTerm(); }
  /** Jena RDFNode.isStatementTerm / asStatementTerm (a triple term). */
  isStatementTerm() { return this._node.isTripleTerm(); }
  asStatementTerm() {
    if (!this._node.isTripleTerm()) throw new ResourceRequiredException('not a statement term: ' + this._node);
    return this;
  }
  asResource() { throw new ResourceRequiredException(String(this._node)); }
  asLiteral() { throw new LiteralRequiredException(String(this._node)); }
  inModel(m) { return wrapNode(this._node, m); }
  hashKey() { return this._node.hashKey(); }
  hashCode() { return this.hashKey(); }
  /** Jena: two RDFNodes are equal when their Nodes are equal (the model is not compared). */
  equals(o) { return o instanceof RDFNode && o._node.equals(this._node); }
  /**
   * Jena as(Class): the view of this node as Resource, Property, Literal, StatementTerm or
   * RDFNode (API shape: a wrapper choice by node kind). Other classes (Bag, Seq, OntClass ...) are not in leana.
   */
  as(cls) {
    if (cls === RDFNode) return this;
    if (cls === Literal) {
      if (!this._node.isLiteral()) throw new LiteralRequiredException(String(this._node));
      return this instanceof Literal ? this : new Literal(this._node, this._model);
    }
    if (cls === Property) {
      if (!this._node.isURI()) throw new ResourceRequiredException(String(this._node));
      return this instanceof Property ? this : new Property(this._node, this._model);
    }
    if (cls === Resource) {
      if (!(this._node.isURI() || this._node.isBlank())) throw new ResourceRequiredException(String(this._node));
      return this instanceof Resource ? this : new Resource(this._node, this._model);
    }
    if (cls === StatementTerm) {
      if (!this._node.isTripleTerm()) throw new ResourceRequiredException('not a statement term: ' + this._node);
      return this instanceof StatementTerm ? this : new StatementTerm(this._node, this._model);
    }
    return unsupported('RDFNode.as(' + (cls && cls.name) + ')', 'echo');
  }
  canAs(cls) {
    if (cls === RDFNode) return true;
    if (cls === Literal) return this._node.isLiteral();
    if (cls === Property) return this._node.isURI();
    if (cls === Resource) return this._node.isURI() || this._node.isBlank();
    if (cls === StatementTerm) return this._node.isTripleTerm();
    return unsupported('RDFNode.canAs(' + (cls && cls.name) + ')', 'echo');
  }
  /** Jena RDFVisitor dispatch: visitBlank(r, id), visitURI(r, uri), visitLiteral(l), visitStmt(st, statement). */
  visitWith(v) {
    const n = this._node;
    if (n.isBlank()) return v.visitBlank(this, new AnonId(n.getBlankNodeLabel()));
    if (n.isURI()) return v.visitURI(this, n.getURI());
    if (n.isLiteral()) return v.visitLiteral(this);
    if (n.isTripleTerm()) {
      const st = statementOfTriple(n.getTriple(), this._model);
      return typeof v.visitStmt === 'function' ? v.visitStmt(this, st) : st;
    }
    throw new JenaException('no visit for ' + n);
  }
  toString() { return String(this._node); }
}

export class Resource extends RDFNode {
  constructor(node, model) {
    super(node, model);
    if (node.isLiteral()) throw new ResourceRequiredException(String(node));
  }
  asResource() { return this; }
  getURI() { return this._node.isURI() ? this._node.getURI() : null; }
  hasURI(uri) { return this._node.isURI() && this._node.getURI() === uri; }
  /** Jena AnonId of a blank node. */
  getId() { return new AnonId(this._node.getBlankNodeLabel()); }
  /** Jena: null for a resource that is not a URI; a URI needs an IRI split (gap). */
  getLocalName() {
    if (!this._node.isURI()) return null;
    return unsupported('Resource.getLocalName', 'iri-split');
  }
  getNameSpace() {
    if (!this._node.isURI()) return null;
    return unsupported('Resource.getNameSpace', 'iri-split');
  }
  getStmtTerm() { return statementOfTriple(this._node.getTriple(), this._model); }
  /** Jena StatementTerm.getStatement (a triple-term resource). */
  getStatement() { return this.getStmtTerm(); }
  _m() {
    if (!this._model) throw new JenaException('resource is not in a model: ' + this);
    return this._model;
  }
  /** addProperty(p, RDFNode) | (p, string) | (p, string, lang) | (p, string, RDFDatatype). */
  addProperty(p, o, langOrDt) {
    this._m().add(this, p, o, langOrDt);
    return this;
  }
  /** Jena addLiteral(p, Object): leana accepts a Literal; a JavaScript value needs an engine datatype table. */
  addLiteral(p, o) {
    if (o instanceof Literal) { this._m().add(this, p, o); return this; }
    return unsupported('Resource.addLiteral(Property, value)', 'js-value-literal');
  }
  hasProperty(p, o, lang) {
    if (o === undefined) return this._m().contains(this, p);
    return this._m().contains(this, p, o, lang);
  }
  hasLiteral(p, value) {
    if (value instanceof Literal) return this._m().contains(this, p, value);
    return unsupported('Resource.hasLiteral(Property, value)', 'js-value-literal');
  }
  /** getProperty(p) | getProperty(p, lang): Jena listProperties(p, lang), first statement or null. */
  getProperty(p, lang) {
    if (lang === undefined) return this._m().getProperty(this, p);
    const it = this.listProperties(p, lang);
    return it.hasNext() ? it.next() : null;
  }
  getRequiredProperty(p, lang) {
    if (lang === undefined) return this._m().getRequiredProperty(this, p);
    const st = this.getProperty(p, lang);
    if (st === null) throw new PropertyNotFoundException(String(p));
    return st;
  }
  getPropertyResourceValue(p) {
    for (const s of this._m().listStatements(this, p, null).toList()) if (s.getObject().isResource()) return s.getResource();
    return null;
  }
  /** listProperties() | listProperties(p) | listProperties(p, lang) (Jena: listStatements(this, p, null, lang)). */
  listProperties(p, lang) {
    if (lang !== undefined) return this._m().listStatements(this, p ?? null, null, lang);
    return this._m().listStatements(this, p ?? null, null);
  }
  removeAll(p) { this._m().removeAll(this, p ?? null, null); return this; }
  removeProperties() { return this.removeAll(null); }
  abort() { return this; }
  begin() { return this; }
  commit() { return this; }
}

export class Property extends Resource {
  constructor(node, model) {
    super(node, model);
    if (!node.isURI()) throw new JenaException('a property must be a URI node: ' + node);
  }
  isProperty() { return true; }
  getOrdinal() { return unsupported('Property.getOrdinal', 'vocabulary'); }
}

export class Literal extends RDFNode {
  constructor(node, model) {
    super(node, model);
    if (!node.isLiteral()) throw new LiteralRequiredException(String(node));
  }
  asLiteral() { return this; }
  getLexicalForm() { return this._node.getLiteralLexicalForm(); }
  getLanguage() { return this._node.getLiteralLanguage(); }
  getDatatypeURI() { return this._node.getLiteralDatatypeURI(); }
  /** A datatype object naming the IRI (its semantics are the engine's: gap 'literal-value'). */
  getDatatype() { return this._node.getLiteralDatatype(); }
  /** Jena getString(): the lexical form. */
  getString() { return this.getLexicalForm(); }
  getValue() { return unsupported('Literal.getValue', 'literal-value'); }
  getBoolean() { return unsupported('Literal.getBoolean', 'literal-value'); }
  getByte() { return unsupported('Literal.getByte', 'literal-value'); }
  getShort() { return unsupported('Literal.getShort', 'literal-value'); }
  getInt() { return unsupported('Literal.getInt', 'literal-value'); }
  getLong() { return unsupported('Literal.getLong', 'literal-value'); }
  getChar() { return unsupported('Literal.getChar', 'literal-value'); }
  getFloat() { return unsupported('Literal.getFloat', 'literal-value'); }
  getDouble() { return unsupported('Literal.getDouble', 'literal-value'); }
  isWellFormedXML() { return unsupported('Literal.isWellFormedXML', 'literal-value'); }
  sameValueAs(other) { return unsupported('Literal.sameValueAs', 'value-matching'); }
  /** Jena LiteralImpl.toString: unquoted for xsd:string; otherwise the node (leana: engine N-Triples form). */
  toString() {
    if (this.getDatatypeURI() === XSD_STRING) return this.getLexicalForm();
    return String(this._node);
  }
}

/** Jena StatementTerm: an RDF 1.2 triple term as an RDFNode (not a Resource: isResource() is false). */
export class StatementTerm extends RDFNode {
  constructor(node, model) {
    super(node, model);
    if (!node.isTripleTerm()) throw new JenaException('a statement term needs a triple term: ' + node);
  }
  getStatement() { return statementOfTriple(this._node.getTriple(), this._model); }
  asStatementTerm() { return this; }
  inModel(m) { return m === this._model ? this : new StatementTerm(this._node, m); }
  toString() {
    const st = this.getStatement();
    return '<<( ' + st.getSubject() + ' ' + st.getPredicate() + ' ' + st.getObject() + ' )>>';
  }
}

export function wrapNode(node, model) {
  if (node.isLiteral()) return new Literal(node, model);
  if (node.isTripleTerm()) return new StatementTerm(node, model);
  if (node.isURI() || node.isBlank()) return new Resource(node, model);
  throw new JenaException('no RDFNode for ' + node);
}

function asProperty(node, model) { return new Property(node, model); }

// ---------------------------------------------------------------------------
// Statement

export class Statement {
  constructor(s, p, o, model) {
    if (!(s instanceof Resource)) throw new TypeError('statement subject must be a Resource');
    if (!(p instanceof Property)) p = toProperty(p);
    if (!(o instanceof RDFNode)) throw new TypeError('statement object must be an RDFNode');
    this._s = s; this._p = p; this._o = o; this._model = model || null;
    Object.freeze(this);
  }
  getSubject() { return this._s; }
  getPredicate() { return this._p; }
  getObject() { return this._o; }
  getModel() { return this._model; }
  asTriple() { return Triple.create(this._s.asNode(), this._p.asNode(), this._o.asNode()); }
  getResource() {
    if (!this._o.isResource()) throw new ResourceRequiredException(String(this._o));
    return this._o;
  }
  getLiteral() {
    if (!this._o.isLiteral()) throw new LiteralRequiredException(String(this._o));
    return this._o;
  }
  /** Jena getString(): the lexical form of the object literal. */
  getString() { return this.getLiteral().getLexicalForm(); }
  getLanguage() { return this.getLiteral().getLanguage(); }
  getBoolean() { return unsupported('Statement.getBoolean', 'literal-value'); }
  getByte() { return unsupported('Statement.getByte', 'literal-value'); }
  getShort() { return unsupported('Statement.getShort', 'literal-value'); }
  getInt() { return unsupported('Statement.getInt', 'literal-value'); }
  getLong() { return unsupported('Statement.getLong', 'literal-value'); }
  getChar() { return unsupported('Statement.getChar', 'literal-value'); }
  getFloat() { return unsupported('Statement.getFloat', 'literal-value'); }
  getDouble() { return unsupported('Statement.getDouble', 'literal-value'); }
  getBag() { return unsupported('Statement.getBag', 'collections'); }
  getAlt() { return unsupported('Statement.getAlt', 'collections'); }
  getSeq() { return unsupported('Statement.getSeq', 'collections'); }
  getList() { return unsupported('Statement.getList', 'collections'); }
  getProperty(p) { return this.getResource().inModel(this._m()).getProperty(p); }
  /** Jena getStatementProperty: the property value of the reified statement (rdf:subject ... : vocabulary). */
  getStatementProperty(p) { return unsupported('Statement.getStatementProperty', 'vocabulary'); }
  _m() {
    if (!this._model) throw new JenaException('statement is not in a model: ' + this);
    return this._model;
  }
  /** Replace the object in the model; answers the new Statement. */
  changeObject(o, lang) {
    const m = this._m();
    const obj = m._object(o, lang);
    m.remove(this);
    const st = new Statement(this._s, this._p, obj, m);
    m.add(st);
    return st;
  }
  changeLiteralObject(v) {
    if (v instanceof Literal) return this.changeObject(v);
    return unsupported('Statement.changeLiteralObject(value)', 'js-value-literal');
  }
  remove() { this._m().remove(this); return this; }
  inModel(m) { return new Statement(this._s.inModel(m), this._p.inModel(m), this._o.inModel(m), m); }
  isReified() { return unsupported('Statement.isReified', 'vocabulary'); }
  createReifiedStatement() { return unsupported('Statement.createReifiedStatement', 'vocabulary'); }
  hashKey() { return this.asTriple().hashKey(); }
  hashCode() { return this.hashKey(); }
  /** Jena: equal when subject, predicate and object are equal (the model is not compared). */
  equals(o) { return o instanceof Statement && o.hashKey() === this.hashKey(); }
  toString() {
    return '[' + this._s.toString() + ', ' + this._p.toString() + ', ' + this._o.toString() + ']';
  }
}

function toProperty(p) {
  if (p instanceof Property) return p;
  if (p instanceof Resource) return new Property(p.asNode(), p.getModel());
  throw new TypeError('statement predicate must be a Property');
}

function statementOfTriple(t, model) {
  return new Statement(new Resource(t.getSubject(), model), asProperty(t.getPredicate(), model), wrapNode(t.getObject(), model), model);
}

// ---------------------------------------------------------------------------
// Iterators

export class StmtIterator extends ExtendedIterator {
  nextStatement() { return this.next(); }
}
export class ResIterator extends ExtendedIterator {
  nextResource() { return this.next(); }
}
export class NodeIterator extends ExtendedIterator {
  nextNode() { return this.next(); }
}

function distinctBy(items) { return new JenaSet(items).toArray(); }

// ---------------------------------------------------------------------------
// Model

export class Model {
  constructor(graph) {
    this._g = graph || new GraphMem();
  }
  getGraph() { return this._g; }
  _check() { if (this._g.isClosed()) throw new ClosedException('model is closed'); }

  // --- terms
  createResource(a, b) {
    if (a === undefined || a === null) {
      if (b !== undefined) return unsupported('Model.createResource(Resource type)', 'vocabulary');
      return new Resource(NodeFactory.createBlankNode(), this);
    }
    if (a instanceof Resource) return unsupported('Model.createResource(Resource type)', 'vocabulary');
    if (b !== undefined) return unsupported('Model.createResource(String, Resource type)', 'vocabulary');
    if (typeof a === 'object' && a && typeof a.getLabelString === 'function') {
      return new Resource(NodeFactory.createBlankNode(a.getLabelString()), this);
    }
    return new Resource(NodeFactory.createURI(String(a)), this);
  }
  getResource(uri) { return new Resource(NodeFactory.createURI(uri), this); }
  createProperty(ns, local) {
    if (ns === null || ns === undefined) throw new InvalidPropertyURIException('null property URI');
    return new Property(NodeFactory.createURI(local === undefined ? ns : ns + local), this);
  }
  createLiteral(lex, langOrXml) {
    if (typeof langOrXml === 'boolean') {
      if (langOrXml) return unsupported('Model.createLiteral(String, true) (rdf:XMLLiteral)', 'vocabulary');
      return new Literal(NodeFactory.createLiteralString(lex), this);
    }
    return new Literal(NodeFactory.createLiteralLang(lex, langOrXml ?? ''), this);
  }
  /** createTypedLiteral(lexicalForm, datatypeIRI | RDFDatatype); a JavaScript value needs an engine table. */
  createTypedLiteral(v, dt) {
    // Jena createTypedLiteral(lex, (RDFDatatype) null): no datatype given, a plain (xsd:string) literal.
    if (dt === null && typeof v === 'string') return new Literal(NodeFactory.createLiteralString(v), this);
    if (dt === undefined || dt === null) return unsupported('Model.createTypedLiteral(value)', 'js-value-literal');
    if (typeof v !== 'string') return unsupported('Model.createTypedLiteral(value, datatype)', 'js-value-literal');
    return new Literal(NodeFactory.createLiteralDT(v, dt), this);
  }
  createStatement(s, p, o, lang) {
    return new Statement(s.inModel(this), toProperty(p).inModel(this), this._object(o, lang), this);
  }
  createTripleTerm(s, p, o) {
    if (s instanceof Statement) return new StatementTerm(NodeFactory.createTripleTerm(s.asTriple()), this);
    return new StatementTerm(NodeFactory.createTripleTerm(s.asNode(), p.asNode(), o.asNode()), this);
  }
  createList() { return unsupported('Model.createList', 'collections'); }
  createBag() { return unsupported('Model.createBag', 'collections'); }
  createSeq() { return unsupported('Model.createSeq', 'collections'); }
  createAlt() { return unsupported('Model.createAlt', 'collections'); }
  getBag() { return unsupported('Model.getBag', 'collections'); }
  getSeq() { return unsupported('Model.getSeq', 'collections'); }
  getAlt() { return unsupported('Model.getAlt', 'collections'); }
  getList() { return unsupported('Model.getList', 'collections'); }
  /** Jena: UnsupportedOperationException for a literal node. */
  wrapAsResource(n) {
    if (n.isLiteral()) throw new UnsupportedOperationException('cannot wrap a literal as a Resource: ' + n);
    return new Resource(n, this);
  }
  /** Jena createStatementTerm(Statement): a triple-term resource; the model is not changed. */
  createStatementTerm(st) { return new StatementTerm(NodeFactory.createTripleTerm(st.asTriple()), this); }
  /** Jena createReifier: adds (r, rdf:reifies, <<( s p o )>>); rdf:reifies is a vocabulary IRI. */
  createReifier() { return unsupported('Model.createReifier', 'vocabulary'); }
  /** Jena createLiteralStatement(s, p, value): the datatype of a JavaScript value needs an engine table. */
  createLiteralStatement(s, p, v) {
    if (v instanceof Literal) return this.createStatement(s, p, v);
    return unsupported('Model.createLiteralStatement(Resource, Property, value)', 'js-value-literal');
  }
  asRDFNode(n) { return wrapNode(n, this); }
  asStatement(t) { return statementOfTriple(t, this); }
  getRDFNode(n) { return wrapNode(n, this); }

  /** An object RDFNode from (RDFNode) | (string) | (string, lang) | (string, RDFDatatype). */
  _object(o, langOrDt) {
    if (o instanceof RDFNode) return o.inModel(this);
    if (typeof o === 'string') {
      if (langOrDt instanceof BaseDatatype || (langOrDt && typeof langOrDt.getURI === 'function')) {
        return new Literal(NodeFactory.createLiteralDT(o, langOrDt), this);
      }
      return new Literal(NodeFactory.createLiteralLang(o, langOrDt ?? ''), this);
    }
    if (o === null || o === undefined) throw new JenaException('null object');
    return unsupported('Model.add(Resource, Property, value)', 'js-value-literal');
  }

  // --- add
  /**
   * add(Statement) | add(Statement[]) | add(Model) | add(StmtIterator) |
   * add(s, p, RDFNode) | add(s, p, string[, lang | RDFDatatype]).
   */
  add(a, p, o, langOrDt) {
    this._check();
    if (p === undefined) {
      // Jena ModelCom: one statement, Statement[] (GraphUtil.add array), List, StmtIterator, Model (addInto).
      if (a instanceof Statement) { this._g.add(a.asTriple()); return this; }
      if (a instanceof Model) { GraphUtil.addInto(this._g, a._g); return this; }
      if (a instanceof ArrayList) { GraphUtil.add(this._g, ArrayList.from(a.map((st) => st.asTriple()))); return this; }
      if (Array.isArray(a)) { GraphUtil.add(this._g, a.map((st) => st.asTriple())); return this; }
      if (a instanceof ExtendedIterator) { GraphUtil.add(this._g, a.toList().map((st) => st.asTriple())[Symbol.iterator]()); return this; }
      if (a && typeof a[Symbol.iterator] === 'function') { GraphUtil.add(this._g, [...a].map((st) => st.asTriple())[Symbol.iterator]()); return this; }
      throw new TypeError('Model.add: unexpected argument');
    }
    const st = this.createStatement(a, p, o, langOrDt);
    this._g.add(st.asTriple());
    return this;
  }
  addLiteral(s, p, o) {
    if (o instanceof Literal) return this.add(s, p, o);
    return unsupported('Model.addLiteral(Resource, Property, value)', 'js-value-literal');
  }

  // --- remove
  remove(a, p, o) {
    this._check();
    if (p === undefined) {
      if (a instanceof Statement) { this._g.delete(a.asTriple()); return this; }
      if (a instanceof Model) { GraphUtil.deleteFrom(this._g, a._g); return this; }
      if (a instanceof ArrayList) { GraphUtil.delete(this._g, ArrayList.from(a.map((st) => st.asTriple()))); return this; }
      if (Array.isArray(a)) { GraphUtil.delete(this._g, a.map((st) => st.asTriple())); return this; }
      if (a instanceof ExtendedIterator) { GraphUtil.delete(this._g, a.toList().map((st) => st.asTriple())[Symbol.iterator]()); return this; }
      if (a && typeof a[Symbol.iterator] === 'function') { GraphUtil.delete(this._g, [...a].map((st) => st.asTriple())[Symbol.iterator]()); return this; }
      throw new TypeError('Model.remove: unexpected argument');
    }
    this._g.delete(this.createStatement(a, p, o).asTriple());
    return this;
  }
  removeAll(s, p, o) {
    this._check();
    if (s === undefined && p === undefined && o === undefined) { this._g.clear(); return this; }
    this._g.remove(nodeOrAny(s), nodeOrAny(p), nodeOrAny(o));
    return this;
  }

  // --- query
  /** contains(Statement) | contains(s, p) | contains(s, p, RDFNode) | contains(s, p, string[, lang]). */
  contains(s, p, o, lang) {
    this._check();
    if (s instanceof Statement && p === undefined) return this._g.contains(s.asTriple());
    // Jena ModelCom: contains(s, p) is contains(s, p, null).
    if (o === undefined) return this.contains(s, p, null);
    const on = o === null ? Node.ANY : this._object(o, lang).asNode();
    return this._g.contains(nodeOrAny(s), nodeOrAny(p), on);
  }
  containsLiteral(s, p, v) {
    if (v instanceof Literal) return this.contains(s, p, v);
    return unsupported('Model.containsLiteral(Resource, Property, value)', 'js-value-literal');
  }
  containsResource(r) {
    this._check();
    const n = r.asNode();
    if (!n.isLiteral() && this._g.contains(n, Node.ANY, Node.ANY)) return true;
    if (n.isURI() && this._g.contains(Node.ANY, n, Node.ANY)) return true;
    return this._g.contains(Node.ANY, Node.ANY, n);
  }
  containsAll(x) {
    const sts = x instanceof Model ? x.listStatements().toList() : (x instanceof ExtendedIterator ? x.toList() : [...x]);
    return sts.every((st) => this.contains(st));
  }
  containsAny(x) {
    const sts = x instanceof Model ? x.listStatements().toList() : (x instanceof ExtendedIterator ? x.toList() : [...x]);
    return sts.some((st) => this.contains(st));
  }
  size() { this._check(); return this._g.size(); }
  isEmpty() { return this.size() === 0; }

  /** listStatements() | listStatements(s, p, o) with null as wildcard; o may be a string (plain literal). */
  listStatements(s, p, o, lang) {
    this._check();
    if (s instanceof SimpleSelector || (s && typeof s.test === 'function' && typeof s.isSimple === 'function')) {
      const sel = s;
      const cands = this.listStatements(sel.getSubject() ?? null, sel.getPredicate() ?? null, sel.getObject() ?? null).toList();
      return new StmtIterator(cands.filter((st) => sel.test(st)), (st) => this.remove(st));
    }
    if (arguments.length >= 4 && (o === null || typeof o === 'string') && !(lang instanceof BaseDatatype)) {
      // Jena listStatements(S, P, String O, String L): O and L given: that literal;
      // only O: literal objects with lexical form O; only L: literal objects with
      // language L ("" = none); neither: every literal object. Components only.
      if (o !== null && lang !== null && lang !== undefined) return this.listStatements(s, p, this.createLiteral(o, lang));
      const all = this.listStatements(s, p, null).toList().filter((st) => st.getObject().isLiteral());
      const keep = o !== null
        ? all.filter((st) => st.getObject().getString() === o)
        : (lang === null || lang === undefined ? all : all.filter((st) => st.getObject().getLanguage() === lang));
      return new StmtIterator(keep, (st) => this.remove(st));
    }
    let on = Node.ANY;
    if (o !== undefined && o !== null) on = this._object(o, lang).asNode();
    const ts = this._g.find(nodeOrAny(s), nodeOrAny(p), on).toList();
    return new StmtIterator(ts.map((t) => statementOfTriple(t, this)), (st) => this.remove(st));
  }
  listSubjects() {
    return new ResIterator(distinctBy(this._g.find().toList().map((t) => new Resource(t.getSubject(), this))));
  }
  listObjects() {
    return new NodeIterator(distinctBy(this._g.find().toList().map((t) => wrapNode(t.getObject(), this))));
  }
  /** listSubjectsWithProperty(p) | (p, RDFNode) | (p, string) | (p, string, lang): exact object terms. */
  listSubjectsWithProperty(p, o, lang) {
    const obj = (lang !== undefined && typeof o === 'string') ? this.createLiteral(o, lang) : (o ?? null);
    const sts = this.listStatements(null, p, obj).toList();
    return new ResIterator(distinctBy(sts.map((st) => st.getSubject())));
  }
  /** Jena: listResourcesWithProperty(p[, o]) is listSubjectsWithProperty. */
  listResourcesWithProperty(p, o) { return this.listSubjectsWithProperty(p, o); }
  listObjectsOfProperty(a, b) {
    const sts = b === undefined ? this.listStatements(null, a, null).toList() : this.listStatements(a, b, null).toList();
    return new NodeIterator(distinctBy(sts.map((st) => st.getObject())));
  }
  listNameSpaces() { return unsupported('Model.listNameSpaces', 'iri-split'); }
  /** Jena listLiteralStatements(S, P, value): createTypedLiteral(value) needs an engine datatype table. */
  listLiteralStatements(s, p, v) {
    if (v instanceof Literal) return this.listStatements(s, p, v);
    return unsupported('Model.listLiteralStatements(Resource, Property, value)', 'js-value-literal');
  }
  /** getProperty(uri) | getProperty(ns, local) | getProperty(s, p) | getProperty(s, p, lang). */
  getProperty(s, p, lang) {
    if (p === undefined) return this.createProperty(s);
    if (typeof s === 'string' && typeof p === 'string') return this.createProperty(s, p);
    if (lang !== undefined) {
      const itl = this.listStatements(s, p, null, lang);
      return itl.hasNext() ? itl.next() : null;
    }
    const it = this.listStatements(s, p, null);
    return it.hasNext() ? it.next() : null;
  }
  getRequiredProperty(s, p) {
    const st = this.getProperty(s, p);
    if (st === null) throw new PropertyNotFoundException(String(p));
    return st;
  }

  // --- set operations (term equality)
  union(m) { const out = createDefaultModel(); out.add(this); out.add(m); return out; }
  intersection(m) {
    const out = createDefaultModel();
    for (const st of this.listStatements().toList()) if (m.contains(st)) out.add(st);
    return out;
  }
  difference(m) {
    const out = createDefaultModel();
    for (const st of this.listStatements().toList()) if (!m.contains(st)) out.add(st);
    return out;
  }
  isIsomorphicWith(m) { return this._g.isIsomorphicWith(m instanceof Model ? m.getGraph() : m); }

  // --- PrefixMapping (Model is a PrefixMapping in Jena)
  _pm() { return this._g.getPrefixMapping(); }
  setNsPrefix(p, u) { this._pm().setNsPrefix(p, u); return this; }
  removeNsPrefix(p) { this._pm().removeNsPrefix(p); return this; }
  clearNsPrefixMap() { this._pm().clearNsPrefixMap(); return this; }
  setNsPrefixes(o) { this._pm().setNsPrefixes(o); return this; }
  withDefaultMappings(o) { this._pm().withDefaultMappings(o); return this; }
  getNsPrefixURI(p) { return this._pm().getNsPrefixURI(p); }
  getNsURIPrefix(u) { return this._pm().getNsURIPrefix(u); }
  getNsPrefixMap() { return this._pm().getNsPrefixMap(); }
  expandPrefix(s) { return this._pm().expandPrefix(s); }
  shortForm(u) { return this._pm().shortForm(u); }
  qnameFor(u) { return this._pm().qnameFor(u); }
  lock() { this._pm().lock(); return this; }
  hasNoMappings() { return this._pm().hasNoMappings(); }
  numPrefixes() { return this._pm().numPrefixes(); }
  samePrefixMappingAs(o) { return this._pm().samePrefixMappingAs(o); }

  // --- lifecycle and the rest
  close() { this._g.close(); }
  isClosed() { return this._g.isClosed(); }
  supportsTransactions() { return false; }
  supportsSetOperations() { return true; }
  independent() { return true; }
  /** Register a ModelChangedListener (as a ModelListenerAdapter on the graph's event manager). */
  register(listener) { this._g.getEventManager().register(new ModelListenerAdapter(this, listener)); return this; }
  unregister(listener) { this._g.getEventManager().unregister(new ModelListenerAdapter(this, listener)); return this; }
  notifyEvent(e) { this._g.getEventManager().notifyEvent(this._g, e); return this; }
  /** The model's Lock (Jena LockMRSW; single-threaded here, so it only checks nesting). */
  getLock() { if (!this._lock) this._lock = new LockMRSW(); return this._lock; }
  enterCriticalSection(readLockRequested) { this.getLock().enterCriticalSection(readLockRequested); }
  leaveCriticalSection() { this.getLock().leaveCriticalSection(); }
  /** Transactions are the graph's TransactionHandler (a GraphMem has none: UnsupportedOperationException). */
  begin() { this._g.getTransactionHandler().begin(); return this; }
  commit() { this._g.getTransactionHandler().commit(); return this; }
  abort() { this._g.getTransactionHandler().abort(); return this; }
  executeInTxn(action) { this._g.getTransactionHandler().execute(action); return this; }
  calculateInTxn(action) { return this._g.getTransactionHandler().calculate(action); }
  /** Jena query(Selector): a new model of the selected statements. */
  query(selector) {
    const out = createDefaultModel();
    for (const st of this.listStatements(selector).toList()) out.add(st);
    return out;
  }
  /** Reification writes rdf:subject, rdf:predicate, rdf:object and rdf:Statement: vocabulary IRIs. */
  listReifiedStatements() { return unsupported('Model.listReifiedStatements', 'vocabulary'); }
  createReifiedStatement() { return unsupported('Model.createReifiedStatement', 'vocabulary'); }
  isReified() { return unsupported('Model.isReified', 'vocabulary'); }
  getAnyReifiedStatement() { return unsupported('Model.getAnyReifiedStatement', 'vocabulary'); }
  removeAllReifications() { return unsupported('Model.removeAllReifications', 'vocabulary'); }
  removeReification() { return unsupported('Model.removeReification', 'vocabulary'); }
  /** Jena asStatements(Triple[] | List | Iterator) and asModel(Graph), for listener adapters. */
  asStatements(ts) {
    if (ts instanceof ArrayList) return ArrayList.from(ts.map((t) => this.asStatement(t)));
    if (Array.isArray(ts)) return ts.map((t) => this.asStatement(t));
    return this._stmtIterator([...(ts instanceof ExtendedIterator ? ts.toList() : ts)].map((t) => this.asStatement(t)));
  }
  _stmtIterator(sts) { return new StmtIterator(sts, (st) => this.remove(st)); }
  _asModel(g) { return new Model(g); }
  asModel(g) { return new Model(g); }
  toString() { return '<Model ' + this._g.toString() + '>'; }
}

function nodeOrAny(x) {
  if (x === null || x === undefined) return Node.ANY;
  if (x instanceof RDFNode) return x.asNode();
  if (x instanceof Node) return x;
  throw new TypeError('expected an RDFNode or null');
}

function createDefaultModel() { return new Model(new GraphMem()); }

/**
 * Jena SimpleSelector: a statement pattern (null = any) plus a selects()
 * hook that a subclass may override. Matching is by term.
 */
export class SimpleSelector {
  constructor(subject = null, predicate = null, object = null) {
    this.subject = subject; this.predicate = predicate;
    this.object = typeof object === 'string' ? new Literal(NodeFactory.createLiteralString(object), null) : object;
  }
  getSubject() { return this.subject; }
  getPredicate() { return this.predicate; }
  getObject() { return this.object; }
  /** True when selects() is not overridden: the pattern alone decides. */
  isSimple() { return this.selects === SimpleSelector.prototype.selects; }
  selects(_st) { return true; }
  test(st) {
    return (this.subject === null || this.subject.equals(st.getSubject())) &&
      (this.predicate === null || this.predicate.equals(st.getPredicate())) &&
      (this.object === null || this.object.equals(st.getObject())) && this.selects(st);
  }
}

/**
 * Jena LockMRSW: multiple readers or a single writer. JavaScript has one
 * thread, so the lock only counts nesting: a write request while holding only
 * read locks fails (lock promotion), as in Jena.
 */
export class LockMRSW {
  constructor() { this._read = 0; this._write = 0; }
  enterCriticalSection(readLockRequested) {
    if (this._read > 0 && this._write === 0 && !readLockRequested) {
      this._read++;
      throw new JenaException('enterCriticalSection: Write lock request while holding read lock - potential deadlock');
    }
    if (this._write > 0 && readLockRequested) readLockRequested = false;
    if (readLockRequested) this._read++; else this._write++;
  }
  leaveCriticalSection() {
    if (this._read > 0) { this._read--; return; }
    if (this._write > 0) { this._write--; return; }
    throw new JenaException('leaveCriticalSection: No lock held');
  }
}
LockMRSW.READ = true;
LockMRSW.WRITE = false;
/** Jena Lock constants. */
export const Lock = Object.freeze({ READ: true, WRITE: false, MRSW: LockMRSW });

/** Jena ModelMaker (createMemModelMaker): named in-memory models. */
export class ModelMaker {
  constructor() { this._models = new Map(); }
  createModel(name, strict = false) {
    if (this._models.has(name)) {
      if (strict) throw new JenaException('AlreadyExists: ' + name);
      return this._models.get(name);
    }
    const m = createDefaultModel();
    this._models.set(name, m);
    return m;
  }
  createFreshModel() { return createDefaultModel(); }
  createDefaultModel() { return this.createModel('', false); }
  openModel(name, strict = false) {
    if (this._models.has(name)) return this._models.get(name);
    if (strict) throw new JenaException('DoesNotExist: ' + name);
    return this.createModel(name);
  }
  openModelIfPresent(name) { return this._models.get(name) ?? null; }
  getModel(name) { return this._models.get(name) ?? null; }
  hasModel(name) { return this._models.has(name); }
  removeModel(name) {
    if (!this._models.has(name)) throw new JenaException('DoesNotExist: ' + name);
    this._models.delete(name);
  }
  listModels() { return new ExtendedIterator([...this._models.keys()]); }
  close() {}
}

export const ModelFactory = Object.freeze({
  /** A term-equality model (Jena's default model is value-based: GAPS.md 'value-matching'). */
  createDefaultModel,
  createModelForGraph(g) { return new Model(g); },
  /** Jena: a value-matching model. Needs an engine op. */
  createModelSameValue() { return unsupported('ModelFactory.createModelSameValue', 'value-matching'); },
  createMemModelMaker() { return new ModelMaker(); },
  /** A model over the dynamic union of the two models' graphs (Jena graph.compose.Union). */
  createUnion(m1, m2) { return new Model(new Union(m1.getGraph(), m2.getGraph())); },
  /** Inference models: a live (synchronous) closure and Jena's rule language need engine ops. */
  createRDFSModel() { return unsupported('ModelFactory.createRDFSModel', 'inference'); },
  createInfModel() { return unsupported('ModelFactory.createInfModel', 'inference'); },
  createOntologyModel() { return unsupported('ModelFactory.createOntologyModel', 'inference'); },
});

const RF_IMPL = {
  createResource(uri) {
    return new Resource(uri === undefined || uri === null ? NodeFactory.createBlankNode() : NodeFactory.createURI(uri), null);
  },
  createProperty(ns, local) { return new Property(NodeFactory.createURI(local === undefined ? ns : ns + local), null); },
  createPlainLiteral(s) { return new Literal(NodeFactory.createLiteralString(s), null); },
  createLangLiteral(s, lang) { return new Literal(NodeFactory.createLiteralLang(s, lang), null); },
  createStringLiteral(s) { return new Literal(NodeFactory.createLiteralString(s), null); },
  createTypedLiteral(v, dt) {
    if (dt === undefined || dt === null || typeof v !== 'string') return unsupported('ResourceFactory.createTypedLiteral(value)', 'js-value-literal');
    return new Literal(NodeFactory.createLiteralDT(v, dt), null);
  },
  createStatement(s, p, o) { return new Statement(s, toProperty(p), o, null); },
  createStatementTerm(st) { return new StatementTerm(NodeFactory.createTripleTerm(st.asTriple()), null); },
};
const BASE_FACTORY = Object.freeze({ ...RF_IMPL });
let currentFactory = BASE_FACTORY;

/** Jena ResourceFactory: static methods that delegate to the current instance (getInstance / setInstance). */
export const ResourceFactory = Object.freeze({
  ...Object.fromEntries(Object.keys(RF_IMPL).map((k) => [k, (...a) => currentFactory[k](...a)])),
  getInstance() { return currentFactory; },
  setInstance(f) { const old = currentFactory; currentFactory = f; return old; },
});
