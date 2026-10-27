// leana: Model, Statement, RDFNode, Resource, Property, Literal, ModelFactory,
// ResourceFactory.
//
// API modelled on Apache Jena org.apache.jena.rdf.model (Apache License 2.0).
// No Jena code is copied. Every Model is over a leana GraphMem, so matching
// is by TERM. Jena's ModelFactory.createDefaultModel() matches by VALUE
// ("01"^^xsd:integer finds "1"^^xsd:integer); leana does not (GAPS.md,
// 'value-matching').

import { Node, NodeFactory, Triple, BaseDatatype } from './node.mjs';
import { GraphMem, ExtendedIterator, JenaSet } from './graph.mjs';
import { XSD_STRING } from '@factoidal/core/rdfjs';
import {
  JenaException, PropertyNotFoundException, LiteralRequiredException, ResourceRequiredException,
  ClosedException, unsupported,
} from './errors.mjs';

// ---------------------------------------------------------------------------
// RDFNode, Resource, Property, Literal

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
  isResource() { return this._node.isURI() || this._node.isBlank() || this._node.isTripleTerm(); }
  isStmtResource() { return this._node.isTripleTerm(); }
  asResource() { throw new ResourceRequiredException(String(this._node)); }
  asLiteral() { throw new LiteralRequiredException(String(this._node)); }
  inModel(m) { return wrapNode(this._node, m); }
  hashKey() { return this._node.hashKey(); }
  hashCode() { return this.hashKey(); }
  /** Jena: two RDFNodes are equal when their Nodes are equal (the model is not compared). */
  equals(o) { return o instanceof RDFNode && o._node.equals(this._node); }
  as(cls) { return unsupported('RDFNode.as', 'echo'); }
  canAs(cls) { return unsupported('RDFNode.canAs', 'echo'); }
  visitWith(v) { return unsupported('RDFNode.visitWith', 'echo'); }
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
  /** Jena returns an AnonId; leana answers an object with the label. */
  getId() {
    const label = this._node.getBlankNodeLabel();
    return { getLabelString: () => label, toString: () => label, equals: (o) => !!o && o.getLabelString && o.getLabelString() === label };
  }
  getLocalName() { return unsupported('Resource.getLocalName', 'iri-split'); }
  getNameSpace() { return unsupported('Resource.getNameSpace', 'iri-split'); }
  getStmtTerm() { return statementOfTriple(this._node.getTriple(), this._model); }
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
  getProperty(p, lang) {
    if (lang !== undefined) return unsupported('Resource.getProperty(Property, lang)', 'echo');
    return this._m().getProperty(this, p);
  }
  getRequiredProperty(p) { return this._m().getRequiredProperty(this, p); }
  getPropertyResourceValue(p) {
    for (const s of this._m().listStatements(this, p, null).toList()) if (s.getObject().isResource()) return s.getResource();
    return null;
  }
  listProperties(p) { return this._m().listStatements(this, p ?? null, null); }
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

export function wrapNode(node, model) {
  if (node.isLiteral()) return new Literal(node, model);
  if (node.isURI() || node.isBlank() || node.isTripleTerm()) return new Resource(node, model);
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
  getStatementProperty(p) { return unsupported('Statement.getStatementProperty', 'echo'); }
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
  isReified() { return unsupported('Statement.isReified', 'echo'); }
  createReifiedStatement() { return unsupported('Statement.createReifiedStatement', 'echo'); }
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
    if (dt === undefined || dt === null) return unsupported('Model.createTypedLiteral(value)', 'js-value-literal');
    if (typeof v !== 'string') return unsupported('Model.createTypedLiteral(value, datatype)', 'js-value-literal');
    return new Literal(NodeFactory.createLiteralDT(v, dt), this);
  }
  createStatement(s, p, o, lang) {
    return new Statement(s.inModel(this), toProperty(p).inModel(this), this._object(o, lang), this);
  }
  createTripleTerm(s, p, o) {
    if (s instanceof Statement) return new Resource(NodeFactory.createTripleTerm(s.asTriple()), this);
    return new Resource(NodeFactory.createTripleTerm(s.asNode(), p.asNode(), o.asNode()), this);
  }
  createList() { return unsupported('Model.createList', 'collections'); }
  createBag() { return unsupported('Model.createBag', 'collections'); }
  createSeq() { return unsupported('Model.createSeq', 'collections'); }
  createAlt() { return unsupported('Model.createAlt', 'collections'); }
  getBag() { return unsupported('Model.getBag', 'collections'); }
  getSeq() { return unsupported('Model.getSeq', 'collections'); }
  getAlt() { return unsupported('Model.getAlt', 'collections'); }
  getList() { return unsupported('Model.getList', 'collections'); }
  wrapAsResource(n) { return new Resource(n, this); }
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
      if (a instanceof Statement) { this._g.add(a.asTriple()); return this; }
      if (a instanceof Model) { for (const t of a._g.find().toList()) this._g.add(t); return this; }
      if (a instanceof ExtendedIterator) { for (const s of a.toList()) this.add(s); return this; }
      if (a && typeof a[Symbol.iterator] === 'function') { for (const s of a) this.add(s); return this; }
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
      if (a instanceof Model) { for (const t of a._g.find().toList()) this._g.delete(t); return this; }
      if (a instanceof ExtendedIterator) { for (const s of a.toList()) this.remove(s); return this; }
      if (a && typeof a[Symbol.iterator] === 'function') { for (const s of a) this.remove(s); return this; }
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
    if (o === undefined) return this._g.contains(nodeOrAny(s), nodeOrAny(p), Node.ANY);
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
    if (s !== undefined && s !== null && !(s instanceof RDFNode)) return unsupported('Model.listStatements(Selector)', 'echo');
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
  listSubjectsWithProperty(p, o, lang) {
    const sts = this.listStatements(null, p, o ?? null, lang).toList();
    return new ResIterator(distinctBy(sts.map((st) => st.getSubject())));
  }
  /** Jena: listResourcesWithProperty(p[, o]) is listSubjectsWithProperty. */
  listResourcesWithProperty(p, o) { return this.listSubjectsWithProperty(p, o); }
  listObjectsOfProperty(a, b) {
    const sts = b === undefined ? this.listStatements(null, a, null).toList() : this.listStatements(a, b, null).toList();
    return new NodeIterator(distinctBy(sts.map((st) => st.getObject())));
  }
  listNameSpaces() { return unsupported('Model.listNameSpaces', 'iri-split'); }
  getProperty(s, p, lang) {
    if (p === undefined) return this.createProperty(s);
    if (lang !== undefined) return unsupported('Model.getProperty(Resource, Property, lang)', 'echo');
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
  register() { return unsupported('Model.register (listeners)', 'echo'); }
  unregister() { return unsupported('Model.unregister (listeners)', 'echo'); }
  notifyEvent() { return unsupported('Model.notifyEvent', 'echo'); }
  getLock() { return unsupported('Model.getLock', 'echo'); }
  begin() { return unsupported('Model.begin (transactions)', 'echo'); }
  query() { return unsupported('Model.query(Selector)', 'echo'); }
  listReifiedStatements() { return unsupported('Model.listReifiedStatements', 'echo'); }
  createReifiedStatement() { return unsupported('Model.createReifiedStatement', 'echo'); }
  toString() { return '<Model ' + this._g.toString() + '>'; }
}

function nodeOrAny(x) {
  if (x === null || x === undefined) return Node.ANY;
  if (x instanceof RDFNode) return x.asNode();
  if (x instanceof Node) return x;
  throw new TypeError('expected an RDFNode or null');
}

function createDefaultModel() { return new Model(new GraphMem()); }

export const ModelFactory = Object.freeze({
  /** A term-equality model (Jena's default model is value-based: GAPS.md 'value-matching'). */
  createDefaultModel,
  createModelForGraph(g) { return new Model(g); },
  createMemModelMaker() { return unsupported('ModelFactory.createMemModelMaker', 'echo'); },
  createUnion() { return unsupported('ModelFactory.createUnion', 'echo'); },
  createRDFSModel() { return unsupported('ModelFactory.createRDFSModel (stage 3)', 'echo'); },
  createInfModel() { return unsupported('ModelFactory.createInfModel (stage 3)', 'echo'); },
  createOntologyModel() { return unsupported('ModelFactory.createOntologyModel', 'echo'); },
});

export const ResourceFactory = Object.freeze({
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
  createStatementTerm(st) { return new Resource(NodeFactory.createTripleTerm(st.asTriple()), null); },
});
