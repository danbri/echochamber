// TypeScript declarations for @factoidal/leana: an RDF API in the style of
// Apache Jena over @factoidal/core. API names are modelled on Apache Jena
// (Apache License 2.0). Methods marked "gap" throw LeanaUnsupportedError
// (see GAPS.md).

import type { Term, Quad, Dataset } from '@factoidal/core';

// ---------------------------------------------------------------- errors

export class JenaException extends Error {
  /** The @factoidal/core error code, when the engine refused. */
  readonly code?: string;
  readonly position?: unknown;
  readonly spec?: string | null;
}
export class UnsupportedOperationException extends JenaException {}
export type GapKey =
  | 'value-matching' | 'js-value-literal' | 'literal-value' | 'syntax-from-name'
  | 'iri-split' | 'vocabulary' | 'collections' | 'isomorphism-rdf12' | 'echo';
/** A Jena method whose semantics @factoidal/core does not have yet. */
export class LeanaUnsupportedError extends UnsupportedOperationException {
  readonly method: string;
  readonly gap: GapKey;
  /** The danbri/factoidal issue that asks for the engine op (null for an echo gap). */
  readonly issue: string | null;
}
export class NoSuchElementException extends JenaException {}
export class ClosedException extends JenaException {}
export class JenaLockedException extends JenaException {}
export class PropertyNotFoundException extends JenaException {}
export class LiteralRequiredException extends JenaException {}
export class ResourceRequiredException extends JenaException {}
export class AddDeniedException extends JenaException {}
export class DeleteDeniedException extends JenaException {}
export class RiotException extends JenaException {}
export class RiotNotFoundException extends RiotException {}

export const GAPS: Readonly<Record<GapKey, { summary: string; issue: string | null }>>;
/** The @factoidal/core version leana loaded. */
export const coreVersion: string;

// ---------------------------------------------------------------- nodes

export interface NodeVisitor<R = unknown> {
  visitAny(it: Node): R;
  visitBlank(it: Node_Blank, label: string): R;
  visitLiteral(it: Node_Literal, lex: string, lang: string, dtype: BaseDatatype): R;
  visitURI(it: Node_URI, uri: string): R;
  visitVariable(it: Node_Variable, name: string): R;
  visitTriple(it: Node_Triple, triple: Triple): R;
  visitGraph?(it: Node, graph: Graph): R;
}

export abstract class Node {
  static readonly ANY: Node;
  isConcrete(): boolean;
  isURI(): boolean;
  isBlank(): boolean;
  isLiteral(): boolean;
  isVariable(): boolean;
  isTripleTerm(): boolean;
  isNodeTriple(): boolean;
  isExt(): boolean;
  getURI(): string;
  hasURI(uri: string): boolean;
  getBlankNodeLabel(): string;
  getBlankNodeId(): string;
  getName(): string;
  getLiteral(): LiteralLabel;
  getLiteralLexicalForm(): string;
  getLiteralLanguage(): string;
  getLiteralDatatypeURI(): string;
  getLiteralDatatype(): BaseDatatype;
  /** gap 'literal-value'. */
  getLiteralValue(): never;
  /** The node itself for URIs and blank nodes; gap 'value-matching' for a literal. */
  getIndexingValue(): Node;
  getTriple(): Triple;
  /** gap 'iri-split'. */
  getNameSpace(): never;
  /** gap 'iri-split'. */
  getLocalName(): never;
  /** gap 'value-matching'. */
  sameValueAs(other: Node): never;
  sameTermAs(other: Node): boolean;
  matches(other: Node): boolean;
  /** A string two nodes share exactly when equals() holds. */
  hashKey(): string;
  hashCode(): string;
  equals(other: unknown): boolean;
  /** The @factoidal/core RDF/JS term (null for ANY). */
  toRDFJS(): Term | null;
  visitWith<R>(v: NodeVisitor<R>): R;
  /** With a PrefixMapping: gap 'iri-split'. */
  toString(pm?: PrefixMappingImpl): string;
}
export class Node_URI extends Node { constructor(uri: string); }
export class Node_Blank extends Node { constructor(label?: string); }
export class Node_Literal extends Node { constructor(term: Term); }
export class Node_Variable extends Node { constructor(name: string); }
export class Node_Triple extends Node { constructor(triple: Triple); }
/** Not in leana: the constructor throws (gap 'echo'). */
export class Node_Graph extends Node { constructor(graph?: Graph); }

export class LiteralLabel {
  getLexicalForm(): string;
  language(): string;
  getDatatypeURI(): string;
  getDatatype(): BaseDatatype;
  /** gap 'literal-value'. */
  getValue(): never;
  /** gap 'value-matching'. */
  getIndexingValue(): never;
  /** gap 'literal-value'. */
  isWellFormed(): never;
  /** gap 'value-matching'. */
  sameValueAs(other: LiteralLabel): never;
  equals(other: unknown): boolean;
  hashCode(): string;
  toString(quoting?: boolean): string;
}

/** A datatype named by IRI. Its value semantics (isValid, parse, ...) are gaps. */
export class BaseDatatype {
  constructor(uri: string);
  getURI(): string;
  isValid(lex: string): never;
  parse(lex: string): never;
  unparse(v: unknown): never;
  getJavaClass(): never;
  isEqual(a: unknown, b: unknown): never;
  equals(o: unknown): boolean;
}

export const TypeMapper: {
  getInstance(): {
    getSafeTypeByName(uri: string): BaseDatatype;
    getTypeByName(uri: string): BaseDatatype;
    /** gap 'js-value-literal'. */
    getTypeByValue(v: unknown): never;
    /** gap 'js-value-literal'. */
    getTypeByClass(c: unknown): never;
    registerDatatype(dt: unknown): never;
  };
};

export const NodeFactory: {
  createURI(uri: string): Node_URI;
  createBlankNode(label?: string): Node_Blank;
  createVariable(name: string): Node_Variable;
  createLiteralString(lex: string): Node_Literal;
  createLiteral(lex: string, langOrDatatype?: string | BaseDatatype): Node_Literal;
  createLiteralLang(lex: string, lang: string): Node_Literal;
  createLiteralDT(lex: string, datatype: string | BaseDatatype): Node_Literal;
  /** gap 'js-value-literal'. */
  createLiteralByValue(value: unknown, datatype?: BaseDatatype): never;
  createTripleTerm(s: Node | Triple, p?: Node, o?: Node): Node_Triple;
  createTripleNode(s: Node | Triple, p?: Node, o?: Node): Node_Triple;
  getType(uri: string): BaseDatatype;
};

export class Triple {
  static readonly ANY: Triple;
  constructor(s: Node, p: Node, o: Node);
  static create(s: Node, p: Node, o: Node): Triple;
  static createMatch(s: Node | null, p: Node | null, o: Node | null): Triple;
  getSubject(): Node;
  getPredicate(): Node;
  getObject(): Node;
  getMatchSubject(): Node | null;
  getMatchPredicate(): Node | null;
  getMatchObject(): Node | null;
  isConcrete(): boolean;
  sameAs(s: Node, p: Node, o: Node): boolean;
  matches(t: Triple): boolean;
  matches(s: Node, p: Node, o: Node): boolean;
  subjectMatches(n: Node): boolean;
  predicateMatches(n: Node): boolean;
  objectMatches(n: Node): boolean;
  hashKey(): string;
  hashCode(): string;
  equals(other: unknown): boolean;
  /** With a PrefixMapping: gap 'iri-split'. */
  toString(pm?: PrefixMappingImpl): string;
}

/** Build the leana Node of an RDF/JS term. */
export function fromRDFJS(t: Term): Node;

// ---------------------------------------------------------------- collections and iterators

/** A set with Java equals/hashCode semantics (members keyed by hashKey()). */
export class JenaSet<T> implements Iterable<T> {
  constructor(items?: Iterable<T>);
  add(x: T): boolean;
  contains(x: T): boolean;
  has(x: T): boolean;
  remove(x: T): boolean;
  delete(x: T): boolean;
  size(): number;
  isEmpty(): boolean;
  addAll(xs: Iterable<T>): boolean;
  containsAll(xs: Iterable<T>): boolean;
  equals(other: JenaSet<T> | Iterable<T>): boolean;
  toArray(): T[];
  [Symbol.iterator](): Iterator<T>;
}

/** Jena ExtendedIterator over a snapshot. remove() deletes the last item from its graph or model. */
export class ExtendedIterator<T> implements Iterable<T> {
  constructor(items: T[], remover?: (x: T) => void);
  static of<T>(items: T[], remover?: (x: T) => void): ExtendedIterator<T>;
  static empty<T>(): ExtendedIterator<T>;
  hasNext(): boolean;
  next(): T;
  remove(): void;
  removeNext(): T;
  close(): void;
  toList(): T[];
  toSet(): JenaSet<T>;
  forEachRemaining(fn: (x: T) => void): void;
  forEach(fn: (x: T) => void): void;
  nextOptional(): T | null;
  mapWith<U>(fn: (x: T) => U): ExtendedIterator<U>;
  filterKeep(pred: (x: T) => boolean): ExtendedIterator<T>;
  filterDrop(pred: (x: T) => boolean): ExtendedIterator<T>;
  andThen(other: ExtendedIterator<T> | Iterable<T>): ExtendedIterator<T>;
  [Symbol.iterator](): Iterator<T>;
}

// ---------------------------------------------------------------- PrefixMapping

export class PrefixMappingImpl {
  lock(): this;
  /** Does not check prefix legality (gap 'iri-split'). */
  setNsPrefix(prefix: string, uri: string): this;
  removeNsPrefix(prefix: string): this;
  clearNsPrefixMap(): this;
  setNsPrefixes(other: PrefixMappingImpl | Map<string, string> | Record<string, string>): this;
  withDefaultMappings(other: PrefixMappingImpl | Map<string, string> | Record<string, string>): this;
  getNsPrefixURI(prefix: string): string | null;
  getNsURIPrefix(uri: string): string | null;
  getNsPrefixMap(): Map<string, string>;
  expandPrefix(prefixed: string): string;
  shortForm(uri: string): string;
  /** gap 'iri-split'. */
  qnameFor(uri: string): never;
  hasNoMappings(): boolean;
  numPrefixes(): number;
  samePrefixMappingAs(other: PrefixMappingImpl | Model): boolean;
  forEach(fn: (prefix: string, uri: string) => void): void;
}
export type PrefixMapping = PrefixMappingImpl;
export const PrefixMapping: {
  Factory: { create(): PrefixMappingImpl };
  /** gap 'vocabulary'. */
  readonly Standard: never;
  /** gap 'vocabulary'. */
  readonly Extended: never;
};

// ---------------------------------------------------------------- Graph

/** The Graph SPI over the default graph of a @factoidal/core Dataset (term matching). */
export class GraphMem {
  constructor();
  /** The @factoidal/core Dataset that holds the graph. */
  readonly dataset: Dataset;
  add(t: Triple): void;
  add(s: Node, p: Node, o: Node): void;
  performAdd(t: Triple): void;
  delete(t: Triple): void;
  delete(s: Node, p: Node, o: Node): void;
  performDelete(t: Triple): void;
  remove(s: Node | null, p: Node | null, o: Node | null): void;
  clear(): void;
  find(): ExtendedIterator<Triple>;
  find(t: Triple): ExtendedIterator<Triple>;
  find(s: Node | null, p: Node | null, o: Node | null): ExtendedIterator<Triple>;
  stream(s?: Node | null, p?: Node | null, o?: Node | null): Iterator<Triple>;
  contains(t: Triple): boolean;
  contains(s: Node | null, p: Node | null, o: Node | null): boolean;
  size(): number;
  sizeLong(): number;
  isEmpty(): boolean;
  close(): void;
  isClosed(): boolean;
  getPrefixMapping(): PrefixMappingImpl;
  dependsOn(other: Graph): boolean;
  /** Decided by the engine (RDFC-1.0). Blank nodes with triple terms: gap 'isomorphism-rdf12'. */
  isIsomorphicWith(other: Graph): boolean;
  /** gap 'echo'. */
  getCapabilities(): never;
  /** gap 'echo'. */
  getEventManager(): never;
  /** gap 'echo'. */
  getTransactionHandler(): never;
}
export type Graph = GraphMem;

export const GraphMemFactory: {
  createGraphMem(): GraphMem;
  createDefaultGraph(): GraphMem;
  createGraphMem2(): GraphMem;
  createDefaultGraphSameTerm(): GraphMem;
  /** gap 'value-matching'. */
  createDefaultGraphSameValue(): never;
  createGraphMemBasic(): GraphMem;
  empty(): GraphMem;
};
export const GraphFactory: {
  createGraphMem(): GraphMem;
  createDefaultGraph(): GraphMem;
  createPlainGraph(): GraphMem;
};
export const GraphUtil: {
  findAll(g: Graph): ExtendedIterator<Triple>;
  add(g: Graph, triples: Iterable<Triple> | ExtendedIterator<Triple> | Graph): void;
  delete(g: Graph, triples: Iterable<Triple> | ExtendedIterator<Triple> | Graph): void;
  addInto(dst: Graph, src: Graph): void;
  deleteFrom(dst: Graph, src: Graph): void;
  remove(g: Graph, s: Node | null, p: Node | null, o: Node | null): void;
  listSubjects(g: Graph, p?: Node | null, o?: Node | null): ExtendedIterator<Node>;
  listObjects(g: Graph, s?: Node | null, p?: Node | null): ExtendedIterator<Node>;
  listPredicates(g: Graph, s?: Node | null, o?: Node | null): ExtendedIterator<Node>;
  isomorphic(a: Graph, b: Graph): boolean;
};

// ---------------------------------------------------------------- Model API

export class RDFNode {
  constructor(node: Node, model?: Model | null);
  asNode(): Node;
  getModel(): Model | null;
  isAnon(): boolean;
  isLiteral(): boolean;
  isURIResource(): boolean;
  isResource(): boolean;
  isStmtResource(): boolean;
  asResource(): Resource;
  asLiteral(): Literal;
  inModel(m: Model): RDFNode;
  hashKey(): string;
  hashCode(): string;
  /** Term equality of the nodes; the model is not compared. */
  equals(o: unknown): boolean;
}

export class Resource extends RDFNode {
  getURI(): string | null;
  hasURI(uri: string): boolean;
  getId(): { getLabelString(): string };
  /** gap 'iri-split'. */
  getLocalName(): never;
  /** gap 'iri-split'. */
  getNameSpace(): never;
  getStmtTerm(): Statement;
  inModel(m: Model): Resource;
  addProperty(p: Property, o: RDFNode | string, langOrDatatype?: string | BaseDatatype): this;
  /** A Literal argument works; a JavaScript value is gap 'js-value-literal'. */
  addLiteral(p: Property, o: Literal | unknown): this;
  hasProperty(p: Property, o?: RDFNode | string, lang?: string): boolean;
  hasLiteral(p: Property, value: Literal | unknown): boolean;
  getProperty(p: Property): Statement | null;
  getRequiredProperty(p: Property): Statement;
  getPropertyResourceValue(p: Property): Resource | null;
  listProperties(p?: Property | null): StmtIterator;
  removeAll(p?: Property | null): this;
  removeProperties(): this;
}

export class Property extends Resource {
  isProperty(): true;
  inModel(m: Model): Property;
  /** gap 'vocabulary'. */
  getOrdinal(): never;
}

export class Literal extends RDFNode {
  getLexicalForm(): string;
  getLanguage(): string;
  getDatatypeURI(): string;
  getDatatype(): BaseDatatype;
  /** The lexical form. */
  getString(): string;
  inModel(m: Model): Literal;
  /** gap 'literal-value' (getValue, getBoolean, getByte, getShort, getInt, getLong, getChar, getFloat, getDouble, isWellFormedXML). */
  getValue(): never;
  getBoolean(): never;
  getByte(): never;
  getShort(): never;
  getInt(): never;
  getLong(): never;
  getChar(): never;
  getFloat(): never;
  getDouble(): never;
  isWellFormedXML(): never;
  /** gap 'value-matching'. */
  sameValueAs(other: Literal): never;
}

export class Statement {
  constructor(s: Resource, p: Property, o: RDFNode, model?: Model | null);
  getSubject(): Resource;
  getPredicate(): Property;
  getObject(): RDFNode;
  getModel(): Model | null;
  asTriple(): Triple;
  getResource(): Resource;
  getLiteral(): Literal;
  getString(): string;
  getLanguage(): string;
  /** gap 'literal-value'. */
  getBoolean(): never; getByte(): never; getShort(): never; getInt(): never;
  getLong(): never; getChar(): never; getFloat(): never; getDouble(): never;
  /** gap 'collections'. */
  getBag(): never; getAlt(): never; getSeq(): never; getList(): never;
  getProperty(p: Property): Statement | null;
  changeObject(o: RDFNode | string, lang?: string): Statement;
  changeLiteralObject(v: Literal | unknown): Statement;
  remove(): this;
  inModel(m: Model): Statement;
  hashKey(): string;
  hashCode(): string;
  equals(o: unknown): boolean;
}

export class StmtIterator extends ExtendedIterator<Statement> { nextStatement(): Statement; }
export class ResIterator extends ExtendedIterator<Resource> { nextResource(): Resource; }
export class NodeIterator extends ExtendedIterator<RDFNode> { nextNode(): RDFNode; }

/** A Model over a leana GraphMem. Matching is by TERM (Jena's default model matches by value). */
export class Model {
  constructor(graph?: GraphMem);
  getGraph(): GraphMem;
  createResource(): Resource;
  createResource(uri: string): Resource;
  getResource(uri: string): Resource;
  createProperty(uri: string): Property;
  createProperty(ns: string, local: string): Property;
  createLiteral(lex: string, lang?: string): Literal;
  createLiteral(lex: string, wellFormedXml: boolean): Literal;
  /** (lexicalForm, datatype IRI or BaseDatatype); a JavaScript value: gap 'js-value-literal'. */
  createTypedLiteral(lex: string, datatype: string | BaseDatatype): Literal;
  createStatement(s: Resource, p: Property, o: RDFNode | string, langOrDatatype?: string | BaseDatatype): Statement;
  createTripleTerm(st: Statement): Resource;
  createTripleTerm(s: Resource, p: Property, o: RDFNode): Resource;
  wrapAsResource(n: Node): Resource;
  asRDFNode(n: Node): RDFNode;
  getRDFNode(n: Node): RDFNode;
  asStatement(t: Triple): Statement;
  add(st: Statement | Statement[] | Model | StmtIterator | Iterable<Statement>): this;
  add(s: Resource, p: Property, o: RDFNode | string, langOrDatatype?: string | BaseDatatype): this;
  addLiteral(s: Resource, p: Property, o: Literal | unknown): this;
  remove(st: Statement | Statement[] | Model | StmtIterator | Iterable<Statement>): this;
  remove(s: Resource, p: Property, o: RDFNode): this;
  removeAll(s?: Resource | null, p?: Property | null, o?: RDFNode | null): this;
  contains(st: Statement): boolean;
  contains(s: Resource | null, p: Property | null, o?: RDFNode | string | null, lang?: string): boolean;
  containsLiteral(s: Resource | null, p: Property | null, v: Literal | unknown): boolean;
  containsResource(r: RDFNode): boolean;
  containsAll(x: Model | StmtIterator | Iterable<Statement>): boolean;
  containsAny(x: Model | StmtIterator | Iterable<Statement>): boolean;
  size(): number;
  isEmpty(): boolean;
  listStatements(s?: Resource | null, p?: Property | null, o?: RDFNode | string | null, lang?: string): StmtIterator;
  listSubjects(): ResIterator;
  listObjects(): NodeIterator;
  listSubjectsWithProperty(p: Property, o?: RDFNode | string | null): ResIterator;
  listResourcesWithProperty(p: Property, o?: RDFNode | string | null): ResIterator;
  listObjectsOfProperty(p: Property): NodeIterator;
  listObjectsOfProperty(s: Resource, p: Property): NodeIterator;
  /** gap 'iri-split'. */
  listNameSpaces(): never;
  getProperty(uri: string): Property;
  getProperty(s: Resource, p: Property): Statement | null;
  getRequiredProperty(s: Resource, p: Property): Statement;
  union(m: Model): Model;
  intersection(m: Model): Model;
  difference(m: Model): Model;
  isIsomorphicWith(m: Model | Graph): boolean;
  setNsPrefix(prefix: string, uri: string): this;
  removeNsPrefix(prefix: string): this;
  clearNsPrefixMap(): this;
  setNsPrefixes(o: PrefixMappingImpl | Map<string, string> | Record<string, string>): this;
  withDefaultMappings(o: PrefixMappingImpl | Map<string, string> | Record<string, string>): this;
  getNsPrefixURI(prefix: string): string | null;
  getNsURIPrefix(uri: string): string | null;
  getNsPrefixMap(): Map<string, string>;
  expandPrefix(s: string): string;
  shortForm(uri: string): string;
  qnameFor(uri: string): never;
  lock(): this;
  hasNoMappings(): boolean;
  numPrefixes(): number;
  samePrefixMappingAs(o: PrefixMappingImpl | Model): boolean;
  /** Read text into the model (a StringReader, or a file path with a Lang). Answers a Promise. */
  read(input: StringReader | string, base?: string | null, lang?: LangImpl | string): Promise<this>;
  /** Write with RDFDataMgr; default syntax RDF/XML (as Jena). */
  write(out: { write(s: string): unknown }, lang?: LangImpl | string): this;
  close(): void;
  isClosed(): boolean;
  supportsTransactions(): false;
  supportsSetOperations(): true;
  independent(): true;
}

export const ModelFactory: {
  createDefaultModel(): Model;
  createModelForGraph(g: GraphMem): Model;
};
export const ResourceFactory: {
  createResource(uri?: string | null): Resource;
  createProperty(uri: string): Property;
  createProperty(ns: string, local: string): Property;
  createPlainLiteral(s: string): Literal;
  createLangLiteral(s: string, lang: string): Literal;
  createStringLiteral(s: string): Literal;
  createTypedLiteral(lex: string, datatype: string | BaseDatatype): Literal;
  createStatement(s: Resource, p: Property, o: RDFNode): Statement;
  createStatementTerm(st: Statement): Resource;
};

// ---------------------------------------------------------------- RIOT on strings

export class LangImpl {
  /** The @factoidal/core format names this Lang reads and writes. */
  readonly read: string;
  readonly write: string;
  getName(): string;
  getLabel(): string;
  getAltNames(): string[];
  /** gap 'syntax-from-name'. */
  getContentType(): never;
  /** gap 'syntax-from-name'. */
  getHeaderString(): never;
  /** gap 'syntax-from-name'. */
  getFileExtensions(): never;
}
export type Lang = LangImpl;
export const Lang: {
  readonly TURTLE: LangImpl; readonly TTL: LangImpl;
  readonly NTRIPLES: LangImpl; readonly NT: LangImpl;
  readonly NQUADS: LangImpl; readonly NQ: LangImpl;
  readonly TRIG: LangImpl; readonly RDFXML: LangImpl; readonly JSONLD: LangImpl;
};
export const RDFLanguages: {
  nameToLang(name: string): LangImpl | null;
  /** gap 'syntax-from-name'. */
  filenameToLang(fn: string): never;
  pathnameToLang(fn: string): never;
  contentTypeToLang(ct: string): never;
  fileExtToLang(ext: string): never;
  getRegisteredLanguages(): LangImpl[];
  isTriples(l: LangImpl): boolean;
  isQuads(l: LangImpl): boolean;
};
export class RDFFormat {
  static readonly TURTLE: RDFFormat; static readonly TTL: RDFFormat;
  static readonly NTRIPLES: RDFFormat; static readonly NT: RDFFormat;
  static readonly NQUADS: RDFFormat; static readonly TRIG: RDFFormat;
  static readonly RDFXML: RDFFormat; static readonly JSONLD: RDFFormat;
  getLang(): LangImpl;
}
export class StringReader { constructor(text: string); readonly text: string; }
export class StringWriter { write(s: string): void; toString(): string; }

export class RDFParserBuilder {
  fromString(s: string): this;
  /** A file path (file: IRIs accepted); needs a Lang (syntax from the name is gap 'syntax-from-name'). */
  source(path: string): this;
  lang(l: LangImpl | string): this;
  forceLang(l: LangImpl | string): this;
  base(iri: string): this;
  build(): this;
  /** Parse into a Graph or Model (the default graph). Answers a Promise. */
  parse(target: Graph | Model): Promise<void>;
  toGraph(): Promise<GraphMem>;
  toModel(): Promise<Model>;
}
export const RDFParser: {
  create(): RDFParserBuilder;
  fromString(s: string, lang?: LangImpl | string): RDFParserBuilder;
  source(path: string): RDFParserBuilder;
};
export class RDFWriterBuilder {
  source(g: Graph | Model): this;
  lang(l: LangImpl | string): this;
  format(f: RDFFormat | LangImpl | string): this;
  build(): this;
  asString(): string;
  output(out: { write(s: string): unknown }): void;
}
export const RDFWriter: {
  create(): RDFWriterBuilder;
  source(g: Graph | Model): RDFWriterBuilder;
};
export const RDFDataMgr: {
  read(target: Graph | Model, input: StringReader | string, lang?: LangImpl | RDFFormat): Promise<void>;
  read(target: Graph | Model, input: StringReader | string, base: string | null, lang: LangImpl | RDFFormat): Promise<void>;
  loadModel(path: string, lang: LangImpl): Promise<Model>;
  loadGraph(path: string, lang: LangImpl): Promise<GraphMem>;
  write(out: { write(s: string): unknown }, src: Graph | Model, lang: LangImpl | RDFFormat | string): void;
  /** gap 'syntax-from-name'. */
  determineLang(...args: unknown[]): never;
};

// ---------------------------------------------------------------- added for the ported tests (API shape)

export class InvalidPropertyURIException extends JenaException {}
/** Never thrown: leana does not check prefix legality (gap 'iri-split'). */
export class IllegalPrefixException extends JenaException {}

/** Jena RDF 1.2 base direction. */
export class TextDirection {
  static readonly LTR: TextDirection;
  static readonly RTL: TextDirection;
  static of(d: string): TextDirection | null;
  direction(): string;
  equals(o: unknown): boolean;
}
/** The one BaseDatatype object of an IRI (Jena's datatypes are singletons). */
export function datatypeFor(uri: string): BaseDatatype;
export const LiteralLabelFactory: {
  createString(lex: string): LiteralLabel;
  createLang(lex: string, lang: string): LiteralLabel;
  createDirLang(lex: string, lang: string, dir: TextDirection | string | null): LiteralLabel;
  create(lex: string, datatype: string | BaseDatatype): LiteralLabel;
  /** gap 'js-value-literal'. */
  createByValue(value: unknown, datatype?: BaseDatatype): never;
  createTypedLiteral(value: unknown): never;
};
/** Jena global flags. Getters answer leana's behaviour; asking for the other is gap 'literal-value'. */
export const JenaParameters: { enableEagerLiteralValidation: boolean; enableSilentAcceptanceOfUnknownDatatypes: boolean };
/** gap 'js-value-literal' (constructor). */
export class XSDDateTime { constructor(...args: unknown[]); }
/** Term-component tests (no semantics). */
export const Util: {
  isSimpleString(n: Node): boolean;
  isLangString(n: Node): boolean;
  isDirLangString(n: Node): boolean;
  hasLang(n: Node): boolean;
  hasDirection(n: Node): boolean;
};

/** Forwards every Graph method to a base graph (subclass it to intercept calls). */
export class WrappedGraph extends GraphMem { constructor(base: Graph); getWrapped(): Graph; }
/** An abstract graph built on graphBaseFind/performAdd/performDelete. */
export abstract class GraphBase extends GraphMem {}
export const GraphPlain: { plain(g: Graph): Graph };
export const WrappedIterator: { create<T>(it: Iterable<T> | Iterator<T>): ExtendedIterator<T> };
/** gap 'vocabulary'. */
export const ReifierStd: Record<string, (...args: unknown[]) => never>;

/** Jena AnonId: a blank node label. */
export class AnonId {
  constructor(label?: string);
  static create(label?: string): AnonId;
  getLabelString(): string;
  equals(o: unknown): boolean;
}
/** An RDF 1.2 triple term as an RDFNode (Jena 6 StatementTerm). */
export class StatementTerm extends RDFNode { getStatement(): Statement; }

// RIOT API shape; the methods named throw gap 'echo'.
export const ErrorHandlerFactory: {
  readonly errorHandlerStd: object; readonly errorHandlerStrict: object;
  readonly errorHandlerWarn: object; readonly errorHandlerNoLogging: object;
  getDefaultErrorHandler(): never; setDefaultErrorHandler(h: unknown): never;
};
export class StreamManager { constructor(); }
export class LocatorFile { constructor(...args: unknown[]); }
export class FactoryRDFStd { constructor(); }
export const LabelToNode: { createUseLabelAsGiven(): never; createScopeByDocumentHash(): never };
export const PrefixMapFactory: { create(entries?: PrefixMappingImpl | Map<string, string> | Record<string, string>): PrefixMappingImpl };
export class RDFReaderFactoryRIOT { getReader(lang?: string): never; }

// Stage 2 placeholders: every entry point throws gap 'echo'.
export const QueryExecution: { model(...a: unknown[]): never; dataset(...a: unknown[]): never; create(...a: unknown[]): never; service(...a: unknown[]): never };
export const QueryExecutionFactory: { create(...a: unknown[]): never };
export const QueryFactory: { create(...a: unknown[]): never };
export class QuerySolutionMap { constructor(); }
export const DatasetFactory: { create(...a: unknown[]): never; createTxnMem(): never };
export const DatasetGraphFactory: { create(...a: unknown[]): never; createTxnMem(): never };
